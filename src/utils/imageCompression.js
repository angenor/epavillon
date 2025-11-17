/**
 * Utilitaire pour compresser les images avant l'upload
 * Cible : Réduire la taille à moins de 1 Mo tout en préservant la qualité
 */

const MAX_SIZE_BYTES = 1 * 1024 * 1024 // 1 Mo en bytes
const MAX_WIDTH = 1920 // Largeur maximale
const MAX_HEIGHT = 1080 // Hauteur maximale

/**
 * Compresse une image pour qu'elle ne dépasse pas 1 Mo
 * @param {File} file - Fichier image à compresser
 * @param {Function} onProgress - Callback pour suivre la progression (optionnel)
 * @returns {Promise<Blob>} - Image compressée
 */
export async function compressImage(file, onProgress = null) {
  // Si l'image fait déjà moins de 1 Mo, on la retourne directement
  if (file.size <= MAX_SIZE_BYTES) {
    if (onProgress) onProgress(100)
    console.log(`Image originale (${Math.round(file.size / 1024)}KB) déjà sous la limite`)
    return file
  }

  if (onProgress) onProgress(10)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = async () => {
        if (onProgress) onProgress(30)

        try {
          // Calculer les nouvelles dimensions en préservant le ratio
          let { width, height } = calculateDimensions(img.width, img.height)

          if (onProgress) onProgress(50)

          // Créer le canvas
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          if (onProgress) onProgress(70)

          // Compression progressive jusqu'à atteindre la taille cible
          const compressedBlob = await compressToTarget(canvas, file.type)

          if (onProgress) onProgress(100)

          console.log(`Image compressée de ${Math.round(file.size / 1024)}KB à ${Math.round(compressedBlob.size / 1024)}KB`)
          resolve(compressedBlob)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l\'image'))
      }

      img.src = e.target.result
    }

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Calcule les nouvelles dimensions en préservant le ratio
 * @param {number} width - Largeur originale
 * @param {number} height - Hauteur originale
 * @returns {{width: number, height: number}} - Nouvelles dimensions
 */
function calculateDimensions(width, height) {
  let newWidth = width
  let newHeight = height

  // Réduire si trop grand
  if (width > MAX_WIDTH) {
    newWidth = MAX_WIDTH
    newHeight = (height * MAX_WIDTH) / width
  }

  if (newHeight > MAX_HEIGHT) {
    newHeight = MAX_HEIGHT
    newWidth = (width * MAX_HEIGHT) / height
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  }
}

/**
 * Compresse progressivement le canvas jusqu'à atteindre la taille cible
 * @param {HTMLCanvasElement} canvas - Canvas contenant l'image
 * @param {string} mimeType - Type MIME de l'image
 * @returns {Promise<Blob>} - Blob compressé
 */
async function compressToTarget(canvas, mimeType) {
  // Forcer le format JPEG pour une meilleure compression
  const targetMimeType = 'image/jpeg'

  // Qualités à tester (de la meilleure à la plus faible)
  const qualities = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]

  for (const quality of qualities) {
    const blob = await canvasToBlob(canvas, targetMimeType, quality)

    if (blob.size <= MAX_SIZE_BYTES) {
      return blob
    }
  }

  // Si même avec qualité 0.3 c'est trop gros, réduire encore les dimensions
  const reducedCanvas = reduceCanvasSize(canvas, 0.8) // Réduire de 20%
  return compressToTarget(reducedCanvas, targetMimeType)
}

/**
 * Convertit un canvas en Blob
 * @param {HTMLCanvasElement} canvas - Canvas à convertir
 * @param {string} mimeType - Type MIME
 * @param {number} quality - Qualité de compression (0-1)
 * @returns {Promise<Blob>} - Blob résultant
 */
function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Échec de la conversion en blob'))
        }
      },
      mimeType,
      quality
    )
  })
}

/**
 * Réduit la taille d'un canvas d'un facteur donné
 * @param {HTMLCanvasElement} canvas - Canvas original
 * @param {number} factor - Facteur de réduction (ex: 0.8 = réduire de 20%)
 * @returns {HTMLCanvasElement} - Nouveau canvas réduit
 */
function reduceCanvasSize(canvas, factor) {
  const newCanvas = document.createElement('canvas')
  newCanvas.width = Math.round(canvas.width * factor)
  newCanvas.height = Math.round(canvas.height * factor)

  const ctx = newCanvas.getContext('2d')
  ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height)

  return newCanvas
}

/**
 * Valide qu'un fichier est une image
 * @param {File} file - Fichier à valider
 * @returns {boolean} - true si c'est une image
 */
export function isImageFile(file) {
  return file && file.type.startsWith('image/')
}

/**
 * Formate la taille d'un fichier en texte lisible
 * @param {number} bytes - Taille en bytes
 * @returns {string} - Taille formatée (ex: "1.5 Mo")
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} octets`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} Mo`
}
