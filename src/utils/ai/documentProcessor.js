/**
 * Utilitaire pour le traitement côté client des documents
 * NOTE: L'extraction de texte depuis PDF/DOCX doit être faite côté serveur
 * Ce fichier contient uniquement les fonctions de découpage de texte qui peuvent s'exécuter dans le navigateur
 */

/**
 * Divise un texte en chunks avec overlap
 * @param {string} text - Texte à diviser
 * @param {number} chunkSize - Taille de chaque chunk (en caractères)
 * @param {number} overlap - Chevauchement entre chunks (en caractères)
 * @returns {Array<{text: string, index: number, start: number, end: number}>}
 */
export function splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
  if (!text || text.trim().length === 0) {
    return []
  }

  const chunks = []
  let index = 0
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunkText = text.slice(start, end)

    chunks.push({
      text: chunkText.trim(),
      index: index,
      start: start,
      end: end
    })

    index++
    start = end - overlap

    // Éviter les boucles infinies
    if (start >= text.length) {
      break
    }
  }

  return chunks.filter(chunk => chunk.text.length > 0)
}

/**
 * Divise un texte en chunks intelligemment (respecte les paragraphes et phrases)
 * @param {string} text - Texte à diviser
 * @param {number} chunkSize - Taille approximative de chaque chunk
 * @param {number} overlap - Chevauchement entre chunks
 * @returns {Array<{text: string, index: number}>}
 */
export function splitTextIntoSmartChunks(text, chunkSize = 1000, overlap = 200) {
  if (!text || text.trim().length === 0) {
    return []
  }

  // Diviser par paragraphes
  const paragraphs = text.split(/\n\n+/)
  const chunks = []
  let currentChunk = ''
  let index = 0

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim()

    if (!trimmedParagraph) continue

    // Si le paragraphe seul dépasse la taille, le diviser
    if (trimmedParagraph.length > chunkSize) {
      if (currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          index: index++
        })
        currentChunk = ''
      }

      // Diviser le long paragraphe en phrases
      const sentences = trimmedParagraph.split(/[.!?]+/)
      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim()
        if (!trimmedSentence) continue

        if ((currentChunk + ' ' + trimmedSentence).length > chunkSize) {
          if (currentChunk) {
            chunks.push({
              text: currentChunk.trim(),
              index: index++
            })
          }
          currentChunk = trimmedSentence
        } else {
          currentChunk += (currentChunk ? '. ' : '') + trimmedSentence
        }
      }
    } else {
      // Ajouter le paragraphe au chunk courant
      if ((currentChunk + '\n\n' + trimmedParagraph).length > chunkSize) {
        if (currentChunk) {
          chunks.push({
            text: currentChunk.trim(),
            index: index++
          })
        }
        currentChunk = trimmedParagraph
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph
      }
    }
  }

  // Ajouter le dernier chunk
  if (currentChunk) {
    chunks.push({
      text: currentChunk.trim(),
      index: index
    })
  }

  return chunks.filter(chunk => chunk.text.length > 0)
}

/**
 * Nettoie le texte extrait (supprime les caractères spéciaux, espaces multiples, etc.)
 * @param {string} text - Texte à nettoyer
 * @returns {string} Texte nettoyé
 */
export function cleanText(text) {
  if (!text) return ''

  return text
    // Supprimer les caractères de contrôle
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Normaliser les espaces
    .replace(/\s+/g, ' ')
    // Normaliser les sauts de ligne
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Supprimer les espaces en début et fin
    .trim()
}
