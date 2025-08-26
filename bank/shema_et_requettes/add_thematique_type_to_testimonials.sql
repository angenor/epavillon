-- =============================================
-- Script de migration: Créer thematique_type ENUM et l'ajouter à user_testimonials
-- Date: 2025-08-26
-- Description: Crée le type ENUM thematique_type et ajoute la colonne à user_testimonials
-- =============================================

-- 1. Créer le type ENUM thematique_type s'il n'existe pas
DO $$ 
BEGIN
    -- Vérifier si le type ENUM existe déjà
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'thematique_type') THEN
        CREATE TYPE thematique_type AS ENUM (
            'pertes_et_prejudices',
            'adaptation',
            'attenuation',
            'finance',
            'genre',
            'ace',
            'agriculture',
            'transparence',
            'mecanismes_de_cooperation',
            'bilan_mondial',
            'droits_de_l_homme_et_climat'
        );
        RAISE NOTICE 'Type ENUM thematique_type créé avec succès';
    ELSE
        RAISE NOTICE 'Le type ENUM thematique_type existe déjà';
    END IF;
END $$;

-- 2. Ajouter la colonne thematique_type si elle n'existe pas
DO $$ 
BEGIN
    -- Vérifier si la colonne existe déjà
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_testimonials' 
        AND column_name = 'thematique_type'
    ) THEN
        -- Ajouter la colonne thematique_type avec le type ENUM array
        ALTER TABLE public.user_testimonials 
        ADD COLUMN thematique_type thematique_type[] NOT NULL DEFAULT '{}';
        
        RAISE NOTICE 'Colonne thematique_type ajoutée avec succès à la table user_testimonials';
    ELSE
        RAISE NOTICE 'La colonne thematique_type existe déjà dans la table user_testimonials';
    END IF;
END $$;

-- Mise à jour de l'index existant pour inclure thematique_type si nécessaire
CREATE INDEX IF NOT EXISTS idx_testimonials_thematique_type 
ON public.user_testimonials USING GIN (thematique_type);

-- Commentaire pour documentation
COMMENT ON COLUMN public.user_testimonials.thematique_type IS 'Thématiques associées au témoignage (array de thematique_type)';

-- Afficher la structure mise à jour de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_testimonials'
ORDER BY ordinal_position;