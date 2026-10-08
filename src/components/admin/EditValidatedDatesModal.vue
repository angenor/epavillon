<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
      <div class="fixed inset-0 bg-gray-500/75 transition-opacity" @click="close"></div>

      <div class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-2xl w-full mx-4 z-10">
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-orange-200 dark:border-orange-700">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Modifier les dates et heures validées
            </h3>
            <button @click="close"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="bg-white dark:bg-gray-800 px-6 py-4">
          <!-- Message d'erreur -->
          <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ error }}
            <button @click="error = null" class="ml-2 text-red-900 hover:text-red-700 cursor-pointer">
              <svg class="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Dates proposées (lecture seule) -->
          <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <svg class="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Dates proposées par le soumissionnaire
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">Début proposé</label>
                <input type="datetime-local"
                       :value="formatDateTimeForInput(proposedStartDate, timezone)"
                       disabled
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed text-sm">
              </div>
              <div>
                <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">Fin proposée</label>
                <input type="datetime-local"
                       :value="formatDateTimeForInput(proposedEndDate, timezone)"
                       disabled
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed text-sm">
              </div>
            </div>
          </div>

          <!-- Dates validées (éditable) -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <svg class="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Dates et heures confirmées
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('admin.activities.validatedDates.startDate') }} *
                </label>
                <input type="date"
                       v-model="formData.startDate"
                       @input="autoFillEnd"
                       :disabled="isLoading"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('admin.activities.validatedDates.startTime') }} *
                </label>
                <input type="time"
                       v-model="formData.startTime"
                       @input="autoFillEnd"
                       :disabled="isLoading"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('admin.activities.validatedDates.endDate') }} *
                </label>
                <input type="date"
                       v-model="formData.endDate"
                       :disabled="isLoading"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('admin.activities.validatedDates.endTime') }} *
                </label>
                <input type="time"
                       v-model="formData.endTime"
                       :disabled="isLoading"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
              </div>
            </div>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {{ t('admin.activities.validatedDates.autoEndHint') }}
            </p>
          </div>

          <!-- Actions rapides -->
          <div class="mb-4">
            <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Actions rapides</label>
            <div class="flex flex-wrap gap-2">
              <button @click="copyProposedDates"
                      :disabled="isLoading"
                      class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                Copier les dates proposées
              </button>
              <button @click="clearDates"
                      :disabled="isLoading"
                      class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Effacer les dates
              </button>
            </div>
          </div>

          <!-- Information sur le fuseau horaire -->
          <div v-if="timezone" class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p class="text-sm font-medium text-blue-800 dark:text-blue-300">Fuseau horaire</p>
                <p class="text-xs text-blue-600 dark:text-blue-400">{{ timezone }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-row-reverse space-x-3 space-x-reverse">
          <button @click="handleSave"
                  :disabled="isLoading || !isFormValid"
                  class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <svg v-else class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
          <button @click="close"
                  :disabled="isLoading"
                  class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityModifications } from '@/composables/useActivityModifications'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  activityId: {
    type: String,
    required: true
  },
  proposedStartDate: {
    type: String,
    default: null
  },
  proposedEndDate: {
    type: String,
    default: null
  },
  currentFinalStartDate: {
    type: String,
    default: null
  },
  currentFinalEndDate: {
    type: String,
    default: null
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  // Date de début de l'événement (DATE "YYYY-MM-DD" ou timestamp ISO)
  eventStartDate: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'update'])

const { t } = useI18n()
const { updateValidatedDates, isLoading } = useActivityModifications()
const error = ref(null)

const formData = ref({
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: ''
})

// Valeurs au format datetime-local (YYYY-MM-DDTHH:mm), dans le fuseau de l'événement
const finalStartLocal = computed(() =>
  formData.value.startDate && formData.value.startTime ? `${formData.value.startDate}T${formData.value.startTime}` : null
)
const finalEndLocal = computed(() =>
  formData.value.endDate && formData.value.endTime ? `${formData.value.endDate}T${formData.value.endTime}` : null
)

// Répartir une date GMT dans les champs date/heure d'un côté (start ou end)
const setFields = (side, dateString) => {
  const [date = '', time = ''] = formatDateTimeForInput(dateString, props.timezone).split('T')
  formData.value[`${side}Date`] = date
  formData.value[`${side}Time`] = time
}

// Date de début de l'événement, dans son fuseau horaire
const getEventStartDay = () => {
  if (!props.eventStartDate) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(props.eventStartDate)) return props.eventStartDate
  return formatDateTimeForInput(props.eventStartDate, props.timezone).split('T')[0]
}

// Initialiser les données du formulaire quand le modal s'ouvre
watch(() => props.show, (newValue) => {
  if (newValue) {
    setFields('start', props.currentFinalStartDate)
    setFields('end', props.currentFinalEndDate)
    // Par défaut, présélectionner la date de début de l'événement
    if (!formData.value.startDate) formData.value.startDate = getEventStartDay()
    error.value = null
  }
})

// Quand le début change, la fin = début + 1 h (même date, sauf passage à minuit)
const autoFillEnd = () => {
  if (!finalStartLocal.value) return
  const [year, month, day] = formData.value.startDate.split('-').map(Number)
  const [hour, minute] = formData.value.startTime.split(':').map(Number)
  const end = new Date(Date.UTC(year, month - 1, day, hour + 1, minute)).toISOString()
  formData.value.endDate = end.slice(0, 10)
  formData.value.endTime = end.slice(11, 16)
}

// Validation du formulaire
const isFormValid = computed(() => {
  return finalStartLocal.value && finalEndLocal.value
})

/**
 * Formater une date GMT pour l'input datetime-local dans le fuseau horaire de l'événement
 * @param {string} dateString - Date en GMT (ISO string)
 * @param {string} timezone - Fuseau horaire de l'événement (ex: 'Africa/Casablanca')
 * @returns {string} - Date formatée pour datetime-local (YYYY-MM-DDTHH:mm)
 */
const formatDateTimeForInput = (dateString, timezone = 'UTC') => {
  if (!dateString) return ''

  try {
    // Créer une date à partir de la chaîne GMT
    const date = new Date(dateString)

    // Convertir la date dans le fuseau horaire de l'événement
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(date)
    const year = parts.find(p => p.type === 'year').value
    const month = parts.find(p => p.type === 'month').value
    const day = parts.find(p => p.type === 'day').value
    const hour = parts.find(p => p.type === 'hour').value
    const minute = parts.find(p => p.type === 'minute').value

    return `${year}-${month}-${day}T${hour}:${minute}`
  } catch (err) {
    console.error('Erreur lors du formatage de la date:', err)
    return ''
  }
}

/**
 * Convertir une date saisie dans le fuseau horaire de l'événement vers GMT
 * @param {string} localDateString - Date locale au format datetime-local (YYYY-MM-DDTHH:mm)
 * @param {string} timezone - Fuseau horaire de l'événement
 * @returns {string} - Date en GMT (ISO string)
 */
const convertLocalToGMT = (localDateString, timezone = 'UTC') => {
  if (!localDateString) return null

  try {
    // Parser la date locale
    const [datePart, timePart] = localDateString.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)

    // Créer une date UTC temporaire avec ces valeurs pour calculer l'offset
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))

    // Obtenir la représentation de cette date dans le fuseau horaire cible
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

    const parts = formatter.formatToParts(utcDate)
    const tzYear = parseInt(parts.find(p => p.type === 'year').value)
    const tzMonth = parseInt(parts.find(p => p.type === 'month').value)
    const tzDay = parseInt(parts.find(p => p.type === 'day').value)
    const tzHour = parseInt(parts.find(p => p.type === 'hour').value)
    const tzMinute = parseInt(parts.find(p => p.type === 'minute').value)
    const tzSecond = parseInt(parts.find(p => p.type === 'second').value)

    // Calculer l'offset entre UTC et le fuseau horaire cible
    const utcTime = utcDate.getTime()
    const tzTime = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond)
    const offset = utcTime - tzTime

    // Appliquer l'offset : AJOUTER car on veut convertir du fuseau local vers GMT
    // Exemple Belém (GMT-3) : si saisie = 7h00 et offset = +3h (10800000ms)
    // Alors GMT = 7h00 + 3h = 10h00 ✓
    // Exemple Casablanca (GMT+1) : si saisie = 15h00 et offset = -1h (-3600000ms)
    // Alors GMT = 15h00 + (-1h) = 14h00 ✓
    const gmtTime = Date.UTC(year, month - 1, day, hour, minute, 0) + offset

    console.log('🔄 Conversion timezone:', {
      input: `${year}-${month}-${day} ${hour}:${minute}`,
      timezone,
      offset: offset / 3600000 + 'h',
      resultGMT: new Date(gmtTime).toISOString()
    })

    return new Date(gmtTime).toISOString()
  } catch (err) {
    console.error('Erreur lors de la conversion vers GMT:', err)
    return null
  }
}

// Copier les dates proposées
const copyProposedDates = () => {
  if (props.proposedStartDate) setFields('start', props.proposedStartDate)
  if (props.proposedEndDate) setFields('end', props.proposedEndDate)
}

// Effacer les dates
const clearDates = () => {
  formData.value = { startDate: '', startTime: '', endDate: '', endTime: '' }
}

// Sauvegarder les modifications
const handleSave = async () => {
  if (!isFormValid.value) {
    error.value = 'Veuillez renseigner les deux dates'
    return
  }

  try {
    error.value = null

    // Convertir les dates saisies (dans le fuseau horaire de l'événement) vers GMT
    const finalStartDate = convertLocalToGMT(finalStartLocal.value, props.timezone)
    const finalEndDate = convertLocalToGMT(finalEndLocal.value, props.timezone)

    if (!finalStartDate || !finalEndDate) {
      error.value = 'Erreur lors de la conversion des dates'
      return
    }

    // Vérifier que la date de fin est après la date de début
    if (new Date(finalEndDate) <= new Date(finalStartDate)) {
      error.value = 'La date de fin doit être après la date de début'
      return
    }

    console.log('📅 Dates converties:', {
      local: { start: finalStartLocal.value, end: finalEndLocal.value },
      gmt: { start: finalStartDate, end: finalEndDate },
      timezone: props.timezone
    })

    const result = await updateValidatedDates(
      props.activityId,
      finalStartDate,
      finalEndDate,
      props.currentFinalStartDate,
      props.currentFinalEndDate
    )

    if (result.success) {
      emit('update', {
        final_start_date: finalStartDate,
        final_end_date: finalEndDate
      })
      close()
    } else {
      error.value = result.error?.message || 'Erreur lors de la mise à jour des dates'
    }
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err)
    error.value = err.message || 'Une erreur inattendue s\'est produite'
  }
}

// Fermer le modal
const close = () => {
  if (!isLoading.value) {
    emit('close')
  }
}
</script>
