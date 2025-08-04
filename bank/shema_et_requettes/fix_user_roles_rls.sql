-- Vérifier les politiques existantes sur user_roles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_roles';

-- Ajouter une politique RLS pour permettre aux utilisateurs de lire leurs propres rôles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Permettre aux admins de voir tous les rôles
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'super_admin')
        AND ur.is_active = true
    )
);