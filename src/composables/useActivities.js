import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function useActivities() {
  const activities = ref([])
  const events = ref([])
  const trainings = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Récupérer les activités à venir
  const fetchUpcomingActivities = async (limit = 10) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('activities')
        .select(`
          id,
          title,
          objectives,
          format,
          proposed_start_date,
          proposed_end_date,
          validation_status,
          organization:organizations(name),
          event:events(title, year)
        `)
        .eq('validation_status', 'approved')
        .eq('is_deleted', false)
        .gte('proposed_start_date', new Date().toISOString())
        .order('proposed_start_date', { ascending: true })
        .limit(limit)

      if (supabaseError) throw supabaseError

      activities.value = data || []
    } catch (err) {
      console.error('Error fetching activities:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Récupérer les événements à venir
  const fetchUpcomingEvents = async (limit = 5) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          year,
          event_status,
          participation_mode,
          online_start_datetime,
          online_end_datetime,
          in_person_start_date,
          in_person_end_date,
          country:countries(name_fr, name_en),
          city
        `)
        .in('event_status', ['upcoming', 'ongoing'])
        .order('online_start_datetime', { ascending: true, nullsFirst: false })
        .order('in_person_start_date', { ascending: true, nullsFirst: false })
        .limit(limit)

      if (supabaseError) throw supabaseError

      events.value = data || []
    } catch (err) {
      console.error('Error fetching events:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Récupérer les formations à venir
  const fetchUpcomingTrainings = async (limit = 5) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('trainings')
        .select(`
          id,
          title,
          description,
          category,
          format,
          start_date,
          end_date,
          estimated_price,
          is_active
        `)
        .eq('is_active', true)
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(limit)

      if (supabaseError) throw supabaseError

      trainings.value = data || []
    } catch (err) {
      console.error('Error fetching trainings:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Récupérer les activités d'un événement spécifique
  const fetchEventActivities = async (eventId) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('activities')
        .select(`
          id,
          title,
          proposed_start_date,
          proposed_end_date,
          final_start_date,
          final_end_date,
          validation_status,
          organization:organizations(name)
        `)
        .eq('event_id', eventId)
        .eq('validation_status', 'approved')
        .eq('is_deleted', false)
        .order('proposed_start_date', { ascending: true })

      if (supabaseError) throw supabaseError

      return data || []
    } catch (err) {
      console.error('Error fetching event activities:', err)
      return []
    }
  }

  // Récupérer toutes les données pour le widget
  const fetchAllUpcoming = async () => {
    loading.value = true
    error.value = null

    try {
      await Promise.all([
        fetchUpcomingEvents(3),
        fetchUpcomingTrainings(2)
      ])
    } catch (err) {
      console.error('Error fetching upcoming data:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Computed pour formater les dates
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (datetime) => {
    if (!datetime) return ''
    return new Date(datetime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Computed pour déterminer le statut
  const getEventStatus = (event) => {
    const now = new Date()
    const startDate = event.online_start_datetime || event.in_person_start_date
    
    if (!startDate) return 'unknown'
    
    const start = new Date(startDate)
    
    if (event.event_status === 'ongoing') return 'ongoing'
    if (start > now) return 'upcoming'
    return 'past'
  }

  return {
    activities,
    events,
    trainings,
    loading,
    error,
    fetchUpcomingActivities,
    fetchUpcomingEvents,
    fetchUpcomingTrainings,
    fetchAllUpcoming,
    fetchEventActivities,
    formatDate,
    formatTime,
    getEventStatus
  }
}