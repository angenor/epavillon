# Guide de configuration OpenRouter pour le Chatbot IA

## ✅ Pourquoi utiliser OpenRouter ?

OpenRouter permet d'accéder à **tous les modèles d'IA** (Claude, GPT, Llama, etc.) via **une seule API** et **une seule clé**.

### Avantages

- **💰 Coûts réduits** - Tarifs souvent 20-50% moins chers que les APIs directes
- **🔑 Une seule clé API** - Plus besoin de gérer plusieurs clés (Anthropic + OpenAI)
- **📊 Dashboard centralisé** - Suivez tous vos coûts au même endroit
- **🔄 Flexibilité** - Changez de modèle facilement sans modifier le code
- **💳 Crédits gratuits** - $1-5 offerts pour tester

## 📝 Étapes de configuration

### 1. Créer un compte OpenRouter

1. Allez sur [openrouter.ai](https://openrouter.ai/)
2. Cliquez sur **"Sign In"** en haut à droite
3. Connectez-vous avec GitHub, Google ou email
4. Vous recevrez **$1 de crédits gratuits** pour tester

### 2. Obtenir votre clé API

1. Une fois connecté, cliquez sur votre avatar en haut à droite
2. Sélectionnez **"API Keys"**
3. Cliquez sur **"Create Key"**
4. Donnez un nom à votre clé (ex: "e-Pavillon Chatbot")
5. **Copiez la clé** (elle commence par `sk-or-v1-...`)
6. ⚠️ **Sauvegardez-la immédiatement** - vous ne pourrez plus la voir après

### 3. Configurer le projet

Ouvrez votre fichier `.env.local` et configurez :

```bash
# Activer OpenRouter
VITE_USE_OPENROUTER=true

# Votre clé API OpenRouter
VITE_OPENROUTER_API_KEY=sk-or-v1-votre-cle-ici

# Modèles à utiliser (recommandés)
VITE_OPENROUTER_CHAT_MODEL=anthropic/claude-3.5-sonnet
VITE_OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
```

### 4. Vérifier la configuration

Lancez votre application :

```bash
npm run dev
```

Si tout est bien configuré, vous ne verrez **aucun avertissement** dans la console concernant les clés API.

## 🎯 Modèles disponibles

### Pour le chat (Claude)

OpenRouter offre plusieurs versions de Claude :

```bash
# Claude 3.5 Sonnet (recommandé - équilibre prix/performance)
VITE_OPENROUTER_CHAT_MODEL=anthropic/claude-3.5-sonnet

# Claude 3 Opus (meilleure qualité, plus cher)
VITE_OPENROUTER_CHAT_MODEL=anthropic/claude-3-opus

# Claude 3 Haiku (rapide et économique)
VITE_OPENROUTER_CHAT_MODEL=anthropic/claude-3-haiku
```

### Pour les embeddings

```bash
# OpenAI text-embedding-3-small (recommandé - 1536 dimensions)
VITE_OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small

# OpenAI text-embedding-3-large (meilleure qualité, 3072 dimensions)
# ⚠️ Nécessite de changer EMBEDDING_DIMENSIONS dans embeddingGenerator.js
VITE_OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-large
```

## 💰 Tarification OpenRouter vs API directes

### Chat (Claude 3.5 Sonnet)

| Provider | Prix Input (par 1M tokens) | Prix Output (par 1M tokens) |
|----------|---------------------------|----------------------------|
| **OpenRouter** | **$3.00** | **$15.00** |
| Anthropic Direct | $3.00 | $15.00 |

### Embeddings (text-embedding-3-small)

| Provider | Prix (par 1M tokens) |
|----------|---------------------|
| **OpenRouter** | **$0.02** |
| OpenAI Direct | $0.02 |

💡 **Note** : OpenRouter ajoute parfois de petits frais mais offre souvent des promotions et crédits gratuits.

## 🔒 Sécurité

### Limites de dépenses

Pour éviter les mauvaises surprises :

1. Allez dans **Settings** > **Limits**
2. Configurez une **limite mensuelle** (ex: $10)
3. Activez les **alertes email** à 50% et 90%

### Crédits

- Rechargez votre compte sur [openrouter.ai/credits](https://openrouter.ai/credits)
- Minimum : $5
- Les crédits n'expirent jamais

## 🔄 Revenir aux APIs directes

Si vous préférez utiliser les APIs directes :

```bash
# Désactiver OpenRouter
VITE_USE_OPENROUTER=false

# Configurer les clés directes
VITE_ANTHROPIC_API_KEY=votre_cle_anthropic_ici
VITE_OPENAI_API_KEY=votre_cle_openai_ici
```

## 📊 Surveillance de l'utilisation

### Dashboard OpenRouter

- Allez sur [openrouter.ai/activity](https://openrouter.ai/activity)
- Consultez vos **requêtes en temps réel**
- Analysez vos **coûts par modèle**
- Téléchargez des **rapports CSV**

### Logs dans l'application

Le chatbot enregistre automatiquement :
- Nombre de tokens utilisés par requête
- Temps de réponse
- Modèle utilisé
- Coût estimé (dans les métadonnées)

## 🆘 Dépannage

### Erreur : "OpenRouter API key is not configured"

✅ Vérifiez que :
- `VITE_USE_OPENROUTER=true` dans `.env.local`
- `VITE_OPENROUTER_API_KEY` est défini et commence par `sk-or-v1-`
- Vous avez **redémarré le serveur** après modification du `.env.local`

### Erreur : "Insufficient credits"

✅ Solutions :
- Rechargez votre compte sur [openrouter.ai/credits](https://openrouter.ai/credits)
- Vérifiez vos limites de dépenses
- Contactez le support OpenRouter si vous avez des crédits mais l'erreur persiste

### Le chatbot ne répond pas

✅ Vérifiez :
1. La console du navigateur pour les erreurs
2. Que vous avez des **crédits OpenRouter**
3. Que le **modèle existe** sur OpenRouter
4. Que votre **clé API est valide**

## 🔗 Liens utiles

- [OpenRouter Dashboard](https://openrouter.ai/)
- [Documentation OpenRouter](https://openrouter.ai/docs)
- [Liste des modèles disponibles](https://openrouter.ai/models)
- [Tarifs en temps réel](https://openrouter.ai/models)
- [Support OpenRouter](https://openrouter.ai/docs/faq)

## 🎁 Code promo

OpenRouter offre parfois des codes promo :
- Suivez [@OpenRouterAI sur Twitter](https://twitter.com/OpenRouterAI)
- Rejoignez leur [Discord](https://discord.gg/openrouter)

---

**Besoin d'aide ?** Consultez la [documentation OpenRouter](https://openrouter.ai/docs) ou créez une issue sur le projet.
