-- Script de vérification après correction des politiques RLS
-- Exécutez après avoir appliqué fix_activities_update_policies.sql

-- 1. Vérifier l'état actuel de RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ACTIVÉ ✓' 
        ELSE 'RLS DÉSACTIVÉ ✗' 
    END as status
FROM pg_tables 
WHERE tablename = 'activities';

-- 2. Lister toutes les politiques maintenant en place
SELECT 
    policyname as "Politique",
    cmd as "Commande",
    CASE 
        WHEN cmd = 'SELECT' THEN 'Lecture'
        WHEN cmd = 'INSERT' THEN 'Création' 
        WHEN cmd = 'UPDATE' THEN 'Modification'
        WHEN cmd = 'DELETE' THEN 'Suppression'
        ELSE cmd 
    END as "Type",
    qual as "Condition USING",
    with_check as "Condition WITH CHECK"
FROM pg_policies 
WHERE tablename = 'activities'
ORDER BY 
    CASE cmd 
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
    END;

-- 3. Test spécifique de la politique UPDATE
SELECT 
    'Politique UPDATE existe:' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN 'OUI ✓'
        ELSE 'NON ✗'
    END as resultat
FROM pg_policies 
WHERE tablename = 'activities' AND cmd = 'UPDATE';

-- 4. Vérifier que l'utilisateur peut modifier son activité
-- (Remplacez les UUIDs par les valeurs réelles)
SELECT 
    'Utilisateur peut modifier cette activité:' as test,
    CASE 
        WHEN submitted_by = '9a9ec732-7daf-4bec-8c4a-17d8109e06a8' THEN 'OUI ✓'
        ELSE 'NON ✗ - Pas le propriétaire'
    END as resultat,
    submitted_by as "Propriétaire de l'activité"
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';

-- 5. Test final : tentative d'UPDATE direct
-- Si cela ne fonctionne pas, il y a encore un problème
DO $$
DECLARE
    rows_affected INTEGER;
BEGIN
    -- Tentative d'update
    UPDATE activities 
    SET title = 'TEST DE VÉRIFICATION - ' || NOW()::text,
        updated_at = NOW()
    WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320'
    AND submitted_by = '9a9ec732-7daf-4bec-8c4a-17d8109e06a8';
    
    -- Obtenir le nombre de lignes affectées
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    -- Vérifier le résultat
    IF rows_affected > 0 THEN
        RAISE NOTICE 'UPDATE réussi ✓ - % ligne(s) modifiée(s)', rows_affected;
    ELSE
        RAISE NOTICE 'UPDATE échoué ✗ - Aucune ligne modifiée';
    END IF;
END $$;

-- 6. Vérification finale : voir l'état actuel de l'activité
SELECT 
    id,
    title as "Titre actuel",
    updated_at as "Dernière modification",
    submitted_by as "Propriétaire"
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';