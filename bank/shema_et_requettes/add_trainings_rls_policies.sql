-- =============================================
-- Politiques RLS pour la table trainings
-- Permet aux admins de créer, modifier et supprimer des formations
-- =============================================

-- Vérifier si RLS est activé sur la table trainings
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture publique des formations actives
DROP POLICY IF EXISTS "Active trainings are publicly viewable" ON public.trainings;
CREATE POLICY "Active trainings are publicly viewable" ON public.trainings
    FOR SELECT
    USING (is_active = true);

-- Politique pour que les admins puissent tout voir
DROP POLICY IF EXISTS "Admins can view all trainings" ON public.trainings;
CREATE POLICY "Admins can view all trainings" ON public.trainings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
            AND (valid_until IS NULL OR valid_until > NOW())
        )
    );

-- Politique pour que les admins puissent créer des formations
DROP POLICY IF EXISTS "Admins can create trainings" ON public.trainings;
CREATE POLICY "Admins can create trainings" ON public.trainings
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'trainer')
            AND is_active = true
            AND (valid_until IS NULL OR valid_until > NOW())
        )
    );

-- Politique pour que les admins et créateurs puissent modifier des formations
DROP POLICY IF EXISTS "Admins and creators can update trainings" ON public.trainings;
CREATE POLICY "Admins and creators can update trainings" ON public.trainings
    FOR UPDATE
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
            AND (valid_until IS NULL OR valid_until > NOW())
        )
    )
    WITH CHECK (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
            AND (valid_until IS NULL OR valid_until > NOW())
        )
    );

-- Politique pour que les admins puissent supprimer des formations
DROP POLICY IF EXISTS "Admins can delete trainings" ON public.trainings;
CREATE POLICY "Admins can delete trainings" ON public.trainings
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
            AND (valid_until IS NULL OR valid_until > NOW())
        )
    );

-- Commentaires pour la documentation
COMMENT ON POLICY "Active trainings are publicly viewable" ON public.trainings IS
    'Permet à tout le monde de voir les formations actives';

COMMENT ON POLICY "Admins can view all trainings" ON public.trainings IS
    'Permet aux admins de voir toutes les formations, même inactives';

COMMENT ON POLICY "Admins can create trainings" ON public.trainings IS
    'Permet aux admins et formateurs de créer des formations';

COMMENT ON POLICY "Admins and creators can update trainings" ON public.trainings IS
    'Permet aux admins et créateurs de modifier les formations';

COMMENT ON POLICY "Admins can delete trainings" ON public.trainings IS
    'Permet aux admins de supprimer des formations';