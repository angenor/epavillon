-- =============================================
-- Désactiver complètement RLS et synchroniser les utilisateurs
-- =============================================

-- 1. Vérifier l'état actuel de RLS
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('user_testimonials', 'video_testimonials');

-- 2. DÉSACTIVER RLS COMPLÈTEMENT
ALTER TABLE public.user_testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_testimonials DISABLE ROW LEVEL SECURITY;

-- 3. Vérifier à nouveau
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('user_testimonials', 'video_testimonials');

-- 4. Supprimer TOUTES les politiques existantes
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Pour user_testimonials
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_testimonials'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_testimonials', pol.policyname);
        RAISE NOTICE 'Dropped policy: % on user_testimonials', pol.policyname;
    END LOOP;
    
    -- Pour video_testimonials
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'video_testimonials'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.video_testimonials', pol.policyname);
        RAISE NOTICE 'Dropped policy: % on video_testimonials', pol.policyname;
    END LOOP;
END $$;

-- 5. Vérifier qu'il n'y a plus de politiques
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('user_testimonials', 'video_testimonials');

-- 6. IMPORTANT: Synchroniser TOUS les utilisateurs de auth.users vers public.users
INSERT INTO public.users (
    id, 
    email, 
    first_name, 
    last_name,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(au.raw_user_meta_data->>'last_name', 'Name'),
    au.created_at,
    NOW()
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- 7. Mettre à jour les utilisateurs existants
UPDATE public.users u
SET 
    email = au.email,
    updated_at = NOW()
FROM auth.users au
WHERE u.id = au.id
AND u.email != au.email;

-- 8. Vérifier les utilisateurs
SELECT 
    au.id,
    au.email as auth_email,
    pu.id as public_id,
    pu.email as public_email,
    pu.first_name,
    pu.last_name,
    CASE 
        WHEN pu.id IS NULL THEN 'MISSING IN PUBLIC.USERS'
        ELSE 'OK'
    END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;

-- 9. Compter les utilisateurs
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'public.users' as table_name,
    COUNT(*) as count
FROM public.users;

-- 10. Test d'insertion direct avec le premier utilisateur trouvé
DO $$
DECLARE
    test_user_id UUID;
    test_result RECORD;
BEGIN
    -- Prendre le premier utilisateur qui existe dans les deux tables
    SELECT au.id INTO test_user_id 
    FROM auth.users au
    INNER JOIN public.users pu ON au.id = pu.id
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user_id: %', test_user_id;
        
        -- Tenter l'insertion
        INSERT INTO public.user_testimonials (
            user_id,
            testimonial_text,
            context_type,
            featured,
            background_color
        ) VALUES (
            test_user_id,
            'Test SQL - RLS disabled',
            'platform',
            false,
            '#10B981'
        ) RETURNING * INTO test_result;
        
        RAISE NOTICE 'SUCCESS: Inserted testimonial with id: %', test_result.id;
        
        -- Supprimer le test
        DELETE FROM public.user_testimonials WHERE id = test_result.id;
        RAISE NOTICE 'Test record deleted';
    ELSE
        RAISE NOTICE 'ERROR: No valid user found in both tables';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR during test: %', SQLERRM;
END $$;

-- 11. Afficher les témoignages existants
SELECT 
    t.id,
    t.user_id,
    t.testimonial_text,
    t.created_at,
    u.email,
    u.first_name,
    u.last_name
FROM public.user_testimonials t
LEFT JOIN public.users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;