-- =============================================
-- Corriger la contrainte NOT NULL sur photo_url
-- =============================================

-- 1. Vérifier la structure actuelle de user_testimonials
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_testimonials'
AND column_name IN ('photo_url', 'background_color', 'featured', 'context_id')
ORDER BY ordinal_position;

-- 2. Modifier la colonne photo_url pour permettre NULL
ALTER TABLE public.user_testimonials 
ALTER COLUMN photo_url DROP NOT NULL;

-- 3. Vérifier que context_id peut être NULL aussi
ALTER TABLE public.user_testimonials 
ALTER COLUMN context_id DROP NOT NULL;

-- 4. Vérifier les modifications
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_testimonials'
AND column_name IN ('photo_url', 'background_color', 'featured', 'context_id')
ORDER BY ordinal_position;

-- 5. Test d'insertion sans photo_url
INSERT INTO public.user_testimonials (
    user_id,
    testimonial_text,
    context_type,
    featured,
    background_color
) 
SELECT 
    id as user_id,
    'Test sans photo' as testimonial_text,
    'platform' as context_type,
    false as featured,
    '#10B981' as background_color
FROM public.users
LIMIT 1
RETURNING *;

-- 6. Nettoyer le test
DELETE FROM public.user_testimonials 
WHERE testimonial_text = 'Test sans photo';

-- 7. Faire de même pour video_testimonials si nécessaire
-- Vérifier la structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'video_testimonials'
ORDER BY ordinal_position;

-- Si des colonnes sont NOT NULL et ne devraient pas l'être, les modifier
-- Par exemple, si context_id ne peut pas être NULL :
-- ALTER TABLE public.video_testimonials 
-- ALTER COLUMN context_id DROP NOT NULL;