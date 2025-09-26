import { ref } from 'vue'
import { useSupabase } from './useSupabase'

export function useEventsAndTrainings() {
  const { supabase } = useSupabase()

  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Generic fetch function that can handle both francophonie_meetings and trainings
  const fetchItems = async (type, category = null) => {
    loading.value = true
    error.value = null

    try {
      let query, registrationTable, registrationField

      if (type === 'francophonie_meetings') {
        registrationTable = 'francophonie_meeting_registrations'
        registrationField = 'meeting_id'

        query = supabase
          .from('francophonie_meetings')
          .select(`
            *,
            country:countries(*),
            zoom_meeting:zoom_meetings(*),
            francophonie_meeting_registrations(
              user_id,
              registered_at
            )
          `)
          .order('start_datetime', { ascending: true })
      } else if (type === 'trainings') {
        registrationTable = 'training_participants'
        registrationField = 'training_id'

        query = supabase
          .from('trainings')
          .select(`
            *,
            training_participants(
              user_id,
              enrolled_at,
              progress_percentage
            )
          `)
          .eq('is_active', true)
          .order('start_date', { ascending: true })
      }

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error: itemsError } = await query

      if (itemsError) throw itemsError

      // Get current user's registrations/participations
      const { data: userData } = await supabase.auth.getUser()

      if (userData?.user) {
        const { data: userRegistrations } = await supabase
          .from(registrationTable)
          .select(registrationField)
          .eq('user_id', userData.user.id)

        const registeredItemIds = new Set(
          userRegistrations?.map(reg => reg[registrationField]) || []
        )

        // Normalize data structure and add registration status
        items.value = data.map(item => {
          const normalizedItem = normalizeItem(item, type)
          return {
            ...normalizedItem,
            is_registered: registeredItemIds.has(item.id),
            registrations_count: getRegistrationsCount(item, type)
          }
        })
      } else {
        items.value = data.map(item => {
          const normalizedItem = normalizeItem(item, type)
          return {
            ...normalizedItem,
            is_registered: false,
            registrations_count: getRegistrationsCount(item, type)
          }
        })
      }

    } catch (err) {
      error.value = err.message
      console.error(`Error fetching ${type}:`, err)
    } finally {
      loading.value = false
    }
  }

  // Normalize different data structures to a common format
  const normalizeItem = (item, type) => {
    if (type === 'francophonie_meetings') {
      return {
        ...item,
        start_datetime: item.start_datetime,
        end_datetime: item.end_datetime,
        item_type: item.meeting_type,
        type: 'meeting'
      }
    } else if (type === 'trainings') {
      return {
        ...item,
        start_datetime: item.start_date + 'T00:00:00Z', // Convert date to datetime format
        end_datetime: item.end_date + 'T23:59:59Z',
        item_type: item.format,
        type: 'training',
        location: 'En ligne' // Trainings are typically online
      }
    }
    return item
  }

  // Get registrations count based on type
  const getRegistrationsCount = (item, type) => {
    if (type === 'francophonie_meetings') {
      return item.francophonie_meeting_registrations?.length || 0
    } else if (type === 'trainings') {
      return item.training_participants?.length || 0
    }
    return 0
  }

  // Generic registration function
  const registerToItem = async (itemId, type) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')

    try {
      let registrationData, registrationTable

      if (type === 'francophonie_meetings') {
        registrationTable = 'francophonie_meeting_registrations'
        registrationData = {
          meeting_id: itemId,
          user_id: userData.user.id
        }
      } else if (type === 'trainings') {
        registrationTable = 'training_participants'
        registrationData = {
          training_id: itemId,
          user_id: userData.user.id
        }
      }

      const { error: registrationError } = await supabase
        .from(registrationTable)
        .insert(registrationData)

      if (registrationError) throw registrationError

      // Update local state
      const itemIndex = items.value.findIndex(item => item.id === itemId)
      if (itemIndex !== -1) {
        items.value[itemIndex].is_registered = true
        items.value[itemIndex].registrations_count += 1
      }

    } catch (err) {
      console.error(`Error registering to ${type}:`, err)
      throw err
    }
  }

  // Generic unregistration function
  const unregisterFromItem = async (itemId, type) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')

    try {
      let registrationTable, whereClause

      if (type === 'francophonie_meetings') {
        registrationTable = 'francophonie_meeting_registrations'
        whereClause = { meeting_id: itemId, user_id: userData.user.id }
      } else if (type === 'trainings') {
        registrationTable = 'training_participants'
        whereClause = { training_id: itemId, user_id: userData.user.id }
      }

      const { error: unregistrationError } = await supabase
        .from(registrationTable)
        .delete()
        .match(whereClause)

      if (unregistrationError) throw unregistrationError

      // Update local state
      const itemIndex = items.value.findIndex(item => item.id === itemId)
      if (itemIndex !== -1) {
        items.value[itemIndex].is_registered = false
        items.value[itemIndex].registrations_count = Math.max(0, items.value[itemIndex].registrations_count - 1)
      }

    } catch (err) {
      console.error(`Error unregistering from ${type}:`, err)
      throw err
    }
  }

  // Get item by ID (generic)
  const getItemById = async (itemId, type) => {
    try {
      let query, registrationJoin

      if (type === 'francophonie_meetings') {
        registrationJoin = `francophonie_meeting_registrations(
          user_id,
          registered_at,
          user:users(first_name, last_name, email, organization_id)
        )`

        query = supabase
          .from('francophonie_meetings')
          .select(`
            *,
            country:countries(*),
            zoom_meeting:zoom_meetings(*),
            ${registrationJoin}
          `)
      } else if (type === 'trainings') {
        registrationJoin = `training_participants(
          user_id,
          enrolled_at,
          progress_percentage,
          user:users(first_name, last_name, email, organization_id)
        )`

        query = supabase
          .from('trainings')
          .select(`
            *,
            ${registrationJoin}
          `)
      }

      const { data, error: itemError } = await query
        .eq('id', itemId)
        .single()

      if (itemError) throw itemError

      // Check if current user is registered
      const { data: userData } = await supabase.auth.getUser()
      let isRegistered = false

      if (userData?.user) {
        const registrations = type === 'francophonie_meetings'
          ? data.francophonie_meeting_registrations
          : data.training_participants

        isRegistered = registrations?.some(
          reg => reg.user_id === userData.user.id
        ) || false
      }

      const normalizedItem = normalizeItem(data, type)

      return {
        ...normalizedItem,
        is_registered: isRegistered,
        registrations_count: getRegistrationsCount(data, type)
      }

    } catch (err) {
      console.error(`Error fetching ${type} details:`, err)
      throw err
    }
  }

  return {
    items,
    loading,
    error,
    fetchItems,
    registerToItem,
    unregisterFromItem,
    getItemById
  }
}