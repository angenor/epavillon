import { ref, onUnmounted } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function useRealtimeSubscription() {
  const subscriptions = ref(new Map())
  const isConnected = ref(false)
  const error = ref(null)

  /**
   * Souscrit aux nouveaux messages privés
   */
  const subscribeToMessages = (userId, onNewMessage) => {
    const channelName = `messages-${userId}`
    
    if (subscriptions.value.has(channelName)) {
      return subscriptions.value.get(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, async (payload) => {
        try {
          const newMessage = payload.new
          
          // Récupérer les détails de l'expéditeur
          const { data: senderData, error: senderError } = await supabase
            .from('users')
            .select(`
              id,
              first_name,
              last_name,
              profile_photo_thumbnail_url
            `)
            .eq('id', newMessage.sender_id)
            .single()

          if (!senderError && senderData) {
            newMessage.sender = senderData
          }

          onNewMessage(newMessage)
        } catch (err) {
          console.error('Erreur lors du traitement du nouveau message:', err)
          error.value = err.message
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId}`
      }, (payload) => {
        // Gérer les mises à jour de statut de lecture
        if (payload.new.is_read !== payload.old.is_read) {
          onNewMessage(payload.new, 'read_status_update')
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isConnected.value = true
          error.value = null
        } else if (status === 'CHANNEL_ERROR') {
          isConnected.value = false
          error.value = 'Erreur de connexion temps réel'
        }
      })

    subscriptions.value.set(channelName, channel)
    return channel
  }

  /**
   * Souscrit aux messages de groupe
   */
  const subscribeToGroupMessages = (groupId, onNewGroupMessage) => {
    const channelName = `group-messages-${groupId}`
    
    if (subscriptions.value.has(channelName)) {
      return subscriptions.value.get(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      }, async (payload) => {
        try {
          const newMessage = payload.new
          
          // Récupérer les détails de l'expéditeur
          const { data: senderData, error: senderError } = await supabase
            .from('users')
            .select(`
              id,
              first_name,
              last_name,
              profile_photo_thumbnail_url
            `)
            .eq('id', newMessage.sender_id)
            .single()

          if (!senderError && senderData) {
            newMessage.sender = senderData
          }

          onNewGroupMessage(newMessage)
        } catch (err) {
          console.error('Erreur lors du traitement du nouveau message de groupe:', err)
          error.value = err.message
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isConnected.value = true
          error.value = null
        } else if (status === 'CHANNEL_ERROR') {
          isConnected.value = false
          error.value = 'Erreur de connexion temps réel pour le groupe'
        }
      })

    subscriptions.value.set(channelName, channel)
    return channel
  }

  /**
   * Souscrit aux changements de statut des connexions
   */
  const subscribeToConnections = (userId, onConnectionUpdate) => {
    const channelName = `connections-${userId}`
    
    if (subscriptions.value.has(channelName)) {
      return subscriptions.value.get(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'connections',
        filter: `or(requester_id.eq.${userId},recipient_id.eq.${userId})`
      }, async (payload) => {
        try {
          // Récupérer les détails complets de la connexion
          let connectionData = null
          
          if (payload.eventType !== 'DELETE') {
            const { data, error } = await supabase
              .from('connections')
              .select(`
                id,
                requester_id,
                recipient_id,
                status,
                created_at,
                updated_at,
                requester:requester_id(
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
              .eq('id', payload.new.id)
              .single()

            if (!error) {
              connectionData = data
            }
          }

          onConnectionUpdate({
            eventType: payload.eventType,
            old: payload.old,
            new: payload.new,
            connectionData
          })
        } catch (err) {
          console.error('Erreur lors du traitement de la mise à jour de connexion:', err)
          error.value = err.message
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isConnected.value = true
          error.value = null
        } else if (status === 'CHANNEL_ERROR') {
          isConnected.value = false
          error.value = 'Erreur de connexion temps réel pour les connexions'
        }
      })

    subscriptions.value.set(channelName, channel)
    return channel
  }

  /**
   * Souscrit aux changements de statut des rendez-vous
   */
  const subscribeToAppointments = (userId, onAppointmentUpdate) => {
    const channelName = `appointments-${userId}`
    
    if (subscriptions.value.has(channelName)) {
      return subscriptions.value.get(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `or(requester_id.eq.${userId},recipient_id.eq.${userId})`
      }, async (payload) => {
        try {
          // Récupérer les détails complets du rendez-vous
          let appointmentData = null
          
          if (payload.eventType !== 'DELETE') {
            const { data, error } = await supabase
              .from('appointments')
              .select(`
                id,
                requester_id,
                recipient_id,
                appointment_type,
                scheduled_at,
                status,
                meeting_link,
                notes,
                created_at,
                requester:requester_id(
                  id,
                  first_name,
                  last_name,
                  profile_photo_thumbnail_url,
                  email
                ),
                recipient:recipient_id(
                  id,
                  first_name,
                  last_name,
                  profile_photo_thumbnail_url,
                  email
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (!error) {
              appointmentData = data
            }
          }

          onAppointmentUpdate({
            eventType: payload.eventType,
            old: payload.old,
            new: payload.new,
            appointmentData
          })
        } catch (err) {
          console.error('Erreur lors du traitement de la mise à jour de rendez-vous:', err)
          error.value = err.message
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isConnected.value = true
          error.value = null
        } else if (status === 'CHANNEL_ERROR') {
          isConnected.value = false
          error.value = 'Erreur de connexion temps réel pour les rendez-vous'
        }
      })

    subscriptions.value.set(channelName, channel)
    return channel
  }

  /**
   * Souscrit aux notifications générales
   */
  const subscribeToNotifications = (userId, onNewNotification) => {
    const channelName = `notifications-${userId}`
    
    if (subscriptions.value.has(channelName)) {
      return subscriptions.value.get(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        onNewNotification(payload.new)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isConnected.value = true
          error.value = null
        } else if (status === 'CHANNEL_ERROR') {
          isConnected.value = false
          error.value = 'Erreur de connexion temps réel pour les notifications'
        }
      })

    subscriptions.value.set(channelName, channel)
    return channel
  }

  /**
   * Souscrit aux indicateurs de frappe
   */
  const subscribeToTypingIndicators = (conversationId, onTypingUpdate) => {
    const channelName = `typing-${conversationId}`
    
    if (subscriptions.value.has(channelName)) {
      return subscriptions.value.get(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing' }, (payload) => {
        onTypingUpdate(payload)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isConnected.value = true
          error.value = null
        }
      })

    subscriptions.value.set(channelName, channel)
    return channel
  }

  /**
   * Envoie un indicateur de frappe
   */
  const sendTypingIndicator = (conversationId, userId, isTyping) => {
    const channelName = `typing-${conversationId}`
    const channel = subscriptions.value.get(channelName)
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId,
          isTyping,
          timestamp: Date.now()
        }
      })
    }
  }

  /**
   * Indique le statut en ligne/hors ligne
   */
  const subscribeToPresence = (userId, onPresenceUpdate) => {
    const channelName = `presence-${userId}`
    
    if (subscriptions.value.has(channelName)) {
      return subscriptions.value.get(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        onPresenceUpdate(state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        onPresenceUpdate({ type: 'join', key, presences: newPresences })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        onPresenceUpdate({ type: 'leave', key, presences: leftPresences })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // S'enregistrer comme présent
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString()
          })
        }
      })

    subscriptions.value.set(channelName, channel)
    return channel
  }

  /**
   * Désabonne une souscription spécifique
   */
  const unsubscribe = async (channelName) => {
    if (subscriptions.value.has(channelName)) {
      const channel = subscriptions.value.get(channelName)
      await supabase.removeChannel(channel)
      subscriptions.value.delete(channelName)
    }
  }

  /**
   * Désabonne toutes les souscriptions
   */
  const unsubscribeAll = async () => {
    for (const [channelName, channel] of subscriptions.value) {
      await supabase.removeChannel(channel)
    }
    subscriptions.value.clear()
    isConnected.value = false
  }

  // Nettoyage automatique lors de la destruction du composant
  onUnmounted(() => {
    unsubscribeAll()
  })

  return {
    subscriptions,
    isConnected,
    error,
    subscribeToMessages,
    subscribeToGroupMessages,
    subscribeToConnections,
    subscribeToAppointments,
    subscribeToNotifications,
    subscribeToTypingIndicators,
    subscribeToPresence,
    sendTypingIndicator,
    unsubscribe,
    unsubscribeAll
  }
}