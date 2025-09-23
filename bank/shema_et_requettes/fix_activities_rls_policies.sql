-- Script pour corriger les policies RLS sur la table activities
-- Date: 2025-09-23
-- Description: Permettre au soumetteur d'accéder à ses activités sans restriction de statut

-- Étape 1: Lister les policies existantes
SELECT 'Policies existantes:' AS info;
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'activities';

-- Étape 2: Supprimer les policies existantes problématiques
DROP POLICY IF EXISTS "Approved activities are publicly viewable" ON public.activities;
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can manage their own activities" ON public.activities;

-- Étape 3: Créer de nouvelles policies plus flexibles

-- Policy 1: Les activités approuvées, en cours et terminées sont publiques
CREATE POLICY "Public activities are viewable"
ON public.activities
FOR SELECT
USING (
  validation_status IN ('approved', 'live', 'completed')
  AND is_deleted = false
);

-- Policy 2: Le soumetteur peut TOUJOURS voir ses propres activités (peu importe le statut)
CREATE POLICY "Submitters can view own activities"
ON public.activities
FOR SELECT
USING (
  submitted_by = auth.uid()
);

-- Policy 3: Le soumetteur peut modifier ses propres activités
CREATE POLICY "Submitters can update own activities"
ON public.activities
FOR UPDATE
USING (
  submitted_by = auth.uid()
)
WITH CHECK (
  submitted_by = auth.uid()
);

-- Policy 4: Le soumetteur peut insérer de nouvelles activités
CREATE POLICY "Users can create activities"
ON public.activities
FOR INSERT
WITH CHECK (
  submitted_by = auth.uid()
);

-- Policy 5: Admins peuvent tout voir
CREATE POLICY "Admins can view all activities"
ON public.activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Policy 6: Admins peuvent tout modifier
CREATE POLICY "Admins can update all activities"
ON public.activities
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Vérification finale
SELECT 'Nouvelles policies créées:' AS info;
SELECT policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'activities'
ORDER BY policyname;