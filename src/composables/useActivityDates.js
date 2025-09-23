import { ref, computed } from 'vue'
import useUserActivities from '@/composables/useUserActivities'

export function useActivityDates(activity) {
  const { updateActivity } = useUserActivities()

  const activityDate = ref('')
  const startTime = ref('')
  const endTime = ref('')
  const savingDates = ref(false)

  const hasPendingDateChanges = computed(() => {
    if (!activity.value) return false

    const currentStartDate = activity.value.proposed_start_date ? new Date(activity.value.proposed_start_date) : null
    const currentEndDate = activity.value.proposed_end_date ? new Date(activity.value.proposed_end_date) : null

    if (currentStartDate) {
      const savedDate = currentStartDate.toISOString().split('T')[0]
      const savedStartTime = currentStartDate.toTimeString().slice(0, 5)
      const savedEndTime = currentEndDate ? currentEndDate.toTimeString().slice(0, 5) : ''

      return savedDate !== activityDate.value || savedStartTime !== startTime.value || savedEndTime !== endTime.value
    }

    return false
  })

  const initializeDates = () => {
    if (activity.value?.proposed_start_date) {
      const startDate = new Date(activity.value.proposed_start_date)
      activityDate.value = startDate.toISOString().split('T')[0]
      startTime.value = startDate.toTimeString().slice(0, 5)
    }

    if (activity.value?.proposed_end_date) {
      const endDate = new Date(activity.value.proposed_end_date)
      endTime.value = endDate.toTimeString().slice(0, 5)
    }
  }

  const saveDates = async () => {
    if (!activityDate.value || !startTime.value || !endTime.value) {
      throw new Error('Date, heure de début et heure de fin sont requises')
    }

    savingDates.value = true
    try {
      // Create start datetime
      const startDateTime = new Date(activityDate.value)
      const [startHours, startMinutes] = startTime.value.split(':')
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)

      // Create end datetime
      const endDateTime = new Date(activityDate.value)
      const [endHours, endMinutes] = endTime.value.split(':')
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)

      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        throw new Error('L\'heure de fin doit être après l\'heure de début')
      }

      await updateActivity(activity.value.id, {
        proposed_start_date: startDateTime.toISOString(),
        proposed_end_date: endDateTime.toISOString()
      })

      activity.value.proposed_start_date = startDateTime.toISOString()
      activity.value.proposed_end_date = endDateTime.toISOString()
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