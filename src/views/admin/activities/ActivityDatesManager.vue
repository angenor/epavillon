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
          ref="vuecalRef"
          :events="calendarEvents"
          :time-from="6 * 60"
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
          :time-cell-height="120"
          :locale="currentLocale"
          @event-drag-create="handleEventDragCreate"
          @event-drop="handleEventDrop"
          @event-duration-change="handleEventDurationChange"
          @cell-click="handleCellClick"
        >
          <!-- Template personnalisé pour les événements -->
          <template #event="{ event, view }">
            <div class="px-2 h-full overflow-hidden" style="pointer-events: none;">
              <!-- Logo de l'organisation -->
                <img
                  v-if="event.organization?.logo_url"
                  :src="event.organization.logo_url"
                  :alt="event.organization.name"
                  class="w-8 h-8 rounded object-contain bg-white flex-shrink-0 mx-auto"
                />
                <div v-else class="w-8 h-8 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0  mx-auto">
                  <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {{ event.organization?.name?.[0]?.toUpperCase() }}
                  </span>
                </div>
              <div class="flex items-start space-x-2">
                <!-- Informations de l'activité -->
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm line-clamp-2" :class="getEventTextClass(event)">
                    {{ event.title }}
                  </p>
                  <p class="text-xs opacity-90 truncate" :class="getEventTextClass(event)">
                    {{ event.organization?.name }}
                  </p>
                  <p class="text-xs opacity-75 mt-1 text-center" :class="getEventTextClass(event)">
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

// Obtenir le décalage horaire entre le navigateur et un fuseau horaire donné
const getTimezoneOffset = (timezone, date = new Date()) => {
  try {
    // Créer une date dans le fuseau horaire cible
    const tzString = date.toLocaleString('en-US', { timeZone: timezone })
    const tzDate = new Date(tzString)

    // Créer la même date en UTC
    const utcString = date.toLocaleString('en-US', { timeZone: 'UTC' })
    const utcDate = new Date(utcString)

    // La différence donne le décalage en millisecondes
    return tzDate.getTime() - utcDate.getTime()
  } catch (error) {
    console.error('Error calculating timezone offset:', error)
    return 0
  }
}

// Convertir les activités en événements pour vue-cal
const calendarEvents = computed(() => {
  const events = activities.value.map(activity => {
    const change = pendingChanges.value.find(c => c.activityId === activity.id)
    const startDate = change?.newStart || activity.proposed_start_date
    const endDate = change?.newEnd || activity.proposed_end_date
    const timezone = activity.event?.timezone || 'UTC'

    // Dates en UTC depuis la base de données
    const startUTC = new Date(startDate)
    const endUTC = new Date(endDate)

    // Calculer le décalage entre le fuseau horaire du navigateur et celui de l'événement
    const browserOffset = new Date().getTimezoneOffset() * 60 * 1000 // En millisecondes
    const eventOffset = getTimezoneOffset(timezone, startUTC)

    // Décaler les dates pour que Vue Cal les affiche dans le fuseau horaire de l'événement
    // Formule : dateAffichée = dateUTC - offsetNavigateur + offsetEvent
    const totalOffset = -browserOffset + eventOffset

    const start = new Date(startUTC.getTime() + totalOffset)
    const end = new Date(endUTC.getTime() + totalOffset)

    // Vérifier que les dates sont valides
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn(`Invalid dates for activity ${activity.id}:`, { startDate, endDate })
      return null
    }

    // Vérifier que la date de fin est après la date de début
    if (end <= start) {
      console.warn(`End date before start date for activity ${activity.id}:`, { start, end })
      return null
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

  if (events.length > 0) {
    console.log('Événements chargés:', events.length)
    console.log('Premier événement - Start local:', events[0].start)
    console.log('Timezone:', events[0].eventTimezone)
  }

  return events
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
  // Les dates sont déjà décalées pour s'afficher dans le fuseau horaire de l'événement
  // On peut simplement les formater sans conversion supplémentaire
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
const handleEventDrop = async (eventData) => {
  console.log('handleEventDrop appelé - données complètes:', eventData)

  const droppedEvent = eventData.event
  if (!droppedEvent) {
    console.error('Pas d\'événement dans les données')
    return
  }

  const activity = activities.value.find(a => a.id === droppedEvent.activityId)
  if (!activity) {
    console.warn('Activité non trouvée:', droppedEvent.activityId)
    return
  }

  const timezone = activity.event?.timezone || 'UTC'

  // Calculer la durée originale
  const originalStart = new Date(activity.proposed_start_date)
  const originalEnd = new Date(activity.proposed_end_date)
  const duration = originalEnd.getTime() - originalStart.getTime()

  // Les dates retournées par Vue Cal sont décalées pour l'affichage
  // Il faut faire la conversion inverse pour revenir en UTC
  const browserOffset = new Date().getTimezoneOffset() * 60 * 1000
  const eventOffset = getTimezoneOffset(timezone, droppedEvent.start)
  const totalOffset = -browserOffset + eventOffset

  // Convertir vers UTC
  const newStartUTC = new Date(droppedEvent.start.getTime() - totalOffset)
  const newEndUTC = new Date(newStartUTC.getTime() + duration)

  console.log('Nouvelles dates (UTC):', {
    newStartUTC: newStartUTC.toISOString(),
    newEndUTC: newEndUTC.toISOString(),
    timezone
  })

  // Enregistrer le changement pour la table activity_modifications (manuel)
  recordChange(droppedEvent.activityId, newStartUTC, newEndUTC, activity)

  // Sauvegarder automatiquement dans la table activities
  await updateActivityDates(droppedEvent.activityId, newStartUTC, newEndUTC, activity)

  showSuccess(t('activityDatesManager.messages.eventMoved'))
}

// Gérer le redimensionnement d'un événement
const handleEventDurationChange = async ({ event }) => {
  console.log('handleEventDurationChange appelé:', event)
  const activity = activities.value.find(a => a.id === event.activityId)
  if (!activity) {
    console.warn('Activité non trouvée:', event.activityId)
    return
  }

  const timezone = activity.event?.timezone || 'UTC'

  // Les dates retournées par Vue Cal sont décalées pour l'affichage
  // Il faut faire la conversion inverse pour revenir en UTC
  const browserOffset = new Date().getTimezoneOffset() * 60 * 1000
  const eventOffset = getTimezoneOffset(timezone, event.start)
  const totalOffset = -browserOffset + eventOffset

  // Convertir vers UTC
  const newStartUTC = new Date(event.start.getTime() - totalOffset)
  const newEndUTC = new Date(event.end.getTime() - totalOffset)

  console.log('Nouvelles dates après redimensionnement (UTC):', {
    newStartUTC: newStartUTC.toISOString(),
    newEndUTC: newEndUTC.toISOString(),
    timezone
  })

  // Enregistrer le changement pour la table activity_modifications (manuel)
  recordChange(event.activityId, newStartUTC, newEndUTC, activity)

  // Sauvegarder automatiquement dans la table activities
  await updateActivityDates(event.activityId, newStartUTC, newEndUTC, activity)

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

// Sauvegarder automatiquement les dates dans la table activities
const updateActivityDates = async (activityId, newStart, newEnd, activity) => {
  try {
    // Mettre à jour les dates dans la table activities
    const { error } = await supabase
      .from('activities')
      .update({
        proposed_start_date: newStart.toISOString(),
        proposed_end_date: newEnd.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', activityId)

    if (error) throw error

    // Mettre à jour l'activité locale
    activity.proposed_start_date = newStart.toISOString()
    activity.proposed_end_date = newEnd.toISOString()

    console.log('Dates sauvegardées automatiquement pour l\'activité:', activityId)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde automatique:', error)
    showError(t('activityDatesManager.errors.autoSave'))
  }
}

// Enregistrer un changement pour la sauvegarde manuelle dans activity_modifications
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

// Sauvegarder toutes les modifications dans activity_modifications
// Note: Les dates dans activities sont déjà sauvegardées automatiquement lors du déplacement/redimensionnement
const saveAllChanges = async () => {
  if (!hasUnsavedChanges.value || !currentUser.value) return

  isSaving.value = true
  try {
    for (const change of pendingChanges.value) {
      // Enregistrer les modifications dans activity_modifications
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
  if (vuecalRef.value) {
    vuecalRef.value.switchView('week', new Date('2025-11-10'))
  }
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
