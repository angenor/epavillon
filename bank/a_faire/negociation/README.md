# Tâches à Faire - Chatbot IA

Ce dossier contient les plans d'implémentation et la documentation des fonctionnalités à développer.

## Fichiers

### 📋 Plan d'implémentation

**[chatbot-ia-negociation-implementation.md](chatbot-ia-negociation-implementation.md)**

Plan complet pour l'implémentation du chatbot IA avec la fonctionnalité de négociation de documents (RAG).

**Contenu:**
- 12 étapes détaillées d'implémentation
- Structure complète des fichiers à créer
- Architecture du système (LangChain.js + Claude + OpenAI)
- Points d'attention et bonnes pratiques
- Ordre de priorité d'implémentation

## Scripts SQL de Migration

Les scripts de migration pour la base de données se trouvent dans [`bank/shema_et_requettes/`](../shema_et_requettes/)

### Fichiers principaux

1. **`chatbot_ia_migration.sql`**
   - Script complet de migration à exécuter dans Supabase
   - Crée toutes les tables, fonctions, vues, triggers et politiques RLS
   - À exécuter **une seule fois** pour installer le chatbot

2. **`chatbot_ia_rollback.sql`**
   - Script de rollback complet
   - Supprime toutes les tables et données du chatbot
   - ⚠️ Action irréversible - à utiliser avec précaution

3. **`chatbot_ia_schema.sql`**
   - Documentation détaillée du schéma complet
   - Référence pour comprendre l'architecture
   - Inclut des commentaires et explications

4. **`README_CHATBOT_MIGRATION.md`**
   - Guide complet d'installation et d'utilisation
   - Instructions étape par étape
   - Exemples de requêtes SQL
   - Dépannage et maintenance

5. **`database_complete.sql`**
   - Mis à jour avec la section "36. CHATBOT IA"
   - Schéma complet de toute la base de données



### 1. Migration de la base de données ✅

## Prochaines Étapes

### 2. Configuration du projet

**Variables d'environnement à ajouter dans `.env.local`:**

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

### 3. Installation des dépendances

```bash
npm install langchain @langchain/anthropic @langchain/openai @langchain/community
npm install pdf-parse mammoth
```

### 4. Création des fichiers (selon le plan)

Créer dans l'ordre:

#### Phase 1: Utilitaires de base
```
src/utils/ai/
├── documentProcessor.js
├── embeddingGenerator.js
└── responseFormatter.js
```

#### Phase 2: Composables
```
src/composables/ai/
├── useDocumentEmbeddings.js
├── useRAG.js
├── useChatbot.js
└── useChatPermissions.js
```

#### Phase 3: Script de génération
```
src/scripts/
└── generateDocumentEmbeddings.js
```

#### Phase 4: Composants Vue
```
src/components/ai/
├── ChatbotWidget.vue
├── ChatMessage.vue
├── ChatSidebar.vue
└── DocumentReference.vue
```

#### Phase 5: Vue dédiée
```
src/views/ai/
└── NegotiationChatbot.vue
```

#### Phase 6: Configuration du routage
Mettre à jour `src/router/index.js`

### 5. Génération des embeddings

```bash
# Après avoir créé le script generateDocumentEmbeddings.js
node src/scripts/generateDocumentEmbeddings.js
```

## Structure des données créées

### Tables

1. **`ai_chat_sessions`**
   - Sessions de conversation par utilisateur
   - Support multi-catégories (climate, biodiversity, desertification)

2. **`ai_chat_messages`**
   - Messages utilisateur et assistant
   - Métadonnées (tokens, temps de réponse)
   - Références aux documents sources

3. **`document_embeddings`**
   - Chunks de texte des documents
   - Vecteurs d'embedding (1536 dimensions)
   - Index vectoriel pour recherche rapide

4. **`ai_chat_feedback`**
   - Feedbacks utilisateurs (pouce haut/bas)
   - Commentaires optionnels

### Fonctions

- `search_similar_documents()` - Recherche sémantique
- `get_chat_session_stats()` - Statistiques de session
- `has_chatbot_access()` - Vérification des permissions
- `cleanup_old_chat_sessions()` - Nettoyage automatique

### Sécurité

- **RLS activé** sur toutes les tables
- **Accès restreint** aux rôles: `negotiator`, `admin`, `super_admin`
- **Isolation des données** par utilisateur
- **Validation automatique** des permissions

## Accès au chatbot

Seuls les utilisateurs ayant l'un de ces rôles peuvent accéder au chatbot:
- ✅ `negotiator` (négociateurs)
- ✅ `admin` (administrateurs)
- ✅ `super_admin` (super administrateurs)

## Technologies utilisées

- **LangChain.js** - Orchestration des interactions IA
- **Claude (Anthropic)** - Génération de réponses
- **OpenAI Embeddings** - Embeddings vectoriels (text-embedding-3-small)
- **Supabase Vector (pgvector)** - Stockage et recherche vectorielle
- **RAG** - Retrieval Augmented Generation

## Documentation de référence

- **Plan complet**: [chatbot-ia-negociation-implementation.md](chatbot-ia-negociation-implementation.md)
- **Guide de migration**: [../shema_et_requettes/README_CHATBOT_MIGRATION.md](../shema_et_requettes/README_CHATBOT_MIGRATION.md)
- **Schéma détaillé**: [../shema_et_requettes/chatbot_ia_schema.sql](../shema_et_requettes/chatbot_ia_schema.sql)
- **Cahier des charges**: [../cahier.md](../cahier.md)

## Support et dépannage

Voir la section "Dépannage" dans:
- [README_CHATBOT_MIGRATION.md](../shema_et_requettes/README_CHATBOT_MIGRATION.md)

## Notes importantes

⚠️ **Toujours consulter** `bank/shema_et_requettes/database_complete.sql` avant de modifier la structure de la base de données.

⚠️ **Mettre à jour** `database_complete.sql` après chaque modification de schéma.

⚠️ **Tester les permissions RLS** avec différents rôles utilisateurs.

⚠️ **Surveiller les coûts** des API Claude et OpenAI.
