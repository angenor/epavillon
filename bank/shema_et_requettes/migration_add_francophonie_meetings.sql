-- =============================================
-- Script de migration pour ajouter la rubrique "Réunion de la Francophonie"
-- Date: 2025-01-16
-- Description: Ajout des tables pour gérer les réunions de la Francophonie
-- =============================================

-- Création de la table des réunions de la Francophonie
CREATE TABLE IF NOT EXISTS public.francophonie_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    location TEXT,
    country_id UUID REFERENCES public.countries(id) NOT NULL,
    category session_category NOT NULL,
    zoom_meeting_id UUID REFERENCES public.zoom_meetings(id),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Création de la table des inscriptions aux réunions de la Francophonie
CREATE TABLE IF NOT EXISTS public.francophonie_meeting_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.francophonie_meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

-- Ajout du trigger pour la mise à jour automatique du timestamp
CREATE TRIGGER update_francophonie_meetings_updated_at 
BEFORE UPDATE ON public.francophonie_meetings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS (Row Level Security) sur les nouvelles tables
ALTER TABLE public.francophonie_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.francophonie_meeting_registrations ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité pour francophonie_meetings
-- Lecture publique des réunions
CREATE POLICY "Francophonie meetings are viewable by all authenticated users" 
ON public.francophonie_meetings
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Création réservée aux administrateurs
CREATE POLICY "Only admins can create francophonie meetings" 
ON public.francophonie_meetings
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND created_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Modification par le créateur ou les administrateurs
CREATE POLICY "Users can update their own francophonie meetings" 
ON public.francophonie_meetings
FOR UPDATE 
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
) 
WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Suppression par le créateur ou les administrateurs
CREATE POLICY "Users can delete their own francophonie meetings" 
ON public.francophonie_meetings
FOR DELETE 
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Politiques de sécurité pour francophonie_meeting_registrations
-- Les utilisateurs peuvent voir leurs propres inscriptions
CREATE POLICY "Users can view their own francophonie meeting registrations" 
ON public.francophonie_meeting_registrations
FOR SELECT 
USING (user_id = auth.uid());

-- Les administrateurs peuvent voir toutes les inscriptions
CREATE POLICY "Admins can view all francophonie meeting registrations" 
ON public.francophonie_meeting_registrations
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Les utilisateurs peuvent s'inscrire eux-mêmes
CREATE POLICY "Users can register to francophonie meetings" 
ON public.francophonie_meeting_registrations
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent annuler leur propre inscription
CREATE POLICY "Users can delete their own francophonie meeting registrations" 
ON public.francophonie_meeting_registrations
FOR DELETE 
USING (user_id = auth.uid());

-- Création d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_francophonie_meetings_country 
ON public.francophonie_meetings(country_id);

CREATE INDEX IF NOT EXISTS idx_francophonie_meetings_category 
ON public.francophonie_meetings(category);

CREATE INDEX IF NOT EXISTS idx_francophonie_meetings_dates 
ON public.francophonie_meetings(start_datetime, end_datetime);

CREATE INDEX IF NOT EXISTS idx_francophonie_meeting_registrations_meeting 
ON public.francophonie_meeting_registrations(meeting_id);

CREATE INDEX IF NOT EXISTS idx_francophonie_meeting_registrations_user 
ON public.francophonie_meeting_registrations(user_id);

-- Ajout de commentaires de documentation
COMMENT ON TABLE public.francophonie_meetings IS 'Réunions de la Francophonie avec localisation et support Zoom';
COMMENT ON TABLE public.francophonie_meeting_registrations IS 'Inscriptions des utilisateurs aux réunions de la Francophonie';
COMMENT ON COLUMN public.francophonie_meetings.country_id IS 'Pays où se déroule la réunion (référence obligatoire vers la table countries)';
COMMENT ON COLUMN public.francophonie_meetings.category IS 'Catégorie de la réunion (climate, biodiversity, desertification)';
COMMENT ON COLUMN public.francophonie_meetings.zoom_meeting_id IS 'Référence optionnelle vers les informations Zoom si la réunion est en ligne';