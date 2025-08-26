-- =============================================
-- Script de migration: Ajouter thematique_type à video_testimonials
-- Date: 2025-08-26
-- Description: Ajoute la colonne thematique_type à la table video_testimonials
-- Note: Le type ENUM thematique_type est supposé déjà exister
-- =============================================

-- Ajouter la colonne thematique_type si elle n'existe pas
DO $$ 
BEGIN
    -- Vérifier si la colonne existe déjà
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'video_testimonials' 
        AND column_name = 'thematique_type'
    ) THEN
        -- Ajouter la colonne thematique_type avec le type ENUM array
        ALTER TABLE public.video_testimonials 
        ADD COLUMN thematique_type thematique_type[] NOT NULL DEFAULT '{}';
        
        RAISE NOTICE 'Colonne thematique_type ajoutée avec succès à la table video_testimonials';
    ELSE
        RAISE NOTICE 'La colonne thematique_type existe déjà dans la table video_testimonials';
    END IF;
END $$;

-- Mise à jour de l'index existant pour inclure thematique_type si nécessaire
CREATE INDEX IF NOT EXISTS idx_video_testimonials_thematique_type 
ON public.video_testimonials USING GIN (thematique_type);

-- Commentaire pour documentation
COMMENT ON COLUMN public.video_testimonials.thematique_type IS 'Thématiques associées au témoignage vidéo (array de thematique_type)';

-- Afficher la structure mise à jour de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'video_testimonials'
ORDER BY ordinal_position;