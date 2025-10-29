/**
 * Composable pour gérer l'historique des modifications d'activité
 * Enregistre les changements dans la table activity_modifications
 */

import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'

export function useActivityModifications() {
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Enregistrer une modification dans l'historique
   * @param {string} activityId - ID de l'activité
   * @param {string} fieldName - Nom du champ modifié
   * @param {any} oldValue - Ancienne valeur
   * @param {any} newValue - Nouvelle valeur
   * @param {string} valueType - Type de valeur ('date', 'text', 'array', etc.)
   */
  const recordModification = async (activityId, fieldName, oldValue, newValue, valueType = 'date') => {
    if (!currentUser.value) {
      throw new Error('Utilisateur non authentifié')
    }

    try {
      isLoading.value = true
      error.value = null

      // Convertir les valeurs en JSONB
      const oldValueJson = oldValue !== null ? JSON.stringify(oldValue) : null
      const newValueJson = newValue !== null ? JSON.stringify(newValue) : null

      const { data, error: modificationError } = await supabase
        .from('activity_modifications')
        .insert({
          activity_id: activityId,
          field_name: fieldName,
          old_value: oldValueJson,
          new_value: newValueJson,
          old_value_type: valueType,
          new_value_type: valueType,
          modified_by: currentUser.value.id
        })
        .select()
        .single()

      if (modificationError) throw modificationError

      console.log(`✅ Modification enregistrée: ${fieldName}`, data)
      return { success: true, data }
    } catch (err) {
      console.error('❌ Erreur lors de l\'enregistrement de la modification:', err)
      error.value = err.message
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer l'historique des modifications d'une activité
   * @param {string} activityId - ID de l'activité
   */
  const getActivityModifications = async (activityId) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('activity_modifications')
        .select(`
          *,
          modifier:users!modified_by(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('activity_id', activityId)
        .order('modified_at', { ascending: false })

      if (fetchError) throw fetchError

      return { success: true, data: data || [] }
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des modifications:', err)
      error.value = err.message
      return { success: false, error: err, data: [] }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer les modifications d'un champ spécifique
   * @param {string} activityId - ID de l'activité
   * @param {string} fieldName - Nom du champ
   */
  const getFieldModifications = async (activityId, fieldName) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('activity_modifications')
        .select(`
          *,
          modifier:users!modified_by(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('activity_id', activityId)
        .eq('field_name', fieldName)
        .order('modified_at', { ascending: false })

      if (fetchError) throw fetchError

      return { success: true, data: data || [] }
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des modifications du champ:', err)
      error.value = err.message
      return { success: false, error: err, data: [] }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mettre à jour les dates validées d'une activité
   * @param {string} activityId - ID de l'activité
   * @param {string} finalStartDate - Nouvelle date de début validée
   * @param {string} finalEndDate - Nouvelle date de fin validée
   * @param {string} oldStartDate - Ancienne date de début validée
   * @param {string} oldEndDate - Ancienne date de fin validée
   */
  const updateValidatedDates = async (activityId, finalStartDate, finalEndDate, oldStartDate = null, oldEndDate = null) => {
    if (!currentUser.value) {
      throw new Error('Utilisateur non authentifié')
    }

    try {
      isLoading.value = true
      error.value = null

      // Mettre à jour les dates dans la table activities
      const { data: activityData, error: updateError } = await supabase
        .from('activities')
        .update({
          final_start_date: finalStartDate,
          final_end_date: finalEndDate
        })
        .eq('id', activityId)
        .select()
        .single()

      if (updateError) throw updateError

      // Enregistrer les modifications dans l'historique
      if (oldStartDate !== finalStartDate) {
        await recordModification(
          activityId,
          'final_start_date',
          oldStartDate,
          finalStartDate,
          'date'
        )
      }

      if (oldEndDate !== finalEndDate) {
        await recordModification(
          activityId,
          'final_end_date',
          oldEndDate,
          finalEndDate,
          'date'
        )
      }

      console.log('✅ Dates validées mises à jour avec succès')
      return { success: true, data: activityData }
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour des dates validées:', err)
      error.value = err.message
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    recordModification,
    getActivityModifications,
    getFieldModifications,
    updateValidatedDates
  }
}
