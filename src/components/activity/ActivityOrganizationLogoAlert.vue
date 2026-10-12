<template>
  <div
    role="alert"
    class="mb-8 p-4 sm:p-5 bg-red-600 dark:bg-red-700 text-white rounded-lg shadow-md flex flex-col sm:flex-row sm:items-center gap-4"
  >
    <div class="flex items-start flex-1">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-6 h-6 mt-0.5 flex-shrink-0 animate-pulse" />
      <div class="ml-3">
        <p class="font-semibold">
          {{ t('activity.organization.logoAlert.title') }}
        </p>
        <p class="mt-1 text-sm text-red-50">
          {{ canEdit ? t('activity.organization.logoAlert.creatorMessage') : t('activity.organization.logoAlert.notCreatorMessage') }}
        </p>
      </div>
    </div>
    <button
      type="button"
      @click="emit('fix')"
      class="cursor-pointer flex-shrink-0 inline-flex items-center justify-center px-4 py-2 bg-white text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
    >
      <font-awesome-icon :icon="['fas', canEdit ? 'image' : 'exchange-alt']" class="mr-2" />
      {{ canEdit ? t('activity.organization.logoAlert.addLogo') : t('activity.organization.change') }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  // L'utilisateur est le créateur de l'organisation et peut donc ajouter le logo
  canEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['fix'])

const { t } = useI18n()
</script>
