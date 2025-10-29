<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <font-awesome-icon :icon="['fas', 'calendar']" class="mr-3 text-ifdd-bleu" />
        {{ t('activities.sections.dates') }}
      </h2>
    </div>
    <div class="p-6 space-y-6">
      <!-- Timezone Info -->
      <div v-if="eventData?.timezone" class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div class="flex items-start">
          <font-awesome-icon :icon="['fas', 'clock']" class="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
          <div class="ml-3">
            <h4 class="text-sm font-medium text-blue-900 dark:text-blue-200">
              {{ t('events.timezoneInfo') }}
            </h4>
            <p class="mt-1 text-sm text-blue-800 dark:text-blue-300">
              {{ eventTimezone }}
            </p>
            <p class="mt-2 text-xs text-blue-700 dark:text-blue-400">
              {{ t('events.timezoneDescription') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Dates validées (confirmées) - Affichage en lecture seule -->
      <div v-if="activity.final_start_date && activity.final_end_date" class="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
        <div class="flex items-center mb-3">
          <font-awesome-icon :icon="['fas', 'check-circle']" class="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          <h4 class="text-sm font-medium text-green-800 dark:text-green-300 uppercase">
            {{ t('activities.validatedDates') || 'Date et heure confirmées' }}
          </h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-xs text-green-700 dark:text-green-400 mb-1">{{ t('events.activityDate') }}</p>
            <p class="text-base font-semibold text-green-900 dark:text-green-200">
              {{ formatValidatedDate(activity.final_start_date) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-green-700 dark:text-green-400 mb-1">{{ t('events.startTime') }}</p>
            <p class="text-base font-semibold text-green-900 dark:text-green-200">
              {{ formatValidatedTime(activity.final_start_date) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-green-700 dark:text-green-400 mb-1">{{ t('events.endTime') }}</p>
            <p class="text-base font-semibold text-green-900 dark:text-green-200">
              {{ formatValidatedTime(activity.final_end_date) }}
            </p>
          </div>
        </div>
        <p class="mt-3 text-xs text-green-600 dark:text-green-500 flex items-center">
          <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-1" />
          {{ t('activities.validatedDatesInfo') || 'Ces dates ont été confirmées par l\'équipe de validation' }}
        </p>
      </div>

      <!-- Dates proposées - Section titre mise à jour -->
      <div v-if="activity.final_start_date && activity.final_end_date" class="mb-2">
        <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase flex items-center">
          <font-awesome-icon :icon="['fas', 'calendar-alt']" class="w-4 h-4 mr-2" />
          {{ t('activities.proposedDates') || 'Dates proposées initialement' }}
        </h4>
      </div>

      <!-- Date and Time fields -->
      <div class="space-y-4">
        <!-- Activity Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('events.activityDate') }}
          </label>
          <div class="relative">
            <input
              type="date"
              v-model="activityDates.activityDate.value"
              :min="minDate"
              :max="maxDate"
              :disabled="!canEdit"
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <font-awesome-icon :icon="['fas', 'calendar-alt']" class="absolute right-3 top-3 text-gray-400" />
          </div>
          <p v-if="eventData" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ t('events.eventPeriod') }}: {{ formatEventPeriod }}
          </p>
          <p v-if="!canEdit" class="mt-1 text-xs text-amber-600 dark:text-amber-400">
            {{ t('activities.datesNotEditableAfterSubmission') }}
          </p>
        </div>

        <!-- Time fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Start Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('events.startTime') }}
            </label>
            <div class="relative">
              <input
                type="time"
                v-model="activityDates.startTime.value"
                :disabled="!canEdit"
                class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <font-awesome-icon :icon="['fas', 'clock']" class="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          <!-- End Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('events.endTime') }}
            </label>
            <div class="relative">
              <input
                type="time"
                v-model="activityDates.endTime.value"
                :disabled="!canEdit"
                class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <font-awesome-icon :icon="['fas', 'clock']" class="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Save/Cancel buttons for dates -->
      <div v-if="canEdit && activityDates.hasPendingDateChanges.value" class="flex justify-end space-x-2 mt-4">
        <button
          @click="$emit('save-dates')"
          :disabled="activityDates.savingDates.value"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          <font-awesome-icon v-if="activityDates.savingDates.value" :icon="['fas', 'spinner']" class="animate-spin" />
          <font-awesome-icon v-else :icon="['fas', 'save']" />
          {{ t('common.save') }}
        </button>
        <button
          @click="$emit('cancel-dates')"
          class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer flex items-center gap-2"
        >
          <font-awesome-icon :icon="['fas', 'times']" />
          {{ t('common.cancel') }}
        </button>
      </div>

      <!-- Activity Format and Type -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <!-- Activity Format -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('activity.submit.fields.format') }}
          </label>
          <div v-if="!editingField.format" class="relative">
            <div @click="$emit('start-edit', 'format')"
                 class="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between">
              <span>{{ t(`activities.format.${activity.format}`) }}</span>
              <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-400" />
            </div>
          </div>
          <div v-else>
            <select v-model="tempValue.format"
                    disabled
                    @change="$emit('field-change', 'format')"
                    class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2">
              <option value="online">{{ t('activities.format.online') }}</option>
              <option value="in_person">{{ t('activities.format.in_person') }}</option>
              <option value="hybrid">{{ t('activities.format.hybrid') }}</option>
            </select>
            <div class="mt-2 flex justify-end space-x-2">
              <button v-if="hasUnsavedChanges.format"
                      @click="$emit('save-field', 'format')"
                      :disabled="savingField.format"
                      class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer">
                <font-awesome-icon v-if="savingField.format" :icon="['fas', 'spinner']" class="animate-spin" />
                <font-awesome-icon v-else :icon="['fas', 'save']" />
              </button>
              <button @click="$emit('cancel-edit', 'format')"
                      class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer">
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>
            </div>
          </div>
        </div>

        <!-- Activity Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('activity.submit.fields.activityType') }}
          </label>
          <div v-if="!editingField.activity_type" class="relative">
            <div @click="$emit('start-edit', 'activity_type')"
                 class="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between">
              <span>{{ t(`activities.type.${activity.activity_type}`) }}</span>
              <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-400" />
            </div>
          </div>
          <div v-else>
            <select v-model="tempValue.activity_type"
                    @change="$emit('field-change', 'activity_type')"
                    class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2">
              <option value="panel">{{ t('activities.type.panel') }}</option>
              <option value="workshop">{{ t('activities.type.workshop') }}</option>
              <option value="presentation">{{ t('activities.type.presentation') }}</option>
              <option value="conference">{{ t('activities.type.conference') }}</option>
              <option value="roundtable">{{ t('activities.type.roundtable') }}</option>
              <option value="training">{{ t('activities.type.training') }}</option>
              <option value="networking">{{ t('activities.type.networking') }}</option>
              <option value="side_event">{{ t('activities.type.side_event') }}</option>
              <option value="country_day">{{ t('activities.type.country_day') }}</option>
              <option value="other">{{ t('activities.type.other') }}</option>
            </select>
            <div class="mt-2 flex justify-end space-x-2">
              <button v-if="hasUnsavedChanges.activity_type"
                      @click="$emit('save-field', 'activity_type')"
                      :disabled="savingField.activity_type"
                      class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer">
                <font-awesome-icon v-if="savingField.activity_type" :icon="['fas', 'spinner']" class="animate-spin" />
                <font-awesome-icon v-else :icon="['fas', 'save']" />
              </button>
              <button @click="$emit('cancel-edit', 'activity_type')"
                      class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer">
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()

const props = defineProps({
  activity: {
    type: Object,
    required: true
  },
  eventData: {
    type: Object,
    default: null
  },
  eventTimezone: {
    type: String,
    default: ''
  },
  activityDates: {
    type: Object,
    required: true
  },
  editingField: {
    type: Object,
    default: () => ({})
  },
  tempValue: {
    type: Object,
    default: () => ({})
  },
  hasUnsavedChanges: {
    type: Object,
    default: () => ({})
  },
  savingField: {
    type: Object,
    default: () => ({})
  },
  canEdit: {
    type: Boolean,
    default: true
  }
})

defineEmits(['start-edit', 'cancel-edit', 'field-change', 'save-field', 'save-dates', 'cancel-dates'])

// Computed pour obtenir les dates min et max de l'événement
const minDate = computed(() => {
  if (!props.eventData) return ''

  let startDate
  if (props.eventData.participation_mode === 'online') {
    startDate = props.eventData.online_start_datetime
  } else {
    startDate = props.eventData.in_person_start_date || props.eventData.online_start_datetime
  }

  return startDate ? startDate.split('T')[0] : ''
})

const maxDate = computed(() => {
  if (!props.eventData) return ''

  let endDate
  if (props.eventData.participation_mode === 'online') {
    endDate = props.eventData.online_end_datetime
  } else {
    endDate = props.eventData.in_person_end_date || props.eventData.online_end_datetime
  }

  return endDate ? endDate.split('T')[0] : ''
})

// Format the event period for display
const formatEventPeriod = computed(() => {
  if (!props.eventData) return ''

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(t('common.locale') === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const startDate = minDate.value
  const endDate = maxDate.value

  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  return ''
})

// Format validated date in event timezone
const formatValidatedDate = (dateString) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const timezone = props.eventData?.timezone || 'UTC'

  return date.toLocaleDateString(t('common.locale') === 'fr' ? 'fr-FR' : 'en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format validated time in event timezone
const formatValidatedTime = (dateString) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const timezone = props.eventData?.timezone || 'UTC'

  return date.toLocaleTimeString(t('common.locale') === 'fr' ? 'fr-FR' : 'en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
