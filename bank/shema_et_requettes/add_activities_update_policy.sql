-- =============================================
-- Script pour ajouter la politique UPDATE manquante sur la table activities
-- =============================================

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres activités
CREATE POLICY "Users can update their own activities" 
ON public.activities 
FOR UPDATE 
USING (
    submitted_by = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
)
WITH CHECK (
    submitted_by = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Politique pour permettre aux utilisateurs de supprimer (soft delete) leurs propres activités
CREATE POLICY "Users can soft delete their own activities" 
ON public.activities 
FOR UPDATE 
USING (
    submitted_by = auth.uid() 
    AND is_deleted = FALSE
)
WITH CHECK (
    submitted_by = auth.uid() 
    AND is_deleted = TRUE
);

-- Note : Ces politiques permettent :
-- 1. Aux utilisateurs de modifier leurs propres activités
-- 2. Aux admins/super_admins de modifier toutes les activités
-- 3. Aux utilisateurs de faire un soft delete de leurs propres activités non supprimées