<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

      <div class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-2xl w-full mx-4 z-10">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Changer le soumissionnaire
            </h3>
            <button @click="close" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Message d'erreur -->
          <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ error }}
            <button @click="error = null" class="ml-2 text-red-900 hover:text-red-700">
              <svg class="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Soumissionnaire actuel -->
          <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Soumissionnaire actuel</p>
            <div class="flex items-center space-x-3">
              <img v-if="currentSubmitter?.profile_photo_url"
                   :src="currentSubmitter.profile_photo_url"
                   :alt="`${currentSubmitter.first_name} ${currentSubmitter.last_name}`"
                   class="h-12 w-12 rounded-full object-cover">
              <div v-else class="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span class="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  {{ currentSubmitter?.first_name?.[0] }}{{ currentSubmitter?.last_name?.[0] }}
                </span>
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ currentSubmitter?.first_name }} {{ currentSubmitter?.last_name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ currentSubmitter?.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- Recherche d'utilisateur -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rechercher un nouvel utilisateur
            </label>
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="searchUsers"
                type="text"
                placeholder="Nom, prénom ou email..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <div v-if="isSearching" class="absolute right-3 top-3">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            </div>
          </div>

          <!-- Résultats de recherche -->
          <div v-if="searchResults.length > 0" class="mb-4 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            <div
              v-for="user in searchResults"
              :key="user.id"
              @click="selectUser(user)"
              class="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
            >
              <img v-if="user.profile_photo_url"
                   :src="user.profile_photo_url"
                   :alt="`${user.first_name} ${user.last_name}`"
                   class="h-10 w-10 rounded-full object-cover">
              <div v-else class="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {{ user.first_name?.[0] }}{{ user.last_name?.[0] }}
                </span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ user.first_name }} {{ user.last_name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ user.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- Message si aucun résultat -->
          <div v-else-if="searchQuery && !isSearching && searchResults.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
            Aucun utilisateur trouvé
          </div>

          <!-- Utilisateur sélectionné -->
          <div v-if="selectedUser" class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg">
            <p class="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Nouveau soumissionnaire sélectionné</p>
            <div class="flex items-center space-x-3">
              <img v-if="selectedUser.profile_photo_url"
                   :src="selectedUser.profile_photo_url"
                   :alt="`${selectedUser.first_name} ${selectedUser.last_name}`"
                   class="h-12 w-12 rounded-full object-cover">
              <div v-else class="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span class="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  {{ selectedUser.first_name?.[0] }}{{ selectedUser.last_name?.[0] }}
                </span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ selectedUser.first_name }} {{ selectedUser.last_name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ selectedUser.email }}
                </p>
              </div>
              <button @click="selectedUser = null" class="text-red-600 hover:text-red-800">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer avec boutons -->
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="confirmChange"
            :disabled="!selectedUser || isUpdating"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <div v-if="isUpdating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ isUpdating ? 'Mise à jour...' : 'Confirmer le changement' }}
          </button>
          <button
            @click="close"
            :disabled="isUpdating"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentSubmitter: {
    type: Object,
    default: null
  },
  activityId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'update'])

const { supabase } = useSupabase()

const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const selectedUser = ref(null)
const isUpdating = ref(false)
const error = ref(null)

let searchTimeout = null

// Fonction de recherche d'utilisateurs
const searchUsers = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  error.value = null

  // Debounce: attendre 300ms après la dernière frappe
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const { data, error: searchError } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          profile_photo_url,
          organization_id
        `)
        .or(`first_name.ilike.%${searchQuery.value}%,last_name.ilike.%${searchQuery.value}%,email.ilike.%${searchQuery.value}%`)
        .limit(10)

      if (searchError) throw searchError

      // Filtrer le soumissionnaire actuel des résultats
      searchResults.value = (data || []).filter(user => user.id !== props.currentSubmitter?.id)
    } catch (err) {
      console.error('Erreur lors de la recherche:', err)
      error.value = 'Erreur lors de la recherche d\'utilisateurs'
    } finally {
      isSearching.value = false
    }
  }, 300)
}

// Sélectionner un utilisateur
const selectUser = (user) => {
  selectedUser.value = user
  searchResults.value = []
  searchQuery.value = `${user.first_name} ${user.last_name}`
}

// Confirmer le changement
const confirmChange = async () => {
  if (!selectedUser.value) return

  isUpdating.value = true
  error.value = null

  try {
    const { error: updateError } = await supabase
      .from('activities')
      .update({ submitted_by: selectedUser.value.id })
      .eq('id', props.activityId)

    if (updateError) throw updateError

    // Émettre l'événement de mise à jour
    emit('update', selectedUser.value)
    close()
  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err)
    error.value = 'Erreur lors du changement de soumissionnaire'
  } finally {
    isUpdating.value = false
  }
}

// Fermer le modal
const close = () => {
  searchQuery.value = ''
  searchResults.value = []
  selectedUser.value = null
  error.value = null
  emit('close')
}

// Réinitialiser quand le modal est fermé
watch(() => props.show, (newValue) => {
  if (!newValue) {
    searchQuery.value = ''
    searchResults.value = []
    selectedUser.value = null
    error.value = null
  }
})
</script>
