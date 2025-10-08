<template>
  <aside
    :class="[
      'fixed left-20 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-30 transition-all duration-300 overflow-hidden',
      isOpen ? 'w-80' : 'w-0'
    ]"
  >
    <!-- Header -->
    <div class="sticky mt-16 top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Révision des activités
        </h2>
        <button
          @click="$emit('close')"
          class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Filtre de statut -->
      <div class="mt-3">
        <select
          v-model="filterStatus"
          class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">Toutes les activités</option>
          <option value="submitted">Soumises</option>
          <option value="under_review">En examen</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Rejetées</option>
          <option value="draft">Brouillons</option>
        </select>
      </div>

      <!-- Compteur -->
      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {{ filteredActivities.length }} activité{{ filteredActivities.length > 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Liste des activités avec scroll -->
    <div class="overflow-y-auto h-[calc(100vh-16rem)] p-2" id="activity-list-container">
      <div v-if="isLoading && activities.length === 0" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>

      <div v-else-if="filteredActivities.length === 0 && !isLoading" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">Aucune activité trouvée</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(activity, index) in filteredActivities"
          :key="activity.id"
          :ref="el => setActivityRef(activity.id, el)"
          @click="selectActivity(activity.id)"
          :class="[
            'relative p-3 rounded-lg cursor-pointer transition-all duration-200 border',
            String(activity.id) === String(currentActivityId)
              ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm'
          ]"
        >
          <!-- Date de soumission -->
          <div class="absolute -left-2 -top-2 bg-orange-600 text-white text-xs font-semibold rounded-lg px-2 py-1 shadow-sm">
            {{ formatDate(activity.created_at) }}
          </div>

          <!-- Contenu -->
          <div class="flex items-start space-x-3 mt-1">
            <!-- Logo de l'organisation -->
            <div class="flex-shrink-0">
              <img
                v-if="activity.organization?.logo_url"
                :src="activity.organization.logo_url"
                :alt="activity.organization.name"
                class="w-10 h-10 rounded object-contain bg-gray-100 dark:bg-gray-700 p-1"
              >
              <div v-else class="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
            </div>

            <!-- Informations -->
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                {{ activity.title }}
              </h3>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                {{ activity.organization?.name || 'Organisation inconnue' }}
              </p>

              <!-- Date et statut -->
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(activity.created_at) }}
                </span>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    getStatusClass(activity.validation_status)
                  ]"
                >
                  {{ getStatusLabel(activity.validation_status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Indicateur d'activité courante -->
          <div
            v-if="String(activity.id) === String(currentActivityId)"
            class="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg"
          ></div>
        </div>

      </div>
    </div>

    <!-- Footer avec navigation rapide -->
    <div class="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
      <div class="flex justify-between items-center">
        <button
          @click="navigateToPrevious"
          :disabled="!canNavigatePrevious"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Activité précédente"
        >
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ currentIndex !== -1 ? currentIndex + 1 : '-' }} / {{ filteredActivities.length }}
        </span>

        <button
          @click="navigateToNext"
          :disabled="!canNavigateNext"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Activité suivante"
        >
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentActivityId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['close', 'select'])

const router = useRouter()
const { supabase } = useSupabase()

// État
const activities = ref([])
const isLoading = ref(false)
const filterStatus = ref('')
const activityRefs = ref({})

// Références aux éléments DOM
const setActivityRef = (id, el) => {
  if (el) {
    // S'assurer que l'ID est une chaîne de caractères
    activityRefs.value[String(id)] = el
  }
}

// Computed
const filteredActivities = computed(() => {
  let result = [...activities.value]

  if (filterStatus.value) {
    result = result.filter(a => a.validation_status === filterStatus.value)
  }

  // Trier du plus récent au plus ancien
  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return result
})

const currentIndex = computed(() => {
  return filteredActivities.value.findIndex(a => String(a.id) === String(props.currentActivityId))
})

const canNavigatePrevious = computed(() => {
  return currentIndex.value > 0
})

const canNavigateNext = computed(() => {
  return currentIndex.value < filteredActivities.value.length - 1
})

// Méthodes
const loadActivities = async () => {
  isLoading.value = true

  try {
    // Construction de la requête pour charger TOUTES les activités
    let query = supabase
      .from('activities')
      .select(`
        id,
        title,
        created_at,
        validation_status,
        organization:organizations(
          id,
          name,
          logo_url
        )
      `)
      .order('created_at', { ascending: false })

    // Appliquer le filtre de statut si nécessaire
    if (filterStatus.value) {
      query = query.eq('validation_status', filterStatus.value)
    }

    const { data, error } = await query

    if (error) throw error

    activities.value = data || []
    console.log(`${activities.value.length} activités chargées`)

  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error)
  } finally {
    isLoading.value = false
  }
}

const selectActivity = (activityId) => {
  router.push(`/admin/activities/${activityId}`)
  emit('select', activityId)
}

const navigateToPrevious = () => {
  if (canNavigatePrevious.value) {
    const previousActivity = filteredActivities.value[currentIndex.value - 1]
    selectActivity(previousActivity.id)
  }
}

const navigateToNext = () => {
  if (canNavigateNext.value) {
    const nextActivity = filteredActivities.value[currentIndex.value + 1]
    selectActivity(nextActivity.id)
  }
}

const scrollToCurrentActivity = () => {
  const currentId = String(props.currentActivityId)

  if (!currentId) {
    console.log('Pas d\'ID d\'activité courante')
    return
  }

  console.log('Scroll vers l\'activité:', currentId)
  console.log('Activités disponibles:', activities.value.map(a => a.id))

  // Trouver l'élément dans les refs
  const element = activityRefs.value[currentId]
  const container = document.getElementById('activity-list-container')

  if (!element) {
    console.log('Element non trouvé pour l\'ID:', currentId)
    return
  }

  if (!container) {
    console.log('Container non trouvé')
    return
  }

  // Calculer la position pour centrer l'élément
  const elementTop = element.offsetTop
  const elementHeight = element.offsetHeight
  const containerHeight = container.clientHeight

  // Position pour centrer l'élément dans le container
  const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2)

  console.log('Position de scroll calculée:', {
    elementTop,
    elementHeight,
    containerHeight,
    targetScrollTop
  })

  // Effectuer le scroll
  container.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth'
  })
}

// Fonctions utilitaires
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace('.', '')
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  }
  return classes[status] || classes.draft
}

const getStatusLabel = (status) => {
  const labels = {
    draft: 'Brouillon',
    submitted: 'Soumise',
    under_review: 'En examen',
    approved: 'Approuvée',
    rejected: 'Rejetée'
  }
  return labels[status] || status
}


// Watchers
watch(() => props.currentActivityId, async (newId, oldId) => {
  console.log('Watch currentActivityId:', newId, 'old:', oldId)
  if (props.isOpen && newId) {
    await nextTick()
    scrollToCurrentActivity()
  }
})

watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await nextTick()
    scrollToCurrentActivity()
  }
})

// Watcher pour recharger quand le filtre change
watch(filterStatus, async () => {
  await loadActivities()
  await nextTick()
  scrollToCurrentActivity()
})

// Lifecycle
onMounted(async () => {
  console.log('ActivityReviewSidebar mounted, currentActivityId:', props.currentActivityId)
  await loadActivities()
  await nextTick()
  // Scroll initial vers l'activité courante avec un délai
  if (props.currentActivityId) {
    setTimeout(() => {
      console.log('Appel initial de scrollToCurrentActivity')
      scrollToCurrentActivity()
    }, 500) // Attendre 500ms pour être sûr que tout est rendu
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
