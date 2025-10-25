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
   * Supprimer une réunion Zoom d'une activité
   * @param {string} activityId - ID de l'activité
   * @returns {Promise<object>}
   */
  async deleteMeeting(activityId) {
    const { data, error } = await supabase.functions.invoke('delete-zoom-meeting', {
      body: { activity_id: activityId }
    })

    if (error) throw error
    return data
  },

  /**
   * Éditer une réunion Zoom existante
   * @param {string} activityId - ID de l'activité
   * @param {object} updates - Modifications (title, start_time, duration, description)
   * @returns {Promise<object>}
   */
  async editMeeting(activityId, updates) {
    const { data, error } = await supabase.functions.invoke('edit-zoom-meeting', {
      body: {
        activity_id: activityId,
        updates: updates
      }
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
  }
}
