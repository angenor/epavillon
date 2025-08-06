-- Script de diagnostic complet pour identifier le problème RLS sur activities
-- Exécutez ce script dans Supabase SQL Editor pour diagnostiquer le problème

-- ===== ÉTAPE 1: ÉTAT GÉNÉRAL DE LA TABLE =====
SELECT 
    '=== ÉTAT DE LA TABLE ACTIVITIES ===' as section;

-- Vérifier si RLS est activé
SELECT 
    'RLS Status:' as info,
    CASE 
        WHEN rowsecurity THEN 'ACTIVÉ ✓' 
        ELSE 'DÉSACTIVÉ ✗' 
    END as valeur
FROM pg_tables 
WHERE tablename = 'activities' AND schemaname = 'public';

-- ===== ÉTAPE 2: AUDIT DES POLITIQUES EXISTANTES =====
SELECT 
    '=== POLITIQUES RLS EXISTANTES ===' as section;

SELECT 
    policyname as "Nom de la politique",
    cmd as "Type",
    CASE cmd 
        WHEN 'SELECT' THEN 'Lecture'
        WHEN 'INSERT' THEN 'Création' 
        WHEN 'UPDATE' THEN 'Modification ← IMPORTANT'
        WHEN 'DELETE' THEN 'Suppression'
        ELSE cmd 
    END as "Opération",
    qual as "Condition USING",
    with_check as "Condition WITH CHECK",
    CASE 
        WHEN cmd = 'UPDATE' THEN '🔍 POLITIQUE CRITIQUE'
        ELSE ''
    END as "Notes"
FROM pg_policies 
WHERE tablename = 'activities' AND schemaname = 'public'
ORDER BY 
    CASE cmd 
        WHEN 'UPDATE' THEN 1  -- UPDATE en premier
        WHEN 'SELECT' THEN 2
        WHEN 'INSERT' THEN 3
        WHEN 'DELETE' THEN 4
    END, policyname;

-- ===== ÉTAPE 3: VÉRIFICATION SPÉCIFIQUE UPDATE =====
SELECT 
    '=== VÉRIFICATION POLITIQUE UPDATE ===' as section;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ Politique UPDATE trouvée'
        ELSE '✗ AUCUNE politique UPDATE trouvée'
    END as "Résultat diagnostic",
    COUNT(*) as "Nombre de politiques UPDATE"
FROM pg_policies 
WHERE tablename = 'activities' AND schemaname = 'public' AND cmd = 'UPDATE';

-- ===== ÉTAPE 4: DIAGNOSTIC DE L'ACTIVITÉ CIBLE =====
SELECT 
    '=== DIAGNOSTIC DE L''ACTIVITÉ CIBLE ===' as section;

-- Informations sur l'activité spécifique
SELECT 
    'Activité ID:' as info,
    id as valeur
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320'
UNION ALL
SELECT 
    'Propriétaire:' as info,
    submitted_by as valeur
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320'
UNION ALL
SELECT 
    'Titre actuel:' as info,
    title as valeur
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320'
UNION ALL
SELECT 
    'Dernière modification:' as info,
    updated_at::text as valeur
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';

-- ===== ÉTAPE 5: UTILISATEUR ACTUEL =====
SELECT 
    '=== UTILISATEUR ACTUEL ===' as section;

SELECT 
    'auth.uid():' as info,
    auth.uid()::text as valeur
UNION ALL
SELECT 
    'Utilisateur connecté:' as info,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✓ Connecté'
        ELSE '✗ Non connecté'
    END as valeur;

-- ===== ÉTAPE 6: VÉRIFICATION DE PROPRIÉTÉ =====
SELECT 
    '=== VÉRIFICATION DE PROPRIÉTÉ ===' as section;

SELECT 
    'L\'utilisateur est-il propriétaire:' as test,
    CASE 
        WHEN submitted_by = auth.uid() THEN '✓ OUI - Propriétaire'
        WHEN submitted_by IS NULL THEN '? Activité non trouvée'
        WHEN auth.uid() IS NULL THEN '✗ Utilisateur non connecté'
        ELSE '✗ NON - Pas le propriétaire'
    END as resultat,
    'Propriétaire: ' || COALESCE(submitted_by::text, 'NULL') as details,
    'Utilisateur actuel: ' || COALESCE(auth.uid()::text, 'NULL') as utilisateur
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';

-- ===== ÉTAPE 7: TEST D'UPDATE DIRECT =====
SELECT 
    '=== TEST D''UPDATE DIRECT ===' as section;

-- Préparer le test
DO $$
DECLARE
    test_title TEXT := 'TEST DIAGNOSTIC - ' || NOW()::text;
    rows_affected INTEGER;
BEGIN
    -- Tentative d'update
    UPDATE activities 
    SET title = test_title,
        updated_at = NOW()
    WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';
    
    -- Obtenir le nombre de lignes affectées
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    -- Afficher le résultat
    RAISE NOTICE '=== RÉSULTAT DU TEST D''UPDATE ===';
    RAISE NOTICE 'Titre de test: %', test_title;
    RAISE NOTICE 'Lignes affectées: %', rows_affected;
    
    IF rows_affected > 0 THEN
        RAISE NOTICE '✓ UPDATE RÉUSSI';
    ELSE
        RAISE NOTICE '✗ UPDATE ÉCHOUÉ - Aucune ligne modifiée';
        RAISE NOTICE 'Causes possibles:';
        RAISE NOTICE '1. Politique RLS bloque l''opération';
        RAISE NOTICE '2. Utilisateur non propriétaire';
        RAISE NOTICE '3. Activité inexistante';
        RAISE NOTICE '4. Problème de permissions';
    END IF;
END $$;

-- ===== ÉTAPE 8: VÉRIFICATION FINALE =====
SELECT 
    '=== VÉRIFICATION FINALE ===' as section;

SELECT 
    'Titre actuel après test:' as info,
    title as valeur,
    'Modifié le:' as derniere_modif,
    updated_at::text as horodatage
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';

-- ===== RÉSUMÉ DIAGNOSTIC =====
SELECT 
    '=== RÉSUMÉ DIAGNOSTIC ===' as section;

SELECT 
    'NEXT STEPS:' as action_requise,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND cmd = 'UPDATE') THEN
            '1. Exécuter fix_activities_update_policies.sql pour créer la politique UPDATE'
        WHEN NOT EXISTS (SELECT 1 FROM activities WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320') THEN
            '1. Vérifier que l''activité existe avec le bon ID'
        WHEN auth.uid() IS NULL THEN
            '1. Se connecter avec un utilisateur valide'
        ELSE
            '1. Vérifier les logs ci-dessus pour identifier le problème spécifique'
    END as recommendation;