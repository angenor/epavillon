-- =============================================
-- Script pour corriger la table activity_documents
-- et rafraîchir le cache du schéma Supabase
-- =============================================

-- 1. Vérifier si la table existe
SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'activity_documents'
) as table_exists;

-- 2. Si la table n'existe pas, la créer
CREATE TABLE IF NOT EXISTS public.activity_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    types TEXT[], -- Array pour supporter plusieurs types
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES public.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vérifier les colonnes existantes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'activity_documents'
ORDER BY ordinal_position;

-- 4. Ajouter la colonne 'types' si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'activity_documents'
        AND column_name = 'types'
    ) THEN
        ALTER TABLE public.activity_documents
        ADD COLUMN types TEXT[];

        COMMENT ON COLUMN public.activity_documents.types
        IS 'Types de document: presentation, report, additional_resource, autre';
    END IF;
END $$;

-- 5. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_activity_documents_activity_id
ON public.activity_documents(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_documents_uploaded_by
ON public.activity_documents(uploaded_by);

-- 6. Rafraîchir les politiques RLS (si nécessaire)
ALTER TABLE public.activity_documents ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour tous
CREATE POLICY IF NOT EXISTS "Activity documents are viewable by everyone"
ON public.activity_documents
FOR SELECT
TO public
USING (true);

-- Politique d'insertion pour utilisateurs authentifiés
CREATE POLICY IF NOT EXISTS "Authenticated users can insert activity documents"
ON public.activity_documents
FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

-- Politique de suppression pour le propriétaire
CREATE POLICY IF NOT EXISTS "Users can delete their own activity documents"
ON public.activity_documents
FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());

-- 7. Rafraîchir le cache du schéma
-- Note: Cette commande doit être exécutée dans l'API Supabase
-- NOTIFY pgrst, 'reload schema';

-- 8. Test d'insertion pour vérifier que tout fonctionne
/*
-- Test (à décommenter pour tester)
INSERT INTO public.activity_documents (
    activity_id,
    types,
    title,
    file_url,
    file_type,
    uploaded_by
) VALUES (
    'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid, -- Remplacer par un ID d'activité valide
    ARRAY['presentation', 'report'],
    'Test Document',
    'https://example.com/test.pdf',
    'application/pdf',
    auth.uid() -- Utilise l'ID de l'utilisateur connecté
) RETURNING *;
*/

-- 9. Afficher la structure finale de la table
\d public.activity_documents