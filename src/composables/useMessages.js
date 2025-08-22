import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function useMessages() {
  const messages = ref([])
  const conversations = ref([])
  const currentConversation = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const sendingMessage = ref(false)

  /**
   * Récupère toutes les conversations de l'utilisateur connecté
   */
  const getConversations = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Récupérer les messages les plus récents de chaque conversation
      const { data, error: queryError } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          is_read,
          created_at,
          sender:sender_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url
          ),
          recipient:recipient_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url
          )
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (queryError) {
        throw queryError
      }

      // Grouper par conversation et garder le message le plus récent
      const conversationMap = new Map()
      
      data?.forEach(message => {
        const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id
        const otherUser = message.sender_id === user.id ? message.recipient : message.sender
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            user: otherUser,
            lastMessage: message,
            unreadCount: 0
          })
        }
        
        // Compter les messages non lus reçus
        if (message.recipient_id === user.id && !message.is_read) {
          conversationMap.get(otherUserId).unreadCount++
        }
      })

      conversations.value = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at))

    } catch (err) {
      console.error('Erreur lors de la récupération des conversations:', err)
      error.value = err.message
      conversations.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère les messages d'une conversation spécifique
   */
  const getMessagesForConversation = async (otherUserId, limit = 50) => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: queryError } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          is_read,
          created_at,
          sender:sender_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url
          ),
          recipient:recipient_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url
          )
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (queryError) {
        throw queryError
      }

      // Inverser l'ordre pour avoir les messages dans l'ordre chronologique
      messages.value = (data || []).reverse()

      // Marquer les messages reçus comme lus
      await markMessagesAsRead(otherUserId)

    } catch (err) {
      console.error('Erreur lors de la récupération des messages:', err)
      error.value = err.message
      messages.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Envoie un nouveau message
   */
  const sendMessage = async (recipientId, content) => {
    if (!content?.trim()) {
      return { success: false, error: 'Le message ne peut pas être vide' }
    }

    sendingMessage.value = true

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Vérifier que l'utilisateur a une connexion acceptée avec le destinataire
      const { data: connectionData, error: connectionError } = await supabase
        .from('connections')
        .select('status')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle()

      if (connectionError) {
        throw connectionError
      }

      if (!connectionData) {
        throw new Error('Vous devez être connecté avec cet utilisateur pour lui envoyer un message')
      }

      // Vérifier que l'utilisateur n'est pas bloqué
      const { data: blockData, error: blockError } = await supabase
        .from('user_blocks')
        .select('id')
        .or(`and(blocker_id.eq.${recipientId},blocked_id.eq.${user.id}),and(blocker_id.eq.${user.id},blocked_id.eq.${recipientId})`)
        .maybeSingle()

      if (blockError) {
        throw blockError
      }

      if (blockData) {
        throw new Error('Impossible d\'envoyer le message. L\'utilisateur vous a bloqué ou vous l\'avez bloqué.')
      }

      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
        })
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          is_read,
          created_at,
          sender:sender_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url
          ),
          recipient:recipient_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url
          )
        `)
        .single()

      if (insertError) {
        throw insertError
      }

      // Ajouter le message à la liste locale si on est dans la bonne conversation
      if (currentConversation.value?.userId === recipientId) {
        messages.value.push(data)
      }

      // Mettre à jour la liste des conversations
      await getConversations()

      return { success: true, message: data }
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err)
      return { success: false, error: err.message }
    } finally {
      sendingMessage.value = false
    }
  }

  /**
   * Marque les messages reçus d'un utilisateur comme lus
   */
  const markMessagesAsRead = async (senderId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return
      }

      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      if (updateError) {
        throw updateError
      }

      // Mettre à jour localement
      messages.value.forEach(message => {
        if (message.sender_id === senderId && message.recipient_id === user.id) {
          message.is_read = true
        }
      })

      // Mettre à jour le compteur dans les conversations
      const conversation = conversations.value.find(conv => conv.userId === senderId)
      if (conversation) {
        conversation.unreadCount = 0
      }

    } catch (err) {
      console.error('Erreur lors du marquage des messages comme lus:', err)
    }
  }

  /**
   * Supprime un message
   */
  const deleteMessage = async (messageId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id) // On ne peut supprimer que ses propres messages

      if (deleteError) {
        throw deleteError
      }

      // Supprimer localement
      messages.value = messages.value.filter(m => m.id !== messageId)

      return { success: true }
    } catch (err) {
      console.error('Erreur lors de la suppression du message:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Recherche dans les messages d'une conversation
   */
  const searchMessagesInConversation = async (otherUserId, searchTerm) => {
    if (!searchTerm?.trim()) {
      return []
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: queryError } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          is_read,
          created_at
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .ilike('content', `%${searchTerm.trim()}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (queryError) {
        throw queryError
      }

      return data || []
    } catch (err) {
      console.error('Erreur lors de la recherche:', err)
      return []
    }
  }

  /**
   * Définit la conversation courante
   */
  const setCurrentConversation = (userId, userInfo) => {
    currentConversation.value = {
      userId,
      user: userInfo
    }
  }

  /**
   * Efface l'historique d'une conversation
   */
  const clearConversationHistory = async (otherUserId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)

      if (deleteError) {
        throw deleteError
      }

      // Vider localement
      if (currentConversation.value?.userId === otherUserId) {
        messages.value = []
      }

      // Mettre à jour les conversations
      await getConversations()

      return { success: true }
    } catch (err) {
      console.error('Erreur lors de l\'effacement de l\'historique:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Obtient ou crée une conversation avec un utilisateur
   */
  const getOrCreateConversation = async (userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      if (userId === user.id) {
        throw new Error('Vous ne pouvez pas créer une conversation avec vous-même')
      }

      // Vérifier d'abord si une conversation existe déjà
      const existingConversation = conversations.value.find(conv => conv.userId === userId)
      
      if (existingConversation) {
        // Conversation trouvée, la définir comme conversation courante
        setCurrentConversation(existingConversation.userId, existingConversation.user)
        return { success: true, conversation: existingConversation }
      }

      // Récupérer les informations de l'utilisateur pour créer la nouvelle conversation
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          profile_photo_url,
          profile_photo_thumbnail_url
        `)
        .eq('id', userId)
        .single()

      if (userError) {
        throw userError
      }

      if (!userData) {
        throw new Error('Utilisateur non trouvé')
      }

      // Créer une nouvelle conversation locale
      const newConversation = {
        userId: userId,
        user: userData,
        lastMessage: {
          content: '',
          created_at: new Date().toISOString(),
          sender_id: null
        },
        unreadCount: 0
      }

      // Ajouter la conversation à la liste locale
      conversations.value.unshift(newConversation)
      
      // Définir comme conversation courante
      setCurrentConversation(newConversation.userId, newConversation.user)

      return { success: true, conversation: newConversation }
    } catch (err) {
      console.error('Erreur lors de la création de la conversation:', err)
      return { success: false, error: err.message }
    }
  }

  // Computed properties
  const totalUnreadMessages = computed(() => {
    return conversations.value.reduce((total, conv) => total + conv.unreadCount, 0)
  })

  const hasUnreadMessages = computed(() => {
    return totalUnreadMessages.value > 0
  })

  return {
    messages: computed(() => messages.value),
    conversations: computed(() => conversations.value),
    currentConversation: computed(() => currentConversation.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    sendingMessage: computed(() => sendingMessage.value),
    totalUnreadMessages,
    hasUnreadMessages,
    getConversations,
    getMessagesForConversation,
    sendMessage,
    markMessagesAsRead,
    deleteMessage,
    searchMessagesInConversation,
    setCurrentConversation,
    clearConversationHistory,
    getOrCreateConversation
  }
}