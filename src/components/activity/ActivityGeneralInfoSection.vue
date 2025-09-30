<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-3 text-ifdd-bleu" />
        {{ t('events.tabs.general') }}
      </h2>
    </div>
    <div class="p-6 space-y-6">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('activity.submit.fields.title') }}
        </label>
        <div v-if="!editingField.title" class="relative">
          <div @click="$emit('start-edit', 'title')"
               class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <span class="text-lg font-medium">{{ activity.title }}</span>
            <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-gray-400" />
          </div>
        </div>
        <div v-else class="relative">
          <input v-model="tempValue.title"
                 @input="$emit('field-change', 'title')"
                 @keyup.escape="$emit('cancel-edit', 'title')"
                 @keyup.enter="$emit('save-field', 'title')"
                 type="text"
                 class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 pr-24 text-lg"
                 ref="titleInput">
          <div class="absolute bottom-2 right-2 flex space-x-2">
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
      </div>

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

    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'

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