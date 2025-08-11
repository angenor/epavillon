<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link
                to="/programmations"
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
              >
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                {{ t('programmations.title') }}
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="ml-1 text-sm font-medium text-gray-700 dark:text-gray-400 md:ml-2">
                  {{ year }}
                </span>
              </div>
            </li>
            <li aria-current="page">
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                  {{ event.title || t('programmations.loading') }}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[600px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <!-- Contenu principal (réutilisation du template Detail.vue) -->
    <div v-else-if="event">
      <!-- Section 1: Bannière de l'événement -->
      <div class="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <img 
          :src="getBannerUrl()" 
          :alt="event.title"
          class="w-full h-full object-cover"
          loading="lazy"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        <!-- Contenu de la bannière -->
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div class="max-w-7xl mx-auto">
            <h1 class="text-3xl md:text-5xl font-bold text-white mb-4">
              {{ event.title }}
            </h1>
            
            <!-- Badges -->
            <div class="flex flex-wrap gap-3">
              <!-- Badge de statut de l'événement -->
              <span :class="statusClasses" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium">
                <svg class="w-2 h-2 mr-2" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                {{ t(`events.status.${event.event_status || 'upcoming'}`) }}
              </span>
              
              <!-- Badge de statut de soumission -->
              <span v-if="event.submission_status" :class="submissionStatusClasses" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium">
                <svg class="w-2 h-2 mr-2" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                {{ t(`events.submission.${event.submission_status}`) }}
              </span>
              
              <!-- Badge de l'année -->
              <span v-if="event.year" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {{ event.year }}
              </span>

              <!-- Badge acronyme -->
              <span v-if="event.acronym" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                {{ event.acronym }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Détails de l'événement -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Informations principales -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Description -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('events.description') }}
              </h2>
              <div 
                v-html="event.description"
                class="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-gray dark:prose-invert max-w-none"
              />
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-4">
              <button 
                @click="goToActivities"
                class="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {{ t('events.viewActivities') }}
              </button>
              
              <button 
                v-if="canSubmitActivity"
                @click="goToSubmission"
                class="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ t('activity.submit.title') }}
              </button>

              <router-link
                :to="`/events/${event.id}`"
                class="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ t('programmations.fullDetails') }}
              </router-link>
            </div>
          </div>

          <!-- Informations détaillées -->
          <div class="lg:col-span-1">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 space-y-6">
              <!-- Date et heure -->
              <div>
                <div class="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ t('events.dateTime') }}
                </div>
                
                <!-- Dates en ligne -->
                <div v-if="event.participation_mode === 'online' || event.participation_mode === 'hybrid'">
                  <p v-if="event.online_start_datetime" class="text-gray-900 dark:text-white font-medium">
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('events.modes.online') }}:</span><br>
                    {{ formatDate(event.online_start_datetime) }}
                  </p>
                  <p v-if="event.online_start_datetime" class="text-gray-700 dark:text-gray-300">
                    {{ formatTime(event.online_start_datetime) }} - {{ formatTime(event.online_end_datetime) }}
                  </p>
                </div>
                
                <!-- Dates en présentiel -->
                <div v-if="event.participation_mode === 'in_person' || event.participation_mode === 'hybrid'" 
                     :class="{ 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700': event.participation_mode === 'hybrid' }">
                  <p v-if="event.in_person_start_date" class="text-gray-900 dark:text-white font-medium">
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('events.modes.in_person') }}:</span><br>
                    {{ formatDate(event.in_person_start_date) }}
                    <span v-if="event.in_person_end_date && event.in_person_start_date !== event.in_person_end_date">
                      - {{ formatDate(event.in_person_end_date) }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- Lieu -->
              <div v-if="event.participation_mode !== 'online'">
                <div class="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ t('events.location') }}
                </div>
                <p v-if="event.city" class="text-gray-900 dark:text-white font-medium">
                  {{ event.city }}<span v-if="country">, {{ country.name_fr }}</span>
                </p>
                <p v-if="event.address" class="text-gray-700 dark:text-gray-300 text-sm mt-1">
                  {{ event.address }}
                </p>
              </div>

              <!-- Mode de participation -->
              <div>
                <div class="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ t('events.participationMode') }}
                </div>
                <p class="text-gray-900 dark:text-white font-medium">
                  {{ t(`events.modes.${event.participation_mode || 'hybrid'}`) }}
                </p>
              </div>

              <!-- Date limite de soumission -->
              <div v-if="event.submission_deadline">
                <div class="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ t('events.submissionDeadline') }}
                </div>
                <p class="text-gray-900 dark:text-white font-medium">
                  {{ formatDate(event.submission_deadline) }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ remainingDays }} {{ t('events.daysRemaining') }}
                </p>
              </div>
              
              <!-- Logo de l'événement -->
              <div v-if="event.logo_url" class="pt-6 border-t border-gray-200 dark:border-gray-700">
                <img 
                  :src="event.logo_url" 
                  :alt="`${event.title} logo`"
                  class="max-h-24 w-auto mx-auto"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Activités liées -->
      <div v-if="activities.length > 0" class="bg-gray-50 dark:bg-gray-800 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {{ t('events.upcomingActivities') }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="activity in activities.slice(0, 6)" 
              :key="activity.id"
              @click="goToActivityDetail(activity.id)"
              class="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            >
              <!-- Contenu de l'activité -->
              <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {{ activity.title }}
                </h3>

                <!-- Informations -->
                <div class="space-y-2 text-sm">
                  <div v-if="activity.format" class="flex items-center text-gray-600 dark:text-gray-400">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ t(`activity.submit.formats.${activity.format}`) }}
                  </div>

                  <div v-if="activity.proposed_start_date" class="flex items-center text-gray-600 dark:text-gray-400">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(activity.proposed_start_date) }}
                  </div>

                  <div v-if="activity.proposed_start_date" class="flex items-center text-gray-600 dark:text-gray-400">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatTime(activity.proposed_start_date) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Voir toutes les activités -->
          <div class="text-center mt-8">
            <button 
              @click="goToActivities"
              class="inline-flex items-center px-6 py-3 text-orange-600 dark:text-orange-400 font-medium hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              {{ t('events.viewAllActivities') }}
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else class="max-w-2xl mx-auto px-4 py-16">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div class="flex">
          <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              {{ t('programmations.error.title') }}
            </h3>
            <p class="mt-2 text-sm text-red-700 dark:text-red-300">
              {{ t('programmations.error.notFound') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()

// État
const isLoading = ref(true)
const event = ref(null)
const activities = ref([])
const country = ref(null)

// Paramètres de route
const year = computed(() => parseInt(route.params.year))
const eventId = computed(() => route.params.eventId)

// Computed
const statusClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium'
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    ongoing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  const status = event.value?.event_status || 'upcoming'
  return `${baseClasses} ${statusColors[status] || statusColors.upcoming}`
})

const submissionStatusClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium'
  const statusColors = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return `${baseClasses} ${statusColors[event.value?.submission_status] || statusColors.open}`
})

const canSubmitActivity = computed(() => {
  if (!event.value) return false
  // Vérifier le statut de soumission
  if (event.value.submission_status === 'closed') return false
  
  // Vérifier la date limite de soumission
  if (!event.value.submission_deadline) return false
  return new Date(event.value.submission_deadline) > new Date()
})

const remainingDays = computed(() => {
  if (!event.value?.submission_deadline) return 0
  const deadline = new Date(event.value.submission_deadline)
  const today = new Date()
  const diffTime = deadline - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
})

// Méthodes
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(t('common.locale'), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString(t('common.locale'), {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getBannerUrl = () => {
  return event.value?.banner_high_quality_32_9_url || 
         event.value?.banner || 
         '/images/example/event_banniere_par_defaut_32_9.jpg'
}

const goToActivities = () => {
  // Redirection vers la page des activités de l'événement
  router.push(`/events/${event.value.id}/activities`)
}

const goToSubmission = () => {
  router.push(`/events/${event.value.id}/activities/create`)
}

const goToActivityDetail = (activityId) => {
  router.push(`/activities/${activityId}`)
}

const loadEvent = async () => {
  try {
    isLoading.value = true

    // Charger l'événement avec le pays
    const { data, error } = await supabase
      .from('events')
      .select('*, countries(id, name_fr, name_en)')
      .eq('id', eventId.value)
      .eq('year', year.value)
      .single()

    if (error) throw error
    
    if (data) {
      // Extraire les informations du pays si disponible
      if (data.countries) {
        country.value = data.countries
        delete data.countries
      }
      event.value = data
    }

    // Charger les activités liées
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('event_id', eventId.value)
      .order('proposed_start_date', { ascending: true })
      .limit(6)

    if (!activitiesError && activitiesData) {
      activities.value = activitiesData
    }

  } catch (error) {
    console.error('Error loading event:', error)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadEvent()
})
</script>