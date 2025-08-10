-- =============================================
-- Politiques simples pour le Storage
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- 1. Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('epavillonp', 'epavillonp', true, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Rendre le bucket public (pour lecture)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'epavillonp';

-- 3. Supprimer toutes les anciennes politiques RLS sur les objets du bucket
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read" ON storage.objects;

-- 4. Créer des politiques simples pour le bucket epavillonp

-- Permettre à tous de lire (car le bucket est public)
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'epavillonp');

-- Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Authenticated users can upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'epavillonp' 
    AND auth.uid() IS NOT NULL
);

-- Permettre aux utilisateurs authentifiés de mettre à jour
CREATE POLICY "Authenticated users can update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'epavillonp' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'epavillonp' AND auth.uid() IS NOT NULL);

-- Permettre aux utilisateurs authentifiés de supprimer
CREATE POLICY "Authenticated users can delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'epavillonp' AND auth.uid() IS NOT NULL);

-- 5. Vérifier les politiques
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
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (qual::text LIKE '%epavillonp%' OR with_check::text LIKE '%epavillonp%');