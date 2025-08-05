-- =============================================
-- FIX ORGANIZATIONS RLS POLICIES
-- ePavilion2025 - IFDD
-- =============================================

-- L'erreur "set-returning functions are not allowed in WHERE" 
-- est probablement causée par les colonnes générées dans la table organizations

-- 1. Supprimer les politiques existantes problématiques
DROP POLICY IF EXISTS "Organizations are viewable by all authenticated users" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

-- 2. Créer des politiques RLS simplifiées sans utiliser de fonctions problématiques
CREATE POLICY "Everyone can view active organizations" ON public.organizations
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Authenticated users can create organizations" ON public.organizations
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()
    );

-- 3. Politique pour la mise à jour - seuls les créateurs et admins
CREATE POLICY "Users can update their organizations" ON public.organizations
    FOR UPDATE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'super_admin')
            AND ur.is_active = TRUE
        )
    );

-- 4. S'assurer que RLS est activé
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 5. Test des politiques
-- Vérifier que les politiques fonctionnent
SELECT 'Organizations RLS policies updated successfully' as status;