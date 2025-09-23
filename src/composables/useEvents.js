import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

export default function useEvents() {
  const { supabase } = useSupabase()
  const events = ref([])
  const currentEvent = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchAllEvents = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          acronym,
          description,
          year,
          event_status,
          submission_status,
          banner_low_quality_16_9_url,
          online_start_datetime,
          online_end_datetime,
          created_at
        `)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      events.value = data || []
      return { data: events.value, error: null }
    } catch (err) {
      console.error('Error fetching events:', err)
      error.value = err.message
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  const fetchEventById = async (eventId) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          countries (
            id,
            name_fr,
            name_en
          )
        `)
        .eq('id', eventId)
        .single()

      if (fetchError) throw fetchError

      currentEvent.value = data
      return { data, error: null }
    } catch (err) {
      console.error('Error fetching event:', err)
      error.value = err.message
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  const fetchActiveEvents = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          acronym,
          year,
          event_status,
          submission_status
        `)
        .in('event_status', ['upcoming', 'ongoing'])
        .order('year', { ascending: false })

      if (fetchError) throw fetchError

      events.value = data || []
      return { data: events.value, error: null }
    } catch (err) {
      console.error('Error fetching active events:', err)
      error.value = err.message
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  const setCurrentEvent = (event) => {
    currentEvent.value = event
  }

  return {
    events,
    currentEvent,
    loading,
    error,
    fetchAllEvents,
    fetchEventById,
    fetchActiveEvents,
    setCurrentEvent
  }
}