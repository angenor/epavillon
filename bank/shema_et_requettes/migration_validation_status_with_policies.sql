-- Script de migration pour mettre à jour l'enum validation_status avec gestion des policies
-- Date: 2025-09-23
-- Description: Ajouter 'live' et 'completed' à validation_status en gérant les dépendances RLS

-- Vérifier les valeurs actuelles
SELECT 'Valeurs actuelles:' AS info, unnest(enum_range(NULL::validation_status)) AS current_values;

-- Étape 1: Sauvegarder les policies existantes
CREATE TEMP TABLE temp_policies AS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'activities'
AND qual::text LIKE '%validation_status%';

-- Afficher les policies sauvegardées
SELECT 'Policies sauvegardées:' AS info, policyname FROM temp_policies;

-- Étape 2: Désactiver temporairement RLS sur la table
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;

-- Étape 3: Supprimer les policies qui dépendent de validation_status
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN SELECT policyname FROM temp_policies
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.activities', policy_record.policyname);
    END LOOP;
END $$;

-- Étape 4: Sauvegarder les données existantes
CREATE TEMP TABLE temp_validation_backup AS
SELECT id, validation_status::TEXT as status_text
FROM public.activities
WHERE validation_status IS NOT NULL;

-- Étape 5: Supprimer la colonne
ALTER TABLE public.activities DROP COLUMN validation_status;

-- Étape 6: Supprimer l'ancien type enum
DROP TYPE validation_status CASCADE;

-- Étape 7: Créer le nouveau type enum avec tous les statuts
CREATE TYPE validation_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'cancelled',
    'live',
    'completed'
);

-- Étape 8: Recréer la colonne
ALTER TABLE public.activities
ADD COLUMN validation_status validation_status DEFAULT 'draft';

-- Étape 9: Restaurer les données
UPDATE public.activities a
SET validation_status = b.status_text::validation_status
FROM temp_validation_backup b
WHERE a.id = b.id;

-- Étape 10: Recréer les policies principales
-- Policy pour les activités approuvées publiquement visibles
CREATE POLICY "Approved activities are publicly viewable"
ON public.activities
FOR SELECT
USING (validation_status IN ('approved', 'live', 'completed'));

-- Étape 11: Réactiver RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Étape 12: Nettoyer les tables temporaires
DROP TABLE temp_validation_backup;
DROP TABLE temp_policies;

-- Étape 13: Ajouter un commentaire
COMMENT ON COLUMN public.activities.validation_status IS 'Statut de validation - inclut maintenant live et completed';

-- Vérification finale
SELECT
    'Migration terminée!' AS status,
    unnest(enum_range(NULL::validation_status))::text AS nouveaux_statuts
ORDER BY 2;

-- Compter les activités par statut
SELECT
    validation_status,
    COUNT(*) as count
FROM public.activities
GROUP BY validation_status
ORDER BY validation_status;