-- Script pour configurer le bucket "documents" avec des permissions flexibles
-- Similaire au bucket "epavillonp"

-- ============================================
-- IMPORTANT: Configuration préalable requise
-- ============================================
-- 1. Créez d'abord le bucket via l'interface Supabase:
--    Storage > New bucket > Name: "documents" > Public: true
-- 2. Désactivez RLS pour le bucket (le plus simple):
--    Storage > documents > Policies > Désactiver "RLS enabled"

-- ============================================
-- SI VOUS VOULEZ GARDER RLS ACTIVÉ
-- ============================================
-- Voici les politiques à créer sur la table storage.objects

-- D'abord, supprimer les anciennes politiques pour ce bucket
DROP POLICY IF EXISTS "Public Access - Read documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete documents" ON storage.objects;

-- ============================================
-- CRÉER LES NOUVELLES POLITIQUES PERMISSIVES
-- ============================================

-- Politique 1: Permettre à tous de LIRE (SELECT) les fichiers publics
CREATE POLICY "Public Access - Read documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Politique 2: Permettre aux utilisateurs authentifiés d'UPLOADER (INSERT) des fichiers
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Politique 3: Permettre aux utilisateurs authentifiés de METTRE À JOUR (UPDATE) leurs fichiers
CREATE POLICY "Authenticated users can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Politique 4: Permettre aux utilisateurs authentifiés de SUPPRIMER (DELETE) leurs fichiers
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- ============================================
-- 4. POLITIQUES ALTERNATIVES ULTRA-PERMISSIVES
-- ============================================
-- Si vous voulez des permissions TOTALEMENT ouvertes (non recommandé en production)
-- Décommentez les lignes suivantes et commentez les politiques ci-dessus

/*
-- Politique ULTRA permissive - Tout le monde peut TOUT faire
CREATE POLICY "Anyone can do anything with documents"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
*/

-- ============================================
-- 5. VÉRIFIER LES POLITIQUES CRÉÉES
-- ============================================
-- Pour vérifier que les politiques ont bien été créées
SELECT
    name,
    action,
    roles,
    using_expression,
    check_expression
FROM storage.policies
WHERE bucket_id = 'documents'
ORDER BY name;

-- ============================================
-- 6. CONFIGURATION SUPPLÉMENTAIRE VIA SUPABASE DASHBOARD
-- ============================================
/*
Instructions pour configurer via l'interface Supabase:

1. Aller dans Storage > Buckets
2. Trouver le bucket "documents"
3. Cliquer sur les 3 points > Policies
4. S'assurer que "Enable RLS" est DÉSACTIVÉ si vous voulez un accès totalement libre
   OU
   S'assurer que les politiques ci-dessus sont bien appliquées

5. Configuration du bucket:
   - Public: true (coché)
   - File size limit: 50MB (ou selon vos besoins)
   - Allowed MIME types: Laisser vide pour accepter tous les types
     OU spécifier: application/pdf,application/msword,application/vnd.ms-powerpoint,application/vnd.ms-excel,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

Alternative: Désactiver complètement RLS (le plus simple mais moins sécurisé):
1. Storage > Buckets > documents > Policies
2. Désactiver "Enable RLS for this bucket"
*/

-- ============================================
-- 7. TEST DE VÉRIFICATION
-- ============================================
-- Pour tester si un utilisateur peut uploader
/*
-- Simuler un upload en tant qu'utilisateur authentifié
SET LOCAL role TO 'authenticated';
-- Cette requête devrait retourner true si les permissions sont correctes
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM storage.policies
            WHERE bucket_id = 'documents'
            AND action = 'INSERT'
            AND 'authenticated' = ANY(roles)
        )
        THEN 'Upload autorisé ✓'
        ELSE 'Upload bloqué ✗'
    END as upload_status;
*/