-- =============================================
-- Fonctions administratives pour contourner les problèmes RLS
-- =============================================

-- Supprimer d'abord toutes les politiques problématiques sur user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

-- Supprimer la fonction problématique
DROP FUNCTION IF EXISTS is_admin_user();

-- Désactiver temporairement RLS sur user_roles pour éviter la récursion
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Fonction pour vérifier si l'utilisateur actuel est admin
CREATE OR REPLACE FUNCTION check_user_admin_status(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN := FALSE;
BEGIN
  -- Vérification directe sans politique RLS
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = COALESCE($1, auth.uid())
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les rôles d'un utilisateur (pour les admins)
CREATE OR REPLACE FUNCTION get_user_roles_admin(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  role user_role_type,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN
) AS $$
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT check_user_admin_status() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  RETURN QUERY
  SELECT ur.id, ur.role, ur.assigned_by, ur.assigned_at, ur.valid_until, ur.is_active
  FROM public.user_roles ur
  WHERE ur.user_id = target_user_id
  ORDER BY ur.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter un rôle (pour les admins)
CREATE OR REPLACE FUNCTION add_user_role_admin(
  target_user_id UUID,
  role_type user_role_type,
  valid_until TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_role_id UUID;
  current_admin_id UUID;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT check_user_admin_status() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Obtenir l'ID de l'admin actuel
  SELECT auth.uid() INTO current_admin_id;

  -- Vérifier si l'utilisateur a déjà ce rôle actif
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = target_user_id
    AND ur.role = role_type
    AND ur.is_active = true
  ) THEN
    RAISE EXCEPTION 'L''utilisateur possède déjà ce rôle';
  END IF;

  -- Insérer le nouveau rôle
  INSERT INTO public.user_roles (user_id, role, assigned_by, valid_until, is_active)
  VALUES (target_user_id, role_type, current_admin_id, valid_until, true)
  RETURNING id INTO new_role_id;

  RETURN new_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour supprimer un rôle (pour les admins)
CREATE OR REPLACE FUNCTION remove_user_role_admin(role_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT check_user_admin_status() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Désactiver le rôle
  UPDATE public.user_roles
  SET is_active = false
  WHERE id = role_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour réactiver un rôle (pour les admins)
CREATE OR REPLACE FUNCTION activate_user_role_admin(role_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT check_user_admin_status() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Réactiver le rôle
  UPDATE public.user_roles
  SET is_active = true
  WHERE id = role_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;