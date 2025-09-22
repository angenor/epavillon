-- Migration pour ajouter le support des miniatures aux photos d'intervenants
-- À exécuter dans l'interface SQL de Supabase

-- Vérifier si la colonne existe déjà et l'ajouter si nécessaire
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'activity_speakers'
        AND column_name = 'photo_thumbnail_url'
    ) THEN
        ALTER TABLE public.activity_speakers
        ADD COLUMN photo_thumbnail_url TEXT;

        -- Ajouter un commentaire pour la documentation
        COMMENT ON COLUMN public.activity_speakers.photo_thumbnail_url IS 'URL de la miniature de la photo de l''intervenant (optimisée pour affichage dans les listes)';

        RAISE NOTICE 'Colonne photo_thumbnail_url ajoutée à activity_speakers';
    ELSE
        RAISE NOTICE 'Colonne photo_thumbnail_url existe déjà dans activity_speakers';
    END IF;
END $$;