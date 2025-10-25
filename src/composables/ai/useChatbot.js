/**
 * Composable principal pour gérer le chatbot IA
 * Gère les sessions, messages, et interactions avec l'utilisateur
 *
 * IMPORTANT: Utilise un singleton pour partager l'état entre les composants
 * Support des outils Zoom pour les utilisateurs admin/super_admin
 */

import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'
import { useRAG } from './useRAG'
import { generateSessionTitle } from '@/utils/ai/responseFormatter'
import { useZoomToolsChat } from '@/composables/zoom/useZoomToolsChat'

// États globaux partagés (singleton)
const currentSession = ref(null)
const sessions = ref([])
const messages = ref([])
const isLoading = ref(false)
const isSending = ref(false)
const error = ref(null)

export function useChatbot() {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { generateFormattedResponse, generateSessionTitle: generateAITitle } = useRAG()
  const { availableTools: zoomTools } = useZoomToolsChat()

  /**
   * Crée une nouvelle session de chat
   * @param {object} options - Options (title, category)
   * @returns {Promise<object>}
   */
  const createSession = async (options = {}) => {
    try {
      isLoading.value = true
      error.value = null

      if (!user.value) {
        throw new Error('User not authenticated')
      }

      const sessionData = {
        user_id: user.value.id,
        title: options.title || 'Nouvelle conversation',
        feature_type: 'negotiation_documents',
        category: options.category || null,
        is_active: true
      }

      const { data, error: insertError } = await supabase
        .from('ai_chat_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (insertError) throw insertError

      currentSession.value = data
      messages.value = []

      return data
    } catch (err) {
      console.error('Error creating session:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Charge une session existante
   * @param {string} sessionId - ID de la session
   * @returns {Promise<object>}
   */
  const loadSession = async (sessionId) => {
    try {
      isLoading.value = true
      error.value = null

      // Charger la session
      const { data: sessionData, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      currentSession.value = sessionData

      // Charger les messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      messages.value = messagesData || []

      return sessionData
    } catch (err) {
      console.error('Error loading session:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Charge toutes les sessions de l'utilisateur
   * @returns {Promise<Array>}
   */
  const loadUserSessions = async () => {
    try {
      isLoading.value = true
      error.value = null

      if (!user.value) {
        return []
      }

      const { data, error: fetchError } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('user_id', user.value.id)
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError

      sessions.value = data || []
      return sessions.value
    } catch (err) {
      console.error('Error loading user sessions:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Envoie un message et obtient une réponse
   * @param {string} message - Message de l'utilisateur
   * @param {object} options - Options (category, language)
   * @returns {Promise<object>}
   */
  const sendMessage = async (message, options = {}) => {
    try {
      isSending.value = true
      error.value = null

      if (!currentSession.value) {
        throw new Error('No active session')
      }

      if (!message || message.trim().length === 0) {
        throw new Error('Message cannot be empty')
      }

      // Sauvegarder le message utilisateur
      const userMessageData = {
        session_id: currentSession.value.id,
        role: 'user',
        content: message.trim()
      }

      const { data: userMessage, error: userMessageError } = await supabase
        .from('ai_chat_messages')
        .insert(userMessageData)
        .select()
        .single()

      if (userMessageError) throw userMessageError

      messages.value.push(userMessage)

      // Si c'est le premier message, générer un titre pour la session
      if (messages.value.filter(m => m.role === 'user').length === 1) {
        const title = await generateAITitle(message, options.language || 'fr')

        await supabase
          .from('ai_chat_sessions')
          .update({ title })
          .eq('id', currentSession.value.id)

        currentSession.value.title = title
      }

      // Générer la réponse avec RAG (avec outils Zoom si disponibles)
      const conversationHistory = messages.value.map(m => ({
        role: m.role,
        content: m.content
      }))

      const ragResponse = await generateFormattedResponse(
        message,
        conversationHistory.slice(0, -1), // Exclure le message actuel
        {
          category: options.category || currentSession.value.category,
          language: options.language || 'fr',
          tools: zoomTools.value || [] // Passer les outils Zoom disponibles
        }
      )

      // Sauvegarder la réponse de l'assistant
      const assistantMessageData = {
        session_id: currentSession.value.id,
        role: 'assistant',
        content: ragResponse.content,
        source_documents: ragResponse.references || [],
        metadata: {
          ...ragResponse.metadata,
          referencesCount: ragResponse.referencesCount,
          hasReferences: ragResponse.hasReferences
        }
      }

      const { data: assistantMessage, error: assistantMessageError } = await supabase
        .from('ai_chat_messages')
        .insert(assistantMessageData)
        .select()
        .single()

      if (assistantMessageError) throw assistantMessageError

      messages.value.push(assistantMessage)

      // Mettre à jour le timestamp de la session
      await supabase
        .from('ai_chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSession.value.id)

      return {
        userMessage,
        assistantMessage,
        response: ragResponse
      }
    } catch (err) {
      console.error('Error sending message:', err)
      error.value = err.message
      throw err
    } finally {
      isSending.value = false
    }
  }

  /**
   * Supprime une session
   * @param {string} sessionId - ID de la session
   * @returns {Promise<boolean>}
   */
  const deleteSession = async (sessionId) => {
    try {
      isLoading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('ai_chat_sessions')
        .delete()
        .eq('id', sessionId)

      if (deleteError) throw deleteError

      // Supprimer de la liste locale
      sessions.value = sessions.value.filter(s => s.id !== sessionId)

      // Si c'est la session active, la désélectionner
      if (currentSession.value?.id === sessionId) {
        currentSession.value = null
        messages.value = []
      }

      return true
    } catch (err) {
      console.error('Error deleting session:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Met à jour le titre d'une session
   * @param {string} sessionId - ID de la session
   * @param {string} title - Nouveau titre
   * @returns {Promise<boolean>}
   */
  const updateSessionTitle = async (sessionId, title) => {
    try {
      const { error: updateError } = await supabase
        .from('ai_chat_sessions')
        .update({ title })
        .eq('id', sessionId)

      if (updateError) throw updateError

      // Mettre à jour localement
      if (currentSession.value?.id === sessionId) {
        currentSession.value.title = title
      }

      const sessionIndex = sessions.value.findIndex(s => s.id === sessionId)
      if (sessionIndex !== -1) {
        sessions.value[sessionIndex].title = title
      }

      return true
    } catch (err) {
      console.error('Error updating session title:', err)
      return false
    }
  }

  /**
   * Ajoute un feedback sur un message
   * @param {string} messageId - ID du message
   * @param {string} feedbackType - Type de feedback ('positive' ou 'negative')
   * @param {string} comment - Commentaire optionnel
   * @returns {Promise<boolean>}
   */
  const addFeedback = async (messageId, feedbackType, comment = null) => {
    try {
      if (!user.value) {
        throw new Error('User not authenticated')
      }

      const feedbackData = {
        message_id: messageId,
        user_id: user.value.id,
        feedback_type: feedbackType,
        comment: comment
      }

      const { error: insertError } = await supabase
        .from('ai_chat_feedback')
        .upsert(feedbackData, {
          onConflict: 'message_id,user_id'
        })

      if (insertError) throw insertError

      return true
    } catch (err) {
      console.error('Error adding feedback:', err)
      return false
    }
  }

  /**
   * Obtient les statistiques d'une session
   * @param {string} sessionId - ID de la session
   * @returns {Promise<object>}
   */
  const getSessionStats = async (sessionId) => {
    try {
      const { data, error: rpcError } = await supabase
        .rpc('get_chat_session_stats', { p_session_id: sessionId })

      if (rpcError) throw rpcError

      return data || {}
    } catch (err) {
      console.error('Error fetching session stats:', err)
      return {}
    }
  }

  /**
   * Réinitialise la session actuelle
   */
  const resetCurrentSession = () => {
    currentSession.value = null
    messages.value = []
  }

  // Computed properties
  const hasActiveSession = computed(() => currentSession.value !== null)
  const messageCount = computed(() => messages.value.length)
  const userMessageCount = computed(() => messages.value.filter(m => m.role === 'user').length)
  const assistantMessageCount = computed(() => messages.value.filter(m => m.role === 'assistant').length)

  return {
    // État
    currentSession,
    sessions,
    messages,
    isLoading,
    isSending,
    error,

    // Computed
    hasActiveSession,
    messageCount,
    userMessageCount,
    assistantMessageCount,

    // Méthodes
    createSession,
    loadSession,
    loadUserSessions,
    sendMessage,
    deleteSession,
    updateSessionTitle,
    addFeedback,
    getSessionStats,
    resetCurrentSession
  }
}
