import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'

export function useFavorites() {
  const { from: supabaseFrom, auth, rpc } = useSupabase()

  const favorites = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Récupérer tous les documents favoris de l'utilisateur
  const fetchFavorites = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await auth.getUser()
      if (!userData?.user) {
        favorites.value = []
        return
      }

      const { data, error: favError } = await supabaseFrom('user_favorite_documents')
        .select(`
          id,
          favorited_at,
          document:negotiation_documents(*)
        `)
        .eq('user_id', userData.user.id)
        .order('favorited_at', { ascending: false })

      if (favError) throw favError

      favorites.value = data?.map(fav => ({
        ...fav.document,
        favorited_at: fav.favorited_at,
        is_favorited: true
      })) || []

    } catch (err) {
      error.value = err.message
      console.error('Error fetching favorites:', err)
    } finally {
      loading.value = false
    }
  }

  // Basculer le statut favori d'un document
  const toggleFavorite = async (documentId) => {
    const { data: userData } = await auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')

    try {
      // Utiliser la fonction Supabase créée dans le script SQL
      const { data, error: toggleError } = await rpc('toggle_document_favorite', {
        p_document_id: documentId
      })

      if (toggleError) throw toggleError

      // Mettre à jour la liste locale des favoris
      if (data.action === 'removed') {
        favorites.value = favorites.value.filter(doc => doc.id !== documentId)
      } else if (data.action === 'added') {
        // Récupérer les détails du document ajouté
        const { data: doc } = await supabaseFrom('negotiation_documents')
          .select('*')
          .eq('id', documentId)
          .single()

        if (doc) {
          favorites.value.unshift({
            ...doc,
            favorited_at: new Date().toISOString(),
            is_favorited: true
          })
        }
      }

      return data

    } catch (err) {
      console.error('Error toggling favorite:', err)
      throw err
    }
  }

  // Vérifier si un document est dans les favoris
  const isFavorited = async (documentId) => {
    try {
      const { data, error } = await rpc('is_document_favorited', {
        p_document_id: documentId
      })

      if (error) throw error
      return data

    } catch (err) {
      console.error('Error checking favorite status:', err)
      return false
    }
  }

  // Obtenir le nombre de favoris d'un document
  const getFavoritesCount = async (documentId) => {
    try {
      const { data, error } = await rpc('get_document_favorites_count', {
        p_document_id: documentId
      })

      if (error) throw error
      return data

    } catch (err) {
      console.error('Error getting favorites count:', err)
      return 0
    }
  }

  // Retirer un document des favoris
  const removeFavorite = async (documentId) => {
    const { data: userData } = await auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')

    try {
      const { error: removeError } = await supabaseFrom('user_favorite_documents')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', userData.user.id)

      if (removeError) throw removeError

      // Mettre à jour la liste locale
      favorites.value = favorites.value.filter(doc => doc.id !== documentId)

    } catch (err) {
      console.error('Error removing favorite:', err)
      throw err
    }
  }

  // Filtrer les favoris par catégorie
  const favoritesByCategory = computed(() => {
    return (category) => {
      if (!category || category === 'all') return favorites.value
      return favorites.value.filter(doc => doc.category === category)
    }
  })

  // Nombre total de favoris
  const favoritesCount = computed(() => favorites.value.length)

  return {
    favorites,
    loading,
    error,
    favoritesCount,
    favoritesByCategory,
    fetchFavorites,
    toggleFavorite,
    isFavorited,
    getFavoritesCount,
    removeFavorite
  }
}