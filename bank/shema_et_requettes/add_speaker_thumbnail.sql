-- =============================================
-- Ajout du champ photo_thumbnail_url à la table activity_speakers
-- ePavilion2025 - Support pour images en 2 qualités
-- =============================================

-- Ajouter le champ pour la miniature de la photo de l'intervenant
ALTER TABLE public.activity_speakers
ADD COLUMN photo_thumbnail_url TEXT;

-- Commentaire pour documentation
COMMENT ON COLUMN public.activity_speakers.photo_thumbnail_url IS 'URL de la miniature de la photo de l''intervenant (optimisée pour affichage dans les listes)';
COMMENT ON COLUMN public.activity_speakers.photo_url IS 'URL de la photo haute définition de l''intervenant';