-- Table pour logger les migrations d'utilisateurs depuis Laravel vers Supabase
-- Cette table permet de tracer toutes les opérations de migration et facilite le rollback

CREATE TABLE IF NOT EXISTS public.migration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Référence à l'ancien utilisateur Laravel
    old_user_id BIGINT NOT NULL,

    -- Référence au nouvel utilisateur Supabase (peut être NULL si la migration a échoué)
    new_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

    -- Action effectuée: 'created' (nouvel utilisateur créé) ou 'updated' (utilisateur existant mis à jour)
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'failed')),

    -- Données complètes de l'ancien utilisateur (pour référence et rollback)
    old_user_data JSONB NOT NULL,

    -- Métadonnées
    migrated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Informations supplémentaires (erreurs, notes, etc.)
    notes TEXT,
    error_message TEXT,

    -- Index pour recherche rapide
    CONSTRAINT unique_old_user_id UNIQUE(old_user_id)
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_migration_logs_new_user_id ON public.migration_logs(new_user_id);
CREATE INDEX IF NOT EXISTS idx_migration_logs_action ON public.migration_logs(action);
CREATE INDEX IF NOT EXISTS idx_migration_logs_migrated_at ON public.migration_logs(migrated_at DESC);

-- Commentaires
COMMENT ON TABLE public.migration_logs IS 'Table de log pour tracer les migrations d''utilisateurs depuis l''ancienne plateforme Laravel';
COMMENT ON COLUMN public.migration_logs.old_user_id IS 'ID de l''utilisateur dans l''ancienne base de données Laravel';
COMMENT ON COLUMN public.migration_logs.new_user_id IS 'ID de l''utilisateur dans la nouvelle base de données Supabase';
COMMENT ON COLUMN public.migration_logs.action IS 'Action effectuée: created (nouvel utilisateur), updated (mise à jour ancienneté), ou failed (échec)';
COMMENT ON COLUMN public.migration_logs.old_user_data IS 'Données complètes de l''ancien utilisateur au format JSON pour référence';

-- RLS (Row Level Security)
ALTER TABLE public.migration_logs ENABLE ROW LEVEL SECURITY;

-- Politique: Seuls les admins peuvent lire les logs de migration
CREATE POLICY "Admins can view migration logs"
ON public.migration_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Politique: Seuls les admins peuvent insérer des logs
CREATE POLICY "Admins can insert migration logs"
ON public.migration_logs
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Politique: Seuls les admins peuvent supprimer des logs (pour rollback)
CREATE POLICY "Admins can delete migration logs"
ON public.migration_logs
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);
