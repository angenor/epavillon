<template>
  <div class="h-full max-h-full w-80 bg-black/30 backdrop-blur-md shadow-2xl flex flex-col pt-16">
    <!-- Header -->
    <div class="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
      
      <h2 class="text-xl font-bold text-white font-maverick">
        {{ "" }}
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
    <div v-else class="flex-1 flex flex-col justify-between relative z-10">
      <div class="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <!-- Boucle sur les activités disponibles (max 3) -->
        <RouterLink 
          v-for="(event, index) in events.slice(0, 3)" 
          :key="event.id || index"
          :to="`/events/${event.id}`" 
          class="block"
        >
          <div class="text-white bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm rounded-xl px-4 py-2 hover:from-white/40 hover:to-white/30 transition-all duration-300 shadow-lg">
            <div class="font-bold text-xl mb-2">{{ event.title }}</div>
            <div class="text-sm opacity-90 line-clamp-2 mb-3">{{ event.description }}</div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="text-sm font-medium">{{ formatEventDate(event) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs opacity-75">{{ event.organization?.name || 'IFDD' }}</span>
                <div class="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                  <span class="text-xs font-bold">{{ (event.organization?.name || 'IFDD').charAt(0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </RouterLink>

        <!-- Message si aucune activité -->
        <div v-if="!events || events.length === 0" class="text-white text-center py-8 px-4">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-lg font-medium mb-2">{{ t('activities.noUpcoming') || 'Aucune activité à venir' }}</p>
          <p class="text-sm opacity-75">{{ t('activities.checkBackLater') || 'Revenez plus tard pour découvrir de nouvelles activités' }}</p>
        </div>
      </div>

      <!-- Voir toutes les activités -->
      <div class="px-3 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-5">
        <RouterLink to="/events" class="block w-full">
          <button class="w-full py-2 px-4 bg-ifdd-bleu hover:bg-ifdd-bleu/90 text-white font-medium rounded-lg transition-colors duration-200 shadow-md">
            {{ t('activities.viewAll') || 'Voir toutes les activités' }}
          </button>
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'
import { useActivities } from '@/composables/useActivities'
import { RouterLink } from 'vue-router'

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
      if (!event) return ''
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