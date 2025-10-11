<template>
  <Transition name="slide-fade">
    <div
      v-if="notifications.length > 0"
      class="fixed top-20 right-6 z-50 space-y-3 max-w-sm"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        @click="handleNotificationClick(notification)"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-l-4 border-purple-500 p-4 cursor-pointer hover:shadow-xl transition-all duration-300 animate-slide-in"
      >
        <div class="flex items-start space-x-3">
          <!-- Icône -->
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
          </div>

          <!-- Contenu -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              Nouveau commentaire
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {{ notification.author_name }} a commenté l'activité
            </p>
            <p class="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2 font-medium">
              {{ notification.activity_title }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-2 italic line-clamp-1">
              "{{ notification.comment_text }}"
            </p>
          </div>

          <!-- Bouton fermer -->
          <button
            @click.stop="dismissNotification(notification.id)"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { supabase } = useSupabase()
const { currentUser } = useAuth()

const notifications = ref([])
let realtimeSubscription = null

// Ajouter une notification
const addNotification = (notification) => {
  const id = Date.now()
  notifications.value.push({
    id,
    ...notification
  })

  // Auto-dismiss après 10 secondes
  setTimeout(() => {
    dismissNotification(id)
  }, 10000)
}

// Retirer une notification
const dismissNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

// Gérer le clic sur une notification
const handleNotificationClick = (notification) => {
  // Naviguer vers l'activité
  router.push(`/admin/activities/${notification.activity_id}`)
  // Retirer la notification
  dismissNotification(notification.id)
}

// Subscription realtime pour les nouveaux commentaires
const subscribeToComments = () => {
  if (!currentUser.value) {
    console.log('CommentNotificationPopup - Pas d\'utilisateur connecté')
    return
  }

  console.log('CommentNotificationPopup - Subscription activée pour:', currentUser.value.id)

  realtimeSubscription = supabase
    .channel('comment-notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'revision_comments'
    }, async (payload) => {
      console.log('CommentNotificationPopup - Nouveau commentaire détecté:', payload.new)

      // Vérifier si l'utilisateur est destinataire
      const isRecipient = payload.new.shared_with_revisionists?.includes(currentUser.value.id)
      const isMyComment = payload.new.created_by === currentUser.value.id

      console.log('CommentNotificationPopup - isRecipient:', isRecipient)
      console.log('CommentNotificationPopup - isMyComment:', isMyComment)

      // Ne pas afficher de notification pour ses propres commentaires
      if (isMyComment) {
        console.log('CommentNotificationPopup - C\'est mon propre commentaire, pas de notification')
        return
      }

      // Afficher la notification si l'utilisateur est destinataire
      if (isRecipient) {
        console.log('CommentNotificationPopup - Chargement des détails pour la notification')

        // Charger les détails de l'activité et de l'auteur
        const { data: activityData } = await supabase
          .from('activities')
          .select('title')
          .eq('id', payload.new.activity_id)
          .single()

        const { data: authorData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', payload.new.created_by)
          .single()

        console.log('CommentNotificationPopup - Activité:', activityData)
        console.log('CommentNotificationPopup - Auteur:', authorData)

        addNotification({
          activity_id: payload.new.activity_id,
          activity_title: activityData?.title || 'Activité',
          author_name: authorData ? `${authorData.first_name} ${authorData.last_name}` : 'Un révisionniste',
          comment_text: payload.new.comment_text
        })

        console.log('CommentNotificationPopup - Notification ajoutée, total:', notifications.value.length)

        // Jouer un son de notification
        playNotificationSound()
      } else {
        console.log('CommentNotificationPopup - Je ne suis pas destinataire, pas de notification')
      }
    })
    .subscribe()
}

// Jouer un son de notification
const playNotificationSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZJQ==')
    audio.volume = 0.3
    audio.play().catch(() => {
      // Ignorer les erreurs de lecture (peut arriver si l'utilisateur n'a pas interagi avec la page)
    })
  } catch (error) {
    // Ignorer les erreurs
  }
}

onMounted(() => {
  subscribeToComments()
})

onBeforeUnmount(() => {
  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription)
  }
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes slide-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
