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
  description: 'Supprime une réunion Zoom associée à une activité. Utilisez cet outil quand l\'utilisateur demande de supprimer/annuler une réunion Zoom.',
  schema: z.object({
    activity_id: z.string().describe('ID de l\'activité dont il faut supprimer la réunion Zoom')
  }),
  func: async ({ activity_id }) => {
    try {
      console.log('[Tool] Deleting Zoom meeting for activity:', activity_id)
      const result = await zoomApiClient.deleteMeeting(activity_id)
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
  description: 'Modifie une réunion Zoom (titre, date, durée, description). Utilisez cet outil quand l\'utilisateur demande de modifier/changer une réunion Zoom.',
  schema: z.object({
    activity_id: z.string().describe('ID de l\'activité dont il faut modifier la réunion Zoom'),
    updates: z.object({
      title: z.string().optional().describe('Nouveau titre de la réunion'),
      start_time: z.string().optional().describe('Nouvelle date/heure de début (format ISO 8601)'),
      duration: z.number().optional().describe('Nouvelle durée en minutes'),
      description: z.string().optional().describe('Nouvelle description/agenda')
    }).describe('Modifications à apporter à la réunion')
  }),
  func: async ({ activity_id, updates }) => {
    try {
      console.log('[Tool] Editing Zoom meeting for activity:', activity_id, updates)
      const result = await zoomApiClient.editMeeting(activity_id, updates)
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
    searchActivityByTitleTool,  // Toujours en premier pour chercher l'ID si nécessaire
    approveActivityTool,        // Nouvel outil pour approuver + créer Zoom automatiquement
    createZoomMeetingTool,
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
