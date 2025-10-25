/**
 * Composable pour le système RAG (Retrieval Augmented Generation)
 * Utilise Claude d'Anthropic pour générer des réponses basées sur les documents
 * Support OpenRouter ou API directe Anthropic
 * Support des outils (tools) pour les fonctionnalités avancées (Zoom, etc.)
 */

import { ref } from 'vue'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { useDocumentEmbeddings } from './useDocumentEmbeddings'
import {
  formatResponseWithReferences,
  extractResponseMetadata
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
  const { searchSimilarDocuments } = useDocumentEmbeddings()

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
   * Construit le contexte à partir des documents récupérés
   * @param {Array} documents - Documents similaires
   * @returns {string}
   */
  function buildContext(documents) {
    if (!documents || documents.length === 0) {
      return 'Aucun document pertinent trouvé.'
    }

    const contextParts = documents.map((doc, index) => {
      const metadata = doc.chunk_metadata || {}
      const title = metadata.title || metadata.document_title || 'Document sans titre'
      const page = metadata.page || 'N/A'
      const category = metadata.category || 'N/A'

      return `
[Document ${index + 1}]
Titre: ${title}
Catégorie: ${category}
Page: ${page}
Contenu:
${doc.chunk_text}
---`
    })

    return `Voici les documents pertinents pour répondre à la question:\n\n${contextParts.join('\n\n')}`
  }

  /**
   * Construit le prompt système pour Claude
   * @param {string} language - Langue de la réponse (fr ou en)
   * @param {boolean} hasTools - Indique si des outils sont disponibles
   * @returns {string}
   */
  function buildSystemPrompt(language = 'fr', hasTools = false) {
    const toolsInstructions = hasTools ? `

    ## Outils disponibles
    Tu as accès à des outils pour gérer les activités et les réunions Zoom. Utilise-les intelligemment :
    - Pour trouver une activité par son titre → utilise search_activity_by_title
    - Pour approuver/valider une activité ET créer automatiquement sa réunion Zoom → utilise approve_activity (action atomique)
    - Pour créer/planifier une réunion Zoom (activité déjà approuvée) → utilise create_zoom_meeting
    - Pour modifier une réunion existante → utilise edit_zoom_meeting
    - Pour obtenir des détails sur une réunion → utilise get_zoom_meeting_details
    - Pour supprimer/annuler une réunion → utilise delete_zoom_meeting

    IMPORTANT - Utilisation des outils :
    - Si l'utilisateur donne un TITRE d'activité, utilise d'abord search_activity_by_title pour trouver l'ID
    - Si l'utilisateur donne un ID (format UUID), utilise-le directement
    - Pour APPROUVER une activité → utilise approve_activity (crée automatiquement la réunion Zoom)
    - Pour CRÉER une réunion sur une activité déjà approuvée → utilise create_zoom_meeting
    - Utilise les outils UNIQUEMENT quand l'utilisateur demande explicitement une action
    - Pour les questions sur les documents, utilise TOUJOURS le contexte fourni

    ⚠️ RÈGLE ABSOLUE - Lecture des résultats des outils ⚠️
    TU DOIS OBLIGATOIREMENT :
    1. ATTENDRE le résultat complet de l'outil
    2. LIRE le champ "success" dans le résultat JSON
    3. Si "success": false → L'opération a ÉCHOUÉ - informe l'utilisateur de l'erreur
    4. Si "success": true → L'opération a RÉUSSI - donne les détails du résultat
    5. NE JAMAIS inventer ou supposer un résultat

    Exemples OBLIGATOIRES à suivre :

    ❌ INTERDIT - Réponse optimiste sans lire le résultat :
    "Excellente nouvelle ! La réunion a été créée avec succès !"

    ✅ CORRECT - Lecture du résultat puis réponse basée sur le résultat :
    Résultat reçu : {"success": false, "error": "Edge Function returned..."}
    Réponse : "❌ Impossible de créer la réunion : Edge Function returned..."

    ✅ CORRECT - Succès avec détails :
    Résultat reçu : {"success": true, "join_url": "https://zoom.us/j/123"}
    Réponse : "✅ Réunion créée ! Lien : https://zoom.us/j/123"

    SI TU RÉPONDS SANS LIRE LE RÉSULTAT, TU DONNERAS DES INFORMATIONS FAUSSES À L'UTILISATEUR.` : ''

        if (language === 'en') {
          return `You are an intelligent AI assistant specialized in climate negotiations, biodiversity, and desertification.
    You help negotiators by answering questions from documents AND managing Zoom meetings when needed.

    ## Core Capabilities
    1. **Document Research**: Answer questions based on provided documents
    2. **Zoom Management**: Create, modify, and manage Zoom meetings for activities (if tools available)

    ## Instructions for Document Questions
    1. Always base your answers on the documents provided in the context
    2. If the answer is not in the documents, clearly say so
    3. Provide specific references (document title, page) when possible
    4. Be concise and precise
    5. If several documents address the question, synthesize the information
    6. Use professional language appropriate for negotiators${toolsInstructions}

    ## Response Style
    - Answer in English
    - Be professional and concise
    - Provide actionable information
    - Ask for clarification when needed`
        }

        return `Tu es un assistant IA intelligent spécialisé dans les négociations climatiques, la biodiversité et la désertification.
    Tu aides les négociateurs en répondant à leurs questions à partir des documents ET en gérant les réunions Zoom si nécessaire.

    ## Capacités principales
    1. **Recherche documentaire** : Répondre aux questions à partir des documents fournis
    2. **Gestion Zoom** : Créer, modifier et gérer les réunions Zoom des activités (si outils disponibles)

    ## Instructions pour les questions documentaires
    1. Base toujours tes réponses sur les documents fournis dans le contexte
    2. Si la réponse ne se trouve pas dans les documents, dis-le clairement
    3. Fournis des références précises (titre du document, page) quand c'est possible
    4. Sois concis et précis
    5. Si plusieurs documents traitent de la question, synthétise les informations
    6. Utilise un langage professionnel adapté aux négociateurs${toolsInstructions}

    ## Style de réponse
    - Réponds en français
    - Sois professionnel et concis
    - Fournis des informations actionnables
    - Demande des clarifications si nécessaire`
  }

  /**
   * Génère une réponse avec RAG
   * @param {string} question - Question de l'utilisateur
   * @param {Array} conversationHistory - Historique de la conversation
   * @param {object} options - Options (category, language, k, tools)
   * @returns {Promise<{response: string, sources: Array, metadata: object}>}
   */
  /**
   * Détecte si la question est une action pure (sans besoin de documents)
   * @param {string} question - Question de l'utilisateur
   * @param {boolean} hasTools - Outils disponibles
   * @returns {boolean}
   */
  function isPureAction(question, hasTools) {
    if (!hasTools) return false

    const lowerQuestion = question.toLowerCase()
    const actionKeywords = [
      'crée', 'créer', 'créé', 'création',
      'supprime', 'supprimer', 'supprimé', 'suppression',
      'modifie', 'modifier', 'modifié', 'modification',
      'édite', 'éditer', 'édité', 'édition',
      'annule', 'annuler', 'annulé', 'annulation',
      'planifie', 'planifier', 'planifié', 'planification',
      'approuve', 'approuver', 'approuvé', 'approbation',
      'valide', 'valider', 'validé', 'validation',
      'create', 'delete', 'edit', 'modify', 'cancel', 'schedule',
      'approve', 'validate'
    ]

    const hasActionKeyword = actionKeywords.some(keyword => lowerQuestion.includes(keyword))
    const hasZoomKeyword = lowerQuestion.includes('zoom') || lowerQuestion.includes('réunion') || lowerQuestion.includes('meeting')

    // Cas spécial : approuver/valider une activité crée automatiquement une réunion Zoom
    const isApprovalAction = lowerQuestion.includes('approuve') || lowerQuestion.includes('valide') || lowerQuestion.includes('approve') || lowerQuestion.includes('validate')
    const hasActivityKeyword = lowerQuestion.includes('activité') || lowerQuestion.includes('activity')

    if (isApprovalAction && hasActivityKeyword) {
      return true
    }

    return hasActionKeyword && hasZoomKeyword
  }

  const generateResponse = async (question, conversationHistory = [], options = {}) => {
    try {
      isGenerating.value = true
      error.value = null

      const startTime = Date.now()

      const {
        category = null,
        language = 'fr',
        k = 5,
        tools = []
      } = options

      // Étape 1: Décider si on a besoin de chercher des documents
      let similarDocuments = []
      let skippedEmbeddings = false

      console.log('[RAG] Analyzing question:', {
        question: question.substring(0, 50) + '...',
        hasTools: tools.length > 0,
        toolsCount: tools.length
      })

      if (isPureAction(question, tools.length > 0)) {
        // Action pure détectée : skip la recherche documentaire pour économiser les appels API
        console.log('[RAG] ✅ Pure action detected, skipping document search')
        skippedEmbeddings = true
      } else {
        // Question documentaire ou mixte : chercher des documents
        console.log('[RAG] 📚 Document search required')
        similarDocuments = await searchSimilarDocuments(question, k, category)
      }

      // Si aucun document trouvé ET aucun outil disponible, retourner une erreur
      if (similarDocuments.length === 0 && tools.length === 0) {
        const noDocsMessage = language === 'en'
          ? 'I could not find relevant documents to answer your question. Please try rephrasing your question or check if documents are available in the database.'
          : 'Je n\'ai pas trouvé de documents pertinents pour répondre à votre question. Veuillez reformuler votre question ou vérifier si des documents sont disponibles dans la base de données.'

        return {
          response: noDocsMessage,
          sources: [],
          metadata: {
            responseTime: Date.now() - startTime,
            tokens: 0,
            documentsFound: 0
          }
        }
      }

      // Étape 2: Construire le contexte (peut être vide si aucun document)
      const context = similarDocuments.length > 0
        ? buildContext(similarDocuments)
        : (language === 'en'
          ? 'The user is requesting an action. Use the appropriate tools to fulfill the request.'
          : 'L\'utilisateur demande une action. Utilise les outils appropriés pour répondre à sa demande.')

      // Étape 3: Préparer les messages
      const messages = []

      // Message système (avec information sur les outils disponibles)
      messages.push(new SystemMessage(buildSystemPrompt(language, tools.length > 0)))

      // Ajouter le contexte comme message système
      messages.push(new SystemMessage(context))

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

      // Étape 4: Générer la réponse avec Claude (avec outils si fournis)
      const model = getClaudeModel(tools)
      let response = await model.invoke(messages)

      // Étape 5: Gérer les appels d'outils (tool calls)
      let toolCallsExecuted = 0
      const maxToolCalls = 5 // Limite pour éviter les boucles infinies

      while (response.tool_calls && response.tool_calls.length > 0 && toolCallsExecuted < maxToolCalls) {
        console.log('[RAG] Tool calls detected:', response.tool_calls.length)

        // Ajouter la réponse de l'IA avec tool_calls aux messages
        messages.push(response)

        // Exécuter chaque outil appelé
        for (const toolCall of response.tool_calls) {
          console.log('[RAG] Executing tool:', toolCall.name, toolCall.args)

          // Trouver l'outil correspondant
          const tool = tools.find(t => t.name === toolCall.name)

          if (tool) {
            try {
              const toolResult = await tool.func(toolCall.args)
              console.log('[RAG] Tool result:', toolResult)

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
                    `⚠️ ATTENTION: L'outil a retourné une ERREUR (success: false). Tu DOIS informer l'utilisateur de l'erreur et NE PAS dire que l'opération a réussi.`
                  ))
                } else if (parsedResult.success === true) {
                  messages.push(new HumanMessage(
                    `✅ L'outil a retourné un SUCCÈS. Tu peux utiliser les détails fournis dans le résultat pour informer l'utilisateur.`
                  ))
                }
              } catch (e) {
                // Si le parsing échoue, on continue sans message de rappel
              }
            } catch (toolError) {
              console.error('[RAG] Tool execution error:', toolError)
              messages.push(new ToolMessage({
                content: JSON.stringify({ success: false, error: toolError.message }),
                tool_call_id: toolCall.id
              }))
              messages.push(new HumanMessage(
                `⚠️ ERREUR CRITIQUE: L'outil a échoué avec une exception. Tu DOIS informer l'utilisateur de cette erreur.`
              ))
            }
          }
        }

        // Générer une nouvelle réponse en incluant les résultats des outils
        response = await model.invoke(messages)
        toolCallsExecuted++
      }

      const responseTime = Date.now() - startTime

      // Préparer les sources avec métadonnées
      const sources = similarDocuments.map(doc => ({
        pageContent: doc.chunk_text,
        metadata: {
          ...doc.chunk_metadata,
          document_id: doc.document_id,
          similarity: doc.similarity
        }
      }))

      return {
        response: response.content,
        sources: sources,
        metadata: {
          responseTime,
          tokens: response.usage_metadata?.total_tokens || 0,
          documentsFound: similarDocuments.length,
          model: USE_OPENROUTER ? OPENROUTER_CHAT_MODEL : 'claude-3-5-sonnet-20241022',
          toolCallsExecuted,
          skippedEmbeddings // Indique si on a économisé un appel API OpenAI
        }
      }
    } catch (err) {
      console.error('Error generating RAG response:', err)
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
          tokens: 0,
          documentsFound: 0
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
    getConfiguration,
    buildContext,
    buildSystemPrompt
  }
}
