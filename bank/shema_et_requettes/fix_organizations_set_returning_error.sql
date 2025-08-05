-- =============================================
-- FIX ORGANIZATIONS "set-returning functions are not allowed in WHERE" ERROR
-- ePavilion2025 - IFDD
-- 
-- Cette erreur est causée par plusieurs problèmes :
-- 1. Les colonnes GENERATED ALWAYS AS qui utilisent des fonctions dans les politiques RLS
-- 2. La fonction generate_search_tokens qui utilise unnest() dans une requête
-- 3. Le trigger check_organization_duplicate qui fait des requêtes pendant RLS
-- 4. Les politiques RLS qui font référence à des colonnes générées
-- =============================================

-- 1. FIRST: Supprimer le trigger problématique temporairement
DROP TRIGGER IF EXISTS check_org_duplicate_trigger ON public.organizations;

-- 2. SECOND: Corriger la fonction generate_search_tokens pour éviter unnest() dans WHERE
CREATE OR REPLACE FUNCTION generate_search_tokens(input_text TEXT)
RETURNS TEXT[] AS $$
DECLARE
    tokens TEXT[];
    cleaned_text TEXT;
    token_record RECORD;
BEGIN
    -- Nettoyer le texte
    cleaned_text := LOWER(TRIM(input_text));
    
    -- Remplacer les caractères spéciaux par des espaces
    cleaned_text := REGEXP_REPLACE(cleaned_text, '[^a-z0-9à-ÿ]+', ' ', 'g');
    
    -- Diviser en mots
    tokens := STRING_TO_ARRAY(cleaned_text, ' ');
    
    -- Supprimer les mots vides et les doublons - VERSION CORRIGÉE
    tokens := ARRAY(
        SELECT DISTINCT word 
        FROM (SELECT unnest(tokens) as word) AS words
        WHERE LENGTH(word) > 2
    );
    
    RETURN tokens;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. THIRD: Corriger la fonction check_organization_duplicate pour éviter les conflits RLS
CREATE OR REPLACE FUNCTION check_organization_duplicate()
RETURNS TRIGGER AS $$
DECLARE
    similar_org RECORD;
    similarity_threshold FLOAT := 0.6;
BEGIN
    -- Générer les tokens de recherche (safe)
    NEW.name_search_tokens := generate_search_tokens(NEW.name);
    
    -- Pour éviter les problèmes RLS, on utilise SECURITY DEFINER et on simplifie
    -- Recherche exacte d'abord (nom normalisé) - VERSION SÉCURISÉE
    PERFORM 1 FROM public.organizations o
    WHERE o.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND o.name_normalized = NEW.name_normalized
    AND o.is_active = TRUE
    AND o.is_duplicate = FALSE
    LIMIT 1;
    
    -- Si trouvé, marquer comme doublon potentiel seulement si pas vérifié
    IF FOUND AND NEW.is_verified = FALSE THEN
        NEW.is_duplicate = TRUE;
        -- On ne peut pas déterminer duplicate_of de manière sûre avec RLS, 
        -- donc on le laisse NULL et l'admin décidera
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FOURTH: Recréer le trigger avec la fonction corrigée
CREATE TRIGGER check_org_duplicate_trigger
BEFORE INSERT OR UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION check_organization_duplicate();

-- 5. FIFTH: Supprimer toutes les politiques RLS existantes pour organizations
DROP POLICY IF EXISTS "public_view_organizations" ON public.organizations;
DROP POLICY IF EXISTS "authenticated_create_organizations" ON public.organizations;
DROP POLICY IF EXISTS "creator_update_organizations" ON public.organizations;
DROP POLICY IF EXISTS "Everyone can view active organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can update their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organizations are viewable by all authenticated users" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

-- 6. SIXTH: Créer des politiques RLS simplifiées qui évitent les fonctions set-returning
CREATE POLICY "organizations_select_policy" ON public.organizations
    FOR SELECT 
    USING (is_active = TRUE);

CREATE POLICY "organizations_insert_policy" ON public.organizations
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()
    );

CREATE POLICY "organizations_update_policy" ON public.organizations
    FOR UPDATE 
    USING (
        created_by = auth.uid()
    )
    WITH CHECK (
        created_by = auth.uid()
    );

-- 7. SEVENTH: Assurer que RLS est activé
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 8. EIGHTH: Corriger la fonction search_organizations pour éviter les conflits
CREATE OR REPLACE FUNCTION search_organizations(search_query TEXT)
RETURNS TABLE (
    organization_id UUID,
    name TEXT,
    matched_name TEXT,
    match_type TEXT,
    similarity_score FLOAT,
    is_verified BOOLEAN,
    is_duplicate BOOLEAN
) AS $$
BEGIN
    -- Normaliser la requête
    search_query := LOWER(TRIM(search_query));
    
    RETURN QUERY
    SELECT * FROM (
        -- Correspondance exacte sur le nom principal
        SELECT DISTINCT
            o.id as organization_id,
            o.name,
            o.name as matched_name,
            'exact_name'::TEXT as match_type,
            1.0::FLOAT as similarity_score,
            o.is_verified,
            o.is_duplicate
        FROM public.organizations o
        WHERE o.name_normalized = search_query
            AND o.is_active = TRUE
        
        UNION
        
        -- Correspondance exacte sur les alias
        SELECT DISTINCT
            o.id as organization_id,
            o.name,
            oa.alias_name as matched_name,
            'exact_alias'::TEXT as match_type,
            1.0::FLOAT as similarity_score,
            o.is_verified,
            o.is_duplicate
        FROM public.organizations o
        JOIN public.organization_aliases oa ON o.id = oa.organization_id
        WHERE oa.alias_normalized = search_query
            AND o.is_active = TRUE
        
        UNION
        
        -- Recherche floue sur le nom principal
        SELECT DISTINCT
            o.id as organization_id,
            o.name,
            o.name as matched_name,
            'fuzzy_name'::TEXT as match_type,
            similarity(o.name, search_query) as similarity_score,
            o.is_verified,
            o.is_duplicate
        FROM public.organizations o
        WHERE similarity(o.name, search_query) > 0.3
            AND o.is_active = TRUE
        
        UNION
        
        -- Recherche floue sur les alias
        SELECT DISTINCT
            o.id as organization_id,
            o.name,
            oa.alias_name as matched_name,
            'fuzzy_alias'::TEXT as match_type,
            similarity(oa.alias_name, search_query) as similarity_score,
            o.is_verified,
            o.is_duplicate
        FROM public.organizations o
        JOIN public.organization_aliases oa ON o.id = oa.organization_id
        WHERE similarity(oa.alias_name, search_query) > 0.3
            AND o.is_active = TRUE
    ) results
    ORDER BY 
        CASE 
            WHEN results.match_type IN ('exact_name', 'exact_alias') THEN 0
            ELSE 1
        END,
        results.similarity_score DESC,
        results.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. NINTH: Assurer les permissions nécessaires
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.organizations TO authenticated;
GRANT INSERT ON public.organizations TO authenticated;
GRANT UPDATE ON public.organizations TO authenticated;

-- Grant permissions for sequences (important pour les UUID)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions sur les fonctions
GRANT EXECUTE ON FUNCTION generate_search_tokens(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_organizations(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_organization_duplicate() TO authenticated;

-- 10. TENTH: Test de vérification
SELECT 'Organizations RLS and trigger fixes applied successfully' as status;

-- Test des politiques (devrait fonctionner maintenant)
SELECT COUNT(*) as test_count FROM public.organizations WHERE is_active = TRUE;

-- Test de la fonction de recherche (devrait fonctionner maintenant)
SELECT COUNT(*) as search_test_count FROM search_organizations('test');

-- 11. ELEVENTH: Commentaires pour la maintenance future
COMMENT ON FUNCTION generate_search_tokens(TEXT) IS 'Génère des tokens de recherche pour les organisations - VERSION CORRIGÉE sans unnest() dans WHERE';
COMMENT ON FUNCTION check_organization_duplicate() IS 'Détecte les doublons d''organisations - VERSION SÉCURISÉE avec SECURITY DEFINER';
COMMENT ON FUNCTION search_organizations(TEXT) IS 'Recherche d''organisations avec gestion des alias - VERSION CORRIGÉE pour RLS';

-- Explication des corrections apportées :
/*
CAUSES IDENTIFIÉES DE L'ERREUR "set-returning functions are not allowed in WHERE" :

1. **Fonction generate_search_tokens** : 
   - PROBLÈME : Utilisait `unnest(tokens)` directement dans une clause WHERE
   - SOLUTION : Restructuré pour utiliser une sous-requête avec FROM

2. **Trigger check_organization_duplicate** :
   - PROBLÈME : Faisait des requêtes sur la même table pendant l'insertion avec RLS activé
   - SOLUTION : Ajouté SECURITY DEFINER et simplifié la logique

3. **Politiques RLS conflictuelles** :
   - PROBLÈME : Plusieurs politiques avec des noms différents mais des conditions similaires
   - SOLUTION : Supprimé toutes les anciennes et créé des politiques simples et claires

4. **Permissions manquantes** :
   - PROBLÈME : Manque de permissions sur les séquences et fonctions
   - SOLUTION : Ajouté tous les GRANT nécessaires

5. **Colonnes GENERATED ALWAYS AS** :
   - PROBLÈME : Les colonnes générées pouvaient causer des conflits avec RLS
   - SOLUTION : Les politiques évitent maintenant de faire référence aux colonnes générées

Cette correction devrait résoudre complètement l'erreur lors de l'insertion dans la table organizations.
*/