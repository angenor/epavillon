# Architecture du Chatbot IA - Documentation Technique

## Vue d'ensemble

Le chatbot IA pour les négociations a été implémenté avec une architecture client-serveur pour gérer les contraintes techniques liées au traitement des documents PDF et DOCX.

## Architecture

### 1. Séparation Client/Serveur

#### Côté Client (Browser)
- **Emplacement** : `src/utils/ai/`, `src/composables/ai/`, `src/components/ai/`, `src/views/ai/`
- **Technologies** : Vue 3, LangChain.js, OpenAI API (embeddings), Claude API ou OpenRouter (chat)
- **Fonctionnalités** :
  - Interface utilisateur du chatbot
  - Découpage de texte en chunks (text splitting)
  - Génération d'embeddings via OpenAI
  - Recherche vectorielle via Supabase
  - Génération de réponses avec Claude
  - Gestion de l'historique des conversations

#### Côté Serveur (Node.js)
- **Emplacement** : `server/ai/`, `src/scripts/`
- **Technologies** : Node.js, pdf-parse, mammoth
- **Fonctionnalités** :
  - Extraction de texte depuis PDF
  - Extraction de texte depuis DOCX
  - Traitement par batch des documents existants

### 2. Pourquoi cette séparation ?

Les bibliothèques `pdf-parse` et `mammoth` utilisées pour extraire le texte des PDF et DOCX :
- Nécessitent des APIs Node.js (Buffer, fs, etc.)
- Ne fonctionnent pas dans un environnement de navigateur
- Ne sont pas compatibles avec Vite en mode production

**Solution** : L'extraction de texte doit être faite côté serveur, puis le texte est stocké ou transmis au client pour le traitement des embeddings.

## Fichiers Principaux

### Client-Side

#### Utilitaires
- **`src/utils/ai/documentProcessor.js`**
  - Fonctions de découpage de texte (chunking)
  - N'inclut PAS l'extraction PDF/DOCX
  - Utilisé dans le navigateur

- **`src/utils/ai/embeddingGenerator.js`**
  - Génération d'embeddings avec OpenAI
  - Supporte batch processing
  - Toujours utilise OpenAI directement (pas OpenRouter)

- **`src/utils/ai/responseFormatter.js`**
  - Formatage des réponses avec références
  - Extraction de citations depuis les sources

#### Composables
- **`src/composables/ai/useChatPermissions.js`**
  - Contrôle d'accès au chatbot
  - Rôles autorisés : negotiator, admin, super_admin

- **`src/composables/ai/useDocumentEmbeddings.js`**
  - Gestion des embeddings de documents
  - Recherche vectorielle
  - **IMPORTANT** : Accepte du texte pré-extrait, pas des URLs de fichiers

- **`src/composables/ai/useRAG.js`**
  - Système RAG (Retrieval Augmented Generation)
  - Utilise Claude pour générer les réponses
  - Supporte OpenRouter ou API Anthropic directe

- **`src/composables/ai/useChatbot.js`**
  - Orchestration complète du chatbot
  - Gestion des sessions et messages
  - Intégration de tous les autres composables

#### Composants Vue
- **`src/components/ai/ChatMessage.vue`** - Message individuel
- **`src/components/ai/DocumentReference.vue`** - Citation de document
- **`src/components/ai/ChatSidebar.vue`** - Historique des conversations
- **`src/components/ai/ChatbotWidget.vue`** - Interface principale

#### Vue Principale
- **`src/views/ai/NegotiationChatbot.vue`** - Page complète du chatbot

### Server-Side

#### Utilitaires Serveur
- **`server/ai/documentProcessor.server.js`**
  - Extraction de texte depuis PDF (pdf-parse)
  - Extraction de texte depuis DOCX (mammoth)
  - **NE DOIT PAS** être importé côté client

#### Scripts
- **`src/scripts/generateDocumentEmbeddings.js`**
  - Script de traitement par batch
  - Génère les embeddings pour tous les documents existants
  - Utilise les fonctions serveur pour l'extraction de texte

## Configuration des APIs

### Variables d'Environnement (.env.local)

```bash
# ===== Configuration du Chatbot IA =====

# OpenRouter pour Claude (génération de réponses)
# Optionnel - vous pouvez utiliser l'API Anthropic directement
VITE_USE_OPENROUTER=true
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_OPENROUTER_CHAT_MODEL=anthropic/claude-sonnet-4.5

# OpenAI pour les embeddings (recherche vectorielle)
# ⚠️ TOUJOURS NÉCESSAIRE - OpenRouter ne supporte pas les embeddings
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Alternative: API Anthropic directe (si VITE_USE_OPENROUTER=false)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Configuration du chatbot IA
VITE_AI_CHAT_MAX_TOKENS=4096
VITE_AI_CHAT_TEMPERATURE=0.7
VITE_AI_CHUNK_SIZE=1000
VITE_AI_CHUNK_OVERLAP=200
```

### Obtenir les clés API

1. **OpenAI** (OBLIGATOIRE pour les embeddings) :
   - Créer un compte sur https://platform.openai.com/
   - Générer une clé API dans "API Keys"
   - Coût approximatif : ~$0.00002 par 1000 tokens (text-embedding-3-small)

2. **OpenRouter** (OPTIONNEL pour Claude) :
   - Créer un compte sur https://openrouter.ai/
   - Ajouter des crédits
   - Générer une clé API
   - Coût approximatif : Variable selon le modèle (~$3-15 par million de tokens)

3. **Anthropic** (ALTERNATIVE à OpenRouter) :
   - Créer un compte sur https://console.anthropic.com/
   - Générer une clé API
   - Coût approximatif : ~$3-15 par million de tokens selon le modèle Claude

**Recommandation** : Utilisez OpenRouter pour Claude (coûts optimisés) + OpenAI pour les embeddings.

Pour plus de détails, consultez `bank/a_faire/CONFIG_CLES_API.md`

## Base de Données Supabase

### Tables Requises

Le chatbot nécessite ces tables dans Supabase :

```sql
-- Tables pour le chatbot IA
CREATE TABLE ai_chat_sessions (...)
CREATE TABLE ai_chat_messages (...)
CREATE TABLE document_embeddings (...)
CREATE TABLE ai_chat_feedback (...)
```

**Installation** :
1. Connectez-vous à votre projet Supabase
2. Allez dans l'éditeur SQL
3. Exécutez le contenu de `bank/shema_et_requettes/chatbot_ia_schema.sql`

### Fonction RPC pour la recherche vectorielle

La recherche de similarité vectorielle utilise une fonction PostgreSQL :

```sql
CREATE OR REPLACE FUNCTION search_similar_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (...)
```

Cette fonction est incluse dans le schéma SQL.

## Workflow d'utilisation

### 1. Traitement Initial des Documents

Lorsqu'un nouveau document de négociation est uploadé :

**Option A : Traitement Manuel avec le Script**

```bash
# 1. Installer les dépendances
npm install pdf-parse mammoth dotenv

# 2. Exécuter le script de génération d'embeddings
node src/scripts/generateDocumentEmbeddings.js
```

**Option B : Traitement Automatique (À implémenter)**

Créer une Supabase Edge Function qui :
1. S'exécute automatiquement quand un document est uploadé
2. Extrait le texte avec pdf-parse/mammoth
3. Appelle l'API client pour générer les embeddings

Exemple d'Edge Function :

```javascript
// supabase/functions/process-document/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { extractTextFromDocument } from './documentProcessor.ts'

serve(async (req) => {
  const { documentId, fileUrl, fileType } = await req.json()

  // Extraire le texte
  const { text, metadata } = await extractTextFromDocument(fileUrl, fileType)

  // Appeler l'API client pour générer les embeddings
  // Ou générer les embeddings directement ici

  return new Response(JSON.stringify({ success: true }))
})
```

### 2. Utilisation du Chatbot

1. **Accès** : Naviguer vers `/ai/chatbot`
2. **Authentification** : Seuls les utilisateurs avec rôles negotiator, admin ou super_admin peuvent accéder
3. **Création de session** : Une nouvelle session est créée automatiquement
4. **Questions** : L'utilisateur pose des questions sur les documents de négociation
5. **Réponses** : Le système :
   - Génère un embedding pour la question
   - Recherche les chunks de documents similaires
   - Utilise Claude pour générer une réponse basée sur les documents trouvés
   - Affiche les références aux documents sources

### 3. Fonctionnalités

- ✅ Historique des conversations (sidebar)
- ✅ Références aux documents sources
- ✅ Feedback sur les réponses (👍 / 👎)
- ✅ Copie des réponses
- ✅ Filtrage par catégorie de documents
- ✅ Support multilingue (FR/EN)
- ✅ Mode sombre/clair

## Limitations et Contraintes

### Limitations Actuelles

1. **Extraction de texte** :
   - Doit être faite côté serveur
   - Pas d'extraction en temps réel dans le navigateur

2. **Formats supportés** :
   - PDF (via pdf-parse)
   - DOCX (via mammoth)
   - Pas de support DOC (ancien format Word)

3. **Taille des documents** :
   - Limitée par la mémoire disponible
   - Les très gros documents (>100 pages) peuvent être lents à traiter

4. **Coûts API** :
   - Chaque question génère un embedding (~$0.00002)
   - Chaque réponse utilise Claude (~$0.003-0.015 selon la longueur)

### Contraintes Techniques

1. **Rate Limiting** :
   - OpenAI : 3,000 RPM (requests per minute) par défaut
   - Anthropic/OpenRouter : Varie selon le plan

2. **Taille des embeddings** :
   - text-embedding-3-small : 1536 dimensions
   - ~6 KB par embedding stocké en base

3. **Contexte Claude** :
   - Maximum ~200k tokens selon le modèle
   - Le système limite le nombre de chunks retournés (5 par défaut)

## Déploiement

### Prérequis

- ✅ Supabase configuré avec les tables nécessaires
- ✅ Clés API configurées dans `.env.local`
- ✅ Documents traités avec embeddings générés
- ✅ Extension pgvector activée dans Supabase

### Étapes de Déploiement

1. **Build** :
   ```bash
   npm run build
   ```

2. **Déploiement Firebase** (exemple) :
   ```bash
   firebase deploy
   ```

3. **Vérifications Post-Déploiement** :
   - Tester l'accès au chatbot
   - Vérifier que les embeddings sont accessibles
   - Tester une question et vérifier la réponse

## Maintenance

### Régénération des Embeddings

Si le modèle d'embedding change ou si des documents sont mis à jour :

```bash
# Régénérer tous les embeddings
node src/scripts/generateDocumentEmbeddings.js
```

Le script :
- Détecte les documents déjà traités (skip par défaut)
- Permet de forcer la régénération avec `--force`
- Affiche la progression en temps réel

### Monitoring

Points à surveiller :

1. **Coûts API** :
   - Suivre l'utilisation OpenAI
   - Suivre l'utilisation Claude/OpenRouter

2. **Performance** :
   - Temps de réponse du chatbot
   - Taille de la table `document_embeddings`

3. **Qualité** :
   - Feedback des utilisateurs (👍 / 👎)
   - Pertinence des réponses

## Dépannage

### Erreur : "No embeddings found"

**Cause** : Les documents n'ont pas été traités
**Solution** : Exécuter `node src/scripts/generateDocumentEmbeddings.js`

### Erreur : "OpenAI API key not configured"

**Cause** : Clé API OpenAI manquante
**Solution** : Ajouter `VITE_OPENAI_API_KEY` dans `.env.local`

### Erreur : "Access denied"

**Cause** : Utilisateur sans les permissions requises
**Solution** : Assigner le rôle `negotiator`, `admin` ou `super_admin` à l'utilisateur

### Les réponses ne sont pas pertinentes

**Causes possibles** :
1. Chunks trop petits/grands : Ajuster `VITE_AI_CHUNK_SIZE`
2. Pas assez de contexte : Augmenter le nombre de chunks retournés
3. Documents mal formatés : Vérifier la qualité de l'extraction de texte

## Évolutions Futures

### Court Terme
- [ ] Supabase Edge Function pour traitement automatique des documents
- [ ] Interface d'administration pour gérer les embeddings
- [ ] Statistiques d'utilisation du chatbot

### Moyen Terme
- [ ] Support de fichiers TXT et MD
- [ ] Export des conversations en PDF
- [ ] Suggestions de questions fréquentes

### Long Terme
- [ ] Fine-tuning d'un modèle personnalisé
- [ ] Intégration avec d'autres sources (web, bases de connaissances)
- [ ] Assistant proactif avec suggestions

## Support

Pour toute question ou problème :

1. Consulter les fichiers de documentation dans `bank/a_faire/`
2. Vérifier les logs du navigateur (Console DevTools)
3. Consulter les logs Supabase
4. Vérifier la configuration des variables d'environnement

## Références

- [LangChain.js Documentation](https://js.langchain.com/docs/)
- [Claude API Documentation](https://docs.anthropic.com/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Supabase Vector Search](https://supabase.com/docs/guides/ai/vector-columns)
- [OpenRouter Documentation](https://openrouter.ai/docs)
