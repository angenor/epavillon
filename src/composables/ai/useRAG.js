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
   * @returns {string}
   */
  function buildSystemPrompt(language = 'fr') {
    if (language === 'en') {
      return `You are an intelligent AI assistant specialized in managing Zoom meetings for climate negotiation activities.
Your role is to help users manage their Zoom meetings through simple, natural language commands.

## Available Tools
You have access to tools to manage activities and Zoom meetings:
- **search_activity_by_title** - Find an activity by its title
- **approve_activity** - Approve/validate an activity AND automatically create its Zoom meeting (atomic action)
- **create_zoom_meeting** - Create/schedule a Zoom meeting (for already approved activities)
- **edit_zoom_meeting** - Modify an existing meeting
- **get_zoom_meeting_details** - Get detailed information about a meeting
- **delete_zoom_meeting** - Delete/cancel a meeting

## How to Use Tools
- If the user provides an activity TITLE → use search_activity_by_title first to find the ID
- If the user provides an ID (UUID format) → use it directly
- To APPROVE an activity → use approve_activity (automatically creates the Zoom meeting)
- To CREATE a meeting on an already approved activity → use create_zoom_meeting
- Use tools ONLY when the user explicitly requests an action

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

## Outils disponibles
Tu as accès à des outils pour gérer les activités et les réunions Zoom :
- **search_activity_by_title** - Trouver une activité par son titre
- **approve_activity** - Approuver/valider une activité ET créer automatiquement sa réunion Zoom (action atomique)
- **create_zoom_meeting** - Créer/planifier une réunion Zoom (pour activités déjà approuvées)
- **edit_zoom_meeting** - Modifier une réunion existante
- **get_zoom_meeting_details** - Obtenir les détails d'une réunion
- **delete_zoom_meeting** - Supprimer/annuler une réunion

## Comment utiliser les outils
- Si l'utilisateur donne un TITRE d'activité → utilise d'abord search_activity_by_title pour trouver l'ID
- Si l'utilisateur donne un ID (format UUID) → utilise-le directement
- Pour APPROUVER une activité → utilise approve_activity (crée automatiquement la réunion Zoom)
- Pour CRÉER une réunion sur une activité déjà approuvée → utilise create_zoom_meeting
- Utilise les outils UNIQUEMENT quand l'utilisateur demande explicitement une action

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
        tools = []
      } = options

      console.log('[AI] Processing question:', {
        question: question.substring(0, 50) + '...',
        hasTools: tools.length > 0,
        toolsCount: tools.length
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

      // Message système
      messages.push(new SystemMessage(buildSystemPrompt(language)))

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
