-- Script pour vérifier les politiques RLS sur la table activities
-- Exécutez ce script dans la console SQL de Supabase pour vérifier les politiques existantes

-- 1. Vérifier si RLS est activé sur la table activities
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'activities';

-- 2. Lister toutes les politiques existantes sur la table activities
SELECT 
    schemaname,
    tablename, 
    policyname,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'activities'
ORDER BY policyname;

-- 3. Vérifier spécifiquement si la politique UPDATE existe
SELECT COUNT(*) as update_policies_count
FROM pg_policies 
WHERE tablename = 'activities' 
AND cmd = 'UPDATE';

-- 4. Vérifier les permissions de l'utilisateur actuel (remplacez l'UUID par votre user_id)
-- SELECT auth.uid(); -- Pour obtenir votre UUID
-- Puis remplacez dans la requête ci-dessous

-- Exemple de test avec un UUID spécifique (remplacez par le vôtre)
SELECT 
    'Current user can UPDATE activities:' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM activities 
            WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320'
            AND submitted_by = '9a9ec732-7daf-4bec-8c4a-17d8109e06a8'
        ) THEN 'YES - User owns this activity'
        ELSE 'NO - Policy or ownership issue'
    END as result;