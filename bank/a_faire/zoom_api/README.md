# Fonctionnalité 2 : Outils d'Administration Zoom via Chatbot IA

## Vue d'ensemble

Cette fonctionnalité permet au chatbot IA d'interagir avec l'API Zoom pour gérer les réunions Zoom directement depuis l'interface de chat. Elle est réservée aux utilisateurs avec les rôles **admin** ou **super_admin**.

## Objectifs

- Permettre la création de réunions Zoom via le chatbot
- Permettre la suppression de réunions Zoom via le chatbot
- Permettre l'édition de réunions Zoom existantes via le chatbot
- Permettre la consultation des détails d'une réunion Zoom (participants inscrits, métriques, etc.)
- Minimiser l'utilisation de tokens pour réduire les coûts d'API Claude
- Maintenir une architecture modulaire et maintenable

## Architecture

### Composants principaux

```
├── supabase/functions/
│   ├── create-zoom-meeting/        ✅ Existant
│   ├── delete-zoom-meeting/        ✅ Existant
│   ├── edit-zoom-meeting/          ⚠️ À créer
│   └── get-zoom-meeting-details/   ⚠️ À créer
│
├── src/composables/zoom/           ⚠️ À créer
│   ├── useZoomMeetingTools.js      (Logique d'interaction avec les edge functions)
│   └── useZoomToolsChat.js         (Intégration avec le chatbot)
│
├── src/utils/zoom/                 ⚠️ À créer
│   ├── zoomApiClient.js            (Client API pour appeler les edge functions)
│   └── zoomToolsFormatter.js       (Formatage des réponses pour le chatbot)
│
└── src/utils/ai/
    └── toolsManager.js             ⚠️ À créer (Gestionnaire d'outils pour LangChain)
```

## Technologies utilisées

- **LangChain.js** avec **Tool Calling** pour permettre au chatbot d'appeler des fonctions
- **Claude (Anthropic)** avec optimisation des prompts pour minimiser les tokens
- **Supabase Edge Functions** pour l'interaction sécurisée avec l'API Zoom
- **Zoom API REST** pour la gestion des réunions

## Plan d'implémentation

### Étape 1 : Créer les Edge Functions Zoom manquantes

#### 1.1. Edge Function pour éditer les réunions Zoom

**Fichier à créer** : `supabase/functions/edit-zoom-meeting/index.ts`

**Référence** : S'inspirer de [create-zoom-meeting/index.ts](../../supabase/functions/create-zoom-meeting/index.ts)

**Fonctionnalités** :
- Récupérer les informations actuelles de la réunion
- Valider les permissions (admin/super_admin uniquement)
- Mettre à jour la réunion sur Zoom via l'API REST
- Mettre à jour la base de données Supabase
- Gérer les erreurs et les cas limites

**Voir** : [edit-zoom-meeting-spec.md](./edit-zoom-meeting-spec.md) pour les spécifications détaillées

#### 1.2. Edge Function pour obtenir les détails d'une réunion Zoom

**Fichier à créer** : `supabase/functions/get-zoom-meeting-details/index.ts`

**Référence** : S'inspirer de [create-zoom-meeting/index.ts](../../supabase/functions/create-zoom-meeting/index.ts)

**Fonctionnalités** :
- Récupérer les détails de la réunion depuis l'API Zoom
- Récupérer la liste des participants inscrits
- Récupérer les métriques de la réunion (si disponibles)
- Formater les données pour le chatbot
- Gérer les réunions passées vs futures

**Endpoints Zoom utilisés** :
- `GET /meetings/{meetingId}` - Détails de la réunion
- `GET /meetings/{meetingId}/registrants` - Liste des inscrits
- `GET /past_meetings/{meetingId}/participants` - Participants (réunions passées)

**Voir** : [get-zoom-meeting-details-spec.md](./get-zoom-meeting-details-spec.md) pour les spécifications détaillées

### Étape 2 : Créer les utilitaires Zoom

**Fichier** : `src/utils/zoom/zoomApiClient.js`

```javascript
/**
 * Client API pour interagir avec les edge functions Zoom
 * Centralise tous les appels aux edge functions
 */

import { supabase } from '@/lib/supabaseClient'

export const zoomApiClient = {
  /**
   * Créer une réunion Zoom pour une activité
   */
  async createMeeting(activityId) {
    const { data, error } = await supabase.functions.invoke('create-zoom-meeting', {
      body: { activity_id: activityId }
    })

    if (error) throw error
    return data
  },

  /**
   * Supprimer une réunion Zoom d'une activité
   */
  async deleteMeeting(activityId) {
    const { data, error } = await supabase.functions.invoke('delete-zoom-meeting', {
      body: { activity_id: activityId }
    })

    if (error) throw error
    return data
  },

  /**
   * Éditer une réunion Zoom existante
   */
  async editMeeting(activityId, updates) {
    const { data, error } = await supabase.functions.invoke('edit-zoom-meeting', {
      body: {
        activity_id: activityId,
        updates: updates // { title, start_time, duration, description, etc. }
      }
    })

    if (error) throw error
    return data
  },

  /**
   * Récupérer les détails d'une réunion Zoom depuis la base de données
   */
  async getMeetingDetails(activityId) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        zoom_meeting_id,
        zoom_meetings (
          meeting_id,
          join_url,
          start_url,
          password
        )
      `)
      .eq('id', activityId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Récupérer les détails complets d'une réunion Zoom depuis l'API Zoom
   * (participants inscrits, métriques, etc.)
   */
  async getMeetingDetailsFromZoom(activityId) {
    const { data, error } = await supabase.functions.invoke('get-zoom-meeting-details', {
      body: { activity_id: activityId }
    })

    if (error) throw error
    return data
  }
}
```

**Fichier** : `src/utils/zoom/zoomToolsFormatter.js`

```javascript
/**
 * Formatte les réponses Zoom pour le chatbot
 * Génère des messages conviviaux pour l'utilisateur
 */

export const zoomToolsFormatter = {
  /**
   * Formatte la réponse après création d'une réunion
   */
  formatCreateResponse(data) {
    return {
      success: true,
      message: `Réunion Zoom créée avec succès !`,
      details: {
        join_url: data.join_url,
        meeting_id: data.meeting_id,
        password: data.password
      },
      userMessage: `✅ J'ai créé la réunion Zoom. Voici le lien de participation : ${data.join_url}`
    }
  },

  /**
   * Formatte la réponse après suppression d'une réunion
   */
  formatDeleteResponse(data) {
    return {
      success: true,
      message: `Réunion Zoom supprimée avec succès.`,
      userMessage: `✅ J'ai supprimé la réunion Zoom.`
    }
  },

  /**
   * Formatte la réponse après édition d'une réunion
   */
  formatEditResponse(data) {
    return {
      success: true,
      message: `Réunion Zoom mise à jour avec succès.`,
      details: {
        join_url: data.join_url,
        meeting_id: data.meeting_id
      },
      userMessage: `✅ J'ai mis à jour la réunion Zoom.`
    }
  },

  /**
   * Formatte les détails d'une réunion Zoom
   */
  formatDetailsResponse(data) {
    return {
      success: true,
      details: {
        meeting_id: data.meeting_id,
        topic: data.topic,
        start_time: data.start_time,
        duration: data.duration,
        join_url: data.join_url,
        registrants_count: data.registrants_count || 0,
        registrants: data.registrants || []
      },
      userMessage: `📋 Détails de la réunion "${data.topic}" :\n` +
        `- Date : ${new Date(data.start_time).toLocaleString('fr-FR')}\n` +
        `- Durée : ${data.duration} minutes\n` +
        `- Inscrits : ${data.registrants_count || 0} personne(s)\n` +
        `- Lien : ${data.join_url}`
    }
  },

  /**
   * Formatte les erreurs
   */
  formatError(error) {
    return {
      success: false,
      error: error.message,
      userMessage: `❌ Une erreur s'est produite : ${error.message}`
    }
  }
}
```

### Étape 3 : Créer le gestionnaire d'outils LangChain

**Fichier** : `src/utils/ai/toolsManager.js`

```javascript
/**
 * Gestionnaire d'outils pour LangChain
 * Définit les outils (tools) que le chatbot peut utiliser
 */

import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { zoomApiClient } from '@/utils/zoom/zoomApiClient'
import { zoomToolsFormatter } from '@/utils/zoom/zoomToolsFormatter'

/**
 * Outil pour créer une réunion Zoom
 */
export const createZoomMeetingTool = new DynamicStructuredTool({
  name: 'create_zoom_meeting',
  description: 'Crée une réunion Zoom pour une activité donnée. Utilisez cet outil quand l\'utilisateur demande de créer une réunion Zoom.',
  schema: z.object({
    activity_id: z.string().describe('ID de l\'activité pour laquelle créer la réunion Zoom')
  }),
  func: async ({ activity_id }) => {
    try {
      const result = await zoomApiClient.createMeeting(activity_id)
      const formatted = zoomToolsFormatter.formatCreateResponse(result)
      return JSON.stringify(formatted)
    } catch (error) {
      const formatted = zoomToolsFormatter.formatError(error)
      return JSON.stringify(formatted)
    }
  }
})

/**
 * Outil pour supprimer une réunion Zoom
 */
export const deleteZoomMeetingTool = new DynamicStructuredTool({
  name: 'delete_zoom_meeting',
  description: 'Supprime une réunion Zoom associée à une activité. Utilisez cet outil quand l\'utilisateur demande de supprimer une réunion Zoom.',
  schema: z.object({
    activity_id: z.string().describe('ID de l\'activité dont il faut supprimer la réunion Zoom')
  }),
  func: async ({ activity_id }) => {
    try {
      const result = await zoomApiClient.deleteMeeting(activity_id)
      const formatted = zoomToolsFormatter.formatDeleteResponse(result)
      return JSON.stringify(formatted)
    } catch (error) {
      const formatted = zoomToolsFormatter.formatError(error)
      return JSON.stringify(formatted)
    }
  }
})

/**
 * Outil pour éditer une réunion Zoom
 */
export const editZoomMeetingTool = new DynamicStructuredTool({
  name: 'edit_zoom_meeting',
  description: 'Modifie une réunion Zoom existante (titre, date, durée, etc.). Utilisez cet outil quand l\'utilisateur demande de modifier une réunion Zoom.',
  schema: z.object({
    activity_id: z.string().describe('ID de l\'activité dont il faut modifier la réunion Zoom'),
    updates: z.object({
      title: z.string().optional().describe('Nouveau titre de la réunion'),
      start_time: z.string().optional().describe('Nouvelle date/heure de début (ISO 8601)'),
      duration: z.number().optional().describe('Nouvelle durée en minutes'),
      description: z.string().optional().describe('Nouvelle description')
    }).describe('Modifications à apporter à la réunion')
  }),
  func: async ({ activity_id, updates }) => {
    try {
      const result = await zoomApiClient.editMeeting(activity_id, updates)
      const formatted = zoomToolsFormatter.formatEditResponse(result)
      return JSON.stringify(formatted)
    } catch (error) {
      const formatted = zoomToolsFormatter.formatError(error)
      return JSON.stringify(formatted)
    }
  }
})

/**
 * Outil pour obtenir les détails d'une réunion Zoom
 */
export const getZoomMeetingDetailsTool = new DynamicStructuredTool({
  name: 'get_zoom_meeting_details',
  description: 'Obtient détails réunion Zoom (inscrits, horaires, etc.). Usage: demande infos Zoom.',
  schema: z.object({
    activity_id: z.string().describe('ID de l\'activité')
  }),
  func: async ({ activity_id }) => {
    try {
      const result = await zoomApiClient.getMeetingDetailsFromZoom(activity_id)
      const formatted = zoomToolsFormatter.formatDetailsResponse(result)
      return JSON.stringify(formatted)
    } catch (error) {
      const formatted = zoomToolsFormatter.formatError(error)
      return JSON.stringify(formatted)
    }
  }
})

/**
 * Retourne tous les outils Zoom disponibles
 */
export function getZoomTools(userRole) {
  // Vérifier que l'utilisateur a les permissions nécessaires
  const allowedRoles = ['admin', 'super_admin']

  if (!allowedRoles.includes(userRole)) {
    return [] // Pas d'outils disponibles pour ce rôle
  }

  return [
    createZoomMeetingTool,
    deleteZoomMeetingTool,
    editZoomMeetingTool,
    getZoomMeetingDetailsTool
  ]
}
```

### Étape 4 : Créer les composables Zoom

**Fichier** : `src/composables/zoom/useZoomMeetingTools.js`

```javascript
/**
 * Composable pour gérer les outils Zoom
 * Encapsule la logique d'interaction avec les edge functions
 */

import { ref } from 'vue'
import { zoomApiClient } from '@/utils/zoom/zoomApiClient'

export function useZoomMeetingTools() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Créer une réunion Zoom
   */
  async function createMeeting(activityId) {
    loading.value = true
    error.value = null

    try {
      const result = await zoomApiClient.createMeeting(activityId)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprimer une réunion Zoom
   */
  async function deleteMeeting(activityId) {
    loading.value = true
    error.value = null

    try {
      const result = await zoomApiClient.deleteMeeting(activityId)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Éditer une réunion Zoom
   */
  async function editMeeting(activityId, updates) {
    loading.value = true
    error.value = null

    try {
      const result = await zoomApiClient.editMeeting(activityId, updates)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer les détails d'une réunion depuis la base de données
   */
  async function getMeetingDetails(activityId) {
    loading.value = true
    error.value = null

    try {
      const result = await zoomApiClient.getMeetingDetails(activityId)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer les détails complets d'une réunion depuis l'API Zoom
   */
  async function getMeetingDetailsFromZoom(activityId) {
    loading.value = true
    error.value = null

    try {
      const result = await zoomApiClient.getMeetingDetailsFromZoom(activityId)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    createMeeting,
    deleteMeeting,
    editMeeting,
    getMeetingDetails,
    getMeetingDetailsFromZoom
  }
}
```

**Fichier** : `src/composables/zoom/useZoomToolsChat.js`

```javascript
/**
 * Composable pour intégrer les outils Zoom au chatbot
 * Gère la logique spécifique au chat et aux permissions
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getZoomTools } from '@/utils/ai/toolsManager'

export function useZoomToolsChat() {
  const authStore = useAuthStore()

  /**
   * Vérifie si l'utilisateur peut utiliser les outils Zoom
   */
  const canUseZoomTools = computed(() => {
    const allowedRoles = ['admin', 'super_admin']
    return allowedRoles.includes(authStore.user?.role)
  })

  /**
   * Retourne les outils disponibles pour l'utilisateur
   */
  const availableTools = computed(() => {
    if (!canUseZoomTools.value) {
      return []
    }

    return getZoomTools(authStore.user?.role)
  })

  /**
   * Retourne le message d'erreur si l'utilisateur n'a pas les permissions
   */
  const permissionErrorMessage = computed(() => {
    if (canUseZoomTools.value) return null

    return "Désolé, vous n'avez pas les permissions nécessaires pour gérer les réunions Zoom. Cette fonctionnalité est réservée aux administrateurs."
  })

  return {
    canUseZoomTools,
    availableTools,
    permissionErrorMessage
  }
}
```

### Étape 5 : Intégrer les outils dans le chatbot existant

**Fichier à modifier** : `src/composables/ai/useChatbot.js`

```javascript
// Importer les nouveaux outils
import { useZoomToolsChat } from '@/composables/zoom/useZoomToolsChat'

// Dans le composable useChatbot
export function useChatbot() {
  const { availableTools: zoomTools } = useZoomToolsChat()

  // Configurer LangChain avec les outils
  const model = new ChatAnthropic({
    modelName: 'claude-3-5-sonnet-20241022',
    anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    temperature: 0.7,
    maxTokens: 4096
  }).bind({
    tools: [
      ...zoomTools.value, // Ajouter les outils Zoom
      // ... autres outils
    ]
  })

  // ... reste du code
}
```

### Étape 6 : Optimisation des tokens (voir guide séparé)

Consulter [token-optimization-guide.md](./token-optimization-guide.md) pour :
- Stratégies de réduction de tokens
- Prompts optimisés
- Caching de réponses
- Limites de contexte

## Prérequis

### Variables d'environnement

Les variables Zoom sont déjà configurées dans Supabase pour les edge functions existantes :

```bash
# Variables déjà configurées (Supabase Edge Functions)
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_USER_ID=me
```

Aucune nouvelle variable n'est nécessaire pour cette fonctionnalité.

### Dépendances

```bash
# LangChain et outils
npm install @langchain/core @langchain/anthropic

# Validation de schémas
npm install zod
```

## Ordre d'implémentation recommandé

1. ✅ **Étape 1.1** : Créer l'edge function `edit-zoom-meeting`
2. ✅ **Étape 1.2** : Créer l'edge function `get-zoom-meeting-details`
3. ✅ **Étape 2** : Créer les utilitaires Zoom (`zoomApiClient.js`, `zoomToolsFormatter.js`)
4. ✅ **Étape 3** : Créer le gestionnaire d'outils LangChain (`toolsManager.js`)
5. ✅ **Étape 4** : Créer les composables Zoom
6. ✅ **Étape 5** : Intégrer les outils dans le chatbot existant
7. ✅ **Étape 6** : Tester et optimiser les tokens

## Tests et validation

### Tests manuels à effectuer

1. **Création de réunion via chatbot**
   - Demander au chatbot : "Crée une réunion Zoom pour l'activité ABC123"
   - Vérifier que la réunion est créée sur Zoom
   - Vérifier que le lien est retourné dans le chat

2. **Suppression de réunion via chatbot**
   - Demander : "Supprime la réunion Zoom de l'activité ABC123"
   - Vérifier la suppression sur Zoom et en base de données

3. **Édition de réunion via chatbot**
   - Demander : "Modifie le titre de la réunion Zoom de l'activité ABC123 en 'Nouveau titre'"
   - Vérifier la mise à jour sur Zoom

4. **Consultation des détails de réunion**
   - Demander : "Donne-moi les détails de la réunion Zoom de l'activité ABC123"
   - Vérifier l'affichage des participants inscrits
   - Vérifier l'affichage des informations de la réunion

5. **Permissions**
   - Tester avec un utilisateur sans rôle admin
   - Vérifier que les outils ne sont pas disponibles

### Tests de performance

- Mesurer le nombre de tokens utilisés par requête
- Vérifier les temps de réponse
- Optimiser si nécessaire (voir guide d'optimisation)

## Sécurité

### Contrôle d'accès

- ✅ Vérification des rôles (admin/super_admin) au niveau du chatbot
- ✅ Validation côté edge functions via RLS Supabase
- ✅ Pas d'exposition directe des credentials Zoom au frontend

### Validation des données

- ✅ Validation des paramètres avec Zod dans les outils LangChain
- ✅ Validation côté edge functions
- ✅ Gestion des erreurs complète

## Références

- **API Zoom** : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#tag/Meetings
- **LangChain.js Tools** : https://js.langchain.com/docs/modules/agents/tools/
- **Tool Calling avec Claude** : https://docs.anthropic.com/en/docs/build-with-claude/tool-use
- **Edge Functions existantes** :
  - [create-zoom-meeting/index.ts](../../supabase/functions/create-zoom-meeting/index.ts)
  - [delete-zoom-meeting/index.ts](../../supabase/functions/delete-zoom-meeting/index.ts)

## Notes importantes

⚠️ **Minimisation des coûts** : Consulter impérativement [token-optimization-guide.md](./token-optimization-guide.md) avant l'implémentation

⚠️ **Permissions** : Cette fonctionnalité est strictement réservée aux rôles `admin` et `super_admin`

⚠️ **Edge functions** : Toujours tester les edge functions localement avant le déploiement :
```bash
supabase functions serve edit-zoom-meeting
```

⚠️ **Déploiement** : Déployer l'edge function avec :
```bash
supabase functions deploy edit-zoom-meeting
```
