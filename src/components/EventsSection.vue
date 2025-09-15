<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Image -->
        <div class="order-2 lg:order-1">
          <img
            src="/images/cop.jpg"
            alt="Événements COP"
            class="rounded-2xl shadow-xl w-full h-auto object-cover"
          >
        </div>

        <!-- Contenu -->
        <div class="order-1 lg:order-2">
          <h2 class="text-4xl font-bold dark:text-gray-400 mb-4 font-maverick">
            {{ t('events.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {{ t('events.subtitle') }}
          </p>

          <!-- Loading State -->
          <div v-if="loading" class="space-y-4 mb-8">
            <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div class="animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p class="text-sm text-red-600 dark:text-red-400">{{ t('common.error') }}: {{ error }}</p>
          </div>

          <!-- Events List -->
          <div v-else-if="events.length > 0" class="space-y-4 mb-8">
            <div
              v-for="event in displayedEvents"
              :key="event.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 transition-all"
              :class="getEventCardClass(event)"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold" :class="getEventStatusColorClass(event)">
                  {{ t(`events.status.${event.event_status}`) }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatEventDateRange(event) }}
                </span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ event.title }}</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {{ event.description }}
              </p>
              <div v-if="event.city || event.country" class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <font-awesome-icon :icon="['fas', 'location-dot']" class="w-4 h-4 mr-2" />
                <span>{{ formatLocation(event) }}</span>
              </div>
              <router-link
                :to="`/events/${event.id}`"
                class="text-ifdd-bleu dark:text-ifdd-bleu-light hover:text-ifdd-bleu-dark dark:hover:text-ifdd-bleu font-medium flex items-center space-x-2 transition-colors"
              >
                <span class="text-gray-900 dark:text-gray-100">{{ t('common.seeMore') }}</span>
                <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4 text-gray-900 dark:text-gray-100" />
              </router-link>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center mb-8">
            <font-awesome-icon :icon="['fas', 'calendar-xmark']" class="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
            <p class="text-gray-500 dark:text-gray-400">{{ t('events.noEvents') }}</p>
          </div>

          <!-- Bouton voir tous -->
          <router-link
            to="/programmations"
            class="inline-block w-full sm:w-auto px-6 py-3 bg-ifdd-bleu hover:bg-ifdd-bleu-dark dark:bg-ifdd-bleu-light dark:hover:bg-ifdd-bleu text-white font-medium font-helvetica rounded-lg transition-colors shadow-lg hover:shadow-xl text-center"
          >
            {{ t('events.seeAllEvents') }}
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { onMounted, computed } from 'vue'
import { useActivities } from '@/composables/useActivities'

export default {
  name: 'EventsSection',
  setup() {
    const { t, locale } = useI18n()
    const {
      events,
      loading,
      error,
      fetchUpcomingEvents,
      formatDate,
      getEventStatus
    } = useActivities()

    // Charger les événements au montage
    onMounted(async () => {
      await fetchUpcomingEvents(6) // Récupérer 6 événements pour avoir ongoing, upcoming et completed
    })

    // Afficher seulement 3 événements avec différents statuts
    const displayedEvents = computed(() => {
      if (!events.value.length) return []

      const ongoing = events.value.filter(e => getEventStatus(e) === 'ongoing')
      const upcoming = events.value.filter(e => getEventStatus(e) === 'upcoming')
      const completed = events.value.filter(e => getEventStatus(e) === 'completed')

      const result = []
      if (ongoing.length > 0) result.push(ongoing[0])
      if (upcoming.length > 0) result.push(upcoming[0])
      if (completed.length > 0) result.push(completed[0])

      // Si on n'a pas 3 événements, compléter avec les autres
      const remaining = events.value.filter(e => !result.includes(e))
      while (result.length < 3 && remaining.length > 0) {
        result.push(remaining.shift())
      }

      return result.slice(0, 3)
    })

    // Formater la plage de dates
    const formatEventDateRange = (event) => {
      if (event.participation_mode === 'online') {
        if (event.online_start_datetime && event.online_end_datetime) {
          const start = new Date(event.online_start_datetime)
          const end = new Date(event.online_end_datetime)

          if (start.toDateString() === end.toDateString()) {
            // Même jour
            return formatDate(event.online_start_datetime)
          } else {
            // Jours différents
            const startDay = start.getDate()
            const endDay = end.getDate()
            const month = start.toLocaleDateString(locale.value, { month: 'short' })
            const year = start.getFullYear()
            return `${startDay}-${endDay} ${month} ${year}`
          }
        }
      } else if (event.in_person_start_date && event.in_person_end_date) {
        const start = new Date(event.in_person_start_date)
        const end = new Date(event.in_person_end_date)

        if (start.toDateString() === end.toDateString()) {
          return formatDate(event.in_person_start_date)
        } else {
          const startDay = start.getDate()
          const endDay = end.getDate()
          const month = start.toLocaleDateString(locale.value, { month: 'short' })
          const year = start.getFullYear()
          return `${startDay}-${endDay} ${month} ${year}`
        }
      }

      return ''
    }

    // Formater le lieu
    const formatLocation = (event) => {
      const parts = []
      if (event.city) parts.push(event.city)
      if (event.country) {
        const countryName = locale.value === 'fr' ? event.country.name_fr : event.country.name_en
        parts.push(countryName)
      }
      return parts.join(', ')
    }

    // Obtenir la classe CSS pour la carte d'événement
    const getEventCardClass = (event) => {
      const status = getEventStatus(event)
      const classes = []

      if (status === 'ongoing') {
        classes.push('border-l-4 border-ifdd-bleu')
      } else if (status === 'upcoming') {
        classes.push('opacity-75 hover:opacity-100')
      } else {
        classes.push('opacity-50 hover:opacity-75')
      }

      return classes.join(' ')
    }

    // Obtenir la classe de couleur pour le statut
    const getEventStatusColorClass = (event) => {
      const status = getEventStatus(event)
      switch (status) {
        case 'ongoing':
          return 'text-green-600 dark:text-green-500'
        case 'upcoming':
          return 'text-blue-600 dark:text-blue-400'
        case 'completed':
          return 'text-red-600 dark:text-red-500'
        default:
          return 'text-gray-600 dark:text-gray-400'
      }
    }

    return {
      t,
      events,
      displayedEvents,
      loading,
      error,
      formatEventDateRange,
      formatLocation,
      getEventCardClass,
      getEventStatusColorClass,
      getEventStatus
    }
  }
}
</script>
