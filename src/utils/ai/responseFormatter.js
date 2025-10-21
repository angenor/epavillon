/**
 * Utilitaire pour formater les réponses du chatbot avec références
 */

/**
 * Extrait les références des documents sources
 * @param {Array} sources - Documents sources retournés par la recherche
 * @returns {Array<{documentId: string, title: string, page: number, chunk: string, url: string}>}
 */
export function extractReferences(sources) {
  if (!sources || sources.length === 0) {
    return []
  }

  return sources.map((source, index) => {
    const metadata = source.metadata || {}

    return {
      id: `ref-${index + 1}`,
      documentId: metadata.document_id || metadata.documentId || null,
      title: metadata.title || metadata.document_title || 'Document sans titre',
      page: metadata.page || metadata.pageNumber || null,
      chunk: source.pageContent || source.text || source.content || '',
      chunkIndex: metadata.chunk_index || metadata.chunkIndex || null,
      url: metadata.file_url || metadata.fileUrl || metadata.url || null,
      category: metadata.category || null,
      similarity: metadata.similarity || source.similarity || null
    }
  })
}

/**
 * Formate la réponse du chatbot avec les références
 * @param {string} response - Réponse brute du chatbot
 * @param {Array} sources - Documents sources
 * @returns {object} Réponse formatée avec références
 */
export function formatResponseWithReferences(response, sources = []) {
  const references = extractReferences(sources)

  return {
    content: response,
    references: references,
    hasReferences: references.length > 0,
    referencesCount: references.length
  }
}

/**
 * Génère une citation Markdown pour une référence
 * @param {object} reference - Référence à formater
 * @returns {string} Citation formatée
 */
export function formatReferenceCitation(reference) {
  const parts = []

  if (reference.title) {
    parts.push(`**${reference.title}**`)
  }

  if (reference.page) {
    parts.push(`p. ${reference.page}`)
  }

  if (reference.category) {
    parts.push(`(${reference.category})`)
  }

  return parts.join(' - ')
}

/**
 * Génère une liste de références en Markdown
 * @param {Array} references - Tableau de références
 * @returns {string} Liste formatée en Markdown
 */
export function formatReferencesMarkdown(references) {
  if (!references || references.length === 0) {
    return ''
  }

  const lines = ['## Sources']

  references.forEach((ref, index) => {
    const citation = formatReferenceCitation(ref)
    lines.push(`${index + 1}. ${citation}`)
  })

  return lines.join('\n')
}

/**
 * Extrait les métadonnées d'une réponse pour le stockage
 * @param {object} response - Réponse complète
 * @param {Array} sources - Sources utilisées
 * @returns {object} Métadonnées à stocker
 */
export function extractResponseMetadata(response, sources = []) {
  const references = extractReferences(sources)

  return {
    references: references.map(ref => ({
      documentId: ref.documentId,
      title: ref.title,
      page: ref.page,
      chunkIndex: ref.chunkIndex,
      similarity: ref.similarity
    })),
    referencesCount: references.length,
    timestamp: new Date().toISOString()
  }
}

/**
 * Tronque un texte en gardant les mots complets
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export function truncateText(text, maxLength = 200) {
  if (!text || text.length <= maxLength) {
    return text
  }

  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + '...'
  }

  return truncated + '...'
}

/**
 * Formate un chunk de texte pour l'affichage (avec ellipse)
 * @param {string} chunk - Texte du chunk
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Chunk formaté
 */
export function formatChunkPreview(chunk, maxLength = 200) {
  return truncateText(chunk, maxLength)
}

/**
 * Génère un titre pour une session de chat basé sur le premier message
 * @param {string} firstMessage - Premier message de l'utilisateur
 * @param {number} maxLength - Longueur maximale du titre
 * @returns {string} Titre généré
 */
export function generateSessionTitle(firstMessage, maxLength = 50) {
  if (!firstMessage) {
    return 'Nouvelle conversation'
  }

  const cleaned = firstMessage.trim().replace(/\s+/g, ' ')

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  return truncateText(cleaned, maxLength)
}

/**
 * Formate la durée d'une réponse (temps de réponse)
 * @param {number} milliseconds - Durée en millisecondes
 * @returns {string} Durée formatée (ex: "1.2s", "350ms")
 */
export function formatResponseTime(milliseconds) {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`
  }

  const seconds = (milliseconds / 1000).toFixed(1)
  return `${seconds}s`
}

/**
 * Formate le nombre de tokens utilisés
 * @param {number} tokens - Nombre de tokens
 * @returns {string} Nombre formaté (ex: "1,234 tokens")
 */
export function formatTokenCount(tokens) {
  if (!tokens) return '0 tokens'

  return `${tokens.toLocaleString()} token${tokens > 1 ? 's' : ''}`
}

/**
 * Calcule les statistiques d'une conversation
 * @param {Array} messages - Messages de la conversation
 * @returns {object} Statistiques
 */
export function calculateConversationStats(messages) {
  if (!messages || messages.length === 0) {
    return {
      messageCount: 0,
      userMessageCount: 0,
      assistantMessageCount: 0,
      totalTokens: 0,
      averageResponseTime: 0
    }
  }

  let totalTokens = 0
  let totalResponseTime = 0
  let responseCount = 0

  const userMessages = messages.filter(m => m.role === 'user')
  const assistantMessages = messages.filter(m => m.role === 'assistant')

  assistantMessages.forEach(msg => {
    if (msg.metadata) {
      if (msg.metadata.tokens) {
        totalTokens += msg.metadata.tokens
      }
      if (msg.metadata.responseTime) {
        totalResponseTime += msg.metadata.responseTime
        responseCount++
      }
    }
  })

  return {
    messageCount: messages.length,
    userMessageCount: userMessages.length,
    assistantMessageCount: assistantMessages.length,
    totalTokens,
    averageResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0
  }
}

/**
 * Vérifie si une réponse contient des références valides
 * @param {object} formattedResponse - Réponse formatée
 * @returns {boolean}
 */
export function hasValidReferences(formattedResponse) {
  return (
    formattedResponse &&
    formattedResponse.references &&
    formattedResponse.references.length > 0 &&
    formattedResponse.references.some(ref => ref.documentId || ref.title)
  )
}

/**
 * Groupe les références par document
 * @param {Array} references - Tableau de références
 * @returns {Map<string, Array>} Références groupées par document
 */
export function groupReferencesByDocument(references) {
  const grouped = new Map()

  references.forEach(ref => {
    const key = ref.documentId || ref.title

    if (!grouped.has(key)) {
      grouped.set(key, [])
    }

    grouped.get(key).push(ref)
  })

  return grouped
}

/**
 * Formate les références groupées pour l'affichage
 * @param {Array} references - Tableau de références
 * @returns {Array<{document: string, pages: Array}>}
 */
export function formatGroupedReferences(references) {
  const grouped = groupReferencesByDocument(references)
  const result = []

  grouped.forEach((refs, documentKey) => {
    const pages = refs
      .map(ref => ref.page)
      .filter(page => page !== null)
      .sort((a, b) => a - b)

    result.push({
      document: refs[0].title || documentKey,
      documentId: refs[0].documentId,
      url: refs[0].url,
      category: refs[0].category,
      pages: [...new Set(pages)], // Supprimer les doublons
      referencesCount: refs.length
    })
  })

  return result
}
