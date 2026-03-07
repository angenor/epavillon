import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { PACO_ACTIVITY_ID } from '@/composables/paco/constants'

// ASCII-safe French names (no accents) to avoid WAF/ModSecurity blocking
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre']

/**
 * Format a Date to ASCII-safe French string (e.g. "vendredi 13 mars 2026")
 */
function formatDateFrSafe(dt) {
  return `${JOURS[dt.getUTCDay()]} ${dt.getUTCDate()} ${MOIS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}

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
    const date = formatDateFrSafe(dt)
    const hours = String(dt.getUTCHours()).padStart(2, '0')
    const minutes = String(dt.getUTCMinutes()).padStart(2, '0')

    return { title: data.title, date, time: `${hours}:${minutes} UTC` }
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

    // Fetch activity details for date/time
    const activity = await fetchPacoActivityDetails()

    let dateTimeInfo = ''
    if (activity?.date && activity?.time) {
      dateTimeInfo = `\n\nDate : ${activity.date}\nHeure : ${activity.time}`
    }

    // TEMPORARY: test with URL to check WAF trigger
    const emailContent = `Bonjour {recipient_name}, votre inscription est confirmee.\n\nLien de connexion : ${PACO_PLATFORM_JOIN_URL}`

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
