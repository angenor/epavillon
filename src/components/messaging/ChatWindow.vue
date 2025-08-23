<template>
  <div
    v-if="messagingStore.isMessagingOpen"
    class="fixed bottom-20 right-5 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700"
    :class="[
      messagingStore.isMinimized 
        ? 'w-80 h-12' 
        : 'w-96 h-[600px] md:w-[380px] md:h-[600px]'
    ]"
  >
    <!-- Header -->
    <ChatHeader />

    <!-- Corps principal (masqué quand minimisé) -->
    <div
      v-if="!messagingStore.isMinimized"
      class="flex-1 flex flex-col h-[calc(100%-48px)]"
    >
      <!-- Vue liste des conversations -->
      <ConversationList
        v-if="messagingStore.currentView === 'conversations'"
      />

      <!-- Vue conversation active -->
      <ChatConversation
        v-else-if="messagingStore.currentView === 'chat'"
      />

      <!-- Vue groupes -->
      <GroupManager
        v-else-if="messagingStore.currentView === 'groups'"
      />

      <!-- Vue rendez-vous -->
      <AppointmentScheduler
        v-else-if="messagingStore.currentView === 'appointments'"
      />
    </div>
  </div>
</template>

<script setup>
import { useMessagingStore } from '@/stores/messaging'
import ChatHeader from './ChatHeader.vue'
import ConversationList from './ConversationList.vue'
import ChatConversation from './ChatConversation.vue'
import GroupManager from './GroupManager.vue'
import AppointmentScheduler from './AppointmentScheduler.vue'

const messagingStore = useMessagingStore()
</script>

<style scoped>
/* Animation d'ouverture/fermeture */
.chat-window-enter-active,
.chat-window-leave-active {
  transition: all 0.3s ease;
}

.chat-window-enter-from,
.chat-window-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Responsive mobile */
@media (max-width: 768px) {
  .chat-window {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    border-radius: 0 !important;
  }
}
</style>