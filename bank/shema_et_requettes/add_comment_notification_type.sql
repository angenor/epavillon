-- Ajouter le type 'revision_comment' au enum notification_type si ce n'est pas déjà fait
-- Ce type est utilisé pour les notifications de commentaires de révision d'activités
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'revision_comment'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
    ) THEN
        ALTER TYPE notification_type ADD VALUE 'revision_comment';
    END IF;
END$$;

COMMENT ON TYPE notification_type IS 'Types de notifications: connection_request (demandes de connexion), revision_comment (commentaires de révision d''activités), etc.';
