-- =============================================
-- Correction des politiques RLS pour user_roles
-- Permet aux admins de gérer les rôles des utilisateurs
-- =============================================

-- Politique pour permettre aux admins de voir tous les rôles
CREATE POLICY "Admins can view all user roles" ON public.user_roles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
  )
);

-- Politique pour permettre aux admins d'ajouter des rôles
CREATE POLICY "Admins can insert user roles" ON public.user_roles
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
  )
);

-- Politique pour permettre aux admins de modifier des rôles (désactiver/activer)
CREATE POLICY "Admins can update user roles" ON public.user_roles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
  )
);

-- Politique pour permettre aux admins de supprimer des rôles
CREATE POLICY "Admins can delete user roles" ON public.user_roles
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
  )
);