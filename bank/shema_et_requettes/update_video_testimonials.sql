-- =============================================
-- Mise à jour de la table video_testimonials
-- =============================================

-- Ajouter le champ thumbnail_url s'il n'existe pas
ALTER TABLE public.video_testimonials 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Vérifier la structure actuelle de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'video_testimonials'
ORDER BY ordinal_position;

-- Vérifier les données existantes
SELECT 
    id,
    video_url,
    thumbnail_url,
    user_id,
    is_approved,
    featured,
    created_at
FROM public.video_testimonials
ORDER BY created_at DESC;