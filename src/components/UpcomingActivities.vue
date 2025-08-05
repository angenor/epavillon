<template>
  <div class="h-full bg-opacity-50 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl flex flex-col">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white font-maverick">
        {{ t('activities.title') }}
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-ifdd-bleu"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 p-6">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-sm text-red-600 dark:text-red-400">{{ t('common.error') }}: {{ error }}</p>
      </div>
    </div>

    <!-- Activités -->
    <div v-else class="flex-1 overflow-y-auto">
      <!-- Section Événements -->
      <div v-if="events.length > 0" class="p-6 space-y-4">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {{ t('activities.events') }}
        </h3>
        
        <!-- Événement principal -->
        <div v-if="events[0]" class="bg-ifdd-bleu/10 dark:bg-ifdd-bleu/20 rounded-lg p-4 border-l-4 border-ifdd-bleu transform hover:scale-105 transition-transform cursor-pointer">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 dark:text-white">
                {{ events[0].title }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {{ events[0].description }}
              </p>
              <div class="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <font-awesome-icon :icon="['fas', 'calendar']" class="w-4 h-4 mr-1" />
                <span>{{ formatEventDate(events[0]) }}</span>
              </div>
              <div v-if="events[0].city" class="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                <font-awesome-icon :icon="['fas', 'location-dot']" class="w-4 h-4 mr-1" />
                <span>{{ events[0].city }}{{ events[0].country ? ', ' + getCountryName(events[0].country) : '' }}</span>
              </div>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getEventStatusClass(events[0])">
              {{ t(`activities.status.${getEventStatus(events[0])}`) }}
            </span>
          </div>
        </div>

        <!-- Autres événements -->
        <div v-if="events.length > 1" class="space-y-3">
          <div v-for="event in events.slice(1, 3)" :key="event.id" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <h4 class="font-medium text-gray-900 dark:text-white text-sm">
              {{ event.title }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ formatEventDate(event) }}{{ event.participation_mode === 'online' ? ' • ' + t('activities.online') : '' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Section Formations -->
      <div v-if="trainings.length > 0" class="p-6 pt-2 space-y-4">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {{ t('activities.trainings') }}
        </h3>
        
        <div v-for="training in trainings.slice(0, 2)" :key="training.id" class="bg-gradient-to-r from-ifdd-vert/10 to-ifdd-bleu/10 dark:from-ifdd-vert/20 dark:to-ifdd-bleu/20 rounded-lg p-4 border border-ifdd-vert/20">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white">
                {{ training.title }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {{ getCategoryLabel(training.category) }} • {{ getTrainingDuration(training) }}
              </p>
              <div class="flex items-center mt-2 gap-4">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t('activities.start') }}: {{ formatDate(training.start_date) }}
                </span>
                <span v-if="training.is_active" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                  {{ t('activities.availableSpots') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && events.length === 0 && trainings.length === 0" class="flex-1 p-6 flex items-center justify-center">
        <div class="text-center">
          <font-awesome-icon :icon="['fas', 'calendar-xmark']" class="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
          <p class="text-gray-500 dark:text-gray-400">{{ t('activities.noUpcoming') }}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-6 border-t border-gray-200 dark:border-gray-700">
      <button class="w-full px-4 py-2 bg-ifdd-bleu hover:bg-ifdd-bleu-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center group">
        <span>{{ t('activities.viewAll') }}</span>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'
import { useActivities } from '@/composables/useActivities'

export default {
  name: 'UpcomingActivities',
  setup() {
    const { t, locale } = useI18n()
    const { 
      events, 
      trainings, 
      loading, 
      error, 
      fetchAllUpcoming,
      formatDate,
      formatTime,
      getEventStatus
    } = useActivities()

    // Charger les données au montage
    onMounted(async () => {
      await fetchAllUpcoming()
    })

    // Formater la date d'un événement
    const formatEventDate = (event) => {
      if (event.online_start_datetime) {
        const date = formatDate(event.online_start_datetime)
        const time = formatTime(event.online_start_datetime)
        return `${date} • ${time}`
      } else if (event.in_person_start_date) {
        return formatDate(event.in_person_start_date)
      }
      return ''
    }

    // Obtenir le nom du pays selon la langue
    const getCountryName = (country) => {
      if (!country) return ''
      return locale.value === 'fr' ? country.name_fr : country.name_en
    }

    // Obtenir la classe de statut
    const getEventStatusClass = (event) => {
      const status = getEventStatus(event)
      switch (status) {
        case 'ongoing':
          return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
        case 'upcoming':
          return 'bg-ifdd-bleu text-white'
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
      }
    }

    // Obtenir le label de catégorie
    const getCategoryLabel = (category) => {
      return t(`activities.categories.${category}`)
    }

    // Calculer la durée d'une formation
    const getTrainingDuration = (training) => {
      if (!training.start_date || !training.end_date) return ''
      
      const start = new Date(training.start_date)
      const end = new Date(training.end_date)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 7) {
        return t('activities.duration.days', { count: diffDays })
      } else if (diffDays < 30) {
        const weeks = Math.ceil(diffDays / 7)
        return t('activities.duration.weeks', { count: weeks })
      } else {
        const months = Math.ceil(diffDays / 30)
        return t('activities.duration.months', { count: months })
      }
    }

    return { 
      t,
      events,
      trainings,
      loading,
      error,
      formatEventDate,
      formatDate,
      getCountryName,
      getEventStatus,
      getEventStatusClass,
      getCategoryLabel,
      getTrainingDuration
    }
  }
}
</script>