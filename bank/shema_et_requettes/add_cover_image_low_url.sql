-- =============================================
-- Script pour ajouter la colonne cover_image_low_url à la table activities
-- ePavilion2025 - IFDD
-- =============================================

-- Ajouter la colonne cover_image_low_url pour stocker l'URL de la bannière basse qualité
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS cover_image_low_url TEXT;

-- Ajouter un commentaire pour documenter cette colonne
COMMENT ON COLUMN public.activities.cover_image_low_url IS 'URL de l''image de couverture en basse qualité (20-30KB) pour optimiser les performances d''affichage';

-- Mettre à jour le commentaire de la colonne existante pour clarifier
COMMENT ON COLUMN public.activities.cover_image_high_url IS 'URL de l''image de couverture en haute qualité (max 160KB) pour l''affichage principal';