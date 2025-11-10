import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

/**
 * Composable pour gérer les templates d'emails prédéfinis pour les activités
 */
export function useActivityEmailTemplates() {
  const router = useRouter()
  const { t, locale } = useI18n()

  // Emails fixes en CC
  const FIXED_CC_EMAILS = ['angenor99@gmail.com', 'epavillonclimatique@francophonie.org']

  /**
   * Extraire les emails des panélistes
   */
  const getPanelistsEmails = (activity) => {
    if (!activity.activity_panelists || activity.activity_panelists.length === 0) {
      return []
    }
    return activity.activity_panelists
      .map(ap => ap.panelist?.email)
      .filter(email => email)
  }

  /**
   * Calculer les minutes restantes avant le début
   */
  const getMinutesUntilStart = (activity) => {
    const now = new Date()
    const startDate = new Date(activity.final_start_date || activity.proposed_start_date)
    const diffMs = startDate - now
    return Math.floor(diffMs / (1000 * 60))
  }

  /**
   * Email d'alerte d'imminence
   */
  const sendImminenceAlert = (activity) => {
    const minutesRemaining = getMinutesUntilStart(activity)
    const submitterEmail = activity.submitter?.email
    const panelistsEmails = getPanelistsEmails(activity)
    const ccEmails = [...panelistsEmails, ...FIXED_CC_EMAILS]

    const isFrench = locale.value === 'fr'

    const subject = isFrench
      ? `⏰ URGENT : Votre activité "${activity.title}" commence dans ${minutesRemaining} minutes`
      : `⏰ URGENT: Your activity "${activity.title}" starts in ${minutesRemaining} minutes`

    const body = isFrench
      ? `Bonjour ${activity.submitter?.first_name || ''},

Ceci est un rappel urgent concernant votre activité :

📌 Activité : ${activity.title}
⏰ Début : Dans ${minutesRemaining} minutes
🔗 Événement : ${activity.event?.title} ${activity.event?.year}

${activity.youtube_link
  ? `✅ Lien YouTube configuré : https://www.youtube.com/watch?v=${activity.youtube_link}`
  : '⚠️ ATTENTION : Le lien YouTube n\'est pas encore configuré !'
}

Merci de vous assurer que :
✓ Vous êtes prêt à démarrer
✓ Votre équipement technique fonctionne
✓ Tous les intervenants sont présents

En cas de problème, veuillez nous contacter immédiatement.

Cordialement,
L'équipe ePavillon Climatique`
      : `Hello ${activity.submitter?.first_name || ''},

This is an urgent reminder about your activity:

📌 Activity: ${activity.title}
⏰ Starts in: ${minutesRemaining} minutes
🔗 Event: ${activity.event?.title} ${activity.event?.year}

${activity.youtube_link
  ? `✅ YouTube link configured: https://www.youtube.com/watch?v=${activity.youtube_link}`
  : '⚠️ WARNING: YouTube link is not yet configured!'
}

Please ensure that:
✓ You are ready to start
✓ Your technical equipment is working
✓ All speakers are present

If you encounter any issues, please contact us immediately.

Best regards,
ePavillon Climatique Team`

    navigateToEmailManager({
      to: submitterEmail,
      cc: ccEmails.join(','),
      subject,
      body
    })
  }

  /**
   * Email d'annulation pour absence
   */
  const sendCancellationForAbsence = (activity) => {
    const submitterEmail = activity.submitter?.email
    const panelistsEmails = getPanelistsEmails(activity)
    const ccEmails = [...panelistsEmails, ...FIXED_CC_EMAILS]

    const isFrench = locale.value === 'fr'

    const subject = isFrench
      ? `❌ Annulation de votre activité "${activity.title}" - Absence constatée`
      : `❌ Cancellation of your activity "${activity.title}" - Absence noted`

    const body = isFrench
      ? `Bonjour ${activity.submitter?.first_name || ''},

Nous vous informons que votre activité a été annulée en raison de votre absence :

📌 Activité : ${activity.title}
📅 Date prévue : ${new Date(activity.final_start_date || activity.proposed_start_date).toLocaleString('fr-FR')}
🔗 Événement : ${activity.event?.title} ${activity.event?.year}

Malgré les rappels envoyés, nous avons constaté que vous n'étiez pas présent(e) au moment du démarrage de l'activité.

Nous comprenons que des imprévus peuvent survenir. Si vous souhaitez :
- Reporter cette activité à une autre date
- Nous fournir des explications sur cette absence

N'hésitez pas à nous contacter dans les plus brefs délais.

Cordialement,
L'équipe ePavillon Climatique`
      : `Hello ${activity.submitter?.first_name || ''},

We inform you that your activity has been cancelled due to your absence:

📌 Activity: ${activity.title}
📅 Scheduled date: ${new Date(activity.final_start_date || activity.proposed_start_date).toLocaleString('en-US')}
🔗 Event: ${activity.event?.title} ${activity.event?.year}

Despite the reminders sent, we noticed that you were not present at the activity's start time.

We understand that unforeseen circumstances may occur. If you wish to:
- Reschedule this activity to another date
- Provide explanations for this absence

Please do not hesitate to contact us as soon as possible.

Best regards,
ePavillon Climatique Team`

    navigateToEmailManager({
      to: submitterEmail,
      cc: ccEmails.join(','),
      subject,
      body
    })
  }

  /**
   * Email de demande d'éléments post-activité
   */
  const sendPostActivityRequest = (activity) => {
    const submitterEmail = activity.submitter?.email
    const panelistsEmails = getPanelistsEmails(activity)
    const ccEmails = [...panelistsEmails, ...FIXED_CC_EMAILS]

    const isFrench = locale.value === 'fr'

    const subject = isFrench
      ? `📸 Merci pour votre activité "${activity.title}" - Éléments à fournir`
      : `📸 Thank you for your activity "${activity.title}" - Elements to provide`

    const body = isFrench
      ? `Bonjour ${activity.submitter?.first_name || ''},

Nous vous remercions pour la réalisation de votre activité :

📌 Activité : ${activity.title}
📅 Date : ${new Date(activity.final_start_date || activity.proposed_start_date).toLocaleString('fr-FR')}
🔗 Événement : ${activity.event?.title} ${activity.event?.year}

Pour compléter votre dossier, nous vous invitons à vous connecter à votre tableau de bord et à fournir les éléments suivants :

📸 Photos de l'activité :
   - Photos durant l'activité
   - Photos des participants
   - Photos de moments clés

💬 Témoignages :
   - Retours des participants
   - Impressions générales
   - Suggestions d'amélioration

📊 Autres éléments (si applicables) :
   - Supports de présentation utilisés
   - Documents distribués
   - Liste de présence

Pour accéder à votre tableau de bord :
🔗 https://epavillonclimatique.francophonie.org/dashboard

Ces éléments nous permettront de valoriser votre activité et d'améliorer nos futures éditions.

Merci pour votre collaboration !

Cordialement,
L'équipe ePavillon Climatique`
      : `Hello ${activity.submitter?.first_name || ''},

Thank you for conducting your activity:

📌 Activity: ${activity.title}
📅 Date: ${new Date(activity.final_start_date || activity.proposed_start_date).toLocaleString('en-US')}
🔗 Event: ${activity.event?.title} ${activity.event?.year}

To complete your file, we invite you to log in to your dashboard and provide the following elements:

📸 Activity photos:
   - Photos during the activity
   - Photos of participants
   - Photos of key moments

💬 Testimonials:
   - Participant feedback
   - General impressions
   - Suggestions for improvement

📊 Other elements (if applicable):
   - Presentation materials used
   - Distributed documents
   - Attendance list

To access your dashboard:
🔗 https://epavillonclimatique.francophonie.org/dashboard

These elements will help us showcase your activity and improve our future editions.

Thank you for your cooperation!

Best regards,
ePavillon Climatique Team`

    navigateToEmailManager({
      to: submitterEmail,
      cc: ccEmails.join(','),
      subject,
      body
    })
  }

  /**
   * Navigation vers EmailManager avec les paramètres
   */
  const navigateToEmailManager = ({ to, cc, subject, body }) => {
    router.push({
      path: '/admin/emails',
      query: {
        to,
        cc,
        subject,
        body
      }
    })
  }

  return {
    sendImminenceAlert,
    sendCancellationForAbsence,
    sendPostActivityRequest,
    getPanelistsEmails,
    getMinutesUntilStart
  }
}
