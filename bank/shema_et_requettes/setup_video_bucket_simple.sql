-- =============================================
-- Configuration simple du bucket epavillonv
-- =============================================

-- 1. Mettre à jour la configuration du bucket
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 10485760 -- 10 MB
WHERE id = 'epavillonv';

-- 2. Vérifier la configuration
SELECT 
    id,
    name,
    public,
    file_size_limit / 1048576.0 as "Limite (MB)",
    CASE 
        WHEN public = true THEN 'Public'
        ELSE 'Privé'
    END as "Visibilité"
FROM storage.buckets
WHERE id = 'epavillonv';

-- 3. Lister les politiques existantes pour epavillonv
SELECT 
    policyname as "Nom de la politique",
    cmd as "Opération",
    CASE 
        WHEN qual::text LIKE '%epavillonv%' THEN 'OUI'
        WHEN with_check::text LIKE '%epavillonv%' THEN 'OUI'
        ELSE 'NON'
    END as "Pour epavillonv"
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (qual::text LIKE '%epavillonv%' OR with_check::text LIKE '%epavillonv%');

-- 4. Si vous voulez supprimer TOUTES les politiques et recommencer
-- (décommentez les lignes suivantes si nécessaire)
/*
-- Obtenir la liste des politiques à supprimer
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT DISTINCT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND (qual::text LIKE '%epavillonv%' OR with_check::text LIKE '%epavillonv%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
        RAISE NOTICE 'Politique supprimée: %', pol.policyname;
    END LOOP;
END $$;
*/

-- 5. Créer des politiques simples si elles n'existent pas
DO $$
BEGIN
    -- Vérifier si une politique de lecture existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname = 'Public Read epavillonv'
    ) THEN
        CREATE POLICY "Public Read epavillonv" 
        ON storage.objects 
        FOR SELECT 
        USING (bucket_id = 'epavillonv');
        RAISE NOTICE 'Politique de lecture créée';
    END IF;

    -- Vérifier si une politique d'upload existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname = 'Auth Upload epavillonv'
    ) THEN
        CREATE POLICY "Auth Upload epavillonv" 
        ON storage.objects 
        FOR INSERT 
        WITH CHECK (
            bucket_id = 'epavillonv' 
            AND auth.uid() IS NOT NULL
        );
        RAISE NOTICE 'Politique d''upload créée';
    END IF;
END $$;

-- 6. Résumé final
SELECT 
    'Configuration terminée' as "Statut",
    'epavillonv' as "Bucket",
    '10 MB' as "Limite",
    'Public' as "Accès lecture",
    'Authentifié' as "Accès écriture";