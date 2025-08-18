import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function useNotifications() {
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Récupère les notifications de l'utilisateur connecté
   */
  const getNotifications = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: queryError } = await supabase
        .from('notifications')
        .select(`
          id,
          notification_type,
          title,
          content,
          is_read,
          created_at,
          related_entity_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (queryError) {
        throw queryError
      }

      const notificationsData = data || []

      // Récupérer les détails des connexions pour les notifications de type connection_request
      const connectionNotifications = notificationsData.filter(n => 
        n.notification_type === 'connection_request' && n.related_entity_id
      )

      if (connectionNotifications.length > 0) {
        const connectionIds = connectionNotifications.map(n => n.related_entity_id)
        
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('connections')
          .select(`
            id,
            requester_id,
            status,
            users!connections_requester_id_fkey(
              id,
              first_name,
              last_name,
              profile_photo_thumbnail_url
            )
          `)
          .in('id', connectionIds)

        if (!connectionsError && connectionsData) {
          // Associer les données de connexion aux notifications
          notificationsData.forEach(notification => {
            if (notification.notification_type === 'connection_request') {
              notification.connections = connectionsData.find(
                conn => conn.id === notification.related_entity_id
              )
            }
          })
        }
      }

      notifications.value = notificationsData
    } catch (err) {
      console.error('Erreur lors de la récupération des notifications:', err)
      error.value = err.message
      notifications.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Marque une notification comme lue
   */
  const markAsRead = async (notificationId) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (updateError) {
        throw updateError
      }

      // Mettre à jour localement
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.is_read = true
      }

      return { success: true }
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (updateError) {
        throw updateError
      }

      // Mettre à jour localement
      notifications.value.forEach(notification => {
        notification.is_read = true
      })

      return { success: true }
    } catch (err) {
      console.error('Erreur lors du marquage de toutes comme lues:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Supprime une notification
   */
  const deleteNotification = async (notificationId) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (deleteError) {
        throw deleteError
      }

      // Supprimer localement
      notifications.value = notifications.value.filter(n => n.id !== notificationId)

      return { success: true }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Écoute les nouvelles notifications en temps réel
   */
  const subscribeToNotifications = (userId) => {
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, async (payload) => {
        const newNotification = payload.new
        
        // Si c'est une notification de connexion, récupérer les détails
        if (newNotification.notification_type === 'connection_request' && newNotification.related_entity_id) {
          try {
            const { data: connectionData } = await supabase
              .from('connections')
              .select(`
                id,
                requester_id,
                status,
                users!connections_requester_id_fkey(
                  id,
                  first_name,
                  last_name,
                  profile_photo_thumbnail_url
                )
              `)
              .eq('id', newNotification.related_entity_id)
              .single()
            
            if (connectionData) {
              newNotification.connections = connectionData
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des détails de connexion:', error)
          }
        }
        
        // Ajouter la nouvelle notification en haut de la liste
        notifications.value.unshift(newNotification)
      })
      .subscribe()

    return subscription
  }

  // Computed properties
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.is_read).length
  })

  const connectionRequests = computed(() => {
    return notifications.value.filter(n => n.notification_type === 'connection_request')
  })

  const unreadConnectionRequests = computed(() => {
    return connectionRequests.value.filter(n => !n.is_read)
  })

  return {
    notifications: computed(() => notifications.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    unreadCount,
    connectionRequests,
    unreadConnectionRequests,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    subscribeToNotifications
  }
}