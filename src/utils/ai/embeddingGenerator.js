/**
 * Utilitaire pour générer des embeddings avec OpenAI
 * Utilise le modèle text-embedding-3-small (1536 dimensions)
 *
 * ⚠️ IMPORTANT: Les embeddings utilisent TOUJOURS l'API OpenAI directe
 * OpenRouter ne supporte pas les modèles d'embeddings
 */

import { OpenAIEmbeddings } from '@langchain/openai'

// Configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

// Vérifier que la clé API OpenAI est configurée
if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.warn('⚠️ OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in .env.local')
  console.warn('⚠️ Note: OpenRouter does NOT support embedding models. You need a direct OpenAI API key.')
}

/**
 * Initialise le générateur d'embeddings OpenAI
 * @returns {OpenAIEmbeddings}
 */
function getEmbeddingsInstance() {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key is not configured. OpenRouter does not support embeddings.')
  }

  return new OpenAIEmbeddings({
    openAIApiKey: OPENAI_API_KEY,
    modelName: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    configuration: {
      apiKey: OPENAI_API_KEY // Forcer la clé API explicitement
    }
  })
}

/**
 * Génère un embedding pour un texte
 * @param {string} text - Texte à convertir en embedding
 * @returns {Promise<number[]>} Vecteur d'embedding (1536 dimensions)
 */
export async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty')
  }

  try {
    const embeddings = getEmbeddingsInstance()
    const vector = await embeddings.embedQuery(text.trim())

    if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(`Invalid embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${vector?.length || 0}`)
    }

    return vector
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error(`Failed to generate embedding: ${error.message}`)
  }
}

/**
 * Génère des embeddings pour plusieurs textes en batch
 * @param {string[]} texts - Tableau de textes
 * @returns {Promise<number[][]>} Tableau de vecteurs d'embeddings
 */
export async function batchGenerateEmbeddings(texts) {
  if (!texts || texts.length === 0) {
    return []
  }

  // Filtrer les textes vides
  const validTexts = texts.filter(text => text && text.trim().length > 0)

  if (validTexts.length === 0) {
    return []
  }

  try {
    const embeddings = getEmbeddingsInstance()
    const vectors = await embeddings.embedDocuments(validTexts.map(t => t.trim()))

    // Vérifier que tous les vecteurs ont la bonne dimension
    for (const vector of vectors) {
      if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(`Invalid embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${vector?.length || 0}`)
      }
    }

    return vectors
  } catch (error) {
    console.error('Error batch generating embeddings:', error)
    throw new Error(`Failed to batch generate embeddings: ${error.message}`)
  }
}

/**
 * Génère des embeddings pour plusieurs textes avec retry et gestion d'erreurs
 * @param {string[]} texts - Tableau de textes
 * @param {number} batchSize - Taille des batchs (par défaut 100)
 * @param {number} maxRetries - Nombre maximum de tentatives (par défaut 3)
 * @returns {Promise<{vectors: number[][], errors: object[]}>}
 */
export async function batchGenerateEmbeddingsWithRetry(texts, batchSize = 100, maxRetries = 3) {
  const results = {
    vectors: [],
    errors: []
  }

  if (!texts || texts.length === 0) {
    return results
  }

  // Diviser en batchs
  const batches = []
  for (let i = 0; i < texts.length; i += batchSize) {
    batches.push({
      texts: texts.slice(i, i + batchSize),
      startIndex: i
    })
  }

  // Traiter chaque batch
  for (const batch of batches) {
    let retries = 0
    let success = false

    while (retries < maxRetries && !success) {
      try {
        const vectors = await batchGenerateEmbeddings(batch.texts)
        results.vectors.push(...vectors)
        success = true
      } catch (error) {
        retries++
        console.error(`Error in batch starting at index ${batch.startIndex}, retry ${retries}/${maxRetries}:`, error)

        if (retries >= maxRetries) {
          results.errors.push({
            startIndex: batch.startIndex,
            endIndex: batch.startIndex + batch.texts.length - 1,
            error: error.message
          })
        } else {
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)))
        }
      }
    }
  }

  return results
}

/**
 * Calcule la similarité cosinus entre deux vecteurs
 * @param {number[]} vectorA - Premier vecteur
 * @param {number[]} vectorB - Deuxième vecteur
 * @returns {number} Score de similarité (entre -1 et 1)
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i]
    magnitudeA += vectorA[i] * vectorA[i]
    magnitudeB += vectorB[i] * vectorB[i]
  }

  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0
  }

  return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Trouve les k vecteurs les plus similaires à un vecteur de requête
 * @param {number[]} queryVector - Vecteur de requête
 * @param {Array<{vector: number[], metadata: object}>} documents - Documents avec leurs vecteurs
 * @param {number} k - Nombre de résultats à retourner
 * @returns {Array<{similarity: number, metadata: object}>}
 */
export function findTopKSimilar(queryVector, documents, k = 5) {
  if (!queryVector || !documents || documents.length === 0) {
    return []
  }

  // Calculer la similarité pour chaque document
  const similarities = documents.map(doc => ({
    similarity: cosineSimilarity(queryVector, doc.vector),
    metadata: doc.metadata
  }))

  // Trier par similarité décroissante
  similarities.sort((a, b) => b.similarity - a.similarity)

  // Retourner les k premiers
  return similarities.slice(0, k)
}

/**
 * Vérifie si la clé API OpenAI pour les embeddings est configurée
 * @returns {boolean}
 */
export function isOpenAIConfigured() {
  return Boolean(OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here')
}

/**
 * Obtient la dimension des embeddings
 * @returns {number}
 */
export function getEmbeddingDimensions() {
  return EMBEDDING_DIMENSIONS
}

/**
 * Obtient le nom du modèle d'embeddings
 * @returns {string}
 */
export function getEmbeddingModel() {
  return EMBEDDING_MODEL
}
