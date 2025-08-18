-- =============================================
-- Trigger pour créer automatiquement des notifications 
-- lors de demandes de connexion
-- =============================================

-- Fonction pour créer une notification lors d'une nouvelle demande de connexion
CREATE OR REPLACE FUNCTION public.create_connection_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer une notification seulement pour les nouvelles demandes de connexion
    IF NEW.status = 'pending' AND (OLD IS NULL OR OLD.status != 'pending') THEN
        INSERT INTO public.notifications (
            user_id,
            notification_type,
            title,
            content,
            related_entity_id,
            is_read
        ) VALUES (
            NEW.recipient_id,
            'connection_request',
            'Nouvelle demande de connexion',
            'Quelqu''un souhaite se connecter avec vous',
            NEW.id,
            false
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table connections
DROP TRIGGER IF EXISTS connection_notification_trigger ON public.connections;
CREATE TRIGGER connection_notification_trigger
    AFTER INSERT OR UPDATE ON public.connections
    FOR EACH ROW
    EXECUTE FUNCTION public.create_connection_notification();

-- Ajouter des politiques RLS pour les notifications si elles n'existent pas déjà
DO $$ 
BEGIN
    -- Vérifier si la politique existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'users_can_view_own_notifications'
    ) THEN
        CREATE POLICY "users_can_view_own_notifications" ON public.notifications
            FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'users_can_update_own_notifications'
    ) THEN
        CREATE POLICY "users_can_update_own_notifications" ON public.notifications
            FOR UPDATE USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'users_can_delete_own_notifications'  
    ) THEN
        CREATE POLICY "users_can_delete_own_notifications" ON public.notifications
            FOR DELETE USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'connections' 
        AND policyname = 'users_can_view_own_connections'
    ) THEN
        CREATE POLICY "users_can_view_own_connections" ON public.connections
            FOR SELECT USING (requester_id = auth.uid() OR recipient_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'connections' 
        AND policyname = 'users_can_create_connections'
    ) THEN
        CREATE POLICY "users_can_create_connections" ON public.connections
            FOR INSERT WITH CHECK (requester_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'connections' 
        AND policyname = 'users_can_update_own_connections'
    ) THEN
        CREATE POLICY "users_can_update_own_connections" ON public.connections
            FOR UPDATE USING (requester_id = auth.uid() OR recipient_id = auth.uid())
            WITH CHECK (requester_id = auth.uid() OR recipient_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'connections' 
        AND policyname = 'users_can_delete_own_connections'
    ) THEN
        CREATE POLICY "users_can_delete_own_connections" ON public.connections
            FOR DELETE USING (requester_id = auth.uid() OR recipient_id = auth.uid());
    END IF;
END $$;

COMMENT ON FUNCTION public.create_connection_notification() IS 'Fonction trigger pour créer automatiquement des notifications lors de nouvelles demandes de connexion';
COMMENT ON TRIGGER connection_notification_trigger ON public.connections IS 'Trigger qui crée une notification automatiquement quand une demande de connexion est créée avec le statut pending';