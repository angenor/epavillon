-- Script pour corriger définitivement les politiques UPDATE sur la table activities
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Supprimer toutes les politiques existantes sur activities (pour repartir proprement)
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can select their own activities" ON activities;
DROP POLICY IF EXISTS "Users can insert activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;

-- 2. Vérifier que RLS est activé
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 3. Recréer les politiques essentielles une par une

-- Politique SELECT (lecture)
CREATE POLICY "activities_select_policy" ON activities
FOR SELECT
USING (true); -- Tout le monde peut lire les activités

-- Politique INSERT (création)
CREATE POLICY "activities_insert_policy" ON activities
FOR INSERT
WITH CHECK (submitted_by = auth.uid());

-- Politique UPDATE (modification) - LA CLÉS DU PROBLÈME
CREATE POLICY "activities_update_policy" ON activities
FOR UPDATE
USING (
  submitted_by = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
)
WITH CHECK (
  submitted_by = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Politique DELETE (suppression)
CREATE POLICY "activities_delete_policy" ON activities
FOR DELETE
USING (
  submitted_by = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- 4. Vérifier que les politiques ont été créées
SELECT 
    schemaname,
    tablename, 
    policyname,
    cmd as command,
    qual as using_expression
FROM pg_policies 
WHERE tablename = 'activities'
ORDER BY cmd, policyname;

-- 5. Test rapide de l'UPDATE avec l'utilisateur actuel
-- Remplacez l'UUID par votre ID utilisateur réel
UPDATE activities 
SET title = 'TEST UPDATE DIRECT - ' || NOW()::text,
    updated_at = NOW()
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320'
AND submitted_by = '9a9ec732-7daf-4bec-8c4a-17d8109e06a8';

-- 6. Vérifier si l'UPDATE direct a fonctionné
SELECT id, title, updated_at, submitted_by
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';