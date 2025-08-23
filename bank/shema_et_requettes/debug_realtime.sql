-- =============================================
-- Script de diagnostic pour Supabase Realtime
-- Date: 2025-08-22
-- Description: Vérifications et diagnostics pour résoudre les problèmes de temps réel
-- =============================================

-- 1. Vérifier l'existence de la publication
SELECT 
    pubname,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- 2. Lister toutes les tables dans la publication
SELECT 
    schemaname, 
    tablename,
    rowfilter,
    'Active' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Vérifier REPLICA IDENTITY pour les tables de messagerie
SELECT 
    n.nspname AS schema_name,
    c.relname AS table_name,
    CASE c.relreplident
        WHEN 'd' THEN 'DEFAULT (using primary key)'
        WHEN 'n' THEN 'NOTHING (no identity)'
        WHEN 'f' THEN 'FULL (all columns)'
        WHEN 'i' THEN 'INDEX (using specific index)'
        ELSE 'UNKNOWN'
    END AS replica_identity_type,
    CASE 
        WHEN c.relreplident = 'f' THEN '✓ Optimal pour Realtime'
        WHEN c.relreplident = 'd' AND EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = c.oid AND contype = 'p'
        ) THEN '✓ OK avec clé primaire'
        ELSE '✗ Peut causer des problèmes'
    END AS realtime_status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relname IN ('messages', 'group_messages', 'connections', 'appointments', 'notifications')
ORDER BY c.relname;

-- 4. Vérifier les slots de réplication (pour les connexions actives)
SELECT 
    slot_name,
    plugin,
    slot_type,
    database,
    active,
    active_pid,
    restart_lsn,
    confirmed_flush_lsn
FROM pg_replication_slots
WHERE slot_name LIKE '%realtime%';

-- 5. Vérifier les paramètres de configuration WAL
SHOW wal_level;
SHOW max_replication_slots;
SHOW max_wal_senders;

-- 6. Tester l'insertion d'un message (pour vérifier les déclencheurs)
DO $$
DECLARE
    test_user_id UUID;
    test_recipient_id UUID;
BEGIN
    -- Récupérer deux utilisateurs pour le test
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    SELECT id INTO test_recipient_id FROM auth.users WHERE id != test_user_id LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_recipient_id IS NOT NULL THEN
        -- Insérer un message de test
        INSERT INTO public.messages (sender_id, recipient_id, content)
        VALUES (test_user_id, test_recipient_id, 'Test Realtime: ' || now()::text);
        
        RAISE NOTICE 'Message de test inséré avec succès';
        RAISE NOTICE 'De: % Vers: %', test_user_id, test_recipient_id;
    ELSE
        RAISE NOTICE 'Pas assez d''utilisateurs pour le test';
    END IF;
END $$;

-- 7. Vérifier les derniers messages (pour confirmer l'insertion)
SELECT 
    id,
    sender_id,
    recipient_id,
    content,
    created_at,
    is_read
FROM public.messages
ORDER BY created_at DESC
LIMIT 5;

-- 8. Vérifier les permissions RLS sur les tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('messages', 'group_messages', 'connections', 'appointments', 'notifications')
ORDER BY tablename, policyname;

-- 9. Message de diagnostic final
DO $$
DECLARE
    tables_in_pub INTEGER;
    tables_with_full_replica INTEGER;
    active_slots INTEGER;
BEGIN
    -- Compter les tables dans la publication
    SELECT COUNT(*) INTO tables_in_pub
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime'
    AND tablename IN ('messages', 'group_messages', 'connections', 'appointments', 'notifications');
    
    -- Compter les tables avec REPLICA IDENTITY FULL
    SELECT COUNT(*) INTO tables_with_full_replica
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
    AND c.relname IN ('messages', 'group_messages', 'connections', 'appointments', 'notifications')
    AND c.relreplident = 'f';
    
    -- Compter les slots actifs
    SELECT COUNT(*) INTO active_slots
    FROM pg_replication_slots
    WHERE active = true AND slot_name LIKE '%realtime%';
    
    RAISE NOTICE '=== RÉSUMÉ DU DIAGNOSTIC ===';
    RAISE NOTICE 'Tables dans la publication: %/5', tables_in_pub;
    RAISE NOTICE 'Tables avec REPLICA IDENTITY FULL: %/5', tables_with_full_replica;
    RAISE NOTICE 'Slots de réplication actifs: %', active_slots;
    
    IF tables_in_pub = 5 AND tables_with_full_replica = 5 THEN
        RAISE NOTICE '✓ Configuration Realtime correcte côté base de données';
        RAISE NOTICE 'Si les problèmes persistent, vérifiez:';
        RAISE NOTICE '  1. Les connexions WebSocket dans le client JavaScript';
        RAISE NOTICE '  2. Les filtres de souscription dans useRealtimeSubscription.js';
        RAISE NOTICE '  3. Les logs de la console du navigateur';
    ELSE
        RAISE NOTICE '✗ Configuration incomplète. Exécutez enable_realtime.sql';
    END IF;
END $$;