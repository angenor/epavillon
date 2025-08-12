<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header avec image de bannière -->
    <div class="relative h-64 md:h-80 lg:h-96 overflow-hidden">
      <img 
        src="/images/example/event_banniere_par_defaut_32_9.jpg"
        alt="Programmation bannière"
        class="w-full h-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      
      <!-- Contenu du header -->
      <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div class="max-w-7xl mx-auto">
          <h1 v-if="event" class="text-3xl md:text-5xl font-bold text-white mb-4">
            {{ event.title }}
          </h1>
          <div v-if="event" class="flex flex-wrap gap-3">
            <span v-if="event.year" class="bg-white/90 px-4 py-2 rounded-lg text-sm font-bold text-gray-900">
              {{ event.year }}
            </span>
            <span v-if="event.acronym" class="bg-orange-500/90 px-4 py-2 rounded-lg text-sm font-bold text-white">
              {{ event.acronym }}
            </span>
            <span :class="getStatusClass(event)" class="px-4 py-2 rounded-lg text-sm font-medium">
              {{ t(`events.status.${event.event_status || 'upcoming'}`) }}
            </span>
          </div>
        </div>
      </div>
    </div>

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
            <li v-if="event">
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                  {{ event.title }}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <!-- Contenu principal -->
    <div v-else-if="event" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Sélecteur de vue -->
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('programmations.activities') }}
        </h2>
        
        <div class="flex gap-2">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
              viewMode === 'grid'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span class="hidden sm:inline">{{ t('programmations.viewGrid') }}</span>
          </button>
          
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
              viewMode === 'list'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span class="hidden sm:inline">{{ t('programmations.viewList') }}</span>
          </button>
          
          <button
            @click="viewMode = 'calendar'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
              viewMode === 'calendar'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="hidden sm:inline">{{ t('programmations.viewCalendar') }}</span>
          </button>
        </div>
      </div>

      <!-- Loading activités -->
      <div v-if="isLoadingActivities" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="activities.length === 0" class="text-center py-16">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ t('programmations.noActivities') }}
        </h3>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          {{ t('programmations.noActivitiesDescription') }}
        </p>
      </div>

      <!-- Vue Grille -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="activity in activities" 
          :key="activity.id"
          @click="goToActivityDetail(activity.id)"
          class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        >
          <!-- Badge de type -->
          <div class="relative">
            <div class="h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <div class="absolute top-4 right-4">
              <span class="px-3 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                {{ t(`activity.submit.formats.${activity.format || 'presentation'}`) }}
              </span>
            </div>
          </div>
          
          <!-- Contenu -->
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
              {{ activity.title }}
            </h3>
            
            <p v-if="activity.description" class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
              {{ stripHtml(activity.description) }}
            </p>
            
            <!-- Détails -->
            <div class="space-y-2">
              <div v-if="activity.proposed_start_date" class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(activity.proposed_start_date) }}
              </div>
              
              <div v-if="activity.proposed_start_date" class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatTime(activity.proposed_start_date) }} - {{ formatTime(activity.proposed_end_date) }}
              </div>
              
              <div v-if="activity.room" class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {{ activity.room }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Liste -->
      <div v-else-if="viewMode === 'list'" class="space-y-4">
        <div 
          v-for="activity in activities" 
          :key="activity.id"
          @click="goToActivityDetail(activity.id)"
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ activity.title }}
                </h3>
                <span class="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 rounded-full text-xs font-medium">
                  {{ t(`activity.submit.formats.${activity.format || 'presentation'}`) }}
                </span>
              </div>
              
              <p v-if="activity.description" class="text-gray-600 dark:text-gray-400 mb-3">
                {{ stripHtml(activity.description) }}
              </p>
              
              <div class="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div v-if="activity.proposed_start_date" class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(activity.proposed_start_date) }}
                </div>
                
                <div v-if="activity.proposed_start_date" class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatTime(activity.proposed_start_date) }} - {{ formatTime(activity.proposed_end_date) }}
                </div>
                
                <div v-if="activity.room" class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {{ activity.room }}
                </div>
                
                <div v-if="activity.max_participants" class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {{ activity.max_participants }} {{ t('activity.participants') }}
                </div>
              </div>
            </div>
            
            <div class="ml-4">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Calendrier avec Vue-Cal -->
      <div v-else-if="viewMode === 'calendar'" class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <vue-cal
          :events="calendarEvents"
          :time-from="8 * 60"
          :time-to="20 * 60"
          :disable-views="['years', 'year']"
          :selected-date="selectedDate"
          active-view="month"
          :locale="locale"
          :hide-weekends="false"
          :events-on-month-view="true"
          events-count-on-year-view
          class="vuecal--orange-theme"
          @event-click="onEventClick"
        >
          <template v-slot:event="{ event }">
            <div class="vuecal__event-title">
              {{ event.title }}
            </div>
            <div class="vuecal__event-time text-xs">
              {{ formatTime(event.start) }}
            </div>
          </template>
        </vue-cal>
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
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()

// État
const isLoading = ref(true)
const isLoadingActivities = ref(false)
const event = ref(null)
const activities = ref([])
const viewMode = ref('grid') // 'grid', 'list', 'calendar'
const selectedDate = ref(new Date())

// Paramètres de route
const year = computed(() => parseInt(route.params.year))
const eventId = computed(() => route.params.eventId)

// Computed pour le calendrier
const calendarEvents = computed(() => {
  return activities.value.map(activity => ({
    id: activity.id,
    title: activity.title,
    start: activity.proposed_start_date ? new Date(activity.proposed_start_date) : new Date(),
    end: activity.proposed_end_date ? new Date(activity.proposed_end_date) : new Date(),
    class: 'orange',
    background: true,
    content: activity.description || '',
    room: activity.room || '',
    format: activity.format || 'presentation'
  }))
})

// Méthodes
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const stripHtml = (html) => {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const getStatusClass = (event) => {
  const status = event?.event_status || 'upcoming'
  const statusClasses = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
  }
  return statusClasses[status] || statusClasses.upcoming
}

const goToActivityDetail = (activityId) => {
  router.push(`/activities/${activityId}`)
}

const onEventClick = (event) => {
  goToActivityDetail(event.id)
}

const loadEvent = async () => {
  try {
    isLoading.value = true

    // Charger l'événement
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId.value)
      .eq('year', year.value)
      .single()

    if (error) throw error
    
    event.value = data

    // Si on a un événement, charger ses activités
    if (data) {
      await loadActivities()
    }

  } catch (error) {
    console.error('Error loading event:', error)
  } finally {
    isLoading.value = false
  }
}

const loadActivities = async () => {
  try {
    isLoadingActivities.value = true

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('event_id', eventId.value)
      .order('proposed_start_date', { ascending: true })

    if (error) throw error

    activities.value = data || []

    // Si on a des activités et qu'on est en vue calendrier, définir la date sélectionnée
    if (data && data.length > 0 && data[0].proposed_start_date) {
      selectedDate.value = new Date(data[0].proposed_start_date)
    }

  } catch (error) {
    console.error('Error loading activities:', error)
  } finally {
    isLoadingActivities.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadEvent()
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

/* Styles pour Vue-Cal theme orange */
:deep(.vuecal--orange-theme) {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

:deep(.vuecal--orange-theme .vuecal__header) {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.vuecal--orange-theme .vuecal__title-bar) {
  background-color: transparent;
}

:deep(.vuecal--orange-theme .vuecal__title) {
  color: #111827;
}

:deep(.vuecal--orange-theme .vuecal__weekdays-headings) {
  border-bottom: 1px solid #e5e7eb;
}

:deep(.vuecal--orange-theme .vuecal__heading) {
  color: #374151;
  font-weight: 500;
}

:deep(.vuecal--orange-theme .vuecal__cell) {
  border: 1px solid #e5e7eb;
}

:deep(.vuecal--orange-theme .vuecal__cell-date) {
  color: #374151;
}

:deep(.vuecal--orange-theme .vuecal__cell--today) {
  background-color: #fef5e7;
}

:deep(.vuecal--orange-theme .vuecal__cell--selected) {
  background-color: #ffe5cc;
}

:deep(.vuecal--orange-theme .vuecal__event) {
  background-color: #f97316;
  color: white;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

:deep(.vuecal--orange-theme .vuecal__event:hover) {
  background-color: #ea580c;
}

:deep(.vuecal--orange-theme .vuecal__event.orange) {
  background-color: #f97316;
}

:deep(.vuecal--orange-theme .vuecal__event.orange:hover) {
  background-color: #ea580c;
}

:deep(.vuecal--orange-theme .vuecal__arrow) {
  color: #4b5563;
}

:deep(.vuecal--orange-theme .vuecal__arrow:hover) {
  color: #f97316;
}

:deep(.vuecal--orange-theme .vuecal__view-btn) {
  color: #374151;
}

:deep(.vuecal--orange-theme .vuecal__view-btn:hover) {
  color: #f97316;
}

:deep(.vuecal--orange-theme .vuecal__view-btn--active) {
  background-color: #f97316;
  color: white;
}

:deep(.vuecal--orange-theme .vuecal__view-btn--active:hover) {
  background-color: #ea580c;
}

:deep(.vuecal--orange-theme .vuecal__now-line) {
  background-color: #f97316;
}

:deep(.vuecal--orange-theme .vuecal__time-cell) {
  color: #4b5563;
}

/* Styles pour le mode sombre */
@media (prefers-color-scheme: dark) {
  :deep(.vuecal--orange-theme) {
    border-color: #374151;
  }
  
  :deep(.vuecal--orange-theme .vuecal__header) {
    background-color: #1f2937;
    border-bottom-color: #374151;
  }
  
  :deep(.vuecal--orange-theme .vuecal__title) {
    color: white;
  }
  
  :deep(.vuecal--orange-theme .vuecal__weekdays-headings) {
    border-bottom-color: #374151;
  }
  
  :deep(.vuecal--orange-theme .vuecal__heading) {
    color: #d1d5db;
  }
  
  :deep(.vuecal--orange-theme .vuecal__cell) {
    border-color: #374151;
  }
  
  :deep(.vuecal--orange-theme .vuecal__cell-date) {
    color: #d1d5db;
  }
  
  :deep(.vuecal--orange-theme .vuecal__cell--today) {
    background-color: rgba(249, 115, 22, 0.2);
  }
  
  :deep(.vuecal--orange-theme .vuecal__cell--selected) {
    background-color: rgba(249, 115, 22, 0.3);
  }
  
  :deep(.vuecal--orange-theme .vuecal__arrow) {
    color: #9ca3af;
  }
  
  :deep(.vuecal--orange-theme .vuecal__arrow:hover) {
    color: #fb923c;
  }
  
  :deep(.vuecal--orange-theme .vuecal__view-btn) {
    color: #d1d5db;
  }
  
  :deep(.vuecal--orange-theme .vuecal__view-btn:hover) {
    color: #fb923c;
  }
  
  :deep(.vuecal--orange-theme .vuecal__time-cell) {
    color: #9ca3af;
  }
}
</style>