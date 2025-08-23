-- =============================================
-- Script pour vérifier les politiques RLS et Realtime
-- Date: 2025-08-22
-- Description: Vérifie que les politiques RLS permettent le temps réel
-- =============================================

-- 1. Vérifier l'état de RLS sur les tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN 'RLS ACTIVÉ'
        ELSE 'RLS DÉSACTIVÉ'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('messages', 'group_messages', 'connections', 'appointments', 'notifications')
ORDER BY tablename;

-- 2. Lister toutes les politiques RLS existantes
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

-- 3. Vérifier que les tables sont dans la publication Realtime
SELECT 
    schemaname,
    tablename,
    rowfilter
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 4. Vérifier REPLICA IDENTITY
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

-- 5. IMPORTANT: Pour que Realtime fonctionne avec RLS, il faut:
-- - Soit désactiver RLS sur les tables (non recommandé pour la sécurité)
-- - Soit créer des politiques qui permettent SELECT pour le service Realtime

-- Création de politiques pour Realtime (si nécessaire)
-- Ces politiques permettent à tous les utilisateurs authentifiés de SELECT
-- les données qui les concernent, ce qui est nécessaire pour Realtime

-- Pour la table messages
DO $$
BEGIN
    -- Supprimer les anciennes politiques si elles existent
    DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;
    DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.messages;
    
    -- Créer une nouvelle politique pour permettre la lecture
    CREATE POLICY "Enable read for authenticated users" 
    ON public.messages 
    FOR SELECT 
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );
    
    RAISE NOTICE 'Politique RLS pour messages créée/mise à jour';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création de la politique messages: %', SQLERRM;
END $$;

-- Pour la table group_messages
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable read for group members" ON public.group_messages;
    
    CREATE POLICY "Enable read for group members" 
    ON public.group_messages 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = group_messages.group_id 
            AND user_id = auth.uid()
        )
    );
    
    RAISE NOTICE 'Politique RLS pour group_messages créée/mise à jour';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création de la politique group_messages: %', SQLERRM;
END $$;

-- Pour la table notifications
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Enable read for owner" ON public.notifications;
    
    CREATE POLICY "Enable read for owner" 
    ON public.notifications 
    FOR SELECT 
    USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Politique RLS pour notifications créée/mise à jour';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création de la politique notifications: %', SQLERRM;
END $$;

-- Pour la table connections
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
    DROP POLICY IF EXISTS "Enable read for connected users" ON public.connections;
    
    CREATE POLICY "Enable read for connected users" 
    ON public.connections 
    FOR SELECT 
    USING (
        auth.uid() = requester_id OR 
        auth.uid() = recipient_id
    );
    
    RAISE NOTICE 'Politique RLS pour connections créée/mise à jour';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création de la politique connections: %', SQLERRM;
END $$;

-- Pour la table appointments
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Enable read for participants" ON public.appointments;
    
    CREATE POLICY "Enable read for participants" 
    ON public.appointments 
    FOR SELECT 
    USING (
        auth.uid() = requester_id OR 
        auth.uid() = recipient_id
    );
    
    RAISE NOTICE 'Politique RLS pour appointments créée/mise à jour';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création de la politique appointments: %', SQLERRM;
END $$;

-- 6. S'assurer que RLS est activé sur toutes les tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 7. Créer des politiques pour INSERT/UPDATE si nécessaire
-- Messages - INSERT
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
    
    CREATE POLICY "Users can insert their own messages" 
    ON public.messages 
    FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);
    
    RAISE NOTICE 'Politique INSERT pour messages créée';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur: %', SQLERRM;
END $$;

-- Messages - UPDATE
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
    
    CREATE POLICY "Users can update their own messages" 
    ON public.messages 
    FOR UPDATE 
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);
    
    RAISE NOTICE 'Politique UPDATE pour messages créée';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur: %', SQLERRM;
END $$;

-- 8. Vérification finale
SELECT 
    'Messages' as table_name,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'messages'
UNION ALL
SELECT 
    'Group Messages',
    COUNT(*)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'group_messages'
UNION ALL
SELECT 
    'Notifications',
    COUNT(*)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'notifications'
UNION ALL
SELECT 
    'Connections',
    COUNT(*)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'connections'
UNION ALL
SELECT 
    'Appointments',
    COUNT(*)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'appointments';

-- Message final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Configuration RLS pour Realtime terminée';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Les politiques RLS ont été créées/mises à jour.';
    RAISE NOTICE 'Realtime devrait maintenant fonctionner correctement.';
    RAISE NOTICE '';
    RAISE NOTICE 'Si les problèmes persistent:';
    RAISE NOTICE '1. Vérifiez les logs Supabase dans le dashboard';
    RAISE NOTICE '2. Testez avec le composant RealtimeDebug';
    RAISE NOTICE '3. Vérifiez que l''utilisateur est bien authentifié';
END $$;