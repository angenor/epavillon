import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'

const { supabase } = useSupabase()
const { currentUser } = useAuth()

// Channel partagé pour tous les composants
let sharedChannel = null
const listeners = ref(new Map())

export function useCommentBroadcast() {
  // Initialiser le channel si nécessaire
  const initChannel = () => {
    if (!currentUser.value) return

    if (!sharedChannel) {
      const channelName = `activity_comments_read_${currentUser.value.id}`
      console.log('Initialisation du channel partagé:', channelName)

      sharedChannel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true } // Important: recevoir nos propres broadcasts
        }
      })

      sharedChannel
        .on('broadcast', { event: 'comments_marked_read' }, (payload) => {
          console.log('Broadcast reçu dans le channel partagé:', payload)
          // Notifier tous les listeners
          listeners.value.forEach((callback) => {
            callback(payload.payload)
          })
        })
        .subscribe((status) => {
          console.log('Statut du channel partagé:', status)
        })
    }

    return sharedChannel
  }

  // Ajouter un listener
  const addListener = (id, callback) => {
    initChannel()
    listeners.value.set(id, callback)
    console.log('Listener ajouté:', id, 'Total listeners:', listeners.value.size)
  }

  // Retirer un listener
  const removeListener = (id) => {
    listeners.value.delete(id)
    console.log('Listener retiré:', id, 'Total listeners:', listeners.value.size)

    // Si plus de listeners, nettoyer le channel
    if (listeners.value.size === 0 && sharedChannel) {
      console.log('Plus de listeners, nettoyage du channel')
      supabase.removeChannel(sharedChannel)
      sharedChannel = null
    }
  }

  // Envoyer un broadcast
  const sendBroadcast = async (activityId) => {
    const channel = initChannel()
    if (!channel) {
      console.error('Channel non initialisé')
      return
    }

    try {
      await channel.send({
        type: 'broadcast',
        event: 'comments_marked_read',
        payload: { activity_id: activityId }
      })
      console.log('Broadcast envoyé pour l\'activité:', activityId)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du broadcast:', error)
    }
  }

  return {
    addListener,
    removeListener,
    sendBroadcast
  }
}
