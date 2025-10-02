import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function useEmailSender() {
  const loading = ref(false)
  const error = ref(null)
  const success = ref(false)
  const sendingProgress = ref(0)

  // Variables disponibles pour les templates
  const availableVariables = ref([
    { key: '{recipient_name}', description: 'Nom complet du destinataire' },
    { key: '{recipient_first_name}', description: 'Prénom du destinataire' },
    { key: '{recipient_last_name}', description: 'Nom de famille du destinataire' },
    { key: '{recipient_email}', description: 'Email du destinataire' },
    { key: '{organization_name}', description: "Nom de l'organisation" },
    { key: '{current_date}', description: 'Date actuelle' },
    { key: '{current_time}', description: 'Heure actuelle' },
    { key: '{dashboard_url}', description: 'URL du tableau de bord' },
  ])

  // Templates d'email prédéfinis
  const emailTemplates = ref([
    {
      id: 'welcome',
      name: 'Bienvenue',
      subject: 'Bienvenue sur ePavillon Climatique',
      content: `Bonjour {recipient_name},

Bienvenue sur la plateforme ePavillon Climatique de l'IFDD !

Nous sommes ravis de vous accueillir parmi nous. Votre compte a été créé avec succès.

Vous pouvez maintenant accéder à votre tableau de bord : {dashboard_url}

Cordialement,
L'équipe IFDD`
    },
    {
      id: 'notification',
      name: 'Notification',
      subject: 'Notification importante',
      content: `Bonjour {recipient_name},

Nous avons une information importante à vous communiquer.

[Votre message ici]

Cordialement,
L'équipe IFDD`
    },
    {
      id: 'reminder',
      name: 'Rappel',
      subject: 'Rappel - Action requise',
      content: `Bonjour {recipient_name},

Ceci est un rappel amical concernant [sujet du rappel].

[Détails du rappel]

Merci de votre attention.

Cordialement,
L'équipe IFDD`
    },
    {
      id: 'custom',
      name: 'Personnalisé',
      subject: '',
      content: ''
    }
  ])

  /**
   * Rechercher des utilisateurs par nom ou email
   */
  const searchUsers = async (query) => {
    if (!query || query.length < 2) return []

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(10)

      if (error) throw error

      return data.map(user => ({
        id: user.id,
        email: user.email,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        display: `${user.first_name || ''} ${user.last_name || ''} (${user.email})`.trim()
      }))
    } catch (err) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', err)
      return []
    }
  }

  /**
   * Valider une adresse email
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valider les destinataires
   */
  const validateRecipients = (recipients) => {
    const errors = []

    // Vérifier qu'il y a au moins un destinataire
    const hasRecipients =
      (recipients.to && recipients.to.length > 0) ||
      (recipients.cc && recipients.cc.length > 0) ||
      (recipients.bcc && recipients.bcc.length > 0)

    if (!hasRecipients) {
      errors.push('Au moins un destinataire est requis')
    }

    // Valider tous les emails
    const allEmails = [
      ...(recipients.to || []),
      ...(recipients.cc || []),
      ...(recipients.bcc || [])
    ]

    allEmails.forEach(email => {
      if (!validateEmail(email)) {
        errors.push(`Email invalide : ${email}`)
      }
    })

    return errors
  }

  /**
   * Préparer les variables pour l'envoi
   */
  const prepareVariables = (variables = {}) => {
    const now = new Date()
    const defaultVariables = {
      '{current_date}': now.toLocaleDateString('fr-FR'),
      '{current_time}': now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      '{dashboard_url}': window.location.origin + '/dashboard'
    }

    return { ...defaultVariables, ...variables }
  }

  /**
   * Envoyer un email simple
   */
  const sendSimpleEmail = async ({
    subject,
    content,
    recipients,
    variables = {},
    template = 'simple_email'
  }) => {
    loading.value = true
    error.value = null
    success.value = false
    sendingProgress.value = 0

    try {
      // Validation
      const recipientErrors = validateRecipients(recipients)
      if (recipientErrors.length > 0) {
        throw new Error(recipientErrors.join(', '))
      }

      if (!subject || !content) {
        throw new Error('Le sujet et le contenu sont requis')
      }

      sendingProgress.value = 20

      // Préparer les données
      const emailData = {
        email_type: 'simple',
        subject,
        content,
        recipients: {
          to: recipients.to || [],
          cc: recipients.cc || [],
          bcc: recipients.bcc || []
        },
        variables: prepareVariables(variables),
        template
      }

      sendingProgress.value = 50

      // Appeler la edge function
      const { data, error: sendError } = await supabase.functions.invoke('send-email', {
        body: emailData
      })

      sendingProgress.value = 80

      if (sendError) throw sendError

      if (!data?.success) {
        throw new Error(data?.message || 'Erreur lors de l\'envoi de l\'email')
      }

      sendingProgress.value = 100
      success.value = true

      return {
        success: true,
        message: 'Email envoyé avec succès',
        data
      }

    } catch (err) {
      error.value = err.message || 'Une erreur est survenue lors de l\'envoi de l\'email'
      console.error('Erreur d\'envoi d\'email:', err)

      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false

      // Réinitialiser après un délai
      setTimeout(() => {
        sendingProgress.value = 0
      }, 2000)
    }
  }

  /**
   * Envoyer un email d'événement (pour future implémentation)
   */
  const sendEventEmail = async ({
    eventId,
    activityStatus,
    recipientRoles,
    subject,
    content,
    variables = {},
    template = 'event_email'
  }) => {
    // Cette fonction sera implémentée dans la phase 2
    throw new Error('Les emails d\'événement seront disponibles dans une prochaine version')
  }

  /**
   * Obtenir un template par ID
   */
  const getTemplate = (templateId) => {
    return emailTemplates.value.find(t => t.id === templateId)
  }

  /**
   * Remplacer les variables dans le texte
   */
  const replaceVariables = (text, variables) => {
    let result = text
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      result = result.replace(regex, value)
    })
    return result
  }

  /**
   * Prévisualiser l'email avec les variables remplacées
   */
  const previewEmail = (content, variables = {}) => {
    const allVariables = prepareVariables(variables)
    return replaceVariables(content, allVariables)
  }

  /**
   * Réinitialiser l'état
   */
  const reset = () => {
    loading.value = false
    error.value = null
    success.value = false
    sendingProgress.value = 0
  }

  return {
    // État
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    success: computed(() => success.value),
    sendingProgress: computed(() => sendingProgress.value),

    // Données
    availableVariables: computed(() => availableVariables.value),
    emailTemplates: computed(() => emailTemplates.value),

    // Méthodes
    searchUsers,
    validateEmail,
    validateRecipients,
    sendSimpleEmail,
    sendEventEmail,
    getTemplate,
    replaceVariables,
    previewEmail,
    reset
  }
}