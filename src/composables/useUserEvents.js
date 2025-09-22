import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

export default function useUserEvents() {
  const { supabase } = useSupabase()
  const loading = ref(false)
  const error = ref(null)

  const loadUserEvents = async (userId) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          event_registrations(count)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Process events to add registration count
      const processedEvents = data.map(event => ({
        ...event,
        registration_count: event.event_registrations?.[0]?.count || 0
      }))

      return processedEvents
    } catch (err) {
      error.value = err.message
      console.error('Error loading user events:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const deleteUserEvent = async (eventId) => {
    loading.value = true
    error.value = null

    try {
      // First delete related registrations
      await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)

      // Then delete the event
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting event:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const duplicateUserEvent = async (eventId) => {
    loading.value = true
    error.value = null

    try {
      // First fetch the event to duplicate
      const { data: originalEvent, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (fetchError) throw fetchError

      // Create a copy with modified title and status
      const newEvent = {
        ...originalEvent,
        id: undefined, // Let the database generate a new ID
        title: `${originalEvent.title} (Copy)`,
        status: 'draft',
        created_at: undefined,
        updated_at: undefined
      }

      // Insert the duplicate
      const { data: duplicatedEvent, error: insertError } = await supabase
        .from('events')
        .insert(newEvent)
        .select()
        .single()

      if (insertError) throw insertError

      return duplicatedEvent
    } catch (err) {
      error.value = err.message
      console.error('Error duplicating event:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateEventField = async (eventId, field, value) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('events')
        .update({ [field]: value })
        .eq('id', eventId)
        .select()
        .single()

      if (updateError) throw updateError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating event field:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const getEventStats = async (eventId) => {
    loading.value = true
    error.value = null

    try {
      // Get registration count
      const { count: registrationCount, error: countError } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)

      if (countError) throw countError

      // Get registrations by status
      const { data: statusData, error: statusError } = await supabase
        .from('event_registrations')
        .select('registration_status')
        .eq('event_id', eventId)

      if (statusError) throw statusError

      const statusCounts = statusData.reduce((acc, reg) => {
        acc[reg.registration_status] = (acc[reg.registration_status] || 0) + 1
        return acc
      }, {})

      return {
        total: registrationCount || 0,
        confirmed: statusCounts.confirmed || 0,
        pending: statusCounts.pending || 0,
        cancelled: statusCounts.cancelled || 0
      }
    } catch (err) {
      error.value = err.message
      console.error('Error getting event stats:', err)
      return {
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0
      }
    } finally {
      loading.value = false
    }
  }

  const getEventRegistrations = async (eventId) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('event_registrations')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            organization,
            profile_photo_thumbnail_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error loading event registrations:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    loadUserEvents,
    deleteUserEvent,
    duplicateUserEvent,
    updateEventField,
    getEventStats,
    getEventRegistrations
  }
}