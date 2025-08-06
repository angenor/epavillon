-- Script de diagnostic simplifié pour RLS sur activities
-- Exécutez dans Supabase SQL Editor

-- 1. Vérifier si RLS est activé
SELECT 
    'RLS Status' as test,
    CASE 
        WHEN rowsecurity THEN 'ACTIVÉ' 
        ELSE 'DÉSACTIVÉ' 
    END as valeur
FROM pg_tables 
WHERE tablename = 'activities' AND schemaname = 'public';

-- 2. Compter les politiques UPDATE existantes
SELECT 
    'Politiques UPDATE' as test,
    COUNT(*) as nombre
FROM pg_policies 
WHERE tablename = 'activities' AND schemaname = 'public' AND cmd = 'UPDATE';

-- 3. Lister toutes les politiques
SELECT 
    policyname as politique,
    cmd as type,
    qual as condition_using
FROM pg_policies 
WHERE tablename = 'activities' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- 4. Vérifier l'utilisateur actuel
SELECT 
    'Utilisateur connecté' as test,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'OUI'
        ELSE 'NON'
    END as valeur,
    auth.uid() as user_id;

-- 5. Vérifier l'activité cible
SELECT 
    'Activité existe' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN 'OUI'
        ELSE 'NON'
    END as valeur,
    COUNT(*) as nombre_trouve
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';

-- 6. Test de propriété
SELECT 
    'Utilisateur propriétaire' as test,
    CASE 
        WHEN submitted_by = auth.uid() THEN 'OUI'
        WHEN submitted_by IS NULL THEN 'ACTIVITÉ INEXISTANTE'
        WHEN auth.uid() IS NULL THEN 'UTILISATEUR NON CONNECTÉ'
        ELSE 'NON'
    END as valeur
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';

-- 7. Informations sur l'activité
SELECT 
    id,
    title,
    submitted_by,
    updated_at
FROM activities 
WHERE id = 'cb5c4d81-cc1f-4442-a195-080eb43ea320';