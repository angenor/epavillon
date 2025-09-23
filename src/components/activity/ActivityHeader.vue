<template>
  <div class="mb-8">
    <router-link
      :to="'/events/dashboard'"
      class="text-ifdd-bleu hover:underline mb-4 inline-block"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
      {{ t('common.back') }}
    </router-link>

    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div v-if="!editingField.title" class="relative">
          <h1 @click="$emit('start-edit', 'title')"
              class="text-3xl font-bold text-gray-900 dark:text-white mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 -ml-2 rounded">
            {{ activity.title }}
            <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-lg text-gray-400" />
          </h1>
        </div>
        <div v-else class="relative">
          <input v-model="tempValue.title"
                 @input="$emit('field-change', 'title')"
                 @keyup.enter="$emit('save-field', 'title')"
                 @keyup.escape="$emit('cancel-edit', 'title')"
                 class="text-3xl font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full pr-24"
                 ref="titleInput">
          <div class="absolute right-0 top-1/2 -translate-y-1/2 flex space-x-2">
            <button v-if="hasUnsavedChanges.title"
                    @click="$emit('save-field', 'title')"
                    :disabled="savingField.title"
                    class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer">
              <font-awesome-icon v-if="savingField.title" :icon="['fas', 'spinner']" class="animate-spin" />
              <font-awesome-icon v-else :icon="['fas', 'save']" />
            </button>
            <button @click="$emit('cancel-edit', 'title')"
                    class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
        </div>

        <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getStatusClass(activity.validation_status)"
          >
            {{ t(`events.status.${activity.validation_status}`) }}
          </span>
          <span>{{ t('events.createdOn') }}: {{ formatDate(activity.created_at) }}</span>
        </div>
      </div>

      <div class="flex space-x-3">
        <router-link
          :to="`/activities/preview/${activity.id}`"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'eye']" class="mr-2" />
          {{ t('activity.preview.button') }}
        </router-link>

        <router-link
          v-if="activity.validation_status === 'approved'"
          :to="`/activities/${activity.id}`"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'external-link-alt']" class="mr-2" />
          {{ t('events.viewPublic') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { formatDate, getStatusClass } from '@/utils/activityHelpers'

const { t } = useI18n()

defineProps({
  activity: {
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

defineEmits(['start-edit', 'cancel-edit', 'field-change', 'save-field'])
</script>