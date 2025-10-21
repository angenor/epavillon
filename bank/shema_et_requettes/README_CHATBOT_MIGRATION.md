# Guide de Migration du Chatbot IA

## Vue d'ensemble

Ce dossier contient les scripts SQL pour mettre en place la base de données du chatbot IA avec fonctionnalité RAG (Retrieval Augmented Generation) pour l'aide à la négociation.

## Fichiers

- **`chatbot_ia_migration.sql`** : Script de migration complet (création)
- **`chatbot_ia_rollback.sql`** : Script de rollback complet (suppression)
- **`chatbot_ia_schema.sql`** : Documentation détaillée du schéma (référence)
- **`test_chatbot_syntax.sql`** : Script de test pour vérifier les prérequis avant migration

## Prérequis

### 1. Extension pgvector

Le chatbot nécessite l'extension **pgvector** pour stocker les embeddings vectoriels.

**Installation dans Supabase:**

1. Aller dans **Database** > **Extensions**
2. Rechercher `vector` ou `pgvector`
3. Cliquer sur **Enable** pour activer l'extension

**Vérification:**
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 2. Rôles utilisateurs requis

Les utilisateurs doivent avoir l'un des rôles suivants pour accéder au chatbot:
- `negotiator`
- `admin`
- `super_admin`

## Installation

### Étape 0: Tester la syntaxe et les prérequis (Optionnel mais recommandé)

Dans Supabase SQL Editor:

```sql
-- Copier-coller le contenu de test_chatbot_syntax.sql
```

Ce script vérifie:
- ✅ Que l'extension pgvector est installée
- ✅ Que les tables requises existent
- ✅ Qu'il n'y a pas de conflit avec des tables existantes

### Étape 1: Exécuter la migration

Dans Supabase SQL Editor:

```sql
-- Copier-coller le contenu de chatbot_ia_migration.sql
```

Ou via la CLI Supabase:

```bash
supabase db push --file bank/shema_et_requettes/chatbot_ia_migration.sql
```

### Étape 2: Vérifier l'installation

```sql
-- Vérifier les tables créées
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'ai_%' OR table_name LIKE 'document_embeddings';

-- Devrait retourner:
-- - ai_chat_sessions
-- - ai_chat_messages
-- - document_embeddings
-- - ai_chat_feedback
```

### Étape 3: Générer les embeddings

Après avoir créé les tables, vous devez générer les embeddings pour les documents existants:

```bash
# À exécuter depuis la racine du projet
node src/scripts/generateDocumentEmbeddings.js
```

## Structure créée

### Tables

1. **`ai_chat_sessions`** : Sessions de conversation
   - Stocke les sessions de chat pour chaque utilisateur
   - Gestion des sessions actives/inactives
   - Support de catégories (climate, biodiversity, desertification)

2. **`ai_chat_messages`** : Messages échangés
   - Messages utilisateur et assistant
   - Métadonnées (tokens, temps de réponse)
   - Références aux documents sources

3. **`document_embeddings`** : Embeddings vectoriels
   - Chunks de texte des documents
   - Vecteurs d'embedding (1536 dimensions)
   - Métadonnées (page, section, position)

4. **`ai_chat_feedback`** : Feedbacks utilisateurs
   - Feedbacks positifs/négatifs
   - Commentaires optionnels

### Fonctions

- **`search_similar_documents()`** : Recherche sémantique par similarité
- **`get_chat_session_stats()`** : Statistiques d'une session
- **`has_chatbot_access()`** : Vérification des permissions
- **`cleanup_old_chat_sessions()`** : Nettoyage automatique

### Vues

- **`v_chat_sessions_with_stats`** : Sessions avec statistiques
- **`v_documents_with_embeddings`** : Documents avec embeddings

### Triggers

- Génération automatique de titre de session
- Mise à jour de l'activité de session
- Validation des métadonnées
- Vérification des permissions d'accès

### Sécurité (RLS)

Toutes les tables sont protégées par Row Level Security (RLS):
- Utilisateurs: accès uniquement à leurs propres données
- Admins: accès complet en lecture pour monitoring
- Embeddings: lecture publique, écriture réservée aux admins

## Utilisation

### Créer une session

```sql
INSERT INTO ai_chat_sessions (user_id, category)
VALUES (auth.uid(), 'climate');
```

### Envoyer un message

```sql
INSERT INTO ai_chat_messages (session_id, role, content)
VALUES ('session-uuid', 'user', 'Quelle est la position de la Francophonie sur le climat?');
```

### Rechercher des documents similaires

```sql
SELECT * FROM search_similar_documents(
    query_embedding := '[...]'::vector(1536),
    match_threshold := 0.7,
    match_count := 5,
    filter_category := 'climate'
);
```

### Obtenir les statistiques d'une session

```sql
SELECT * FROM get_chat_session_stats('session-uuid');
```

## Rollback

**⚠️ ATTENTION:** Le rollback supprime **TOUTES** les données du chatbot de manière **IRRÉVERSIBLE**.

### Exécuter le rollback

```sql
-- Copier-coller le contenu de chatbot_ia_rollback.sql
```

### Cas d'usage du rollback

- Développement/test: réinitialiser complètement
- Migration échouée: nettoyer avant de réessayer
- Changement majeur: supprimer l'ancien schéma

## Maintenance

### Nettoyage des anciennes sessions

```sql
-- Supprimer les sessions inactives de plus de 90 jours
SELECT cleanup_old_chat_sessions(90);
```

### Mise à jour des statistiques

```sql
-- Mettre à jour les statistiques des index
VACUUM ANALYZE ai_chat_sessions;
VACUUM ANALYZE ai_chat_messages;
VACUUM ANALYZE document_embeddings;
VACUUM ANALYZE ai_chat_feedback;
```

### Surveillance

```sql
-- Nombre total de sessions
SELECT COUNT(*) FROM ai_chat_sessions;

-- Sessions actives
SELECT COUNT(*) FROM ai_chat_sessions WHERE is_active = true;

-- Documents avec embeddings
SELECT * FROM v_documents_with_embeddings WHERE has_embeddings = true;

-- Taux de satisfaction
SELECT
    COUNT(CASE WHEN feedback_type = 'positive' THEN 1 END) as positifs,
    COUNT(CASE WHEN feedback_type = 'negative' THEN 1 END) as negatifs,
    ROUND(
        COUNT(CASE WHEN feedback_type = 'positive' THEN 1 END)::NUMERIC /
        NULLIF(COUNT(*)::NUMERIC, 0) * 100,
        2
    ) as satisfaction_pourcentage
FROM ai_chat_feedback;
```

## Dépannage

### L'extension vector n'est pas installée

**Erreur:** `extension "vector" does not exist`

**Solution:**
1. Aller dans Supabase Dashboard > Database > Extensions
2. Activer l'extension `pgvector`
3. Réexécuter la migration

### Erreur de permissions

**Erreur:** `permission denied for table ai_chat_sessions`

**Solution:**
Vérifier que l'utilisateur a bien un rôle autorisé:
```sql
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

### Embeddings invalides

**Erreur:** `L'embedding doit avoir exactement 1536 dimensions`

**Solution:**
Vérifier que vous utilisez bien le modèle `text-embedding-3-small` d'OpenAI qui génère des vecteurs de 1536 dimensions.

## Support

Pour toute question ou problème:
1. Vérifier les logs Supabase
2. Consulter la documentation dans `chatbot_ia_schema.sql`
3. Vérifier les permissions RLS
4. Consulter le plan d'implémentation dans `bank/a_faire/`

## Prochaines étapes

Après avoir exécuté la migration:

1. ✅ Installer les dépendances NPM (voir plan d'implémentation)
2. ✅ Configurer les variables d'environnement
3. ✅ Générer les embeddings pour les documents existants
4. ✅ Créer les composables Vue pour le chatbot
5. ✅ Implémenter les composants UI
6. ✅ Tester l'intégration complète
