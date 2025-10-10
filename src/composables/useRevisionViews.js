import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

/**
 * Composable pour gérer le suivi des activités vues par les révisionnistes
 */
export function useRevisionViews() {
  const { supabase } = useSupabase()
  const viewedActivities = ref(new Set())
  const isLoading = ref(false)

  /**
   * Enregistre qu'un révisionniste a vu une activité
   * @param {string|number} activityId - ID de l'activité
   */
  const recordActivityView = async (activityId) => {
    if (!activityId) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Appeler la fonction RPC pour enregistrer/mettre à jour la vue
      const { error } = await supabase.rpc('record_activity_view', {
        p_activity_id: activityId,
        p_revisionniste_id: user.id
      })

      if (error) throw error

      // Ajouter à la liste locale des activités vues
      viewedActivities.value.add(String(activityId))
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la vue:', error)
    }
  }

  /**
   * Charge toutes les activités vues par le révisionniste actuel
   */
  const loadViewedActivities = async () => {
    isLoading.value = true

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('revisionniste_activity_views')
        .select('activity_id')
        .eq('revisionniste_id', user.id)

      if (error) throw error

      // Convertir en Set pour un accès rapide
      viewedActivities.value = new Set(
        (data || []).map(view => String(view.activity_id))
      )
    } catch (error) {
      console.error('Erreur lors du chargement des activités vues:', error)
      viewedActivities.value = new Set()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Vérifie si une activité a été vue
   * @param {string|number} activityId - ID de l'activité
   * @returns {boolean}
   */
  const hasViewedActivity = (activityId) => {
    return viewedActivities.value.has(String(activityId))
  }

  /**
   * Charge les statistiques de vues pour une activité
   * @param {string|number} activityId - ID de l'activité
   * @returns {Promise<Object>} - Statistiques de vues
   */
  const getActivityViewStats = async (activityId) => {
    try {
      const { data, error } = await supabase
        .from('revisionniste_activity_views')
        .select('revisionniste_id, view_count, first_viewed_at, last_viewed_at')
        .eq('activity_id', activityId)

      if (error) throw error

      return {
        totalReviewers: data?.length || 0,
        totalViews: data?.reduce((sum, view) => sum + view.view_count, 0) || 0,
        reviewers: data || []
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats de vues:', error)
      return {
        totalReviewers: 0,
        totalViews: 0,
        reviewers: []
      }
    }
  }

  return {
    viewedActivities,
    isLoading,
    recordActivityView,
    loadViewedActivities,
    hasViewedActivity,
    getActivityViewStats
  }
}
