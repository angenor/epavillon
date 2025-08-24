-- =============================================
-- Correction des politiques RLS pour user_roles
-- Suppression des politiques récursives et création de politiques sécurisées
-- =============================================

-- Supprimer toutes les politiques existantes sur user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

-- Créer une fonction pour vérifier si l'utilisateur courant est admin
-- Cette fonction évite la récursion en utilisant une requête directe
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nouvelles politiques sans récursion
-- Politique pour que les utilisateurs voient leurs propres rôles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Politique pour que les admins voient tous les rôles
CREATE POLICY "Admins can view all user roles" ON public.user_roles
FOR SELECT USING (is_admin_user());

-- Politique pour que les admins puissent ajouter des rôles
CREATE POLICY "Admins can insert user roles" ON public.user_roles
FOR INSERT WITH CHECK (is_admin_user());

-- Politique pour que les admins puissent modifier des rôles
CREATE POLICY "Admins can update user roles" ON public.user_roles
FOR UPDATE USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Politique pour que les admins puissent supprimer des rôles
CREATE POLICY "Admins can delete user roles" ON public.user_roles
FOR DELETE USING (is_admin_user());