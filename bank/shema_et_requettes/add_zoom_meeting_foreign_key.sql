-- Script pour ajouter la contrainte de clé étrangère entre activities et zoom_meetings
-- Cela permet à Supabase PostgREST de faire des jointures automatiques

-- 1. Vérifier si la colonne zoom_meeting_id existe dans activities
-- (Normalement elle devrait déjà exister)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'activities'
        AND column_name = 'zoom_meeting_id'
    ) THEN
        ALTER TABLE public.activities
        ADD COLUMN zoom_meeting_id UUID;

        RAISE NOTICE 'Colonne zoom_meeting_id ajoutée à la table activities';
    ELSE
        RAISE NOTICE 'Colonne zoom_meeting_id existe déjà';
    END IF;
END $$;

-- 2. Supprimer l'ancienne contrainte si elle existe (au cas où)
ALTER TABLE public.activities
DROP CONSTRAINT IF EXISTS activities_zoom_meeting_id_fkey;

-- 3. Ajouter la contrainte de clé étrangère
ALTER TABLE public.activities
ADD CONSTRAINT activities_zoom_meeting_id_fkey
FOREIGN KEY (zoom_meeting_id)
REFERENCES public.zoom_meetings(id)
ON DELETE SET NULL;  -- Si la réunion Zoom est supprimée, mettre zoom_meeting_id à NULL

-- 4. Créer un index pour améliorer les performances des jointures
CREATE INDEX IF NOT EXISTS idx_activities_zoom_meeting_id
ON public.activities(zoom_meeting_id);

-- 5. Vérifier que la contrainte a été créée
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'activities'
    AND kcu.column_name = 'zoom_meeting_id';

-- Résultat attendu:
-- activities_zoom_meeting_id_fkey | activities | zoom_meeting_id | zoom_meetings | id
