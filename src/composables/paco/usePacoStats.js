import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { PACO_ACTIVITY_ID } from '@/composables/paco/constants'

export function usePacoStats() {
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const registrants = ref([])
  const registrantsLoading = ref(false)
  const registrantsError = ref(null)
  const registrantsTotal = ref(0)
  const registrantsPage = ref(1)
  const registrantsPerPage = 50
  const allRegistrationDates = ref([])
  const pageViewCount = ref(0)

  /**
   * Fetch the unique page view count from the activities table.
   */
  const fetchPageViewCount = async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('activities')
        .select('activites_view_count')
        .eq('id', PACO_ACTIVITY_ID)
        .single()

      if (queryError) throw queryError
      pageViewCount.value = data?.activites_view_count || 0
    } catch (err) {
      console.error('Error fetching page view count:', err)
    }
  }

  /**
   * Fetch aggregate statistics for PACO registrations.
   * Computes total, withDemographics, and percentage breakdowns.
   */
  const fetchPacoStats = async ({ silent = false } = {}) => {
    if (!silent) loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('activity_registrations')
        .select(`
          id,
          paco_demographic_data (
            gender,
            age_profile,
            professional_status
          )
        `)
        .eq('activity_id', PACO_ACTIVITY_ID)

      if (queryError) throw queryError

      const total = data.length
      const withDemo = data.filter(r => r.paco_demographic_data)
      const demoCount = withDemo.length

      const pct = (count) => demoCount > 0 ? Math.round((count / demoCount) * 1000) / 10 : 0

      const genderCounts = { male: 0, female: 0 }
      const ageCounts = { under_35: 0, over_35: 0 }
      const statusCounts = { employed: 0, student: 0, unemployed: 0, entrepreneur: 0 }

      for (const r of withDemo) {
        const d = r.paco_demographic_data
        if (d.gender in genderCounts) genderCounts[d.gender]++
        if (d.age_profile in ageCounts) ageCounts[d.age_profile]++
        if (d.professional_status in statusCounts) statusCounts[d.professional_status]++
      }

      stats.value = {
        total,
        withDemographics: demoCount,
        gender: { male: pct(genderCounts.male), female: pct(genderCounts.female) },
        ageProfile: { under35: pct(ageCounts.under_35), over35: pct(ageCounts.over_35) },
        professionalStatus: {
          employed: pct(statusCounts.employed),
          student: pct(statusCounts.student),
          unemployed: pct(statusCounts.unemployed),
          entrepreneur: pct(statusCounts.entrepreneur)
        }
      }
    } catch (err) {
      console.error('Error fetching PACO stats:', err)
      error.value = err.message
    } finally {
      if (!silent) loading.value = false
    }
  }

  /**
   * Fetch all registration dates for chart display (lightweight query).
   */
  const fetchAllRegistrationDates = async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('activity_registrations')
        .select('registration_date')
        .eq('activity_id', PACO_ACTIVITY_ID)
        .order('registration_date', { ascending: true })

      if (queryError) throw queryError

      allRegistrationDates.value = data.map(r => ({ registrationDate: r.registration_date }))
    } catch (err) {
      console.error('Error fetching registration dates:', err)
    }
  }

  /**
   * Fetch detailed registrant list with user info and demographic data.
   */
  const fetchPacoRegistrants = async (page = 1, loadAll = false, { silent = false } = {}) => {
    if (!silent) registrantsLoading.value = true
    registrantsError.value = null
    registrantsPage.value = page

    const from = (page - 1) * registrantsPerPage
    const to = from + registrantsPerPage - 1

    try {
      let query = supabase
        .from('activity_registrations')
        .select(`
          id,
          registration_date,
          guest_email,
          guest_first_name,
          guest_last_name,
          users (
            first_name,
            last_name,
            email
          ),
          paco_demographic_data (
            gender,
            age_profile,
            city,
            country_id,
            countries ( name_fr, name_en ),
            professional_status,
            organization
          )
        `, { count: 'exact' })
        .eq('activity_id', PACO_ACTIVITY_ID)
        .order('registration_date', { ascending: false })

      if (!loadAll) {
        query = query.range(from, to)
      }

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError

      registrantsTotal.value = count

      registrants.value = data.map(r => ({
        id: r.id,
        firstName: r.users?.first_name || r.guest_first_name || '',
        lastName: r.users?.last_name || r.guest_last_name || '',
        email: r.users?.email || r.guest_email || '',
        gender: r.paco_demographic_data?.gender || null,
        ageProfile: r.paco_demographic_data?.age_profile || null,
        city: r.paco_demographic_data?.city || null,
        countryFr: r.paco_demographic_data?.countries?.name_fr || null,
        countryEn: r.paco_demographic_data?.countries?.name_en || null,
        professionalStatus: r.paco_demographic_data?.professional_status || null,
        organization: r.paco_demographic_data?.organization || null,
        registrationDate: r.registration_date
      }))
    } catch (err) {
      console.error('Error fetching PACO registrants:', err)
      registrantsError.value = err.message
    } finally {
      if (!silent) registrantsLoading.value = false
    }
  }

  let realtimeChannel = null

  const subscribeToPacoChanges = (onChangeCallback) => {
    realtimeChannel = supabase
      .channel('paco-registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_registrations',
          filter: `activity_id=eq.${PACO_ACTIVITY_ID}`
        },
        (payload) => {
          if (onChangeCallback) onChangeCallback(payload)
        }
      )
      .subscribe()
  }

  const unsubscribePacoChanges = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  const deleteRegistrant = async (registrationId) => {
    const { error: deleteError } = await supabase
      .from('activity_registrations')
      .delete()
      .eq('id', registrationId)

    if (deleteError) throw deleteError

    registrants.value = registrants.value.filter(r => r.id !== registrationId)
  }

  return {
    stats,
    loading,
    error,
    fetchPacoStats,
    registrants,
    registrantsLoading,
    registrantsError,
    registrantsTotal,
    registrantsPage,
    registrantsPerPage,
    fetchPacoRegistrants,
    deleteRegistrant,
    allRegistrationDates,
    fetchAllRegistrationDates,
    pageViewCount,
    fetchPageViewCount,
    subscribeToPacoChanges,
    unsubscribePacoChanges
  }
}
