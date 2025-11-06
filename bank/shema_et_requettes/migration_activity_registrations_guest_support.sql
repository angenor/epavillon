-- =============================================
-- Migration: Support des inscriptions Guest pour activity_registrations
-- Date: 2025-11-06
-- Description: Permet aux utilisateurs non authentifiés de s'inscrire aux activités
-- =============================================

-- 1. Créer le type ENUM pour le type d'inscription
CREATE TYPE registration_type AS ENUM ('user', 'guest');

-- 2. Modifier la table activity_registrations
ALTER TABLE public.activity_registrations
  -- Rendre user_id nullable pour permettre les guests
  ALTER COLUMN user_id DROP NOT NULL,

  -- Ajouter les colonnes pour les données guest
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_first_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_last_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_organization TEXT,
  ADD COLUMN IF NOT EXISTS guest_country_id UUID REFERENCES public.countries(id),

  -- Ajouter le type d'inscription
  ADD COLUMN IF NOT EXISTS registration_type registration_type DEFAULT 'user',

  -- Ajouter l'ID du registrant Zoom
  ADD COLUMN IF NOT EXISTS zoom_registrant_id TEXT,

  -- Renommer personal_join_url en zoom_join_url pour plus de clarté
  ADD COLUMN IF NOT EXISTS zoom_join_url TEXT;

-- 3. Copier les données de personal_join_url vers zoom_join_url si la colonne existe
UPDATE public.activity_registrations
SET zoom_join_url = personal_join_url
WHERE zoom_join_url IS NULL AND personal_join_url IS NOT NULL;

-- 4. Modifier la contrainte UNIQUE pour supporter les guests
-- Supprimer l'ancienne contrainte
ALTER TABLE public.activity_registrations
  DROP CONSTRAINT IF EXISTS activity_registrations_activity_id_user_id_key;

-- Créer une nouvelle contrainte unique partielle pour les utilisateurs authentifiés
CREATE UNIQUE INDEX IF NOT EXISTS activity_registrations_user_unique
  ON public.activity_registrations(activity_id, user_id)
  WHERE user_id IS NOT NULL;

-- Créer une contrainte unique partielle pour les guests (par email)
CREATE UNIQUE INDEX IF NOT EXISTS activity_registrations_guest_unique
  ON public.activity_registrations(activity_id, guest_email)
  WHERE guest_email IS NOT NULL AND user_id IS NULL;

-- 5. Ajouter une contrainte CHECK pour s'assurer qu'au moins user_id OU guest_email est renseigné
ALTER TABLE public.activity_registrations
  ADD CONSTRAINT check_user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_email IS NULL) OR
    (user_id IS NULL AND guest_email IS NOT NULL)
  );

-- 6. Ajouter une contrainte CHECK pour s'assurer que les données guest sont cohérentes
ALTER TABLE public.activity_registrations
  ADD CONSTRAINT check_guest_data CHECK (
    (user_id IS NOT NULL) OR
    (user_id IS NULL AND guest_email IS NOT NULL AND guest_first_name IS NOT NULL AND guest_last_name IS NOT NULL)
  );

-- 7. Commentaires sur les colonnes
COMMENT ON COLUMN public.activity_registrations.user_id IS 'ID de l''utilisateur authentifié (NULL pour les guests)';
COMMENT ON COLUMN public.activity_registrations.guest_email IS 'Email du guest (NULL pour les utilisateurs authentifiés)';
COMMENT ON COLUMN public.activity_registrations.guest_first_name IS 'Prénom du guest';
COMMENT ON COLUMN public.activity_registrations.guest_last_name IS 'Nom du guest';
COMMENT ON COLUMN public.activity_registrations.guest_organization IS 'Organisation du guest';
COMMENT ON COLUMN public.activity_registrations.guest_country_id IS 'Pays du guest';
COMMENT ON COLUMN public.activity_registrations.registration_type IS 'Type d''inscription: user (authentifié) ou guest (non authentifié)';
COMMENT ON COLUMN public.activity_registrations.zoom_registrant_id IS 'ID du registrant dans Zoom';
COMMENT ON COLUMN public.activity_registrations.zoom_join_url IS 'URL personnalisée pour rejoindre la réunion Zoom';

-- 8. (Optionnel) Supprimer l'ancienne colonne personal_join_url si elle existe toujours
-- ATTENTION: Décommenter uniquement après avoir vérifié que zoom_join_url contient toutes les données
-- ALTER TABLE public.activity_registrations DROP COLUMN IF EXISTS personal_join_url;

-- =============================================
-- Rollback (si nécessaire)
-- =============================================
-- Pour annuler cette migration, exécuter:
-- DROP INDEX IF EXISTS activity_registrations_user_unique;
-- DROP INDEX IF EXISTS activity_registrations_guest_unique;
-- ALTER TABLE public.activity_registrations DROP CONSTRAINT IF EXISTS check_user_or_guest;
-- ALTER TABLE public.activity_registrations DROP CONSTRAINT IF EXISTS check_guest_data;
-- ALTER TABLE public.activity_registrations
--   DROP COLUMN IF EXISTS guest_email,
--   DROP COLUMN IF EXISTS guest_first_name,
--   DROP COLUMN IF EXISTS guest_last_name,
--   DROP COLUMN IF EXISTS guest_organization,
--   DROP COLUMN IF EXISTS guest_country_id,
--   DROP COLUMN IF EXISTS registration_type,
--   DROP COLUMN IF EXISTS zoom_registrant_id,
--   DROP COLUMN IF EXISTS zoom_join_url,
--   ALTER COLUMN user_id SET NOT NULL;
-- DROP TYPE IF EXISTS registration_type;
