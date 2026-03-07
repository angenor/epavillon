import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function usePacoEmail() {
  const loading = ref(false)
  const error = ref(null)
  const success = ref(false)

  /**
   * Send the PACO webinar confirmation email with the Teams link.
   * Uses the send-email edge function (same as EmailManager admin emails).
   * @param {string} recipientEmail
   * @param {string} recipientName
   * @returns {Promise<boolean>} true if the email was sent successfully
   */
  const sendPacoEmail = async (recipientEmail, _recipientName) => {
    loading.value = true
    error.value = null
    success.value = false

    const PACO_PLATFORM_JOIN_URL = 'https://epavillonclimatique.francophonie.org/paco/join'

    const emailContent = `Bonjour {recipient_name}, votre inscription est confirmee. Le webinaire aura lieu le 26 mars 2026 de 14h00 a 15h30 GMT.\n\nLien de connexion : ${PACO_PLATFORM_JOIN_URL}\n\nIMPORTANT : Veuillez installer le logiciel Microsoft Teams avant la session. Vous en aurez besoin pour rejoindre le webinaire.\n\nCordialement,\nL equipe IFDD`

    try {
      // Use the exact same payload structure as admin EmailManager (no mode field)
      // The edge function will auto-detect PACO user via activity_registrations fallback
      const { data, error: sendError } = await supabase.functions.invoke('send-email', {
        body: {
          email_type: 'simple',
          subject: 'Confirmation inscription - Webinaire PACO',
          content: emailContent,
          recipients: {
            to: [recipientEmail],
            cc: [],
            bcc: []
          },
          variables: {},
          template: 'simple_email',
          event_id: null,
          activity_id: null
        }
      })

      if (sendError) throw sendError

      if (!data?.success) {
        throw new Error(data?.error || data?.message || 'Email send failed')
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
