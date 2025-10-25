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
        join_url: data.join_url,
        meeting_id: data.meeting_id,
        password: data.password
      },
      userMessage: `✅ Réunion Zoom créée.\nLien : ${data.join_url}${data.password ? `\nMot de passe : ${data.password}` : ''}`
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
        join_url: data.join_url,
        meeting_id: data.meeting_id
      },
      userMessage: `✅ Réunion Zoom mise à jour${fieldsText}.\nLien : ${data.join_url}`
    }
  },

  /**
   * Formatte les détails d'une réunion Zoom (version concise)
   * Optimisé pour réduire l'utilisation de tokens
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

    // Version concise sans la liste détaillée des inscrits
    const message = `${statusEmoji} **${data.topic}**\n` +
      `📅 ${startTime}\n` +
      `⏱️ Durée : ${data.duration} min\n` +
      `👥 Inscrits : ${data.registrants_count || 0}\n` +
      `🔗 ${data.join_url}`

    return {
      success: true,
      details: {
        meeting_id: data.meeting_id,
        topic: data.topic,
        start_time: data.start_time,
        duration: data.duration,
        join_url: data.join_url,
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
    // Si l'activité était déjà approuvée
    if (data.already_approved) {
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

    // Si l'approbation a réussi avec création de réunion Zoom
    if (data.join_url) {
      return {
        success: true,
        message: 'Activité approuvée et réunion Zoom créée avec succès',
        details: {
          activity_id: data.activity_id,
          activity_title: data.activity_title,
          validation_status: data.validation_status,
          zoom_meeting_id: data.zoom_meeting_id,
          meeting_id: data.meeting_id,
          join_url: data.join_url,
          password: data.password
        },
        userMessage: `✅ **Activité approuvée avec succès !**\n\n` +
          `🎉 Réunion Zoom créée automatiquement\n` +
          `🔗 Lien : ${data.join_url}\n` +
          `🔑 Mot de passe : ${data.password || 'Aucun'}\n` +
          `📋 ID réunion : ${data.meeting_id}`
      }
    }

    // Si l'approbation a réussi mais pas la création Zoom (cas d'erreur partiel)
    return {
      success: true,
      message: 'Activité approuvée',
      warning: data.warning || data.error,
      details: {
        activity_id: data.activity_id,
        validation_status: data.validation_status
      },
      userMessage: `✅ Activité approuvée.\n⚠️ ${data.warning || data.error || 'Création de la réunion Zoom à finaliser manuellement.'}`
    }
  }
}
