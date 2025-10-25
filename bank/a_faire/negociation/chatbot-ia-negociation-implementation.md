# Plan d'implémentation du Chatbot IA - Fonctionnalité 1: Négociation de Documents

## Vue d'ensemble

Implémentation d'un chatbot IA capable de répondre aux questions sur les documents de négociation en s'appuyant sur la table `negotiation_documents` existante. Le chatbot utilisera LangChain.js et Claude (Anthropic) pour fournir des réponses contextualisées avec des références précises (documents, pages, titres).

## Prérequis

- **Accès restreint**: Réservé aux rôles `negotiator`, `admin` et `super_admin`
- **Technologies**: LangChain.js + Claude (Anthropic)
- **Base de données**: Supabase avec la table `negotiation_documents` existante

## Étapes d'implémentation

### Étape 1: Création des tables de base de données pour le chatbot

#### 1.1. Table `ai_chat_sessions` (Sessions de conversation)

Stocke les sessions de chat pour chaque utilisateur.

```sql
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

CREATE INDEX idx_ai_chat_sessions_user ON public.ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_sessions_active ON public.ai_chat_sessions(is_active);

-- Trigger pour mise à jour automatique
CREATE TRIGGER update_ai_chat_sessions_updated_at
BEFORE UPDATE ON public.ai_chat_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 1.2. Table `ai_chat_messages` (Messages de conversation)

Stocke les messages (utilisateur et assistant) dans chaque session.

```sql
CREATE TYPE ai_message_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
    role ai_message_role NOT NULL,
    content TEXT NOT NULL,
    -- Métadonnées pour les références
    source_documents JSONB, -- Références aux documents utilisés pour générer la réponse
    metadata JSONB, -- Informations supplémentaires (tokens utilisés, temps de réponse, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_messages_session ON public.ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_messages_created_at ON public.ai_chat_messages(created_at);
```

#### 1.3. Table `document_embeddings` (Embeddings des documents)

Stocke les embeddings vectoriels des documents pour la recherche sémantique (RAG).

**Note**: Nécessite l'activation de l'extension `vector` dans Supabase:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

```sql
CREATE TABLE public.document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.negotiation_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL, -- Index du chunk dans le document
    chunk_text TEXT NOT NULL, -- Texte du chunk
    chunk_metadata JSONB, -- Métadonnées du chunk (page, section, etc.)
    embedding vector(1536), -- Vecteur d'embedding (dimension 1536 pour text-embedding-3-small d'OpenAI)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, chunk_index)
);

CREATE INDEX idx_document_embeddings_document ON public.document_embeddings(document_id);
-- Index pour recherche vectorielle (cosine similarity)
CREATE INDEX idx_document_embeddings_vector ON public.document_embeddings
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

#### 1.4. Table `ai_chat_feedback` (Retours utilisateurs)

Permet aux utilisateurs de donner un feedback sur les réponses du chatbot.

```sql
CREATE TYPE feedback_type AS ENUM ('positive', 'negative');

CREATE TABLE public.ai_chat_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.ai_chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    feedback_type feedback_type NOT NULL,
    comment TEXT, -- Commentaire optionnel
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE INDEX idx_ai_chat_feedback_message ON public.ai_chat_feedback(message_id);
CREATE INDEX idx_ai_chat_feedback_user ON public.ai_chat_feedback(user_id);
```

#### 1.5. Politiques RLS (Row Level Security)

```sql
-- Politiques pour ai_chat_sessions
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions" ON public.ai_chat_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own chat sessions" ON public.ai_chat_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own chat sessions" ON public.ai_chat_sessions
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own chat sessions" ON public.ai_chat_sessions
    FOR DELETE USING (user_id = auth.uid());

-- Politiques pour ai_chat_messages
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from own sessions" ON public.ai_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ai_chat_sessions
            WHERE id = ai_chat_messages.session_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in own sessions" ON public.ai_chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_chat_sessions
            WHERE id = ai_chat_messages.session_id
            AND user_id = auth.uid()
        )
    );

-- Politiques pour document_embeddings (lecture seule)
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view document embeddings" ON public.document_embeddings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politiques pour ai_chat_feedback
ALTER TABLE public.ai_chat_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback" ON public.ai_chat_feedback
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own feedback" ON public.ai_chat_feedback
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own feedback" ON public.ai_chat_feedback
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own feedback" ON public.ai_chat_feedback
    FOR DELETE USING (user_id = auth.uid());
```

### Étape 2: Configuration des variables d'environnement

Ajouter dans `.env.local`:

```bash
# Anthropic Claude API
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OpenAI API (pour les embeddings)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Configuration du chatbot
VITE_AI_CHAT_MAX_TOKENS=4096
VITE_AI_CHAT_TEMPERATURE=0.7
VITE_AI_CHUNK_SIZE=1000
VITE_AI_CHUNK_OVERLAP=200
```

### Étape 3: Installation des dépendances NPM

```bash
npm install langchain @langchain/anthropic @langchain/openai @langchain/community
npm install @supabase/supabase-js
npm install pdf-parse mammoth # Pour l'extraction de texte des PDF et DOCX
```

### Étape 4: Création des composables AI

#### 4.1. Créer `src/composables/ai/useChatbot.js`

Composable principal pour gérer les conversations avec le chatbot.

**Fonctionnalités**:
- Créer/gérer des sessions de chat
- Envoyer des messages au chatbot
- Recevoir des réponses avec références
- Gérer l'historique des conversations

#### 4.2. Créer `src/composables/ai/useDocumentEmbeddings.js`

Composable pour gérer les embeddings des documents.

**Fonctionnalités**:
- Extraire le texte des documents PDF/DOCX
- Diviser le texte en chunks
- Générer les embeddings avec OpenAI
- Stocker les embeddings dans Supabase
- Recherche sémantique (similarity search)

#### 4.3. Créer `src/composables/ai/useRAG.js`

Composable pour le système RAG (Retrieval Augmented Generation).

**Fonctionnalités**:
- Rechercher les documents pertinents via similarity search
- Construire le contexte pour Claude
- Générer des réponses avec références
- Formater les réponses avec citations

#### 4.4. Créer `src/composables/ai/useChatPermissions.js`

Composable pour vérifier les permissions d'accès au chatbot.

**Fonctionnalités**:
- Vérifier si l'utilisateur a un rôle autorisé (negotiator, admin, super_admin)
- Bloquer l'accès si nécessaire

### Étape 5: Création des utilitaires

#### 5.1. Créer `src/utils/ai/documentProcessor.js`

Utilitaire pour traiter les documents.

**Fonctions**:
- `extractTextFromPDF(fileUrl)`: Extraire le texte d'un PDF
- `extractTextFromDOCX(fileUrl)`: Extraire le texte d'un DOCX
- `splitTextIntoChunks(text, chunkSize, overlap)`: Diviser le texte en chunks
- `extractMetadata(fileUrl)`: Extraire les métadonnées (pages, sections)

#### 5.2. Créer `src/utils/ai/embeddingGenerator.js`

Utilitaire pour générer les embeddings.

**Fonctions**:
- `generateEmbedding(text)`: Générer un embedding avec OpenAI
- `batchGenerateEmbeddings(texts)`: Générer plusieurs embeddings en batch

#### 5.3. Créer `src/utils/ai/responseFormatter.js`

Utilitaire pour formater les réponses du chatbot.

**Fonctions**:
- `formatResponseWithReferences(response, sources)`: Formater la réponse avec les références
- `extractReferences(sources)`: Extraire les références (documents, pages, titres)

### Étape 6: Création des composants Vue

#### 6.1. Créer `src/components/ai/ChatbotWidget.vue`

Widget principal du chatbot (peut être affiché en overlay ou intégré).

**Composants internes**:
- Zone de saisie du message
- Liste des messages
- Indicateur de frappe
- Bouton pour nouvelle session
- Historique des sessions

#### 6.2. Créer `src/components/ai/ChatMessage.vue`

Composant pour afficher un message (utilisateur ou assistant).

**Fonctionnalités**:
- Affichage différencié selon le rôle (user/assistant)
- Affichage des références (documents, pages)
- Boutons de feedback (pouce haut/bas)
- Copier le message

#### 6.3. Créer `src/components/ai/ChatSidebar.vue`

Barre latérale pour afficher l'historique des sessions.

**Fonctionnalités**:
- Liste des sessions
- Recherche dans les sessions
- Suppression de sessions
- Filtre par catégorie

#### 6.4. Créer `src/components/ai/DocumentReference.vue`

Composant pour afficher une référence à un document.

**Fonctionnalités**:
- Affichage du titre du document
- Numéro de page
- Lien pour télécharger le document
- Preview au survol

### Étape 7: Création d'une vue dédiée (optionnel)

#### 7.1. Créer `src/views/ai/NegotiationChatbot.vue`

Vue dédiée au chatbot de négociation (accessible uniquement aux utilisateurs autorisés).

**Fonctionnalités**:
- Interface pleine page pour le chatbot
- Sidebar avec historique
- Sélection de catégorie (climate, biodiversity, desertification)
- Paramètres du chatbot (température, max tokens)

### Étape 8: Configuration du routage

Ajouter dans `src/router/index.js`:

```javascript
{
  path: '/ai/negotiation-chatbot',
  name: 'NegotiationChatbot',
  component: () => import('@/views/ai/NegotiationChatbot.vue'),
  meta: {
    requiresAuth: true,
    requiresRole: ['negotiator', 'admin', 'super_admin']
  }
}
```

Ajouter un guard de navigation pour vérifier les rôles:

```javascript
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresRole) {
    const userRoles = await getUserRoles() // À implémenter
    const hasRole = to.meta.requiresRole.some(role => userRoles.includes(role))

    if (!hasRole) {
      next({ name: 'Home' })
      return
    }
  }
  next()
})
```

### Étape 9: Création d'un script de génération des embeddings

#### 9.1. Créer `src/scripts/generateDocumentEmbeddings.js`

Script Node.js pour générer les embeddings de tous les documents existants.

**Fonctionnalités**:
- Récupérer tous les documents depuis Supabase
- Télécharger et extraire le texte
- Générer les embeddings
- Stocker dans la table `document_embeddings`
- Afficher la progression
- Gestion des erreurs et retry

**Commande**:
```bash
node src/scripts/generateDocumentEmbeddings.js
```

### Étape 10: Gestion des erreurs et monitoring

#### 10.1. Logging des conversations

Ajouter des logs pour:
- Requêtes utilisateur
- Réponses du chatbot
- Documents récupérés
- Temps de réponse
- Erreurs

#### 10.2. Gestion des erreurs

Implémenter des try-catch pour:
- Erreurs API (Claude, OpenAI)
- Erreurs de base de données
- Erreurs de traitement de documents
- Timeouts

#### 10.3. Rate limiting

Implémenter un système de rate limiting pour éviter les abus:
- Limiter le nombre de messages par minute par utilisateur
- Limiter la longueur des messages

### Étape 11: Tests et validation

#### 11.1. Tests unitaires

Tester:
- Extraction de texte des documents
- Génération des embeddings
- Recherche sémantique
- Formatage des réponses

#### 11.2. Tests d'intégration

Tester:
- Flux complet de conversation
- Gestion des sessions
- Permissions d'accès
- Stockage des messages

#### 11.3. Tests de performance

Tester:
- Temps de réponse du chatbot
- Performance de la recherche vectorielle
- Charge de la base de données

### Étape 12: Documentation

#### 12.1. Documentation utilisateur

Créer:
- Guide d'utilisation du chatbot
- FAQ
- Exemples de questions
- Limitations

#### 12.2. Documentation technique

Documenter:
- Architecture du système
- Flux de données
- Schéma de base de données
- Configuration des APIs

## Structure des fichiers à créer

```
src/
├── composables/
│   └── ai/
│       ├── useChatbot.js
│       ├── useDocumentEmbeddings.js
│       ├── useRAG.js
│       └── useChatPermissions.js
├── components/
│   └── ai/
│       ├── ChatbotWidget.vue
│       ├── ChatMessage.vue
│       ├── ChatSidebar.vue
│       └── DocumentReference.vue
├── views/
│   └── ai/
│       └── NegotiationChatbot.vue
├── utils/
│   └── ai/
│       ├── documentProcessor.js
│       ├── embeddingGenerator.js
│       └── responseFormatter.js
└── scripts/
    └── generateDocumentEmbeddings.js

bank/
└── shema_et_requettes/
    └── chatbot_ia_schema.sql (nouveau fichier SQL avec toutes les tables)
```

## Ordre de priorité d'implémentation

1. **Étape 1**: Créer les tables de base de données
2. **Étape 2**: Configuration des variables d'environnement
3. **Étape 3**: Installation des dépendances
4. **Étape 5**: Création des utilitaires de base
5. **Étape 4**: Création des composables
6. **Étape 9**: Script de génération des embeddings
7. **Étape 6**: Création des composants Vue
8. **Étape 7**: Création de la vue dédiée
9. **Étape 8**: Configuration du routage
10. **Étape 10**: Gestion des erreurs et monitoring
11. **Étape 11**: Tests
12. **Étape 12**: Documentation

## Points d'attention

1. **Coûts API**: L'utilisation de Claude et OpenAI peut être coûteuse. Implémenter un système de cache et de rate limiting.

2. **Performance**: La recherche vectorielle peut être lente. Optimiser avec des index appropriés et du caching.

3. **Sécurité**: Ne jamais exposer les clés API côté client. Utiliser des Edge Functions Supabase pour les appels API.

4. **Qualité des réponses**: Tester et ajuster les prompts pour obtenir les meilleures réponses possibles.

5. **Références**: S'assurer que les références (documents, pages) sont toujours précises et vérifiables.

6. **Multilingue**: Supporter le français et l'anglais dans les réponses (selon les préférences utilisateur).

## Améliorations futures possibles

1. Support de documents vidéo/audio
2. Génération de résumés de documents
3. Suggestions de questions
4. Export des conversations
5. Partage de conversations entre utilisateurs
6. Intégration avec d'autres sources de données (web, etc.)
7. Fine-tuning du modèle sur les documents de négociation
8. Support de la voix (speech-to-text et text-to-speech)
