<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ t('events.addNewDocument') }}
          </h3>
          <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>

        <form @submit.prevent="$emit('submit')" class="space-y-4">
          <!-- Titre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('events.documentTitle') }} *
            </label>
            <input
              :value="form.title"
              @input="$emit('update:form', { ...form, title: $event.target.value })"
              type="text"
              required
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              :placeholder="t('events.documentTitlePlaceholder')"
            >
          </div>

          <!-- Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('events.documentType') }} *
            </label>
            <select
              :value="form.type"
              @input="$emit('update:form', { ...form, type: $event.target.value })"
              required
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
            >
              <option value="">{{ t('events.selectDocumentType') }}</option>
              <option value="presentation">{{ t('events.documentTypes.presentation') }}</option>
              <option value="report">{{ t('events.documentTypes.report') }}</option>
              <option value="additional_resource">{{ t('events.documentTypes.additional_resource') }}</option>
              <option value="autre">{{ t('events.documentTypes.autre') }}</option>
            </select>
          </div>

          <!-- Fichier -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('events.documentFile') }} *
            </label>
            <input
              type="file"
              @change="$emit('file-selected', $event)"
              required
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
            >
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ t('events.documentFileFormats') }}
            </p>
          </div>

          <!-- Affichage du fichier sélectionné -->
          <div v-if="selectedFile" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'file']" class="text-gray-600 dark:text-gray-400" />
              <span class="text-sm text-gray-900 dark:text-white">{{ selectedFile.name }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                ({{ Math.round(selectedFile.size / 1024) }} KB)
              </span>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="$emit('cancel')"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors cursor-pointer"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce disabled:opacity-50 transition-colors cursor-pointer"
            >
              <font-awesome-icon v-if="saving" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
              {{ t('events.addDocument') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  form: {
    type: Object,
    required: true
  },
  selectedFile: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
})

defineEmits(['submit', 'cancel', 'update:form', 'file-selected'])
</script>