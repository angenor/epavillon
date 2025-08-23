<template>
  <div class="flex flex-col h-full">
    <!-- Zone des messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
      @scroll="handleScroll"
    >
      <!-- Indicateur de chargement -->
      <div
        v-if="loading"
        class="text-center py-4"
      >
        <font-awesome-icon icon="spinner" class="animate-spin text-gray-500" />
      </div>

      <!-- Messages -->
      <div
        v-for="(message, index) in groupedMessages"
        :key="message.id"
        class="flex"
        :class="[
          message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
        ]"
      >
        <MessageBubble
          :message="message"
          :is-own-message="message.sender_id === currentUserId"
          :show-avatar="shouldShowAvatar(message, index)"
          :show-timestamp="shouldShowTimestamp(message, index)"
          @delete="deleteMessage"
        />
      </div>

      <!-- Indicateur de frappe -->
      <div
        v-if="isOtherUserTyping"
        class="flex justify-start"
      >
        <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2 max-w-xs">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>

      <!-- Zone de scroll automatique -->
      <div ref="scrollAnchor"></div>
    </div>

    <!-- Zone de saisie -->
    <ChatInput
      @send-message="sendMessage"
      @typing="handleTyping"
      :disabled="sendingMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMessagingStore } from '@/stores/messaging'
import { useAuthStore } from '@/stores/auth'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'

const messagingStore = useMessagingStore()
const authStore = useAuthStore()

const messagesContainer = ref(null)
const scrollAnchor = ref(null)
const typingTimeout = ref(null)

// Computed
const currentUserId = computed(() => authStore.user?.id)
const loading = computed(() => messagingStore.messagesService.loading)
const sendingMessage = computed(() => messagingStore.messagesService.sendingMessage)
const messages = computed(() => messagingStore.messagesService.messages || [])
const currentConversation = computed(() => messagingStore.messagesService.currentConversation)

const isOtherUserTyping = computed(() => {
  if (!currentConversation.value) return false
  return messagingStore.isUserTyping(
    `private-${Math.min(currentUserId.value, currentConversation.value.userId)}-${Math.max(currentUserId.value, currentConversation.value.userId)}`,
    currentConversation.value.userId
  )
})

const groupedMessages = computed(() => {
  // Grouper les messages par date
  const grouped = []
  let currentDate = null
  
  messages.value.forEach((message, index) => {
    const messageDate = new Date(message.created_at).toDateString()
    
    if (messageDate !== currentDate) {
      grouped.push({
        type: 'date-separator',
        id: `date-${messageDate}`,
        date: messageDate
      })
      currentDate = messageDate
    }
    
    grouped.push(message)
  })
  
  return grouped.filter(item => item.type !== 'date-separator')
})

// Méthodes
const shouldShowAvatar = (message, index) => {
  if (message.sender_id === currentUserId.value) return false
  
  const nextMessage = messages.value[index + 1]
  return !nextMessage || nextMessage.sender_id !== message.sender_id
}

const shouldShowTimestamp = (message, index) => {
  const nextMessage = messages.value[index + 1]
  if (!nextMessage) return true
  
  const currentTime = new Date(message.created_at).getTime()
  const nextTime = new Date(nextMessage.created_at).getTime()
  
  // Afficher le timestamp si plus de 5 minutes entre les messages
  return (nextTime - currentTime) > 5 * 60 * 1000
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollAnchor.value) {
      scrollAnchor.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

const handleScroll = () => {
  // TODO: Implémenter le chargement de messages plus anciens
}

const sendMessage = async (content) => {
  if (!currentConversation.value || !content.trim()) return
  
  const result = await messagingStore.sendMessage(currentConversation.value.userId, content)
  
  if (result.success) {
    scrollToBottom()
  }
}

const deleteMessage = async (messageId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
    await messagingStore.messagesService.deleteMessage(messageId)
  }
}

const handleTyping = (isTyping) => {
  if (!currentConversation.value) return
  
  const conversationId = `private-${Math.min(currentUserId.value, currentConversation.value.userId)}-${Math.max(currentUserId.value, currentConversation.value.userId)}`
  
  messagingStore.setTypingIndicator(conversationId, currentUserId.value, isTyping)
  
  // Arrêter l'indicateur après 3 secondes d'inactivité
  if (isTyping) {
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }
    
    typingTimeout.value = setTimeout(() => {
      messagingStore.setTypingIndicator(conversationId, currentUserId.value, false)
    }, 3000)
  }
}

// Watchers
watch(messages, () => {
  scrollToBottom()
}, { flush: 'post' })

watch(currentConversation, async (newConversation) => {
  if (newConversation) {
    await messagingStore.messagesService.getMessagesForConversation(newConversation.userId)
    scrollToBottom()
  }
})

// Lifecycle
onMounted(() => {
  scrollToBottom()
})

onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script>

<style scoped>
/* Style pour les bulles de messages */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Animation pour l'indicateur de frappe */
@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}
</style>