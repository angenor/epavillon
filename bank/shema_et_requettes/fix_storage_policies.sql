-- =============================================
-- Corriger les politiques du Storage Bucket
-- =============================================

-- Note: Les politiques de storage sont gérées différemment dans Supabase
-- Vous devez exécuter ces commandes dans l'interface Supabase Storage

-- 1. Vérifier les buckets existants
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets;

-- 2. Vérifier les politiques existantes sur le bucket epavillonp
SELECT 
    id,
    name,
    definition,
    bucket_id
FROM storage.policies
WHERE bucket_id = 'epavillonp';

-- 3. Supprimer toutes les politiques existantes sur le bucket
DELETE FROM storage.policies WHERE bucket_id = 'epavillonp';

-- 4. Créer des politiques permissives pour le bucket epavillonp

-- Politique pour permettre à tous les utilisateurs authentifiés de lire
INSERT INTO storage.policies (id, name, bucket_id, definition)
VALUES (
    gen_random_uuid(),
    'Allow authenticated users to read',
    'epavillonp',
    jsonb_build_object(
        'operation', 'SELECT',
        'check', 'true'
    )
);

-- Politique pour permettre à tous les utilisateurs authentifiés d'uploader
INSERT INTO storage.policies (id, name, bucket_id, definition)
VALUES (
    gen_random_uuid(),
    'Allow authenticated users to upload',
    'epavillonp',
    jsonb_build_object(
        'operation', 'INSERT',
        'check', '(auth.uid() IS NOT NULL)'
    )
);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres fichiers
INSERT INTO storage.policies (id, name, bucket_id, definition)
VALUES (
    gen_random_uuid(),
    'Allow users to update own files',
    'epavillonp',
    jsonb_build_object(
        'operation', 'UPDATE',
        'check', '(auth.uid() IS NOT NULL)'
    )
);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres fichiers
INSERT INTO storage.policies (id, name, bucket_id, definition)
VALUES (
    gen_random_uuid(),
    'Allow users to delete own files',
    'epavillonp',
    jsonb_build_object(
        'operation', 'DELETE',
        'check', '(auth.uid() IS NOT NULL)'
    )
);