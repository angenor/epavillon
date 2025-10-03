import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function useUserSearch() {
  const searchResults = ref([])
  const isSearching = ref(false)

  /**
   * Recherche d'utilisateurs par email
   * @param {string} query - Terme de recherche (email)
   * @returns {Promise<Array>} - Liste des utilisateurs trouvés
   */
  const searchUsersByEmail = async (query) => {
    if (!query || query.length < 3) {
      searchResults.value = []
      return []
    }

    isSearching.value = true

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .ilike('email', `%${query}%`)
        .limit(10)

      if (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error)
        searchResults.value = []
        return []
      }

      searchResults.value = data || []
      return data || []
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      searchResults.value = []
      return []
    } finally {
      isSearching.value = false
    }
  }

  return {
    searchUsersByEmail,
    searchResults,
    isSearching
  }
}
