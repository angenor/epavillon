<template>
  <div class="fixed bottom-5 right-5 z-50">
    <!-- Bouton flottant principal -->
    <button
      @click="toggleMessaging"
      class="relative bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      :class="[
        messagingStore.isMessagingOpen ? 'w-12 h-12' : 'w-14 h-14',
        messagingStore.hasUnreadMessages ? 'animate-pulse' : ''
      ]"
      :title="messagingStore.isMessagingOpen ? $t('messaging.close') : $t('messaging.open')"
    >
      <!-- Icône du bouton -->
      <font-awesome-icon
        :icon="messagingStore.isMessagingOpen ? 'times' : 'comments'"
        class="text-lg"
      />
      
      <!-- Badge de notification -->
      <span
        v-if="messagingStore.totalUnreadCount > 0 && !messagingStore.isMessagingOpen"
        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-bounce"
      >
        {{ messagingStore.totalUnreadCount > 99 ? '99+' : messagingStore.totalUnreadCount }}
      </span>
    </button>

    <!-- Animation de pulsation pour nouveaux messages -->
    <div
      v-if="messagingStore.hasUnreadMessages && !messagingStore.isMessagingOpen"
      class="absolute inset-0 bg-primary-400 rounded-full animate-ping opacity-75"
    ></div>
  </div>
</template>

<script setup>
import { useMessagingStore } from '@/stores/messaging'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const messagingStore = useMessagingStore()

const toggleMessaging = () => {
  if (messagingStore.isMessagingOpen) {
    messagingStore.closeMessaging()
  } else {
    messagingStore.openMessaging()
  }
}
</script>

<style scoped>
/* Animation personnalisée pour le bounce */
@keyframes custom-bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -6px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -3px, 0);
  }
  90% {
    transform: translate3d(0,-1px,0);
  }
}

.animate-bounce {
  animation: custom-bounce 1s infinite;
}
</style>