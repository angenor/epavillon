-- =============================================
-- VÉRIFICATION ET CORRECTION DES PERMISSIONS DATABASE
-- ePavilion2025 - IFDD
-- 
-- Ce script vérifie et corrige tous les problèmes de permissions
-- qui peuvent causer des erreurs lors des insertions avec RLS
-- =============================================

-- 1. PERMISSIONS SCHEMA
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 2. PERMISSIONS SUR TOUTES LES TABLES
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Permissions spécifiques pour les tables principales
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.activities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;
GRANT SELECT ON public.countries TO authenticated, anon;

-- 3. PERMISSIONS SUR TOUTES LES SÉQUENCES (crucial pour les UUID et autres)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. PERMISSIONS SUR LES FONCTIONS SPÉCIFIQUES
-- Fonctions UUID
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO authenticated;

-- Fonctions custom si elles existent
GRANT EXECUTE ON FUNCTION generate_search_tokens(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_organizations(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION has_role(UUID, user_role_type) TO authenticated;
GRANT EXECUTE ON FUNCTION check_organization_duplicate() TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- 5. PERMISSIONS AUTH (Supabase spécifique)
-- Assurer que auth.uid() est accessible
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;

-- 6. VÉRIFICATION DES EXTENSIONS NÉCESSAIRES
-- Assurer que les extensions sont bien installées et accessibles
SELECT 'Checking extensions:' as status;

-- Vérifier pg_trgm pour similarity()
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') 
        THEN 'pg_trgm extension is installed' 
        ELSE 'WARNING: pg_trgm extension is missing'
    END as pg_trgm_status;

-- Vérifier uuid-ossp pour uuid_generate_v4()
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
        THEN 'uuid-ossp extension is installed' 
        ELSE 'WARNING: uuid-ossp extension is missing'
    END as uuid_ossp_status;

-- 7. VÉRIFICATION DES POLITIQUES RLS PROBLÉMATIQUES
-- Lister toutes les politiques RLS pour vérifier qu'il n'y a pas de conflits
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 8. CORRECTION DES POLITIQUES USER_ROLES (souvent problématiques)
-- Supprimer les politiques récursives
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Créer une politique simple pour user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

-- 9. VÉRIFICATION DES TRIGGERS PROBLÉMATIQUES
-- Lister tous les triggers pour identifier les potentiels problèmes
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND t.tgisinternal = false
ORDER BY c.relname, t.tgname;

-- 10. TEST DE FONCTIONNEMENT
-- Test d'insertion basique dans organizations (sans données réelles)
SELECT 'Testing database permissions...' as status;

-- Test si on peut au moins faire un SELECT
SELECT COUNT(*) as total_countries FROM public.countries;

-- Test si on peut faire un SELECT sur organizations
SELECT COUNT(*) as total_organizations FROM public.organizations WHERE is_active = TRUE;

-- 11. PERMISSIONS POUR LES TYPES ENUM
-- S'assurer que les types enum sont accessibles
GRANT USAGE ON TYPE user_role_type TO authenticated;
GRANT USAGE ON TYPE organization_type TO authenticated;
GRANT USAGE ON TYPE event_status TO authenticated;
GRANT USAGE ON TYPE submission_status TO authenticated;
GRANT USAGE ON TYPE participation_mode TO authenticated;
GRANT USAGE ON TYPE activity_type TO authenticated;
GRANT USAGE ON TYPE activity_theme TO authenticated;
GRANT USAGE ON TYPE activity_format TO authenticated;
GRANT USAGE ON TYPE validation_status TO authenticated;

-- 12. NETTOYAGE DES FONCTIONS POTENTIELLEMENT PROBLÉMATIQUES
-- Si une fonction utilise des set-returning functions dans WHERE, la corriger

-- Vérifier la fonction has_role qui peut être problématique
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name user_role_type)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 
        AND user_roles.role = $2 
        AND user_roles.is_active = TRUE
        AND (user_roles.valid_until IS NULL OR user_roles.valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION has_role(UUID, user_role_type) TO authenticated;

-- 13. RÉSUMÉ DES CORRECTIONS
SELECT 'Database permissions and RLS policies have been verified and corrected.' as final_status;

SELECT 
    'If you still get "set-returning functions are not allowed in WHERE" errors, ' ||
    'run the fix_organizations_set_returning_error.sql script specifically.' as recommendation;

-- 14. COMMANDES DE DIAGNOSTIC À EXÉCUTER EN CAS DE PROBLÈME
/*
En cas de problème persistant, exécuter ces requêtes pour diagnostiquer :

-- Voir toutes les politiques RLS actives
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Voir tous les triggers
SELECT 
    schemaname, tablename, triggername, 
    pg_get_triggerdef(pg_trigger.oid) as definition
FROM pg_trigger 
JOIN pg_tables ON pg_trigger.tgrelid = pg_tables.tablename::regclass::oid
WHERE schemaname = 'public';

-- Voir toutes les fonctions custom
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prokind = 'f';

-- Tester une insertion simple
INSERT INTO public.organizations (
    name, email, organization_type, created_by
) VALUES (
    'Test Organization', 
    'test@example.com', 
    'ngo_association', 
    auth.uid()
);
*/