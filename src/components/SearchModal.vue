<template>
  <!-- Modal Overlay -->
  <Transition name="modal-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <!-- Modal Content -->
      <div
        class="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all"
        @click.stop
      >
        <!-- Header avec barre de recherche -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-4">
            <!-- Icône de recherche -->
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <!-- Champ de recherche -->
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              :placeholder="t('common.searchModal.placeholder')"
              class="flex-1 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              @keydown.esc="closeModal"
              @input="handleSearch"
            >

            <!-- Bouton fermer -->
            <button
              @click="closeModal"
              class="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Indications clavier -->
          <div class="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span class="flex items-center gap-1">
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
              {{ t('common.searchModal.pressEsc') }}
            </span>
          </div>
        </div>

        <!-- Résultats de recherche -->
        <div class="max-h-[500px] overflow-y-auto">
          <!-- État de chargement -->
          <div v-if="isSearching" class="p-6 space-y-4">
            <div v-for="i in 3" :key="i" class="animate-pulse">
              <div class="flex gap-4">
                <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div class="flex-1 space-y-3">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pas de résultats -->
          <div
            v-else-if="searchQuery && results.length === 0 && !isSearching"
            class="p-12 text-center"
          >
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.searchModal.noResults') }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              {{ t('common.searchModal.noResultsDescription') }}
            </p>
          </div>

          <!-- Liste des résultats -->
          <div v-else-if="results.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
            <button
              v-for="activity in results"
              :key="activity.id"
              @click="goToActivity(activity.id)"
              class="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer text-left group"
            >
              <div class="flex gap-4">
                <!-- Image de couverture -->
                <div class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    v-if="activity.cover_image_low_url"
                    :src="activity.cover_image_low_url"
                    :alt="activity.title"
                    class="w-full h-full object-cover"
                  >
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <!-- Informations de l'activité -->
                <div class="flex-1 min-w-0">
                  <!-- Titre -->
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 mb-2">
                    {{ activity.title }}
                  </h3>

                  <!-- Organisation -->
                  <div v-if="activity.organization" class="flex items-center gap-2 mb-2">
                    <!-- Logo de l'organisation -->
                    <img
                      v-if="activity.organization.logo_url"
                      :src="activity.organization.logo_url"
                      :alt="activity.organization.name"
                      class="w-6 h-6 rounded object-contain bg-white"
                    >
                    <div v-else class="w-6 h-6 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span class="text-xs font-bold text-gray-600 dark:text-gray-300">
                        {{ activity.organization.name?.[0]?.toUpperCase() || 'O' }}
                      </span>
                    </div>

                    <!-- Nom et acronyme de l'organisation -->
                    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                      <span class="truncate">{{ activity.organization.name }}</span>
                      <span v-if="activity.organization.acronym" class="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium flex-shrink-0">
                        {{ activity.organization.acronym }}
                      </span>
                    </div>
                  </div>

                  <!-- Date et format -->
                  <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span v-if="activity.final_start_date" class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(activity.final_start_date) }}
                    </span>
                    <span v-if="activity.format" class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {{ t(`activity.submit.formats.${activity.format}`) }}
                    </span>
                  </div>
                </div>

                <!-- Icône de navigation -->
                <div class="flex-shrink-0 self-center">
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          <!-- État initial (aucune recherche) -->
          <div v-else class="p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.searchModal.title') }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              {{ t('common.searchModal.placeholder') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const router = useRouter()
const { supabase } = useSupabase()

// État
const searchQuery = ref('')
const results = ref([])
const isSearching = ref(false)
const searchInput = ref(null)
let searchTimeout = null

// Fonction de recherche avec debounce
const handleSearch = () => {
  // Annuler le timeout précédent
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Si la requête est vide, réinitialiser les résultats
  if (!searchQuery.value.trim()) {
    results.value = []
    isSearching.value = false
    return
  }

  // Définir un nouveau timeout
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    await performSearch()
  }, 300) // Debounce de 300ms
}

// Fonction de recherche dans Supabase
const performSearch = async () => {
  try {
    const query = searchQuery.value.trim().toLowerCase()

    if (!query) {
      results.value = []
      isSearching.value = false
      return
    }

    // Charger toutes les activités approuvées, puis filtrer côté client
    // Cette approche est similaire à ActivityReviewSidebar.vue
    const { data, error } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        format,
        final_start_date,
        cover_image_low_url,
        organization:organizations(
          id,
          name,
          acronym,
          logo_url
        )
      `)
      .eq('validation_status', 'approved')
      .order('final_start_date', { ascending: false })
      .limit(100) // Charger jusqu'à 100 activités pour la recherche

    if (error) throw error

    // Filtrer les résultats côté client
    const filtered = (data || []).filter(activity => {
      const activityTitle = activity.title?.toLowerCase() || ''
      const organizationName = activity.organization?.name?.toLowerCase() || ''
      const organizationAcronym = activity.organization?.acronym?.toLowerCase() || ''

      return activityTitle.includes(query) ||
             organizationName.includes(query) ||
             organizationAcronym.includes(query)
    })

    // Limiter aux 10 premiers résultats
    results.value = filtered.slice(0, 10)

  } catch (error) {
    console.error('Error searching activities:', error)
    results.value = []
  } finally {
    isSearching.value = false
  }
}

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Naviguer vers une activité
const goToActivity = (activityId) => {
  router.push(`/activities/${activityId}`)
  closeModal()
}

// Fermer le modal
const closeModal = () => {
  searchQuery.value = ''
  results.value = []
  emit('close')
}

// Focus sur le champ de recherche quand le modal s'ouvre
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

// Support du clavier (Esc pour fermer)
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

// Ajouter l'écouteur d'événements au montage
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
/* Animations du modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active > div,
.modal-fade-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from > div {
  transform: scale(0.95) translateY(-20px);
}

.modal-fade-leave-to > div {
  transform: scale(0.95) translateY(-20px);
}

/* Styles pour les kbd */
kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Truncate avec line-clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Scrollbar personnalisée */
.max-h-\[500px\]::-webkit-scrollbar {
  width: 8px;
}

.max-h-\[500px\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[500px\]::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.dark .max-h-\[500px\]::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.max-h-\[500px\]::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark .max-h-\[500px\]::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
