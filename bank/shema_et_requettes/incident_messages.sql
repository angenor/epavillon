-- =====================================================
-- Table pour les messages d'alerte/incidents
-- =====================================================
-- Cette table permet de gérer les messages d'alerte pour:
-- - Des organisations spécifiques
-- - Des journées spécifiques
-- - L'événement en général
-- =====================================================

CREATE TABLE public.incident_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  day_date DATE,
  message_fr TEXT NOT NULL,
  message_en TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error')) DEFAULT 'warning',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_incident_messages_event_id ON public.incident_messages(event_id);
CREATE INDEX idx_incident_messages_organization_id ON public.incident_messages(organization_id);
CREATE INDEX idx_incident_messages_day_date ON public.incident_messages(day_date);
CREATE INDEX idx_incident_messages_is_active ON public.incident_messages(is_active);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.incident_messages IS 'Messages d''alerte et incidents pour les événements';
COMMENT ON COLUMN public.incident_messages.id IS 'Identifiant unique du message';
COMMENT ON COLUMN public.incident_messages.event_id IS 'Événement concerné (obligatoire)';
COMMENT ON COLUMN public.incident_messages.organization_id IS 'Organisation concernée (NULL = message non spécifique à une organisation)';
COMMENT ON COLUMN public.incident_messages.day_date IS 'Date concernée (NULL = message non spécifique à un jour)';
COMMENT ON COLUMN public.incident_messages.message_fr IS 'Message en français';
COMMENT ON COLUMN public.incident_messages.message_en IS 'Message en anglais';
COMMENT ON COLUMN public.incident_messages.severity IS 'Niveau de gravité: info (bleu), warning (orange), error (rouge)';
COMMENT ON COLUMN public.incident_messages.is_active IS 'Indique si le message doit être affiché';

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.incident_messages ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les messages actifs
CREATE POLICY "Les messages actifs sont visibles par tous"
  ON public.incident_messages
  FOR SELECT
  USING (is_active = true);

-- Politique : Seuls les admins peuvent créer/modifier/supprimer
CREATE POLICY "Seuls les admins peuvent gérer les messages"
  ON public.incident_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
      AND user_roles.is_active = true
      AND (user_roles.valid_until IS NULL OR user_roles.valid_until > NOW())
    )
  );

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER set_incident_messages_updated_at
  BEFORE UPDATE ON public.incident_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Exemples d'utilisation
-- =====================================================

-- Exemple 1 : Message général pour un événement
-- INSERT INTO incident_messages (event_id, message_fr, message_en, severity)
-- VALUES (
--   'uuid-de-l-evenement',
--   'Des problèmes techniques sont en cours de résolution.',
--   'Technical issues are being resolved.',
--   'warning'
-- );

-- Exemple 2 : Message pour une organisation spécifique
-- INSERT INTO incident_messages (event_id, organization_id, message_fr, message_en, severity)
-- VALUES (
--   'uuid-de-l-evenement',
--   'uuid-de-l-organisation',
--   'L''organisation XYZ rencontre des difficultés techniques.',
--   'Organization XYZ is experiencing technical difficulties.',
--   'error'
-- );

-- Exemple 3 : Message pour une journée spécifique
-- INSERT INTO incident_messages (event_id, day_date, message_fr, message_en, severity)
-- VALUES (
--   'uuid-de-l-evenement',
--   '2025-11-15',
--   'Des perturbations sont attendues le 15 novembre.',
--   'Disruptions are expected on November 15.',
--   'info'
-- );
