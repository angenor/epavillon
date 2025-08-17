import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

export function useOrganizations() {
  const { supabase, auth, from } = useSupabase()
  
  const organizations = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(12)
  const totalItems = ref(0)

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
  async function fetchOrganizations() {
    try {
      loading.value = true
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
          ),
          activities(count)
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
      const startIndex = (currentPage.value - 1) * itemsPerPage.value
      query = query.range(startIndex, startIndex + itemsPerPage.value - 1)

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError

      organizations.value = data || []
      totalItems.value = count || 0

    } catch (err) {
      console.error('Erreur lors de la récupération des organisations:', err)
      error.value = err.message
      organizations.value = []
    } finally {
      loading.value = false
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
    currentPage.value = 1
    fetchOrganizations()
  }

  // Appliquer les filtres (réinitialise à la page 1)
  function applyFilters() {
    currentPage.value = 1
    fetchOrganizations()
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
    error,
    
    // Pagination
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    
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
    validateOrganization,
    goToPage,
    nextPage,
    prevPage,
    resetFilters,
    applyFilters,
    loadOrganizations
  }
}