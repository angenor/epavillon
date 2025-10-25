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
@reference;

/* Styles pour le contenu markdown */
.markdown-content {
  @apply text-gray-800 dark:text-gray-200;
}

/* Titres */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  @apply font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2;
}

.markdown-content :deep(h1) {
  @apply text-2xl;
}

.markdown-content :deep(h2) {
  @apply text-xl;
}

.markdown-content :deep(h3) {
  @apply text-lg;
}

/* Paragraphes */
.markdown-content :deep(p) {
  @apply mb-3 leading-relaxed;
}

/* Listes */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  @apply mb-3 ml-6;
}

.markdown-content :deep(ul) {
  @apply list-disc;
}

.markdown-content :deep(ol) {
  @apply list-decimal;
}

.markdown-content :deep(li) {
  @apply mb-1;
}

/* Liens */
.markdown-content :deep(a) {
  @apply text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline;
}

/* Code inline */
.markdown-content :deep(.inline-code) {
  @apply px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono;
}

/* Blocs de code */
.markdown-content :deep(.code-block-wrapper) {
  @apply rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 my-4;
}

.markdown-content :deep(.code-block-header) {
  @apply flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700;
}

.markdown-content :deep(.code-block-language) {
  @apply text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase;
}

.markdown-content :deep(.code-block-copy) {
  @apply flex items-center gap-2 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer;
}

.markdown-content :deep(.code-block-content) {
  @apply p-4 bg-gray-900 overflow-x-auto;
}

.markdown-content :deep(.code-block-content code) {
  @apply text-sm font-mono;
}

/* Blockquotes */
.markdown-content :deep(blockquote) {
  @apply border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-700 dark:text-gray-300;
}

/* Tableaux */
.markdown-content :deep(.table-wrapper) {
  @apply overflow-x-auto my-4;
}

.markdown-content :deep(.markdown-table) {
  @apply w-full border-collapse;
}

.markdown-content :deep(.markdown-table thead) {
  @apply bg-gray-100 dark:bg-gray-800;
}

.markdown-content :deep(.markdown-table th),
.markdown-content :deep(.markdown-table td) {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-700 text-left;
}

.markdown-content :deep(.markdown-table th) {
  @apply font-semibold text-gray-900 dark:text-gray-100;
}

/* Séparateur horizontal */
.markdown-content :deep(hr) {
  @apply my-4 border-t border-gray-300 dark:border-gray-700;
}

/* Images */
.markdown-content :deep(img) {
  @apply max-w-full h-auto rounded-lg my-4;
}

/* Strong/Bold */
.markdown-content :deep(strong) {
  @apply font-semibold text-gray-900 dark:text-gray-100;
}

/* Italic */
.markdown-content :deep(em) {
  @apply italic;
}
</style>
