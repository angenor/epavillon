-- =============================================
-- ROLLBACK COMPLET: CHATBOT IA
-- ⚠️ ATTENTION: Ce script supprime toutes les données du chatbot
-- =============================================

-- Confirmation de sécurité
DO $$
BEGIN
    RAISE WARNING '⚠️ ATTENTION: Vous êtes sur le point de supprimer toutes les données du chatbot IA';
    RAISE WARNING 'Cela inclut: sessions, messages, embeddings, feedbacks';
    RAISE WARNING 'Cette action est IRRÉVERSIBLE';
END $$;

-- =============================================
-- 1. SUPPRESSION DES PERMISSIONS
-- =============================================

REVOKE ALL ON FUNCTION cleanup_old_chat_sessions(INTEGER) FROM authenticated;
REVOKE ALL ON FUNCTION has_chatbot_access(UUID) FROM authenticated;
REVOKE ALL ON FUNCTION get_chat_session_stats(UUID) FROM authenticated;
REVOKE ALL ON FUNCTION search_similar_documents(vector, FLOAT, INT, session_category_v2) FROM authenticated;

REVOKE ALL ON v_documents_with_embeddings FROM authenticated;
REVOKE ALL ON v_chat_sessions_with_stats FROM authenticated;

REVOKE ALL ON public.ai_chat_feedback FROM authenticated;
REVOKE ALL ON public.document_embeddings FROM authenticated;
REVOKE ALL ON public.ai_chat_messages FROM authenticated;
REVOKE ALL ON public.ai_chat_sessions FROM authenticated;

-- =============================================
-- 2. SUPPRESSION DES POLITIQUES RLS
-- =============================================

DROP POLICY IF EXISTS "Users can manage own feedback" ON public.ai_chat_feedback;
DROP POLICY IF EXISTS "Admins can manage embeddings" ON public.document_embeddings;
DROP POLICY IF EXISTS "Authenticated can view embeddings" ON public.document_embeddings;
DROP POLICY IF EXISTS "Users can create messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.ai_chat_sessions;

-- =============================================
-- 3. SUPPRESSION DES TRIGGERS
-- =============================================

DROP TRIGGER IF EXISTS check_access_before_session_create ON public.ai_chat_sessions;
DROP TRIGGER IF EXISTS sanitize_metadata_before_insert ON public.ai_chat_messages;
DROP TRIGGER IF EXISTS update_session_on_new_message ON public.ai_chat_messages;
DROP TRIGGER IF EXISTS auto_generate_session_title ON public.ai_chat_messages;
DROP TRIGGER IF EXISTS update_ai_chat_sessions_updated_at ON public.ai_chat_sessions;

-- =============================================
-- 4. SUPPRESSION DES VUES
-- =============================================

DROP VIEW IF EXISTS v_documents_with_embeddings;
DROP VIEW IF EXISTS v_chat_sessions_with_stats;

-- =============================================
-- 5. SUPPRESSION DES FONCTIONS
-- =============================================

DROP FUNCTION IF EXISTS check_chatbot_access_on_session_create();
DROP FUNCTION IF EXISTS sanitize_message_metadata();
DROP FUNCTION IF EXISTS update_session_activity();
DROP FUNCTION IF EXISTS generate_session_title();
DROP FUNCTION IF EXISTS cleanup_old_chat_sessions(INTEGER);
DROP FUNCTION IF EXISTS has_chatbot_access(UUID);
DROP FUNCTION IF EXISTS get_chat_session_stats(UUID);
DROP FUNCTION IF EXISTS search_similar_documents(vector, FLOAT, INT, session_category_v2);

-- =============================================
-- 6. SUPPRESSION DES INDEX
-- =============================================

DROP INDEX IF EXISTS public.idx_ai_chat_feedback_user;
DROP INDEX IF EXISTS public.idx_ai_chat_feedback_message;
DROP INDEX IF EXISTS public.idx_document_embeddings_vector;
DROP INDEX IF EXISTS public.idx_document_embeddings_document;
DROP INDEX IF EXISTS public.idx_ai_chat_messages_source_documents;
DROP INDEX IF EXISTS public.idx_ai_chat_messages_metadata;
DROP INDEX IF EXISTS public.idx_ai_chat_messages_created_at;
DROP INDEX IF EXISTS public.idx_ai_chat_messages_session;
DROP INDEX IF EXISTS public.idx_ai_chat_sessions_created_at;
DROP INDEX IF EXISTS public.idx_ai_chat_sessions_active;
DROP INDEX IF EXISTS public.idx_ai_chat_sessions_user;

-- =============================================
-- 7. SUPPRESSION DES TABLES
-- =============================================

DROP TABLE IF EXISTS public.ai_chat_feedback CASCADE;
DROP TABLE IF EXISTS public.document_embeddings CASCADE;
DROP TABLE IF EXISTS public.ai_chat_messages CASCADE;
DROP TABLE IF EXISTS public.ai_chat_sessions CASCADE;

-- =============================================
-- 8. SUPPRESSION DES TYPES ENUM
-- =============================================

DROP TYPE IF EXISTS feedback_type CASCADE;
DROP TYPE IF EXISTS ai_message_role CASCADE;

-- =============================================
-- 9. SUPPRESSION DES EXTENSIONS (OPTIONNEL)
-- =============================================

-- ⚠️ ATTENTION: Décommentez la ligne ci-dessous UNIQUEMENT si vous êtes sûr
-- que l'extension vector n'est pas utilisée ailleurs dans votre base de données
-- DROP EXTENSION IF EXISTS vector CASCADE;

-- =============================================
-- ROLLBACK TERMINÉ
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✓ Rollback terminé';
    RAISE NOTICE 'ℹ Toutes les données du chatbot IA ont été supprimées';
END $$;
