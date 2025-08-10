-- =============================================
-- Mettre à jour le bucket epavillonv existant
-- =============================================

-- 1. Mettre à jour la configuration du bucket existant
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 10485760, -- 10 MB limite
    allowed_mime_types = ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-ms-wmv']
WHERE id = 'epavillonv';

-- 2. Vérifier la mise à jour
SELECT 
    id,
    name,
    public,
    file_size_limit,
    file_size_limit / 1048576.0 as size_limit_mb,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'epavillonv';

-- 3. Supprimer les anciennes politiques sur ce bucket
-- Note: Il faut supprimer les politiques par leur nom exact
DROP POLICY IF EXISTS "Public Access Videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Public Read epavillonv" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload epavillonv" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update epavillonv" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete epavillonv" ON storage.objects;

-- 4. Créer les nouvelles politiques pour le bucket epavillonv

-- Permettre à tous de lire les vidéos (bucket public)
CREATE POLICY "Public Read epavillonv" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'epavillonv');

-- Permettre aux utilisateurs authentifiés d'uploader des vidéos
CREATE POLICY "Auth Upload epavillonv" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'epavillonv' 
    AND auth.uid() IS NOT NULL
);

-- Permettre aux utilisateurs authentifiés de mettre à jour leurs vidéos
CREATE POLICY "Auth Update epavillonv" 
ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = 'epavillonv' 
    AND auth.uid() IS NOT NULL
)
WITH CHECK (
    bucket_id = 'epavillonv' 
    AND auth.uid() IS NOT NULL
);

-- Permettre aux utilisateurs authentifiés de supprimer leurs vidéos
CREATE POLICY "Auth Delete epavillonv" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'epavillonv' 
    AND auth.uid() IS NOT NULL
);

-- 5. Vérifier les politiques créées
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (qual::text LIKE '%epavillonv%' OR with_check::text LIKE '%epavillonv%')
ORDER BY policyname;

-- 6. Afficher un résumé
SELECT 
    'Configuration mise à jour pour epavillonv' as message,
    '10 MB' as nouvelle_limite,
    'Videos uniquement' as types_autorises;