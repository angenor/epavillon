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
    { key: '{event_name}', description: "Nom de l'événement" },
    { key: '{event_description}', description: "Description de l'événement" },
    { key: '{event_start_date}', description: "Date de début de l'événement" },
    { key: '{event_end_date}', description: "Date de fin de l'événement" },
    { key: '{activity_name}', description: "Nom de l'activité" },
    { key: '{activity_description}', description: "Description de l'activité" },
    { key: '{activity_start_date}', description: "Date de début de l'activité" },
    { key: '{activity_end_date}', description: "Date de fin de l'activité" },
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
      id: 'activity_under_review',
      name: 'Activité en cours d\'examen',
      subject: 'Votre activité "{activity_name}" est en cours d\'examen',
      content: `Bonjour {recipient_name},

Nous vous informons que votre proposition d'activité "{activity_name}" soumise pour l'événement "{event_name}" est actuellement en cours d'examen par notre comité d'évaluation.

Votre proposition fait l'objet d'une analyse approfondie afin d'assurer sa cohérence avec les objectifs de l'événement et les critères de sélection établis.

Nous vous tiendrons informé(e) du résultat de cette évaluation dans les meilleurs délais. Une notification vous sera envoyée dès qu'une décision aura été prise concernant l'acceptation ou le rejet de votre proposition.

Nous vous remercions pour votre patience et votre contribution à l'événement.

Pour toute question, n'hésitez pas à consulter votre tableau de bord : {dashboard_url}

Cordialement,
L'équipe IFDD - Organisation de {event_name}`
    },
    {
      id: 'pavilion_confirmation',
      name: 'Confirmation Pavillon de la Francophonie',
      subject: 'Votre évènement au Pavillon de la Francophonie - Action requise avant le 30 octobre 2025',
      content: `Madame, Monsieur,

Nous avons le plaisir de vous informer que votre activité a été sélectionnée par notre comité de sélection pour être organisée par vous au Pavillon de la Francophonie, à Belém au Brésil lors de la 30e Conférence des Nations Unies sur le climat (CdP30), à la date et à l'horaire suivants :

Organisation : {organization_name}
Titre de l'activité : {activity_name}
Date proposée : __ACTIVITY_FINAL_DATE__
Heure proposée : __ACTIVITY_FINAL_TIME__

Merci de confirmer par retour de courriel que la date et le créneau vous conviennent. Advenant que vous avez des contraintes, merci de noter que les horaires qui vous sont proposés sont difficilement modifiables, en raison de créneaux alternatifs limités.

Avant d'intégrer définitivement votre événement au programme du Pavillon de la Francophonie, nous vous prions de bien vouloir nous confirmer les informations ci-après, avant le vendredi 30 octobre 2025, en utilisant le formulaire joint.

Lien du formulaire : https://docs.google.com/document/d/1GXkhzq2iHYTqbRu1-VyghePUU0IYGOHOoj6ghK4vMGg/edit?usp=sharing

Nous vous remercions pour votre retour apprécié d'ici le 30 octobre 2025.

Cordialement,
L'équipe IFDD - Organisation de {event_name}`
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

    // Utiliser l'URL de production si définie, sinon l'URL actuelle
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin

    const defaultVariables = {
      '{current_date}': now.toLocaleDateString('fr-FR'),
      '{current_time}': now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      '{dashboard_url}': appUrl + '/events/dashboard'
    }

    return { ...defaultVariables, ...variables }
  }

  /**
   * Récupérer les informations d'un événement et d'une activité
   */
  const fetchEventActivityData = async (eventId, activityId) => {
    const eventActivityVars = {}

    try {
      // Récupérer les informations de l'événement
      if (eventId) {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('title, description, in_person_start_date, in_person_end_date')
          .eq('id', eventId)
          .single()

        if (eventError) throw eventError

        if (eventData) {
          eventActivityVars['{event_name}'] = eventData.title || ''
          eventActivityVars['{event_description}'] = eventData.description || ''
          eventActivityVars['{event_start_date}'] = eventData.in_person_start_date
            ? new Date(eventData.in_person_start_date).toLocaleDateString('fr-FR')
            : ''
          eventActivityVars['{event_end_date}'] = eventData.in_person_end_date
            ? new Date(eventData.in_person_end_date).toLocaleDateString('fr-FR')
            : ''
        }
      }

      // Récupérer les informations de l'activité
      if (activityId) {
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('title, detailed_presentation, proposed_start_date, proposed_end_date, final_start_date, final_end_date')
          .eq('id', activityId)
          .single()

        if (activityError) throw activityError

        if (activityData) {
          eventActivityVars['{activity_name}'] = activityData.title || ''
          eventActivityVars['{activity_description}'] = activityData.detailed_presentation || ''
          // Utiliser les dates finales si disponibles, sinon les dates proposées
          eventActivityVars['{activity_start_date}'] = (activityData.final_start_date || activityData.proposed_start_date)
            ? new Date(activityData.final_start_date || activityData.proposed_start_date).toLocaleDateString('fr-FR')
            : ''
          eventActivityVars['{activity_end_date}'] = (activityData.final_end_date || activityData.proposed_end_date)
            ? new Date(activityData.final_end_date || activityData.proposed_end_date).toLocaleDateString('fr-FR')
            : ''
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des données événement/activité:', err)
    }

    return eventActivityVars
  }

  /**
   * Envoyer un email simple
   */
  const sendSimpleEmail = async ({
    subject,
    content,
    recipients,
    variables = {},
    template = 'simple_email',
    event_id = null,
    activity_id = null
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

      // Récupérer les données de l'événement et de l'activité si présents
      const eventActivityVars = await fetchEventActivityData(event_id, activity_id)

      sendingProgress.value = 30

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
        variables: { ...prepareVariables(variables), ...eventActivityVars },
        template,
        event_id,
        activity_id
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