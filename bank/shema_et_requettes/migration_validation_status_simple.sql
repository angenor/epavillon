-- Script de migration SIMPLE pour validation_status
-- Date: 2025-09-23
-- Option la plus simple : Utiliser ALTER TYPE pour ajouter des valeurs

-- PostgreSQL 10+ permet d'ajouter des valeurs à un ENUM existant
-- Cette méthode est plus simple et ne nécessite pas de supprimer/recréer

-- Vérifier les valeurs actuelles
SELECT 'Valeurs actuelles:' AS info;
SELECT unnest(enum_range(NULL::validation_status))::text AS current_values
ORDER BY 1;

-- Ajouter 'live' s'il n'existe pas
DO $$
BEGIN
    -- Vérifier si 'live' existe déjà
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumtypid = 'validation_status'::regtype
        AND enumlabel = 'live'
    ) THEN
        ALTER TYPE validation_status ADD VALUE IF NOT EXISTS 'live' AFTER 'cancelled';
        RAISE NOTICE 'Ajout du statut: live';
    ELSE
        RAISE NOTICE 'Le statut live existe déjà';
    END IF;
END $$;

-- Ajouter 'completed' s'il n'existe pas
DO $$
BEGIN
    -- Vérifier si 'completed' existe déjà
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumtypid = 'validation_status'::regtype
        AND enumlabel = 'completed'
    ) THEN
        ALTER TYPE validation_status ADD VALUE IF NOT EXISTS 'completed' AFTER 'live';
        RAISE NOTICE 'Ajout du statut: completed';
    ELSE
        RAISE NOTICE 'Le statut completed existe déjà';
    END IF;
END $$;

-- Vérification finale
SELECT 'Valeurs après migration:' AS info;
SELECT unnest(enum_range(NULL::validation_status))::text AS final_values
ORDER BY 1;

-- Note importante
SELECT 'NOTE: Les nouvelles valeurs sont disponibles immédiatement pour les INSERT/UPDATE' AS info;