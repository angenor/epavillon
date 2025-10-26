/**
 * Gestionnaire d'outils pour LangChain
 * Définit les outils (tools) que le chatbot peut utiliser
 * Optimisé pour minimiser l'utilisation de tokens
 */

import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { zoomApiClient } from '@/utils/zoom/zoomApiClient'
import { zoomToolsFormatter } from '@/utils/zoom/zoomToolsFormatter'

/**
 * Outil pour rechercher des activités par titre
 */
export const searchActivityByTitleTool = new DynamicStructuredTool({
  name: 'search_activity_by_title',
  description: 'Recherche des activités par titre (partiel ou complet). Utilise cet outil pour trouver l\'ID d\'une activité quand l\'utilisateur donne un titre.',
  schema: z.object({
    query: z.string().describe('Titre ou partie du titre de l\'activité à rechercher')
  }),
  func: async ({ query }) => {
    try {
      console.log('[Tool] Searching activities with query:', query)
      const result = await zoomApiClient.searchActivities(query, 5)

      if (!result.success || result.count === 0) {
        return JSON.stringify({
          success: false,
          message: `Aucune activité trouvée avec le titre "${query}"`,
          activities: []
        })
      }

      // Formater les résultats de manière concise
      const activities = result.activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        activity_status: activity.activity_status,
        validation_status: activity.validation_status,
        event: activity.event?.title
      }))

      return JSON.stringify({
        success: true,
        count: result.count,
        activities: activities,
        message: result.count === 1
          ? `Activité trouvée : "${activities[0].title}" (ID: ${activities[0].id})`
          : `${result.count} activités trouvées. Demande à l'utilisateur de préciser laquelle il souhaite.`
      })
    } catch (error) {
      console.error('[Tool] Error searching activities:', error)
      return JSON.stringify({
        success: false,
        error: error.message,
        message: `Erreur lors de la recherche d'activités : ${error.message}`
      })
    }
  }
})

/**
 * Outil pour rechercher des réunions Zoom par titre
 */
export const searchZoomMeetingByTitleTool = new DynamicStructuredTool({
  name: 'search_zoom_meeting_by_title',
  description: 'Recherche des réunions Zoom par titre/topic (partiel ou complet) dans la table zoom_meetings. Utilise cet outil pour trouver le meeting_id d\'une réunion Zoom quand l\'utilisateur donne un titre. Retourne les réunions avec leur meeting_id, topic, date, et activity_id associé si applicable.',
  schema: z.object({
    query: z.string().describe('Titre (topic) ou partie du titre de la réunion Zoom à rechercher')
  }),
  func: async ({ query }) => {
    try {
      console.log('[Tool] Searching Zoom meetings with query:', query)
      const result = await zoomApiClient.searchZoomMeetings(query, 10)

      if (!result.success || result.count === 0) {
        return JSON.stringify({
          success: false,
          message: `Aucune réunion Zoom trouvée avec le titre "${query}"`,
          meetings: []
        })
      }

      // Formater les résultats de manière concise
      const meetings = result.meetings.map(meeting => {
        // activities est un tableau car c'est une relation inversée
        const linkedActivity = meeting.activities && meeting.activities.length > 0 ? meeting.activities[0] : null

        return {
          meeting_id: meeting.meeting_id,
          topic: meeting.topic,
          start_time: meeting.start_time,
          duration: meeting.duration,
          registration_url: meeting.registration_url,
          password: meeting.password,
          activity_id: linkedActivity?.id || null,
          activity_title: linkedActivity?.title || 'Standalone'
        }
      })

      return JSON.stringify({
        success: true,
        count: result.count,
        meetings: meetings,
        message: result.count === 1
          ? `Réunion Zoom trouvée : "${meetings[0].topic}" (Meeting ID: ${meetings[0].meeting_id})`
          : `${result.count} réunions Zoom trouvées avec le titre "${query}". Demande à l'utilisateur de préciser laquelle il souhaite.`
      })
    } catch (error) {
      console.error('[Tool] Error searching Zoom meetings:', error)
      return JSON.stringify({
        success: false,
        error: error.message,
        message: `Erreur lors de la recherche de réunions Zoom : ${error.message}`
      })
    }
  }
})

/**
 * Outil pour créer une réunion Zoom
 */
export const createZoomMeetingTool = new DynamicStructuredTool({
  name: 'create_zoom_meeting',
  description: 'Crée une réunion Zoom pour une activité. Utilisez cet outil quand l\'utilisateur demande de créer/planifier une réunion Zoom.',
  schema: z.object({
    activity_id: z.string().describe('ID de l\'activité pour laquelle créer la réunion Zoom')
  }),
  func: async ({ activity_id }) => {
    try {
      console.log('[Tool] Creating Zoom meeting for activity:', activity_id)
      const result = await zoomApiClient.createMeeting(activity_id)
      const formatted = zoomToolsFormatter.formatCreateResponse(result)
      return JSON.stringify(formatted)
    } catch (error) {
      console.error('[Tool] Error creating Zoom meeting:', error)
      const formatted = zoomToolsFormatter.formatError(error)
      return JSON.stringify(formatted)
    }
  }
})

/**
 * Outil pour supprimer une réunion Zoom
 */
export const deleteZoomMeetingTool = new DynamicStructuredTool({
  name: 'delete_zoom_meeting',
  description: 'Supprime une réunion Zoom (liée à une activité ou standalone). Utilisez cet outil quand l\'utilisateur demande de supprimer/annuler une réunion Zoom. Fournissez soit activity_id (pour réunion liée) soit meeting_id (pour réunion standalone).',
  schema: z.object({
    activity_id: z.string().optional().describe('ID de l\'activité (pour réunion liée à une activité)'),
    meeting_id: z.string().optional().describe('ID Zoom de la réunion (pour réunion standalone)')
  }),
  func: async (params) => {
    try {
      const { activity_id, meeting_id } = params

      if (!activity_id && !meeting_id) {
        return JSON.stringify({
          success: false,
          error: 'Missing parameter',
          userMessage: '❌ Vous devez fournir soit activity_id soit meeting_id'
        })
      }

      console.log('[Tool] Deleting Zoom meeting:', params)

      const identifier = activity_id ? { activityId: activity_id } : { meetingId: meeting_id }
      const result = await zoomApiClient.deleteMeeting(identifier)
      const formatted = zoomToolsFormatter.formatDeleteResponse(result)
      return JSON.stringify(formatted)
    } catch (error) {
      console.error('[Tool] Error deleting Zoom meeting:', error)
      const formatted = zoomToolsFormatter.formatError(error)
      return JSON.stringify(formatted)
    }
  }
})

/**
 * Outil pour éditer une réunion Zoom
 */
export const editZoomMeetingTool = new DynamicStructuredTool({
  name: 'edit_zoom_meeting',
  description: 'Modifie une réunion Zoom (liée à une activité ou standalone). Fournissez soit activity_id (pour réunion liée) soit meeting_id (pour réunion standalone). Utilisez cet outil quand l\'utilisateur demande de modifier/changer une réunion Zoom.',
  schema: z.object({
    activity_id: z.string().optional().describe('ID de l\'activité (pour réunion liée à une activité)'),
    meeting_id: z.string().optional().describe('ID Zoom de la réunion (pour réunion standalone)'),
    updates: z.object({
      title: z.string().optional().describe('Nouveau titre de la réunion'),
      start_time: z.string().optional().describe('Nouvelle date/heure de début (format ISO 8601)'),
      duration: z.number().optional().describe('Nouvelle durée en minutes'),
      description: z.string().optional().describe('Nouvelle description/agenda')
    }).describe('Modifications à apporter à la réunion')
  }),
  func: async (params) => {
    try {
      const { activity_id, meeting_id, updates } = params

      if (!activity_id && !meeting_id) {
        return JSON.stringify({
          success: false,
          error: 'Missing parameter',
          userMessage: '❌ Vous devez fournir soit activity_id soit meeting_id'
        })
      }

      console.log('[Tool] Editing Zoom meeting:', params)

      const identifier = activity_id ? { activityId: activity_id } : { meetingId: meeting_id }
      const result = await zoomApiClient.editMeeting(identifier, updates)
      const formatted = zoomToolsFormatter.formatEditResponse(result)
      return JSON.stringify(formatted)
    } catch (error) {
      console.error('[Tool] Error editing Zoom meeting:', error)
      const formatted = zoomToolsFormatter.formatError(error)
      return JSON.stringify(formatted)
    }
  }
})

/**
 * Outil pour obtenir les détails d'une réunion Zoom
 * Version concise optimisée pour minimiser les tokens
 */
export const getZoomMeetingDetailsTool = new DynamicStructuredTool({
  name: 'get_zoom_meeting_details',
  description: 'Obtient les détails d\'une réunion Zoom (titre, date, durée, nombre d\'inscrits, lien). Utilisez cet outil quand l\'utilisateur demande des informations sur une réunion Zoom.',
  schema: z.object({
    activity_id: z.string().describe('ID de l\'activité'),
    include_registrants: z.boolean().optional().describe('Inclure la liste détaillée des inscrits (par défaut: false)')
  }),
  func: async ({ activity_id, include_registrants = false }) => {
    try {
      console.log('[Tool] Getting Zoom meeting details for activity:', activity_id)
      const result = await zoomApiClient.getMeetingDetailsFromZoom(activity_id, {
        include_registrants: include_registrants,
        max_registrants: 100
      })

      // Utiliser le formateur approprié selon si on inclut les inscrits ou non
      const formatted = include_registrants
        ? zoomToolsFormatter.formatDetailsWithRegistrants(result)
        : zoomToolsFormatter.formatDetailsResponse(result)

      return JSON.stringify(formatted)
    } catch (error) {
      console.error('[Tool] Error getting Zoom meeting details:', error)
      const formatted = zoomToolsFormatter.formatError(error)
      return JSON.stringify(formatted)
    }
  }
})

/**
 * Outil pour approuver une activité et créer automatiquement une réunion Zoom
 */
export const approveActivityTool = new DynamicStructuredTool({
  name: 'approve_activity',
  description: 'Approuve une activité (change son statut à "approved") et crée automatiquement une réunion Zoom associée. Utilisez cet outil quand l\'utilisateur demande de valider/approuver une activité.',
  schema: z.object({
    activity_id: z.string().describe('ID de l\'activité à approuver')
  }),
  func: async ({ activity_id }) => {
    try {
      console.log('[Tool] Approving activity and creating Zoom meeting:', activity_id)
      const result = await zoomApiClient.approveActivity(activity_id)
      console.log('[Tool] Raw result from API:', JSON.stringify(result, null, 2))
      const formatted = zoomToolsFormatter.formatApproveResponse(result)
      console.log('[Tool] Formatted response:', JSON.stringify(formatted, null, 2))
      return JSON.stringify(formatted)
    } catch (error) {
      console.error('[Tool] Error approving activity:', error)
      console.error('[Tool] Error details:', error.message, error.stack)
      const formatted = zoomToolsFormatter.formatError(error)
      console.log('[Tool] Formatted error:', JSON.stringify(formatted, null, 2))
      return JSON.stringify(formatted)
    }
  }
})

/**
 * Outil pour créer une réunion Zoom standalone (non liée à une activité)
 */
export const createStandaloneZoomMeetingTool = new DynamicStructuredTool({
  name: 'create_standalone_zoom_meeting',
  description: `Crée une réunion Zoom standalone (non liée à une activité). Utilise cet outil quand l'utilisateur demande de créer une réunion Zoom sans mentionner d'activité.

PARAMÈTRES OBLIGATOIRES :
- topic : Sujet de la réunion
- duration : Durée en minutes
- start_time : Date/heure de début au format ISO 8601 (ex: "2024-12-25T14:00:00Z") - OBLIGATOIRE pour réunions planifiées

PARAMÈTRES OPTIONNELS :
- type : 1=instant, 2=planifiée (défaut), 3=récurrente sans heure fixe, 8=récurrente avec heure fixe
- timezone : Fuseau horaire (ex: "America/Montreal", "Europe/Paris", défaut: "UTC")
- agenda : Description/ordre du jour
- password : Mot de passe de la réunion
- settings : Objet avec les paramètres (host_video, participant_video, waiting_room, etc.)

Si des informations obligatoires manquent, l'outil retournera une erreur explicite.`,
  schema: z.object({
    topic: z.string().describe('Sujet de la réunion (OBLIGATOIRE)'),
    duration: z.number().describe('Durée de la réunion en minutes (OBLIGATOIRE)'),
    start_time: z.string().optional().describe('Date/heure de début au format ISO 8601 (ex: "2024-12-25T14:00:00Z"). OBLIGATOIRE pour réunions planifiées'),
    type: z.number().optional().describe('Type de réunion : 1=instant, 2=planifiée, 3=récurrente sans heure fixe, 8=récurrente avec heure fixe (défaut: 2)'),
    timezone: z.string().optional().describe('Fuseau horaire (ex: "America/Montreal", "Europe/Paris", défaut: "UTC")'),
    agenda: z.string().optional().describe('Description/ordre du jour de la réunion'),
    password: z.string().optional().describe('Mot de passe de la réunion'),
    settings: z.object({
      host_video: z.boolean().optional().describe('Activer la vidéo de l\'hôte au démarrage'),
      participant_video: z.boolean().optional().describe('Activer la vidéo des participants au démarrage'),
      join_before_host: z.boolean().optional().describe('Permettre aux participants de rejoindre avant l\'hôte'),
      waiting_room: z.boolean().optional().describe('Activer la salle d\'attente'),
      mute_upon_entry: z.boolean().optional().describe('Mettre les participants en sourdine à l\'entrée'),
      approval_type: z.number().optional().describe('Type d\'approbation : 0=automatique, 1=manuelle, 2=pas de registration'),
      auto_recording: z.string().optional().describe('Enregistrement automatique : "local", "cloud", "none"')
    }).optional().describe('Paramètres de la réunion')
  }),
  func: async (params) => {
    try {
      console.log('[Tool] Creating standalone Zoom meeting:', params)
      const result = await zoomApiClient.createStandaloneMeeting(params)
      const formatted = zoomToolsFormatter.formatStandaloneCreateResponse(result)
      return JSON.stringify(formatted)
    } catch (error) {
      console.error('[Tool] Error creating standalone Zoom meeting:', error)
      const formatted = zoomToolsFormatter.formatError(error)
      return JSON.stringify(formatted)
    }
  }
})

/**
 * Retourne tous les outils Zoom disponibles pour un utilisateur
 * @param {string} userRole - Rôle de l'utilisateur
 * @returns {Array} Liste des outils disponibles
 */
export function getZoomTools(userRole) {
  // Vérifier que l'utilisateur a les permissions nécessaires
  const allowedRoles = ['admin', 'super_admin']

  if (!allowedRoles.includes(userRole)) {
    console.log('[Tools] User role not allowed for Zoom tools:', userRole)
    return [] // Pas d'outils disponibles pour ce rôle
  }

  console.log('[Tools] Returning Zoom tools for role:', userRole)

  return [
    searchActivityByTitleTool,        // Chercher l'ID d'une activité par titre
    searchZoomMeetingByTitleTool,     // Chercher le meeting_id d'une réunion Zoom par titre
    approveActivityTool,              // Approuver une activité + créer Zoom automatiquement
    createZoomMeetingTool,            // Créer une réunion Zoom pour une activité existante
    createStandaloneZoomMeetingTool,  // Créer une réunion Zoom standalone (sans activité)
    deleteZoomMeetingTool,
    editZoomMeetingTool,
    getZoomMeetingDetailsTool
  ]
}

/**
 * Vérifie si un utilisateur peut utiliser les outils Zoom
 * @param {string} userRole - Rôle de l'utilisateur
 * @returns {boolean}
 */
export function canUseZoomTools(userRole) {
  const allowedRoles = ['admin', 'super_admin']
  return allowedRoles.includes(userRole)
}
