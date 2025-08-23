-- =============================================
-- Script pour activer Supabase Realtime 
-- Date: 2025-08-22 (Mis à jour)
-- Description: Active les fonctionnalités temps réel pour la messagerie et présence
-- =============================================

-- Vérifier que la publication existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        RAISE EXCEPTION 'Publication supabase_realtime does not exist. Please create it first.';
    END IF;
END $$;

-- Nettoyer d'abord les tables existantes de la publication (évite les erreurs si déjà ajoutées)
DO $$
BEGIN
    -- Supprimer les tables de la publication si elles existent déjà
    BEGIN
        ALTER publication supabase_realtime DROP TABLE public.messages;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER publication supabase_realtime DROP TABLE public.group_messages;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER publication supabase_realtime DROP TABLE public.connections;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER publication supabase_realtime DROP TABLE public.appointments;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER publication supabase_realtime DROP TABLE public.notifications;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- Configurer REPLICA IDENTITY pour optimiser les changements en temps réel
-- Ceci est crucial pour que Supabase Realtime fonctionne correctement
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.group_messages REPLICA IDENTITY FULL;
ALTER TABLE public.connections REPLICA IDENTITY FULL;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication
ALTER publication supabase_realtime ADD TABLE public.messages;
ALTER publication supabase_realtime ADD TABLE public.group_messages;
ALTER publication supabase_realtime ADD TABLE public.connections;
ALTER publication supabase_realtime ADD TABLE public.appointments;
ALTER publication supabase_realtime ADD TABLE public.notifications;

-- Vérifier la configuration des tables
SELECT 
    schemaname, 
    tablename,
    rowfilter
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Vérifier le statut de REPLICA IDENTITY pour chaque table
SELECT 
    n.nspname AS schemaname,
    c.relname AS tablename,
    CASE c.relreplident
        WHEN 'd' THEN 'default'
        WHEN 'n' THEN 'nothing'
        WHEN 'f' THEN 'full'
        WHEN 'i' THEN 'index'
    END AS replica_identity
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relname IN ('messages', 'group_messages', 'connections', 'appointments', 'notifications')
AND c.relkind = 'r'
ORDER BY c.relname;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Supabase Realtime configuration completed successfully!';
    RAISE NOTICE 'Tables configured: messages, group_messages, connections, appointments, notifications';
    RAISE NOTICE 'All tables set to REPLICA IDENTITY FULL for optimal real-time performance';
END $$;