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
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ activity.title }}
        </h1>

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
  }
})
</script>