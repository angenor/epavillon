# Guide d'optimisation des tokens - Chatbot IA Zoom

## Objectif

Minimiser l'utilisation de tokens lors des interactions avec le chatbot IA pour réduire les coûts d'API Claude tout en maintenant une expérience utilisateur de qualité.

## Comprendre la consommation de tokens

### Qu'est-ce qu'un token ?

- Un token est une unité de texte (environ 4 caractères en anglais, 1-2 caractères en français)
- Claude compte les tokens dans :
  - **Input** : Le prompt système + l'historique de conversation + la requête utilisateur
  - **Output** : La réponse générée par Claude
  - **Tool calls** : Les appels d'outils (arguments et résultats)

### Coûts estimés (Claude 3.5 Sonnet)

- **Input tokens** : ~$3 / million de tokens
- **Output tokens** : ~$15 / million de tokens
- **Cache hits** : ~$0.30 / million de tokens (90% de réduction !)

## Stratégies d'optimisation

### 1. Prompts système concis et efficaces

#### ❌ Prompt non optimisé (trop verbeux)

```javascript
const systemPrompt = `
Tu es un assistant IA très intelligent et compétent qui aide les utilisateurs de la plateforme ePavillon Climatique de la Francophonie.
Tu dois être très courtois, professionnel et répondre de manière détaillée à toutes les questions des utilisateurs.
Tu as accès à plusieurs outils pour aider les utilisateurs, notamment des outils pour créer des réunions Zoom, supprimer des réunions Zoom, et éditer des réunions Zoom.
Quand un utilisateur te demande de créer une réunion Zoom, tu dois utiliser l'outil create_zoom_meeting avec l'ID de l'activité.
Quand un utilisateur te demande de supprimer une réunion Zoom, tu dois utiliser l'outil delete_zoom_meeting.
Quand un utilisateur te demande de modifier une réunion Zoom, tu dois utiliser l'outil edit_zoom_meeting.
Tu dois toujours demander confirmation avant d'effectuer une action importante.
`
```

**Tokens estimés** : ~180 tokens

#### ✅ Prompt optimisé (concis et structuré)

```javascript
const systemPrompt = `
Assistant IA pour ePavillon Climatique. Rôle: admin Zoom.

Outils disponibles:
- create_zoom_meeting(activity_id): Créer réunion
- delete_zoom_meeting(activity_id): Supprimer réunion
- edit_zoom_meeting(activity_id, updates): Modifier réunion

Règles:
1. Confirmer actions critiques (suppression/modification)
2. Réponses concises en français
3. Indiquer les erreurs clairement
`
```

**Tokens estimés** : ~60 tokens
**Économie** : 67% de réduction !

### 2. Utiliser le Prompt Caching d'Anthropic

Le **Prompt Caching** permet de réutiliser des portions du prompt système et de l'historique sans les repayer à chaque requête.

#### Configuration avec LangChain

```javascript
import { ChatAnthropic } from '@langchain/anthropic'

const model = new ChatAnthropic({
  modelName: 'claude-3-5-sonnet-20241022',
  anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  temperature: 0.7,
  maxTokens: 1024, // ✅ Limiter les tokens de sortie
  // ✅ Activer le caching
  cache: {
    // Le prompt système sera mis en cache
    systemPrompt: true,
    // Les N derniers messages de l'historique seront mis en cache
    maxCachedMessages: 5
  }
})
```

#### Avantages du caching

- **90% de réduction** sur les tokens mis en cache
- Cache valide pendant **5 minutes**
- Parfait pour les conversations multi-tours

**Exemple de calcul** :

Sans caching :
- Prompt système : 60 tokens × $3/M = $0.00018
- 10 messages d'historique : 500 tokens × $3/M = $0.0015
- **Total par requête : $0.00168**

Avec caching (après la 1ère requête) :
- Prompt système (cache) : 60 tokens × $0.30/M = $0.000018
- Historique (cache) : 500 tokens × $0.30/M = $0.00015
- **Total par requête : $0.000168**
- **Économie : 90% !**

### 3. Limiter la longueur des réponses

#### Configuration de maxTokens

```javascript
const model = new ChatAnthropic({
  modelName: 'claude-3-5-sonnet-20241022',
  anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  temperature: 0.7,
  maxTokens: 1024 // ✅ Limiter à 1024 tokens au lieu de 4096
})
```

#### Prompts orientés vers la concision

```javascript
const systemPrompt = `
[...instructions de base...]

IMPORTANT: Réponses < 100 mots. Utiliser listes à puces.
`
```

### 4. Optimiser les descriptions d'outils

Les descriptions d'outils sont envoyées à chaque requête. Il faut les rendre **ultra-concises**.

#### ❌ Description non optimisée

```javascript
export const createZoomMeetingTool = new DynamicStructuredTool({
  name: 'create_zoom_meeting',
  description: `
    Cet outil permet de créer une nouvelle réunion Zoom pour une activité donnée.
    Il prend en paramètre l'ID de l'activité et crée automatiquement une réunion
    Zoom avec les bonnes dates et heures. La réunion sera liée à l'activité dans
    la base de données. Utilisez cet outil quand l'utilisateur demande explicitement
    de créer une réunion Zoom pour une activité.
  `,
  // ... reste du code
})
```

**Tokens** : ~70 tokens

#### ✅ Description optimisée

```javascript
export const createZoomMeetingTool = new DynamicStructuredTool({
  name: 'create_zoom_meeting',
  description: 'Crée réunion Zoom pour activité. Usage: demande création Zoom.',
  // ... reste du code
})
```

**Tokens** : ~15 tokens
**Économie** : 78% !

### 5. Gérer intelligemment l'historique de conversation

#### Limiter le nombre de messages dans l'historique

```javascript
export function useChatbot() {
  const conversationHistory = ref([])

  // ✅ Ne garder que les 10 derniers messages
  const MAX_HISTORY_LENGTH = 10

  function addMessageToHistory(message) {
    conversationHistory.value.push(message)

    // Limiter l'historique
    if (conversationHistory.value.length > MAX_HISTORY_LENGTH) {
      conversationHistory.value = conversationHistory.value.slice(-MAX_HISTORY_LENGTH)
    }
  }

  // ...
}
```

#### Résumer les anciennes conversations

```javascript
// ✅ Résumer l'historique ancien au lieu de tout envoyer
async function summarizeOldHistory(messages) {
  if (messages.length <= 5) return messages

  const oldMessages = messages.slice(0, -5)
  const recentMessages = messages.slice(-5)

  // Créer un résumé concis
  const summary = {
    role: 'system',
    content: `Résumé: ${oldMessages.length} messages précédents discutant de [thèmes principaux]`
  }

  return [summary, ...recentMessages]
}
```

### 6. Éviter les appels redondants

#### Utiliser un cache local pour les données fréquentes

```javascript
// ✅ Cache des activités récemment consultées
const activityCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getActivityDetails(activityId) {
  // Vérifier le cache
  const cached = activityCache.get(activityId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  // Récupérer depuis l'API
  const data = await supabase
    .from('activities')
    .select('id, title, zoom_meeting_id')
    .eq('id', activityId)
    .single()

  // Mettre en cache
  activityCache.set(activityId, {
    data: data.data,
    timestamp: Date.now()
  })

  return data.data
}
```

### 7. Optimiser les tool responses

Les résultats d'outils sont envoyés dans le contexte. Il faut les rendre concis.

#### ❌ Réponse d'outil verbeuse

```javascript
func: async ({ activity_id }) => {
  try {
    const result = await zoomApiClient.createMeeting(activity_id)

    // Retourne trop d'informations
    return JSON.stringify({
      success: true,
      message: 'Réunion Zoom créée avec succès',
      timestamp: new Date().toISOString(),
      activity_id: activity_id,
      meeting_details: {
        meeting_id: result.meeting_id,
        join_url: result.join_url,
        start_url: result.start_url,
        password: result.password,
        registration_url: result.registration_url,
        created_at: result.created_at,
        zoom_meeting_db_id: result.zoom_meeting_id
      },
      next_steps: 'La réunion a été créée et liée à l\'activité.'
    })
  } catch (error) {
    // ...
  }
}
```

**Tokens** : ~100 tokens

#### ✅ Réponse d'outil concise

```javascript
func: async ({ activity_id }) => {
  try {
    const result = await zoomApiClient.createMeeting(activity_id)

    // ✅ Retourne uniquement l'essentiel
    return JSON.stringify({
      ok: true,
      join_url: result.join_url,
      id: result.meeting_id
    })
  } catch (error) {
    return JSON.stringify({ ok: false, error: error.message })
  }
}
```

**Tokens** : ~20 tokens
**Économie** : 80% !

### 8. Utiliser le streaming pour améliorer l'UX

Le streaming n'économise pas de tokens, mais améliore la perception de vitesse.

```javascript
async function sendMessage(userMessage) {
  const stream = await model.stream({
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.value,
      { role: 'user', content: userMessage }
    ]
  })

  let fullResponse = ''

  for await (const chunk of stream) {
    fullResponse += chunk.content
    // Afficher progressivement
    currentResponse.value = fullResponse
  }
}
```

## Plan d'action pour l'implémentation Zoom

### Phase 1 : Optimisation des prompts

1. ✅ Créer un prompt système concis (< 100 tokens)
2. ✅ Optimiser les descriptions d'outils (< 20 tokens chacune)
3. ✅ Configurer maxTokens à 1024

**Économie estimée** : 60-70%

### Phase 2 : Activer le Prompt Caching

1. ✅ Configurer le caching dans ChatAnthropic
2. ✅ Mettre en cache le prompt système
3. ✅ Mettre en cache les 5 derniers messages

**Économie estimée** : 85-90% (après la 1ère requête)

### Phase 3 : Optimiser l'historique

1. ✅ Limiter à 10 messages maximum
2. ✅ Résumer les anciennes conversations si nécessaire

**Économie estimée** : 40-50%

### Phase 4 : Cache local

1. ✅ Implémenter un cache pour les activités fréquentes
2. ✅ TTL de 5 minutes

**Économie estimée** : Réduit les appels API inutiles

## Estimation des coûts

### Scénario 1 : Sans optimisation

**Conversation type (10 échanges)** :
- Prompt système : 180 tokens
- Historique : 10 messages × 50 tokens = 500 tokens
- Descriptions d'outils : 3 × 70 tokens = 210 tokens
- Requête utilisateur : 20 tokens
- Réponse Claude : 150 tokens
- Tool response : 100 tokens

**Total par requête** :
- Input : 180 + 500 + 210 + 20 + 100 = 1010 tokens
- Output : 150 tokens

**Coût par requête** :
- Input : 1010 × $3/M = $0.00303
- Output : 150 × $15/M = $0.00225
- **Total : $0.00528**

**Pour 1000 requêtes/mois : $5.28**

### Scénario 2 : Avec optimisation complète

**Conversation type optimisée** :
- Prompt système (caché) : 60 tokens → cache hit : 60 × $0.30/M = $0.000018
- Historique (caché) : 300 tokens → cache hit : 300 × $0.30/M = $0.00009
- Descriptions d'outils : 3 × 15 tokens = 45 tokens
- Requête utilisateur : 20 tokens
- Réponse Claude : 80 tokens (maxTokens = 1024)
- Tool response : 20 tokens

**Total par requête** :
- Input (cache) : 360 tokens × $0.30/M = $0.000108
- Input (nouveau) : 45 + 20 + 20 = 85 tokens × $3/M = $0.000255
- Output : 80 tokens × $15/M = $0.0012
- **Total : $0.001563**

**Pour 1000 requêtes/mois : $1.56**

**Économie : 70% !** ($5.28 → $1.56)

## Monitoring et amélioration continue

### Metrics à suivre

```javascript
// Ajouter un logger de tokens
export function useChatbot() {
  const tokenUsage = ref({
    inputTokens: 0,
    outputTokens: 0,
    cacheHits: 0,
    totalCost: 0
  })

  async function sendMessage(message) {
    const response = await model.invoke(/* ... */)

    // Logger l'utilisation
    if (response.usage) {
      tokenUsage.value.inputTokens += response.usage.input_tokens
      tokenUsage.value.outputTokens += response.usage.output_tokens

      // Calculer le coût
      const inputCost = response.usage.input_tokens * 3 / 1_000_000
      const outputCost = response.usage.output_tokens * 15 / 1_000_000
      tokenUsage.value.totalCost += (inputCost + outputCost)

      console.log('Token usage:', {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cost: `$${(inputCost + outputCost).toFixed(6)}`
      })
    }
  }

  return { tokenUsage, sendMessage }
}
```

### Dashboard de suivi

Créer un dashboard simple pour suivre :
- Tokens consommés par jour/semaine
- Coût total
- Taux de cache hits
- Conversations les plus coûteuses

## Références

- **Anthropic Prompt Caching** : https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- **LangChain Caching** : https://js.langchain.com/docs/modules/model_io/models/llms/caching
- **Claude Pricing** : https://www.anthropic.com/pricing

## Checklist d'optimisation

Avant de déployer, vérifier :

- [ ] Prompt système < 100 tokens
- [ ] Descriptions d'outils < 20 tokens chacune
- [ ] maxTokens configuré à 1024
- [ ] Prompt caching activé
- [ ] Historique limité à 10 messages
- [ ] Tool responses concises (< 30 tokens)
- [ ] Cache local implémenté pour les données fréquentes
- [ ] Monitoring des tokens en place
- [ ] Tests de charge effectués

---

**Objectif final** : Réduire les coûts de **70%** tout en maintenant une excellente expérience utilisateur.
