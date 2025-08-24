import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useMessagingStore } from '@/stores/messaging'
import { useAuthStore } from '@/stores/auth'

export function useMessagingRealtime() {
  const messagingStore = useMessagingStore()
  const authStore = useAuthStore()
  const isInitialized = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // Fonction d'initialisation centralisée
  const initializeMessaging = async (forceReload = false) => {
    // Ne pas réinitialiser si déjà fait, sauf si forcé
    if (isInitialized.value && !forceReload) return

    // Vérifier l'authentification
    if (!authStore.isAuthenticated || !authStore.user?.id) {
      console.warn('User not authenticated, skipping messaging initialization')
      return
    }

    loading.value = true
    error.value = null

    try {
      // Charger les données initiales
      await messagingStore.loadInitialData()
      
      // Initialiser les souscriptions temps réel
      messagingStore.initializeRealtimeSubscriptions(authStore.user.id)
      
      isInitialized.value = true
      console.log('Messaging system initialized successfully')
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de la messagerie:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Fonction de nettoyage
  const cleanupMessaging = () => {
    if (isInitialized.value) {
      messagingStore.cleanup()
      isInitialized.value = false
      console.log('Messaging system cleaned up')
    }
  }

  // Fonction de rafraîchissement
  const refreshMessaging = async () => {
    await initializeMessaging(true)
  }

  // Surveiller les changements d'authentification
  watch(() => authStore.isAuthenticated, async (newValue) => {
    if (newValue && authStore.user?.id) {
      await initializeMessaging()
    } else {
      cleanupMessaging()
    }
  })

  // Surveiller les changements d'utilisateur (changement de compte)
  watch(() => authStore.user?.id, async (newId, oldId) => {
    if (newId && newId !== oldId) {
      cleanupMessaging()
      await initializeMessaging()
    }
  })

  // Initialisation au montage
  onMounted(async () => {
    await initializeMessaging()
  })

  // Nettoyage conditionnel au démontage
  onUnmounted(() => {
    // Ne nettoyer que si l'utilisateur n'est plus authentifié
    // Cela permet de maintenir le temps réel entre les navigations
    if (!authStore.isAuthenticated) {
      cleanupMessaging()
    }
  })

  return {
    isInitialized,
    loading,
    error,
    initializeMessaging,
    refreshMessaging,
    cleanupMessaging
  }
}