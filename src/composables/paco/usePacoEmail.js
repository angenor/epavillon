import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function usePacoEmail() {
  const loading = ref(false)
  const error = ref(null)
  const success = ref(false)

  /**
   * Send the PACO webinar confirmation email with the Teams link.
   * Calls the dedicated edge function send-paco-email.
   * @param {string} recipientEmail
   * @param {string} recipientName
   * @returns {Promise<boolean>} true if the email was sent successfully
   */
  const sendPacoEmail = async (recipientEmail, recipientName) => {
    loading.value = true
    error.value = null
    success.value = false

    try {
      const { data, error: functionError } = await supabase.functions.invoke('send-paco-email', {
        body: {
          recipient_email: recipientEmail,
          recipient_name: recipientName
        }
      })

      if (functionError) throw functionError

      if (data?.error) {
        throw new Error(data.error)
      }

      success.value = true
      return true
    } catch (err) {
      console.error('Error sending PACO email:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    success,
    sendPacoEmail
  }
}
