-- Migration: paco_demographic_data
-- Feature: 003-paco-registration-stats
-- Description: Table dédiée aux données démographiques des inscrits PACO
-- Date: 2026-03-05

CREATE TABLE public.paco_demographic_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL UNIQUE
        REFERENCES public.activity_registrations(id) ON DELETE CASCADE,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    age_profile TEXT NOT NULL CHECK (age_profile IN ('over_35', 'under_35')),
    city TEXT NOT NULL,
    country_id UUID NOT NULL REFERENCES public.countries(id),
    professional_status TEXT NOT NULL
        CHECK (professional_status IN ('employed', 'student', 'unemployed', 'entrepreneur')),
    organization TEXT,
    recording_consent BOOLEAN NOT NULL CHECK (recording_consent = true),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.paco_demographic_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own paco demographic data"
ON public.paco_demographic_data FOR INSERT
WITH CHECK (
    (SELECT user_id FROM public.activity_registrations WHERE id = registration_id) = auth.uid()
);

CREATE POLICY "Users can read own paco demographic data"
ON public.paco_demographic_data FOR SELECT
USING (
    (SELECT user_id FROM public.activity_registrations WHERE id = registration_id) = auth.uid()
);

CREATE POLICY "Admins can read all paco demographic data"
ON public.paco_demographic_data FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Index for join performance
CREATE INDEX idx_paco_demographic_registration
ON public.paco_demographic_data(registration_id);

-- CLEANUP (run after the event to remove PACO demographic data)
-- DROP TABLE IF EXISTS public.paco_demographic_data;
