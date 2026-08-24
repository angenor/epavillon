import { useTimezone } from '@/composables/useTimezone'

export function useActivityDateValidation() {
  const { getDayKeyInTimezone } = useTimezone()

  /**
   * Vérifie si les dates de l'activité sont dans les limites acceptables par rapport à l'événement
   * Les dates de début et de fin de l'activité doivent être strictement
   * dans la période de l'événement (sans tolérance)
   *
   * La comparaison se fait sur les jours calendaires exprimés dans le fuseau horaire
   * de l'événement : sans cela, une activité serait rattachée au jour du navigateur
   * du soumissionnaire et non au jour réel de l'événement.
   *
   * @param {Object} params - Les paramètres de validation
   * @param {Date|string} params.activityStartDate - Date de début proposée de l'activité
   * @param {Date|string} params.activityEndDate - Date de fin proposée de l'activité
   * @param {Date|string} params.eventStartDate - Date de début de l'événement
   * @param {Date|string} params.eventEndDate - Date de fin de l'événement
   * @param {string} [params.timezone] - Fuseau horaire IANA de l'événement
   * @returns {Object} Résultat de la validation avec isValid et errors
   */
  const validateActivityDates = ({
    activityStartDate,
    activityEndDate,
    eventStartDate,
    eventEndDate,
    timezone = null
  }) => {
    const errors = []

    // La période de l'événement doit être renseignée : sans elle, aucune comparaison
    // n'a de sens (et un fallback arbitraire produirait des erreurs incompréhensibles)
    if (!eventStartDate || !eventEndDate) {
      errors.push('activities.validation.missingEventPeriod')
      return { isValid: false, errors }
    }

    // Convertir toutes les dates en jours calendaires (YYYY-MM-DD) dans le fuseau de l'événement
    const activityStart = getDayKeyInTimezone(activityStartDate, timezone)
    const activityEnd = getDayKeyInTimezone(activityEndDate, timezone)

    if (!activityStart || !activityEnd) {
      errors.push('activities.validation.invalidDates')
      return { isValid: false, errors }
    }

    const eventStart = getDayKeyInTimezone(eventStartDate, timezone)
    const eventEnd = getDayKeyInTimezone(eventEndDate, timezone)

    if (!eventStart || !eventEnd) {
      errors.push('activities.validation.invalidEventDates')
      return { isValid: false, errors }
    }

    // Les clés YYYY-MM-DD se comparent directement (ordre lexicographique = ordre chronologique)

    // Vérifier que l'activité commence dans la période de l'événement (sans tolérance)
    if (activityStart < eventStart) {
      errors.push('activities.validation.startDateTooEarly')
    } else if (activityStart > eventEnd) {
      errors.push('activities.validation.startDateTooLate')
    }

    // Vérifier que l'activité se termine dans la période de l'événement (sans tolérance)
    if (activityEnd < eventStart) {
      errors.push('activities.validation.endDateTooEarly')
    } else if (activityEnd > eventEnd) {
      errors.push('activities.validation.endDateTooLate')
    }

    // Vérifier que la date de fin est après la date de début
    if (activityEnd < activityStart) {
      errors.push('activities.validation.endBeforeStart')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Formate une date pour l'affichage
   * @param {Date|string} date - La date à formater
   * @returns {string} Date formatée
   */
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  /**
   * Obtient les dates limites acceptables pour une activité basées sur l'événement
   * @param {Date|string} eventStartDate - Date de début de l'événement
   * @param {Date|string} eventEndDate - Date de fin de l'événement
   * @param {string} [timezone] - Fuseau horaire IANA de l'événement
   * @returns {Object} Dates min et max acceptables au format datetime-local
   */
  const getAcceptableDateRange = (eventStartDate, eventEndDate, timezone = null) => {
    if (!eventStartDate || !eventEndDate) {
      return { minDate: null, maxDate: null }
    }

    const startDay = getDayKeyInTimezone(eventStartDate, timezone)
    const endDay = getDayKeyInTimezone(eventEndDate, timezone)

    if (!startDay || !endDay) {
      return { minDate: null, maxDate: null }
    }

    return {
      minDate: `${startDay}T00:00`,
      maxDate: `${endDay}T23:59`
    }
  }

  return {
    validateActivityDates,
    formatDate,
    getAcceptableDateRange
  }
}
