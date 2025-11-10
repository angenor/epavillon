import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

/**
 * Composable pour gérer les directs YouTube des activités
 */
export function useYoutubeLivestream() {
  const { supabase } = useSupabase()

  // État
  const activities = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Déterminer le statut d'une activité par rapport à son direct YouTube
   * @param {Object} activity - L'activité à analyser
   * @returns {Object} - { status, priority, message }
   */
  const getActivityStreamStatus = (activity) => {
    const now = new Date()
    const startDate = new Date(activity.final_start_date || activity.proposed_start_date)
    const endDate = new Date(activity.final_end_date || activity.proposed_end_date)

    // Si l'activité est annulée
    if (activity.activity_status === 'cancelled') {
      return {
        status: 'cancelled',
        priority: 0,
        message: 'Activité annulée',
        cssClass: 'bg-gray-100 dark:bg-gray-800'
      }
    }

    // Si l'événement est terminé
    if (endDate < now) {
      return {
        status: 'finished',
        priority: 0,
        message: 'Événement terminé',
        cssClass: 'bg-gray-100 dark:bg-gray-800'
      }
    }

    // Si le direct est en cours
    if (startDate <= now && endDate >= now) {
      if (!activity.youtube_link) {
        return {
          status: 'live_missing_link',
          priority: 10,
          message: 'URGENT : Direct en cours sans lien YouTube !',
          cssClass: 'bg-red-100 dark:bg-red-900 border-2 border-red-500'
        }
      }
      return {
        status: 'live',
        priority: 9,
        message: 'Direct en cours',
        cssClass: 'bg-green-100 dark:bg-green-900 border-2 border-green-500'
      }
    }

    // Calculer le temps restant avant le direct
    const hoursUntilStart = (startDate - now) / (1000 * 60 * 60)

    // Moins de 2 heures avant le direct
    if (hoursUntilStart <= 2) {
      if (!activity.youtube_link) {
        return {
          status: 'imminent_missing_link',
          priority: 8,
          message: 'URGENT : Direct dans moins de 2h sans lien YouTube !',
          cssClass: 'bg-orange-100 dark:bg-orange-900 border-2 border-orange-500'
        }
      }
      return {
        status: 'imminent',
        priority: 7,
        message: `Direct dans ${Math.ceil(hoursUntilStart)}h`,
        cssClass: 'bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500'
      }
    }

    // Moins de 24 heures avant le direct
    if (hoursUntilStart <= 24) {
      if (!activity.youtube_link) {
        return {
          status: 'upcoming_missing_link',
          priority: 6,
          message: `Direct dans ${Math.ceil(hoursUntilStart)}h - Lien manquant`,
          cssClass: 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300'
        }
      }
      return {
        status: 'upcoming',
        priority: 5,
        message: `Direct dans ${Math.ceil(hoursUntilStart)}h`,
        cssClass: 'bg-blue-100 dark:bg-blue-900 border border-blue-300'
      }
    }

    // Prochaine activité (dans moins de 7 jours)
    const daysUntilStart = hoursUntilStart / 24
    if (daysUntilStart <= 7) {
      return {
        status: 'next',
        priority: 4,
        message: `Prochainement (${Math.ceil(daysUntilStart)} jours)`,
        cssClass: 'bg-blue-50 dark:bg-blue-900/20'
      }
    }

    // Activité future (plus de 7 jours)
    return {
      status: 'future',
      priority: 1,
      message: `Dans ${Math.ceil(daysUntilStart)} jours`,
      cssClass: 'bg-white dark:bg-gray-800'
    }
  }

  /**
   * Récupérer les activités avec leurs informations de direct
   * @param {string} eventId - Optionnel : filtrer par événement
   */
  const fetchActivitiesWithStreamStatus = async (eventId = null) => {
    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('activities')
        .select(`
          id,
          title,
          activity_status,
          proposed_start_date,
          proposed_end_date,
          final_start_date,
          final_end_date,
          youtube_link,
          validation_status,
          cover_image_low_url,
          event:events!inner(
            id,
            title,
            year
          ),
          organization:organizations(
            id,
            name
          )
        `)
        .eq('validation_status', 'approved')
        .eq('is_deleted', false)

      if (eventId) {
        query = query.eq('event_id', eventId)
      }

      const { data, error: fetchError } = await query.order('proposed_start_date', { ascending: true })

      if (fetchError) throw fetchError

      // Enrichir les activités avec leur statut de direct
      activities.value = (data || []).map(activity => {
        const streamStatus = getActivityStreamStatus(activity)
        return {
          ...activity,
          streamStatus
        }
      })

      // Trier par date de début (du plus imminent au moins imminent)
      activities.value.sort((a, b) => {
        const dateA = new Date(a.final_start_date || a.proposed_start_date)
        const dateB = new Date(b.final_start_date || b.proposed_start_date)
        return dateA - dateB
      })

    } catch (err) {
      console.error('Erreur lors de la récupération des activités:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Ajouter ou modifier le lien YouTube d'une activité
   * @param {string} activityId - ID de l'activité
   * @param {string} youtubeVideoId - ID de la vidéo YouTube
   */
  const updateYoutubeLink = async (activityId, youtubeVideoId) => {
    try {
      const { error: updateError } = await supabase
        .from('activities')
        .update({ youtube_link: youtubeVideoId })
        .eq('id', activityId)

      if (updateError) throw updateError

      // Mettre à jour localement
      const activity = activities.value.find(a => a.id === activityId)
      if (activity) {
        activity.youtube_link = youtubeVideoId
        activity.streamStatus = getActivityStreamStatus(activity)
      }

      return { success: true }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du lien YouTube:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Supprimer le lien YouTube d'une activité
   * @param {string} activityId - ID de l'activité
   */
  const removeYoutubeLink = async (activityId) => {
    return updateYoutubeLink(activityId, null)
  }

  /**
   * Activités nécessitant une attention urgente
   */
  const urgentActivities = computed(() => {
    return activities.value.filter(activity =>
      ['live_missing_link', 'imminent_missing_link'].includes(activity.streamStatus.status)
    )
  })

  /**
   * Activités avec direct en cours
   */
  const liveActivities = computed(() => {
    return activities.value.filter(activity =>
      activity.streamStatus.status === 'live'
    )
  })

  /**
   * Prochaines activités (imminent, upcoming, next)
   */
  const upcomingActivities = computed(() => {
    return activities.value.filter(activity =>
      ['imminent', 'upcoming', 'next'].includes(activity.streamStatus.status)
    )
  })

  /**
   * Activités à venir (futures, non commencées) + activités en cours
   */
  const futureActivities = computed(() => {
    return activities.value.filter(activity =>
      ['live', 'live_missing_link', 'imminent', 'imminent_missing_link', 'upcoming', 'upcoming_missing_link', 'next', 'future'].includes(activity.streamStatus.status)
    )
  })

  /**
   * Activités terminées
   */
  const finishedActivities = computed(() => {
    return activities.value.filter(activity =>
      activity.streamStatus.status === 'finished'
    )
  })

  /**
   * Activités annulées
   */
  const cancelledActivities = computed(() => {
    return activities.value.filter(activity =>
      activity.streamStatus.status === 'cancelled'
    )
  })

  return {
    // État
    activities,
    isLoading,
    error,

    // Computed
    urgentActivities,
    liveActivities,
    upcomingActivities,
    futureActivities,
    finishedActivities,
    cancelledActivities,

    // Méthodes
    fetchActivitiesWithStreamStatus,
    updateYoutubeLink,
    removeYoutubeLink,
    getActivityStreamStatus
  }
}
