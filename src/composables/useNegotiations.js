import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'

export function useNegotiations() {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  
  const isLoading = ref(false)
  const error = ref(null)

  // Catégories disponibles
  const categories = [
    { value: 'climate', label: 'Climat' },
    { value: 'biodiversity', label: 'Biodiversité' },
    { value: 'desertification', label: 'Désertification' }
  ]

  // Types de documents
  const documentTypes = [
    { value: 'negotiation_guide', label: 'Guide de négociation' },
    { value: 'technical_note', label: 'Note technique' },
    { value: 'relevant_document', label: 'Document pertinent' },
    { value: 'other', label: 'Autre' }
  ]

  // Types de réunion
  const meetingTypes = [
    { value: 'Preparatory_Workshop', label: 'Atelier préparatoire' },
    { value: 'Francophone_Consultation', label: 'Consultation francophone' },
    { value: 'Innovation', label: 'Innovation' },
    { value: 'Field_Training_Workshop', label: 'Atelier de formation sur le terrain' }
  ]

  /**
   * Créer une nouvelle session de négociation
   */
  const createSession = async (sessionData) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: createError } = await supabase
        .from('negotiation_sessions')
        .insert([{
          title: sessionData.title,
          description: sessionData.description,
          start_datetime: sessionData.start_datetime,
          end_datetime: sessionData.end_datetime,
          location: sessionData.location,
          category: sessionData.category,
          meeting_type: sessionData.meeting_type || 'Preparatory_Workshop',
          is_ifdd_organized: sessionData.is_ifdd_organized ?? true,
          external_link: sessionData.external_link,
          created_by: user.value?.id
        }])
        .select()
        .single()

      if (createError) throw createError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la création de la session:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mettre à jour une session de négociation
   */
  const updateSession = async (sessionId, sessionData) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('negotiation_sessions')
        .update({
          title: sessionData.title,
          description: sessionData.description,
          start_datetime: sessionData.start_datetime,
          end_datetime: sessionData.end_datetime,
          location: sessionData.location,
          category: sessionData.category,
          meeting_type: sessionData.meeting_type,
          is_ifdd_organized: sessionData.is_ifdd_organized,
          external_link: sessionData.external_link
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (updateError) throw updateError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la mise à jour de la session:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Supprimer une session de négociation
   */
  const deleteSession = async (sessionId) => {
    try {
      isLoading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('negotiation_sessions')
        .delete()
        .eq('id', sessionId)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la suppression de la session:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer toutes les sessions de négociation
   */
  const getAllSessions = async (filters = {}) => {
    try {
      isLoading.value = true
      error.value = null

      let query = supabase
        .from('negotiation_sessions')
        .select(`
          id,
          title,
          description,
          start_datetime,
          end_datetime,
          location,
          category,
          is_ifdd_organized,
          external_link,
          created_at,
          created_by,
          creator:created_by (
            id,
            first_name,
            last_name
          )
        `)

      // Appliquer les filtres
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.upcoming) {
        query = query.gte('start_datetime', new Date().toISOString())
      }

      const { data, error: fetchError } = await query.order('start_datetime', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la récupération des sessions:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer une session par ID
   */
  const getSessionById = async (sessionId) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('negotiation_sessions')
        .select(`
          id,
          title,
          description,
          start_datetime,
          end_datetime,
          location,
          category,
          is_ifdd_organized,
          external_link,
          created_at,
          created_by,
          creator:created_by (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', sessionId)
        .single()

      if (fetchError) throw fetchError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la récupération de la session:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Créer un nouveau document de négociation
   */
  const createDocument = async (documentData) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: createError } = await supabase
        .from('negotiation_documents')
        .insert([{
          title: documentData.title,
          document_type: documentData.document_type,
          category: documentData.category,
          description: documentData.description,
          cover_image_url: documentData.cover_image_url,
          file_url: documentData.file_url,
          uploaded_by: user.value?.id
        }])
        .select()
        .single()

      if (createError) throw createError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la création du document:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mettre à jour un document de négociation
   */
  const updateDocument = async (documentId, documentData) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('negotiation_documents')
        .update({
          title: documentData.title,
          document_type: documentData.document_type,
          category: documentData.category,
          description: documentData.description,
          cover_image_url: documentData.cover_image_url,
          file_url: documentData.file_url
        })
        .eq('id', documentId)
        .select()
        .single()

      if (updateError) throw updateError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la mise à jour du document:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Supprimer un document de négociation
   */
  const deleteDocument = async (documentId) => {
    try {
      isLoading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('negotiation_documents')
        .delete()
        .eq('id', documentId)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la suppression du document:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer tous les documents de négociation
   */
  const getAllDocuments = async (filters = {}) => {
    try {
      isLoading.value = true
      error.value = null

      let query = supabase
        .from('negotiation_documents')
        .select(`
          id,
          title,
          document_type,
          category,
          description,
          cover_image_url,
          file_url,
          created_at,
          uploaded_by,
          uploader:uploaded_by (
            id,
            first_name,
            last_name
          )
        `)

      // Appliquer les filtres
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.document_type) {
        query = query.eq('document_type', filters.document_type)
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la récupération des documents:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer un document par ID
   */
  const getDocumentById = async (documentId) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('negotiation_documents')
        .select(`
          id,
          title,
          document_type,
          category,
          description,
          cover_image_url,
          file_url,
          created_at,
          uploaded_by,
          uploader:uploaded_by (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', documentId)
        .single()

      if (fetchError) throw fetchError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la récupération du document:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * S'inscrire à une session de négociation
   */
  const registerForSession = async (sessionId) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: registerError } = await supabase
        .from('session_registrations')
        .insert([{
          session_id: sessionId,
          user_id: user.value?.id
        }])
        .select()
        .single()

      if (registerError) throw registerError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de l\'inscription à la session:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Se désinscrire d'une session de négociation
   */
  const unregisterFromSession = async (sessionId) => {
    try {
      isLoading.value = true
      error.value = null

      const { error: unregisterError } = await supabase
        .from('session_registrations')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.value?.id)

      if (unregisterError) throw unregisterError

      return true
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la désinscription de la session:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Vérifier si l'utilisateur est inscrit à une session
   */
  const isRegisteredForSession = async (sessionId) => {
    try {
      const { data, error: checkError } = await supabase
        .from('session_registrations')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.value?.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError

      return !!data
    } catch (err) {
      console.error('Erreur lors de la vérification d\'inscription:', err)
      return false
    }
  }

  /**
   * Récupérer les statistiques des négociations
   */
  const getStats = async () => {
    try {
      isLoading.value = true
      error.value = null

      const [sessionsResult, documentsResult] = await Promise.all([
        supabase
          .from('negotiation_sessions')
          .select('category', { count: 'exact' }),
        supabase
          .from('negotiation_documents')
          .select('category', { count: 'exact' })
      ])

      const stats = {
        sessions: {
          total: sessionsResult.count || 0,
          by_category: {}
        },
        documents: {
          total: documentsResult.count || 0,
          by_category: {}
        }
      }

      // Compter par catégorie
      for (const category of categories) {
        const [sessionCount, documentCount] = await Promise.all([
          supabase
            .from('negotiation_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('category', category.value),
          supabase
            .from('negotiation_documents')
            .select('*', { count: 'exact', head: true })
            .eq('category', category.value)
        ])

        stats.sessions.by_category[category.value] = sessionCount.count || 0
        stats.documents.by_category[category.value] = documentCount.count || 0
      }

      return stats
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la récupération des statistiques:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    // État
    isLoading,
    error,
    categories,
    documentTypes,
    meetingTypes,
    
    // Sessions
    createSession,
    updateSession,
    deleteSession,
    getAllSessions,
    getSessionById,
    registerForSession,
    unregisterFromSession,
    isRegisteredForSession,
    
    // Documents
    createDocument,
    updateDocument,
    deleteDocument,
    getAllDocuments,
    getDocumentById,
    
    // Statistiques
    getStats
  }
}