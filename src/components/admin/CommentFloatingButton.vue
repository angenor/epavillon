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
        <div class="mb-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Partager avec:
          </label>

          <!-- Radio buttons for main choice -->
          <div class="space-y-2">
            <!-- Option 1: Soumissionnaire seulement -->
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="shareMode"
                type="radio"
                value="submitter"
                class="border-gray-300 text-purple-500 focus:ring-purple-500"
                @change="updateSharingMode"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Soumissionnaire uniquement</span>
            </label>

            <!-- Option 2: Tous les révisionnistes -->
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="shareMode"
                type="radio"
                value="all_revisionists"
                class="border-gray-300 text-purple-500 focus:ring-purple-500"
                @change="updateSharingMode"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Tous les révisionnistes</span>
            </label>

            <!-- Option 3: Révisionnistes spécifiques -->
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="shareMode"
                type="radio"
                value="specific_revisionists"
                class="border-gray-300 text-purple-500 focus:ring-purple-500"
                @change="updateSharingMode"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Révisionnistes spécifiques</span>
            </label>

            <!-- Option 4: Soumissionnaire et tous les révisionnistes -->
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="shareMode"
                type="radio"
                value="all"
                class="border-gray-300 text-purple-500 focus:ring-purple-500"
                @change="updateSharingMode"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Soumissionnaire et tous les révisionnistes</span>
            </label>
          </div>

          <!-- Liste des révisionnistes spécifiques -->
          <div v-if="shareMode === 'specific_revisionists'" class="mt-3 ml-6 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-purple-300 dark:border-purple-600">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-medium text-gray-700 dark:text-gray-300">
                Sélectionnez les révisionnistes :
              </p>
              <button
                v-if="revisionists.length > 0"
                @click="toggleAllSpecificRevisionists"
                type="button"
                class="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                {{ selectedRevisionists.length === revisionists.length ? 'Désélectionner tout' : 'Sélectionner tout' }}
              </button>
            </div>

            <div v-if="revisionists.length === 0" class="text-xs text-gray-500 dark:text-gray-400 italic py-2">
              Aucun autre révisionniste disponible
            </div>

            <div v-else class="space-y-1 max-h-32 overflow-y-auto">
              <label
                v-for="revisionist in revisionists"
                :key="revisionist.id"
                class="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded px-2 py-1 transition-colors"
              >
                <input
                  v-model="selectedRevisionists"
                  :value="revisionist.id"
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-500 focus:ring-purple-500 cursor-pointer"
                />
                <span class="text-xs text-gray-700 dark:text-gray-300 select-none">
                  {{ revisionist.first_name }} {{ revisionist.last_name }}
                </span>
              </label>
            </div>

            <div v-if="revisionists.length > 0 && selectedRevisionists.length === 0" class="mt-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-xs text-orange-700 dark:text-orange-300 flex items-center">
              <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              Veuillez sélectionner au moins un révisionniste
            </div>

            <div v-else-if="selectedRevisionists.length > 0" class="mt-2 text-xs text-green-600 dark:text-green-400">
              ✓ {{ selectedRevisionists.length }} révisionniste(s) sélectionné(s)
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
            :disabled="!newComment.trim() || isSending || (shareMode === 'specific_revisionists' && selectedRevisionists.length === 0)"
            class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            :title="shareMode === 'specific_revisionists' && selectedRevisionists.length === 0 ? 'Sélectionnez au moins un révisionniste' : ''"
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
const shareMode = ref('all_revisionists') // Mode de partage par défaut
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
    resetState() // Réinitialiser l'état quand on ouvre
    loadComments()
    loadRevisionists()
    unreadCount.value = 0
  }
}

const updateSharingMode = () => {
  errorMessage.value = '' // Clear error when changing mode

  switch(shareMode.value) {
    case 'all_revisionists':
      selectedRevisionists.value = revisionists.value.map(r => r.id)
      break
    case 'specific_revisionists':
      // Ne pas vider la sélection, laisser l'utilisateur choisir
      // Si aucun n'est sélectionné, on peut pré-sélectionner le premier ou laisser vide
      if (selectedRevisionists.value.length === 0 && revisionists.value.length > 0) {
        // Option: pré-sélectionner le premier révisionniste pour éviter la confusion
        // selectedRevisionists.value = [revisionists.value[0].id]
        // Ou laisser vide et l'utilisateur doit sélectionner
        selectedRevisionists.value = []
      }
      break
    case 'submitter':
      selectedRevisionists.value = []
      break
    case 'all':
      selectedRevisionists.value = revisionists.value.map(r => r.id)
      break
  }
}

const toggleAllSpecificRevisionists = () => {
  if (selectedRevisionists.value.length === revisionists.value.length) {
    // Tout désélectionner
    selectedRevisionists.value = []
  } else {
    // Tout sélectionner
    selectedRevisionists.value = revisionists.value.map(r => r.id)
  }
}

const resetState = () => {
  comments.value = []
  newComment.value = ''
  shareMode.value = 'all_revisionists'
  selectedRevisionists.value = []
  errorMessage.value = ''
}

const loadRevisionists = async () => {
  try {
    // Charger tous les révisionnistes sauf l'utilisateur actuel
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        users!user_id(id, first_name, last_name, email)
      `)
      .eq('role', 'revisionniste')
      .eq('is_active', true)

    if (error) {
      console.error('Erreur Supabase:', error)
      throw error
    }

    console.log('Données des révisionnistes récupérées:', data)

    // Filtrer pour exclure l'utilisateur actuel et mapper les données
    revisionists.value = data?.filter(r => r.user_id !== currentUser.value?.id)
      .map(r => ({
        id: r.users.id,
        first_name: r.users.first_name,
        last_name: r.users.last_name,
        email: r.users.email
      })) || []

    console.log('Révisionnistes chargés:', revisionists.value.length, 'révisionniste(s)')

    // Initialiser selon le mode de partage par défaut
    updateSharingMode()
  } catch (error) {
    console.error('Erreur lors du chargement des révisionnistes:', error)
    revisionists.value = []
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

  // Validation selon le mode de partage
  if (shareMode.value === 'specific_revisionists' && selectedRevisionists.value.length === 0) {
    errorMessage.value = 'Veuillez sélectionner au moins un révisionniste'
    return
  }

  isSending.value = true
  errorMessage.value = ''

  try {
    // Déterminer les destinataires selon le mode
    let shareWithSubmitter = false
    let shareWithRevisionistsList = null

    switch(shareMode.value) {
      case 'submitter':
        shareWithSubmitter = true
        break
      case 'all_revisionists':
        shareWithRevisionistsList = revisionists.value.map(r => r.id)
        // Ajouter l'utilisateur actuel pour qu'il voie aussi son propre commentaire
        if (!shareWithRevisionistsList.includes(currentUser.value.id)) {
          shareWithRevisionistsList.push(currentUser.value.id)
        }
        break
      case 'specific_revisionists':
        shareWithRevisionistsList = [...selectedRevisionists.value]
        // Ajouter l'utilisateur actuel pour qu'il voie aussi son propre commentaire
        if (!shareWithRevisionistsList.includes(currentUser.value.id)) {
          shareWithRevisionistsList.push(currentUser.value.id)
        }
        break
      case 'all':
        shareWithSubmitter = true
        shareWithRevisionistsList = revisionists.value.map(r => r.id)
        // Ajouter l'utilisateur actuel pour qu'il voie aussi son propre commentaire
        if (!shareWithRevisionistsList.includes(currentUser.value.id)) {
          shareWithRevisionistsList.push(currentUser.value.id)
        }
        break
    }

    const commentData = {
      activity_id: props.activityId,
      created_by: currentUser.value.id,
      comment_text: newComment.value.trim(),
      shared_with_submitter: shareWithSubmitter,
      shared_with_revisionists: shareWithRevisionistsList
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

// Cleanup subscription and reload data when activity changes
watch(() => props.activityId, (newId, oldId) => {
  if (newId !== oldId) {
    // Cleanup old subscription
    if (subscription) {
      supabase.removeChannel(subscription)
      subscription = null
    }

    // Reset state when changing activity
    resetState()

    // If widget is open, reload data for new activity
    if (isOpen.value) {
      loadComments()
      loadRevisionists()
    }

    // Setup new subscription
    if (hasRole('revisionniste')) {
      subscribeToComments()
    }
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