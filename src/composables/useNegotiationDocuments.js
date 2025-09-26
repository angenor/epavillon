import { ref } from 'vue'
import { useSupabase } from './useSupabase'

export function useNegotiationDocuments() {
  const { from: supabaseFrom, auth } = useSupabase()
  
  const documents = ref([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const error = ref(null)
  const pageSize = 12

  const fetchDocuments = async (category = null, reset = true) => {
    if (reset) {
      loading.value = true
      documents.value = []
      hasMore.value = true
    } else {
      loadingMore.value = true
    }
    
    error.value = null
    
    try {
      const from = reset ? 0 : documents.value.length
      const to = from + pageSize - 1
      
      let query = supabaseFrom('negotiation_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)
      
      if (category) {
        query = query.eq('category', category)
      }
      
      const { data, error: documentsError } = await query
      
      if (documentsError) throw documentsError
      
      // Get user favorites if authenticated
      const { data: userData } = await auth.getUser()
      let userFavorites = []

      if (userData?.user) {
        const { data: favorites } = await supabaseFrom('document_favorites')
          .select('document_id')
          .eq('user_id', userData.user.id)

        userFavorites = favorites?.map(fav => fav.document_id) || []
      }
      
      // Add favorite status
      const documentsWithFavorites = data.map(doc => ({
        ...doc,
        is_favorited: userFavorites.includes(doc.id)
      }))
      
      if (reset) {
        documents.value = documentsWithFavorites
      } else {
        documents.value.push(...documentsWithFavorites)
      }
      
      hasMore.value = data.length === pageSize
      
    } catch (err) {
      error.value = err.message
      console.error('Error fetching negotiation documents:', err)
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  const loadMoreDocuments = async (category = null) => {
    if (!hasMore.value || loadingMore.value) return
    await fetchDocuments(category, false)
  }

  const viewDocument = async (documentId) => {
    try {
      // Get document details
      const { data: doc, error: docError } = await supabaseFrom('negotiation_documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (docError) throw docError

      // Open document in new tab
      if (doc.file_url) {
        window.open(doc.file_url, '_blank')

        // Optionally track view count (if you have this feature)
        await supabaseFrom('document_views')
          .insert({
            document_id: documentId,
            viewed_at: new Date().toISOString()
          })
      }

    } catch (err) {
      console.error('Error viewing document:', err)
      throw err
    }
  }

  const downloadDocument = async (documentId) => {
    try {
      // Get document details
      const { data: doc, error: docError } = await supabaseFrom('negotiation_documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (docError) throw docError

      if (doc.file_url) {
        // Create download link
        const link = document.createElement('a')
        link.href = doc.file_url
        link.download = doc.title || 'document'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Optionally track download count (if you have this feature)
        await supabaseFrom('document_downloads')
          .insert({
            document_id: documentId,
            downloaded_at: new Date().toISOString()
          })
      }

    } catch (err) {
      console.error('Error downloading document:', err)
      throw err
    }
  }

  const toggleFavorite = async (documentId) => {
    const { data: userData } = await auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')

    try {
      const documentIndex = documents.value.findIndex(doc => doc.id === documentId)
      if (documentIndex === -1) return

      const doc = documents.value[documentIndex]
      const isFavorited = doc.is_favorited

      if (isFavorited) {
        // Remove from favorites
        const { error: removeError } = await supabaseFrom('document_favorites')
          .delete()
          .eq('document_id', documentId)
          .eq('user_id', userData.user.id)

        if (removeError) throw removeError

        documents.value[documentIndex].is_favorited = false
      } else {
        // Add to favorites
        const { error: addError } = await supabaseFrom('document_favorites')
          .insert({
            document_id: documentId,
            user_id: userData.user.id
          })

        if (addError) throw addError

        documents.value[documentIndex].is_favorited = true
      }

    } catch (err) {
      console.error('Error toggling favorite:', err)
      throw err
    }
  }

  return {
    documents,
    loading,
    loadingMore,
    hasMore,
    error,
    fetchDocuments,
    loadMoreDocuments,
    viewDocument,
    downloadDocument,
    toggleFavorite
  }
}