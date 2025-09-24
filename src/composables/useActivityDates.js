import { ref, computed, watch } from 'vue'
import useUserActivities from '@/composables/useUserActivities'
import { useTimezone } from '@/composables/useTimezone'

export function useActivityDates(activity, eventTimezoneRef = null) {
  const { updateActivity } = useUserActivities()
  const { convertFromUTC, convertToUTC } = useTimezone()

  // Get the actual timezone value from ref/computed if provided
  const getTimezone = () => {
    if (!eventTimezoneRef) return null
    return typeof eventTimezoneRef.value !== 'undefined' ? eventTimezoneRef.value : eventTimezoneRef
  }

  const activityDate = ref('')
  const startTime = ref('')
  const endTime = ref('')
  const savingDates = ref(false)

  const hasPendingDateChanges = computed(() => {
    if (!activity.value) return false

    const currentStartDate = activity.value.proposed_start_date ? activity.value.proposed_start_date : null
    const currentEndDate = activity.value.proposed_end_date ? activity.value.proposed_end_date : null

    if (currentStartDate) {
      const timezone = getTimezone()
      let savedDate, savedStartTime, savedEndTime

      // Si on a un timezone d'événement, convertir les dates UTC stockées vers ce timezone pour comparer
      if (timezone) {
        const startLocal = convertFromUTC(currentStartDate, timezone)
        const endLocal = currentEndDate ? convertFromUTC(currentEndDate, timezone) : null

        if (startLocal) {
          const [date, time] = startLocal.split('T')
          savedDate = date
          savedStartTime = time
        }

        if (endLocal) {
          const [, time] = endLocal.split('T')
          savedEndTime = time || ''
        } else {
          savedEndTime = ''
        }
      } else {
        // Comportement original : utiliser le timezone local du navigateur
        const startDate = new Date(currentStartDate)
        savedDate = startDate.toISOString().split('T')[0]
        savedStartTime = startDate.toTimeString().slice(0, 5)
        savedEndTime = currentEndDate ? new Date(currentEndDate).toTimeString().slice(0, 5) : ''
      }

      return savedDate !== activityDate.value || savedStartTime !== startTime.value || savedEndTime !== endTime.value
    }

    return false
  })

  const initializeDates = () => {
    const timezone = getTimezone()

    if (activity.value?.proposed_start_date) {
      // Si on a un timezone d'événement, convertir depuis UTC vers ce timezone
      // Sinon, utiliser l'heure locale du navigateur
      if (timezone) {
        const localDateTime = convertFromUTC(activity.value.proposed_start_date, timezone)
        if (localDateTime) {
          const [date, time] = localDateTime.split('T')
          activityDate.value = date
          startTime.value = time
        }
      } else {
        const startDate = new Date(activity.value.proposed_start_date)
        activityDate.value = startDate.toISOString().split('T')[0]
        startTime.value = startDate.toTimeString().slice(0, 5)
      }
    }

    if (activity.value?.proposed_end_date) {
      // Si on a un timezone d'événement, convertir depuis UTC vers ce timezone
      // Sinon, utiliser l'heure locale du navigateur
      if (timezone) {
        const localDateTime = convertFromUTC(activity.value.proposed_end_date, timezone)
        if (localDateTime) {
          const [, time] = localDateTime.split('T')
          endTime.value = time
        }
      } else {
        const endDate = new Date(activity.value.proposed_end_date)
        endTime.value = endDate.toTimeString().slice(0, 5)
      }
    }
  }

  const saveDates = async () => {
    if (!activityDate.value || !startTime.value || !endTime.value) {
      throw new Error('Date, heure de début et heure de fin sont requises')
    }

    savingDates.value = true
    try {
      const timezone = getTimezone()
      let startDateTimeISO, endDateTimeISO

      // Si on a un timezone d'événement, créer les dates dans ce timezone puis convertir en UTC
      if (timezone) {
        // Créer les chaînes datetime-local
        const startDateTimeLocal = `${activityDate.value}T${startTime.value}:00`
        const endDateTimeLocal = `${activityDate.value}T${endTime.value}:00`

        // Convertir vers UTC en tenant compte du timezone de l'événement
        startDateTimeISO = convertToUTC(startDateTimeLocal, timezone)
        endDateTimeISO = convertToUTC(endDateTimeLocal, timezone)
      } else {
        // Comportement original : utiliser le timezone local du navigateur
        const startDateTime = new Date(activityDate.value)
        const [startHours, startMinutes] = startTime.value.split(':')
        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)

        const endDateTime = new Date(activityDate.value)
        const [endHours, endMinutes] = endTime.value.split(':')
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)

        // Validate that end time is after start time
        if (endDateTime <= startDateTime) {
          throw new Error('L\'heure de fin doit être après l\'heure de début')
        }

        startDateTimeISO = startDateTime.toISOString()
        endDateTimeISO = endDateTime.toISOString()
      }

      // Vérifier que l'heure de fin est après l'heure de début
      if (new Date(endDateTimeISO) <= new Date(startDateTimeISO)) {
        throw new Error('L\'heure de fin doit être après l\'heure de début')
      }

      await updateActivity(activity.value.id, {
        proposed_start_date: startDateTimeISO,
        proposed_end_date: endDateTimeISO
      })

      activity.value.proposed_start_date = startDateTimeISO
      activity.value.proposed_end_date = endDateTimeISO
    } catch (error) {
      console.error('Error updating dates:', error)
      throw error
    } finally {
      savingDates.value = false
    }
  }

  const cancelDateChanges = () => {
    initializeDates()
  }

  // Watch for timezone changes and reinitialize dates
  if (eventTimezoneRef) {
    watch(
      () => getTimezone(),
      (newTimezone) => {
        if (newTimezone && activity.value?.proposed_start_date) {
          initializeDates()
        }
      }
    )
  }

  return {
    // Data
    activityDate,
    startTime,
    endTime,
    savingDates,

    // Computed
    hasPendingDateChanges,

    // Methods
    initializeDates,
    saveDates,
    cancelDateChanges
  }
}