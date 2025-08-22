import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMessages } from '@/composables/useMessages'
import { useGroups } from '@/composables/useGroups'
import { useAppointments } from '@/composables/useAppointments'
import { useRealtimeSubscription } from '@/composables/useRealtimeSubscription'
import { useToast } from '@/composables/useToast'

export const useMessagingStore = defineStore('messaging', () => {
  // État global de la messagerie
  const isMessagingOpen = ref(false)
  const isMinimized = ref(false)
  const currentView = ref('conversations') // 'conversations', 'chat', 'groups', 'appointments'
  const currentConversationId = ref(null)
  const currentGroupId = ref(null)
  const unreadMessagesCount = ref(0)
  
  // État des indicateurs de frappe
  const typingUsers = ref(new Map()) // Map<conversationId, Set<userId>>
  const typingTimeouts = ref(new Map()) // Map<userId, timeoutId>
  
  // État de présence des utilisateurs
  const onlineUsers = ref(new Set())
  
  // Services
  const messagesService = useMessages()
  const groupsService = useGroups()
  const appointmentsService = useAppointments()
  const realtimeService = useRealtimeSubscription()
  const { showToast } = useToast()

  // Getters
  const hasUnreadMessages = computed(() => unreadMessagesCount.value > 0)
  
  const totalUnreadCount = computed(() => {
    return messagesService.totalUnreadMessages.value + unreadMessagesCount.value
  })

  const isUserTyping = computed(() => {
    return (conversationId, userId) => {
      const typingSet = typingUsers.value.get(conversationId)
      return typingSet ? typingSet.has(userId) : false
    }
  })

  const isUserOnline = computed(() => {
    return (userId) => onlineUsers.value.has(userId)
  })

  // Actions pour l'interface
  const openMessaging = () => {
    isMessagingOpen.value = true
    isMinimized.value = false
  }

  const closeMessaging = () => {
    isMessagingOpen.value = false
    isMinimized.value = false
    currentView.value = 'conversations'
    currentConversationId.value = null
    currentGroupId.value = null
  }

  const minimizeMessaging = () => {
    isMinimized.value = true
  }

  const maximizeMessaging = () => {
    isMinimized.value = false
  }

  const setCurrentView = (view) => {
    currentView.value = view
    if (view !== 'chat') {
      currentConversationId.value = null
    }
    if (view !== 'groups') {
      currentGroupId.value = null
    }
  }

  const openConversation = async (userId, userInfo) => {
    currentView.value = 'chat'
    currentConversationId.value = userId
    messagesService.setCurrentConversation(userId, userInfo)
    
    // Charger les messages de la conversation
    await messagesService.getMessagesForConversation(userId)
    
    // Mettre à jour le nombre de messages non lus
    await updateUnreadCount()
  }

  const openGroup = async (groupId, groupInfo) => {
    currentView.value = 'groups'
    currentGroupId.value = groupId
    groupsService.setCurrentGroup(groupInfo)
    
    // Charger les messages du groupe
    await groupsService.getGroupMessages(groupId)
  }

  // Actions pour les messages
  const sendMessage = async (recipientId, content) => {
    const result = await messagesService.sendMessage(recipientId, content)
    
    if (result.success) {
      await updateUnreadCount()
      return result
    } else {
      console.error('Erreur lors de l\'envoi du message:', result.error)
      return result
    }
  }

  const sendGroupMessage = async (groupId, content) => {
    const result = await groupsService.sendGroupMessage(groupId, content)
    
    if (result.success) {
      return result
    } else {
      showToast(result.error, 'error')
      return result
    }
  }

  // Actions pour les indicateurs de frappe
  const setTypingIndicator = (conversationId, userId, isTyping) => {
    if (!typingUsers.value.has(conversationId)) {
      typingUsers.value.set(conversationId, new Set())
    }
    
    const typingSet = typingUsers.value.get(conversationId)
    
    if (isTyping) {
      typingSet.add(userId)
      
      // Effacer l'indicateur après 3 secondes d'inactivité
      if (typingTimeouts.value.has(userId)) {
        clearTimeout(typingTimeouts.value.get(userId))
      }
      
      const timeoutId = setTimeout(() => {
        typingSet.delete(userId)
        typingTimeouts.value.delete(userId)
        realtimeService.sendTypingIndicator(conversationId, userId, false)
      }, 3000)
      
      typingTimeouts.value.set(userId, timeoutId)
    } else {
      typingSet.delete(userId)
      if (typingTimeouts.value.has(userId)) {
        clearTimeout(typingTimeouts.value.get(userId))
        typingTimeouts.value.delete(userId)
      }
    }
    
    // Notifier via le service temps réel
    realtimeService.sendTypingIndicator(conversationId, userId, isTyping)
  }

  // Gestion de la présence
  const setUserOnline = (userId) => {
    onlineUsers.value.add(userId)
  }

  const setUserOffline = (userId) => {
    onlineUsers.value.delete(userId)
  }

  // Mise à jour du compteur de messages non lus
  const updateUnreadCount = async () => {
    await messagesService.getConversations()
    unreadMessagesCount.value = messagesService.totalUnreadMessages.value
  }

  // Initialisation des souscriptions temps réel
  const initializeRealtimeSubscriptions = (userId) => {
    // Souscription aux nouveaux messages
    realtimeService.subscribeToMessages(userId, (message, type) => {
      if (type === 'read_status_update') {
        // Gérer les mises à jour de statut de lecture
        return
      }
      
      // Nouveau message reçu
      if (currentConversationId.value === message.sender_id) {
        // Si on est dans la conversation, ajouter le message
        messagesService.messages.value.push(message)
        // Marquer comme lu immédiatement
        messagesService.markMessagesAsRead(message.sender_id)
      } else {
        // Sinon, afficher une notification
        showToast(`Nouveau message de ${message.sender?.first_name} ${message.sender?.last_name}`, 'info')
        updateUnreadCount()
      }
    })

    // Souscription aux indicateurs de frappe
    realtimeService.subscribeToTypingIndicators('global', (payload) => {
      const { userId: typingUserId, isTyping, conversationId } = payload
      if (typingUserId !== userId) { // Ne pas afficher notre propre indicateur
        setTypingIndicator(conversationId, typingUserId, isTyping)
      }
    })

    // Souscription à la présence
    realtimeService.subscribeToPresence(userId, (presenceData) => {
      if (presenceData.type === 'join') {
        presenceData.presences.forEach(presence => {
          if (presence.user_id !== userId) {
            setUserOnline(presence.user_id)
          }
        })
      } else if (presenceData.type === 'leave') {
        presenceData.presences.forEach(presence => {
          setUserOffline(presence.user_id)
        })
      } else {
        // Sync complet
        onlineUsers.value.clear()
        Object.values(presenceData).forEach(presences => {
          presences.forEach(presence => {
            if (presence.user_id !== userId) {
              setUserOnline(presence.user_id)
            }
          })
        })
      }
    })

    // Souscription aux connexions
    realtimeService.subscribeToConnections(userId, (update) => {
      if (update.eventType === 'UPDATE' && update.new.status === 'accepted') {
        showToast('Nouvelle connexion acceptée !', 'success')
        messagesService.getConversations() // Mettre à jour les conversations
      }
    })

    // Souscription aux rendez-vous
    realtimeService.subscribeToAppointments(userId, (update) => {
      if (update.eventType === 'INSERT') {
        showToast('Nouveau rendez-vous proposé !', 'info')
      } else if (update.eventType === 'UPDATE') {
        if (update.new.status === 'confirmed') {
          showToast('Rendez-vous confirmé !', 'success')
        } else if (update.new.status === 'cancelled') {
          showToast('Rendez-vous annulé', 'warning')
        }
      }
      appointmentsService.getUserAppointments() // Mettre à jour les rendez-vous
    })
  }

  // Nettoyage des souscriptions
  const cleanup = async () => {
    await realtimeService.unsubscribeAll()
    typingUsers.value.clear()
    typingTimeouts.value.clear()
    onlineUsers.value.clear()
  }

  // Chargement initial des données
  const loadInitialData = async () => {
    try {
      await Promise.all([
        messagesService.getConversations(),
        groupsService.getUserGroups(),
        appointmentsService.getUserAppointments()
      ])
      await updateUnreadCount()
    } catch (error) {
      console.error('Erreur lors du chargement des données de messagerie:', error)
      showToast('Erreur lors du chargement des données de messagerie', 'error')
    }
  }

  return {
    // État
    isMessagingOpen,
    isMinimized,
    currentView,
    currentConversationId,
    currentGroupId,
    unreadMessagesCount,
    typingUsers,
    onlineUsers,
    
    // Getters
    hasUnreadMessages,
    totalUnreadCount,
    isUserTyping,
    isUserOnline,
    
    // Services
    messagesService,
    groupsService,
    appointmentsService,
    realtimeService,
    
    // Actions UI
    openMessaging,
    closeMessaging,
    minimizeMessaging,
    maximizeMessaging,
    setCurrentView,
    openConversation,
    openGroup,
    
    // Actions messagerie
    sendMessage,
    sendGroupMessage,
    setTypingIndicator,
    setUserOnline,
    setUserOffline,
    updateUnreadCount,
    
    // Lifecycle
    initializeRealtimeSubscriptions,
    loadInitialData,
    cleanup
  }
})