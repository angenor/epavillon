import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

export function useOrganizations() {
  const { supabase, auth, from } = useSupabase()
  
  const organizations = ref([])
  const loading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref(null)

  // Pagination
  const currentPage = ref(0)
  const itemsPerPage = ref(20)
  const totalItems = ref(0)
  const hasMore = ref(true)
  const verifiedCount = ref(0)

  // Filtres
  const searchQuery = ref('')
  const selectedCountry = ref('')
  const selectedType = ref('')
  const selectedVerificationStatus = ref('')
  const sortBy = ref('name')
  const sortOrder = ref('asc')

  // Options pour les filtres
  const organizationTypes = [
    { value: 'public_national_institution', label: 'Institution publique nationale' },
    { value: 'international_organization', label: 'Organisation internationale' },
    { value: 'regional_organization', label: 'Organisation régionale' },
    { value: 'ngo_association', label: 'ONG/Association' },
    { value: 'private_sector', label: 'Secteur privé' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Nom' },
    { value: 'created_at', label: 'Date de création' },
    { value: 'country_name', label: 'Pays' },
    { value: 'activity_count', label: 'Nombre d\'activités' }
  ]

  // Computed
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  // Méthodes
  async function fetchOrganizations(reset = false) {
    if (reset) {
      currentPage.value = 0
      organizations.value = []
      hasMore.value = true
    }

    if (!hasMore.value || isLoadingMore.value) return

    try {
      if (reset) {
        loading.value = true
      } else {
        isLoadingMore.value = true
      }
      error.value = null

      let query = from('organizations')
        .select(`
          id,
          name,
          organization_type,
          logo_url,
          website,
          is_verified,
          verified_at,
          created_at,
          countries!inner(
            id,
            name_fr,
            name_en,
            code
          )
        `, { count: 'exact' })
        .eq('is_active', true)
        .eq('is_duplicate', false)

      // Recherche textuelle
      if (searchQuery.value.trim()) {
        query = query.ilike('name', `%${searchQuery.value}%`)
      }

      // Filtres
      if (selectedCountry.value) {
        query = query.eq('country_id', selectedCountry.value)
      }

      if (selectedType.value) {
        query = query.eq('organization_type', selectedType.value)
      }

      if (selectedVerificationStatus.value === 'verified') {
        query = query.eq('is_verified', true)
      } else if (selectedVerificationStatus.value === 'unverified') {
        query = query.eq('is_verified', false)
      }

      // Tri
      const sortColumn = sortBy.value === 'country_name' ? 'countries.name_fr' : sortBy.value
      query = query.order(sortColumn, { ascending: sortOrder.value === 'asc' })

      // Pagination
      query = query.range(
        currentPage.value * itemsPerPage.value,
        (currentPage.value + 1) * itemsPerPage.value - 1
      )

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError

      // Pour chaque organisation, compter les activités approuvées
      if (data && data.length > 0) {
        const orgWithCounts = await Promise.all(
          data.map(async (org) => {
            const { count: activityCount } = await from('activities')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id)
              .in('validation_status', ['approved', 'live', 'completed', 'cancelled'])
              .eq('is_deleted', false)

            return {
              ...org,
              activities: [{ count: activityCount || 0 }]
            }
          })
        )
        organizations.value = [...organizations.value, ...orgWithCounts]
      }

      totalItems.value = count || 0
      currentPage.value++
      hasMore.value = data && data.length === itemsPerPage.value

    } catch (err) {
      console.error('Erreur lors de la récupération des organisations:', err)
      error.value = err.message
    } finally {
      loading.value = false
      isLoadingMore.value = false
    }
  }

  async function fetchCountries() {
    try {
      const { data, error: queryError } = await from('countries')
        .select('id, name_fr, name_en, code')
        .order('name_fr')

      if (queryError) throw queryError
      return data || []
    } catch (err) {
      console.error('Erreur lors de la récupération des pays:', err)
      return []
    }
  }

  async function fetchUniqueCountriesFromOrganizations() {
    try {
      const { data, error: queryError } = await from('organizations')
        .select('country_id')
        .eq('is_active', true)
        .eq('is_duplicate', false)

      if (queryError) throw queryError

      // Extraire les country_id uniques
      const uniqueCountryIds = new Set()
      data.forEach(org => {
        if (org.country_id) {
          uniqueCountryIds.add(org.country_id)
        }
      })

      return uniqueCountryIds.size
    } catch (err) {
      console.error('Erreur lors de la récupération des pays distincts:', err)
      return 0
    }
  }

  async function fetchVerifiedCount() {
    try {
      const { count, error: queryError } = await from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_duplicate', false)
        .eq('is_verified', true)

      if (queryError) throw queryError

      verifiedCount.value = count || 0
      return count || 0
    } catch (err) {
      console.error('Erreur lors de la récupération du nombre d\'organisations vérifiées:', err)
      return 0
    }
  }

  async function validateOrganization(organizationId) {
    try {
      const { error: insertError } = await from('organization_validations')
        .insert({
          organization_id: organizationId,
          validated_by: (await auth.getUser()).data.user?.id
        })

      if (insertError) throw insertError
      
      // Actualiser les données
      await fetchOrganizations()
      
      return true
    } catch (err) {
      console.error('Erreur lors de la validation:', err)
      throw err
    }
  }

  // Méthodes de navigation
  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      fetchOrganizations()
    }
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
      fetchOrganizations()
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      currentPage.value--
      fetchOrganizations()
    }
  }

  // Réinitialiser les filtres
  function resetFilters() {
    searchQuery.value = ''
    selectedCountry.value = ''
    selectedType.value = ''
    selectedVerificationStatus.value = ''
    fetchOrganizations(true)
  }

  // Appliquer les filtres (réinitialise)
  function applyFilters() {
    fetchOrganizations(true)
  }

  // Nouvelle méthode pour charger les organisations avec options
  async function loadOrganizations(options = {}) {
    try {
      loading.value = true
      error.value = null

      let query = from('organizations')
        .select('id, name, is_verified, organization_type')
        .eq('is_active', true)
        .eq('is_duplicate', false)

      if (options.verified_only) {
        query = query.eq('is_verified', true)
      }

      query = query.order('name')

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      organizations.value = data || []
      return data || []

    } catch (err) {
      console.error('Erreur lors du chargement des organisations:', err)
      error.value = err.message
      organizations.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    organizations,
    loading,
    isLoadingMore,
    error,

    // Pagination
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    hasMore,
    verifiedCount,

    // Filtres
    searchQuery,
    selectedCountry,
    selectedType,
    selectedVerificationStatus,
    sortBy,
    sortOrder,

    // Options
    organizationTypes,
    sortOptions,

    // Méthodes
    fetchOrganizations,
    fetchCountries,
    fetchUniqueCountriesFromOrganizations,
    fetchVerifiedCount,
    validateOrganization,
    goToPage,
    nextPage,
    prevPage,
    resetFilters,
    applyFilters,
    loadOrganizations
  }
}