/**
 * Formatte les réponses Zoom pour le chatbot
 * Génère des messages conviviaux et concis pour l'utilisateur
 * Optimisé pour minimiser l'utilisation de tokens
 */

/**
 * Formatte une date en français de manière concise
 * @param {string} dateString - Date au format ISO
 * @returns {string}
 */
function formatDateConcise(dateString) {
  const date = new Date(dateString)
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }
  return date.toLocaleString('fr-FR', options)
}

export const zoomToolsFormatter = {
  /**
   * Formatte la réponse après création d'une réunion
   * @param {object} data - Données de la réunion créée
   * @returns {object}
   */
  formatCreateResponse(data) {
    return {
      success: true,
      message: `Réunion Zoom créée avec succès !`,
      details: {
        registration_url: data.registration_url,
        join_url: data.join_url,
        meeting_id: data.meeting_id,
        password: data.password
      },
      userMessage: `✅ Réunion Zoom créée.\n🔗 Lien d'inscription : ${data.registration_url || data.join_url}${data.password ? `\n🔑 Mot de passe : ${data.password}` : ''}`
    }
  },

  /**
   * Formatte la réponse après création d'une réunion standalone
   * @param {object} response - Réponse de l'edge function
   * @returns {object}
   */
  formatStandaloneCreateResponse(response) {
    // Gérer les erreurs
    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Erreur lors de la création de la réunion',
        message: response.message || response.error,
        userMessage: `❌ ${response.message || response.error}`
      }
    }

    // Gérer les warnings (réunion créée mais non sauvegardée en base)
    if (response.warning) {
      const data = response.data
      return {
        success: true,
        warning: response.warning,
        message: 'Réunion créée avec avertissement',
        details: {
          meeting_id: data.meeting_id,
          topic: data.topic,
          start_time: data.start_time,
          duration: data.duration,
          registration_url: data.registration_url,
          join_url: data.join_url,
          password: data.password
        },
        userMessage: `⚠️ **Réunion Zoom créée avec avertissement**\n\n` +
          `📋 Sujet : ${data.topic}\n` +
          `📅 Début : ${formatDateConcise(data.start_time)}\n` +
          `⏱️ Durée : ${data.duration} min\n` +
          `🔗 Lien d'inscription : ${data.registration_url || data.join_url}\n` +
          `🔑 Mot de passe : ${data.password || 'Aucun'}\n` +
          `📝 ID réunion : ${data.meeting_id}\n\n` +
          `⚠️ ${response.warning}`
      }
    }

    // Succès complet
    const data = response.data
    return {
      success: true,
      message: 'Réunion Zoom standalone créée avec succès',
      details: {
        meeting_id: data.meeting_id,
        topic: data.topic,
        start_time: data.start_time,
        duration: data.duration,
        timezone: data.timezone,
        registration_url: data.registration_url,
        join_url: data.join_url,
        password: data.password,
        start_url: data.start_url
      },
      userMessage: `✅ **Réunion Zoom créée avec succès !**\n\n` +
        `📋 **Sujet** : ${data.topic}\n` +
        `📅 **Date/Heure** : ${formatDateConcise(data.start_time)}\n` +
        `⏱️ **Durée** : ${data.duration} minutes\n` +
        `🌍 **Fuseau horaire** : ${data.timezone}\n` +
        `🔗 **Lien d'inscription** : ${data.registration_url || data.join_url}\n` +
        `🔑 **Mot de passe** : ${data.password || 'Aucun'}\n` +
        `📝 **ID de la réunion** : ${data.meeting_id}\n\n` +
        `Partagez le lien d'inscription avec les participants ! 🎉`
    }
  },

  /**
   * Formatte la réponse après suppression d'une réunion
   * @param {object} data - Données de la réunion supprimée
   * @returns {object}
   */
  formatDeleteResponse(data) {
    return {
      success: true,
      message: `Réunion Zoom supprimée avec succès.`,
      userMessage: `✅ Réunion Zoom supprimée.`
    }
  },

  /**
   * Formatte la réponse après édition d'une réunion
   * @param {object} data - Données de la réunion mise à jour
   * @returns {object}
   */
  formatEditResponse(data) {
    const updatedFields = data.updated_fields || []
    const fieldsText = updatedFields.length > 0
      ? ` (${updatedFields.join(', ')})`
      : ''

    return {
      success: true,
      message: `Réunion Zoom mise à jour avec succès${fieldsText}.`,
      details: {
        registration_url: data.registration_url,
        join_url: data.join_url,
        meeting_id: data.meeting_id
      },
      userMessage: `✅ Réunion Zoom mise à jour${fieldsText}.\n🔗 Lien d'inscription : ${data.registration_url || data.join_url}`
    }
  },

  /**
   * Formatte les détails d'une réunion Zoom (version complète)
   * @param {object} data - Données détaillées de la réunion
   * @returns {object}
   */
  formatDetailsResponse(data) {
    const startTime = formatDateConcise(data.start_time)
    const statusEmoji = {
      'waiting': '⏳',
      'started': '🎥',
      'finished': '✅'
    }[data.status] || '📋'

    // Formater le message avec tous les détails disponibles
    let message = `${statusEmoji} **${data.topic}**\n\n`
    message += `📋 **Meeting ID** : ${data.meeting_id}\n`
    message += `📅 **Date et heure** : ${startTime}\n`
    message += `⏱️ **Durée** : ${data.duration} minutes\n`

    if (data.timezone) {
      message += `🌍 **Fuseau horaire** : ${data.timezone}\n`
    }

    if (data.password) {
      message += `🔑 **Mot de passe** : ${data.password}\n`
    }

    if (data.host_email) {
      message += `👤 **Hôte** : ${data.host_email}\n`
    }

    message += `👥 **Inscrits** : ${data.registrants_count || 0}\n`

    if (data.registration_url) {
      message += `\n🔗 **Lien d'inscription** : ${data.registration_url}\n`
    } else if (data.join_url) {
      message += `\n🔗 **Lien de la réunion** : ${data.join_url}\n`
    }

    return {
      success: true,
      details: {
        meeting_id: data.meeting_id,
        topic: data.topic,
        start_time: data.start_time,
        duration: data.duration,
        timezone: data.timezone,
        registration_url: data.registration_url,
        join_url: data.join_url,
        password: data.password,
        host_email: data.host_email,
        registrants_count: data.registrants_count || 0,
        status: data.status
      },
      userMessage: message
    }
  },

  /**
   * Formatte les détails d'une réunion avec liste des inscrits
   * @param {object} data - Données détaillées de la réunion
   * @returns {object}
   */
  formatDetailsWithRegistrants(data) {
    const baseResponse = this.formatDetailsResponse(data)

    if (data.registrants && data.registrants.length > 0) {
      const registrantsList = data.registrants
        .slice(0, 10) // Limiter à 10 pour éviter trop de tokens
        .map((r, index) => `${index + 1}. ${r.first_name} ${r.last_name} (${r.email})`)
        .join('\n')

      const moreText = data.registrants.length > 10
        ? `\n... et ${data.registrants.length - 10} autre(s)`
        : ''

      baseResponse.userMessage += `\n\n**Inscrits :**\n${registrantsList}${moreText}`
    }

    return baseResponse
  },

  /**
   * Formatte les erreurs
   * @param {Error} error - Erreur à formater
   * @returns {object}
   */
  formatError(error) {
    const errorMessage = error.message || 'Une erreur inconnue s\'est produite'

    // Extraire des informations structurées si l'erreur vient de l'API
    let structuredError = null
    try {
      // Si l'erreur contient des données JSON dans le message
      if (errorMessage.includes('{') && errorMessage.includes('}')) {
        const jsonMatch = errorMessage.match(/\{.*\}/)
        if (jsonMatch) {
          structuredError = JSON.parse(jsonMatch[0])
        }
      }
    } catch (e) {
      // Ignore les erreurs de parsing
    }

    // Message spécifique pour les activités non approuvées
    if (structuredError?.error === 'Activity not approved' || errorMessage.includes('doit être approuvée')) {
      return {
        success: false,
        error: 'Activity not approved',
        validation_status: structuredError?.validation_status,
        userMessage: `❌ ${structuredError?.message || errorMessage}`
      }
    }

    return {
      success: false,
      error: errorMessage,
      userMessage: `❌ ${errorMessage}`
    }
  },

  /**
   * Formatte une réponse générique de succès
   * @param {string} message - Message à formater
   * @returns {object}
   */
  formatSuccess(message) {
    return {
      success: true,
      userMessage: `✅ ${message}`
    }
  },

  /**
   * Formatte la réponse après l'approbation d'une activité et création de réunion Zoom
   * @param {object} data - Données de l'approbation et de la réunion créée
   * @returns {object}
   */
  formatApproveResponse(data) {
    console.log('[Formatter] formatApproveResponse called with data:', JSON.stringify(data, null, 2))

    // Vérifier d'abord si c'est une erreur explicite
    if (data.error && !data.join_url) {
      console.log('[Formatter] Error detected in response')
      return {
        success: false,
        error: data.error,
        message: data.message || data.error,
        userMessage: `❌ ${data.message || data.error}`
      }
    }

    // Si l'activité était déjà approuvée
    if (data.already_approved) {
      console.log('[Formatter] Activity already approved')
      return {
        success: true,
        message: 'Activité déjà approuvée',
        details: {
          validation_status: data.validation_status,
          zoom_meeting_id: data.zoom_meeting_id
        },
        userMessage: `✅ L'activité est déjà approuvée.${data.zoom_meeting_id ? ' Une réunion Zoom est déjà associée.' : ''}`
      }
    }

    // Si l'approbation a réussi avec création de réunion Zoom COMPLÈTE
    if ((data.registration_url || data.join_url) && data.meeting_id) {
      console.log('[Formatter] Full success - activity approved and Zoom meeting created')
      return {
        success: true,
        message: 'Activité approuvée et réunion Zoom créée avec succès',
        details: {
          activity_id: data.activity_id,
          activity_title: data.activity_title,
          validation_status: data.validation_status,
          zoom_meeting_id: data.zoom_meeting_id,
          meeting_id: data.meeting_id,
          registration_url: data.registration_url,
          join_url: data.join_url,
          password: data.password
        },
        userMessage: `✅ **Activité approuvée avec succès !**\n\n` +
          `🎉 Réunion Zoom créée automatiquement\n` +
          `🔗 **Lien d'inscription** : ${data.registration_url || data.join_url}\n` +
          `🔑 **Mot de passe** : ${data.password || 'nego2025'}\n` +
          `📋 **ID réunion** : ${data.meeting_id}`
      }
    }

    // Si on arrive ici, c'est un cas incomplet ou une erreur partielle
    console.log('[Formatter] Partial success or error - no join_url')

    // Si validation_status = 'approved' mais pas de réunion créée
    if (data.validation_status === 'approved' && !data.join_url) {
      return {
        success: false,  // CHANGÉ: false car la réunion n'a pas été créée
        error: data.warning || data.error || 'Zoom meeting creation failed',
        message: 'Activité approuvée mais échec création Zoom',
        details: {
          activity_id: data.activity_id,
          validation_status: data.validation_status
        },
        userMessage: `⚠️ L'activité a été approuvée mais la création de la réunion Zoom a échoué.\n\nErreur : ${data.warning || data.error || 'Erreur inconnue'}`
      }
    }

    // Cas par défaut: quelque chose s'est mal passé
    return {
      success: false,
      error: 'Unexpected response format',
      message: JSON.stringify(data),
      userMessage: `❌ Erreur inattendue lors de l'approbation. Données reçues : ${JSON.stringify(data)}`
    }
  }
}
