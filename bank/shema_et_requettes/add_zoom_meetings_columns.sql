-- =============================================
-- Script de migration pour ajouter les colonnes manquantes à zoom_meetings
-- Date: 2025-10-26
-- Description: Ajoute les colonnes nécessaires pour stocker les détails des réunions Zoom standalone
-- =============================================

-- Ajouter les colonnes pour les informations détaillées de la réunion
ALTER TABLE public.zoom_meetings
  ADD COLUMN IF NOT EXISTS host_email TEXT,
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration INTEGER,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Ajouter un commentaire pour expliquer la structure
COMMENT ON COLUMN public.zoom_meetings.host_email IS 'Email de l''hôte de la réunion Zoom';
COMMENT ON COLUMN public.zoom_meetings.topic IS 'Sujet/titre de la réunion';
COMMENT ON COLUMN public.zoom_meetings.start_time IS 'Date et heure de début de la réunion';
COMMENT ON COLUMN public.zoom_meetings.duration IS 'Durée de la réunion en minutes';
COMMENT ON COLUMN public.zoom_meetings.timezone IS 'Fuseau horaire de la réunion (IANA timezone name)';

-- Créer un index sur start_time pour faciliter les recherches par date
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_start_time ON public.zoom_meetings(start_time);

-- Ajouter la contrainte de clé étrangère sur activities.zoom_meeting_id si elle n'existe pas
DO $$
BEGIN
  -- Vérifier si la contrainte existe déjà
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'activities_zoom_meeting_id_fkey'
      AND table_name = 'activities'
  ) THEN
    -- Nettoyer d'abord les références invalides (si elles existent)
    UPDATE public.activities
    SET zoom_meeting_id = NULL
    WHERE zoom_meeting_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.zoom_meetings zm
        WHERE zm.id = activities.zoom_meeting_id
      );

    -- Ajouter la contrainte de clé étrangère
    ALTER TABLE public.activities
    ADD CONSTRAINT activities_zoom_meeting_id_fkey
    FOREIGN KEY (zoom_meeting_id)
    REFERENCES public.zoom_meetings(id)
    ON DELETE SET NULL;

    RAISE NOTICE '✅ Contrainte de clé étrangère ajoutée sur activities.zoom_meeting_id';
  ELSE
    RAISE NOTICE 'ℹ️  Contrainte activities_zoom_meeting_id_fkey existe déjà';
  END IF;
END $$;

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Migration terminée avec succès';
  RAISE NOTICE '   Colonnes ajoutées à zoom_meetings:';
  RAISE NOTICE '   - host_email: Email de l''hôte';
  RAISE NOTICE '   - topic: Sujet de la réunion';
  RAISE NOTICE '   - start_time: Date/heure de début';
  RAISE NOTICE '   - duration: Durée en minutes';
  RAISE NOTICE '   - timezone: Fuseau horaire';
  RAISE NOTICE '';
  RAISE NOTICE 'ℹ️  NOTE: La relation avec activities existe déjà via activities.zoom_meeting_id';
  RAISE NOTICE '   - Réunions liées à une activité: activities.zoom_meeting_id = zoom_meetings.id';
  RAISE NOTICE '   - Réunions standalone: Aucune activité ne référence ce zoom_meetings.id';
END $$;
