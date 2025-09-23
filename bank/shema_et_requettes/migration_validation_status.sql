-- Script de migration pour mettre à jour l'enum validation_status
-- Date: 2025-09-23
-- Description: S'assurer que validation_status contient tous les statuts nécessaires

-- Vérifier les valeurs actuelles de l'enum
SELECT unnest(enum_range(NULL::validation_status)) AS current_values;

-- Si 'live' et 'completed' existent déjà, ce script ne fera rien
-- Sinon, voici comment ajouter les statuts manquants :

-- OPTION 1: Si vous devez ajouter des statuts manquants
-- Note: PostgreSQL ne permet pas de modifier directement un enum, il faut le recréer

-- Étape 1: Sauvegarder les données existantes en tant que TEXT
CREATE TEMP TABLE temp_validation_status_backup AS
SELECT id, validation_status::TEXT as validation_status_text
FROM public.activities
WHERE validation_status IS NOT NULL;

-- Étape 2: Supprimer la colonne existante
ALTER TABLE public.activities DROP COLUMN validation_status;

-- Étape 3: Supprimer l'ancien type enum (CASCADE si nécessaire)
DROP TYPE IF EXISTS validation_status CASCADE;

-- Étape 4: Créer le nouveau type enum avec TOUS les statuts
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

-- Étape 5: Ajouter la colonne avec le nouveau type
ALTER TABLE public.activities
ADD COLUMN validation_status validation_status DEFAULT 'draft';

-- Étape 6: Restaurer les données existantes
UPDATE public.activities a
SET validation_status = b.validation_status_text::validation_status
FROM temp_validation_status_backup b
WHERE a.id = b.id;

-- Étape 7: Nettoyer la table temporaire
DROP TABLE temp_validation_status_backup;

-- Étape 8: Ajouter un commentaire pour documenter le changement
COMMENT ON COLUMN public.activities.validation_status IS 'Statut de validation de l''activité - inclut live et completed';

-- Vérification finale
SELECT
    'Migration terminée avec succès!' AS message,
    unnest(enum_range(NULL::validation_status)) AS statuts_disponibles;

-- Afficher le nombre d'activités par statut
SELECT
    validation_status,
    COUNT(*) AS count
FROM public.activities
GROUP BY validation_status
ORDER BY validation_status;