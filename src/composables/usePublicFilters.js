import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function usePublicFilters() {
  const organizations = ref([])
  const countries = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Récupère les organisations disponibles pour les filtres
   */
  const fetchOrganizations = async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('organizations')
        .select('id, name, is_verified')
        .eq('is_active', true)
        .order('name')

      if (queryError) {
        throw queryError
      }

      organizations.value = data || []
    } catch (err) {
      console.error('Erreur lors de la récupération des organisations:', err)
      organizations.value = []
    }
  }

  /**
   * Récupère les pays disponibles pour les filtres
   */
  const fetchCountries = async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('countries')
        .select('id, name_fr, name_en')
        .order('name_fr')

      if (queryError) {
        throw queryError
      }

      countries.value = data || []
    } catch (err) {
      console.error('Erreur lors de la récupération des pays:', err)
      countries.value = []
    }
  }

  /**
   * Charge toutes les données de filtres
   */
  const loadFiltersData = async () => {
    loading.value = true
    error.value = null

    try {
      await Promise.all([
        fetchOrganizations(),
        fetchCountries()
      ])
    } catch (err) {
      console.error('Erreur lors du chargement des données de filtres:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Options d'expertise disponibles
   */
  const expertiseOptions = computed(() => [
    {
      value: 'negotiator',
      label_fr: 'Négociateur',
      label_en: 'Negotiator'
    },
    {
      value: 'trainer',
      label_fr: 'Formateur',
      label_en: 'Trainer'
    },
    {
      value: 'sustainable_development',
      label_fr: 'Développement durable',
      label_en: 'Sustainable Development'
    }
  ])

  return {
    organizations: computed(() => organizations.value),
    countries: computed(() => countries.value),
    expertiseOptions,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    loadFiltersData
  }
}