-- Migration: Support des inscriptions sans authentification
-- Objectif: Permettre aux utilisateurs non authentifiés de s'inscrire aux activités via Zoom
-- Date: 2025-11-03
-- Auteur: IFDD Team

-- ============================================================================
-- ÉTAPE 1: Modification de la structure de la table activity_registrations
-- ============================================================================

-- 1.1 Rendre user_id nullable pour permettre les inscriptions guest
ALTER TABLE public.activity_registrations
  ALTER COLUMN user_id DROP NOT NULL;

-- 1.2 Ajouter des champs pour les informations des participants non authentifiés
ALTER TABLE public.activity_registrations
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_first_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_last_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_organization TEXT,
  ADD COLUMN IF NOT EXISTS guest_country_id UUID REFERENCES public.countries(id),
  ADD COLUMN IF NOT EXISTS zoom_registrant_id TEXT,
  ADD COLUMN IF NOT EXISTS zoom_join_url TEXT,
  ADD COLUMN IF NOT EXISTS registration_type TEXT DEFAULT 'guest',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 1.3 Ajouter des commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN public.activity_registrations.guest_email IS 'Email du participant (pour utilisateurs non authentifiés)';
COMMENT ON COLUMN public.activity_registrations.guest_first_name IS 'Prénom du participant (pour utilisateurs non authentifiés)';
COMMENT ON COLUMN public.activity_registrations.guest_last_name IS 'Nom du participant (pour utilisateurs non authentifiés)';
COMMENT ON COLUMN public.activity_registrations.guest_organization IS 'Organisation du participant (optionnel)';
COMMENT ON COLUMN public.activity_registrations.guest_country_id IS 'Pays du participant (optionnel)';
COMMENT ON COLUMN public.activity_registrations.zoom_registrant_id IS 'ID du participant retourné par l''API Zoom lors de l''inscription';
COMMENT ON COLUMN public.activity_registrations.zoom_join_url IS 'URL personnalisée pour rejoindre la réunion Zoom';
COMMENT ON COLUMN public.activity_registrations.registration_type IS 'Type d''inscription: "user" (authentifié) ou "guest" (non authentifié)';

-- ============================================================================
-- ÉTAPE 2: Modification des contraintes
-- ============================================================================

-- 2.1 Supprimer l'ancienne contrainte UNIQUE sur (activity_id, user_id)
ALTER TABLE public.activity_registrations
  DROP CONSTRAINT IF EXISTS activity_registrations_activity_id_user_id_key;

-- 2.2 Créer une contrainte UNIQUE conditionnelle pour les utilisateurs authentifiés
-- Un utilisateur authentifié ne peut s'inscrire qu'une seule fois à une activité
CREATE UNIQUE INDEX IF NOT EXISTS activity_registrations_user_unique
  ON public.activity_registrations(activity_id, user_id)
  WHERE user_id IS NOT NULL;

-- 2.3 Créer une contrainte UNIQUE pour éviter les doublons d'email guest
-- Un même email guest ne peut s'inscrire qu'une seule fois à une activité
CREATE UNIQUE INDEX IF NOT EXISTS activity_registrations_guest_email_unique
  ON public.activity_registrations(activity_id, LOWER(guest_email))
  WHERE user_id IS NULL AND guest_email IS NOT NULL;

-- 2.4 Ajouter une contrainte CHECK pour valider les données
-- Soit user_id est présent (utilisateur authentifié)
-- Soit les champs guest (email, prénom, nom) sont présents (utilisateur non authentifié)
ALTER TABLE public.activity_registrations
  ADD CONSTRAINT IF NOT EXISTS valid_registration_data CHECK (
    (user_id IS NOT NULL) OR
    (guest_email IS NOT NULL AND guest_first_name IS NOT NULL AND guest_last_name IS NOT NULL)
  );

-- ============================================================================
-- ÉTAPE 3: Index pour optimiser les recherches
-- ============================================================================

-- 3.1 Index sur guest_email pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_activity_registrations_guest_email
  ON public.activity_registrations(guest_email)
  WHERE guest_email IS NOT NULL;

-- 3.2 Index sur registration_type pour filtrage
CREATE INDEX IF NOT EXISTS idx_activity_registrations_registration_type
  ON public.activity_registrations(registration_type);

-- 3.3 Index sur zoom_registrant_id pour recherches Zoom
CREATE INDEX IF NOT EXISTS idx_activity_registrations_zoom_registrant_id
  ON public.activity_registrations(zoom_registrant_id)
  WHERE zoom_registrant_id IS NOT NULL;

-- 3.4 Index composite pour recherches par activité et type
CREATE INDEX IF NOT EXISTS idx_activity_registrations_activity_type
  ON public.activity_registrations(activity_id, registration_type);

-- ============================================================================
-- ÉTAPE 4: Politiques RLS (Row Level Security)
-- ============================================================================

-- 4.1 Activer RLS sur la table (si pas déjà fait)
ALTER TABLE public.activity_registrations ENABLE ROW LEVEL SECURITY;

-- 4.2 Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Anyone can register to activities" ON public.activity_registrations;
DROP POLICY IF EXISTS "Users can view their registrations" ON public.activity_registrations;
DROP POLICY IF EXISTS "Only admins can update/delete registrations" ON public.activity_registrations;

-- 4.3 Politique: Tout le monde peut s'inscrire (INSERT)
-- Cette politique permet à la fois les utilisateurs authentifiés et non authentifiés
CREATE POLICY "Anyone can register to activities"
  ON public.activity_registrations
  FOR INSERT
  WITH CHECK (true);

-- 4.4 Politique: Les utilisateurs peuvent voir leurs propres inscriptions (SELECT)
-- Un utilisateur authentifié peut voir ses inscriptions (user_id = auth.uid())
-- Un utilisateur peut aussi voir les inscriptions faites avec son email
CREATE POLICY "Users can view their registrations"
  ON public.activity_registrations
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    guest_email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

-- 4.5 Politique: Seuls les admins et organisateurs peuvent modifier/supprimer (UPDATE/DELETE)
CREATE POLICY "Only admins can update/delete registrations"
  ON public.activity_registrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    ) OR
    -- Permettre aux organisateurs de gérer les inscriptions de leurs activités
    EXISTS (
      SELECT 1 FROM public.activities
      WHERE id = activity_registrations.activity_id
        AND organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
        )
    )
  );

-- ============================================================================
-- ÉTAPE 5: Fonction utilitaire pour obtenir les statistiques d'inscription
-- ============================================================================

-- 5.1 Créer une fonction pour compter les inscriptions par type
CREATE OR REPLACE FUNCTION get_activity_registration_stats(p_activity_id UUID)
RETURNS TABLE(
  total_registrations BIGINT,
  user_registrations BIGINT,
  guest_registrations BIGINT,
  attended_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_registrations,
    COUNT(*) FILTER (WHERE registration_type = 'user')::BIGINT as user_registrations,
    COUNT(*) FILTER (WHERE registration_type = 'guest')::BIGINT as guest_registrations,
    COUNT(*) FILTER (WHERE attended = true)::BIGINT as attended_count
  FROM public.activity_registrations
  WHERE activity_id = p_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 Ajouter un commentaire sur la fonction
COMMENT ON FUNCTION get_activity_registration_stats IS 'Retourne les statistiques d''inscription pour une activité donnée';

-- ============================================================================
-- ÉTAPE 6: Trigger pour mettre à jour registration_type automatiquement
-- ============================================================================

-- 6.1 Créer une fonction trigger pour définir automatiquement le registration_type
CREATE OR REPLACE FUNCTION set_registration_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Si user_id est présent, c'est un utilisateur authentifié
  IF NEW.user_id IS NOT NULL THEN
    NEW.registration_type := 'user';
  ELSE
    NEW.registration_type := 'guest';
  END IF;

  -- S'assurer que created_at est défini
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6.2 Créer le trigger
DROP TRIGGER IF EXISTS trg_set_registration_type ON public.activity_registrations;
CREATE TRIGGER trg_set_registration_type
  BEFORE INSERT ON public.activity_registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_registration_type();

-- ============================================================================
-- ÉTAPE 7: Vue pour faciliter les requêtes sur les inscriptions
-- ============================================================================

-- 7.1 Créer une vue qui combine les informations utilisateur et guest
CREATE OR REPLACE VIEW activity_registrations_full AS
SELECT
  ar.id,
  ar.activity_id,
  ar.user_id,
  ar.registration_type,
  ar.registration_date,
  ar.attended,
  ar.attendance_duration,
  ar.zoom_registrant_id,
  ar.zoom_join_url,
  ar.created_at,

  -- Informations participant (combinées user + guest)
  COALESCE(u.email, ar.guest_email) as email,
  COALESCE(u.first_name, ar.guest_first_name) as first_name,
  COALESCE(u.last_name, ar.guest_last_name) as last_name,
  COALESCE(org.name, ar.guest_organization) as organization_name,
  COALESCE(uc.name_fr, gc.name_fr) as country_name_fr,
  COALESCE(uc.name_en, gc.name_en) as country_name_en,

  -- Informations activité
  a.title as activity_title,
  a.format as activity_format,
  a.proposed_start_date,
  a.proposed_end_date

FROM public.activity_registrations ar
LEFT JOIN public.users u ON ar.user_id = u.id
LEFT JOIN public.organizations org ON u.organization_id = org.id
LEFT JOIN public.countries uc ON u.country_id = uc.id
LEFT JOIN public.countries gc ON ar.guest_country_id = gc.id
LEFT JOIN public.activities a ON ar.activity_id = a.id;

-- 7.2 Ajouter un commentaire sur la vue
COMMENT ON VIEW activity_registrations_full IS 'Vue combinant les informations d''inscription des utilisateurs authentifiés et guests';

-- ============================================================================
-- ÉTAPE 8: Migration des données existantes (si nécessaire)
-- ============================================================================

-- 8.1 Mettre à jour les anciennes inscriptions avec registration_type = 'user'
UPDATE public.activity_registrations
SET registration_type = 'user'
WHERE user_id IS NOT NULL AND registration_type IS NULL;

-- 8.2 S'assurer que created_at est défini pour les anciennes inscriptions
UPDATE public.activity_registrations
SET created_at = registration_date
WHERE created_at IS NULL AND registration_date IS NOT NULL;

-- ============================================================================
-- VÉRIFICATIONS FINALES
-- ============================================================================

-- Vérifier que la structure est correcte
DO $$
BEGIN
  -- Vérifier que user_id est nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_registrations'
      AND column_name = 'user_id'
      AND is_nullable = 'NO'
  ) THEN
    RAISE EXCEPTION 'Migration failed: user_id should be nullable';
  END IF;

  -- Vérifier que les nouveaux champs existent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_registrations'
      AND column_name = 'guest_email'
  ) THEN
    RAISE EXCEPTION 'Migration failed: guest_email column not found';
  END IF;

  RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Afficher un résumé
SELECT
  'activity_registrations' as table_name,
  COUNT(*) as total_rows,
  COUNT(user_id) as user_registrations,
  COUNT(*) FILTER (WHERE user_id IS NULL) as guest_registrations
FROM public.activity_registrations;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
