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
        <div class="flex-1 relative">
          <textarea
            v-model="messageInput"
            ref="messageInputRef"
            :placeholder="isListening ? 'Écoute en cours...' : t('chatbot.typeMessage')"
            :disabled="!currentSession || isSending"
            :class="[
              'w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed',
              isListening ? 'ring-2 ring-red-500 border-red-500' : ''
            ]"
            rows="3"
            @keydown.enter.exact.prevent="handleSendMessage"
          ></textarea>

          <!-- Bouton microphone -->
          <button
            v-if="voiceSupported"
            type="button"
            @click="handleMicClick"
            :disabled="!currentSession || isSending"
            :class="[
              'absolute right-2 bottom-2 p-2 rounded-full transition-all cursor-pointer',
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
              (!currentSession || isSending) ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            :title="isListening ? 'Arrêter l\'enregistrement' : 'Activer la reconnaissance vocale'"
          >
            <font-awesome-icon :icon="isListening ? 'stop' : 'microphone'" class="text-lg" />
          </button>
        </div>

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
import { useVoiceInput } from '@/composables/useVoiceInput'
import ChatMessage from './ChatMessage.vue'

const { t } = useI18n()
const { error: showError, success: showSuccess } = useToast()
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

// Reconnaissance vocale
const {
  isSupported: voiceSupported,
  isListening,
  result: voiceResult,
  error: voiceError,
  toggleListening
} = useVoiceInput({
  lang: 'fr-FR',
  continuous: false,
  interimResults: true
})

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

// Gestion de la reconnaissance vocale
const handleMicClick = async () => {
  if (!voiceSupported.value) {
    showError('La reconnaissance vocale n\'est pas supportée par votre navigateur')
    return
  }

  if (isListening.value) {
    toggleListening()
  } else {
    const started = await toggleListening()
    if (started) {
      showSuccess('Reconnaissance vocale activée - Parlez maintenant')
    }
  }
}

// Watcher pour le résultat de la reconnaissance vocale
watch(voiceResult, (newResult) => {
  if (newResult && newResult.trim()) {
    messageInput.value = newResult
  }
})

// Watcher pour les erreurs vocales
watch(voiceError, (error) => {
  if (error) {
    showError(error)
  }
})

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
