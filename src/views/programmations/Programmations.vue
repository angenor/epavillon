<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header avec image de bannière -->
    <div class="relative h-64 md:h-80 lg:h-96 overflow-hidden">
      <img 
        src="/images/example/event_banniere_par_defaut_32_9.jpg"
        alt="Programmations bannière"
        class="w-full h-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      
      <!-- Contenu du header -->
      <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-3xl md:text-5xl font-bold text-white mb-6">
            {{ t('programmations.title') }}
          </h1>
          
          <!-- Navigation horizontale des années -->
          <div class="flex gap-2 overflow-x-auto pb-2">
            <button
              @click="selectedYear = 'all'"
              :class="[
                'px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap',
                selectedYear === 'all'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              ]"
            >
              {{ t('programmations.allProgrammings') }}
            </button>
            <button
              v-for="year in availableYears"
              :key="year"
              @click="selectedYear = year"
              :class="[
                'px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap',
                selectedYear === year
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              ]"
            >
              {{ year }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredEvents.length === 0" class="text-center py-16">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ t('programmations.noEvents') }}
        </h3>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          {{ selectedYear === 'all' 
            ? t('programmations.noEventsAll') 
            : t('programmations.noEventsDescription', { year: selectedYear }) 
          }}
        </p>
      </div>

      <!-- Liste des événements -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <!-- Bannière de l'événement -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="event.banner_high_quality_32_9_url || event.banner || '/images/example/event_banniere_par_defaut_32_9.jpg'"
              :alt="event.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <!-- Badge de statut -->
            <div class="absolute top-4 right-4">
              <span :class="getStatusClass(event)" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ t(`events.status.${event.event_status || 'upcoming'}`) }}
              </span>
            </div>

            <!-- Acronyme ou année -->
            <div class="absolute bottom-4 left-4">
              <span class="bg-white/90 dark:bg-gray-900/90 px-3 py-1 rounded-lg text-sm font-bold text-gray-900 dark:text-white">
                {{ event.acronym || event.year }}
              </span>
            </div>
          </div>

          <!-- Contenu -->
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
              {{ event.title }}
            </h3>

            <!-- Description -->
            <p v-if="event.description" class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
              {{ stripHtml(event.description) }}
            </p>

            <!-- Détails -->
            <div class="space-y-2">
              <!-- Mode de participation -->
              <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
                {{ t(`events.modes.${event.participation_mode || 'hybrid'}`) }}
              </div>

              <!-- Localisation -->
              <div v-if="event.city" class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ event.city }}
              </div>

              <!-- Dates -->
              <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {{ formatDateRange(event) }}
              </div>

              <!-- Date limite de soumission -->
              <div v-if="event.submission_deadline && event.submission_status === 'open'" class="flex items-center text-sm">
                <svg class="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-orange-600 dark:text-orange-400 font-medium">
                  {{ t('programmations.submissionDeadline') }}: {{ formatDate(event.submission_deadline) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex gap-3">
              <button
                @click.stop="viewCall(event)"
                class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium text-center"
              >
                {{ t('programmations.viewCall') }}
              </button>
              <button
                @click.stop="goToEventDetail(event)"
                :disabled="!event.is_programmation_available"
                :class="[
                  'flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-center transition-colors',
                  event.is_programmation_available
                    ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                ]"
              >
                {{ t('programmations.viewProgramming') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { supabase } = useSupabase()

// État
const isLoading = ref(false)
const events = ref([])
const selectedYear = ref('all')
const availableYears = ref([])

// Computed
const filteredEvents = computed(() => {
  if (selectedYear.value === 'all') {
    return events.value
  }
  return events.value.filter(event => event.year === selectedYear.value)
})

// Méthodes
const loadEvents = async () => {
  try {
    isLoading.value = true

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    events.value = data || []
    
    // Extraire les années disponibles
    const years = [...new Set(data.map(event => event.year))].sort((a, b) => b - a)
    availableYears.value = years.length > 0 ? years : [new Date().getFullYear()]
    
    // Par défaut, afficher toutes les programmations
    // selectedYear.value reste à 'all' par défaut

  } catch (error) {
    console.error('Error loading events:', error)
  } finally {
    isLoading.value = false
  }
}

const goToEventDetail = (event) => {
  // Vérifier si la programmation est disponible avant de naviguer
  if (!event.is_programmation_available) {
    return
  }
  router.push(`/programmations/${event.year}/${event.id}`)
}

const viewCall = (event) => {
  // Rediriger vers la page de l'appel à soumission ou ouvrir un PDF
  // Pour l'instant, rediriger vers la page de l'événement
  router.push(`/events/${event.id}`)
}

const getStatusClass = (event) => {
  const status = event.event_status || 'upcoming'
  const statusClasses = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
  }
  return statusClasses[status] || statusClasses.upcoming
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(t('common.locale'), {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateRange = (event) => {
  let startDate = null
  let endDate = null

  // Priorité aux dates en ligne
  if (event.online_start_datetime) {
    startDate = new Date(event.online_start_datetime)
    endDate = event.online_end_datetime ? new Date(event.online_end_datetime) : startDate
  }
  // Sinon dates en présentiel
  else if (event.in_person_start_date) {
    startDate = new Date(event.in_person_start_date)
    endDate = event.in_person_end_date ? new Date(event.in_person_end_date) : startDate
  }

  if (!startDate) return t('programmations.dateTBA')

  const startStr = formatDate(startDate)
  const endStr = formatDate(endDate)

  if (startStr === endStr) {
    return startStr
  } else {
    return `${startStr} - ${endStr}`
  }
}

const stripHtml = (html) => {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Gestion du paramètre year dans l'URL
const setYearFromRoute = () => {
  if (route.query.year) {
    const yearParam = parseInt(route.query.year)
    if (!isNaN(yearParam) && availableYears.value.includes(yearParam)) {
      selectedYear.value = yearParam
    }
  }
  // Si pas de paramètre year, rester sur 'all' (comportement par défaut)
}

// Observer les changements d'année sélectionnée pour mettre à jour l'URL
watch(selectedYear, (newYear) => {
  // Mettre à jour l'URL sans recharger la page
  if (newYear === 'all') {
    router.replace({ path: '/programmations' })
  } else {
    router.replace({ 
      path: '/programmations', 
      query: { year: newYear } 
    })
  }
})

// Observer les changements de route
watch(() => route.query.year, (newYear) => {
  if (newYear) {
    const yearParam = parseInt(newYear)
    if (!isNaN(yearParam) && availableYears.value.includes(yearParam)) {
      selectedYear.value = yearParam
    }
  } else {
    // Si pas de paramètre year dans l'URL, afficher tout
    selectedYear.value = 'all'
  }
})

// Lifecycle
onMounted(async () => {
  await loadEvents()
  setYearFromRoute()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}
</style>