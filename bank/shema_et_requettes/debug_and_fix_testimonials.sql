-- =============================================
-- Script de debug et correction pour les témoignages
-- =============================================

-- 1. Vérifier l'état actuel des politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('user_testimonials', 'video_testimonials')
ORDER BY tablename, policyname;

-- 2. Vérifier si RLS est activé sur les tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_testimonials', 'video_testimonials');

-- 3. Désactiver temporairement RLS pour tester (DANGER: À NE PAS FAIRE EN PRODUCTION)
-- ALTER TABLE public.user_testimonials DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.video_testimonials DISABLE ROW LEVEL SECURITY;

-- 4. Supprimer TOUTES les anciennes politiques
DROP POLICY IF EXISTS "Testimonials are viewable by all" ON public.user_testimonials;
DROP POLICY IF EXISTS "Users can create testimonials" ON public.user_testimonials;
DROP POLICY IF EXISTS "All testimonials are viewable by everyone" ON public.user_testimonials;
DROP POLICY IF EXISTS "Authenticated users can create testimonials" ON public.user_testimonials;
DROP POLICY IF EXISTS "Users can update their own testimonials" ON public.user_testimonials;
DROP POLICY IF EXISTS "Users can delete their own testimonials" ON public.user_testimonials;
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON public.user_testimonials;

-- 5. Créer une politique simple et permissive pour user_testimonials
-- Politique pour SELECT (tout le monde peut lire)
CREATE POLICY "anyone_can_read_testimonials" 
ON public.user_testimonials
FOR SELECT 
USING (true);

-- Politique pour INSERT (utilisateurs authentifiés seulement)
CREATE POLICY "authenticated_can_insert_testimonials" 
ON public.user_testimonials
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politique pour UPDATE (propriétaire seulement)
CREATE POLICY "users_can_update_own_testimonials" 
ON public.user_testimonials
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politique pour DELETE (propriétaire seulement)
CREATE POLICY "users_can_delete_own_testimonials" 
ON public.user_testimonials
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 6. Activer RLS sur user_testimonials
ALTER TABLE public.user_testimonials ENABLE ROW LEVEL SECURITY;

-- 7. Créer des politiques pour video_testimonials
DROP POLICY IF EXISTS "Approved video testimonials are viewable by all" ON public.video_testimonials;
DROP POLICY IF EXISTS "Users can view their own video testimonials" ON public.video_testimonials;
DROP POLICY IF EXISTS "Users can create video testimonials" ON public.video_testimonials;
DROP POLICY IF EXISTS "Users can update their own video testimonials" ON public.video_testimonials;
DROP POLICY IF EXISTS "Admins can manage all video testimonials" ON public.video_testimonials;

-- Politique simple pour video_testimonials
CREATE POLICY "anyone_can_read_videos" 
ON public.video_testimonials
FOR SELECT 
USING (true);

CREATE POLICY "authenticated_can_insert_videos" 
ON public.video_testimonials
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_videos" 
ON public.video_testimonials
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_videos" 
ON public.video_testimonials
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 8. Activer RLS sur video_testimonials
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;

-- 9. Fonction de test pour vérifier l'authentification
CREATE OR REPLACE FUNCTION test_auth_and_insert()
RETURNS TABLE (
    current_user_id UUID,
    current_role TEXT,
    is_authenticated BOOLEAN,
    can_insert_testimonial BOOLEAN,
    user_exists_in_public BOOLEAN
) 
SECURITY DEFINER
AS $$
DECLARE
    test_insert_result BOOLEAN;
BEGIN
    -- Test si on peut insérer
    BEGIN
        INSERT INTO public.user_testimonials (
            user_id, 
            testimonial_text, 
            context_type,
            featured
        ) VALUES (
            auth.uid(), 
            'TEST - À SUPPRIMER', 
            'platform',
            false
        );
        
        -- Si on arrive ici, l'insertion a réussi
        test_insert_result := true;
        
        -- Supprimer immédiatement le test
        DELETE FROM public.user_testimonials 
        WHERE testimonial_text = 'TEST - À SUPPRIMER' 
        AND user_id = auth.uid();
        
    EXCEPTION WHEN OTHERS THEN
        test_insert_result := false;
    END;
    
    RETURN QUERY
    SELECT 
        auth.uid() as current_user_id,
        current_setting('request.jwt.claim.role', true)::TEXT as current_role,
        (auth.uid() IS NOT NULL) as is_authenticated,
        test_insert_result as can_insert_testimonial,
        EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid()) as user_exists_in_public;
END;
$$ LANGUAGE plpgsql;

-- 10. Donner les permissions pour exécuter la fonction
GRANT EXECUTE ON FUNCTION test_auth_and_insert() TO authenticated;
GRANT EXECUTE ON FUNCTION test_auth_and_insert() TO anon;

-- 11. Test de la fonction (à exécuter séparément)
-- SELECT * FROM test_auth_and_insert();

-- 12. Vérifier les utilisateurs existants
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.created_at,
    au.email as auth_email,
    au.created_at as auth_created_at
FROM public.users u
FULL OUTER JOIN auth.users au ON u.id = au.id
ORDER BY COALESCE(u.created_at, au.created_at) DESC
LIMIT 10;

-- 13. Si nécessaire, synchroniser les utilisateurs manquants
INSERT INTO public.users (id, email, first_name, last_name, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(au.raw_user_meta_data->>'last_name', 'User'),
    au.created_at
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- 14. Vérifier le résultat
SELECT COUNT(*) as total_auth_users FROM auth.users;
SELECT COUNT(*) as total_public_users FROM public.users;
SELECT COUNT(*) as orphaned_auth_users 
FROM auth.users au 
LEFT JOIN public.users u ON au.id = u.id 
WHERE u.id IS NULL;