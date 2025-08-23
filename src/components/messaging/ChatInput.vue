<template>
  <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <div class="p-3">
      <!-- Zone de saisie principale -->
      <div class="flex items-end space-x-2">
        <!-- Actions supplémentaires -->
        <div class="flex space-x-1">
          <!-- Bouton rendez-vous -->
          <button
            @click="scheduleAppointment"
            class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            :title="$t('messaging.scheduleAppointment')"
          >
            <font-awesome-icon icon="calendar-plus" class="text-sm" />
          </button>
          
          <!-- Bouton pièce jointe (future fonctionnalité) -->
          <button
            @click="attachFile"
            class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            :title="$t('messaging.attachFile')"
            disabled
          >
            <font-awesome-icon icon="paperclip" class="text-sm" />
          </button>
        </div>

        <!-- Zone de texte -->
        <div class="flex-1 relative">
          <textarea
            ref="messageInput"
            v-model="messageContent"
            @keydown="handleKeydown"
            @input="handleInput"
            :placeholder="$t('messaging.typeMessage')"
            :disabled="disabled"
            class="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            :class="[
              disabled ? 'opacity-50 cursor-not-allowed' : '',
              'max-h-24 min-h-[40px]'
            ]"
            rows="1"
            :maxlength="1000"
          />
          
          <!-- Compteur de caractères -->
          <div
            v-if="messageContent.length > 800"
            class="absolute -bottom-5 right-0 text-xs"
            :class="[
              messageContent.length > 950 ? 'text-red-500' : 'text-gray-500'
            ]"
          >
            {{ messageContent.length }}/1000
          </div>
        </div>

        <!-- Bouton d'envoi -->
        <button
          @click="sendMessage"
          :disabled="!canSend || disabled"
          class="p-2 rounded-lg transition-all duration-200 flex-shrink-0"
          :class="[
            canSend && !disabled
              ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          ]"
          :title="$t('messaging.sendMessage')"
        >
          <font-awesome-icon
            :icon="disabled ? 'spinner' : 'paper-plane'"
            :class="[
              'text-sm',
              disabled ? 'animate-spin' : ''
            ]"
          />
        </button>
      </div>

      <!-- Indicateur de frappe des autres utilisateurs -->
      <div
        v-if="typingIndicator"
        class="mt-2 text-xs text-gray-500 dark:text-gray-400 italic"
      >
        {{ typingIndicator }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessagingStore } from '@/stores/messaging'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const messagingStore = useMessagingStore()
const { showToast } = useToast()

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send-message', 'typing'])

const messageInput = ref(null)
const messageContent = ref('')
const isTyping = ref(false)
const typingTimeout = ref(null)

// Computed
const canSend = computed(() => {
  return messageContent.value.trim().length > 0 && messageContent.value.length <= 1000
})

const typingIndicator = computed(() => {
  // TODO: Récupérer les utilisateurs en train de taper
  return null
})

// Méthodes
const sendMessage = () => {
  if (!canSend.value || props.disabled) return
  
  const content = messageContent.value.trim()
  if (content) {
    emit('send-message', content)
    messageContent.value = ''
    resetTextareaHeight()
    stopTyping()
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInput = () => {
  // Auto-resize du textarea
  adjustTextareaHeight()
  
  // Gérer l'indicateur de frappe
  if (messageContent.value.trim() && !isTyping.value) {
    startTyping()
  } else if (!messageContent.value.trim() && isTyping.value) {
    stopTyping()
  }
  
  // Réinitialiser le timeout de frappe
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  
  typingTimeout.value = setTimeout(() => {
    stopTyping()
  }, 2000)
}

const adjustTextareaHeight = () => {
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
      const scrollHeight = messageInput.value.scrollHeight
      const maxHeight = 96 // 6 lignes * 16px
      messageInput.value.style.height = Math.min(scrollHeight, maxHeight) + 'px'
    }
  })
}

const resetTextareaHeight = () => {
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = '40px'
    }
  })
}

const startTyping = () => {
  if (!isTyping.value) {
    isTyping.value = true
    emit('typing', true)
  }
}

const stopTyping = () => {
  if (isTyping.value) {
    isTyping.value = false
    emit('typing', false)
  }
  
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
    typingTimeout.value = null
  }
}

const scheduleAppointment = () => {
  messagingStore.setCurrentView('appointments')
}

const attachFile = () => {
  // TODO: Implémenter l'upload de fichiers
  showToast(t('messaging.fileAttachmentNotImplemented'), 'info')
}

// Watchers
watch(() => messageContent.value, () => {
  adjustTextareaHeight()
})

// Focus automatique sur l'input
nextTick(() => {
  if (messageInput.value) {
    messageInput.value.focus()
  }
})
</script>

<style scoped>
/* Style pour le textarea */
textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Animation pour le bouton d'envoi */
.send-button-active {
  animation: pulse 0.3s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>