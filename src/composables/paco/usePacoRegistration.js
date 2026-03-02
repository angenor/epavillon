import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { PACO_ACTIVITY_ID } from '@/composables/paco/constants'

export function usePacoRegistration() {
  const loading = ref(false)
  const error = ref(null)
  const isRegistered = ref(false)

  /**
   * Check if an email corresponds to an existing user account.
   * Uses the RPC function check_paco_email (SECURITY DEFINER, accessible to anon).
   * @param {string} email
   * @returns {Promise<boolean>} true if the email exists
   */
  const checkEmailExists = async (email) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase.rpc('check_paco_email', {
        email_input: email.toLowerCase().trim()
      })

      if (rpcError) throw rpcError
      return !!data
    } catch (err) {
      console.error('Error checking email:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if a user is already registered for the PACO webinar.
   * @param {string} userId
   * @returns {Promise<boolean>} true if registered
   */
  const checkPacoRegistration = async (userId) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('activity_registrations')
        .select('id')
        .eq('activity_id', PACO_ACTIVITY_ID)
        .eq('user_id', userId)
        .maybeSingle()

      if (queryError) throw queryError

      isRegistered.value = !!data
      return !!data
    } catch (err) {
      console.error('Error checking PACO registration:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Register a user for the PACO webinar activity.
   * @param {string} userId
   * @returns {Promise<boolean>} true if registration succeeded
   */
  const registerForPaco = async (userId) => {
    loading.value = true
    error.value = null

    try {
      const { error: insertError } = await supabase
        .from('activity_registrations')
        .insert({
          activity_id: PACO_ACTIVITY_ID,
          user_id: userId,
          registration_type: 'user'
        })

      if (insertError) {
        // Unique constraint violation means already registered
        if (insertError.code === '23505') {
          isRegistered.value = true
          return true
        }
        throw insertError
      }

      isRegistered.value = true
      return true
    } catch (err) {
      console.error('Error registering for PACO:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    isRegistered,
    checkEmailExists,
    checkPacoRegistration,
    registerForPaco
  }
}
