import { ref } from 'vue'
import { useSupabase } from './useSupabase'

export function useNegotiationSessions() {
  const { supabase } = useSupabase()
  
  const sessions = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchSessions = async (category = null) => {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase
        .from('negotiation_sessions')
        .select(`
          *,
          zoom_meeting:zoom_meetings(*),
          session_registrations(
            user_id,
            registered_at
          )
        `)
        .order('start_datetime', { ascending: true })
      
      if (category) {
        query = query.eq('category', category)
      }
      
      const { data, error: sessionError } = await query
      
      if (sessionError) throw sessionError
      
      // Get current user's registrations
      const { data: userData } = await supabase.auth.getUser()
      
      if (userData?.user) {
        const { data: userRegistrations } = await supabase
          .from('session_registrations')
          .select('session_id')
          .eq('user_id', userData.user.id)
        
        const registeredSessionIds = new Set(
          userRegistrations?.map(reg => reg.session_id) || []
        )
        
        // Add registration status and count
        sessions.value = data.map(session => ({
          ...session,
          is_registered: registeredSessionIds.has(session.id),
          registrations_count: session.session_registrations?.length || 0
        }))
      } else {
        sessions.value = data.map(session => ({
          ...session,
          is_registered: false,
          registrations_count: session.session_registrations?.length || 0
        }))
      }
      
    } catch (err) {
      error.value = err.message
      console.error('Error fetching negotiation sessions:', err)
    } finally {
      loading.value = false
    }
  }

  const registerToSession = async (sessionId) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')
    
    try {
      const { error: registrationError } = await supabase
        .from('session_registrations')
        .insert({
          session_id: sessionId,
          user_id: userData.user.id
        })
      
      if (registrationError) throw registrationError
      
      // Update local state
      const sessionIndex = sessions.value.findIndex(s => s.id === sessionId)
      if (sessionIndex !== -1) {
        sessions.value[sessionIndex].is_registered = true
        sessions.value[sessionIndex].registrations_count += 1
      }
      
    } catch (err) {
      console.error('Error registering to session:', err)
      throw err
    }
  }

  const unregisterFromSession = async (sessionId) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')
    
    try {
      const { error: unregistrationError } = await supabase
        .from('session_registrations')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userData.user.id)
      
      if (unregistrationError) throw unregistrationError
      
      // Update local state
      const sessionIndex = sessions.value.findIndex(s => s.id === sessionId)
      if (sessionIndex !== -1) {
        sessions.value[sessionIndex].is_registered = false
        sessions.value[sessionIndex].registrations_count = Math.max(0, sessions.value[sessionIndex].registrations_count - 1)
      }
      
    } catch (err) {
      console.error('Error unregistering from session:', err)
      throw err
    }
  }

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    registerToSession,
    unregisterFromSession
  }
}