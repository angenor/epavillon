import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEmailModalStore = defineStore('emailModal', () => {
  // État du modal
  const isOpen = ref(false)

  // Données initiales optionnelles
  const initialRecipients = ref({
    to: [],
    cc: [],
    bcc: []
  })
  const initialEvent = ref(null)
  const initialActivity = ref(null)

  // Actions
  const open = (options = {}) => {
    // Réinitialiser les données
    initialRecipients.value = options.recipients || { to: [], cc: [], bcc: [] }
    initialEvent.value = options.eventId || null
    initialActivity.value = options.activityId || null

    // Ouvrir le modal
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false

    // Réinitialiser les données après fermeture
    setTimeout(() => {
      initialRecipients.value = { to: [], cc: [], bcc: [] }
      initialEvent.value = null
      initialActivity.value = null
    }, 300) // Attendre la fin de l'animation
  }

  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  return {
    // État
    isOpen,
    initialRecipients,
    initialEvent,
    initialActivity,

    // Actions
    open,
    close,
    toggle
  }
})