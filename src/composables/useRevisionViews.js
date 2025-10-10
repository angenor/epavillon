import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

// État partagé (singleton) pour tous les composants
const viewedActivities = ref(new Set())
const isLoading = ref(false)

/**
 * Composable pour gérer le suivi des activités vues par les révisionnistes
 * Utilise un état singleton partagé entre tous les composants
 */
export function useRevisionViews() {
  const { supabase } = useSupabase()

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

  /**
   * Récupère le nombre de vues du révisionniste actuel pour une activité
   * @param {string|number} activityId - ID de l'activité
   * @returns {Promise<number>} - Nombre de vues
   */
  const getCurrentUserViewCount = async (activityId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return 0

      const { data, error } = await supabase
        .from('revisionniste_activity_views')
        .select('view_count')
        .eq('activity_id', activityId)
        .eq('revisionniste_id', user.id)
        .single()

      if (error) {
        // Si aucune vue n'existe, retourner 0
        if (error.code === 'PGRST116') return 0
        throw error
      }

      return data?.view_count || 0
    } catch (error) {
      console.error('Erreur lors du chargement du compteur de vues:', error)
      return 0
    }
  }

  /**
   * Réinitialise les vues d'une activité pour le révisionniste actuel (marquer comme non-lu)
   * @param {string|number} activityId - ID de l'activité
   */
  const resetActivityView = async (activityId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const errorMsg = 'Aucun utilisateur connecté pour réinitialiser la vue'
        console.warn(errorMsg)
        throw new Error(errorMsg)
      }

      console.log('🔄 Réinitialisation de la vue pour:', {
        activityId: activityId,
        userId: user.id
      })

      const { data, error } = await supabase
        .from('revisionniste_activity_views')
        .delete()
        .eq('activity_id', activityId)
        .eq('revisionniste_id', user.id)
        .select()

      if (error) {
        console.error('❌ Erreur Supabase lors de la suppression:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })

        // Vérifier si c'est un problème de permissions RLS
        if (error.code === '42501' || error.message?.includes('policy')) {
          throw new Error('Permission refusée. La politique RLS pour supprimer les vues n\'est pas configurée. Veuillez exécuter la migration add_delete_policy_activity_views.sql')
        }

        throw error
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ Aucune ligne supprimée. L\'enregistrement n\'existait peut-être pas.')
      } else {
        console.log('✅ Suppression réussie, lignes supprimées:', data)
      }

      // Retirer de la liste locale des activités vues
      const activityIdStr = String(activityId)
      const wasDeleted = viewedActivities.value.delete(activityIdStr)
      console.log(`🗑️ Activité ${activityIdStr} retirée du Set local:`, wasDeleted)
      console.log('📋 État actuel du Set:', Array.from(viewedActivities.value))

      return { success: true, deletedRows: data?.length || 0 }

    } catch (error) {
      console.error('💥 Erreur lors de la réinitialisation de la vue:', error)
      throw error
    }
  }

  return {
    viewedActivities,
    isLoading,
    recordActivityView,
    loadViewedActivities,
    hasViewedActivity,
    getActivityViewStats,
    getCurrentUserViewCount,
    resetActivityView
  }
}
