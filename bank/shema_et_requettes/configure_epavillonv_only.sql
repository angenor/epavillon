-- =============================================
-- Configuration du bucket epavillonv UNIQUEMENT
-- Le bucket epavillonp n'est PAS modifié
-- =============================================

-- 1. Mettre à jour la configuration du bucket epavillonv
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 10485760, -- 10 MB limite
    allowed_mime_types = ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-ms-wmv']
WHERE id = 'epavillonv';

-- 2. Vérifier la configuration des deux buckets
SELECT 
    id as "Bucket",
    CASE 
        WHEN public = true THEN '✅ Public'
        ELSE '❌ Privé'
    END as "Statut",
    file_size_limit / 1048576.0 as "Limite (MB)",
    CASE
        WHEN id = 'epavillonp' THEN 'Photos/Images'
        WHEN id = 'epavillonv' THEN 'Vidéos'
    END as "Utilisation"
FROM storage.buckets
WHERE id IN ('epavillonp', 'epavillonv')
ORDER BY id;

-- 3. Supprimer UNIQUEMENT les anciennes politiques pour epavillonv
-- (sans toucher aux politiques de epavillonp)
DROP POLICY IF EXISTS "Public Read epavillonv" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload epavillonv" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update epavillonv" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete epavillonv" ON storage.objects;

-- 4. Créer les politiques pour epavillonv UNIQUEMENT

-- Lecture publique pour les vidéos
CREATE POLICY "Public Read epavillonv" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'epavillonv');

-- Upload pour les utilisateurs authentifiés
CREATE POLICY "Auth Upload epavillonv" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'epavillonv' 
    AND auth.uid() IS NOT NULL
);

-- Mise à jour pour les utilisateurs authentifiés
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

-- Suppression pour les utilisateurs authentifiés
CREATE POLICY "Auth Delete epavillonv" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'epavillonv' 
    AND auth.uid() IS NOT NULL
);

-- 5. Vérifier les politiques pour les deux buckets
SELECT 
    policyname as "Politique",
    cmd as "Action",
    CASE 
        WHEN qual::text LIKE '%epavillonp%' OR with_check::text LIKE '%epavillonp%' THEN 'epavillonp (photos)'
        WHEN qual::text LIKE '%epavillonv%' OR with_check::text LIKE '%epavillonv%' THEN 'epavillonv (vidéos)'
        ELSE 'Autre'
    END as "Bucket concerné"
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (
    qual::text LIKE '%epavillonp%' 
    OR qual::text LIKE '%epavillonv%'
    OR with_check::text LIKE '%epavillonp%'
    OR with_check::text LIKE '%epavillonv%'
)
ORDER BY "Bucket concerné", policyname;

-- 6. Résumé final
SELECT 
    '✅ Configuration terminée' as "Statut",
    'epavillonv configuré (10 MB, vidéos uniquement)' as "Résultat",
    'epavillonp non modifié' as "Note";