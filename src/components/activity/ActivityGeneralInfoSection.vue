<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-3 text-ifdd-bleu" />
        {{ t('events.tabs.general') }}
      </h2>
    </div>
    <div class="p-6 space-y-6">
      <!-- Objectives -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('events.objectives') }}
        </label>
        <div v-if="!editingField.objectives" class="relative">
          <div @click="$emit('start-edit', 'objectives')"
               class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            {{ activity.objectives }}
            <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-gray-400" />
          </div>
        </div>
        <div v-else class="relative">
          <textarea v-model="tempValue.objectives"
                    @input="$emit('field-change', 'objectives')"
                    @keyup.escape="$emit('cancel-edit', 'objectives')"
                    rows="4"
                    class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 pr-24"
                    ref="objectivesInput"></textarea>
          <div class="absolute bottom-2 right-2 flex space-x-2">
            <button v-if="hasUnsavedChanges.objectives"
                    @click="$emit('save-field', 'objectives')"
                    :disabled="savingField.objectives"
                    class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer">
              <font-awesome-icon v-if="savingField.objectives" :icon="['fas', 'spinner']" class="animate-spin" />
              <font-awesome-icon v-else :icon="['fas', 'save']" />
            </button>
            <button @click="$emit('cancel-edit', 'objectives')"
                    class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
        </div>
      </div>

      <!-- Detailed Presentation -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('events.detailedPresentation') }}
        </label>
        <div v-if="!editingField.detailed_presentation" class="relative">
          <div @click="$emit('start-edit', 'detailed_presentation')"
               class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-h-[120px]">
            <div v-html="activity.detailed_presentation" class="prose dark:prose-invert max-w-none"></div>
            <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-gray-400 float-right" />
          </div>
        </div>
        <div v-else class="relative">
          <RichTextEditor
            v-model="tempValue.detailed_presentation"
            @input="$emit('field-change', 'detailed_presentation')"
            :placeholder="t('activity.submit.placeholders.detailedPresentation')"
            :show-character-count="true"
            :max-length="5000"
          />
          <div class="mt-2 flex justify-end space-x-2">
            <button v-if="hasUnsavedChanges.detailed_presentation"
                    @click="$emit('save-field', 'detailed_presentation')"
                    :disabled="savingField.detailed_presentation"
                    class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer">
              <font-awesome-icon v-if="savingField.detailed_presentation" :icon="['fas', 'spinner']" class="animate-spin" />
              <font-awesome-icon v-else :icon="['fas', 'save']" />
            </button>
            <button @click="$emit('cancel-edit', 'detailed_presentation')"
                    class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
        </div>
      </div>

      <!-- Dates et heures -->
      <div class="space-y-4">
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

        <!-- Date de l'activité -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('events.activityDate') }}
          </label>
          <input
            type="date"
            v-model="activityDates.activityDate.value"
            :min="eventData?.start_date?.split('T')[0]"
            :max="eventData?.end_date?.split('T')[0]"
            class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
          >
          <p v-if="eventData" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ t('events.eventPeriod') }}: {{ formatEventPeriod(eventData) }}
          </p>
        </div>

        <!-- Heures de début et fin -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('events.startTime') }}
            </label>
            <input
              type="time"
              v-model="activityDates.startTime.value"
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('events.endTime') }}
            </label>
            <input
              type="time"
              v-model="activityDates.endTime.value"
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
            >
          </div>
        </div>

        <!-- Boutons d'enregistrement pour les dates -->
        <div v-if="activityDates.hasPendingDateChanges.value" class="mt-4 flex justify-end space-x-2">
          <button @click="$emit('cancel-dates')"
                  class="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors cursor-pointer">
            <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
            {{ t('common.cancel') }}
          </button>
          <button @click="$emit('save-dates')"
                  :disabled="activityDates.savingDates.value"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer">
            <font-awesome-icon v-if="activityDates.savingDates.value" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
            <font-awesome-icon v-else :icon="['fas', 'save']" class="mr-2" />
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import { formatEventPeriod } from '@/utils/activityHelpers'

const { t } = useI18n()

defineProps({
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
    required: true
  },
  tempValue: {
    type: Object,
    required: true
  },
  hasUnsavedChanges: {
    type: Object,
    required: true
  },
  savingField: {
    type: Object,
    required: true
  }
})

defineEmits(['start-edit', 'cancel-edit', 'field-change', 'save-field', 'save-dates', 'cancel-dates'])
</script>