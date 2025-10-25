/**
 * Composable pour gérer les réunions Zoom
 *
 * Ce composable fournit des fonctions pour créer et gérer des réunions Zoom
 * associées aux activités du ePavilion.
 *
 * @module composables/zoom/useZoomMeeting
 */

import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

/**
 * Composable pour gérer les réunions Zoom
 * @returns {Object} Fonctions et états pour gérer les réunions Zoom
 */
export function useZoomMeeting() {
  const { supabase } = useSupabase()

  const isCreatingMeeting = ref(false)
  const creationError = ref(null)
  const meetingData = ref(null)
  const isDeletingMeeting = ref(false)
  const deletionError = ref(null)

  /**
   * Crée une réunion Zoom pour une activité
   *
   * Cette fonction appelle l'Edge Function Supabase qui :
   * 1. Récupère les informations de l'activité et de l'événement associé
   * 2. Crée une réunion Zoom via l'API Zoom en tenant compte du fuseau horaire
   * 3. Stocke les informations dans la table zoom_meetings
   * 4. Met à jour l'activité avec le zoom_meeting_id
   *
   * @param {string} activityId - L'ID de l'activité pour laquelle créer une réunion Zoom
   * @returns {Promise<Object>} Les informations de la réunion créée
   * @throws {Error} Si la création échoue
   */
  const createZoomMeeting = async (activityId) => {
    if (!activityId) {
      throw new Error('L\'ID de l\'activité est requis')
    }

    isCreatingMeeting.value = true
    creationError.value = null
    meetingData.value = null

    try {
      console.log('Création de la réunion Zoom pour l\'activité:', activityId)

      // Appeler l'Edge Function pour créer la réunion Zoom
      const { data, error } = await supabase.functions.invoke('create-zoom-meeting', {
        body: {
          activity_id: activityId
        }
      })

      if (error) {
        console.error('Erreur lors de la création de la réunion Zoom:', error)
        throw new Error(error.message || 'Erreur lors de la création de la réunion Zoom')
      }

      // Vérifier si la réponse contient une erreur
      if (data?.error) {
        console.error('Erreur retournée par l\'Edge Function:', data.error)
        throw new Error(data.error)
      }

      // Vérifier si c'est un avertissement (réunion créée mais pas liée)
      if (data?.warning) {
        console.warn('Avertissement:', data.warning)
      }

      console.log('Réunion Zoom créée avec succès:', data)
      meetingData.value = data

      return {
        success: true,
        data: {
          zoom_meeting_id: data.zoom_meeting_id,
          meeting_id: data.meeting_id,
          join_url: data.join_url,
          start_url: data.start_url,
          password: data.password,
          registration_url: data.registration_url
        },
        message: data.message,
        warning: data.warning
      }
    } catch (error) {
      console.error('Erreur lors de la création de la réunion Zoom:', error)
      creationError.value = error.message || 'Une erreur inattendue s\'est produite'

      return {
        success: false,
        error: creationError.value
      }
    } finally {
      isCreatingMeeting.value = false
    }
  }

  /**
   * Supprime une réunion Zoom pour une activité
   *
   * Cette fonction appelle l'Edge Function Supabase qui :
   * 1. Récupère les informations de l'activité et de la réunion Zoom associée
   * 2. Supprime la réunion Zoom via l'API Zoom
   * 3. Supprime l'entrée de la table zoom_meetings
   * 4. Met à jour l'activité en retirant le zoom_meeting_id
   *
   * @param {string} activityId - L'ID de l'activité dont supprimer la réunion Zoom
   * @returns {Promise<Object>} Le résultat de la suppression
   * @throws {Error} Si la suppression échoue
   */
  const deleteZoomMeeting = async (activityId) => {
    if (!activityId) {
      throw new Error('L\'ID de l\'activité est requis')
    }

    isDeletingMeeting.value = true
    deletionError.value = null

    try {
      console.log('Suppression de la réunion Zoom pour l\'activité:', activityId)

      // Appeler l'Edge Function pour supprimer la réunion Zoom
      const { data, error } = await supabase.functions.invoke('delete-zoom-meeting', {
        body: {
          activity_id: activityId
        }
      })

      console.log('Réponse complète de l\'Edge Function:', { data, error })

      if (error) {
        console.error('Erreur lors de la suppression de la réunion Zoom:', error)
        console.error('Détails de l\'erreur:', JSON.stringify(error, null, 2))

        // Construire un message d'erreur plus détaillé
        let errorMessage = error.message || 'Erreur lors de la suppression de la réunion Zoom'
        if (error.context) {
          errorMessage += ` - Context: ${JSON.stringify(error.context)}`
        }
        throw new Error(errorMessage)
      }

      // Vérifier si la réponse contient une erreur
      if (data?.error) {
        console.error('Erreur retournée par l\'Edge Function:', data.error)
        const errorDetails = data.details ? ` - ${data.details}` : ''
        throw new Error(data.error + errorDetails)
      }

      // Vérifier si c'est un avertissement (réunion supprimée mais activité non mise à jour)
      if (data?.warning) {
        console.warn('Avertissement:', data.warning)
      }

      console.log('Réunion Zoom supprimée avec succès:', data)

      return {
        success: true,
        message: data.message,
        warning: data.warning
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la réunion Zoom:', error)
      deletionError.value = error.message || 'Une erreur inattendue s\'est produite'

      return {
        success: false,
        error: deletionError.value
      }
    } finally {
      isDeletingMeeting.value = false
    }
  }

  /**
   * Récupère les informations d'une réunion Zoom
   *
   * @param {string} zoomMeetingId - L'ID de la réunion Zoom dans la base de données
   * @returns {Promise<Object|null>} Les informations de la réunion ou null si non trouvée
   */
  const getZoomMeetingInfo = async (zoomMeetingId) => {
    if (!zoomMeetingId) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('zoom_meetings')
        .select('*')
        .eq('id', zoomMeetingId)
        .single()

      if (error) {
        console.error('Erreur lors de la récupération des informations Zoom:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erreur lors de la récupération des informations Zoom:', error)
      return null
    }
  }

  /**
   * Vérifie si une activité a déjà une réunion Zoom associée
   *
   * @param {string} activityId - L'ID de l'activité à vérifier
   * @returns {Promise<boolean>} true si l'activité a une réunion Zoom, false sinon
   */
  const hasZoomMeeting = async (activityId) => {
    if (!activityId) {
      return false
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('zoom_meeting_id')
        .eq('id', activityId)
        .single()

      if (error) {
        console.error('Erreur lors de la vérification de la réunion Zoom:', error)
        return false
      }

      return !!data?.zoom_meeting_id
    } catch (error) {
      console.error('Erreur lors de la vérification de la réunion Zoom:', error)
      return false
    }
  }

  /**
   * Réinitialise les états du composable
   */
  const resetState = () => {
    isCreatingMeeting.value = false
    creationError.value = null
    meetingData.value = null
    isDeletingMeeting.value = false
    deletionError.value = null
  }

  return {
    // États
    isCreatingMeeting,
    creationError,
    meetingData,
    isDeletingMeeting,
    deletionError,

    // Fonctions
    createZoomMeeting,
    deleteZoomMeeting,
    getZoomMeetingInfo,
    hasZoomMeeting,
    resetState
  }
}
