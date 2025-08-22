<template>
  <div>
    <!-- Bouton flottant de messagerie -->
    <FloatingChatButton />

    <!-- Fenêtre de chat -->
    <ChatWindow />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useMessagingStore } from '@/stores/messaging'
import { useAuthStore } from '@/stores/auth'
import FloatingChatButton from './FloatingChatButton.vue'
import ChatWindow from './ChatWindow.vue'

const messagingStore = useMessagingStore()
const authStore = useAuthStore()

onMounted(async () => {
  // Initialiser le système de messagerie seulement si l'utilisateur est connecté
  if (authStore.isAuthenticated && authStore.user?.id) {
    try {
      // Charger les données initiales
      await messagingStore.loadInitialData()
      
      // Initialiser les souscriptions temps réel
      messagingStore.initializeRealtimeSubscriptions(authStore.user.id)
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la messagerie:', error)
    }
  }
})

onUnmounted(() => {
  // Nettoyer les souscriptions lors de la destruction du composant
  messagingStore.cleanup()
})
</script>