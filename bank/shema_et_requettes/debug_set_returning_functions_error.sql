-- =============================================
-- GUIDE DE DÉBOGAGE : "set-returning functions are not allowed in WHERE"
-- ePavilion2025 - IFDD
-- 
-- Ce script aide à identifier la cause exacte de l'erreur
-- "set-returning functions are not allowed in WHERE"
-- =============================================

-- 1. DIAGNOSTIC GÉNÉRAL
SELECT 'Starting diagnostic for set-returning functions error...' as status;

-- Identifier la version de PostgreSQL (important pour certaines fonctions)
SELECT version() as postgresql_version;

-- 2. IDENTIFIER LES FONCTIONS SET-RETURNING PROBLÉMATIQUES

-- A. Rechercher toutes les fonctions qui retournent des sets
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE p.proretset 
        WHEN true THEN 'SET-RETURNING FUNCTION' 
        ELSE 'Regular function' 
    END as function_type,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prokind = 'f'
AND p.proretset = true -- Seulement les fonctions set-returning
ORDER BY p.proname;

-- B. Rechercher les fonctions qui utilisent unnest(), string_to_array(), etc.
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prokind = 'f'
AND (
    pg_get_functiondef(p.oid) ILIKE '%unnest%' OR
    pg_get_functiondef(p.oid) ILIKE '%string_to_array%' OR
    pg_get_functiondef(p.oid) ILIKE '%generate_series%' OR
    pg_get_functiondef(p.oid) ILIKE '%regexp_split_to_table%'
)
ORDER BY p.proname;

-- 3. ANALYSER LES POLITIQUES RLS PROBLÉMATIQUES

-- A. Identifier les politiques qui pourraient utiliser des fonctions set-returning
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual as using_clause,
    with_check as check_clause
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual ILIKE '%unnest%' OR
    qual ILIKE '%string_to_array%' OR 
    qual ILIKE '%generate_series%' OR
    with_check ILIKE '%unnest%' OR
    with_check ILIKE '%string_to_array%' OR
    with_check ILIKE '%generate_series%'
)
ORDER BY tablename, policyname;

-- B. Lister toutes les politiques sur organizations (table problématique)
SELECT 
    policyname,
    cmd,
    qual as using_clause,
    with_check as check_clause,
    LENGTH(qual) as using_length,
    LENGTH(with_check) as check_length
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'organizations'
ORDER BY policyname;

-- 4. ANALYSER LES TRIGGERS PROBLÉMATIQUES

-- A. Identifier les triggers sur organizations
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_condition
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
AND event_object_table = 'organizations'
ORDER BY trigger_name;

-- B. Analyser le contenu des fonctions de trigger
SELECT 
    t.tgname as trigger_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND c.relname = 'organizations'
AND t.tgisinternal = false;

-- 5. ANALYSER LES COLONNES GÉNÉRÉES (GENERATED ALWAYS AS)

-- A. Identifier les colonnes générées dans organizations
SELECT 
    column_name,
    data_type,
    is_generated,
    generation_expression
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'organizations'
AND is_generated = 'ALWAYS'
ORDER BY ordinal_position;

-- B. Analyser les expressions de génération problématiques
SELECT 
    column_name,
    generation_expression,
    CASE 
        WHEN generation_expression ILIKE '%unnest%' THEN 'PROBLEMATIC: Uses unnest()'
        WHEN generation_expression ILIKE '%string_to_array%' THEN 'PROBLEMATIC: Uses string_to_array()'
        WHEN generation_expression ILIKE '%generate_series%' THEN 'PROBLEMATIC: Uses generate_series()'
        ELSE 'OK: No set-returning functions detected'
    END as analysis
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'organizations'
AND is_generated = 'ALWAYS';

-- 6. TESTER CHAQUE COMPOSANT INDIVIDUELLEMENT

-- A. Test de la fonction generate_search_tokens (souvent problématique)
SELECT 'Testing generate_search_tokens function...' as test_name;
BEGIN;
    SELECT generate_search_tokens('Test Organization Name') as result;
    SELECT 'generate_search_tokens: OK' as status;
EXCEPTION WHEN OTHERS THEN
    SELECT 'generate_search_tokens: ERROR - ' || SQLERRM as status;
ROLLBACK;

-- B. Test d'insertion sans trigger (désactiver temporairement)
SELECT 'Testing insert without triggers...' as test_name;

-- Désactiver temporairement les triggers
ALTER TABLE public.organizations DISABLE TRIGGER ALL;

BEGIN;
    INSERT INTO public.organizations (
        name, email, organization_type, created_by
    ) VALUES (
        'Test Without Triggers', 
        'test-no-triggers@example.com', 
        'ngo_association',
        '00000000-0000-0000-0000-000000000000'::uuid
    );
    SELECT 'Insert without triggers: OK' as status;
    ROLLBACK;
EXCEPTION WHEN OTHERS THEN
    SELECT 'Insert without triggers: ERROR - ' || SQLERRM as status;
    ROLLBACK;
END;

-- Réactiver les triggers
ALTER TABLE public.organizations ENABLE TRIGGER ALL;

-- C. Test d'insertion avec RLS désactivé
SELECT 'Testing insert without RLS...' as test_name;

-- Désactiver temporairement RLS
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

BEGIN;
    INSERT INTO public.organizations (
        name, email, organization_type, created_by
    ) VALUES (
        'Test Without RLS', 
        'test-no-rls@example.com', 
        'ngo_association',
        '00000000-0000-0000-0000-000000000000'::uuid
    );
    SELECT 'Insert without RLS: OK' as status;
    ROLLBACK;
EXCEPTION WHEN OTHERS THEN
    SELECT 'Insert without RLS: ERROR - ' || SQLERRM as status;
    ROLLBACK;
END;

-- Réactiver RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 7. ANALYSE DES DÉPENDANCES

-- A. Identifier les objets qui dépendent de organizations
SELECT DISTINCT
    dependent_ns.nspname as dependent_schema,
    dependent.relname as dependent_object,
    dependent.relkind as object_type
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid
JOIN pg_class dependent ON pg_rewrite.ev_class = dependent.oid
JOIN pg_class referenced ON pg_depend.refobjid = referenced.oid
JOIN pg_namespace dependent_ns ON dependent.relnamespace = dependent_ns.oid
JOIN pg_namespace referenced_ns ON referenced.relnamespace = referenced_ns.oid
WHERE referenced_ns.nspname = 'public' 
AND referenced.relname = 'organizations';

-- 8. RECOMMANDATIONS BASÉES SUR L'ANALYSE

SELECT 
    'DIAGNOSTIC COMPLET TERMINÉ' as status,
    'Examinez les résultats ci-dessus pour identifier la cause exacte' as instruction;

-- 9. CHECKLIST DE RÉSOLUTION
/*
CHECKLIST POUR RÉSOUDRE L'ERREUR :

□ 1. Vérifier les fonctions set-returning dans les politiques RLS
□ 2. Corriger la fonction generate_search_tokens si elle utilise unnest() dans WHERE
□ 3. Vérifier que les triggers n'utilisent pas de fonctions problématiques
□ 4. S'assurer que les colonnes GENERATED ALWAYS AS n'utilisent pas de fonctions set-returning
□ 5. Vérifier les permissions sur toutes les fonctions utilisées
□ 6. Tester chaque composant individuellement
□ 7. Recréer les politiques RLS de manière simplifiée
□ 8. Ajouter SECURITY DEFINER aux fonctions si nécessaire

CAUSES COMMUNES :
1. unnest() utilisé directement dans WHERE au lieu d'une sous-requête
2. Politiques RLS en conflit ou récursives
3. Triggers qui font des requêtes sur la même table avec RLS activé
4. Permissions manquantes sur les fonctions système
5. Colonnes générées qui utilisent des fonctions set-returning

SOLUTION GÉNÉRALE :
Exécuter dans l'ordre :
1. fix_organizations_set_returning_error.sql
2. verify_and_fix_database_permissions.sql
3. test_organizations_insert.sql
*/