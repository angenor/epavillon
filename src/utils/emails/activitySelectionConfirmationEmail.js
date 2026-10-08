/**
 * Email par défaut envoyé aux organisateurs d'une activité "En examen"
 * pour confirmer sa sélection au Pavillon de la Francophonie (CdP31).
 * Le créneau utilisé est le créneau confirmé (final_*), pas le créneau proposé.
 */

const PLACEHOLDER = 'xxx'
const ENGAGEMENT_FORM_URL = 'https://epavillonclimatique.francophonie.org/dist/images/formulaire_engagement_pavillon_francophonie_cdp31.docx'

// Heure au format français : "14 h" ou "14 h 30", dans le fuseau de l'événement
const formatHour = (dateString, timeZone) => {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone
  }).formatToParts(new Date(dateString))
  const hour = Number(parts.find(p => p.type === 'hour').value)
  const minute = parts.find(p => p.type === 'minute').value
  return minute === '00' ? `${hour} h` : `${hour} h ${minute}`
}

// Date au format "17 novembre"
const formatDay = (dateString, timeZone) =>
  new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone })

export const buildActivitySelectionConfirmationEmail = ({ title, finalStartDate, finalEndDate, timezone = 'UTC' }) => {
  const activityTitle = title || PLACEHOLDER
  const date = finalStartDate ? formatDay(finalStartDate, timezone) : `${PLACEHOLDER} novembre`
  const schedule = finalStartDate && finalEndDate
    ? `${formatHour(finalStartDate, timezone)} – ${formatHour(finalEndDate, timezone)}`
    : `${PLACEHOLDER} h – ${PLACEHOLDER} h`

  return {
    subject: `Confirmation de votre activité au Pavillon de la Francophonie (CdP31 climat) - ${activityTitle}`,
    content: `Madame, Monsieur,

Nous avons le plaisir de vous confirmer que votre proposition d'activité a été retenue par notre comité de sélection pour être organisée au Pavillon de la Francophonie lors de la 31e Conférence des Nations Unies sur les changements climatiques (CdP31).

En raison du nombre important de propositions reçues, le programme a fait l'objet de plusieurs ajustements, et certains créneaux ont pu être modifiés par rapport aux demandes initiales. Nous vous invitons donc à vérifier attentivement le créneau retenu pour votre activité :

Titre : ${activityTitle}
Date : ${date}
Horaire : ${schedule} (heure d'Antalya)

Nous vous remercions de bien vouloir nous confirmer ce créneau par retour de courriel au plus tard le 12 octobre 2026, afin que votre activité puisse figurer au programme définitif.

Pour confirmer votre acceptation de notre proposition, nous vous invitons à télécharger le formulaire d'engagement, puis à le remplir, le signer et le joindre à votre courriel.

Lien pour télécharger le formulaire: ${ENGAGEMENT_FORM_URL}

Advenant que vous soumettez des modifications, la prise en compte de cette demande pourrait occasionner des délais.

Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`
  }
}
