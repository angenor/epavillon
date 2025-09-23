-- =============================================
-- SCRIPT URGENT: Ajouter la colonne 'types' à activity_documents
-- Exécutez CE SCRIPT IMMÉDIATEMENT dans Supabase SQL Editor
-- =============================================

-- 1. Ajouter la colonne 'types' si elle n'existe pas
ALTER TABLE public.activity_documents
ADD COLUMN IF NOT EXISTS types TEXT[];

-- 2. Ajouter un commentaire pour documentation
COMMENT ON COLUMN public.activity_documents.types
IS 'Types de document: presentation, report, additional_resource, autre';

-- 3. Rafraîchir le cache du schéma PostgREST
NOTIFY pgrst, 'reload schema';

-- 4. Vérifier que la colonne a bien été ajoutée
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'activity_documents'
ORDER BY ordinal_position;

-- 5. Test rapide pour confirmer que ça fonctionne
-- (Remplacez l'UUID par un ID d'activité valide de votre base)
/*
INSERT INTO public.activity_documents (
    activity_id,
    types,
    title,
    file_url,
    file_type
) VALUES (
    '719b6f82-bdcc-4b77-9834-c745d2e7e739'::uuid,
    ARRAY['presentation']::text[],
    'Test Document avec Types',
    'https://test.com/doc.pdf',
    'application/pdf'
) RETURNING *;
*/