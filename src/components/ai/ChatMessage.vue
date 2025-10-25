<template>
  <div
    :class="[
      'flex gap-3 p-4 rounded-lg transition-colors',
      message.role === 'user'
        ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
        : 'bg-gray-50 dark:bg-gray-800/50 mr-8'
    ]"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <div
        :class="[
          'w-10 h-10 rounded-full flex items-center justify-center text-white',
          message.role === 'user'
            ? 'bg-blue-500'
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
        ]"
      >
        <font-awesome-icon
          :icon="message.role === 'user' ? 'user' : 'robot'"
          class="text-lg"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-sm text-gray-700 dark:text-gray-300">
          {{ message.role === 'user' ? t('chatbot.you') : t('chatbot.assistant') }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatTime(message.created_at) }}
        </span>
      </div>

      <!-- Message content -->
      <div
        class="prose prose-sm dark:prose-invert max-w-none markdown-content"
        v-html="renderedContent"
      ></div>

      <!-- References (only for assistant messages) -->
      <div
        v-if="message.role === 'assistant' && hasReferences"
        class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center gap-2 mb-3">
          <font-awesome-icon
            icon="book"
            class="text-sm text-gray-500 dark:text-gray-400"
          />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('chatbot.sources') }} ({{ references.length }})
          </span>
        </div>

        <div class="space-y-2">
          <DocumentReference
            v-for="(ref, index) in references"
            :key="`ref-${index}`"
            :reference="ref"
          />
        </div>
      </div>

      <!-- Metadata (only for assistant messages) -->
      <div
        v-if="message.role === 'assistant' && message.metadata"
        class="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400"
      >
        <span v-if="message.metadata.responseTime">
          <font-awesome-icon icon="clock" class="mr-1" />
          {{ formatResponseTime(message.metadata.responseTime) }}
        </span>
        <span v-if="message.metadata.tokens">
          <font-awesome-icon icon="microchip" class="mr-1" />
          {{ formatTokenCount(message.metadata.tokens) }}
        </span>
      </div>

      <!-- Actions -->
      <div class="mt-3 flex items-center gap-2">
        <!-- Copy button -->
        <button
          @click="copyMessage"
          class="px-3 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          :title="t('chatbot.copyMessage')"
        >
          <font-awesome-icon :icon="copied ? 'check' : 'copy'" class="mr-1" />
          {{ copied ? t('chatbot.copied') : t('chatbot.copy') }}
        </button>

        <!-- Feedback buttons (only for assistant messages) -->
        <div v-if="message.role === 'assistant'" class="flex items-center gap-1 ml-2">
          <button
            @click="sendFeedback('positive')"
            :class="[
              'px-2 py-1 text-xs rounded-md transition-colors cursor-pointer',
              feedbackGiven === 'positive'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
            :title="t('chatbot.helpful')"
          >
            <font-awesome-icon icon="thumbs-up" />
          </button>

          <button
            @click="sendFeedback('negative')"
            :class="[
              'px-2 py-1 text-xs rounded-md transition-colors cursor-pointer',
              feedbackGiven === 'negative'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
            :title="t('chatbot.notHelpful')"
          >
            <font-awesome-icon icon="thumbs-down" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDistance } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import DocumentReference from './DocumentReference.vue'
import { useChatbot } from '@/composables/ai/useChatbot'
import { formatResponseTime, formatTokenCount } from '@/utils/ai/responseFormatter'
import { useMarkdown } from '@/composables/ai/useMarkdown'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const { t, locale } = useI18n()
const { addFeedback } = useChatbot()
const { renderMarkdown } = useMarkdown()

const copied = ref(false)
const feedbackGiven = ref(null)

// Computed
const renderedContent = computed(() => {
  return renderMarkdown(props.message.content)
})

const references = computed(() => {
  return props.message.source_documents || []
})

const hasReferences = computed(() => {
  return references.value.length > 0
})

// Methods
const formatTime = (timestamp) => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const dateLocale = locale.value === 'fr' ? fr : enUS

  return formatDistance(date, new Date(), {
    addSuffix: true,
    locale: dateLocale
  })
}

const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Error copying message:', error)
  }
}

const sendFeedback = async (type) => {
  if (feedbackGiven.value === type) {
    // Si déjà donné, on ne fait rien
    return
  }

  const success = await addFeedback(props.message.id, type)

  if (success) {
    feedbackGiven.value = type
  }
}
</script>

<style scoped>
/* Styles pour le contenu markdown */
.markdown-content {
  color: #1f2937;
}

:global(.dark) .markdown-content {
  color: #e5e7eb;
}

/* Titres */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-weight: 700;
  color: #111827;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:global(.dark) .markdown-content :deep(h1),
:global(.dark) .markdown-content :deep(h2),
:global(.dark) .markdown-content :deep(h3),
:global(.dark) .markdown-content :deep(h4),
:global(.dark) .markdown-content :deep(h5),
:global(.dark) .markdown-content :deep(h6) {
  color: #f9fafb;
}

.markdown-content :deep(h1) {
  font-size: 1.5rem;
}

.markdown-content :deep(h2) {
  font-size: 1.25rem;
}

.markdown-content :deep(h3) {
  font-size: 1.125rem;
}

/* Paragraphes */
.markdown-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.625;
}

/* Listes */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 0.75rem;
  margin-left: 1.5rem;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

/* Liens */
.markdown-content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #2563eb;
}

:global(.dark) .markdown-content :deep(a) {
  color: #60a5fa;
}

:global(.dark) .markdown-content :deep(a:hover) {
  color: #93c5fd;
}

/* Code inline */
.markdown-content :deep(.inline-code) {
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  color: #1f2937;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: monospace;
}

:global(.dark) .markdown-content :deep(.inline-code) {
  background-color: #374151;
  color: #e5e7eb;
}

/* Blocs de code */
.markdown-content :deep(.code-block-wrapper) {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #d1d5db;
  margin: 1rem 0;
}

:global(.dark) .markdown-content :deep(.code-block-wrapper) {
  border-color: #374151;
}

.markdown-content :deep(.code-block-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-bottom: 1px solid #d1d5db;
}

:global(.dark) .markdown-content :deep(.code-block-header) {
  background-color: #1f2937;
  border-bottom-color: #374151;
}

.markdown-content :deep(.code-block-language) {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
}

:global(.dark) .markdown-content :deep(.code-block-language) {
  color: #9ca3af;
}

.markdown-content :deep(.code-block-copy) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  background-color: #e5e7eb;
  color: #374151;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.markdown-content :deep(.code-block-copy:hover) {
  background-color: #d1d5db;
}

:global(.dark) .markdown-content :deep(.code-block-copy) {
  background-color: #374151;
  color: #d1d5db;
}

:global(.dark) .markdown-content :deep(.code-block-copy:hover) {
  background-color: #4b5563;
}

.markdown-content :deep(.code-block-content) {
  padding: 1rem;
  background-color: #111827;
  overflow-x: auto;
}

.markdown-content :deep(.code-block-content code) {
  font-size: 0.875rem;
  font-family: monospace;
}

/* Blockquotes */
.markdown-content :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #374151;
}

:global(.dark) .markdown-content :deep(blockquote) {
  border-left-color: #4b5563;
  color: #d1d5db;
}

/* Tableaux */
.markdown-content :deep(.table-wrapper) {
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content :deep(.markdown-table) {
  width: 100%;
  border-collapse: collapse;
}

.markdown-content :deep(.markdown-table thead) {
  background-color: #f3f4f6;
}

:global(.dark) .markdown-content :deep(.markdown-table thead) {
  background-color: #1f2937;
}

.markdown-content :deep(.markdown-table th),
.markdown-content :deep(.markdown-table td) {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  text-align: left;
}

:global(.dark) .markdown-content :deep(.markdown-table th),
:global(.dark) .markdown-content :deep(.markdown-table td) {
  border-color: #374151;
}

.markdown-content :deep(.markdown-table th) {
  font-weight: 600;
  color: #111827;
}

:global(.dark) .markdown-content :deep(.markdown-table th) {
  color: #f9fafb;
}

/* Séparateur horizontal */
.markdown-content :deep(hr) {
  margin: 1rem 0;
  border-top: 1px solid #d1d5db;
}

:global(.dark) .markdown-content :deep(hr) {
  border-top-color: #374151;
}

/* Images */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

/* Strong/Bold */
.markdown-content :deep(strong) {
  font-weight: 600;
  color: #111827;
}

:global(.dark) .markdown-content :deep(strong) {
  color: #f9fafb;
}

/* Italic */
.markdown-content :deep(em) {
  font-style: italic;
}
</style>
