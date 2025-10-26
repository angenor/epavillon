/**
 * Composable pour l'assistant IA Zoom
 * Utilise Claude d'Anthropic avec des outils pour gérer les réunions Zoom
 * Support OpenRouter ou API directe Anthropic
 */

import { ref } from 'vue'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import {
  formatResponseWithReferences
} from '@/utils/ai/responseFormatter'

// Configuration
const USE_OPENROUTER = import.meta.env.VITE_USE_OPENROUTER === 'true'
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const OPENROUTER_CHAT_MODEL = import.meta.env.VITE_OPENROUTER_CHAT_MODEL || 'anthropic/claude-3.5-sonnet'
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const MAX_TOKENS = parseInt(import.meta.env.VITE_AI_CHAT_MAX_TOKENS) || 4096
const TEMPERATURE = parseFloat(import.meta.env.VITE_AI_CHAT_TEMPERATURE) || 0.7

// Vérifier que les clés API sont configurées
if (USE_OPENROUTER) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    console.warn('⚠️ OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in .env.local')
  }
} else {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    console.warn('⚠️ Anthropic API key is not configured. Please set VITE_ANTHROPIC_API_KEY in .env.local')
  }
}

export function useRAG() {
  const isGenerating = ref(false)
  const error = ref(null)

  /**
   * Initialise le modèle Claude (via OpenRouter ou API directe)
   * @param {Array} tools - Outils à lier au modèle (optionnel)
   * @returns {ChatAnthropic|ChatOpenAI}
   */
  function getClaudeModel(tools = []) {
    let model

    if (USE_OPENROUTER) {
      // Utiliser OpenRouter
      if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
        throw new Error('OpenRouter API key is not configured')
      }

      model = new ChatOpenAI({
        openAIApiKey: OPENROUTER_API_KEY,
        modelName: OPENROUTER_CHAT_MODEL,
        temperature: TEMPERATURE,
        maxTokens: MAX_TOKENS,
        configuration: {
          apiKey: OPENROUTER_API_KEY, // Forcer la clé API explicitement
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': import.meta.env.VITE_APP_URL || 'http://localhost:5173',
            'X-Title': 'e-Pavillon Climatique - Assistant IA'
          }
        }
      })
    } else {
      // Utiliser API directe Anthropic
      if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
        throw new Error('Anthropic API key is not configured')
      }

      model = new ChatAnthropic({
        anthropicApiKey: ANTHROPIC_API_KEY,
        modelName: 'claude-3-5-sonnet-20241022',
        temperature: TEMPERATURE,
        maxTokens: MAX_TOKENS
      })
    }

    // Lier les outils au modèle si fournis
    if (tools && tools.length > 0) {
      console.log('[RAG] Binding tools to model:', tools.map(t => t.name))
      return model.bindTools(tools)
    }

    return model
  }


  /**
   * Construit le prompt système pour Claude
   * @param {string} language - Langue de la réponse (fr ou en)
   * @param {string} userTimezone - Fuseau horaire de l'utilisateur (IANA timezone)
   * @returns {string}
   */
  function buildSystemPrompt(language = 'fr', userTimezone = 'America/Montreal') {
    // Obtenir la date/heure actuelle
    const now = new Date()
    const currentDateTime = now.toISOString()
    const currentDateFormatted = now.toLocaleString('fr-CA', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: userTimezone
    })

    if (language === 'en') {
      return `You are an intelligent AI assistant specialized in managing Zoom meetings for climate negotiation activities.
  Your role is to help users manage their Zoom meetings through simple, natural language commands.

  ## Current Date and Time
  Today is: ${currentDateFormatted}
  Current UTC time: ${currentDateTime}
  User timezone: ${userTimezone}

  ## Available Tools
  You have access to tools to manage activities and Zoom meetings:
  - **search_activity_by_title** - Find an activity by its title
  - **approve_activity** - Approve/validate an activity AND automatically create its Zoom meeting (atomic action)
  - **create_zoom_meeting** - Create/schedule a Zoom meeting (for already approved activities)
  - **create_standalone_zoom_meeting** - Create a Zoom meeting NOT linked to any activity
  - **edit_zoom_meeting** - Modify an existing meeting
  - **get_zoom_meeting_details** - Get detailed information about a meeting
  - **delete_zoom_meeting** - Delete/cancel a meeting

  ## How to Use Tools
  - If the user provides an activity TITLE → use search_activity_by_title first to find the ID
  - If the user provides an ID (UUID format) → use it directly
  - To APPROVE an activity → use approve_activity (automatically creates the Zoom meeting)
  - To CREATE a meeting on an already approved activity → use create_zoom_meeting
  - To CREATE a standalone meeting (no activity) → use create_standalone_zoom_meeting
  - To EDIT a meeting → use edit_zoom_meeting (provide activity_id OR meeting_id)
  - To DELETE a meeting → use delete_zoom_meeting (provide activity_id OR meeting_id)
  - Use tools ONLY when the user explicitly requests an action

  ## Creating Standalone Zoom Meetings
  When a user asks to create a Zoom meeting WITHOUT mentioning an activity:

  ### REQUIRED Information (ask if missing):
  1. **topic** - Meeting subject (e.g., "Team Standup")
  2. **duration** - Duration in minutes (e.g., 60)
  3. **start_time** - ISO 8601 format (e.g., "2024-12-25T14:00:00Z")

  ### OPTIONAL Information (flexible):
  - **timezone** - e.g., "America/Montreal" (default: "UTC")
  - **agenda** - Meeting description
  - **password** - Meeting password
  - **settings** - host_video, participant_video, waiting_room, etc.

  ### Interactive Collection
  If REQUIRED info is missing, ask politely in a conversational way. Wait for response, then call tool.

  Example:
  User: "Create a Zoom meeting for tomorrow"
  You: "I'll create a Zoom meeting for tomorrow! I need: What time? How long (in minutes)?"

  ### ⚠️ CRITICAL: Date and Timezone Handling
  When converting natural language dates to ISO 8601 format:

  **Step 1: Calculate the target date**
  - "aujourd'hui" / "today" → use current date
  - "demain" / "tomorrow" → add 1 day to current date
  - "après-demain" / "day after tomorrow" → add 2 days to current date
  - Specific date like "25 décembre" → use the specified date with current/next year

  **Step 2: Apply the correct timezone**
  - User mentions "heure de Québec" / "Québec time" / "EST" / "EDT" → timezone = "America/Montreal"
  - User mentions "UTC" / "GMT" → timezone = "UTC"
  - User mentions "Paris" → timezone = "Europe/Paris"
  - No timezone specified → default to "${userTimezone}" (user's local timezone)

  **Step 3: Convert to ISO 8601**
  Format: YYYY-MM-DDTHH:mm:ss
  Example calculations based on current date (${currentDateFormatted}):
  - "demain à 14h" → calculate tomorrow's date, set time to 14:00:00 → "2025-10-26T14:00:00" with timezone "${userTimezone}"
  - "après-demain à 8h" → calculate day after tomorrow (+2 days), set time to 08:00:00 → "2025-10-27T08:00:00" with timezone "${userTimezone}"
  - "3 PM next Monday" → find next Monday's date, set time to 15:00:00 with timezone "${userTimezone}"

  **Step 4: Send to the Edge Function**
  - **start_time**: The ISO 8601 string (e.g., "2025-10-27T08:00:00")
  - **timezone**: The IANA timezone name (e.g., "${userTimezone}")

  **Example:**
  User: "Create a meeting tomorrow at 2 PM for 60 minutes"
  Current date: ${currentDateFormatted}
  Calculation:
  - "tomorrow" = current date + 1 day
  - "2 PM" = 14:00:00
  - No timezone mentioned = use default "${userTimezone}"
  Tool call parameters:
  - topic: "Meeting" (extracted or asked from user)
  - start_time: "2025-10-26T14:00:00"
  - timezone: "${userTimezone}"
  - duration: 60

  ## Editing and Deleting Standalone Zoom Meetings
  For standalone meetings, use the meeting_id returned when the meeting was created.

  ### Editing:
  - Use **edit_zoom_meeting** with **meeting_id** parameter
  - Provide updates object with fields to change (title, start_time, duration, description)

  Example:
  User: "Change the start time of meeting 123456789 to 3 PM tomorrow"
  You: Call edit_zoom_meeting with meeting_id="123456789" and updates={start_time: "2024-12-26T15:00:00Z"}

  ### Deleting:
  - Use **delete_zoom_meeting** with **meeting_id** parameter

  Example:
  User: "Delete meeting 123456789"
  You: Call delete_zoom_meeting with meeting_id="123456789"

  ## ⚠️ ABSOLUTE RULE - Reading Tool Results ⚠️
  YOU MUST:
  1. WAIT for the complete tool result
  2. READ the "success" field in the JSON result
  3. If "success": false → Operation FAILED - inform the user of the error
  4. If "success": true → Operation SUCCEEDED - provide the result details
  5. NEVER invent or assume a result

  ### REQUIRED Examples:

  ❌ FORBIDDEN - Optimistic response without reading result:
  "Great news! The meeting was created successfully!"

  ✅ CORRECT - Read result then respond based on it:
  Result received: {"success": false, "error": "Edge Function returned..."}
  Response: "❌ Unable to create meeting: Edge Function returned..."

  ✅ CORRECT - Success with details:
  Result received: {"success": true, "join_url": "https://zoom.us/j/123"}
  Response: "✅ Meeting created! Link: https://zoom.us/j/123"

  IF YOU RESPOND WITHOUT READING THE RESULT, YOU WILL GIVE FALSE INFORMATION TO THE USER.

  ## Response Style
  - Answer in English
  - Be professional and concise
  - Provide actionable information
  - Ask for clarification when needed`
      }

      return `Tu es un assistant IA intelligent spécialisé dans la gestion des réunions Zoom pour les activités de négociations climatiques.
  Ton rôle est d'aider les utilisateurs à gérer leurs réunions Zoom via des commandes simples en langage naturel.

  ## Date et heure actuelles
  Aujourd'hui : ${currentDateFormatted}
  Heure UTC actuelle : ${currentDateTime}
  Fuseau horaire de l'utilisateur : ${userTimezone}

  ## Outils disponibles
  Tu as accès à des outils pour gérer les activités et les réunions Zoom :
  - **search_activity_by_title** - Trouver une activité par son titre
  - **approve_activity** - Approuver/valider une activité ET créer automatiquement sa réunion Zoom (action atomique)
  - **create_zoom_meeting** - Créer/planifier une réunion Zoom (pour activités déjà approuvées)
  - **create_standalone_zoom_meeting** - Créer une réunion Zoom NON liée à une activité
  - **edit_zoom_meeting** - Modifier une réunion existante
  - **get_zoom_meeting_details** - Obtenir les détails d'une réunion
  - **delete_zoom_meeting** - Supprimer/annuler une réunion

  ## Comment utiliser les outils
  - Si l'utilisateur donne un TITRE d'activité → utilise d'abord search_activity_by_title pour trouver l'ID
  - Si l'utilisateur donne un ID (format UUID) → utilise-le directement
  - Pour APPROUVER une activité → utilise approve_activity (crée automatiquement la réunion Zoom)
  - Pour CRÉER une réunion sur une activité déjà approuvée → utilise create_zoom_meeting
  - Pour CRÉER une réunion standalone (sans activité) → utilise create_standalone_zoom_meeting
  - Utilise les outils UNIQUEMENT quand l'utilisateur demande explicitement une action

  ## Créer des réunions Zoom standalone
  Quand un utilisateur demande de créer une réunion Zoom SANS mentionner d'activité :

  ### Informations OBLIGATOIRES (demande si manquantes) :
  1. **topic** - Sujet de la réunion (ex: "Réunion d'équipe")
  2. **duration** - Durée en minutes (ex: 60)
  3. **start_time** - Format ISO 8601 (ex: "2024-12-25T14:00:00Z")

  ### Informations OPTIONNELLES (flexibles) :
  - **timezone** - ex: "America/Montreal" (défaut: "UTC")
  - **agenda** - Description de la réunion
  - **password** - Mot de passe de la réunion
  - **settings** - host_video, participant_video, waiting_room, etc.

  ### Collecte interactive
  Si des infos OBLIGATOIRES manquent, demande poliment de manière conversationnelle. Attends la réponse, puis appelle l'outil.

  Exemple :
  Utilisateur : "Crée une réunion Zoom pour demain"
  Toi : "Je vais créer une réunion Zoom pour demain ! J'ai besoin de : À quelle heure ? Durée (en minutes) ?"

  ### ⚠️ CRITIQUE : Gestion des dates et fuseaux horaires
  Lors de la conversion de dates en langage naturel vers le format ISO 8601 :

  **Étape 1 : Calculer la date cible**
  - "aujourd'hui" / "today" → utiliser la date actuelle
  - "demain" / "tomorrow" → ajouter 1 jour à la date actuelle
  - "après-demain" / "day after tomorrow" → ajouter 2 jours à la date actuelle
  - Date spécifique comme "25 décembre" → utiliser la date spécifiée avec l'année en cours/suivante

  **Étape 2 : Appliquer le fuseau horaire correct**
  - L'utilisateur mentionne "heure de Québec" / "Québec time" / "EST" / "EDT" → timezone = "America/Montreal"
  - L'utilisateur mentionne "UTC" / "GMT" → timezone = "UTC"
  - L'utilisateur mentionne "Paris" → timezone = "Europe/Paris"
  - Aucun fuseau spécifié → utiliser par défaut "${userTimezone}" (fuseau local de l'utilisateur)

  **Étape 3 : Convertir en ISO 8601**
  Format : YYYY-MM-DDTHH:mm:ss
  Exemples de calculs basés sur la date actuelle (${currentDateFormatted}) :
  - "demain à 14h" → calculer la date de demain, définir l'heure à 14:00:00 → "2025-10-26T14:00:00" avec timezone "${userTimezone}"
  - "après-demain à 8h" → calculer après-demain (+2 jours), définir l'heure à 08:00:00 → "2025-10-27T08:00:00" avec timezone "${userTimezone}"
  - "3 PM lundi prochain" → trouver la date du prochain lundi, définir l'heure à 15:00:00 avec timezone "${userTimezone}"

  **Étape 4 : Envoyer à l'Edge Function**
  - **start_time** : La chaîne ISO 8601 (ex: "2025-10-27T08:00:00")
  - **timezone** : Le nom IANA du timezone (ex: "${userTimezone}")

  **Exemple :**
  Utilisateur : "Créer une réunion après-demain à 8h pour 30 minutes"
  Date actuelle : ${currentDateFormatted}
  Calcul :
  - "après-demain" = date actuelle + 2 jours
  - "8h" = 08:00:00
  - Aucun fuseau mentionné = utiliser par défaut "${userTimezone}"
  Paramètres de l'outil :
  - topic: "Réunion" (extrait ou demandé à l'utilisateur)
  - start_time: "2025-10-27T08:00:00"
  - timezone: "${userTimezone}"
  - duration: 30

  ## ⚠️ RÈGLE ABSOLUE - Lecture des résultats des outils ⚠️
  TU DOIS OBLIGATOIREMENT :
  1. ATTENDRE le résultat complet de l'outil
  2. LIRE le champ "success" dans le résultat JSON
  3. Si "success": false → L'opération a ÉCHOUÉ - informe l'utilisateur de l'erreur
  4. Si "success": true → L'opération a RÉUSSI - donne les détails du résultat
  5. NE JAMAIS inventer ou supposer un résultat

  ### Exemples OBLIGATOIRES à suivre :

  ❌ INTERDIT - Réponse optimiste sans lire le résultat :
  "Excellente nouvelle ! La réunion a été créée avec succès !"

  ✅ CORRECT - Lecture du résultat puis réponse basée sur le résultat :
  Résultat reçu : {"success": false, "error": "Edge Function returned..."}
  Réponse : "❌ Impossible de créer la réunion : Edge Function returned..."

  ✅ CORRECT - Succès avec détails :
  Résultat reçu : {"success": true, "join_url": "https://zoom.us/j/123"}
  Réponse : "✅ Réunion créée ! Lien : https://zoom.us/j/123"

  SI TU RÉPONDS SANS LIRE LE RÉSULTAT, TU DONNERAS DES INFORMATIONS FAUSSES À L'UTILISATEUR.

  ## Style de réponse
  - Réponds en français
  - Sois professionnel et concis
  - Fournis des informations actionnables
  - Demande des clarifications si nécessaire`
  }

  /**
   * Génère une réponse avec les outils Zoom
   * @param {string} question - Question de l'utilisateur
   * @param {Array} conversationHistory - Historique de la conversation
   * @param {object} options - Options (language, tools)
   * @returns {Promise<{response: string, sources: Array, metadata: object}>}
   */

  const generateResponse = async (question, conversationHistory = [], options = {}) => {
    try {
      isGenerating.value = true
      error.value = null

      const startTime = Date.now()

      const {
        language = 'fr',
        tools = [],
        timezone = 'America/Montreal' // Fuseau horaire par défaut
      } = options

      console.log('[AI] Processing question:', {
        question: question.substring(0, 50) + '...',
        hasTools: tools.length > 0,
        toolsCount: tools.length,
        timezone
      })

      // Vérifier que des outils sont disponibles
      if (tools.length === 0) {
        const noToolsMessage = language === 'en'
          ? 'No Zoom management tools are available. Please contact your administrator.'
          : 'Aucun outil de gestion Zoom n\'est disponible. Veuillez contacter votre administrateur.'

        return {
          response: noToolsMessage,
          sources: [],
          metadata: {
            responseTime: Date.now() - startTime,
            tokens: 0
          }
        }
      }

      // Préparer les messages
      const messages = []

      // Message système avec le timezone de l'utilisateur
      messages.push(new SystemMessage(buildSystemPrompt(language, timezone)))

      // Ajouter l'historique de conversation (limité aux 10 derniers messages)
      const recentHistory = conversationHistory.slice(-10)
      recentHistory.forEach(msg => {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content))
        } else if (msg.role === 'assistant') {
          messages.push(new AIMessage(msg.content))
        }
      })

      // Ajouter la question actuelle
      messages.push(new HumanMessage(question))

      // Générer la réponse avec Claude et les outils Zoom
      const model = getClaudeModel(tools)
      let response = await model.invoke(messages)

      // Gérer les appels d'outils (tool calls)
      let toolCallsExecuted = 0
      const maxToolCalls = 5 // Limite pour éviter les boucles infinies

      while (response.tool_calls && response.tool_calls.length > 0 && toolCallsExecuted < maxToolCalls) {
        console.log('[AI] Tool calls detected:', response.tool_calls.length)

        // Ajouter la réponse de l'IA avec tool_calls aux messages
        messages.push(response)

        // Exécuter chaque outil appelé
        for (const toolCall of response.tool_calls) {
          console.log('[AI] Executing tool:', toolCall.name, toolCall.args)

          // Trouver l'outil correspondant
          const tool = tools.find(t => t.name === toolCall.name)

          if (tool) {
            try {
              const toolResult = await tool.func(toolCall.args)
              console.log('[AI] Tool result:', toolResult)

              // Ajouter le résultat de l'outil aux messages
              messages.push(new ToolMessage({
                content: toolResult,
                tool_call_id: toolCall.id
              }))

              // Ajouter un rappel explicite pour forcer la lecture du résultat
              try {
                const parsedResult = JSON.parse(toolResult)
                if (parsedResult.success === false) {
                  messages.push(new HumanMessage(
                    language === 'en'
                      ? `⚠️ WARNING: The tool returned an ERROR (success: false). You MUST inform the user of the error and NOT say the operation succeeded.`
                      : `⚠️ ATTENTION: L'outil a retourné une ERREUR (success: false). Tu DOIS informer l'utilisateur de l'erreur et NE PAS dire que l'opération a réussi.`
                  ))
                } else if (parsedResult.success === true) {
                  messages.push(new HumanMessage(
                    language === 'en'
                      ? `✅ The tool returned SUCCESS. You can use the details provided in the result to inform the user.`
                      : `✅ L'outil a retourné un SUCCÈS. Tu peux utiliser les détails fournis dans le résultat pour informer l'utilisateur.`
                  ))
                }
              } catch (e) {
                // Si le parsing échoue, on continue sans message de rappel
              }
            } catch (toolError) {
              console.error('[AI] Tool execution error:', toolError)
              messages.push(new ToolMessage({
                content: JSON.stringify({ success: false, error: toolError.message }),
                tool_call_id: toolCall.id
              }))
              messages.push(new HumanMessage(
                language === 'en'
                  ? `⚠️ CRITICAL ERROR: The tool failed with an exception. You MUST inform the user of this error.`
                  : `⚠️ ERREUR CRITIQUE: L'outil a échoué avec une exception. Tu DOIS informer l'utilisateur de cette erreur.`
              ))
            }
          }
        }

        // Générer une nouvelle réponse en incluant les résultats des outils
        response = await model.invoke(messages)
        toolCallsExecuted++
      }

      const responseTime = Date.now() - startTime

      return {
        response: response.content,
        sources: [], // Pas de sources documentaires
        metadata: {
          responseTime,
          tokens: response.usage_metadata?.total_tokens || 0,
          model: USE_OPENROUTER ? OPENROUTER_CHAT_MODEL : 'claude-3-5-sonnet-20241022',
          toolCallsExecuted
        }
      }
    } catch (err) {
      console.error('Error generating AI response:', err)
      error.value = err.message

      const errorMessage = options.language === 'en'
        ? 'An error occurred while generating the response. Please try again.'
        : 'Une erreur s\'est produite lors de la génération de la réponse. Veuillez réessayer.'

      return {
        response: errorMessage,
        sources: [],
        metadata: {
          error: err.message,
          responseTime: 0,
          tokens: 0
        }
      }
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * Génère une réponse formatée avec références
   * @param {string} question - Question de l'utilisateur
   * @param {Array} conversationHistory - Historique de la conversation
   * @param {object} options - Options (category, language, k)
   * @returns {Promise<object>}
   */
  const generateFormattedResponse = async (question, conversationHistory = [], options = {}) => {
    const result = await generateResponse(question, conversationHistory, options)

    return {
      ...formatResponseWithReferences(result.response, result.sources),
      metadata: result.metadata
    }
  }

  /**
   * Génère un titre pour une session basé sur la première question
   * @param {string} firstQuestion - Première question
   * @param {string} language - Langue
   * @returns {Promise<string>}
   */
  const generateSessionTitle = async (firstQuestion, language = 'fr') => {
    try {
      const model = getClaudeModel()

      const prompt = language === 'en'
        ? `Generate a short title (max 50 characters) for a conversation starting with this question: "${firstQuestion}". Return only the title, nothing else.`
        : `Génère un titre court (max 50 caractères) pour une conversation commençant par cette question : "${firstQuestion}". Retourne uniquement le titre, rien d'autre.`

      const response = await model.invoke([new HumanMessage(prompt)])

      return response.content.trim().replace(/['"]/g, '')
    } catch (err) {
      console.error('Error generating session title:', err)
      // Fallback: utiliser les premiers mots de la question
      return firstQuestion.slice(0, 50).trim() + (firstQuestion.length > 50 ? '...' : '')
    }
  }

  /**
   * Vérifie si Claude est configuré
   * @returns {boolean}
   */
  const isClaudeConfigured = () => {
    if (USE_OPENROUTER) {
      return Boolean(OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here')
    } else {
      return Boolean(ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here')
    }
  }

  /**
   * Obtient la configuration actuelle
   * @returns {object}
   */
  const getConfiguration = () => {
    return {
      provider: USE_OPENROUTER ? 'OpenRouter' : 'Anthropic Direct',
      model: USE_OPENROUTER ? OPENROUTER_CHAT_MODEL : 'claude-3-5-sonnet-20241022',
      maxTokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      isConfigured: isClaudeConfigured()
    }
  }

  return {
    // État
    isGenerating,
    error,

    // Méthodes
    generateResponse,
    generateFormattedResponse,
    generateSessionTitle,
    isClaudeConfigured,
    getConfiguration
  }
}
