-- Supprimer toutes les politiques sur user_roles pour recommencer
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Créer seulement la politique simple pour que chaque utilisateur puisse voir ses propres rôles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());