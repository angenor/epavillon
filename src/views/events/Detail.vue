<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
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
          
          <!-- Badge de statut -->
          <div class="flex flex-wrap gap-3">
            <!-- Badge de statut de l'événement -->
            <span :class="statusClasses" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium">
              <svg class="w-2 h-2 mr-2" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              {{ t(`event.status.${event.event_status || event.status}`) }}
            </span>
            
            <!-- Badge de statut de soumission -->
            <span v-if="event.submission_status" :class="submissionStatusClasses" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium">
              <svg class="w-2 h-2 mr-2" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              {{ t(`event.submissionStatus.${event.submission_status}`) }}
            </span>
            
            <!-- Badge de l'année -->
            <span v-if="event.year" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {{ event.year }}
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
              {{ t('event.description') }}
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
              class="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {{ t('event.viewActivities') }}
            </button>
            
            <button 
              v-if="canSubmitActivity"
              @click="goToSubmission"
              class="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ t('event.submitActivity') }}
            </button>
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
                {{ t('event.dateTime') }}
              </div>
              
              <!-- Dates en ligne -->
              <div v-if="event.participation_mode === 'online' || event.participation_mode === 'hybrid'">
                <p v-if="event.online_start_datetime" class="text-gray-900 dark:text-white font-medium">
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('event.online') }}:</span><br>
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
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('event.inPerson') }}:</span><br>
                  {{ formatDate(event.in_person_start_date) }}
                  <span v-if="event.in_person_end_date && event.in_person_start_date !== event.in_person_end_date">
                    - {{ formatDate(event.in_person_end_date) }}
                  </span>
                </p>
              </div>
              
              <!-- Fallback pour anciennes propriétés -->
              <div v-if="!event.online_start_datetime && !event.in_person_start_date && event.start_date">
                <p class="text-gray-900 dark:text-white font-medium">
                  {{ formatDate(event.start_date) }}
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ formatTime(event.start_date) }} - {{ formatTime(event.end_date) }}
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
                {{ t('event.location') }}
              </div>
              <p v-if="event.city" class="text-gray-900 dark:text-white font-medium">
                {{ event.city }}<span v-if="country">, {{ country.name_fr }}</span>
              </p>
              <p v-if="event.address" class="text-gray-700 dark:text-gray-300 text-sm mt-1">
                {{ event.address }}
              </p>
              <!-- Fallback pour ancienne propriété location -->
              <p v-else-if="event.location" class="text-gray-900 dark:text-white font-medium">
                {{ event.location }}
              </p>
            </div>

            <!-- Mode de participation -->
            <div>
              <div class="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ t('event.participationMode') }}
              </div>
              <p class="text-gray-900 dark:text-white font-medium">
                {{ t(`event.participationModes.${event.participation_mode || event.format}`) }}
              </p>
            </div>

            <!-- Date limite de soumission -->
            <div v-if="event.submission_deadline">
              <div class="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ t('event.submissionDeadline') }}
              </div>
              <p class="text-gray-900 dark:text-white font-medium">
                {{ formatDate(event.submission_deadline) }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ remainingDays }} {{ t('event.daysRemaining') }}
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

    <!-- Section 3: Activités à venir -->
    <div v-if="activities.length > 0" class="bg-gray-50 dark:bg-gray-800 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {{ t('event.upcomingActivities') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="activity in activities.slice(0, 6)" 
            :key="activity.id"
            @click="goToActivityDetail(activity.id)"
            class="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            <!-- Bannière de l'activité -->
            <div class="h-48 bg-gradient-to-br from-primary-500 to-primary-600 relative">
              <img 
                v-if="activity.banner" 
                :src="activity.banner" 
                :alt="activity.title"
                class="w-full h-full object-cover"
              >
              <div class="absolute inset-0 bg-black/20"></div>
            </div>

            <!-- Contenu de l'activité -->
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {{ activity.title }}
              </h3>

              <!-- Informations -->
              <div class="space-y-2 text-sm">
                <div class="flex items-center text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ activity.location }}
                </div>

                <div class="flex items-center text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(activity.proposed_start_date) }}
                </div>

                <div class="flex items-center text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatTime(activity.proposed_start_date) }}
                </div>

                <div class="flex items-center text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ t(`event.formats.${activity.format}`) }}
                </div>
              </div>

              <!-- Organisations -->
              <div v-if="activity.organizations && activity.organizations.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ t('event.organizedBy') }}</p>
                <div class="flex flex-wrap gap-2">
                  <div 
                    v-for="org in activity.organizations" 
                    :key="org.id"
                    class="flex items-center"
                  >
                    <img 
                      v-if="org.logo" 
                      :src="org.logo" 
                      :alt="org.name"
                      class="w-6 h-6 rounded object-cover mr-1"
                    >
                    <span class="text-xs text-gray-700 dark:text-gray-300">{{ org.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Voir toutes les activités -->
        <div class="text-center mt-8">
          <button 
            @click="goToActivities"
            class="inline-flex items-center px-6 py-3 text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            {{ t('event.viewAllActivities') }}
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
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
const supabase = useSupabase()

// État
const event = ref({
  id: '',
  year: new Date().getFullYear(),
  title: '',
  description: '',
  // Anciennes propriétés pour compatibilité
  banner: '',
  status: 'upcoming',
  start_date: '',
  end_date: '',
  location: '',
  format: 'hybrid',
  // Nouvelles propriétés de la base de données
  event_status: 'upcoming',
  submission_status: 'open',
  submission_deadline: '',
  // Bannières multi-formats
  banner_high_quality_32_9_url: '',
  banner_high_quality_16_9_url: '',
  banner_high_quality_1_1_url: '',
  banner_low_quality_32_9_url: '',
  banner_low_quality_16_9_url: '',
  banner_low_quality_1_1_url: '',
  // Mode de participation et dates
  participation_mode: 'hybrid',
  online_start_datetime: '',
  online_end_datetime: '',
  in_person_start_date: '',
  in_person_end_date: '',
  // Localisation
  country_id: '',
  city: '',
  address: '',
  logo_url: '',
  // Métadonnées
  created_by: '',
  created_at: '',
  updated_at: ''
})

const activities = ref([])
const country = ref(null)

// Computed
const statusClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium'
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    ongoing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  const status = event.value.event_status || event.value.status || 'upcoming'
  return `${baseClasses} ${statusColors[status] || statusColors.upcoming}`
})

const submissionStatusClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium'
  const statusColors = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return `${baseClasses} ${statusColors[event.value.submission_status] || statusColors.open}`
})

const canSubmitActivity = computed(() => {
  // Vérifier le statut de soumission
  if (event.value.submission_status === 'closed') return false
  
  // Vérifier la date limite de soumission
  if (!event.value.submission_deadline) return false
  return new Date(event.value.submission_deadline) > new Date()
})

const remainingDays = computed(() => {
  if (!event.value.submission_deadline) return 0
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

const goToActivities = () => {
  router.push({ name: 'event-activities', params: { id: event.value.id } })
}

const goToSubmission = () => {
  router.push({ name: 'create-activity', params: { eventId: event.value.id } })
}

const goToActivityDetail = (activityId) => {
  router.push(`/activities/${activityId}`)
}

// Méthode pour obtenir l'URL de la bannière
const getBannerUrl = () => {
  // Priorité : banner_high_quality_32_9_url > ancienne propriété banner > image par défaut
  return event.value.banner_high_quality_32_9_url || 
         event.value.banner || 
         '/images/example/event_banniere_par_defaut_32_9.jpg'
}

const loadEvent = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, countries(id, name_fr, name_en)')
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    
    // Extraire les informations du pays si disponible
    if (data.countries) {
      country.value = data.countries
      delete data.countries
    }
    
    // Merge avec les valeurs par défaut pour éviter les undefined
    event.value = {
      ...event.value,
      ...data,
      // Assurer la compatibilité avec les anciennes propriétés
      status: data.event_status || data.status || 'upcoming',
      format: data.participation_mode || data.format || 'hybrid'
    }
  } catch (error) {
    console.error('Error loading event:', error)
  }
}

const loadActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*, organizations(id, name, logo_url)')
      .eq('event_id', route.params.id)
      .order('proposed_start_date', { ascending: true })
      .limit(6)

    if (error) throw error
    
    // S'assurer que chaque activité a un format défini
    activities.value = (data || []).map(activity => ({
      ...activity,
      format: activity.format || 'hybrid'
    }))
  } catch (error) {
    console.error('Error loading activities:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadEvent()
  loadActivities()
})
</script>