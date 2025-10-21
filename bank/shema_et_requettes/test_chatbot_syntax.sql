-- =============================================
-- SCRIPT DE TEST DE SYNTAXE
-- Chatbot IA - Vérification avant migration complète
-- =============================================

-- Ce script teste uniquement la syntaxe sans créer les objets
-- Utilisez-le pour vérifier qu'il n'y a pas d'erreurs de syntaxe

-- Test 1: Vérifier que l'extension vector existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        RAISE NOTICE '⚠️  ATTENTION: L''extension pgvector n''est pas installée';
        RAISE NOTICE 'Veuillez activer l''extension dans: Database > Extensions > pgvector';
    ELSE
        RAISE NOTICE '✓ Extension pgvector est installée';
    END IF;
END $$;

-- Test 2: Vérifier que les types ENUM n'existent pas déjà
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_message_role') THEN
        RAISE NOTICE '⚠️  Le type ai_message_role existe déjà';
    ELSE
        RAISE NOTICE '✓ Le type ai_message_role n''existe pas encore';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_type') THEN
        RAISE NOTICE '⚠️  Le type feedback_type existe déjà';
    ELSE
        RAISE NOTICE '✓ Le type feedback_type n''existe pas encore';
    END IF;
END $$;

-- Test 3: Vérifier que les tables n'existent pas déjà
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'ai_chat_sessions') THEN
        RAISE NOTICE '⚠️  La table ai_chat_sessions existe déjà';
    ELSE
        RAISE NOTICE '✓ La table ai_chat_sessions n''existe pas encore';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'ai_chat_messages') THEN
        RAISE NOTICE '⚠️  La table ai_chat_messages existe déjà';
    ELSE
        RAISE NOTICE '✓ La table ai_chat_messages n''existe pas encore';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'document_embeddings') THEN
        RAISE NOTICE '⚠️  La table document_embeddings existe déjà';
    ELSE
        RAISE NOTICE '✓ La table document_embeddings n''existe pas encore';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'ai_chat_feedback') THEN
        RAISE NOTICE '⚠️  La table ai_chat_feedback existe déjà';
    ELSE
        RAISE NOTICE '✓ La table ai_chat_feedback n''existe pas encore';
    END IF;
END $$;

-- Test 4: Vérifier les dépendances (tables requises)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE EXCEPTION 'ERREUR: La table public.users n''existe pas. Exécutez d''abord le script database_complete.sql';
    ELSE
        RAISE NOTICE '✓ La table users existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = 'negotiation_documents') THEN
        RAISE EXCEPTION 'ERREUR: La table public.negotiation_documents n''existe pas. Exécutez d''abord le script database_complete.sql';
    ELSE
        RAISE NOTICE '✓ La table negotiation_documents existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        RAISE EXCEPTION 'ERREUR: La table public.user_roles n''existe pas. Exécutez d''abord le script database_complete.sql';
    ELSE
        RAISE NOTICE '✓ La table user_roles existe';
    END IF;
END $$;

-- Test 5: Vérifier que la fonction update_updated_at_column() existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        RAISE EXCEPTION 'ERREUR: La fonction update_updated_at_column() n''existe pas';
    ELSE
        RAISE NOTICE '✓ La fonction update_updated_at_column() existe';
    END IF;
END $$;

-- Test 6: Vérifier que le type session_category_v2 existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_category_v2') THEN
        RAISE EXCEPTION 'ERREUR: Le type session_category_v2 n''existe pas. Exécutez d''abord le script database_complete.sql';
    ELSE
        RAISE NOTICE '✓ Le type session_category_v2 existe';
    END IF;
END $$;

-- Résumé final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TESTS DE SYNTAXE TERMINÉS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Si tous les tests sont ✓, vous pouvez exécuter:';
    RAISE NOTICE '  - chatbot_ia_migration.sql';
    RAISE NOTICE '';
    RAISE NOTICE 'Si vous voyez des ⚠️  ou des ERREURS:';
    RAISE NOTICE '  1. Installer pgvector si nécessaire';
    RAISE NOTICE '  2. Exécuter database_complete.sql d''abord';
    RAISE NOTICE '  3. Ou utiliser chatbot_ia_rollback.sql pour nettoyer';
    RAISE NOTICE '';
END $$;
