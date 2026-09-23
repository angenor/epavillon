<template>
  <button
    type="button"
    @click="handleExport"
    :disabled="!selectedEventId || isExporting"
    :title="selectedEventId ? t('admin.programmeExport.tooltip') : t('admin.programmeExport.noEvent')"
    class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-orange-500 dark:hover:border-orange-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <font-awesome-icon
      :icon="['fas', isExporting ? 'spinner' : 'file-word']"
      :class="['h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0', isExporting ? 'animate-spin' : '']" />
    <span class="hidden sm:inline font-medium">{{ t('admin.programmeExport.button') }}</span>
  </button>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useAdminEvent } from '@/composables/useAdminEvent'
import { useProgrammeExport } from '@/composables/useProgrammeExport'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { selectedEventId } = useAdminEvent()
const { isExporting, exportProgrammeJson } = useProgrammeExport()
const toast = useToast()

const handleExport = async () => {
  if (!selectedEventId.value) return
  try {
    const count = await exportProgrammeJson(selectedEventId.value)
    if (count === 0) {
      toast.warning(t('admin.programmeExport.empty'))
      return
    }
    toast.success(t('admin.programmeExport.success', { count }), 8000)
  } catch (error) {
    console.error('Erreur export programme :', error)
    toast.error(t('admin.programmeExport.error'))
  }
}
</script>
