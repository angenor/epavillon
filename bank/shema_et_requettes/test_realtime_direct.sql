-- =============================================
-- Test direct de Realtime sur Supabase
-- Date: 2025-08-22
-- Description: Teste si Realtime est bien configuré
-- =============================================

-- 1. Vérifier que la publication existe et contient les tables
SELECT 
    pubname,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- 2. Vérifier les tables dans la publication
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Vérifier que les webhooks Realtime sont activés (dans les extensions)
SELECT 
    extname,
    extversion
FROM pg_extension
WHERE extname LIKE '%realtime%' OR extname = 'wal2json';

-- 4. Vérifier les slots de réplication
SELECT 
    slot_name,
    plugin,
    slot_type,
    active,
    active_pid,
    restart_lsn
FROM pg_replication_slots
WHERE slot_name LIKE '%realtime%';

-- 5. Test: Créer un message de test et vérifier qu'il peut être lu
DO $$
DECLARE
    test_user_id UUID;
    test_message_id UUID;
BEGIN
    -- Récupérer un ID utilisateur existant
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'Aucun utilisateur trouvé pour le test';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Test avec utilisateur: %', test_user_id;
    
    -- Insérer un message test
    INSERT INTO public.messages (sender_id, recipient_id, content, is_read)
    VALUES (test_user_id, test_user_id, 'Test Realtime Direct - ' || NOW()::TEXT, false)
    RETURNING id INTO test_message_id;
    
    RAISE NOTICE 'Message test créé avec ID: %', test_message_id;
    
    -- Vérifier que le message existe
    IF EXISTS (SELECT 1 FROM public.messages WHERE id = test_message_id) THEN
        RAISE NOTICE '✓ Message correctement inséré et lisible';
    ELSE
        RAISE NOTICE '✗ Erreur: Message non trouvé après insertion';
    END IF;
    
    -- Nettoyer
    DELETE FROM public.messages WHERE id = test_message_id;
    RAISE NOTICE 'Message test supprimé';
END $$;

-- 6. Vérifier les paramètres de configuration WAL
SHOW wal_level;
SHOW max_replication_slots;
SHOW max_wal_senders;

-- 7. Vérifier si les tables ont des triggers qui pourraient interférer
SELECT 
    n.nspname AS schema_name,
    c.relname AS table_name,
    t.tgname AS trigger_name,
    p.proname AS function_name,
    CASE t.tgenabled 
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
        WHEN 'R' THEN 'REPLICA'
        WHEN 'A' THEN 'ALWAYS'
    END AS status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'public'
AND c.relname IN ('messages', 'group_messages', 'notifications', 'connections', 'appointments')
ORDER BY c.relname, t.tgname;

-- 8. Message de diagnostic
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Diagnostic Realtime terminé';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Points à vérifier:';
    RAISE NOTICE '1. wal_level doit être "logical"';
    RAISE NOTICE '2. La publication supabase_realtime doit exister';
    RAISE NOTICE '3. Les tables doivent être dans la publication';
    RAISE NOTICE '4. Les slots de réplication doivent être actifs';
    RAISE NOTICE '5. Vérifier les logs Supabase dans le dashboard';
    RAISE NOTICE '';
    RAISE NOTICE 'Si tout est OK mais que ça ne fonctionne pas:';
    RAISE NOTICE '- Vérifier les quotas Realtime dans le dashboard Supabase';
    RAISE NOTICE '- Redémarrer le service Realtime depuis le dashboard';
    RAISE NOTICE '- Vérifier que le projet n''est pas en pause';
END $$;