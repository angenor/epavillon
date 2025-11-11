<template>
  <div class="h-full max-h-full w-80 bg-black/50 backdrop-blur-md shadow-2xl flex flex-col pt-16">
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
    <div v-else class="flex-1 flex flex-col relative z-10 min-h-0">
      <div class="flex-1 overflow-y-auto px-3 py-2 space-y-6 min-h-0">
        <!-- Boucle sur les événements avec leurs activités (max 3) -->
        <div
          v-for="(event, index) in eventsWithActivities.slice(0, 3)"
          :key="event.id || index"
          class="relative"
        >
          <!-- Événement -->
          <div
            @click="handleEventClick(event)"
            class="block cursor-pointer"
          >
            <div class="text-white bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm rounded-xl px-4 py-2 hover:from-white/40 hover:to-white/30 transition-all duration-300 shadow-lg">
              <div class="font-bold text-xl mb-2">{{ event.title }}</div>
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
          </div>

          <!-- Activités associées -->
          <div v-if="event.filteredActivities.activities.length > 0" class="mt-3 ml-4">
            <!-- Label de période (Aujourd'hui ou Demain) -->
            <div class="mb-2 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-ifdd-bleu"></div>
                <span class="text-xs font-semibold text-white/90 uppercase tracking-wide">
                  {{ getPeriodLabel(event.filteredActivities.period, event.filteredActivities.activities) }}
                </span>
              </div>
              <button
                @click.stop="goToEventProgrammation(event)"
                class="text-xs text-ifdd-bleu hover:text-ifdd-bleu/80 font-medium transition-colors duration-200 cursor-pointer flex items-center gap-1 group"
              >
                <span>{{ t('activities.viewMore') || 'Voir plus' }}</span>
                <svg class="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>

            <!-- Liste des activités avec ligne verticale pointillée -->
            <div class="relative pl-6">
              <!-- Ligne verticale pointillée -->
              <div
                class="absolute left-0 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-white/40"
                style="margin-left: 0.25rem;"
              ></div>

              <!-- Activités -->
              <div class="space-y-3">
                <div
                  v-for="activity in event.filteredActivities.activities"
                  :key="activity.id"
                  class="relative cursor-pointer"
                  @click="handleActivityClick(activity, event)"
                >
                  <!-- Point de connexion -->
                  <div class="absolute -left-6 top-2 w-2 h-2 rounded-full bg-white border-2 border-ifdd-bleu"></div>

                  <!-- Contenu de l'activité -->
                  <div class="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-white/20 transition-all duration-200">
                    <div class="text-white font-medium text-sm mb-1 line-clamp-3">
                      {{ activity.title }}
                    </div>
                    <div class="flex items-center gap-2 text-xs text-white/80 mb-1">
                      <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span class="flex-shrink-0">{{ formatActivityTime(activity) }}</span>
                      <span class="opacity-60 flex-shrink-0">•</span>
                      <span class="flex-shrink-0">{{ formatActivityDate(activity) }}</span>
                    </div>
                    <div v-if="activity.organization?.name" class="text-xs text-white/70 truncate">
                      <span class="opacity-75">{{ activity.organization.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si aucune activité -->
        <div v-if="!eventsWithActivities || eventsWithActivities.length === 0" class="text-white text-center py-8 px-4">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-lg font-medium mb-2">{{ t('activities.noUpcoming') || 'Aucune activité à venir' }}</p>
          <p class="text-sm opacity-75">{{ t('activities.checkBackLater') || 'Revenez plus tard pour découvrir de nouvelles activités' }}</p>
        </div>

        <!-- Bouton Voir toutes les activités -->
        <div v-if="eventsWithActivities && eventsWithActivities.length > 0" class="pt-4 pb-2">
          <RouterLink :to="getProgrammationLink()" class="block w-full">
            <button class="w-full py-3 px-4 bg-gradient-to-t from-ifdd-bleu to-ifdd-bleu/80 hover:from-ifdd-bleu/90 hover:to-ifdd-bleu/70 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-[1.02]">
              {{ t('activities.viewAll') || 'Voir le tableau de programmation' }}
            </button>
          </RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { onMounted, ref, computed } from 'vue'
import { useActivities } from '@/composables/useActivities'
import { useRouter } from 'vue-router'

export default {
  name: 'UpcomingActivities',
  setup() {
    const { t, locale } = useI18n()
    const router = useRouter()
    const {
      events,
      trainings,
      loading,
      error,
      fetchAllUpcoming,
      fetchEventActivities,
      formatDate,
      formatTime,
      getEventStatus
    } = useActivities()

    const eventActivities = ref({}) // Stocke les activités par event_id

    // Charger les données au montage
    onMounted(async () => {
      await fetchAllUpcoming()
      // Récupérer les activités pour chaque événement
      for (const event of events.value) {
        eventActivities.value[event.id] = await fetchEventActivities(event.id)
      }
    })

    // Fonction pour filtrer les activités selon aujourd'hui ou demain
    const getFilteredActivities = (eventId) => {
      const activities = eventActivities.value[eventId] || []
      if (activities.length === 0) return { activities: [], period: null }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      // Filtrer les activités d'aujourd'hui
      const todayActivities = activities.filter(activity => {
        const startDate = new Date(activity.final_start_date || activity.proposed_start_date)
        return startDate >= today && startDate < tomorrow
      })

      // Vérifier si toutes les activités d'aujourd'hui sont déjà passées
      const hasUpcomingToday = todayActivities.some(activity => {
        const startDate = new Date(activity.final_start_date || activity.proposed_start_date)
        return startDate > now
      })

      // Si on a des activités aujourd'hui et qu'au moins une n'est pas encore passée
      if (hasUpcomingToday) {
        // Trier par date de début (plus proche en premier)
        const sortedToday = todayActivities.sort((a, b) => {
          const dateA = new Date(a.final_start_date || a.proposed_start_date)
          const dateB = new Date(b.final_start_date || b.proposed_start_date)
          return dateA - dateB
        })
        return { activities: sortedToday, period: 'today' }
      }

      // Sinon, afficher les activités de demain
      const tomorrowActivities = activities.filter(activity => {
        const startDate = new Date(activity.final_start_date || activity.proposed_start_date)
        return startDate >= tomorrow && startDate < dayAfterTomorrow
      })

      // Trier par date de début (plus proche en premier)
      const sortedTomorrow = tomorrowActivities.sort((a, b) => {
        const dateA = new Date(a.final_start_date || a.proposed_start_date)
        const dateB = new Date(b.final_start_date || b.proposed_start_date)
        return dateA - dateB
      })

      return { activities: sortedTomorrow, period: 'tomorrow' }
    }

    // Computed pour obtenir les événements avec leurs activités filtrées
    const eventsWithActivities = computed(() => {
      return events.value.map(event => ({
        ...event,
        filteredActivities: getFilteredActivities(event.id)
      }))
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

    // Gérer le clic sur un événement avec redirection conditionnelle
    const handleEventClick = (event) => {
      if (!event?.id) return

      // Utiliser directement le champ event_status de la base de données
      const status = event.event_status

      // Si l'événement est en cours ou terminé, rediriger vers la programmation
      if (status === 'ongoing' || status === 'completed') {
        router.push(`/programmations/${event.year}/${event.id}`)
      } else {
        // Sinon, rediriger vers la page de détail de l'événement
        router.push(`/events/${event.id}`)
      }
    }

    // Formater l'heure d'une activité
    const formatActivityTime = (activity) => {
      if (!activity) return ''
      const startDate = activity.final_start_date || activity.proposed_start_date
      if (!startDate) return ''
      return formatTime(startDate)
    }

    // Formater la date d'une activité
    const formatActivityDate = (activity) => {
      if (!activity) return ''
      const startDate = activity.final_start_date || activity.proposed_start_date
      if (!startDate) return ''
      return formatDate(startDate)
    }

    // Obtenir le label de période (Aujourd'hui ou Demain)
    const getPeriodLabel = (period, activities = []) => {
      if (!period) return ''

      let label = ''
      if (period === 'today') {
        label = t('activities.today') || "Aujourd'hui"
      } else if (period === 'tomorrow') {
        label = t('activities.tomorrow') || 'Demain'
      } else {
        return ''
      }

      // Ajouter la date pour "Demain"
      if (period === 'tomorrow' && activities.length > 0) {
        const firstActivity = activities[0]
        const startDate = firstActivity.final_start_date || firstActivity.proposed_start_date
        if (startDate) {
          const date = new Date(startDate)
          const day = date.getDate()
          const month = date.toLocaleDateString('fr-FR', { month: 'long' })
          // Mettre la première lettre du mois en majuscule
          const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1)
          label += ` • ${day} ${monthCapitalized}`
        }
      }

      return label
    }

    // Gérer le clic sur une activité
    const handleActivityClick = (activity, event) => {
      if (!activity?.id) return

      // Rediriger vers la page de détail de l'activité
      router.push(`/activities/${activity.id}`)
    }

    // Rediriger vers la programmation d'un événement spécifique
    const goToEventProgrammation = (event) => {
      if (!event?.id || !event?.year) return
      router.push(`/programmations/${event.year}/${event.id}`)
    }

    // Obtenir le lien vers la programmation
    const getProgrammationLink = () => {
      // Chercher le premier événement qui a des activités affichées
      const eventWithActivities = eventsWithActivities.value.find(
        event => event.filteredActivities.activities.length > 0
      )

      // Si un événement avec des activités est trouvé, rediriger vers sa programmation
      if (eventWithActivities && eventWithActivities.year && eventWithActivities.id) {
        return `/programmations/${eventWithActivities.year}/${eventWithActivities.id}`
      }

      // Sinon, rediriger vers le premier événement ou la liste des programmations
      if (events.value.length > 0) {
        const firstEvent = events.value[0]
        if (firstEvent.year && firstEvent.id) {
          return `/programmations/${firstEvent.year}/${firstEvent.id}`
        }
      }

      // Par défaut, rediriger vers la liste des programmations
      return '/programmations'
    }

    return {
      t,
      events,
      trainings,
      loading,
      error,
      eventsWithActivities,
      formatEventDate,
      formatDate,
      formatActivityTime,
      formatActivityDate,
      getPeriodLabel,
      getCountryName,
      getEventStatus,
      getEventStatusClass,
      getCategoryLabel,
      getTrainingDuration,
      handleEventClick,
      handleActivityClick,
      goToEventProgrammation,
      getProgrammationLink
    }
  }
}
</script>
