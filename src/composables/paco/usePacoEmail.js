import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase'

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
    const PACO_WEBINAR_TITLE = 'Webinaire PACO - Priorites d\'Adaptation en Afrique Centrale et de l\'Ouest'
    const PACO_WEBINAR_DATE = 'Date a confirmer'

    const emailContent = `Bonjour ${recipientName},

Votre inscription au webinaire PACO est confirmee !

Evenement : ${PACO_WEBINAR_TITLE}
Date : ${PACO_WEBINAR_DATE}
Format : En ligne via Microsoft Teams

Lien pour acceder au webinaire :
${PACO_PLATFORM_JOIN_URL}

Cliquez sur le lien ci-dessus le jour du webinaire. Vous devrez etre connecte(e) a votre compte ePavilion pour acceder a la reunion.

---
Cet email a ete envoye automatiquement par la plateforme ePavilion de l'IFDD.
Institut de la Francophonie pour le Developpement Durable`

    try {
      const { data, error: functionError } = await supabase.functions.invoke('send-email', {
        body: {
          mode: 'paco',
          email_type: 'simple',
          subject: 'Confirmation d\'inscription - Webinaire PACO',
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
