-- =============================================
-- SCHÉMA SQL POUR LE CHATBOT IA
-- Institut de la Francophonie pour le Développement Durable (IFDD)
-- Fonctionnalité 1: Négociation de Documents
-- =============================================

-- =============================================
-- EXTENSIONS NÉCESSAIRES
-- =============================================

-- Extension pour les vecteurs d'embeddings (recherche sémantique)
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- TYPES ENUM
-- =============================================

-- Type de rôle pour les messages du chatbot
CREATE TYPE ai_message_role AS ENUM ('user', 'assistant', 'system');

-- Type de feedback utilisateur
CREATE TYPE feedback_type AS ENUM ('positive', 'negative');

-- =============================================
-- 1. TABLE DES SESSIONS DE CHAT
-- =============================================

CREATE TABLE public.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT, -- Titre généré automatiquement ou défini par l'utilisateur
    feature_type TEXT NOT NULL DEFAULT 'negotiation_documents', -- Type de fonctionnalité
    category session_category_v2, -- 'climate', 'biodiversity', 'desertification' (nullable pour multi-catégorie)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_ai_chat_sessions_user ON public.ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_sessions_active ON public.ai_chat_sessions(is_active);
CREATE INDEX idx_ai_chat_sessions_created_at ON public.ai_chat_sessions(created_at DESC);

-- Trigger pour mise à jour automatique du timestamp
CREATE TRIGGER update_ai_chat_sessions_updated_at
BEFORE UPDATE ON public.ai_chat_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaire de documentation
COMMENT ON TABLE public.ai_chat_sessions IS 'Sessions de conversation avec le chatbot IA pour différentes fonctionnalités';
COMMENT ON COLUMN public.ai_chat_sessions.feature_type IS 'Type de fonctionnalité du chatbot (negotiation_documents, user_assistance, etc.)';
COMMENT ON COLUMN public.ai_chat_sessions.category IS 'Catégorie optionnelle pour filtrer les documents (climate, biodiversity, desertification)';

-- =============================================
-- 2. TABLE DES MESSAGES DE CHAT
-- =============================================

CREATE TABLE public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
    role ai_message_role NOT NULL,
    content TEXT NOT NULL,
    -- Métadonnées pour les références aux documents sources
    source_documents JSONB, -- Format: [{"document_id": "uuid", "title": "...", "pages": [1, 2], "relevance_score": 0.95}]
    -- Métadonnées supplémentaires (tokens utilisés, temps de réponse, modèle utilisé)
    metadata JSONB, -- Format: {"tokens": 150, "response_time_ms": 1200, "model": "claude-3-sonnet", "temperature": 0.7}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_ai_chat_messages_session ON public.ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_messages_created_at ON public.ai_chat_messages(created_at);
CREATE INDEX idx_ai_chat_messages_role ON public.ai_chat_messages(role);

-- Commentaire de documentation
COMMENT ON TABLE public.ai_chat_messages IS 'Messages échangés dans les sessions de chat avec le chatbot IA';
COMMENT ON COLUMN public.ai_chat_messages.source_documents IS 'Références aux documents utilisés pour générer la réponse (format JSON)';
COMMENT ON COLUMN public.ai_chat_messages.metadata IS 'Métadonnées de la génération de réponse (tokens, temps, modèle, etc.)';

-- =============================================
-- 3. TABLE DES EMBEDDINGS DE DOCUMENTS
-- =============================================

CREATE TABLE public.document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.negotiation_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL, -- Index du chunk dans le document (commence à 0)
    chunk_text TEXT NOT NULL, -- Texte du chunk
    chunk_metadata JSONB, -- Métadonnées du chunk: {"page": 5, "section": "Introduction", "start_char": 0, "end_char": 1000}
    embedding vector(1536), -- Vecteur d'embedding (dimension 1536 pour text-embedding-3-small d'OpenAI)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, chunk_index)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_document_embeddings_document ON public.document_embeddings(document_id);

-- Index pour recherche vectorielle (cosine similarity)
-- IMPORTANT: Utilise ivfflat pour des recherches rapides sur de grands ensembles de données
CREATE INDEX idx_document_embeddings_vector ON public.document_embeddings
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Commentaire de documentation
COMMENT ON TABLE public.document_embeddings IS 'Embeddings vectoriels des documents de négociation pour la recherche sémantique (RAG)';
COMMENT ON COLUMN public.document_embeddings.chunk_index IS 'Index du chunk dans le document (commence à 0, incrémenté séquentiellement)';
COMMENT ON COLUMN public.document_embeddings.chunk_text IS 'Texte brut du chunk extrait du document';
COMMENT ON COLUMN public.document_embeddings.chunk_metadata IS 'Métadonnées du chunk (numéro de page, section, position dans le document, etc.)';
COMMENT ON COLUMN public.document_embeddings.embedding IS 'Vecteur d''embedding (1536 dimensions pour OpenAI text-embedding-3-small)';

-- =============================================
-- 4. TABLE DES FEEDBACKS UTILISATEURS
-- =============================================

CREATE TABLE public.ai_chat_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.ai_chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    feedback_type feedback_type NOT NULL,
    comment TEXT, -- Commentaire optionnel de l'utilisateur
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_ai_chat_feedback_message ON public.ai_chat_feedback(message_id);
CREATE INDEX idx_ai_chat_feedback_user ON public.ai_chat_feedback(user_id);
CREATE INDEX idx_ai_chat_feedback_type ON public.ai_chat_feedback(feedback_type);

-- Commentaire de documentation
COMMENT ON TABLE public.ai_chat_feedback IS 'Feedbacks des utilisateurs sur les réponses du chatbot (pouce haut/bas)';
COMMENT ON COLUMN public.ai_chat_feedback.comment IS 'Commentaire optionnel pour préciser le feedback';

-- =============================================
-- POLITIQUES RLS (Row Level Security)
-- =============================================

-- Activation RLS sur toutes les tables
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_feedback ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLITIQUES POUR ai_chat_sessions
-- =============================================

-- Les utilisateurs peuvent voir leurs propres sessions
CREATE POLICY "Users can view own chat sessions" ON public.ai_chat_sessions
    FOR SELECT USING (user_id = auth.uid());

-- Les utilisateurs peuvent créer leurs propres sessions
CREATE POLICY "Users can create own chat sessions" ON public.ai_chat_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent mettre à jour leurs propres sessions
CREATE POLICY "Users can update own chat sessions" ON public.ai_chat_sessions
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs propres sessions
CREATE POLICY "Users can delete own chat sessions" ON public.ai_chat_sessions
    FOR DELETE USING (user_id = auth.uid());

-- Les admins peuvent voir toutes les sessions
CREATE POLICY "Admins can view all chat sessions" ON public.ai_chat_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- =============================================
-- POLITIQUES POUR ai_chat_messages
-- =============================================

-- Les utilisateurs peuvent voir les messages de leurs propres sessions
CREATE POLICY "Users can view messages from own sessions" ON public.ai_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ai_chat_sessions
            WHERE id = ai_chat_messages.session_id
            AND user_id = auth.uid()
        )
    );

-- Les utilisateurs peuvent créer des messages dans leurs propres sessions
CREATE POLICY "Users can create messages in own sessions" ON public.ai_chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_chat_sessions
            WHERE id = ai_chat_messages.session_id
            AND user_id = auth.uid()
        )
    );

-- Les admins peuvent voir tous les messages
CREATE POLICY "Admins can view all chat messages" ON public.ai_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- =============================================
-- POLITIQUES POUR document_embeddings
-- =============================================

-- Tous les utilisateurs authentifiés peuvent lire les embeddings
-- (nécessaire pour la recherche sémantique)
CREATE POLICY "Authenticated users can view document embeddings" ON public.document_embeddings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Seuls les admins peuvent insérer/modifier/supprimer les embeddings
CREATE POLICY "Admins can manage document embeddings" ON public.document_embeddings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- =============================================
-- POLITIQUES POUR ai_chat_feedback
-- =============================================

-- Les utilisateurs peuvent voir leurs propres feedbacks
CREATE POLICY "Users can view own feedback" ON public.ai_chat_feedback
    FOR SELECT USING (user_id = auth.uid());

-- Les utilisateurs peuvent créer leurs propres feedbacks
CREATE POLICY "Users can create own feedback" ON public.ai_chat_feedback
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent mettre à jour leurs propres feedbacks
CREATE POLICY "Users can update own feedback" ON public.ai_chat_feedback
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs propres feedbacks
CREATE POLICY "Users can delete own feedback" ON public.ai_chat_feedback
    FOR DELETE USING (user_id = auth.uid());

-- Les admins peuvent voir tous les feedbacks
CREATE POLICY "Admins can view all feedback" ON public.ai_chat_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour rechercher des documents par similarité sémantique
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
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

COMMENT ON FUNCTION search_similar_documents IS 'Recherche de documents similaires par similarité cosinus avec un embedding donné';

-- Fonction pour obtenir les statistiques d'une session de chat
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
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

COMMENT ON FUNCTION get_chat_session_stats IS 'Obtient les statistiques complètes d''une session de chat';

-- Fonction pour générer un titre automatique de session basé sur le premier message
CREATE OR REPLACE FUNCTION generate_session_title()
RETURNS TRIGGER AS $$
DECLARE
    first_user_message TEXT;
    session_title TEXT;
BEGIN
    -- Récupérer le premier message utilisateur de la session
    SELECT content INTO first_user_message
    FROM public.ai_chat_messages
    WHERE session_id = NEW.session_id
    AND role = 'user'
    ORDER BY created_at ASC
    LIMIT 1;

    -- Si un message existe, générer un titre (max 50 caractères)
    IF first_user_message IS NOT NULL THEN
        session_title := LEFT(first_user_message, 50);
        IF LENGTH(first_user_message) > 50 THEN
            session_title := session_title || '...';
        END IF;

        -- Mettre à jour le titre de la session si elle n'en a pas déjà un
        UPDATE public.ai_chat_sessions
        SET title = session_title
        WHERE id = NEW.session_id
        AND title IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un titre de session
CREATE TRIGGER auto_generate_session_title
AFTER INSERT ON public.ai_chat_messages
FOR EACH ROW
WHEN (NEW.role = 'user')
EXECUTE FUNCTION generate_session_title();

COMMENT ON FUNCTION generate_session_title IS 'Génère automatiquement un titre de session basé sur le premier message utilisateur';

-- Fonction pour nettoyer les anciennes sessions inactives
CREATE OR REPLACE FUNCTION cleanup_old_chat_sessions(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Supprimer les sessions inactives de plus de X jours
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

COMMENT ON FUNCTION cleanup_old_chat_sessions IS 'Nettoie les sessions de chat inactives de plus de X jours (par défaut 90)';

-- =============================================
-- VUES UTILES
-- =============================================

-- Vue pour obtenir toutes les sessions avec leurs statistiques
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
GROUP BY s.id, s.user_id, s.title, s.feature_type, s.category, s.is_active, s.created_at, s.updated_at;

COMMENT ON VIEW v_chat_sessions_with_stats IS 'Vue consolidée des sessions de chat avec leurs statistiques';

-- Vue pour obtenir les documents avec le nombre d'embeddings
CREATE OR REPLACE VIEW v_documents_with_embeddings AS
SELECT
    nd.id as document_id,
    nd.title,
    nd.document_type,
    nd.category,
    nd.description,
    nd.file_url,
    nd.created_at,
    COUNT(de.id) as total_chunks,
    MIN(de.created_at) as first_embedding_created_at,
    MAX(de.created_at) as last_embedding_created_at
FROM public.negotiation_documents nd
LEFT JOIN public.document_embeddings de ON nd.id = de.document_id
GROUP BY nd.id, nd.title, nd.document_type, nd.category, nd.description, nd.file_url, nd.created_at;

COMMENT ON VIEW v_documents_with_embeddings IS 'Vue des documents de négociation avec le nombre d''embeddings générés';

-- =============================================
-- INDEX SUPPLÉMENTAIRES POUR PERFORMANCE
-- =============================================

-- Index GIN pour recherche dans les métadonnées JSON
CREATE INDEX idx_ai_chat_messages_metadata ON public.ai_chat_messages USING GIN (metadata);
CREATE INDEX idx_ai_chat_messages_source_documents ON public.ai_chat_messages USING GIN (source_documents);
CREATE INDEX idx_document_embeddings_metadata ON public.document_embeddings USING GIN (chunk_metadata);

-- =============================================
-- GRANTS ET PERMISSIONS
-- =============================================

-- Accorder les permissions nécessaires aux utilisateurs authentifiés
GRANT SELECT ON public.ai_chat_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_chat_sessions TO authenticated;

GRANT SELECT ON public.ai_chat_messages TO authenticated;
GRANT SELECT, INSERT ON public.ai_chat_messages TO authenticated;

GRANT SELECT ON public.document_embeddings TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_chat_feedback TO authenticated;

GRANT SELECT ON v_chat_sessions_with_stats TO authenticated;
GRANT SELECT ON v_documents_with_embeddings TO authenticated;

-- =============================================
-- NOTES D'IMPLÉMENTATION
-- =============================================

/*
IMPORTANT - À FAIRE APRÈS L'EXÉCUTION DE CE SCRIPT:

1. Installer l'extension vector dans Supabase:
   - Aller dans Database > Extensions
      - Activer "pgvector"

2. Configurer les variables d'environnement:
   - VITE_ANTHROPIC_API_KEY
   - VITE_OPENAI_API_KEY

3. Générer les embeddings pour les documents existants:
   - Exécuter le script: node src/scripts/generateDocumentEmbeddings.js

4. Configurer les Edge Functions Supabase pour les appels API sécurisés

5. Tester les permissions RLS pour chaque rôle utilisateur

6. Monitorer l'utilisation des tokens et les coûts API

7. Mettre en place un système de cache pour réduire les appels API

8. Configurer les alertes pour les erreurs et anomalies
*/
