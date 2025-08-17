-- =============================================
-- Activation de la politique RLS pour activity_speakers
-- =============================================

-- Supprimer les politiques existantes pour activity_speakers si elles existent
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'activity_speakers' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.activity_speakers', pol.policyname);
    END LOOP;
END $$;

-- Créer la politique pour permettre la lecture publique des activity_speakers
CREATE POLICY "Activity speakers are publicly viewable" ON activity_speakers
    FOR SELECT
    USING (true);

-- Activer RLS sur la table activity_speakers
ALTER TABLE activity_speakers ENABLE ROW LEVEL SECURITY;

-- Vérification - Afficher les politiques créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN length(qual) > 100 THEN substring(qual, 1, 97) || '...'
        ELSE qual
    END as qual_summary
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'activity_speakers'
ORDER BY tablename, policyname;

-- Message de confirmation
DO $$ 
BEGIN
    RAISE NOTICE 'Politique RLS pour activity_speakers créée avec succès!';
END $$;