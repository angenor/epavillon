-- Migration pour supprimer le champ 'sexe' de activity_registrations
-- Objectif: Retirer la collecte du genre de l'utilisateur lors de l'inscription aux activités
-- Date: 2025-11-15

-- Supprimer la colonne sexe
ALTER TABLE public.activity_registrations
DROP COLUMN IF EXISTS sexe;
