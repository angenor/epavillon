-- =============================================
-- Solution pour les fonctions administratives (version 2)
-- =============================================

-- Nettoyer d'abord
DROP FUNCTION IF EXISTS check_user_admin_status(UUID);
DROP FUNCTION IF EXISTS get_user_roles_admin(UUID);
DROP FUNCTION IF EXISTS add_user_role_admin(UUID, user_role_type, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS remove_user_role_admin(UUID);
DROP FUNCTION IF EXISTS activate_user_role_admin(UUID);

-- Réactiver RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Créer une politique simple pour permettre la lecture de ses propres rôles
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Fonction pour récupérer les rôles de l'utilisateur actuel (sans restriction admin)
CREATE OR REPLACE FUNCTION get_current_user_roles()
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
  WHERE ur.user_id = auth.uid()
  ORDER BY ur.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les rôles de n'importe quel utilisateur (réservée aux admins)
CREATE OR REPLACE FUNCTION get_any_user_roles(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  role user_role_type,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN
) AS $$
DECLARE
  caller_is_admin BOOLEAN := FALSE;
BEGIN
  -- Vérifier si l'appelant est admin (requête directe)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
  ) INTO caller_is_admin;

  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Accès non autorisé - droits administrateur requis';
  END IF;

  RETURN QUERY
  SELECT ur.id, ur.role, ur.assigned_by, ur.assigned_at, ur.valid_until, ur.is_active
  FROM public.user_roles ur
  WHERE ur.user_id = target_user_id
  ORDER BY ur.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter un rôle (réservée aux admins)
CREATE OR REPLACE FUNCTION add_role_to_user(
  target_user_id UUID,
  role_type user_role_type,
  valid_until TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_role_id UUID;
  caller_is_admin BOOLEAN := FALSE;
  current_admin_id UUID;
BEGIN
  -- Vérifier si l'appelant est admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
  ) INTO caller_is_admin;

  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Accès non autorisé - droits administrateur requis';
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

-- Fonction pour supprimer un rôle (réservée aux admins)
CREATE OR REPLACE FUNCTION deactivate_user_role(role_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  caller_is_admin BOOLEAN := FALSE;
BEGIN
  -- Vérifier si l'appelant est admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
  ) INTO caller_is_admin;

  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Accès non autorisé - droits administrateur requis';
  END IF;

  -- Désactiver le rôle
  UPDATE public.user_roles
  SET is_active = false
  WHERE id = role_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour réactiver un rôle (réservée aux admins)
CREATE OR REPLACE FUNCTION reactivate_user_role(role_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  caller_is_admin BOOLEAN := FALSE;
BEGIN
  -- Vérifier si l'appelant est admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
  ) INTO caller_is_admin;

  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Accès non autorisé - droits administrateur requis';
  END IF;

  -- Réactiver le rôle
  UPDATE public.user_roles
  SET is_active = true
  WHERE id = role_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;