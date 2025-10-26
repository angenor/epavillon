<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-900">
    <!-- Header -->
    <div class="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
            <font-awesome-icon icon="robot" class="text-lg" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ t('chatbot.title') }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-2xl">
              {{ currentSession?.title || t('chatbot.selectOrCreateSession') }}
            </p>
          </div>
        </div>

        <!-- AI Assistant badge -->
        <div v-if="currentSession" class="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <font-awesome-icon icon="sparkles" class="text-purple-500 dark:text-purple-400 text-sm" />
          <span class="text-xs font-medium text-purple-700 dark:text-purple-300">
            Assistant IA polyvalent
          </span>
        </div>
      </div>
    </div>

    <!-- Messages area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-6 space-y-4"
    >
      <!-- Empty state -->
      <div v-if="!currentSession" class="flex flex-col items-center justify-center h-full text-center">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white mb-4">
          <font-awesome-icon icon="robot" class="text-3xl" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {{ t('chatbot.welcome') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md">
          {{ t('chatbot.welcomeMessage') }}
        </p>
      </div>

      <!-- Messages -->
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <font-awesome-icon icon="comments" class="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('chatbot.startConversation') }}
        </p>
      </div>

      <div v-else class="space-y-4">
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />

        <!-- Typing indicator -->
        <div v-if="isSending" class="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mr-8">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
            <font-awesome-icon icon="robot" />
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700">
      <!-- Warning if no session -->
      <div v-if="!currentSession" class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div class="flex items-start gap-3">
          <font-awesome-icon icon="exclamation-triangle" class="text-yellow-600 dark:text-yellow-400 mt-1" />
          <div class="flex-1">
            <h4 class="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
              {{ t('chatbot.noSession') }}
            </h4>
            <p class="text-sm text-yellow-700 dark:text-yellow-400">
              {{ t('chatbot.pleaseCreateSession') }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSendMessage" class="flex gap-3">
        <textarea
          v-model="messageInput"
          ref="messageInputRef"
          :placeholder="t('chatbot.typeMessage')"
          :disabled="!currentSession || isSending"
          class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          rows="3"
          @keydown.enter.exact.prevent="handleSendMessage"
        ></textarea>

        <button
          type="submit"
          :disabled="!canSend"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium flex items-center gap-2"
        >
          <font-awesome-icon :icon="isSending ? 'spinner' : 'paper-plane'" :spin="isSending" />
          {{ t('chatbot.send') }}
        </button>
      </form>

      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <span>{{ t('chatbot.pressEnter') }}</span>
        <span v-if="currentSession && messageCount > 0">
          {{ t('chatbot.messagesCount', { count: messageCount }) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatbot } from '@/composables/ai/useChatbot'
import { useToast } from '@/composables/useToast'
import ChatMessage from './ChatMessage.vue'

const { t } = useI18n()
const { error: showError } = useToast()
const {
  currentSession,
  messages,
  isSending,
  messageCount,
  sendMessage
} = useChatbot()

const messageInput = ref('')
const messagesContainer = ref(null)
const messageInputRef = ref(null)

// Computed
const canSend = computed(() => {
  return currentSession.value && messageInput.value.trim().length > 0 && !isSending.value
})

// Methods
const handleSendMessage = async () => {
  if (!canSend.value) return

  const message = messageInput.value.trim()
  messageInput.value = ''

  try {
    await sendMessage(message, {
      language: 'fr' // Peut être dynamique selon les préférences utilisateur
    })

    // Scroll to bottom après envoi
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    showError(t('chatbot.errorSendingMessage'))
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Watch messages for auto-scroll
watch(() => messages.value.length, async () => {
  await nextTick()
  scrollToBottom()
})

// Focus input on mount
onMounted(() => {
  if (messageInputRef.value) {
    messageInputRef.value.focus()
  }
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4a5568;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
