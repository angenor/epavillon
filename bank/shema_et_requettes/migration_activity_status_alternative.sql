-- Script de migration alternatif (plus simple)
-- Date: 2025-09-23
-- Description: Utiliser uniquement validation_status et supprimer activity_status

-- Option Alternative : Supprimer activity_status et utiliser uniquement validation_status
-- Cette option est recommandée car validation_status contient déjà tous les statuts nécessaires

-- Étape 1: Migrer les données de activity_status vers validation_status si nécessaire
UPDATE public.activities
SET validation_status =
    CASE
        WHEN activity_status = 'live' THEN 'live'::validation_status
        WHEN activity_status = 'completed' THEN 'completed'::validation_status
        WHEN activity_status = 'postponed' THEN 'cancelled'::validation_status -- ou créer un nouveau statut
        ELSE validation_status
    END
WHERE activity_status IS NOT NULL;

-- Étape 2: Supprimer la colonne activity_status
ALTER TABLE public.activities DROP COLUMN IF EXISTS activity_status;

-- Étape 3: Supprimer le type enum activity_status
DROP TYPE IF EXISTS activity_status;

-- Étape 4: Si vous voulez ajouter 'postponed' à validation_status
-- Attention: Cette opération nécessite de recréer le type enum
/*
-- Sauvegarder les données
CREATE TEMP TABLE temp_validation_status AS
SELECT id, validation_status FROM public.activities;

-- Supprimer la colonne
ALTER TABLE public.activities DROP COLUMN validation_status;

-- Supprimer l'ancien type
DROP TYPE validation_status;

-- Créer le nouveau type avec 'postponed'
CREATE TYPE validation_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'cancelled',
    'postponed',  -- Nouveau statut
    'live',
    'completed'
);

-- Ajouter la colonne avec le nouveau type
ALTER TABLE public.activities ADD COLUMN validation_status validation_status DEFAULT 'draft';

-- Restaurer les données
UPDATE public.activities a
SET validation_status = b.validation_status::text::validation_status
FROM temp_validation_status b
WHERE a.id = b.id;

-- Nettoyer
DROP TABLE temp_validation_status;
*/

-- Vérification finale
SELECT
    'Migration terminée!' AS message,
    COUNT(*) AS total,
    validation_status,
    COUNT(*) AS count
FROM public.activities
GROUP BY validation_status
ORDER BY validation_status;