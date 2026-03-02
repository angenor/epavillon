-- =============================================
-- PACO Webinar Setup Script
-- Creates fictitious event + activity for PACO webinar registrations
-- and the RPC function for anonymous email checking
-- =============================================

-- 1. Insert fictitious event for PACO webinar
-- Uses a known UUID for easy identification and cleanup
INSERT INTO public.events (
  id,
  year,
  title,
  description,
  submission_deadline,
  participation_mode,
  country_id,
  city,
  address,
  timezone
) VALUES (
  '00000000-0000-4000-a000-00000000e001',
  2026,
  'PACO - Webinaire',
  'Entrée technique pour le webinaire PACO (Priorités d''Adaptation en Afrique Centrale et de l''Ouest)',
  '2026-12-31T23:59:59Z',
  'online',
  (SELECT id FROM public.countries WHERE is_francophone = true LIMIT 1),
  'En ligne',
  'En ligne',
  'UTC'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert fictitious activity for PACO webinar
-- Requires an existing organization and user for FK constraints
INSERT INTO public.activities (
  id,
  event_id,
  organization_id,
  submitted_by,
  title,
  activity_type,
  objectives,
  detailed_presentation,
  format,
  main_themes,
  categories,
  proposed_start_date,
  proposed_end_date,
  validation_status
) VALUES (
  '00000000-0000-4000-a000-00000000a002',
  '00000000-0000-4000-a000-00000000e001',
  (SELECT organization_id FROM public.users WHERE id = (
    SELECT user_id FROM public.user_roles WHERE role = 'super_admin' AND is_active = true LIMIT 1
  )),
  (SELECT user_id FROM public.user_roles WHERE role = 'super_admin' AND is_active = true LIMIT 1),
  'Webinaire PACO',
  'side_event',
  'Webinaire sur les Priorités d''Adaptation en Afrique Centrale et de l''Ouest',
  'Webinaire PACO - Priorités d''Adaptation en Afrique Centrale et de l''Ouest',
  'online',
  '{adaptation}',
  '{capacity_building}',
  '2026-06-15T14:00:00Z',  -- À ajuster selon la date réelle du webinaire
  '2026-06-15T16:00:00Z',  -- À ajuster selon la date réelle du webinaire
  'approved'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create RPC function for anonymous email checking
-- SECURITY DEFINER bypasses RLS to allow anonymous users to check email existence
-- Returns only a boolean — no user data exposed
CREATE OR REPLACE FUNCTION public.check_paco_email(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE email = lower(trim(email_input))
  );
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.check_paco_email(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_paco_email(TEXT) TO authenticated;

-- =============================================
-- CLEANUP (run after the event to remove PACO entries)
-- =============================================
-- DELETE FROM public.activity_registrations WHERE activity_id = '00000000-0000-4000-a000-00000000a002';
-- DELETE FROM public.activities WHERE id = '00000000-0000-4000-a000-00000000a002';
-- DELETE FROM public.events WHERE id = '00000000-0000-4000-a000-00000000e001';
-- DROP FUNCTION IF EXISTS public.check_paco_email(TEXT);
