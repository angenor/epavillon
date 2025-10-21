-- =============================================
-- MIGRATION COMPLÈTE: CHATBOT IA
-- Institut de la Francophonie pour le Développement Durable (IFDD)
-- Fonctionnalité: Négociation de Documents avec RAG
-- =============================================

-- =============================================
-- 1. EXTENSIONS
-- =============================================

-- Extension pour les vecteurs d'embeddings (recherche sémantique)
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- 2. TYPES ENUM
-- =============================================

-- Type de rôle pour les messages du chatbot
DO $$ BEGIN
    CREATE TYPE ai_message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Type de feedback utilisateur
DO $$ BEGIN
    CREATE TYPE feedback_type AS ENUM ('positive', 'negative');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- 3. TABLES
-- =============================================

-- Table des sessions de chat
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    feature_type TEXT NOT NULL DEFAULT 'negotiation_documents',
    category session_category_v2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des messages de chat
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
    role ai_message_role NOT NULL,
    content TEXT NOT NULL,
    source_documents JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des embeddings de documents
CREATE TABLE IF NOT EXISTS public.document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.negotiation_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_metadata JSONB,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, chunk_index)
);

-- Table des feedbacks utilisateurs
CREATE TABLE IF NOT EXISTS public.ai_chat_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.ai_chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    feedback_type feedback_type NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- =============================================
-- 4. INDEX
-- =============================================

-- Index pour ai_chat_sessions
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user ON public.ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_active ON public.ai_chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_created_at ON public.ai_chat_sessions(created_at DESC);

-- Index pour ai_chat_messages
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON public.ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON public.ai_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_metadata ON public.ai_chat_messages USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_source_documents ON public.ai_chat_messages USING GIN (source_documents);

-- Index pour document_embeddings
CREATE INDEX IF NOT EXISTS idx_document_embeddings_document ON public.document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector ON public.document_embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index pour ai_chat_feedback
CREATE INDEX IF NOT EXISTS idx_ai_chat_feedback_message ON public.ai_chat_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_feedback_user ON public.ai_chat_feedback(user_id);

-- =============================================
-- 5. FONCTIONS
-- =============================================

-- Fonction de recherche sémantique
CREATE OR REPLACE FUNCTION search_similar_documents(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5,
    filter_category session_category_v2 DEFAULT NULL
)
RETURNS TABLE (
    document_id UUID,
    chunk_id UUID,
    chunk_text TEXT,
    chunk_metadata JSONB,
    similarity FLOAT,
    document_title TEXT,
    document_category session_category_v2
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        de.document_id,
        de.id as chunk_id,
        de.chunk_text,
        de.chunk_metadata,
        1 - (de.embedding <=> query_embedding) as similarity,
        nd.title as document_title,
        nd.category as document_category
    FROM public.document_embeddings de
    JOIN public.negotiation_documents nd ON de.document_id = nd.id
    WHERE
        (1 - (de.embedding <=> query_embedding)) > match_threshold
        AND (filter_category IS NULL OR nd.category = filter_category)
    ORDER BY de.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Fonction de statistiques de session
CREATE OR REPLACE FUNCTION get_chat_session_stats(session_uuid UUID)
RETURNS TABLE (
    session_id UUID,
    total_messages INTEGER,
    user_messages INTEGER,
    assistant_messages INTEGER,
    total_tokens INTEGER,
    average_response_time_ms FLOAT,
    positive_feedbacks INTEGER,
    negative_feedbacks INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id as session_id,
        COUNT(m.id)::INTEGER as total_messages,
        COUNT(CASE WHEN m.role = 'user' THEN 1 END)::INTEGER as user_messages,
        COUNT(CASE WHEN m.role = 'assistant' THEN 1 END)::INTEGER as assistant_messages,
        COALESCE(SUM((m.metadata->>'tokens')::INTEGER), 0)::INTEGER as total_tokens,
        COALESCE(AVG((m.metadata->>'response_time_ms')::FLOAT), 0)::FLOAT as average_response_time_ms,
        COUNT(CASE WHEN f.feedback_type = 'positive' THEN 1 END)::INTEGER as positive_feedbacks,
        COUNT(CASE WHEN f.feedback_type = 'negative' THEN 1 END)::INTEGER as negative_feedbacks
    FROM public.ai_chat_sessions s
    LEFT JOIN public.ai_chat_messages m ON s.id = m.session_id
    LEFT JOIN public.ai_chat_feedback f ON m.id = f.message_id
    WHERE s.id = session_uuid
    GROUP BY s.id;
END;
$$;

-- Fonction de vérification d'accès
CREATE OR REPLACE FUNCTION has_chatbot_access(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = user_uuid
        AND role IN ('negotiator', 'admin', 'super_admin')
        AND is_active = TRUE
        AND (valid_until IS NULL OR valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction de nettoyage
CREATE OR REPLACE FUNCTION cleanup_old_chat_sessions(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM public.ai_chat_sessions
        WHERE is_active = FALSE
        AND updated_at < NOW() - INTERVAL '1 day' * days_old
        RETURNING *
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. VUES
-- =============================================

-- Vue des sessions avec statistiques
CREATE OR REPLACE VIEW v_chat_sessions_with_stats AS
SELECT
    s.id as session_id,
    s.user_id,
    s.title,
    s.feature_type,
    s.category,
    s.is_active,
    s.created_at,
    s.updated_at,
    COUNT(m.id) as total_messages,
    COUNT(CASE WHEN m.role = 'user' THEN 1 END) as user_messages,
    COUNT(CASE WHEN m.role = 'assistant' THEN 1 END) as assistant_messages,
    MAX(m.created_at) as last_message_at,
    COUNT(CASE WHEN f.feedback_type = 'positive' THEN 1 END) as positive_feedbacks,
    COUNT(CASE WHEN f.feedback_type = 'negative' THEN 1 END) as negative_feedbacks
FROM public.ai_chat_sessions s
LEFT JOIN public.ai_chat_messages m ON s.id = m.session_id
LEFT JOIN public.ai_chat_feedback f ON m.id = f.message_id
GROUP BY s.id;

-- Vue des documents avec embeddings
CREATE OR REPLACE VIEW v_documents_with_embeddings AS
SELECT
    nd.id as document_id,
    nd.title,
    nd.document_type,
    nd.category,
    nd.file_url,
    COUNT(de.id) as total_chunks,
    CASE WHEN COUNT(de.id) > 0 THEN true ELSE false END as has_embeddings
FROM public.negotiation_documents nd
LEFT JOIN public.document_embeddings de ON nd.id = de.document_id
GROUP BY nd.id;

-- =============================================
-- 7. TRIGGERS
-- =============================================

-- Fonction pour générer le titre de session
CREATE OR REPLACE FUNCTION generate_session_title()
RETURNS TRIGGER AS $$
DECLARE
    first_user_message TEXT;
    session_title TEXT;
BEGIN
    SELECT content INTO first_user_message
    FROM public.ai_chat_messages
    WHERE session_id = NEW.session_id AND role = 'user'
    ORDER BY created_at ASC LIMIT 1;

    IF first_user_message IS NOT NULL THEN
        session_title := LEFT(first_user_message, 50);
        IF LENGTH(first_user_message) > 50 THEN
            session_title := session_title || '...';
        END IF;

        UPDATE public.ai_chat_sessions
        SET title = session_title
        WHERE id = NEW.session_id AND title IS NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour l'activité de session
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ai_chat_sessions
    SET updated_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider les métadonnées
CREATE OR REPLACE FUNCTION sanitize_message_metadata()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.metadata IS NULL THEN NEW.metadata = '{}'::jsonb; END IF;
    IF NEW.source_documents IS NULL THEN NEW.source_documents = '[]'::jsonb; END IF;
    IF jsonb_typeof(NEW.source_documents) != 'array' THEN
        RAISE EXCEPTION 'source_documents doit être un tableau JSON';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier les permissions
CREATE OR REPLACE FUNCTION check_chatbot_access_on_session_create()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT has_chatbot_access(NEW.user_id) THEN
        RAISE EXCEPTION 'Accès refusé: rôles requis (negotiator, admin, super_admin)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création des triggers
CREATE TRIGGER update_ai_chat_sessions_updated_at
    BEFORE UPDATE ON public.ai_chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER auto_generate_session_title
    AFTER INSERT ON public.ai_chat_messages
    FOR EACH ROW WHEN (NEW.role = 'user')
    EXECUTE FUNCTION generate_session_title();

CREATE TRIGGER update_session_on_new_message
    AFTER INSERT ON public.ai_chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_session_activity();

CREATE TRIGGER sanitize_metadata_before_insert
    BEFORE INSERT OR UPDATE ON public.ai_chat_messages
    FOR EACH ROW EXECUTE FUNCTION sanitize_message_metadata();

CREATE TRIGGER check_access_before_session_create
    BEFORE INSERT ON public.ai_chat_sessions
    FOR EACH ROW EXECUTE FUNCTION check_chatbot_access_on_session_create();

-- =============================================
-- 8. POLITIQUES RLS
-- =============================================

ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_feedback ENABLE ROW LEVEL SECURITY;

-- Politiques pour ai_chat_sessions
CREATE POLICY "Users can manage own sessions" ON public.ai_chat_sessions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions" ON public.ai_chat_sessions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin') AND is_active = true)
    );

-- Politiques pour ai_chat_messages
CREATE POLICY "Users can view own messages" ON public.ai_chat_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.ai_chat_sessions
        WHERE id = ai_chat_messages.session_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can create messages" ON public.ai_chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.ai_chat_sessions
        WHERE id = ai_chat_messages.session_id AND user_id = auth.uid())
    );

-- Politiques pour document_embeddings
CREATE POLICY "Authenticated can view embeddings" ON public.document_embeddings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage embeddings" ON public.document_embeddings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin') AND is_active = true)
    );

-- Politiques pour ai_chat_feedback
CREATE POLICY "Users can manage own feedback" ON public.ai_chat_feedback
    FOR ALL USING (user_id = auth.uid());

-- =============================================
-- 9. PERMISSIONS
-- =============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_chat_sessions TO authenticated;
GRANT SELECT, INSERT ON public.ai_chat_messages TO authenticated;
GRANT SELECT ON public.document_embeddings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_chat_feedback TO authenticated;

GRANT SELECT ON v_chat_sessions_with_stats TO authenticated;
GRANT SELECT ON v_documents_with_embeddings TO authenticated;

GRANT EXECUTE ON FUNCTION search_similar_documents(vector, FLOAT, INT, session_category_v2) TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_session_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_chatbot_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_chat_sessions(INTEGER) TO authenticated;

-- =============================================
-- MIGRATION TERMINÉE
-- =============================================

-- Vérification finale
DO $$
BEGIN
    RAISE NOTICE '✓ Migration du chatbot IA terminée avec succès';
    RAISE NOTICE '✓ Tables créées: 4';
    RAISE NOTICE '✓ Fonctions créées: 4';
    RAISE NOTICE '✓ Vues créées: 2';
    RAISE NOTICE '✓ Triggers créés: 5';
    RAISE NOTICE 'ℹ Prochaine étape: Générer les embeddings avec le script Node.js';
END $$;
