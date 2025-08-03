-- =============================================
-- Script pour corriger les politiques RLS de la table users
-- =============================================

-- 1. Désactiver temporairement RLS pour la table users (si nécessaire pour le debug)
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile on signup" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication users" ON public.users;

-- 3. Activer RLS sur la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Créer les nouvelles politiques

-- Politique pour permettre l'insertion lors de l'inscription
-- Cette politique est cruciale pour permettre aux nouveaux utilisateurs de créer leur profil
CREATE POLICY "Enable insert for authenticated users during signup" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique optionnelle : permettre à tous les utilisateurs authentifiés de voir les profils publics
-- (à activer selon les besoins de l'application)
CREATE POLICY "Authenticated users can view public profiles" 
ON public.users FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND networking_visibility = true
);

-- 5. Politique pour les administrateurs (optionnel)
CREATE POLICY "Admins have full access to users" 
ON public.users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- 6. Vérifier que les politiques sont bien créées
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
WHERE tablename = 'users' 
ORDER BY policyname;

-- Note importante : 
-- Assurez-vous que la fonction auth.uid() retourne bien l'ID de l'utilisateur
-- lors de l'inscription. Si ce n'est pas le cas, vous devrez peut-être
-- utiliser une approche différente comme un trigger ou une fonction RPC.