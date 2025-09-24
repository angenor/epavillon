<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <font-awesome-icon :icon="['fas', 'file-alt']" class="mr-3 text-ifdd-bleu" />
        {{ t('events.tabs.documents') }}
      </h2>
    </div>

    <div class="p-6 space-y-4">
      <!-- Message d'approbation requise -->
      <div v-if="!isActivityApproved" class="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div class="flex items-start">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div class="ml-3">
            <p class="text-sm text-amber-800 dark:text-amber-300">
              {{ t('activity.documents.approvalMessage') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Texte d'encouragement -->
      <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <div class="flex items-start">
          <font-awesome-icon :icon="['fas', 'lightbulb']" class="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
          <div class="ml-3">
            <h4 class="text-sm font-medium text-green-900 dark:text-green-200">
              {{ t('activity.documentManagement.encouragement.title') }}
            </h4>
            <p class="mt-1 text-sm text-green-800 dark:text-green-300">
              {{ t('activity.documentManagement.encouragement.description') }}
            </p>
            <ul class="mt-2 text-xs text-green-700 dark:text-green-400 space-y-1">
              <li>• {{ t('activity.documentManagement.encouragement.benefit1') }}</li>
              <li>• {{ t('activity.documentManagement.encouragement.benefit2') }}</li>
              <li>• {{ t('activity.documentManagement.encouragement.benefit3') }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          {{ t('events.documents') }}
        </h3>
        <button
          @click="$emit('add-new-document')"
          :disabled="!isActivityApproved"
          class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
          :title="!isActivityApproved ? t('activity.documents.approvalRequired') : ''"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
          {{ t('events.addDocument') }}
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <font-awesome-icon
              :icon="getDocumentIcon(doc.file_type)"
              :class="getDocumentIconColor(doc.file_type)"
            />
            <div class="flex-1">
              <p class="font-medium text-gray-900 dark:text-white">{{ doc.title }}</p>
              <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span
                  v-if="doc.types && doc.types.length > 0"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {{ t(`events.documentTypes.${doc.types[0]}`) }}
                </span>
                <span>{{ formatDate(doc.uploaded_at) }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <a
              :href="doc.file_url"
              target="_blank"
              class="text-ifdd-bleu hover:text-ifdd-bleu-fonce"
              :title="t('events.downloadDocument')"
            >
              <font-awesome-icon :icon="['fas', 'download']" />
            </a>
            <button
              @click="$emit('remove-document', doc.id)"
              :disabled="!isActivityApproved"
              class="text-red-600 hover:text-red-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:text-gray-400"
              :title="!isActivityApproved ? t('activity.documents.approvalRequired') : t('events.deleteDocument')"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { formatDate } from '@/utils/activityHelpers'

const { t } = useI18n()

defineProps({
  documents: {
    type: Array,
    required: true
  },
  getDocumentIcon: {
    type: Function,
    required: true
  },
  getDocumentIconColor: {
    type: Function,
    required: true
  },
  isActivityApproved: {
    type: Boolean,
    default: false
  }
})

defineEmits(['add-new-document', 'remove-document'])
</script>