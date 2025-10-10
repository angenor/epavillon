-- =============================================
-- MIGRATION: Ajouter la politique DELETE pour revisionniste_activity_views
-- Date: 2025-10-10
-- Description: Permet aux révisionnistes de supprimer leurs propres vues d'activités (marquer comme non-lu)
-- =============================================

-- Supprimer la politique si elle existe déjà
DROP POLICY IF EXISTS "Revisionists can delete own activity views" ON public.revisionniste_activity_views;

-- Politique pour permettre aux révisionnistes de supprimer leurs propres vues d'activités
CREATE POLICY "Revisionists can delete own activity views" ON public.revisionniste_activity_views
    FOR DELETE USING (
        -- Les révisionnistes peuvent supprimer leurs propres vues
        (revisionniste_id = auth.uid()
         AND EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'revisionniste'
            AND is_active = true
        ))
        -- Les admins peuvent supprimer n'importe quelle vue
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- =============================================
-- COMMENTAIRE DE DOCUMENTATION
-- =============================================

COMMENT ON POLICY "Revisionists can delete own activity views" ON public.revisionniste_activity_views IS
'Permet aux révisionnistes de supprimer leurs propres enregistrements de vues pour marquer une activité comme non-lue';

-- =============================================
-- FIN DE LA MIGRATION
-- =============================================
