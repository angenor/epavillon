import { useEmailModalStore } from '@/stores/emailModal'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

/**
 * Composable pour gérer le modal d'email
 * Facilite l'ouverture du modal depuis n'importe quel composant
 * Réservé aux super_admin uniquement
 */
export function useEmailModal() {
  const emailModalStore = useEmailModalStore()
  const authStore = useAuthStore()

  /**
   * Vérifier les permissions super_admin
   */
  const checkPermissions = () => {
    // Utiliser isSuperAdmin du store auth
    if (!authStore.isSuperAdmin) {
      console.warn('Accès refusé : Seuls les super-administrateurs peuvent envoyer des emails groupés.')
      return false
    }
    return true
  }

  /**
   * Ouvrir le modal avec des données optionnelles
   * @param {Object} options - Options d'ouverture
   * @param {Array} options.to - Liste des destinataires principaux
   * @param {Array} options.cc - Liste des destinataires en copie
   * @param {Array} options.bcc - Liste des destinataires en copie cachée
   * @param {String} options.eventId - ID de l'événement pré-sélectionné
   * @param {String} options.activityId - ID de l'activité pré-sélectionnée
   */
  const openEmailModal = (options = {}) => {
    // Vérifier les permissions avant d'ouvrir
    if (!checkPermissions()) {
      // Ouvrir quand même le modal pour afficher le message d'erreur
      emailModalStore.open({})
      return
    }

    const formattedOptions = {
      recipients: {
        to: options.to || [],
        cc: options.cc || [],
        bcc: options.bcc || []
      },
      eventId: options.eventId,
      activityId: options.activityId
    }

    emailModalStore.open(formattedOptions)
  }

  /**
   * Fermer le modal
   */
  const closeEmailModal = () => {
    emailModalStore.close()
  }

  /**
   * Basculer l'état du modal
   */
  const toggleEmailModal = () => {
    emailModalStore.toggle()
  }

  /**
   * Ouvrir le modal pour un événement spécifique
   */
  const openForEvent = (eventId, recipients = []) => {
    // Les vérifications sont faites dans openEmailModal
    openEmailModal({
      eventId,
      to: recipients
    })
  }

  /**
   * Ouvrir le modal pour une activité spécifique
   */
  const openForActivity = (activityId, eventId = null, recipients = []) => {
    // Les vérifications sont faites dans openEmailModal
    openEmailModal({
      activityId,
      eventId,
      to: recipients
    })
  }

  /**
   * Ouvrir le modal avec des destinataires pré-remplis
   */
  const openWithRecipients = (recipients = []) => {
    // Les vérifications sont faites dans openEmailModal
    openEmailModal({
      to: Array.isArray(recipients) ? recipients : [recipients]
    })
  }

  /**
   * Vérifier si l'utilisateur peut envoyer des emails
   * Retourne une propriété computed réactive
   */
  const canSendEmails = computed(() => {
    // Utiliser isSuperAdmin du store auth
    return authStore.isSuperAdmin
  })

  return {
    openEmailModal,
    closeEmailModal,
    toggleEmailModal,
    openForEvent,
    openForActivity,
    openWithRecipients,
    canSendEmails,
    isOpen: emailModalStore.isOpen
  }
}