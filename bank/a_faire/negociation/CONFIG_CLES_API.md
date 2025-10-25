# ⚠️ Configuration des clés API - IMPORTANT

## 🎯 Résumé rapide

Pour faire fonctionner le chatbot IA, vous avez besoin de **2 clés API** :

| API | Usage | Obligatoire ? |
|-----|-------|---------------|
| **OpenAI** | Embeddings (recherche) | ✅ **OUI** |
| **OpenRouter** OU **Anthropic** | Claude (réponses) | ✅ **Choisir 1** |

## ❌ OpenRouter ne supporte PAS les embeddings !

**Découverte importante** : OpenRouter supporte uniquement les **modèles de chat** (LLMs).
Les **modèles d'embeddings** ne sont PAS disponibles sur OpenRouter.

### Ce que cela signifie

- ✅ OpenRouter → Pour Claude (génération des réponses du chatbot)
- ❌ OpenRouter → NE FONCTIONNE PAS pour les embeddings
- ✅ OpenAI directe → **OBLIGATOIRE** pour les embeddings

## 📝 Configuration dans .env.local

### Option 1 : OpenRouter + OpenAI (RECOMMANDÉ)

```bash
# OpenRouter pour Claude (chat)
VITE_USE_OPENROUTER=true
VITE_OPENROUTER_API_KEY=sk-or-v1-votre-cle-openrouter

# Modèle Claude sur OpenRouter
VITE_OPENROUTER_CHAT_MODEL=anthropic/claude-sonnet-4.5

# OpenAI pour les embeddings (OBLIGATOIRE)
VITE_OPENAI_API_KEY=sk-proj-votre-cle-openai
```

### Option 2 : APIs directes (Anthropic + OpenAI)

```bash
# Désactiver OpenRouter
VITE_USE_OPENROUTER=false

# Anthropic directe pour Claude
VITE_ANTHROPIC_API_KEY=sk-ant-votre-cle-anthropic

# OpenAI pour les embeddings (OBLIGATOIRE)
VITE_OPENAI_API_KEY=sk-proj-votre-cle-openai
```

## 🔑 Obtenir les clés API

### 1. Clé OpenAI (OBLIGATOIRE)

1. Allez sur [platform.openai.com](https://platform.openai.com/)
2. Créez un compte (ou connectez-vous)
3. Allez dans **API Keys**
4. Cliquez sur **Create new secret key**
5. Copiez la clé (commence par `sk-proj-...`)
6. ⚠️ **Rechargez votre compte** avec au moins **$5** (nécessaire pour utiliser l'API)

**Coût des embeddings** : ~$0.02 par million de tokens (très économique !)

### 2. Clé OpenRouter (pour économiser sur Claude)

1. Allez sur [openrouter.ai](https://openrouter.ai/)
2. Créez un compte (GitHub, Google, ou email)
3. Allez dans **API Keys**
4. Créez une nouvelle clé
5. Copiez la clé (commence par `sk-or-v1-...`)
6. **Bonus** : Vous recevez $1-5 de crédits gratuits !

**Avantage** : Tarifs souvent moins chers que l'API Anthropic directe

### 3. Alternative : Clé Anthropic directe

1. Allez sur [console.anthropic.com](https://console.anthropic.com/)
2. Créez un compte
3. Allez dans **API Keys**
4. Créez une nouvelle clé
5. Copiez la clé (commence par `sk-ant-...`)
6. Rechargez votre compte

## 💰 Comparaison des coûts

### Claude 3.5 Sonnet (génération de réponses)

| Provider | Input (1M tokens) | Output (1M tokens) |
|----------|-------------------|-------------------|
| **OpenRouter** | $3.00 | $15.00 |
| Anthropic Direct | $3.00 | $15.00 |

→ **Tarifs identiques**, mais OpenRouter offre des crédits gratuits !

### Embeddings (recherche vectorielle)

| Provider | Prix (1M tokens) |
|----------|-----------------|
| **OpenAI Direct** | $0.02 |
| OpenRouter | ❌ Non disponible |

## 🚀 Recommandation finale

### Pour débuter (budget minimal)

```bash
# 1 seule clé nécessaire pour tester
VITE_USE_OPENROUTER=true
VITE_OPENROUTER_API_KEY=sk-or-v1-xxx  # $1-5 gratuits
VITE_OPENAI_API_KEY=sk-proj-xxx        # $5 minimum

# Modèle économique pour tester
VITE_OPENROUTER_CHAT_MODEL=anthropic/claude-3-haiku
```

**Coût estimé pour 100 questions** : ~$0.50

### Pour production

```bash
VITE_USE_OPENROUTER=true
VITE_OPENROUTER_API_KEY=sk-or-v1-xxx
VITE_OPENAI_API_KEY=sk-proj-xxx

# Modèle performant
VITE_OPENROUTER_CHAT_MODEL=anthropic/claude-sonnet-4.5
```

## ⚙️ Modèles disponibles sur OpenRouter

```bash
# Claude (recommandé)
anthropic/claude-sonnet-4.5          # Dernière version (décembre 2024)
anthropic/claude-3.5-sonnet          # Version stable
anthropic/claude-3-opus              # Meilleure qualité, plus cher
anthropic/claude-3-haiku             # Rapide et économique

# GPT (alternative)
openai/gpt-4-turbo
openai/gpt-3.5-turbo
```

Voir tous les modèles : [openrouter.ai/models](https://openrouter.ai/models)

## 🆘 Dépannage

### ❌ "OpenAI API key is not configured"

✅ Vous avez oublié la clé OpenAI (obligatoire même avec OpenRouter)

```bash
VITE_OPENAI_API_KEY=sk-proj-votre-cle-ici
```

### ❌ "Insufficient credits" (OpenRouter)

✅ Rechargez votre compte OpenRouter sur [openrouter.ai/credits](https://openrouter.ai/credits)

### ❌ "You exceeded your current quota" (OpenAI)

✅ Rechargez votre compte OpenAI sur [platform.openai.com/account/billing](https://platform.openai.com/account/billing)

## 📊 Surveillance des coûts

### OpenRouter

Dashboard : [openrouter.ai/activity](https://openrouter.ai/activity)
- Requêtes en temps réel
- Coût par modèle
- Alertes configurables

### OpenAI

Dashboard : [platform.openai.com/usage](https://platform.openai.com/usage)
- Usage quotidien
- Coût par endpoint
- Limites de dépenses

## ✅ Vérification de la configuration

Une fois configuré, lancez :

```bash
npm run dev
```

Si tout est OK, vous ne verrez **aucun avertissement** dans la console.

Si vous voyez des warnings :
- ⚠️ "OpenRouter API key is not configured" → Clé OpenRouter manquante
- ⚠️ "OpenAI API key is not configured" → Clé OpenAI manquante (OBLIGATOIRE)

---

**Besoin d'aide ?** Vérifiez que vos clés :
1. Sont bien copiées (sans espaces)
2. Commencent par le bon préfixe (`sk-or-v1-`, `sk-proj-`, ou `sk-ant-`)
3. Ont des crédits/budget disponibles
