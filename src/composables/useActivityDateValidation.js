export function useActivityDateValidation() {
  /**
   * Vérifie si les dates de l'activité sont dans les limites acceptables par rapport à l'événement
   * Les dates de début et de fin de l'activité doivent être strictement
   * dans la période de l'événement (sans tolérance)
   *
   * @param {Object} params - Les paramètres de validation
   * @param {Date|string} params.activityStartDate - Date de début proposée de l'activité
   * @param {Date|string} params.activityEndDate - Date de fin proposée de l'activité
   * @param {Date|string} params.eventStartDate - Date de début de l'événement
   * @param {Date|string} params.eventEndDate - Date de fin de l'événement
   * @returns {Object} Résultat de la validation avec isValid et errors
   */
  const validateActivityDates = ({
    activityStartDate,
    activityEndDate,
    eventStartDate,
    eventEndDate
  }) => {
    const errors = []

    // Convertir toutes les dates en objets Date
    const activityStart = new Date(activityStartDate)
    const activityEnd = new Date(activityEndDate)
    const eventStart = new Date(eventStartDate)
    const eventEnd = new Date(eventEndDate)

    // Vérifier que les dates sont valides
    if (isNaN(activityStart.getTime()) || isNaN(activityEnd.getTime())) {
      errors.push('activities.validation.invalidDates')
      return { isValid: false, errors }
    }

    if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) {
      errors.push('activities.validation.invalidEventDates')
      return { isValid: false, errors }
    }

    // Normaliser les dates pour ignorer l'heure (comparer seulement les jours)
    const normalizeDate = (date) => {
      const normalized = new Date(date)
      normalized.setHours(0, 0, 0, 0)
      return normalized
    }

    const normalizedActivityStart = normalizeDate(activityStart)
    const normalizedActivityEnd = normalizeDate(activityEnd)
    const normalizedEventStart = normalizeDate(eventStart)
    const normalizedEventEnd = normalizeDate(eventEnd)

    // Vérifier que l'activité commence dans la période de l'événement (sans tolérance)
    if (normalizedActivityStart < normalizedEventStart) {
      errors.push('activities.validation.startDateTooEarly')
    } else if (normalizedActivityStart > normalizedEventEnd) {
      errors.push('activities.validation.startDateTooLate')
    }

    // Vérifier que l'activité se termine dans la période de l'événement (sans tolérance)
    if (normalizedActivityEnd < normalizedEventStart) {
      errors.push('activities.validation.endDateTooEarly')
    } else if (normalizedActivityEnd > normalizedEventEnd) {
      errors.push('activities.validation.endDateTooLate')
    }

    // Vérifier que la date de fin est après la date de début
    if (normalizedActivityEnd < normalizedActivityStart) {
      errors.push('activities.validation.endBeforeStart')
    }

    // Vérifier que l'activité n'est pas complètement en dehors de la période de l'événement
    // (sans tolérance)
    if (normalizedActivityStart > normalizedEventEnd || normalizedActivityEnd < normalizedEventStart) {
      errors.push('activities.validation.outsideEventPeriod')
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
   * @returns {Object} Dates min et max acceptables
   */
  const getAcceptableDateRange = (eventStartDate, eventEndDate) => {
    if (!eventStartDate || !eventEndDate) {
      return { minDate: null, maxDate: null }
    }

    const eventStart = new Date(eventStartDate)
    const eventEnd = new Date(eventEndDate)

    if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) {
      return { minDate: null, maxDate: null }
    }

    // Créer les dates limites sans tolérance
    const minDate = new Date(eventStart)
    minDate.setHours(0, 0, 0, 0)

    const maxDate = new Date(eventEnd)
    maxDate.setHours(23, 59, 59, 999)

    return {
      minDate: minDate.toISOString().slice(0, 16),
      maxDate: maxDate.toISOString().slice(0, 16)
    }
  }

  return {
    validateActivityDates,
    formatDate,
    getAcceptableDateRange
  }
}