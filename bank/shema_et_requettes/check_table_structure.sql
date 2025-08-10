-- =============================================
-- Vérifier la structure des tables de témoignages
-- =============================================

-- 1. Structure de user_testimonials
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_testimonials'
ORDER BY ordinal_position;

-- 2. Structure de video_testimonials  
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'video_testimonials'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes
SELECT
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('user_testimonials', 'video_testimonials')
ORDER BY tc.table_name, tc.constraint_type;

-- 4. Test d'insertion minimaliste
-- Test avec les champs minimaux requis
INSERT INTO public.user_testimonials (
    user_id,
    testimonial_text,
    context_type
) 
SELECT 
    id as user_id,
    'Test minimal' as testimonial_text,
    'platform' as context_type
FROM public.users
LIMIT 1
RETURNING *;

-- 5. Supprimer le test
DELETE FROM public.user_testimonials 
WHERE testimonial_text = 'Test minimal';

-- 6. Vérifier si context_id peut être NULL
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_testimonials'
AND column_name = 'context_id';

-- 7. Si context_id ne peut pas être NULL, le rendre nullable
-- ALTER TABLE public.user_testimonials ALTER COLUMN context_id DROP NOT NULL;

-- 8. Vérifier les types ENUM utilisés
SELECT 
    t.typname,
    e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('testimonial_context_type', 'comment_context_type', 'media_context')
ORDER BY t.typname, e.enumsortorder;