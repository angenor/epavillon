import { ref } from 'vue'
import { useSupabase } from './useSupabase'

export function useFrancophonieMeetings() {
  const { supabase } = useSupabase()
  
  const meetings = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchMeetings = async (category = null) => {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase
        .from('francophonie_meetings')
        .select(`
          *,
          country:countries(*),
          zoom_meeting:zoom_meetings(*),
          francophonie_meeting_registrations!inner(
            user_id,
            registered_at
          )
        `)
        .order('start_datetime', { ascending: true })
      
      if (category) {
        query = query.eq('category', category)
      }
      
      const { data, error: meetingsError } = await query
      
      if (meetingsError) throw meetingsError
      
      // Get current user's registrations
      const { data: userData } = await supabase.auth.getUser()
      
      if (userData?.user) {
        const { data: userRegistrations } = await supabase
          .from('francophonie_meeting_registrations')
          .select('meeting_id')
          .eq('user_id', userData.user.id)
        
        const registeredMeetingIds = new Set(
          userRegistrations?.map(reg => reg.meeting_id) || []
        )
        
        // Add registration status and count
        meetings.value = data.map(meeting => ({
          ...meeting,
          is_registered: registeredMeetingIds.has(meeting.id),
          registrations_count: meeting.francophonie_meeting_registrations?.length || 0
        }))
      } else {
        meetings.value = data.map(meeting => ({
          ...meeting,
          is_registered: false,
          registrations_count: meeting.francophonie_meeting_registrations?.length || 0
        }))
      }
      
    } catch (err) {
      error.value = err.message
      console.error('Error fetching francophonie meetings:', err)
    } finally {
      loading.value = false
    }
  }

  const registerToMeeting = async (meetingId) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')
    
    try {
      const { error: registrationError } = await supabase
        .from('francophonie_meeting_registrations')
        .insert({
          meeting_id: meetingId,
          user_id: userData.user.id
        })
      
      if (registrationError) throw registrationError
      
      // Update local state
      const meetingIndex = meetings.value.findIndex(m => m.id === meetingId)
      if (meetingIndex !== -1) {
        meetings.value[meetingIndex].is_registered = true
        meetings.value[meetingIndex].registrations_count += 1
      }
      
    } catch (err) {
      console.error('Error registering to meeting:', err)
      throw err
    }
  }

  const unregisterFromMeeting = async (meetingId) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')
    
    try {
      const { error: unregistrationError } = await supabase
        .from('francophonie_meeting_registrations')
        .delete()
        .eq('meeting_id', meetingId)
        .eq('user_id', userData.user.id)
      
      if (unregistrationError) throw unregistrationError
      
      // Update local state
      const meetingIndex = meetings.value.findIndex(m => m.id === meetingId)
      if (meetingIndex !== -1) {
        meetings.value[meetingIndex].is_registered = false
        meetings.value[meetingIndex].registrations_count = Math.max(0, meetings.value[meetingIndex].registrations_count - 1)
      }
      
    } catch (err) {
      console.error('Error unregistering from meeting:', err)
      throw err
    }
  }

  const getMeetingById = async (meetingId) => {
    try {
      const { data, error: meetingError } = await supabase
        .from('francophonie_meetings')
        .select(`
          *,
          country:countries(*),
          zoom_meeting:zoom_meetings(*),
          francophonie_meeting_registrations(
            user_id,
            registered_at,
            user:users(first_name, last_name, email, organization_id)
          )
        `)
        .eq('id', meetingId)
        .single()
      
      if (meetingError) throw meetingError
      
      // Check if current user is registered
      const { data: userData } = await supabase.auth.getUser()
      let isRegistered = false
      
      if (userData?.user) {
        isRegistered = data.francophonie_meeting_registrations?.some(
          reg => reg.user_id === userData.user.id
        ) || false
      }
      
      return {
        ...data,
        is_registered: isRegistered,
        registrations_count: data.francophonie_meeting_registrations?.length || 0
      }
      
    } catch (err) {
      console.error('Error fetching meeting details:', err)
      throw err
    }
  }

  return {
    meetings,
    loading,
    error,
    fetchMeetings,
    registerToMeeting,
    unregisterFromMeeting,
    getMeetingById
  }
}