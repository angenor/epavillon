-- Script temporaire pour désactiver RLS sur activities et permettre les mises à jour
-- ATTENTION: À utiliser uniquement pour le débogage !

-- 1. Désactiver RLS temporairement sur la table activities
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier que RLS est bien désactivé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'activities';

-- 3. Tester une mise à jour directe
-- Remplacez l'ID par un ID d'activité existant
UPDATE activities 
SET 
    title = 'Test Update - ' || NOW()::text,
    updated_at = NOW()
WHERE id = (SELECT id FROM activities LIMIT 1)
RETURNING id, title, updated_at;

-- 4. Pour réactiver RLS après les tests (IMPORTANT !)
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Note: Si la mise à jour fonctionne sans RLS, le problème vient des politiques
-- Dans ce cas, il faudra recréer les politiques correctement