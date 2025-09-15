<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="$emit('close')"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
        @click.stop
      >
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ t('common.maintenance.title') }}
          </h3>
        </div>

        <!-- Message -->
        <div class="text-center mb-6">
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {{ t('common.maintenance.message') }}
          </p>
          <p class="text-sm font-medium text-ifdd-green-600 dark:text-ifdd-green-400">
            {{ t('common.maintenance.backSoon') }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {{ t('common.close') }}
          </button>
          <button
            @click="$emit('goHome')"
            class="flex-1 px-4 py-2 bg-ifdd-green-600 text-white rounded-lg hover:bg-ifdd-green-700 transition-colors"
          >
            {{ t('common.maintenance.returnHome') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'goHome'])
</script>