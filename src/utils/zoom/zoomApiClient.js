/**
 * Client API pour interagir avec les edge functions Zoom
 * Centralise tous les appels aux edge functions
 */

import { useSupabase } from '@/composables/useSupabase'

const { supabase } = useSupabase()

export const zoomApiClient = {
  /**
   * Créer une réunion Zoom pour une activité
   * @param {string} activityId - ID de l'activité
   * @returns {Promise<object>}
   */
  async createMeeting(activityId) {
    const { data, error } = await supabase.functions.invoke('create-zoom-meeting', {
      body: { activity_id: activityId }
    })

    if (error) throw error
    return data
  },

  /**
   * Supprimer une réunion Zoom
   * @param {object} identifier - Soit { activityId } pour réunion liée, soit { meetingId } pour standalone
   * @returns {Promise<object>}
   */
  async deleteMeeting(identifier) {
    const body = {}

    if (identifier.activityId) {
      body.activity_id = identifier.activityId
    } else if (identifier.meetingId) {
      body.meeting_id = identifier.meetingId
    } else {
      throw new Error('Either activityId or meetingId must be provided')
    }

    const { data, error } = await supabase.functions.invoke('delete-zoom-meeting', {
      body
    })

    if (error) throw error
    return data
  },

  /**
   * Éditer une réunion Zoom existante
   * @param {object} identifier - Soit { activityId } pour réunion liée, soit { meetingId } pour standalone
   * @param {object} updates - Modifications (title, start_time, duration, description)
   * @returns {Promise<object>}
   */
  async editMeeting(identifier, updates) {
    const body = { updates }

    if (identifier.activityId) {
      body.activity_id = identifier.activityId
    } else if (identifier.meetingId) {
      body.meeting_id = identifier.meetingId
    } else {
      throw new Error('Either activityId or meetingId must be provided')
    }

    const { data, error } = await supabase.functions.invoke('edit-zoom-meeting', {
      body
    })

    if (error) throw error
    return data
  },

  /**
   * Récupérer les détails d'une réunion Zoom depuis la base de données
   * @param {string} activityId - ID de l'activité
   * @returns {Promise<object>}
   */
  async getMeetingDetails(activityId) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        zoom_meeting_id,
        zoom_meetings (
          meeting_id,
          join_url,
          start_url,
          password
        )
      `)
      .eq('id', activityId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Récupérer les détails complets d'une réunion Zoom depuis l'API Zoom
   * (participants inscrits, métriques, etc.)
   * @param {string} activityId - ID de l'activité
   * @param {object} options - Options (include_registrants, max_registrants)
   * @returns {Promise<object>}
   */
  async getMeetingDetailsFromZoom(activityId, options = {}) {
    const { data, error } = await supabase.functions.invoke('get-zoom-meeting-details', {
      body: {
        activity_id: activityId,
        include_registrants: options.include_registrants ?? false,
        max_registrants: options.max_registrants ?? 100
      }
    })

    if (error) throw error
    return data
  },

  /**
   * Rechercher des activités par titre
   * @param {string} query - Titre ou partie du titre à rechercher
   * @param {number} limit - Nombre maximum de résultats (défaut: 5)
   * @returns {Promise<object>}
   */
  async searchActivities(query, limit = 5) {
    const { data, error } = await supabase.functions.invoke('search-activities', {
      body: {
        query: query,
        limit: limit
      }
    })

    if (error) throw error
    return data
  },

  /**
   * Rechercher des réunions Zoom par titre (topic)
   * @param {string} query - Titre ou partie du titre à rechercher
   * @param {number} limit - Nombre maximum de résultats (défaut: 10)
   * @returns {Promise<object>}
   */
  async searchZoomMeetings(query, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('zoom_meetings')
        .select(`
          id,
          meeting_id,
          topic,
          start_time,
          duration,
          join_url,
          registration_url,
          password,
          created_at,
          activities!zoom_meeting_id (
            id,
            title
          )
        `)
        .ilike('topic', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        success: true,
        count: data?.length || 0,
        meetings: data || []
      }
    } catch (error) {
      console.error('[zoomApiClient] Error searching zoom meetings:', error)
      throw error
    }
  },

  /**
   * Approuver une activité et créer automatiquement une réunion Zoom
   * @param {string} activityId - ID de l'activité à approuver
   * @param {string} approvedBy - ID de l'utilisateur qui approuve (optionnel)
   * @returns {Promise<object>}
   */
  async approveActivity(activityId, approvedBy = null) {
    const { data, error } = await supabase.functions.invoke('approve-activity', {
      body: {
        activity_id: activityId,
        approved_by: approvedBy
      }
    })

    if (error) throw error
    return data
  },

  /**
   * Créer une réunion Zoom standalone (non liée à une activité)
   * @param {object} meetingData - Données de la réunion
   * @param {string} meetingData.topic - Sujet de la réunion (obligatoire)
   * @param {number} meetingData.duration - Durée en minutes (obligatoire)
   * @param {number} meetingData.type - Type de réunion (1=instant, 2=scheduled, 3=recurring no fixed time, 8=recurring with fixed time)
   * @param {string} meetingData.start_time - Date/heure de début ISO 8601 (obligatoire pour type 2 et 8)
   * @param {string} meetingData.timezone - Fuseau horaire (défaut: UTC)
   * @param {string} meetingData.agenda - Description/ordre du jour (optionnel)
   * @param {string} meetingData.password - Mot de passe (optionnel)
   * @param {object} meetingData.settings - Paramètres de la réunion (optionnel)
   * @returns {Promise<object>}
   */
  async createStandaloneMeeting(meetingData) {
    const { data, error } = await supabase.functions.invoke('create-standalone-zoom-meeting', {
      body: meetingData
    })

    if (error) throw error
    return data
  }
}
