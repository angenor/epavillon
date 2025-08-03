-- =============================================
-- Script corrigé pour les politiques RLS de la table users
-- Version 2 : Gestion de l'inscription
-- =============================================

-- 1. Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;

-- 2. S'assurer que RLS est activé
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Créer une politique spéciale pour l'inscription
-- Cette politique permet l'insertion si l'ID correspond à celui de l'utilisateur qui vient de s'inscrire
CREATE POLICY "Allow users to insert their own profile during signup" 
ON public.users 
FOR INSERT 
WITH CHECK (
  -- Permettre l'insertion si l'ID correspond à l'utilisateur qui vient de s'authentifier
  auth.uid() = id
);

-- 4. Politique pour la lecture du profil
CREATE POLICY "Users can read own profile" 
ON public.users 
FOR SELECT 
USING (
  auth.uid() = id OR
  -- Optionnel : permettre la lecture des profils publics
  (networking_visibility = true AND auth.role() = 'authenticated')
);

-- 5. Politique pour la mise à jour
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Politique pour les administrateurs
CREATE POLICY "Admins can do everything" 
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

-- 7. Alternative : Si les politiques ci-dessus ne fonctionnent pas,
-- créer une fonction RPC pour gérer l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    country_id,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    null, -- country_id sera mis à jour plus tard
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Vérifier les politiques
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;