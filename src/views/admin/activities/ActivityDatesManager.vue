<template>
  <div class="activity-dates-manager min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <!-- Header avec actions -->
    <div class="max-w-7xl mx-auto mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('activityDatesManager.title') }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ t('activityDatesManager.subtitle') }}
            </p>
          </div>

          <div class="flex items-center space-x-3">
            <!-- Indicateur de modifications -->
            <div v-if="hasUnsavedChanges" class="flex items-center space-x-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <span class="text-sm font-medium text-orange-600 dark:text-orange-400">
                {{ pendingChanges.length }} {{ t('activityDatesManager.unsavedChanges') }}
              </span>
            </div>

            <!-- Bouton Sauvegarder les modifications -->
            <button
              @click="saveAllChanges"
              :disabled="!hasUnsavedChanges || isSaving"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <div v-if="isSaving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
              </svg>
              {{ isSaving ? t('activityDatesManager.saving') : t('activityDatesManager.saveChanges') }}
            </button>

            <!-- Bouton Retour -->
            <router-link
              to="/admin/activities"
              class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              {{ t('common.back') }}
            </router-link>
          </div>
        </div>

        <!-- Filtres et légendes -->
        <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <div class="flex items-center space-x-4">
            <!-- Filtre par événement -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('activityDatesManager.filterByEvent') }}
              </label>
              <select
                v-model="selectedEventId"
                @change="loadActivities"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="">{{ t('activityDatesManager.allEvents') }}</option>
                <option v-for="event in events" :key="event.id" :value="event.id">
                  {{ event.title }} - {{ event.year }}
                </option>
              </select>
            </div>

            <!-- Filtre par statut -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('activityDatesManager.filterByStatus') }}
              </label>
              <select
                v-model="selectedStatus"
                @change="loadActivities"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="">{{ t('activityDatesManager.allStatuses') }}</option>
                <option value="submitted">{{ t('activityDatesManager.statuses.submitted') }}</option>
                <option value="under_review">{{ t('activityDatesManager.statuses.under_review') }}</option>
                <option value="approved">{{ t('activityDatesManager.statuses.approved') }}</option>
              </select>
            </div>

            <!-- Indicateur de fuseau horaire -->
            <div v-if="activities.length > 0" class="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg" :title="t('activityDatesManager.timezoneInfo')">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-xs font-medium text-blue-600 dark:text-blue-400">
                {{ timezoneLabel }}
              </span>
            </div>
          </div>

          <!-- Légende -->
          <div class="flex items-center space-x-4 text-xs">
            <div class="flex items-center space-x-1">
              <div class="w-4 h-4 bg-blue-500 rounded"></div>
              <span class="text-gray-600 dark:text-gray-400">{{ t('activityDatesManager.legend.sideEvent') }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <div class="w-4 h-4 bg-green-500 rounded"></div>
              <span class="text-gray-600 dark:text-gray-400">{{ t('activityDatesManager.legend.countryDay') }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <div class="w-4 h-4 bg-orange-500 rounded"></div>
              <span class="text-gray-600 dark:text-gray-400">{{ t('activityDatesManager.legend.modified') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendrier -->
    <div class="max-w-7xl mx-auto">
      <div v-if="isLoading" class="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}</p>
        </div>
      </div>

      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden" style="height: 700px;">
        <vue-cal
          :events="calendarEvents"
          :time-from="8 * 60"
          :time-to="20 * 60"
          :disable-views="['years', 'year']"
          default-view="week"
          :editable-events="{
            title: false,
            drag: true,
            resize: true,
            delete: false,
            create: false
          }"
          :snap-to-time="15"
          :time-cell-height="60"
          :locale="currentLocale"
          @event-drag-create="handleEventDragCreate"
          @event-drop="handleEventDrop"
          @event-duration-change="handleEventDurationChange"
          @cell-click="handleCellClick"
        >
          <!-- Template personnalisé pour les événements -->
          <template #event="{ event, view }">
            <div class="p-2 h-full overflow-hidden">
              <div class="flex items-start space-x-2">
                <!-- Logo de l'organisation -->
                <img
                  v-if="event.organization?.logo_url"
                  :src="event.organization.logo_url"
                  :alt="event.organization.name"
                  class="w-8 h-8 rounded object-contain bg-white flex-shrink-0"
                />
                <div v-else class="w-8 h-8 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {{ event.organization?.name?.[0]?.toUpperCase() }}
                  </span>
                </div>

                <!-- Informations de l'activité -->
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm truncate" :class="getEventTextClass(event)">
                    {{ event.title }}
                  </p>
                  <p class="text-xs opacity-90 truncate" :class="getEventTextClass(event)">
                    {{ event.organization?.name }}
                  </p>
                  <p class="text-xs opacity-75 mt-1" :class="getEventTextClass(event)">
                    {{ formatEventTime(event.start, event.end) }}
                  </p>
                </div>
              </div>

              <!-- Indicateur de modification -->
              <div v-if="isEventModified(event.activityId)" class="absolute top-1 right-1">
                <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
            </div>
          </template>
        </vue-cal>
      </div>
    </div>

    <!-- Messages de feedback -->
    <div v-if="successMessage" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { VueCal } from 'vue-cal'
import 'vue-cal/style.css'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'
import { useTimezone } from '@/composables/useTimezone'

const { t, locale } = useI18n()
const { supabase } = useSupabase()
const { currentUser } = useAuth()
const { formatDateTimeWithTimezone, getTimezoneLabel } = useTimezone()

// État
const isLoading = ref(true)
const isSaving = ref(false)
const activities = ref([])
const events = ref([])
const selectedEventId = ref('')
const selectedStatus = ref('')
const pendingChanges = ref([])
const successMessage = ref('')
const errorMessage = ref('')

// Locale pour vue-cal
const currentLocale = computed(() => locale.value)

// Vérifier s'il y a des modifications non sauvegardées
const hasUnsavedChanges = computed(() => pendingChanges.value.length > 0)

// Obtenir le fuseau horaire de l'événement sélectionné
const currentTimezone = computed(() => {
  if (selectedEventId.value) {
    const event = events.value.find(e => e.id === selectedEventId.value)
    return event?.timezone || 'UTC'
  }
  // Si aucun événement n'est sélectionné, on utilise le fuseau horaire de la première activité
  if (activities.value.length > 0) {
    return activities.value[0]?.event?.timezone || 'UTC'
  }
  return 'UTC'
})

// Obtenir le label du fuseau horaire pour l'affichage
const timezoneLabel = computed(() => {
  const tz = currentTimezone.value
  if (!tz || tz === 'UTC') return 'UTC'

  // Obtenir l'abréviation du fuseau horaire
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short'
    })
    const parts = formatter.formatToParts(new Date())
    const timeZonePart = parts.find(part => part.type === 'timeZoneName')
    return timeZonePart ? `${tz} (${timeZonePart.value})` : tz
  } catch {
    return tz
  }
})

// Convertir une date UTC en date "locale" pour un fuseau horaire donné
// Cette fonction crée un nouvel objet Date où les composants (année, mois, jour, heure, etc.)
// correspondent à ce qu'ils seraient dans le fuseau horaire cible, mais interprétés comme heure locale
const convertUTCToTimezone = (utcDate, timezone) => {
  if (!timezone || timezone === 'UTC') return new Date(utcDate)

  try {
    // Obtenir les composants de la date dans le fuseau horaire cible
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(new Date(utcDate))
    const values = {}
    parts.forEach(part => {
      if (part.type !== 'literal') {
        values[part.type] = part.value
      }
    })

    // Créer une nouvelle date avec ces composants en tant qu'heure locale
    // Format: YYYY-MM-DDTHH:mm:ss (interprété comme heure locale du navigateur)
    const localDateString = `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`
    return new Date(localDateString)
  } catch (error) {
    console.error('Error converting UTC to timezone:', error)
    return new Date(utcDate)
  }
}

// Convertir une date "locale" (affichée dans le calendrier) en UTC
// Cette fonction fait l'inverse de convertUTCToTimezone
const convertTimezoneToUTC = (localDate, timezone) => {
  if (!timezone || timezone === 'UTC') return new Date(localDate)

  try {
    // Extraire les composants de la date locale
    const year = localDate.getFullYear()
    const month = String(localDate.getMonth() + 1).padStart(2, '0')
    const day = String(localDate.getDate()).padStart(2, '0')
    const hour = String(localDate.getHours()).padStart(2, '0')
    const minute = String(localDate.getMinutes()).padStart(2, '0')
    const second = String(localDate.getSeconds()).padStart(2, '0')

    // Créer une string ISO dans le fuseau horaire cible
    const dateString = `${year}-${month}-${day}T${hour}:${minute}:${second}`

    // Obtenir le décalage en millisecondes et l'appliquer
    const offset = getTimezoneOffset(timezone, new Date(dateString))
    return new Date(new Date(dateString).getTime() - offset)
  } catch (error) {
    console.error('Error converting timezone to UTC:', error)
    return new Date(localDate)
  }
}

// Obtenir le décalage en millisecondes d'un fuseau horaire par rapport à UTC
const getTimezoneOffset = (timezone, date) => {
  try {
    // Obtenir la date en UTC
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    // Obtenir la même date dans le fuseau horaire cible
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    // La différence donne le décalage
    return utcDate.getTime() - tzDate.getTime()
  } catch {
    return 0
  }
}

// Convertir les activités en événements pour vue-cal
const calendarEvents = computed(() => {
  return activities.value.map(activity => {
    const change = pendingChanges.value.find(c => c.activityId === activity.id)
    const startDate = change?.newStart || activity.proposed_start_date
    const endDate = change?.newEnd || activity.proposed_end_date
    const timezone = activity.event?.timezone || 'UTC'

    // Convertir les dates UTC en dates dans le fuseau horaire de l'événement
    // pour que la position dans le calendrier corresponde aux heures affichées
    let start = convertUTCToTimezone(startDate, timezone)
    let end = convertUTCToTimezone(endDate, timezone)

    // Vérifier que les dates sont valides
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn(`Invalid dates for activity ${activity.id}:`, { startDate, endDate })
      return null
    }

    // Vérifier que la date de fin est après la date de début
    if (end <= start) {
      console.warn(`End date before start date for activity ${activity.id}:`, { start, end })
      // Ajuster la date de fin pour qu'elle soit au moins 30 minutes après le début
      end = new Date(start.getTime() + 30 * 60 * 1000)
    }

    return {
      activityId: activity.id,
      start,
      end,
      title: activity.title,
      organization: activity.organization,
      activityType: activity.activity_type,
      eventTimezone: timezone,
      class: getEventClass(activity, !!change),
      deletable: false,
      resizable: true,
      draggable: true
    }
  }).filter(event => event !== null) // Filtrer les événements invalides
})

// Charger les événements
const loadEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, year, timezone')
      .order('year', { ascending: false })

    if (error) throw error
    events.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des événements:', error)
    showError(t('activityDatesManager.errors.loadEvents'))
  }
}

// Charger les activités
const loadActivities = async () => {
  isLoading.value = true
  try {
    let query = supabase
      .from('activities')
      .select(`
        *,
        organization:organizations(id, name, logo_url),
        event:events(id, title, year, timezone)
      `)
      .order('proposed_start_date')

    // Filtrer par événement si sélectionné
    if (selectedEventId.value) {
      query = query.eq('event_id', selectedEventId.value)
    }

    // Filtrer par statut si sélectionné
    if (selectedStatus.value) {
      query = query.eq('validation_status', selectedStatus.value)
    }

    const { data, error } = await query

    if (error) throw error
    activities.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error)
    showError(t('activityDatesManager.errors.loadActivities'))
  } finally {
    isLoading.value = false
  }
}

// Obtenir la classe CSS pour l'événement
const getEventClass = (activity, isModified) => {
  let baseClass = 'activity-event'

  if (isModified) {
    return `${baseClass} activity-modified`
  }

  switch (activity.activity_type) {
    case 'side_event':
      return `${baseClass} activity-side-event`
    case 'country_day':
      return `${baseClass} activity-country-day`
    default:
      return `${baseClass} activity-other`
  }
}

// Obtenir la classe de texte pour l'événement
const getEventTextClass = (event) => {
  return 'text-white'
}

// Vérifier si un événement a été modifié
const isEventModified = (activityId) => {
  return pendingChanges.value.some(c => c.activityId === activityId)
}

// Formater l'heure de l'événement
const formatEventTime = (start, end) => {
  // Les dates sont déjà converties dans le fuseau horaire de l'événement
  // On peut donc simplement afficher les heures sans conversion supplémentaire
  const startTime = start.toLocaleTimeString(currentLocale.value, {
    hour: '2-digit',
    minute: '2-digit'
  })

  const endTime = end.toLocaleTimeString(currentLocale.value, {
    hour: '2-digit',
    minute: '2-digit'
  })

  return `${startTime} - ${endTime}`
}

// Gérer le déplacement d'un événement
const handleEventDrop = (event, deleteEventFunction) => {
  const activity = activities.value.find(a => a.id === event.activityId)
  if (!activity) return

  const timezone = activity.event?.timezone || 'UTC'

  // Calculer la durée originale
  const originalStart = new Date(activity.proposed_start_date)
  const originalEnd = new Date(activity.proposed_end_date)
  const duration = originalEnd.getTime() - originalStart.getTime()

  // Nouvelle fin = nouveau début + durée (dans le fuseau horaire de l'événement)
  const newEnd = new Date(event.start.getTime() + duration)

  // Convertir les dates du fuseau horaire de l'événement vers UTC pour la sauvegarde
  const newStartUTC = convertTimezoneToUTC(event.start, timezone)
  const newEndUTC = convertTimezoneToUTC(newEnd, timezone)

  // Enregistrer le changement en UTC
  recordChange(event.activityId, newStartUTC, newEndUTC, activity)

  showSuccess(t('activityDatesManager.messages.eventMoved'))
}

// Gérer le redimensionnement d'un événement
const handleEventDurationChange = ({ event, originalEvent }) => {
  const activity = activities.value.find(a => a.id === event.activityId)
  if (!activity) return

  const timezone = activity.event?.timezone || 'UTC'

  // Convertir les dates du fuseau horaire de l'événement vers UTC pour la sauvegarde
  const newStartUTC = convertTimezoneToUTC(event.start, timezone)
  const newEndUTC = convertTimezoneToUTC(event.end, timezone)

  // Enregistrer le changement en UTC
  recordChange(event.activityId, newStartUTC, newEndUTC, activity)

  showSuccess(t('activityDatesManager.messages.eventResized'))
}

// Empêcher la création d'événements
const handleEventDragCreate = (event, deleteEventFunction) => {
  deleteEventFunction()
}

// Empêcher le clic sur les cellules
const handleCellClick = () => {
  // Ne rien faire
}

// Enregistrer un changement
const recordChange = (activityId, newStart, newEnd, activity) => {
  // Vérifier si un changement existe déjà pour cette activité
  const existingChangeIndex = pendingChanges.value.findIndex(c => c.activityId === activityId)

  const change = {
    activityId,
    oldStart: activity.proposed_start_date,
    oldEnd: activity.proposed_end_date,
    newStart: newStart.toISOString(),
    newEnd: newEnd.toISOString()
  }

  if (existingChangeIndex >= 0) {
    // Mettre à jour le changement existant
    pendingChanges.value[existingChangeIndex] = change
  } else {
    // Ajouter un nouveau changement
    pendingChanges.value.push(change)
  }
}

// Sauvegarder toutes les modifications
const saveAllChanges = async () => {
  if (!hasUnsavedChanges.value || !currentUser.value) return

  isSaving.value = true
  try {
    for (const change of pendingChanges.value) {
      // 1. Mettre à jour les dates dans la table activities
      const { error: updateError } = await supabase
        .from('activities')
        .update({
          proposed_start_date: change.newStart,
          proposed_end_date: change.newEnd,
          updated_at: new Date().toISOString()
        })
        .eq('id', change.activityId)

      if (updateError) throw updateError

      // 2. Enregistrer les modifications dans activity_modifications
      // Modification de la date de début
      const { error: startModError } = await supabase
        .from('activity_modifications')
        .insert({
          activity_id: change.activityId,
          field_name: 'proposed_start_date',
          old_value: { value: change.oldStart },
          new_value: { value: change.newStart },
          old_value_type: 'date',
          new_value_type: 'date',
          modified_by: currentUser.value.id,
          modified_at: new Date().toISOString()
        })

      if (startModError) throw startModError

      // Modification de la date de fin
      const { error: endModError } = await supabase
        .from('activity_modifications')
        .insert({
          activity_id: change.activityId,
          field_name: 'proposed_end_date',
          old_value: { value: change.oldEnd },
          new_value: { value: change.newEnd },
          old_value_type: 'date',
          new_value_type: 'date',
          modified_by: currentUser.value.id,
          modified_at: new Date().toISOString()
        })

      if (endModError) throw endModError

      // Mettre à jour l'activité locale
      const activity = activities.value.find(a => a.id === change.activityId)
      if (activity) {
        activity.proposed_start_date = change.newStart
        activity.proposed_end_date = change.newEnd
      }
    }

    // Vider les changements en attente
    pendingChanges.value = []

    showSuccess(t('activityDatesManager.messages.changesSaved'))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des modifications:', error)
    showError(t('activityDatesManager.errors.saveChanges'))
  } finally {
    isSaving.value = false
  }
}

// Afficher un message de succès
const showSuccess = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Afficher un message d'erreur
const showError = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// Monter le composant
onMounted(async () => {
  await loadEvents()
  await loadActivities()
})

// Surveiller les changements de locale
watch(locale, () => {
  // Recharger le calendrier si nécessaire
})
</script>

<style scoped>
/* Styles personnalisés pour vue-cal */
:deep(.vuecal) {
  height: 100%;
  border-radius: 0.5rem;
}

/* Mode sombre pour vue-cal */
.dark :deep(.vuecal__cell) {
  background-color: rgb(55 65 81);
  border-color: rgb(75 85 99);
}

.dark :deep(.vuecal__title-bar) {
  background-color: rgb(31 41 55);
  color: white;
}

.dark :deep(.vuecal__heading) {
  color: white;
}

.dark :deep(.vuecal__time-cell) {
  color: rgb(209 213 219);
  border-color: rgb(75 85 99);
}

:deep(.vuecal__now-line) {
  border-color: rgb(249 115 22);
}

/* Classes pour les événements */
:deep(.activity-event) {
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-width: 2px;
  cursor: move;
  transition: all 0.2s ease;
}

:deep(.activity-event:hover) {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transform: scale(1.05);
}

:deep(.activity-side-event) {
  background-color: rgb(59 130 246);
  border-color: rgb(37 99 235);
  color: white;
}

:deep(.activity-country-day) {
  background-color: rgb(34 197 94);
  border-color: rgb(22 163 74);
  color: white;
}

:deep(.activity-other) {
  background-color: rgb(107 114 128);
  border-color: rgb(75 85 99);
  color: white;
}

:deep(.activity-modified) {
  background-color: rgb(249 115 22);
  border-color: rgb(234 88 12);
  color: white;
}

:deep(.vuecal__event) {
  overflow: visible;
}

:deep(.vuecal__event-resize-handle) {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Mode sombre pour vue-cal */
.dark :deep(.vuecal__menu),
.dark :deep(.vuecal__cell-events-count) {
  background-color: rgb(55 65 81);
  color: white;
}

.dark :deep(.vuecal__arrow) {
  color: white;
}

.dark :deep(.vuecal__flex[class*="weekday-"]) {
  border-color: rgb(75 85 99);
}
</style>
