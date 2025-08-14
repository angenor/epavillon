-- Script pour mettre à jour la contrainte display_mode et supporter le mode 'auto'

-- Supprimer l'ancienne contrainte
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_display_mode_check;

-- Ajouter la nouvelle contrainte avec support du mode 'auto'
ALTER TABLE public.users 
ADD CONSTRAINT users_display_mode_check 
CHECK (display_mode IN ('light', 'dark', 'auto'));

-- Mettre à jour la valeur par défaut des notification_preferences pour inclure tous les types
UPDATE public.users 
SET notification_preferences = '{
  "email": true,
  "push": true,
  "live_events": true,
  "activity_validation": true,
  "connection_requests": true,
  "messages_received": true,
  "appointment_requests": true,
  "training_reminders": true,
  "event_reminders": true,
  "system_announcements": true,
  "newsletters": true
}'::jsonb
WHERE notification_preferences = '{"email": true, "push": true, "live_events": true}'::jsonb;