/**
 * Composable pour le système RAG (Retrieval Augmented Generation)
 * Utilise Claude d'Anthropic pour générer des réponses basées sur les documents
 * Support OpenRouter ou API directe Anthropic
 */

import { ref } from 'vue'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
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
   * @returns {ChatAnthropic|ChatOpenAI}
   */
  function getClaudeModel() {
    if (USE_OPENROUTER) {
      // Utiliser OpenRouter
      if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
        throw new Error('OpenRouter API key is not configured')
      }

      return new ChatOpenAI({
        openAIApiKey: OPENROUTER_API_KEY,
        modelName: OPENROUTER_CHAT_MODEL,
        temperature: TEMPERATURE,
        maxTokens: MAX_TOKENS,
        configuration: {
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

      return new ChatAnthropic({
        anthropicApiKey: ANTHROPIC_API_KEY,
        modelName: 'claude-3-5-sonnet-20241022',
        temperature: TEMPERATURE,
        maxTokens: MAX_TOKENS
      })
    }
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
   * @returns {string}
   */
  function buildSystemPrompt(language = 'fr') {
    if (language === 'en') {
      return `You are an AI assistant specialized in climate negotiations, biodiversity, and desertification.
Your role is to help negotiators by answering questions based on the provided documents.

Instructions:
1. Always base your answers on the documents provided in the context
2. If the answer is not in the documents, clearly say so
3. Provide specific references (document title, page) when possible
4. Be concise and precise
5. If several documents address the question, synthesize the information
6. Answer in English
7. Use professional language appropriate for negotiators`
    }

    return `Tu es un assistant IA spécialisé dans les négociations climatiques, la biodiversité et la désertification.
Ton rôle est d'aider les négociateurs en répondant à leurs questions en te basant sur les documents fournis.

Instructions:
1. Base toujours tes réponses sur les documents fournis dans le contexte
2. Si la réponse ne se trouve pas dans les documents, dis-le clairement
3. Fournis des références précises (titre du document, page) quand c'est possible
4. Sois concis et précis
5. Si plusieurs documents traitent de la question, synthétise les informations
6. Réponds en français
7. Utilise un langage professionnel adapté aux négociateurs`
  }

  /**
   * Génère une réponse avec RAG
   * @param {string} question - Question de l'utilisateur
   * @param {Array} conversationHistory - Historique de la conversation
   * @param {object} options - Options (category, language, k)
   * @returns {Promise<{response: string, sources: Array, metadata: object}>}
   */
  const generateResponse = async (question, conversationHistory = [], options = {}) => {
    try {
      isGenerating.value = true
      error.value = null

      const startTime = Date.now()

      const {
        category = null,
        language = 'fr',
        k = 5
      } = options

      // Étape 1: Récupérer les documents pertinents
      const similarDocuments = await searchSimilarDocuments(question, k, category)

      if (similarDocuments.length === 0) {
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

      // Étape 2: Construire le contexte
      const context = buildContext(similarDocuments)

      // Étape 3: Préparer les messages
      const messages = []

      // Message système
      messages.push(new SystemMessage(buildSystemPrompt(language)))

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

      // Étape 4: Générer la réponse avec Claude
      const model = getClaudeModel()
      const response = await model.invoke(messages)

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
          model: USE_OPENROUTER ? OPENROUTER_CHAT_MODEL : 'claude-3-5-sonnet-20241022'
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
