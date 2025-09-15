-- Ajout de la politique DELETE manquante pour les événements
-- Cette politique permet aux administrateurs de supprimer des événements

CREATE POLICY "Admins can delete events" ON public.events
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
            AND (valid_until IS NULL OR valid_until > NOW())
        )
    );