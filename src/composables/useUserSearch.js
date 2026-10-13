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

  /**
   * Recherche d'utilisateurs par prénom, nom ou email, avec leur organisation actuelle
   * @param {string} query - Terme de recherche
   * @returns {Promise<Array>} - Liste des utilisateurs trouvés
   */
  const searchUsers = async (query) => {
    // Retirer les caractères qui casseraient le filtre PostgREST .or()
    const term = (query || '').replace(/[,()%]/g, ' ').trim()
    if (term.length < 2) {
      searchResults.value = []
      return []
    }

    isSearching.value = true

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, profile_photo_url, organization:organizations!organization_id(id, name)')
        .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(10)

      if (error) throw error

      searchResults.value = data || []
      return searchResults.value
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error)
      searchResults.value = []
      return []
    } finally {
      isSearching.value = false
    }
  }

  return {
    searchUsers,
    searchUsersByEmail,
    searchResults,
    isSearching
  }
}
