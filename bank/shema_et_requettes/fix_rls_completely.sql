-- =============================================
-- Script pour corriger complètement les problèmes RLS
-- =============================================

-- 1. Vérifier l'état actuel de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename IN ('user_testimonials', 'video_testimonials');

-- 2. Désactiver RLS sur les deux tables
ALTER TABLE public.user_testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_testimonials DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer TOUTES les politiques existantes
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_testimonials'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_testimonials', pol.policyname);
    END LOOP;
    
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'video_testimonials'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.video_testimonials', pol.policyname);
    END LOOP;
END $$;

-- 4. Vérifier qu'il n'y a plus de politiques
SELECT 
    tablename,
    policyname
FROM pg_policies 
WHERE tablename IN ('user_testimonials', 'video_testimonials');

-- 5. Test d'insertion directe (avec un user_id existant)
DO $$
DECLARE
    test_user_id UUID;
    test_result RECORD;
BEGIN
    -- Récupérer un user_id valide
    SELECT id INTO test_user_id FROM public.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Tenter l'insertion
        INSERT INTO public.user_testimonials (
            user_id,
            testimonial_text,
            context_type,
            featured,
            background_color
        ) VALUES (
            test_user_id,
            'Test SQL direct - RLS désactivé',
            'platform',
            false,
            '#10B981'
        ) RETURNING * INTO test_result;
        
        RAISE NOTICE 'Insertion réussie: %', test_result.id;
        
        -- Supprimer immédiatement le test
        DELETE FROM public.user_testimonials WHERE id = test_result.id;
    ELSE
        RAISE NOTICE 'Aucun utilisateur trouvé dans public.users';
    END IF;
END $$;

-- 6. Si vous voulez réactiver RLS plus tard avec des politiques simples
-- (NE PAS EXÉCUTER MAINTENANT SI VOUS VOULEZ TESTER SANS RLS)
/*
-- Réactiver RLS
ALTER TABLE public.user_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;

-- Créer des politiques ultra-simples
CREATE POLICY "allow_all_select" ON public.user_testimonials
    FOR SELECT USING (true);

CREATE POLICY "allow_all_insert" ON public.user_testimonials
    FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_all_update" ON public.user_testimonials
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_delete" ON public.user_testimonials
    FOR DELETE USING (true);

-- Mêmes politiques pour video_testimonials
CREATE POLICY "allow_all_select" ON public.video_testimonials
    FOR SELECT USING (true);

CREATE POLICY "allow_all_insert" ON public.video_testimonials
    FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_all_update" ON public.video_testimonials
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_delete" ON public.video_testimonials
    FOR DELETE USING (true);
*/

-- 7. Vérifier les utilisateurs
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    au.email as auth_email,
    CASE 
        WHEN au.id IS NULL THEN 'Orphelin dans public.users'
        WHEN u.id IS NULL THEN 'Manquant dans public.users'
        ELSE 'OK'
    END as status
FROM public.users u
FULL OUTER JOIN auth.users au ON u.id = au.id
ORDER BY COALESCE(u.created_at, au.created_at) DESC
LIMIT 20;

-- 8. Synchroniser les utilisateurs manquants
INSERT INTO public.users (id, email, first_name, last_name)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(au.raw_user_meta_data->>'last_name', 'User')
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(public.users.first_name, EXCLUDED.first_name),
    last_name = COALESCE(public.users.last_name, EXCLUDED.last_name);

-- 9. Vérifier à nouveau après synchronisation
SELECT 
    COUNT(*) as total_auth_users,
    (SELECT COUNT(*) FROM public.users) as total_public_users,
    COUNT(*) - (SELECT COUNT(*) FROM public.users) as difference
FROM auth.users;

-- 10. Créer une fonction de debug pour tester depuis l'app
CREATE OR REPLACE FUNCTION test_testimonial_insert()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    test_id UUID;
    error_msg TEXT;
    error_detail TEXT;
BEGIN
    -- Essayer d'insérer
    BEGIN
        INSERT INTO public.user_testimonials (
            user_id,
            testimonial_text,
            context_type,
            featured,
            background_color
        ) VALUES (
            auth.uid(),
            'Test depuis fonction SQL',
            'platform',
            false,
            '#10B981'
        ) RETURNING id INTO test_id;
        
        -- Si succès, supprimer et retourner succès
        DELETE FROM public.user_testimonials WHERE id = test_id;
        
        result := jsonb_build_object(
            'success', true,
            'message', 'Insertion réussie',
            'user_id', auth.uid(),
            'test_id', test_id
        );
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS 
            error_msg = MESSAGE_TEXT,
            error_detail = PG_EXCEPTION_DETAIL;
            
        result := jsonb_build_object(
            'success', false,
            'error', error_msg,
            'detail', error_detail,
            'user_id', auth.uid()
        );
    END;
    
    RETURN result;
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION test_testimonial_insert() TO authenticated;
GRANT EXECUTE ON FUNCTION test_testimonial_insert() TO anon;