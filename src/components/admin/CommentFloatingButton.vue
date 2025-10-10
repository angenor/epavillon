<template>
  <div>
    <!-- Bouton flottant -->
    <button
      v-if="!isOpen"
      @click="toggleWidget"
      class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 cursor-pointer group animate-pulse-subtle"
      title="Commenter cette activité"
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
        <!-- Badge pour les nouveaux commentaires -->
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
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
      <div class="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
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
        <!-- Loading state -->
        <div v-if="isLoadingComments" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>

        <!-- No comments state -->
        <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p class="text-sm">Aucun commentaire pour le moment</p>
          <p class="text-xs mt-1">Soyez le premier à commenter!</p>
        </div>

        <!-- Comments list -->
        <div v-else class="space-y-3">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="flex"
            :class="comment.created_by === currentUser?.id ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[75%] rounded-2xl px-4 py-2"
              :class="
                comment.created_by === currentUser?.id
                  ? 'bg-purple-500 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              "
            >
              <!-- Author info for other users -->
              <div v-if="comment.created_by !== currentUser?.id" class="text-xs opacity-75 mb-1">
                {{ comment.author_name || 'Révisionniste' }}
              </div>

              <!-- Comment text -->
              <p class="text-sm break-words">{{ comment.comment_text }}</p>

              <!-- Timestamp and sharing info -->
              <div class="flex items-center justify-between mt-1 text-xs opacity-75">
                <span>{{ formatTime(comment.created_at) }}</span>
                <div v-if="comment.created_by === currentUser?.id" class="ml-2">
                  <span v-if="comment.shared_with_submitter" title="Partagé avec le soumissionnaire">👤</span>
                  <span v-if="comment.shared_with_revisionists?.length" :title="`Partagé avec ${comment.shared_with_revisionists.length} révisionniste(s)`">👥</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="border-t dark:border-gray-700 p-4 flex-shrink-0">
        <!-- Sharing options -->
        <div class="mb-3 space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 block">
            Partager avec:
          </label>

          <!-- Share with submitter -->
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="shareWithSubmitter"
              type="checkbox"
              class="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">Soumissionnaire</span>
          </label>

          <!-- Share with revisionists -->
          <div>
            <label class="flex items-center space-x-2 mb-2 cursor-pointer">
              <input
                v-model="shareWithAllRevisionists"
                type="checkbox"
                class="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                @change="toggleAllRevisionists"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Tous les révisionnistes</span>
            </label>

            <!-- Individual revisionists selection -->
            <div v-if="!shareWithAllRevisionists && revisionists.length > 0" class="ml-6 space-y-1 max-h-24 overflow-y-auto">
              <label
                v-for="revisionist in revisionists"
                :key="revisionist.id"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="selectedRevisionists"
                  :value="revisionist.id"
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                />
                <span class="text-xs text-gray-600 dark:text-gray-400">
                  {{ revisionist.first_name }} {{ revisionist.last_name }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Input and send button -->
        <div class="flex space-x-2">
          <textarea
            v-model="newComment"
            @keydown.enter.prevent="sendComment"
            placeholder="Écrivez votre commentaire..."
            rows="2"
            :disabled="isSending"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          ></textarea>
          <button
            @click="sendComment"
            :disabled="!newComment.trim() || isSending || (!shareWithSubmitter && selectedRevisionists.length === 0)"
            class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            :title="!shareWithSubmitter && selectedRevisionists.length === 0 ? 'Sélectionnez au moins un destinataire' : ''"
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
import { ref, onMounted, nextTick, watch } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'
import { useAdmin } from '@/composables/useAdmin'

const props = defineProps({
  activityId: {
    type: String,
    required: true
  }
})

const { supabase } = useSupabase()
const { currentUser } = useAuth()
const { hasRole } = useAdmin()

const isOpen = ref(false)
const comments = ref([])
const newComment = ref('')
const shareWithSubmitter = ref(false)
const shareWithAllRevisionists = ref(true)
const selectedRevisionists = ref([])
const revisionists = ref([])
const isLoadingComments = ref(false)
const isSending = ref(false)
const errorMessage = ref('')
const unreadCount = ref(0)
const messagesContainer = ref(null)

const toggleWidget = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    loadComments()
    loadRevisionists()
    unreadCount.value = 0
  }
}

const toggleAllRevisionists = () => {
  if (shareWithAllRevisionists.value) {
    selectedRevisionists.value = revisionists.value.map(r => r.id)
  } else {
    selectedRevisionists.value = []
  }
}

const loadRevisionists = async () => {
  try {
    // Charger tous les révisionnistes sauf l'utilisateur actuel
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        user:users(id, first_name, last_name, email)
      `)
      .eq('role', 'revisionniste')
      .eq('is_active', true)
      .neq('user_id', currentUser.value?.id)

    if (error) throw error

    revisionists.value = data?.map(r => ({
      id: r.user.id,
      first_name: r.user.first_name,
      last_name: r.user.last_name,
      email: r.user.email
    })) || []

    // Par défaut, sélectionner tous les révisionnistes
    if (shareWithAllRevisionists.value) {
      selectedRevisionists.value = revisionists.value.map(r => r.id)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des révisionnistes:', error)
  }
}

const loadComments = async () => {
  if (!currentUser.value) return

  isLoadingComments.value = true
  try {
    const { data, error } = await supabase
      .from('revision_comments')
      .select(`
        *,
        author:users!created_by(id, first_name, last_name)
      `)
      .eq('activity_id', props.activityId)
      .or(`created_by.eq.${currentUser.value.id},shared_with_revisionists.cs.{${currentUser.value.id}}`)
      .order('created_at', { ascending: true })

    if (error) throw error

    comments.value = data?.map(c => ({
      ...c,
      author_name: c.author ? `${c.author.first_name} ${c.author.last_name}` : 'Inconnu'
    })) || []

    // Scroll to bottom after loading
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires:', error)
  } finally {
    isLoadingComments.value = false
  }
}

const sendComment = async () => {
  if (!newComment.value.trim() || !currentUser.value) return
  if (!shareWithSubmitter.value && selectedRevisionists.value.length === 0) {
    errorMessage.value = 'Veuillez sélectionner au moins un destinataire'
    return
  }

  isSending.value = true
  errorMessage.value = ''

  try {
    const commentData = {
      activity_id: props.activityId,
      created_by: currentUser.value.id,
      comment_text: newComment.value.trim(),
      shared_with_submitter: shareWithSubmitter.value,
      shared_with_revisionists: selectedRevisionists.value.length > 0 ? selectedRevisionists.value : null
    }

    const { error } = await supabase
      .from('revision_comments')
      .insert([commentData])

    if (error) throw error

    // Ajouter le commentaire localement pour un feedback immédiat
    comments.value.push({
      ...commentData,
      id: Date.now(), // Temporary ID
      created_at: new Date().toISOString(),
      author_name: `${currentUser.value.first_name} ${currentUser.value.last_name}`
    })

    newComment.value = ''

    // Scroll to bottom after sending
    await nextTick()
    scrollToBottom()
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

// Subscription for real-time updates
let subscription = null

const subscribeToComments = () => {
  if (!currentUser.value) return

  subscription = supabase
    .channel(`comments-${props.activityId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'revision_comments',
      filter: `activity_id=eq.${props.activityId}`
    }, (payload) => {
      // Ajouter le nouveau commentaire si l'utilisateur est destinataire
      if (payload.new.created_by !== currentUser.value.id) {
        if (payload.new.shared_with_revisionists?.includes(currentUser.value.id)) {
          loadComments() // Recharger pour obtenir les détails de l'auteur
          if (!isOpen.value) {
            unreadCount.value++
          }
        }
      }
    })
    .subscribe()
}

onMounted(() => {
  if (hasRole('revisionniste')) {
    subscribeToComments()
  }
})

// Cleanup subscription
watch(() => props.activityId, () => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
  if (hasRole('revisionniste')) {
    subscribeToComments()
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
</style>