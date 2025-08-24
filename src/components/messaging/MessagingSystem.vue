<template>
  <div>
    <!-- Bouton flottant de messagerie -->
    <FloatingChatButton />

    <!-- Fenêtre de chat -->
    <ChatWindow />
  </div>
</template>

<script setup>
import { useMessagingRealtime } from '@/composables/useMessagingRealtime'
import FloatingChatButton from './FloatingChatButton.vue'
import ChatWindow from './ChatWindow.vue'

// Utiliser le composable partagé pour le temps réel - initialisation automatique
useMessagingRealtime()
</script>