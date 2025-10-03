import { useEmailModalStore } from '@/stores/emailModal'

/**
 * Composable pour gérer le modal d'email
 * Facilite l'ouverture du modal depuis n'importe quel composant
 */
export function useEmailModal() {
  const emailModalStore = useEmailModalStore()

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
    openEmailModal({
      eventId,
      to: recipients
    })
  }

  /**
   * Ouvrir le modal pour une activité spécifique
   */
  const openForActivity = (activityId, eventId = null, recipients = []) => {
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
    openEmailModal({
      to: Array.isArray(recipients) ? recipients : [recipients]
    })
  }

  return {
    openEmailModal,
    closeEmailModal,
    toggleEmailModal,
    openForEvent,
    openForActivity,
    openWithRecipients,
    isOpen: emailModalStore.isOpen
  }
}