/**
 * Composable pour gérer les embeddings des documents
 * Fournit des fonctions pour générer, stocker et rechercher des embeddings
 */

import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import {
  splitTextIntoSmartChunks,
  cleanText
} from '@/utils/ai/documentProcessor'
import {
  generateEmbedding,
  batchGenerateEmbeddings
} from '@/utils/ai/embeddingGenerator'

export function useDocumentEmbeddings() {
  const { supabase } = useSupabase()

  const isProcessing = ref(false)
  const progress = ref(0)
  const error = ref(null)

  // Configuration par défaut
  const defaultChunkSize = parseInt(import.meta.env.VITE_AI_CHUNK_SIZE) || 1000
  const defaultChunkOverlap = parseInt(import.meta.env.VITE_AI_CHUNK_OVERLAP) || 200

  /**
   * Génère et stocke les embeddings pour un document
   * NOTE: L'extraction de texte depuis PDF/DOCX doit être faite côté serveur avant d'appeler cette fonction
   * @param {string} documentId - ID du document
   * @param {string} documentText - Texte extrait du document (extraction faite côté serveur)
   * @param {object} documentMetadata - Métadonnées du document (titre, catégorie, pages, etc.)
   * @returns {Promise<{success: boolean, chunksCount: number, error: string}>}
   */
  const generateDocumentEmbeddings = async (documentId, documentText, documentMetadata = {}) => {
    try {
      isProcessing.value = true
      progress.value = 0
      error.value = null

      // Étape 1: Valider et nettoyer le texte (10%)
      progress.value = 10

      if (!documentText || documentText.trim().length === 0) {
        throw new Error('No text provided for document')
      }

      // Nettoyer le texte
      const cleanedText = cleanText(documentText)

      // Étape 2: Diviser en chunks (20%)
      progress.value = 20
      const chunks = splitTextIntoSmartChunks(cleanedText, defaultChunkSize, defaultChunkOverlap)

      if (chunks.length === 0) {
        throw new Error('No chunks generated from text')
      }

      // Étape 3: Générer les embeddings (20% → 70%)
      const embeddings = []
      const batchSize = 10 // Traiter 10 chunks à la fois

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize)
        const batchTexts = batch.map(chunk => chunk.text)

        const batchEmbeddings = await batchGenerateEmbeddings(batchTexts)
        embeddings.push(...batchEmbeddings)

        // Mettre à jour la progression
        progress.value = 20 + Math.round((i / chunks.length) * 50)
      }

      // Étape 4: Stocker les embeddings dans Supabase (70% → 100%)
      progress.value = 70

      const embeddingsData = chunks.map((chunk, index) => ({
        document_id: documentId,
        chunk_index: chunk.index,
        chunk_text: chunk.text,
        chunk_metadata: {
          start: chunk.start,
          end: chunk.end,
          pages: documentMetadata.pages || null,
          title: documentMetadata.title || null,
          category: documentMetadata.category || null,
          document_title: documentMetadata.title || null
        },
        embedding: embeddings[index]
      }))

      // Insérer par batch
      for (let i = 0; i < embeddingsData.length; i += batchSize) {
        const batch = embeddingsData.slice(i, i + batchSize)

        const { error: insertError } = await supabase
          .from('document_embeddings')
          .insert(batch)

        if (insertError) {
          throw insertError
        }

        // Mettre à jour la progression
        progress.value = 70 + Math.round((i / embeddingsData.length) * 30)
      }

      progress.value = 100

      return {
        success: true,
        chunksCount: chunks.length,
        error: null
      }
    } catch (err) {
      console.error('Error generating document embeddings:', err)
      error.value = err.message
      return {
        success: false,
        chunksCount: 0,
        error: err.message
      }
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Recherche des documents similaires par similarité vectorielle
   * @param {string} query - Requête de recherche
   * @param {number} limit - Nombre de résultats à retourner
   * @param {string} category - Catégorie optionnelle pour filtrer
   * @returns {Promise<Array>}
   */
  const searchSimilarDocuments = async (query, limit = 5, category = null) => {
    try {
      isProcessing.value = true
      error.value = null

      // Générer l'embedding pour la requête
      const queryEmbedding = await generateEmbedding(query)

      // Rechercher les documents similaires via RPC
      const { data, error: rpcError } = await supabase
        .rpc('search_similar_documents', {
          query_embedding: queryEmbedding,
          match_count: limit,
          filter_category: category
        })

      if (rpcError) {
        throw rpcError
      }

      return data || []
    } catch (err) {
      console.error('Error searching similar documents:', err)
      error.value = err.message
      return []
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Supprime les embeddings d'un document
   * @param {string} documentId - ID du document
   * @returns {Promise<boolean>}
   */
  const deleteDocumentEmbeddings = async (documentId) => {
    try {
      isProcessing.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('document_embeddings')
        .delete()
        .eq('document_id', documentId)

      if (deleteError) {
        throw deleteError
      }

      return true
    } catch (err) {
      console.error('Error deleting document embeddings:', err)
      error.value = err.message
      return false
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Régénère les embeddings pour un document (supprime et recrée)
   * @param {string} documentId - ID du document
   * @param {string} documentText - Texte extrait du document
   * @param {object} documentMetadata - Métadonnées du document
   * @returns {Promise<{success: boolean, chunksCount: number, error: string}>}
   */
  const regenerateDocumentEmbeddings = async (documentId, documentText, documentMetadata = {}) => {
    try {
      // Supprimer les embeddings existants
      await deleteDocumentEmbeddings(documentId)

      // Générer de nouveaux embeddings
      return await generateDocumentEmbeddings(documentId, documentText, documentMetadata)
    } catch (err) {
      console.error('Error regenerating document embeddings:', err)
      return {
        success: false,
        chunksCount: 0,
        error: err.message
      }
    }
  }

  /**
   * Vérifie si un document a des embeddings
   * @param {string} documentId - ID du document
   * @returns {Promise<{hasEmbeddings: boolean, count: number}>}
   */
  const checkDocumentEmbeddings = async (documentId) => {
    try {
      const { count, error: countError } = await supabase
        .from('document_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId)

      if (countError) {
        throw countError
      }

      return {
        hasEmbeddings: count > 0,
        count: count || 0
      }
    } catch (err) {
      console.error('Error checking document embeddings:', err)
      return {
        hasEmbeddings: false,
        count: 0
      }
    }
  }

  /**
   * Récupère tous les embeddings d'un document
   * @param {string} documentId - ID du document
   * @returns {Promise<Array>}
   */
  const getDocumentEmbeddings = async (documentId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('document_embeddings')
        .select('*')
        .eq('document_id', documentId)
        .order('chunk_index', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      return data || []
    } catch (err) {
      console.error('Error fetching document embeddings:', err)
      return []
    }
  }

  /**
   * Obtient les statistiques des embeddings
   * @returns {Promise<object>}
   */
  const getEmbeddingsStats = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('document_embeddings')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw countError
      }

      const { data: uniqueDocs, error: docsError } = await supabase
        .from('document_embeddings')
        .select('document_id')

      if (docsError) {
        throw docsError
      }

      const uniqueDocumentsCount = new Set(uniqueDocs.map(d => d.document_id)).size

      return {
        totalChunks: count || 0,
        totalDocuments: uniqueDocumentsCount
      }
    } catch (err) {
      console.error('Error fetching embeddings stats:', err)
      return {
        totalChunks: 0,
        totalDocuments: 0
      }
    }
  }

  return {
    // État
    isProcessing,
    progress,
    error,

    // Méthodes
    generateDocumentEmbeddings,
    searchSimilarDocuments,
    deleteDocumentEmbeddings,
    regenerateDocumentEmbeddings,
    checkDocumentEmbeddings,
    getDocumentEmbeddings,
    getEmbeddingsStats
  }
}
