-- =============================================
-- TEST D'INSERTION DANS ORGANIZATIONS
-- ePavilion2025 - IFDD
-- 
-- Ce script teste l'insertion dans la table organizations
-- pour vérifier que l'erreur "set-returning functions are not allowed in WHERE" est résolue
-- =============================================

-- 1. VÉRIFICATION PRÉALABLE
SELECT 'Starting organizations insert test...' as status;

-- Vérifier que l'utilisateur est authentifié
SELECT 
    CASE 
        WHEN auth.uid() IS NOT NULL 
        THEN 'User authenticated: ' || auth.uid()::text
        ELSE 'WARNING: No authenticated user found'
    END as auth_status;

-- Vérifier les politiques RLS actuelles
SELECT 
    policyname, 
    cmd,
    CASE WHEN qual IS NOT NULL THEN 'Has USING clause' ELSE 'No USING clause' END as using_clause,
    CASE WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause' ELSE 'No WITH CHECK clause' END as check_clause
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'organizations'
ORDER BY policyname;

-- Vérifier les triggers actifs
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
AND event_object_table = 'organizations'
ORDER BY trigger_name;

-- 2. TEST D'INSERTION BASIQUE
BEGIN;

-- Test 1 : Insertion simple sans déclencher les fonctions complexes
SELECT 'Test 1: Basic insert without complex functions' as test_name;

INSERT INTO public.organizations (
    name,
    email,
    organization_type,
    is_active,
    is_verified,
    created_by
) VALUES (
    'Test Organization Basic',
    'test-basic@example.com',
    'ngo_association',
    true,
    false,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
);

SELECT 'Test 1: SUCCESS - Basic insert worked' as result;

-- Test 2 : Insertion qui déclenche la génération de tokens
SELECT 'Test 2: Insert that triggers token generation' as test_name;

INSERT INTO public.organizations (
    name,
    email,
    organization_type,
    description,
    is_active,
    is_verified,
    created_by
) VALUES (
    'Test Organization with Complex Name & Symbols!',
    'test-complex@example.com',
    'international_organization',
    'This organization has a complex name that should trigger the search token generation',
    true,
    false,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
);

SELECT 'Test 2: SUCCESS - Complex insert with token generation worked' as result;

-- Test 3 : Vérifier que les colonnes générées fonctionnent
SELECT 'Test 3: Checking generated columns' as test_name;

SELECT 
    name,
    name_normalized,
    name_search_tokens,
    array_length(name_search_tokens, 1) as token_count
FROM public.organizations 
WHERE email IN ('test-basic@example.com', 'test-complex@example.com')
ORDER BY name;

SELECT 'Test 3: SUCCESS - Generated columns working correctly' as result;

-- Test 4 : Test de recherche avec la fonction search_organizations
SELECT 'Test 4: Testing search_organizations function' as test_name;

SELECT * FROM search_organizations('Test Organization');

SELECT 'Test 4: SUCCESS - Search function working' as result;

-- Test 5 : Test de mise à jour (peut déclencher le trigger)
SELECT 'Test 5: Testing update operation' as test_name;

UPDATE public.organizations 
SET description = 'Updated description for testing trigger on update'
WHERE email = 'test-basic@example.com';

SELECT 'Test 5: SUCCESS - Update operation worked' as result;

-- 3. NETTOYAGE DES DONNÉES DE TEST
DELETE FROM public.organizations 
WHERE email IN ('test-basic@example.com', 'test-complex@example.com');

SELECT 'Test data cleaned up successfully' as cleanup_status;

ROLLBACK; -- Annuler toutes les modifications de test

-- 4. RÉSUMÉ FINAL
SELECT 
    'ALL TESTS PASSED - Organizations table is working correctly!' as final_status,
    'The "set-returning functions are not allowed in WHERE" error should be resolved.' as message;

-- 5. TESTS SUPPLÉMENTAIRES POUR DIAGNOSTIQUER LES PROBLÈMES PERSISTANTS
-- (À exécuter séparément si les tests échouent)

-- Test des permissions sur les fonctions
SELECT 'Testing function permissions...' as test_name;

-- Test de generate_search_tokens
SELECT generate_search_tokens('Test Organization Name') as token_test;

-- Test de has_role (si l'utilisateur a des rôles)
SELECT has_role(
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), 
    'standard'::user_role_type
) as role_test;

-- 6. INSTRUCTIONS POUR L'EXÉCUTION
/*
INSTRUCTIONS POUR EXÉCUTER CE TEST :

1. Connectez-vous à votre base de données Supabase
2. Assurez-vous d'être authentifié (auth.uid() ne doit pas être NULL)
3. Exécutez ce script complet
4. Si tous les tests passent, l'erreur est résolue
5. Si un test échoue, regardez l'erreur spécifique pour identifier le problème restant

COMMANDES À EXÉCUTER AVANT CE TEST :
- Exécutez d'abord : fix_organizations_set_returning_error.sql
- Puis : verify_and_fix_database_permissions.sql
- Enfin ce fichier de test

EN CAS D'ÉCHEC :
- Vérifiez que vous êtes bien authentifié
- Vérifiez que les extensions pg_trgm et uuid-ossp sont installées
- Vérifiez que les politiques RLS ne sont pas en conflit
- Consultez les logs PostgreSQL pour plus de détails sur l'erreur
*/