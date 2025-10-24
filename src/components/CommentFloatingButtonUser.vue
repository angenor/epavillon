<template>
  <div>
    <!-- Bouton flottant -->
    <button
      v-if="!isOpen"
      @click="toggleWidget"
      class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 cursor-pointer group animate-pulse-subtle"
      title="Commentaires de révision"
    >
      <div class="relative">
        <svg
          class="w-7 h-7 group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <!-- Badge pour le nombre de commentaires non lus -->
        <span
          v-if="unreadCommentsCount > 0"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center font-bold shadow-lg border-2 border-white"
        >
          {{ unreadCommentsCount > 99 ? '99+' : unreadCommentsCount }}
        </span>
      </div>
    </button>

    <!-- Widget de commentaires -->
    <div
      v-if="isOpen"
      class="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-300 transform origin-bottom-right flex flex-col"
      :class="isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h3 class="text-white font-semibold flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          Commentaires de révision
        </h3>
        <button
          @click="toggleWidget"
          class="text-white hover:bg-white/20 rounded-lg p-1 transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Messages area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="messagesContainer">
        <!-- Notification de nouveau message -->
        <div
          v-if="hasNewMessageNotification"
          @click="scrollToBottomAndDismissNotification"
          class="sticky top-0 z-10 mx-auto w-fit bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-all animate-slide-down flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd"/>
          </svg>
          <span class="text-sm font-medium">Nouveau message</span>
        </div>

        <!-- Loading state -->
        <div v-if="isLoadingComments" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>

        <!-- No comments state -->
        <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p class="text-sm">Aucun commentaire pour le moment</p>
          <p class="text-xs mt-1">Les révisionnistes peuvent laisser des commentaires sur votre activité</p>
        </div>

        <!-- Comments list -->
        <div v-else class="space-y-3">
          <template v-for="(comment, index) in comments" :key="comment.id">
            <!-- Ligne "Nouveaux messages" -->
            <div
              v-if="index === firstNewMessageIndex && firstNewMessageIndex >= 0"
              data-new-messages-line
              class="w-full flex items-center my-4"
            >
              <div class="flex-1 h-px bg-gradient-to-r from-transparent via-green-400 to-green-400 dark:via-green-500 dark:to-green-500"></div>
              <span class="px-3 text-xs font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                Nouveaux messages
              </span>
              <div class="flex-1 h-px bg-gradient-to-l from-transparent via-green-400 to-green-400 dark:via-green-500 dark:to-green-500"></div>
            </div>

            <!-- Message -->
            <div
              class="flex flex-col"
              :class="comment.created_by === currentUser?.id ? 'items-end' : 'items-start'"
            >
              <div
                class="max-w-[85%] rounded-2xl px-4 py-2 relative group"
                :class="
                  comment.created_by === currentUser?.id
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                "
              >
                <!-- Author info for other users -->
                <div v-if="comment.created_by !== currentUser?.id" class="text-xs opacity-75 mb-1 font-medium">
                  {{ comment.author_name || 'Révisionniste' }}
                </div>

                <!-- Comment text -->
                <p class="text-sm break-words whitespace-pre-wrap">{{ comment.comment_text }}</p>

                <!-- Timestamp -->
                <div class="flex items-center justify-between mt-2 text-xs opacity-75">
                  <span>{{ formatTime(comment.created_at) }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Input area -->
      <div class="border-t dark:border-gray-700 p-4 flex-shrink-0">
        <div class="mb-2 text-xs text-gray-600 dark:text-gray-400 flex items-center">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span>Vos commentaires seront visibles par tous les révisionnistes</span>
        </div>

        <!-- Input and send button -->
        <div class="flex space-x-2">
          <textarea
            v-model="newComment"
            @keydown.enter.prevent="sendComment"
            placeholder="Écrivez votre commentaire..."
            rows="2"
            :disabled="isSending"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          ></textarea>
          <button
            @click="sendComment"
            :disabled="!newComment.trim() || isSending"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg v-if="isSending" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="mt-2 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-xs">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  activityId: {
    type: String,
    required: true
  },
  // ID du soumissionnaire de l'activité (pour vérifier les permissions)
  submitterId: {
    type: String,
    required: true
  }
})

const { supabase } = useSupabase()
const { currentUser } = useAuth()
const { markRevisionCommentNotificationsAsRead } = useNotifications()

const isOpen = ref(false)
const comments = ref([])
const newComment = ref('')
const isLoadingComments = ref(false)
const isSending = ref(false)
const errorMessage = ref('')
const unreadCommentsCount = ref(0)
const messagesContainer = ref(null)
const hasNewMessageNotification = ref(false)
const firstNewMessageIndex = ref(-1)
const lastViewTimestamp = ref(null)

// Vérifier si l'utilisateur actuel est le propriétaire de l'activité
const isOwner = ref(false)

const toggleWidget = async () => {
  const wasOpen = isOpen.value
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    // Ouverture du widget
    const storageKey = `last_comment_view_${props.activityId}_${currentUser.value?.id}`
    const savedTimestamp = localStorage.getItem(storageKey)
    lastViewTimestamp.value = savedTimestamp ? new Date(savedTimestamp) : null

    await loadComments()

    hasNewMessageNotification.value = false

    // Marquer les notifications comme lues
    await markRevisionCommentNotificationsAsRead(props.activityId)

    // Sauvegarder le timestamp après 3 secondes
    setTimeout(async () => {
      if (isOpen.value) {
        const now = new Date().toISOString()
        localStorage.setItem(storageKey, now)
        await markActivityCommentsAsRead()
        unreadCommentsCount.value = 0
      }
    }, 3000)
  } else if (wasOpen) {
    // Fermeture du widget
    const storageKey = `last_comment_view_${props.activityId}_${currentUser.value?.id}`
    const now = new Date().toISOString()
    localStorage.setItem(storageKey, now)

    await markActivityCommentsAsRead()
    unreadCommentsCount.value = 0
  }
}

// Marquer les commentaires comme lus
const markActivityCommentsAsRead = async () => {
  try {
    // Pour les soumissionnaires, on marque comme lu côté client (localStorage suffit)
    // Les notifications sont gérées par le système de notifications général
    await loadUnreadCommentsCount()
  } catch (error) {
    console.error('Erreur lors du marquage des commentaires comme lus:', error)
  }
}

// Charger le nombre de commentaires non lus
const loadUnreadCommentsCount = async () => {
  if (!currentUser.value || !isOwner.value) return

  try {
    // Récupérer le timestamp de la dernière vue
    const storageKey = `last_comment_view_${props.activityId}_${currentUser.value.id}`
    const lastView = localStorage.getItem(storageKey)

    if (!lastView) {
      // Si pas de dernière vue enregistrée, on considère que tous les commentaires sont non lus
      const { count, error } = await supabase
        .from('revision_comments')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', props.activityId)
        .eq('shared_with_submitter', true)
        .neq('created_by', currentUser.value.id)

      if (error) throw error
      unreadCommentsCount.value = count || 0
    } else {
      // Compter les commentaires créés après la dernière vue
      const { count, error } = await supabase
        .from('revision_comments')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', props.activityId)
        .eq('shared_with_submitter', true)
        .neq('created_by', currentUser.value.id)
        .gt('created_at', lastView)

      if (error) throw error
      unreadCommentsCount.value = count || 0
    }
  } catch (error) {
    console.error('Erreur lors du chargement du nombre de commentaires non lus:', error)
    unreadCommentsCount.value = 0
  }
}

const loadComments = async (shouldScroll = true) => {
  if (!currentUser.value || !isOwner.value) return

  let savedScrollPosition = 0
  if (!shouldScroll && messagesContainer.value) {
    savedScrollPosition = messagesContainer.value.scrollTop
  }

  isLoadingComments.value = true
  try {
    const { data, error } = await supabase
      .from('revision_comments')
      .select(`
        *,
        author:users!created_by(id, first_name, last_name)
      `)
      .eq('activity_id', props.activityId)
      .or(`created_by.eq.${currentUser.value.id},shared_with_submitter.eq.true`)
      .order('created_at', { ascending: true })

    if (error) throw error

    comments.value = data?.map(c => ({
      ...c,
      author_name: c.author ? `${c.author.first_name} ${c.author.last_name}` : 'Inconnu'
    })) || []

    // Déterminer l'index du premier NOUVEAU message
    if (lastViewTimestamp.value) {
      firstNewMessageIndex.value = comments.value.findIndex(c => {
        const commentDate = new Date(c.created_at)
        return commentDate > lastViewTimestamp.value
      })
    } else {
      firstNewMessageIndex.value = -1
    }

    // Scroller
    if (shouldScroll) {
      await nextTick()
      setTimeout(() => {
        if (firstNewMessageIndex.value >= 0) {
          scrollToNewMessages()
        } else {
          scrollToBottom()
        }
      }, 100)
    } else {
      await nextTick()
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = savedScrollPosition
        }
      }, 50)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires:', error)
  } finally {
    isLoadingComments.value = false
  }
}

const sendComment = async () => {
  if (!newComment.value.trim() || !currentUser.value || !isOwner.value) return

  isSending.value = true
  errorMessage.value = ''

  try {
    // Récupérer tous les révisionnistes et admins pour partager le commentaire
    const { data: revisionistesData, error: revError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['revisionniste', 'admin', 'super_admin'])
      .eq('is_active', true)

    if (revError) throw revError

    const revisionistIds = revisionistesData?.map(r => r.user_id) || []

    const commentData = {
      activity_id: props.activityId,
      created_by: currentUser.value.id,
      comment_text: newComment.value.trim(),
      shared_with_submitter: false, // Le soumissionnaire voit déjà ses propres commentaires
      shared_with_revisionists: revisionistIds // Partager avec tous les révisionnistes et admins
    }

    const { error } = await supabase
      .from('revision_comments')
      .insert([commentData])

    if (error) throw error

    // Ajouter localement pour feedback immédiat
    comments.value.push({
      ...commentData,
      id: Date.now(),
      created_at: new Date().toISOString(),
      author_name: `${currentUser.value.first_name} ${currentUser.value.last_name}`
    })

    newComment.value = ''

    // Scroll to bottom
    await nextTick()
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  } catch (error) {
    console.error('Erreur lors de l\'envoi du commentaire:', error)
    errorMessage.value = error.message || 'Erreur lors de l\'envoi'
  } finally {
    isSending.value = false
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const scrollToNewMessages = () => {
  if (!messagesContainer.value) return

  const newMessagesLine = messagesContainer.value.querySelector('[data-new-messages-line]')

  if (newMessagesLine) {
    const offsetTop = newMessagesLine.offsetTop - 100
    messagesContainer.value.scrollTop = offsetTop
  } else {
    scrollToBottom()
  }
}

const scrollToBottomAndDismissNotification = async () => {
  hasNewMessageNotification.value = false
  await nextTick()
  setTimeout(() => {
    scrollToBottom()
  }, 100)
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes}min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

// Subscription pour les mises à jour en temps réel
let subscription = null

const subscribeToComments = () => {
  if (!currentUser.value || !isOwner.value) return

  subscription = supabase
    .channel(`comments-${props.activityId}-user`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'revision_comments',
      filter: `activity_id=eq.${props.activityId}`
    }, async (payload) => {
      const isMyComment = payload.new.created_by === currentUser.value.id
      const isSharedWithMe = payload.new.shared_with_submitter === true

      // Si c'est mon propre commentaire, recharger pour avoir le vrai ID
      if (isMyComment) {
        if (isOpen.value) {
          await loadComments(false)
        }
        return
      }

      // Si le commentaire m'est destiné
      if (isSharedWithMe) {
        await loadUnreadCommentsCount()

        if (isOpen.value) {
          hasNewMessageNotification.value = true
          await loadComments(false)

          setTimeout(() => {
            hasNewMessageNotification.value = false
          }, 5000)
        }
      }
    })
    .subscribe()
}

// Vérifier si l'utilisateur est le propriétaire
const checkOwnership = () => {
  if (!currentUser.value) {
    isOwner.value = false
    return
  }

  isOwner.value = currentUser.value.id === props.submitterId
}

onMounted(async () => {
  checkOwnership()

  if (isOwner.value) {
    await loadUnreadCommentsCount()
    subscribeToComments()

    // Marquer les notifications comme lues dès l'arrivée sur la page
    await markRevisionCommentNotificationsAsRead(props.activityId)
  }
})

// Watcher pour l'activité
watch(() => props.activityId, async (newId, oldId) => {
  if (newId !== oldId) {
    // Cleanup
    if (subscription) {
      supabase.removeChannel(subscription)
      subscription = null
    }

    // Reset
    comments.value = []
    unreadCommentsCount.value = 0
    firstNewMessageIndex.value = -1
    lastViewTimestamp.value = null
    checkOwnership()

    // Reload
    if (isOwner.value) {
      await loadUnreadCommentsCount()
      await markRevisionCommentNotificationsAsRead(newId)

      if (isOpen.value) {
        loadComments()
      }

      subscribeToComments()
    }
  }
})

// Watcher pour le soumissionnaire
watch(() => props.submitterId, () => {
  checkOwnership()
})

onBeforeUnmount(() => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
})
</script>

<style scoped>
@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}

@keyframes slide-down {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}
</style>
