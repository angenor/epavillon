-- Script de test minimal pour l'UPDATE des activités
-- Exécutez ce script dans Supabase pour tester directement l'UPDATE

-- 1. Vérifier la structure de la table activities
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'activities'
ORDER BY ordinal_position;

-- 2. Voir l'activité actuelle
SELECT id, title, activity_type, format, submitted_by, created_at, updated_at
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';

-- 3. Test UPDATE minimal (changez juste le titre)
UPDATE activities 
SET title = 'Test UPDATE - ' || NOW()::text,
    updated_at = NOW()
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320'
AND submitted_by = '9a9ec732-7daf-4bec-8c4a-17d8109e06a8';

-- 4. Vérifier si l'UPDATE a fonctionné
SELECT id, title, updated_at, submitted_by
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';

-- 5. Voir les contraintes sur la table
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'activities'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 6. Test avec les colonnes problématiques (tableaux)
-- Vérifier les colonnes main_themes et categories
SELECT id, main_themes, categories
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';