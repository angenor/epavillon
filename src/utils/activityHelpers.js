export const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    submitted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    under_review: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    live: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  }
  return classes[status] || classes.draft
}

export const formatEventPeriod = (eventData, locale = 'fr-FR') => {
  if (!eventData) return ''

  // Déterminer les dates selon le mode de participation
  let startDate, endDate
  if (eventData.participation_mode === 'online') {
    startDate = eventData.online_start_datetime
    endDate = eventData.online_end_datetime
  } else {
    // in_person ou hybrid
    startDate = eventData.in_person_start_date || eventData.online_start_datetime
    endDate = eventData.in_person_end_date || eventData.online_end_datetime
  }

  if (!startDate || !endDate) return ''

  const start = new Date(startDate)
  const end = new Date(endDate)

  // Vérifier que les dates sont valides
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return ''
  }

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: eventData.timezone || 'UTC'
  }

  return `${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}`
}