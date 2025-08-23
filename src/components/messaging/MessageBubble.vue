<template>
  <div
    class="flex max-w-xs lg:max-w-md"
    :class="[
      isOwnMessage ? 'flex-row-reverse' : 'flex-row'
    ]"
  >
    <!-- Avatar de l'expéditeur -->
    <div
      v-if="showAvatar && !isOwnMessage"
      class="mr-2 flex-shrink-0"
    >
      <img
        :src="message.sender?.profile_photo_thumbnail_url || '/default-avatar.png'"
        :alt="`${message.sender?.first_name} ${message.sender?.last_name}`"
        class="w-8 h-8 rounded-full object-cover"
      />
    </div>

    <!-- Bulle du message -->
    <div
      class="relative group"
      :class="[
        isOwnMessage ? 'ml-2' : 'mr-2'
      ]"
    >
      <!-- Contenu du message -->
      <div
        class="px-4 py-2 rounded-2xl break-words"
        :class="[
          isOwnMessage
            ? 'bg-primary-600 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
        ]"
      >
        <!-- Contenu du message -->
        <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
        
        <!-- Timestamp et statut de lecture -->
        <div
          class="flex items-center mt-1 text-xs"
          :class="[
            isOwnMessage ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
          ]"
        >
          <span>{{ formatTime(message.created_at) }}</span>
          
          <!-- Indicateur de lecture pour les messages envoyés -->
          <div
            v-if="isOwnMessage"
            class="ml-1"
          >
            <font-awesome-icon
              v-if="message.is_read"
              icon="check-double"
              class="text-xs text-primary-200"
              :title="$t('messaging.messageRead')"
            />
            <font-awesome-icon
              v-else
              icon="check"
              class="text-xs text-primary-300"
              :title="$t('messaging.messageSent')"
            />
          </div>
        </div>
      </div>

      <!-- Menu d'actions (visible au hover) -->
      <div
        v-if="isOwnMessage"
        class="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        :class="[
          isOwnMessage ? '-left-8' : '-right-8'
        ]"
      >
        <button
          @click="$emit('delete', message.id)"
          class="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
          :title="$t('messaging.deleteMessage')"
        >
          <font-awesome-icon icon="trash" class="text-xs" />
        </button>
      </div>

      <!-- Timestamp détaillé (visible quand showTimestamp est vrai) -->
      <div
        v-if="showTimestamp"
        class="text-xs text-gray-500 dark:text-gray-400 mt-1"
        :class="[
          isOwnMessage ? 'text-right' : 'text-left'
        ]"
      >
        {{ formatDetailedTime(message.created_at) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

const { t, locale } = useI18n()

defineProps({
  message: {
    type: Object,
    required: true
  },
  isOwnMessage: {
    type: Boolean,
    default: false
  },
  showAvatar: {
    type: Boolean,
    default: true
  },
  showTimestamp: {
    type: Boolean,
    default: false
  }
})

defineEmits(['delete'])

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return date.toLocaleTimeString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDetailedTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return format(date, 'PPpp', {
    locale: locale.value === 'fr' ? fr : enUS
  })
}
</script>

<style scoped>
/* Animations pour les bulles de message */
.message-bubble-enter-active {
  transition: all 0.3s ease-out;
}

.message-bubble-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* Style pour les liens dans les messages */
.message-content a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: currentColor;
}

.message-content a:hover {
  text-decoration-thickness: 2px;
}
</style>