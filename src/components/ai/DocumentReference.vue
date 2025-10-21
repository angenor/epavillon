<template>
  <div
    class="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
    @click="toggleExpanded"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <!-- Title -->
        <div class="flex items-center gap-2 mb-1">
          <font-awesome-icon
            icon="file-alt"
            class="text-blue-500 dark:text-blue-400 flex-shrink-0"
          />
          <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {{ reference.metadata?.title || reference.metadata?.document_title || t('chatbot.untitledDocument') }}
          </h4>
        </div>

        <!-- Metadata -->
        <div class="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span v-if="reference.metadata?.category" class="flex items-center gap-1">
            <font-awesome-icon icon="tag" class="text-xs" />
            {{ formatCategory(reference.metadata.category) }}
          </span>

          <span v-if="reference.metadata?.page" class="flex items-center gap-1">
            <font-awesome-icon icon="file" class="text-xs" />
            {{ t('chatbot.page') }} {{ reference.metadata.page }}
          </span>

          <span v-if="reference.similarity !== null && reference.similarity !== undefined" class="flex items-center gap-1">
            <font-awesome-icon icon="percentage" class="text-xs" />
            {{ Math.round(reference.similarity * 100) }}%
          </span>
        </div>
      </div>

      <!-- Expand/Collapse icon -->
      <button
        class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        @click.stop="toggleExpanded"
      >
        <font-awesome-icon
          :icon="expanded ? 'chevron-up' : 'chevron-down'"
          class="text-xs text-gray-500 dark:text-gray-400"
        />
      </button>
    </div>

    <!-- Excerpt (collapsible) -->
    <div
      v-if="expanded && hasContent"
      class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
    >
      <p class="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-4">
        "{{ truncatedContent }}"
      </p>

      <!-- Actions -->
      <div class="mt-3 flex items-center gap-2">
        <a
          v-if="reference.metadata?.file_url || reference.metadata?.fileUrl || reference.metadata?.url"
          :href="documentUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="px-3 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center gap-1"
          @click.stop
        >
          <font-awesome-icon icon="external-link-alt" />
          {{ t('chatbot.viewDocument') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  reference: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()

const expanded = ref(false)

// Computed
const hasContent = computed(() => {
  return Boolean(props.reference.pageContent || props.reference.chunk_text || props.reference.content)
})

const rawContent = computed(() => {
  return props.reference.pageContent || props.reference.chunk_text || props.reference.content || ''
})

const truncatedContent = computed(() => {
  const maxLength = 300
  if (rawContent.value.length <= maxLength) {
    return rawContent.value
  }
  return rawContent.value.slice(0, maxLength) + '...'
})

const documentUrl = computed(() => {
  return props.reference.metadata?.file_url ||
         props.reference.metadata?.fileUrl ||
         props.reference.metadata?.url ||
         '#'
})

// Methods
const toggleExpanded = () => {
  if (hasContent.value) {
    expanded.value = !expanded.value
  }
}

const formatCategory = (category) => {
  const categoryMap = {
    climate: t('chatbot.categories.climate'),
    biodiversity: t('chatbot.categories.biodiversity'),
    desertification: t('chatbot.categories.desertification')
  }

  return categoryMap[category] || category
}
</script>
