/**
 * Composable pour gérer les outils Zoom
 * Encapsule la logique d'interaction avec les edge functions
 */

import { ref } from 'vue'
import { zoomApiClient } from '@/utils/zoom/zoomApiClient'

export function useZoomMeetingTools() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Créer une réunion Zoom
   * @param {string} activityId - ID de l'activité
   * @returns {Promise<object>}
   */
  async function createMeeting(activityId) {
    loading.value = true
    error.value = null

    try {
      const result = await zoomApiClient.createMeeting(activityId)
      return result
    } catch (err) {
      console.error('Error creating Zoom meeting:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprimer une réunion Zoom
   * @param {string} activityId - ID de l'activité
   * @returns {Promise<object>}
   */
  async function deleteMeeting(activityId) {
    loading.value = true
    error.value = null

    try {
      const result = await zoomApiClient.deleteMeeting(activityId)
      return result
    } catch (err) {
      console.error('Error deleting Zoom meeting:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Éditer une réunion Zoom
   * @param {string} activityId - ID de l'activité
   * @param {object} updates - Modifications à apporter
   * @returns {Promise<object>}
   */
  async function editMeeting(activityId, updates) {
    loading.value = true
    error.value = null

    try {
      const result = await zoomApiClient.editMeeting(activityId, updates)
      return result
    } catch (err) {
      console.error('Error editing Zoom meeting:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer les détails d'une réunion depuis la base de données
   * @param {string} activityId - ID de l'activité
   * @returns {Promise<object>}
   */
  async function getMeetingDetails(activityId) {
    loading.value = true
    error.value = null

    try {
      const result = await zoomApiClient.getMeetingDetails(activityId)
      return result
    } catch (err) {
      console.error('Error getting meeting details:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer les détails complets d'une réunion depuis l'API Zoom
   * @param {string} activityId - ID de l'activité
   * @param {object} options - Options (include_registrants, max_registrants)
   * @returns {Promise<object>}
   */
  async function getMeetingDetailsFromZoom(activityId, options = {}) {
    loading.value = true
    error.value = null

    try {
      const result = await zoomApiClient.getMeetingDetailsFromZoom(activityId, options)
      return result
    } catch (err) {
      console.error('Error getting meeting details from Zoom:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // État
    loading,
    error,

    // Méthodes
    createMeeting,
    deleteMeeting,
    editMeeting,
    getMeetingDetails,
    getMeetingDetailsFromZoom
  }
}
