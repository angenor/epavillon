import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const MIN_QUERY_LENGTH = 3
const DEBOUNCE_MS = 300

/**
 * Recherche d'organisations existantes (autocomplétion avec debounce)
 * via la fonction RPC `search_organizations_simple`.
 */
export function useOrganizationSearch() {
  const { supabase } = useSupabase()

  const query = ref('')
  const results = ref([])
  const loading = ref(false)
  const hasSearched = ref(false)

  let searchTimeout = null

  const search = () => {
    clearTimeout(searchTimeout)

    if (query.value.trim().length < MIN_QUERY_LENGTH) {
      results.value = []
      hasSearched.value = false
      return
    }

    searchTimeout = setTimeout(async () => {
      try {
        loading.value = true
        const { data, error } = await supabase
          .rpc('search_organizations_simple', { search_text: query.value.trim() })

        if (error) throw error
        results.value = data || []
      } catch (error) {
        console.error('Error searching organizations:', error)
        results.value = []
      } finally {
        loading.value = false
        hasSearched.value = true
      }
    }, DEBOUNCE_MS)
  }

  return {
    query,
    results,
    loading,
    hasSearched,
    minQueryLength: MIN_QUERY_LENGTH,
    search
  }
}
