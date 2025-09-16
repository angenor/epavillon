-- Script pour ajouter la colonne acronym à la table organizations
-- Date: 2025-09-16

-- Ajouter la colonne acronym (acronyme/abbreviation) à la table organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS acronym TEXT;

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN public.organizations.acronym IS 'Acronyme de l''organisation (ex: IFDD, ONU, UNESCO)';