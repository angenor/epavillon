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

  /**
   * Fetch aggregate statistics for PACO registrations.
   * Computes total, withDemographics, and percentage breakdowns.
   */
  const fetchPacoStats = async () => {
    loading.value = true
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
      loading.value = false
    }
  }

  /**
   * Fetch detailed registrant list with user info and demographic data.
   */
  const fetchPacoRegistrants = async () => {
    registrantsLoading.value = true
    registrantsError.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('activity_registrations')
        .select(`
          id,
          registration_date,
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
        `)
        .eq('activity_id', PACO_ACTIVITY_ID)
        .order('registration_date', { ascending: false })

      if (queryError) throw queryError

      registrants.value = data.map(r => ({
        id: r.id,
        firstName: r.users?.first_name || '',
        lastName: r.users?.last_name || '',
        email: r.users?.email || '',
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
      registrantsLoading.value = false
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
    fetchPacoRegistrants,
    deleteRegistrant
  }
}
