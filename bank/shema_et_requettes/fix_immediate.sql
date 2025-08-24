-- =============================================
-- FIX IMMÉDIAT - Supprime toutes les politiques problématiques
-- =============================================

-- Supprimer TOUTES les politiques sur user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

-- Désactiver complètement RLS sur user_roles temporairement
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Fonction simple pour récupérer les rôles (sans vérification admin)
CREATE OR REPLACE FUNCTION get_user_roles_simple(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  role user_role_type,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT ur.id, ur.role, ur.assigned_by, ur.assigned_at, ur.valid_until, ur.is_active
  FROM public.user_roles ur
  WHERE ur.user_id = target_user_id
  ORDER BY ur.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction simple pour ajouter un rôle (sans vérification complexe)
CREATE OR REPLACE FUNCTION add_role_simple(
  target_user_id UUID,
  role_type user_role_type,
  valid_until TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_role_id UUID;
BEGIN
  -- Insérer le nouveau rôle
  INSERT INTO public.user_roles (user_id, role, assigned_by, valid_until, is_active)
  VALUES (target_user_id, role_type, auth.uid(), valid_until, true)
  RETURNING id INTO new_role_id;

  RETURN new_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction simple pour désactiver un rôle
CREATE OR REPLACE FUNCTION deactivate_role_simple(role_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_roles
  SET is_active = false
  WHERE id = role_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction simple pour réactiver un rôle
CREATE OR REPLACE FUNCTION reactivate_role_simple(role_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_roles
  SET is_active = true
  WHERE id = role_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour modifier la date d'expiration d'un rôle
CREATE OR REPLACE FUNCTION update_role_expiry_simple(
  role_id UUID,
  new_valid_until TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_roles
  SET valid_until = new_valid_until
  WHERE id = role_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;