/**
 * Utilitaire SERVEUR pour traiter les documents (extraction de texte depuis PDF/DOCX)
 * Ce fichier doit être exécuté côté serveur (Supabase Edge Functions, Node.js, etc.)
 *
 * IMPORTANT: Ne pas importer ce fichier dans le code client - il utilise des dépendances Node.js
 * qui ne fonctionnent pas dans le navigateur (pdf-parse, mammoth)
 */

import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

/**
 * Télécharge un fichier depuis une URL
 * @param {string} fileUrl - URL du fichier
 * @returns {Promise<ArrayBuffer>} Buffer du fichier
 */
async function downloadFile(fileUrl) {
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }
    return await response.arrayBuffer()
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

/**
 * Extrait le texte d'un fichier PDF
 * @param {string} fileUrl - URL du fichier PDF
 * @returns {Promise<{text: string, pages: number, metadata: object}>}
 */
export async function extractTextFromPDF(fileUrl) {
  try {
    const arrayBuffer = await downloadFile(fileUrl)
    const buffer = Buffer.from(arrayBuffer)

    const data = await pdfParse(buffer)

    return {
      text: data.text,
      pages: data.numpages,
      metadata: {
        info: data.info,
        version: data.version,
        pages: data.numpages
      }
    }
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error(`Failed to extract text from PDF: ${error.message}`)
  }
}

/**
 * Extrait le texte d'un fichier DOCX
 * @param {string} fileUrl - URL du fichier DOCX
 * @returns {Promise<{text: string, metadata: object}>}
 */
export async function extractTextFromDOCX(fileUrl) {
  try {
    const arrayBuffer = await downloadFile(fileUrl)
    const buffer = Buffer.from(arrayBuffer)

    const result = await mammoth.extractRawText({ buffer })

    return {
      text: result.value,
      metadata: {
        messages: result.messages
      }
    }
  } catch (error) {
    console.error('Error extracting text from DOCX:', error)
    throw new Error(`Failed to extract text from DOCX: ${error.message}`)
  }
}

/**
 * Extrait le texte d'un document (détecte automatiquement le format)
 * @param {string} fileUrl - URL du fichier
 * @param {string} fileType - Type MIME du fichier
 * @returns {Promise<{text: string, metadata: object}>}
 */
export async function extractTextFromDocument(fileUrl, fileType) {
  try {
    if (fileType.includes('pdf') || fileUrl.toLowerCase().endsWith('.pdf')) {
      return await extractTextFromPDF(fileUrl)
    } else if (
      fileType.includes('wordprocessingml') ||
      fileType.includes('msword') ||
      fileUrl.toLowerCase().endsWith('.docx') ||
      fileUrl.toLowerCase().endsWith('.doc')
    ) {
      return await extractTextFromDOCX(fileUrl)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }
  } catch (error) {
    console.error('Error extracting text from document:', error)
    throw error
  }
}

/**
 * Extrait les métadonnées d'un document
 * @param {string} fileUrl - URL du fichier
 * @param {string} fileType - Type MIME du fichier
 * @returns {Promise<object>} Métadonnées du document
 */
export async function extractMetadata(fileUrl, fileType) {
  try {
    const result = await extractTextFromDocument(fileUrl, fileType)
    return result.metadata || {}
  } catch (error) {
    console.error('Error extracting metadata:', error)
    return {}
  }
}
