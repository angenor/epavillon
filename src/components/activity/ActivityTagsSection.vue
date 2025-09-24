<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <font-awesome-icon :icon="['fas', 'tags']" class="mr-3 text-ifdd-bleu" />
        {{ t('activity.tags.title') }}
      </h2>
    </div>

    <div class="p-6 space-y-4">
      <!-- Message d'approbation requise -->
      <div v-if="!isActivityApproved" class="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div class="flex items-start">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div class="ml-3">
            <p class="text-sm text-amber-800 dark:text-amber-300">
              {{ t('activity.tags.approvalMessage') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Texte d'encouragement -->
      <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div class="flex items-start">
          <font-awesome-icon :icon="['fas', 'lightbulb']" class="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
          <div class="ml-3">
            <h4 class="text-sm font-medium text-blue-900 dark:text-blue-200">
              {{ t('activity.tags.encouragement.title') }}
            </h4>
            <p class="mt-1 text-sm text-blue-800 dark:text-blue-300">
              {{ t('activity.tags.encouragement.description') }}
            </p>
            <ul class="mt-2 text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• {{ t('activity.tags.encouragement.benefit1') }}</li>
              <li>• {{ t('activity.tags.encouragement.benefit2') }}</li>
              <li>• {{ t('activity.tags.encouragement.benefit3') }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Ajout de tag -->
      <div class="flex space-x-3">
        <div class="flex-1">
          <input
            :value="newTag"
            @input="$emit('update:newTag', $event.target.value)"
            @keypress="handleKeyPress"
            type="text"
            :placeholder="!isActivityApproved ? t('activity.tags.approvalRequired') : t('activity.tags.placeholder')"
            :disabled="!canAddMoreTags || !isActivityApproved"
            class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
            maxlength="50"
          >
        </div>
        <button
          @click="addTag"
          :disabled="!canAddMoreTags || !newTag.trim() || !isActivityApproved"
          class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 transition-colors cursor-pointer"
          :title="!isActivityApproved ? t('activity.tags.approvalRequired') : ''"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
          {{ t('activity.tags.add') }}
        </button>
      </div>

      <!-- Compteur de tags -->
      <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span>{{ t('activity.tags.count', { current: tags.length, max: maxTags }) }}</span>
        <span v-if="remainingTags > 0" class="text-green-600 dark:text-green-400">
          {{ t('activity.tags.remaining', { count: remainingTags }) }}
        </span>
        <span v-else class="text-orange-600 dark:text-orange-400">
          {{ t('activity.tags.maxReached') }}
        </span>
      </div>

      <!-- Liste des tags -->
      <div v-if="tags.length > 0" class="space-y-3">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          {{ t('activity.tags.currentTags') }}
        </h3>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(tag, index) in tags"
            :key="index"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-ifdd-bleu/10 text-ifdd-bleu dark:bg-ifdd-bleu/20 dark:text-ifdd-bleu-clair border border-ifdd-bleu/20"
          >
            <span>{{ tag }}</span>
            <button
              @click="removeTag(index)"
              :disabled="!isActivityApproved"
              class="ml-2 text-ifdd-bleu hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:text-gray-400"
              :title="!isActivityApproved ? t('activity.tags.approvalRequired') : t('activity.tags.remove')"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="text-xs" />
            </button>
          </div>
        </div>
      </div>

      <!-- Message si aucun tag -->
      <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
        <font-awesome-icon :icon="['fas', 'tags']" class="text-3xl mb-2 opacity-50" />
        <p>{{ t('activity.tags.noTags') }}</p>
        <p class="text-sm mt-1">{{ t('activity.tags.addFirstTag') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  tags: {
    type: Array,
    required: true
  },
  newTag: {
    type: String,
    required: true
  },
  canAddMoreTags: {
    type: Boolean,
    required: true
  },
  remainingTags: {
    type: Number,
    required: true
  },
  maxTags: {
    type: Number,
    required: true
  },
  isActivityApproved: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-tag', 'remove-tag', 'update:newTag', 'key-press'])

// Proxy methods to emit events
const addTag = () => {
  emit('add-tag')
}

const removeTag = (index) => {
  emit('remove-tag', index)
}

const handleKeyPress = (event) => {
  emit('key-press', event)
}
</script>