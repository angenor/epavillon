-- =============================================
-- SCRIPT DE PRÉVENTION ET RÉSOLUTION DES RÉCURSIONS RLS
-- ePavilion2025 - IFDD
-- =============================================

-- =============================================
-- 1. FONCTION DE DÉTECTION DES RÉCURSIONS POTENTIELLES
-- =============================================

CREATE OR REPLACE FUNCTION detect_potential_rls_recursions()
RETURNS TABLE (
    table_name TEXT,
    policy_name TEXT,
    policy_definition TEXT,
    risk_level TEXT,
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pol.tablename::TEXT,
        pol.policyname::TEXT,
        pol.qual::TEXT as policy_definition,
        CASE 
            WHEN pol.tablename = 'user_roles' AND pol.qual LIKE '%user_roles%' THEN 'HIGH'
            WHEN pol.qual LIKE '%user_roles%' AND pol.tablename != 'user_roles' THEN 'MEDIUM'
            WHEN pol.qual SIMILAR TO '%EXISTS\s*\([^)]*' || pol.tablename || '%' THEN 'HIGH'
            ELSE 'LOW'
        END::TEXT as risk_level,
        CASE 
            WHEN pol.tablename = 'user_roles' AND pol.qual LIKE '%user_roles%' THEN 'Policy on user_roles references itself'
            WHEN pol.qual LIKE '%user_roles%' AND pol.tablename != 'user_roles' THEN 'Policy references user_roles table'
            WHEN pol.qual SIMILAR TO '%EXISTS\s*\([^)]*' || pol.tablename || '%' THEN 'Self-referencing policy detected'
            ELSE 'No obvious recursion risk'
        END::TEXT as reason
    FROM pg_policies pol
    WHERE pol.schemaname = 'public'
    ORDER BY 
        CASE 
            WHEN pol.tablename = 'user_roles' AND pol.qual LIKE '%user_roles%' THEN 1
            WHEN pol.qual LIKE '%user_roles%' AND pol.tablename != 'user_roles' THEN 2
            ELSE 3
        END;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. FONCTION DE VALIDATION DES POLITIQUES RLS
-- =============================================

CREATE OR REPLACE FUNCTION validate_rls_policy_safety(
    target_table TEXT,
    policy_definition TEXT
)
RETURNS TABLE (
    is_safe BOOLEAN,
    issues TEXT[],
    recommendations TEXT[]
) AS $$
DECLARE
    issues_array TEXT[] := '{}';
    recommendations_array TEXT[] := '{}';
    is_policy_safe BOOLEAN := TRUE;
BEGIN
    -- Vérifier auto-référence directe
    IF target_table = 'user_roles' AND policy_definition ILIKE '%user_roles%' THEN
        issues_array := array_append(issues_array, 'Self-reference in user_roles policy');
        recommendations_array := array_append(recommendations_array, 'Use simple auth.uid() comparison instead');
        is_policy_safe := FALSE;
    END IF;
    
    -- Vérifier références circulaires potentielles
    IF policy_definition ILIKE '%EXISTS%' AND policy_definition ILIKE '%' || target_table || '%' THEN
        issues_array := array_append(issues_array, 'Potential circular reference detected');
        recommendations_array := array_append(recommendations_array, 'Review EXISTS clause for circular dependencies');
        is_policy_safe := FALSE;
    END IF;
    
    -- Vérifier complexité excessive
    IF (SELECT array_length(string_to_array(policy_definition, 'EXISTS'), 1)) > 3 THEN
        issues_array := array_append(issues_array, 'High complexity policy with multiple EXISTS clauses');
        recommendations_array := array_append(recommendations_array, 'Consider simplifying or splitting the policy');
    END IF;
    
    RETURN QUERY SELECT is_policy_safe, issues_array, recommendations_array;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. SOLUTIONS SÉCURISÉES POUR LES POLITIQUES COMMUNES
-- =============================================

-- Fonction pour créer des politiques RLS sécurisées
CREATE OR REPLACE FUNCTION create_safe_rls_policies()
RETURNS TEXT AS $$
DECLARE
    result_message TEXT := '';
BEGIN
    -- Politique sécurisée pour user_roles (remplace celle potentiellement récursive)
    BEGIN
        DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
        DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
        
        CREATE POLICY "Users can view their own roles" ON public.user_roles
        FOR SELECT USING (user_id = auth.uid());
        
        result_message := result_message || 'user_roles policies updated safely. ';
    EXCEPTION WHEN OTHERS THEN
        result_message := result_message || 'Error updating user_roles policies: ' || SQLERRM || ' ';
    END;
    
    -- Politique sécurisée pour l'administration des utilisateurs
    -- Utilise une approche sans récursion
    BEGIN
        DROP POLICY IF EXISTS "Admins can do everything" ON public.users;
        
        -- Cette politique évite la récursion en utilisant directement les métadonnées de l'utilisateur
        CREATE POLICY "Admins can manage users" ON public.users
        FOR ALL USING (
            -- Vérifie directement si l'utilisateur actuel a des rôles admin
            auth.uid() IN (
                SELECT ur.user_id 
                FROM public.user_roles ur 
                WHERE ur.role IN ('admin', 'super_admin') 
                AND ur.is_active = TRUE
                AND ur.user_id = auth.uid()
            )
            OR auth.uid() = id -- Les utilisateurs peuvent gérer leur propre profil
        );
        
        result_message := result_message || 'users admin policy updated safely. ';
    EXCEPTION WHEN OTHERS THEN
        result_message := result_message || 'Error updating users admin policy: ' || SQLERRM || ' ';
    END;
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. FONCTION DE TEST DES POLITIQUES RLS
-- =============================================

CREATE OR REPLACE FUNCTION test_rls_policies(test_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    table_name TEXT,
    operation TEXT,
    test_result TEXT,
    error_message TEXT
) AS $$
DECLARE
    test_uid UUID;
    rec RECORD;
BEGIN
    -- Utiliser l'utilisateur de test ou l'utilisateur actuel
    test_uid := COALESCE(test_user_id, auth.uid());
    
    -- Tester l'accès aux tables critiques
    FOR rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'user_roles', 'events', 'activities', 'organizations')
    LOOP
        -- Test SELECT
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE false', rec.tablename);
            RETURN QUERY SELECT rec.tablename::TEXT, 'SELECT'::TEXT, 'OK'::TEXT, NULL::TEXT;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT rec.tablename::TEXT, 'SELECT'::TEXT, 'ERROR'::TEXT, SQLERRM::TEXT;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. SCRIPT DE RÉPARATION D'URGENCE
-- =============================================

CREATE OR REPLACE FUNCTION emergency_rls_fix()
RETURNS TEXT AS $$
DECLARE
    result_message TEXT := 'Emergency RLS Fix Results: ';
BEGIN
    -- Désactiver temporairement RLS sur user_roles si récursion détectée
    BEGIN
        -- Vérifier s'il y a des politiques problématiques
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'user_roles' 
            AND schemaname = 'public' 
            AND qual LIKE '%user_roles%'
        ) THEN
            -- Supprimer toutes les politiques sur user_roles
            DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
            DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
            
            -- Créer une politique simple et sûre
            CREATE POLICY "Safe user roles access" ON public.user_roles
            FOR SELECT USING (user_id = auth.uid());
            
            result_message := result_message || 'user_roles policies fixed. ';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        result_message := result_message || 'Error fixing user_roles: ' || SQLERRM || ' ';
    END;
    
    -- Vérifier et corriger d'autres politiques problématiques
    BEGIN
        -- Recréer les politiques essentielles de manière sécurisée
        PERFORM create_safe_rls_policies();
        result_message := result_message || 'Safe policies recreated. ';
    EXCEPTION WHEN OTHERS THEN
        result_message := result_message || 'Error recreating policies: ' || SQLERRM || ' ';
    END;
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. BONNES PRATIQUES - POLITIQUES RECOMMANDÉES
-- =============================================

-- Créer une vue pour les rôles utilisateurs (évite les problèmes de récursion)
CREATE OR REPLACE VIEW public.v_user_roles_safe AS
SELECT 
    ur.user_id,
    ur.role,
    ur.is_active,
    ur.valid_until,
    CASE 
        WHEN ur.valid_until IS NULL OR ur.valid_until > NOW() THEN TRUE
        ELSE FALSE
    END as is_currently_valid
FROM public.user_roles ur
WHERE ur.user_id = auth.uid() -- Filtre automatique par utilisateur connecté
AND ur.is_active = TRUE;

-- Fonction helper pour vérifier les rôles (évite les récursions)
CREATE OR REPLACE FUNCTION public.user_has_role(role_name user_role_type)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = role_name 
        AND is_active = TRUE
        AND (valid_until IS NULL OR valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. COMMANDES D'UTILISATION
-- =============================================

/*
-- UTILISATION DU TOOLKIT :

-- 1. Détecter les récursions potentielles
SELECT * FROM detect_potential_rls_recursions();

-- 2. Valider une politique avant de l'appliquer
SELECT * FROM validate_rls_policy_safety('user_roles', 'user_id = auth.uid()');

-- 3. Créer des politiques sécurisées
SELECT create_safe_rls_policies();

-- 4. Tester les politiques RLS
SELECT * FROM test_rls_policies();

-- 5. Réparation d'urgence en cas de récursion
SELECT emergency_rls_fix();

-- 6. Vérifier les rôles de l'utilisateur connecté (fonction sécurisée)
SELECT public.user_has_role('admin');
SELECT * FROM public.v_user_roles_safe;
*/

-- =============================================
-- 8. MONITORING ET ALERTES
-- =============================================

-- Créer une table pour logger les problèmes RLS
CREATE TABLE IF NOT EXISTS public.rls_monitoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    policy_name TEXT,
    issue_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.users(id)
);

-- Fonction pour enregistrer un problème RLS
CREATE OR REPLACE FUNCTION log_rls_issue(
    p_table_name TEXT,
    p_policy_name TEXT,
    p_issue_type TEXT,
    p_severity TEXT,
    p_description TEXT
)
RETURNS UUID AS $$
DECLARE
    issue_id UUID;
BEGIN
    INSERT INTO public.rls_monitoring (
        table_name, policy_name, issue_type, severity, description
    ) VALUES (
        p_table_name, p_policy_name, p_issue_type, p_severity, p_description
    ) RETURNING id INTO issue_id;
    
    RETURN issue_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTAIRES DE DOCUMENTATION
-- =============================================

COMMENT ON FUNCTION detect_potential_rls_recursions() IS 'Détecte les politiques RLS potentiellement récursives qui pourraient causer des erreurs infinies';
COMMENT ON FUNCTION validate_rls_policy_safety IS 'Valide une politique RLS avant son application pour éviter les récursions';
COMMENT ON FUNCTION create_safe_rls_policies IS 'Crée des versions sécurisées des politiques RLS communes';
COMMENT ON FUNCTION emergency_rls_fix IS 'Réparation d''urgence pour résoudre les récursions RLS en cours';
COMMENT ON FUNCTION user_has_role IS 'Fonction helper sécurisée pour vérifier les rôles utilisateur sans récursion';
COMMENT ON VIEW v_user_roles_safe IS 'Vue sécurisée des rôles utilisateur qui évite les problèmes de récursion RLS';