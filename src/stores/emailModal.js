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
  const initialFilter = ref(null)
  const initialSubject = ref(null)
  const initialContent = ref(null)

  // Actions
  const open = (options = {}) => {
    // Réinitialiser les données
    initialRecipients.value = options.recipients || { to: [], cc: [], bcc: [] }
    initialEvent.value = options.eventId || null
    initialActivity.value = options.activityId || null
    initialFilter.value = options.filter || null
    initialSubject.value = options.subject || null
    initialContent.value = options.content || null

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
      initialFilter.value = null
      initialSubject.value = null
      initialContent.value = null
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
    initialFilter,
    initialSubject,
    initialContent,

    // Actions
    open,
    close,
    toggle
  }
})