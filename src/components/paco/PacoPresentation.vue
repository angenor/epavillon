<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
    <!-- Header banner -->
    <div class="bg-gradient-to-r from-green-700 to-green-900 dark:from-green-800 dark:to-green-950 px-6 py-8 sm:px-10 sm:py-12 text-center">
      <p class="text-green-200 text-sm font-medium uppercase tracking-wider mb-2">
        {{ t('paco.organized_by') }}
      </p>
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
        {{ t('paco.title') }}
      </h1>
      <p class="text-green-100 text-base sm:text-lg">
        {{ t('paco.subtitle') }}
      </p>
    </div>

    <!-- Content -->
    <div class="px-6 py-6 sm:px-10 sm:py-8 space-y-6">
      <!-- Description -->
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        {{ t('paco.description') }}
      </p>

      <!-- Info cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <font-awesome-icon :icon="['fas', 'calendar-days']" class="text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('paco.date') }}</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ t('paco.time') }}</p>
          </div>
        </div>
        <div class="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <font-awesome-icon :icon="['fas', 'clock']" class="text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('paco.duration') }}</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ t('paco.format') }}</p>
          </div>
        </div>
      </div>

      <!-- Speakers -->
      <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-1">
          <font-awesome-icon :icon="['fas', 'users']" class="text-green-600 dark:text-green-400" />
          <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {{ t('paco.speakers.title') }}
          </h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('paco.speakers.tba') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
