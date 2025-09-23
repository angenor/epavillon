-- Script de migration pour mettre à jour l'enum activity_status
-- Date: 2025-09-23
-- Description: Ajouter les statuts manquants à activity_status pour aligner avec validation_status

-- Étape 1: Sauvegarder les données existantes en tant que TEXT
CREATE TEMP TABLE temp_activity_status_backup AS
SELECT id, activity_status::TEXT as activity_status_text FROM public.activities WHERE activity_status IS NOT NULL;

-- Étape 2: Supprimer la colonne existante
ALTER TABLE public.activities DROP COLUMN activity_status;

-- Étape 3: Supprimer l'ancien type enum
DROP TYPE IF EXISTS activity_status;

-- Étape 4: Créer le nouveau type enum avec tous les statuts
CREATE TYPE activity_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'cancelled',
    'live',
    'completed',
    'postponed'
);

-- Étape 5: Ajouter la colonne avec le nouveau type
ALTER TABLE public.activities ADD COLUMN activity_status activity_status DEFAULT 'draft';

-- Étape 6: Restaurer les données existantes
UPDATE public.activities a
SET activity_status = b.activity_status_text::activity_status
FROM temp_activity_status_backup b
WHERE a.id = b.id;

-- Étape 7: Nettoyer la table temporaire
DROP TABLE temp_activity_status_backup;

-- Étape 8: Ajouter un commentaire pour documenter le changement
COMMENT ON COLUMN public.activities.activity_status IS 'Statut de l''activité - aligné avec validation_status plus postponed';

-- Vérification finale
SELECT
    'Migration terminée avec succès!' AS message,
    COUNT(*) AS total_activities,
    COUNT(activity_status) AS activities_with_status
FROM public.activities;