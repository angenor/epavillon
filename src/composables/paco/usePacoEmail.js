import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { PACO_ACTIVITY_ID } from '@/composables/paco/constants'

/**
 * Fetch PACO activity details (date, time) from Supabase.
 */
async function fetchPacoActivityDetails() {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('title, final_start_date, proposed_start_date')
      .eq('id', PACO_ACTIVITY_ID)
      .single()

    if (error || !data) return null

    const startDate = data.final_start_date || data.proposed_start_date
    if (!startDate) return { title: data.title, date: null, time: null }

    const dt = new Date(startDate)
    const date = dt.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const time = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })

    return { title: data.title, date, time: `${time} UTC` }
  } catch {
    return null
  }
}

export function usePacoEmail() {
  const loading = ref(false)
  const error = ref(null)
  const success = ref(false)

  /**
   * Send the PACO webinar confirmation email with the Teams link.
   * Uses the send-email edge function with a minimal test-like payload
   * (same format as admin emails that work).
   * @param {string} recipientEmail
   * @param {string} recipientName
   * @returns {Promise<boolean>} true if the email was sent successfully
   */
  const sendPacoEmail = async (recipientEmail, recipientName) => {
    loading.value = true
    error.value = null
    success.value = false

    const PACO_PLATFORM_JOIN_URL = 'https://epavillonclimatique.francophonie.org/paco/join'

    // Fetch activity details for date/time
    const activity = await fetchPacoActivityDetails()

    let dateTimeInfo = ''
    if (activity?.date && activity?.time) {
      dateTimeInfo = `\n\nDate : ${activity.date}\nHeure : ${activity.time}`
    }

    const emailContent = `Bonjour ${recipientName},\n\nVotre inscription au webinaire PACO est confirmee.${dateTimeInfo}\n\nLien de connexion : ${PACO_PLATFORM_JOIN_URL}\n\nIMPORTANT : Veuillez installer le logiciel Microsoft Teams avant la session. Vous en aurez besoin pour rejoindre le webinaire.\nTelechargement : https://www.microsoft.com/fr/microsoft-teams/download-app\n\nCordialement,\nL'equipe IFDD`

    try {
      const { data, error: functionError } = await supabase.functions.invoke('send-email', {
        body: {
          mode: 'paco',
          email_type: 'simple',
          subject: 'Confirmation inscription - Webinaire PACO',
          content: emailContent,
          recipients: {
            to: [recipientEmail]
          },
          variables: {},
          template: 'simple_email'
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
