-- Script pour vérifier et migrer validation_status si nécessaire
-- Date: 2025-09-23

-- ÉTAPE 1: Vérifier les valeurs actuelles de validation_status
SELECT 'Valeurs actuelles de validation_status:' AS info;
SELECT unnest(enum_range(NULL::validation_status)) AS current_values
ORDER BY 1;

-- Si 'live' et 'completed' sont déjà présents, le script s'arrête ici
-- Sinon, exécutez la migration ci-dessous :

/*
-- MIGRATION (décommenter et exécuter si 'live' et 'completed' manquent)

-- Étape 1: Sauvegarder les données existantes
CREATE TEMP TABLE temp_validation_backup AS
SELECT id, validation_status::TEXT as status_text
FROM public.activities
WHERE validation_status IS NOT NULL;

-- Étape 2: Supprimer la colonne
ALTER TABLE public.activities DROP COLUMN validation_status;

-- Étape 3: Supprimer l'ancien type
DROP TYPE validation_status CASCADE;

-- Étape 4: Recréer le type avec TOUS les statuts
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

-- Étape 5: Recréer la colonne
ALTER TABLE public.activities
ADD COLUMN validation_status validation_status DEFAULT 'draft';

-- Étape 6: Restaurer les données
UPDATE public.activities a
SET validation_status = b.status_text::validation_status
FROM temp_validation_backup b
WHERE a.id = b.id;

-- Étape 7: Nettoyer
DROP TABLE temp_validation_backup;

-- Vérification
SELECT 'Migration complétée!' AS status;
SELECT unnest(enum_range(NULL::validation_status)) AS new_values
ORDER BY 1;
*/