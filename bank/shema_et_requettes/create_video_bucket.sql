-- =============================================
-- Créer et configurer le bucket epavillonv pour les vidéos
-- =============================================

-- 1. Créer le bucket pour les vidéos
INSERT INTO storage.buckets (
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types
)
VALUES (
    'epavillonv', 
    'epavillonv', 
    true, 
    10485760, -- 10 MB limite pour les vidéos
    ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-ms-wmv']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-ms-wmv'];

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public Access Videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;

-- 3. Créer les politiques pour le bucket epavillonv

-- Permettre à tous de lire les vidéos (bucket public)
CREATE POLICY "Public Access Videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'epavillonv');

-- Permettre aux utilisateurs authentifiés d'uploader des vidéos
CREATE POLICY "Authenticated users can upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'epavillonv' 
    AND auth.uid() IS NOT NULL
);

-- Permettre aux utilisateurs authentifiés de mettre à jour leurs vidéos
CREATE POLICY "Authenticated users can update videos" 
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
CREATE POLICY "Authenticated users can delete videos" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'epavillonv' 
    AND auth.uid() IS NOT NULL
);

-- 4. Vérifier que le bucket existe et est bien configuré
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id IN ('epavillonp', 'epavillonv');

-- 5. Vérifier les politiques sur les deux buckets
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (
    qual::text LIKE '%epavillonp%' 
    OR qual::text LIKE '%epavillonv%'
    OR with_check::text LIKE '%epavillonp%'
    OR with_check::text LIKE '%epavillonv%'
)
ORDER BY policyname;

-- 6. Résumé de la configuration
SELECT 
    'epavillonp' as bucket,
    'Photos et images' as usage,
    '50 MB' as size_limit
UNION ALL
SELECT 
    'epavillonv' as bucket,
    'Vidéos' as usage,
    '10 MB' as size_limit;