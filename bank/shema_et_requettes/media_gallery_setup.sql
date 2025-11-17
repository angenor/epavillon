-- Configuration de la galerie de médias pour les activités
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer le bucket de stockage pour les médias des activités
-- Si le bucket existe déjà, mettre à jour la limite de taille
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'activity-media',
  'activity-media',
  true,
  1048576, -- 1 Mo en bytes (les images sont automatiquement compressées côté client)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id)
DO UPDATE SET
  file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. Politique RLS : Permettre à tout le monde de lire les médias publics
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'activity-media');

-- 3. Politique RLS : Permettre aux utilisateurs authentifiés d'uploader des médias
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'activity-media');

-- 4. Politique RLS : Permettre aux utilisateurs de supprimer leurs propres uploads
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'activity-media'
  AND auth.uid() IN (
    SELECT uploaded_by FROM media_gallery
    WHERE media_url LIKE '%' || name || '%'
  )
);

-- 5. Activer RLS sur la table media_gallery
ALTER TABLE media_gallery ENABLE ROW LEVEL SECURITY;

-- 6. Politique RLS : Tout le monde peut voir les médias des activités approuvées
DROP POLICY IF EXISTS "Public can view media of approved activities" ON media_gallery;
CREATE POLICY "Public can view media of approved activities"
ON media_gallery FOR SELECT
USING (
  context_type = 'activity'
  AND context_id IN (
    SELECT id FROM activities
    WHERE validation_status IN ('approved', 'live', 'completed')
  )
);

-- 7. Politique RLS : Les utilisateurs authentifiés peuvent voir les médias de leurs propres activités
DROP POLICY IF EXISTS "Users can view media of their own activities" ON media_gallery;
CREATE POLICY "Users can view media of their own activities"
ON media_gallery FOR SELECT
TO authenticated
USING (
  context_type = 'activity'
  AND context_id IN (
    SELECT id FROM activities
    WHERE submitted_by = auth.uid()
  )
);

-- 8. Politique RLS : Les utilisateurs peuvent ajouter des médias à leurs activités terminées
DROP POLICY IF EXISTS "Users can add media to their completed activities" ON media_gallery;
CREATE POLICY "Users can add media to their completed activities"
ON media_gallery FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND context_type = 'activity'
  AND context_id IN (
    SELECT id FROM activities
    WHERE submitted_by = auth.uid()
    AND validation_status = 'completed'
  )
);

-- 9. Politique RLS : Les utilisateurs peuvent supprimer leurs propres médias
DROP POLICY IF EXISTS "Users can delete their own media" ON media_gallery;
CREATE POLICY "Users can delete their own media"
ON media_gallery FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());

-- 10. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_media_gallery_context
ON media_gallery(context_type, context_id);

CREATE INDEX IF NOT EXISTS idx_media_gallery_uploaded_by
ON media_gallery(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_media_gallery_created_at
ON media_gallery(created_at DESC);

-- 11. Fonction trigger pour nettoyer automatiquement les fichiers du storage
-- quand une entrée media_gallery est supprimée
CREATE OR REPLACE FUNCTION delete_media_storage_file()
RETURNS TRIGGER AS $$
DECLARE
  file_path TEXT;
BEGIN
  -- Extraire le chemin du fichier depuis l'URL
  file_path := SUBSTRING(OLD.media_url FROM 'activity-media/(.*)');

  IF file_path IS NOT NULL THEN
    -- Supprimer le fichier du storage
    PERFORM storage.delete_object('activity-media', file_path);
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Créer le trigger
DROP TRIGGER IF EXISTS on_media_gallery_delete ON media_gallery;
CREATE TRIGGER on_media_gallery_delete
  BEFORE DELETE ON media_gallery
  FOR EACH ROW
  EXECUTE FUNCTION delete_media_storage_file();

-- Notes d'utilisation :
-- 1. Ce script crée un bucket de stockage publique pour les images des activités
-- 2. Les médias ne peuvent être ajoutés que pour les activités avec le statut 'completed'
-- 3. Les utilisateurs peuvent uniquement ajouter/supprimer des médias pour leurs propres activités
-- 4. Les médias sont publiquement visibles pour toutes les activités approuvées/live/completed
-- 5. Limite de taille : 1 Mo par fichier (compression automatique côté client)
-- 6. Formats supportés : JPEG, PNG, WebP
-- 7. Les images sont automatiquement compressées à moins de 1 Mo avant l'upload via l'utilitaire imageCompression.js
