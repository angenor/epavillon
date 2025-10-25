-- Script SQL pour configurer les politiques RLS pour zoom_meetings
-- Ce script doit être exécuté dans Supabase après la création de la table zoom_meetings

-- =============================================
-- POLITIQUES RLS POUR zoom_meetings
-- =============================================

-- Activer RLS sur la table zoom_meetings
ALTER TABLE public.zoom_meetings ENABLE ROW LEVEL SECURITY;

-- Politique : Les administrateurs peuvent tout voir
CREATE POLICY "Admins can view all zoom meetings"
ON public.zoom_meetings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Politique : Les administrateurs peuvent créer des réunions
CREATE POLICY "Admins can create zoom meetings"
ON public.zoom_meetings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Politique : Les utilisateurs peuvent voir les réunions des activités auxquelles ils sont inscrits
CREATE POLICY "Users can view zoom meetings for their registered activities"
ON public.zoom_meetings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.activity_registrations ar ON ar.activity_id = a.id
    WHERE a.zoom_meeting_id = zoom_meetings.id
    AND ar.user_id = auth.uid()
  )
);

-- Politique : Les intervenants peuvent voir les réunions des activités où ils interviennent
CREATE POLICY "Speakers can view zoom meetings for their activities"
ON public.zoom_meetings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.activity_speakers asp ON asp.activity_id = a.id
    WHERE a.zoom_meeting_id = zoom_meetings.id
    AND asp.email IN (
      SELECT email FROM public.users WHERE id = auth.uid()
    )
  )
);

-- Politique : Le service role peut tout faire (pour les Edge Functions)
CREATE POLICY "Service role can do anything"
ON public.zoom_meetings
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- =============================================

-- Index sur meeting_id pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_meeting_id ON public.zoom_meetings(meeting_id);

-- Index sur created_at pour trier par date de création
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_created_at ON public.zoom_meetings(created_at DESC);

-- =============================================
-- COMMENTAIRES POUR LA DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.zoom_meetings IS
'Table pour stocker les informations des réunions Zoom créées pour les activités.
Les réunions sont créées automatiquement via l''Edge Function create-zoom-meeting lorsqu''une activité est approuvée.';

COMMENT ON COLUMN public.zoom_meetings.meeting_id IS
'ID unique de la réunion Zoom (fourni par l''API Zoom). Format : 11 chiffres.';

COMMENT ON COLUMN public.zoom_meetings.join_url IS
'URL pour que les participants rejoignent la réunion. Peut être partagée publiquement.';

COMMENT ON COLUMN public.zoom_meetings.start_url IS
'URL pour que l''hôte démarre la réunion. Doit rester confidentielle.';

COMMENT ON COLUMN public.zoom_meetings.registration_url IS
'URL d''inscription à la réunion si l''inscription est activée.';

COMMENT ON COLUMN public.zoom_meetings.password IS
'Mot de passe de la réunion Zoom (si configuré).';

-- =============================================
-- VÉRIFICATION DES DONNÉES
-- =============================================

-- Requête pour vérifier les activités avec réunions Zoom
-- SELECT
--   a.id,
--   a.title,
--   a.validation_status,
--   a.final_start_date,
--   e.timezone,
--   zm.meeting_id,
--   zm.join_url,
--   zm.created_at
-- FROM activities a
-- LEFT JOIN events e ON a.event_id = e.id
-- LEFT JOIN zoom_meetings zm ON a.zoom_meeting_id = zm.id
-- WHERE a.validation_status = 'approved'
-- ORDER BY a.created_at DESC;
