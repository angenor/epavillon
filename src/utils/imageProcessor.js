/**
 * Utilitaire pour le traitement des images côté client
 * - Compression
 * - Redimensionnement
 * - Validation de taille
 */

/**
 * Compresse et redimensionne une image
 * @param {File} file - Le fichier image à traiter
 * @param {Object} options - Options de traitement
 * @param {number} options.maxWidth - Largeur maximale
 * @param {number} options.maxHeight - Hauteur maximale
 * @param {number} options.quality - Qualité de compression (0-1)
 * @param {number} options.maxSizeKB - Taille maximale en KB
 * @returns {Promise<{file: File, dataUrl: string}>}
 */
export async function processImage(file, options = {}) {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85,
    maxSizeKB = 500
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        )

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Compression itérative pour respecter la taille maximale
        compressToSize(canvas, file.type, quality, maxSizeKB * 1024)
          .then(result => resolve(result))
          .catch(reject)
      }

      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'))
      img.src = e.target.result
    }

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
    reader.readAsDataURL(file)
  })
}

/**
 * Génère une vignette de l'image
 * @param {File} file - Le fichier image source
 * @param {number} size - Taille de la vignette (largeur et hauteur)
 * @returns {Promise<{file: File, dataUrl: string}>}
 */
export async function generateThumbnail(file, size = 150) {
  return processImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    maxSizeKB: 50
  })
}

/**
 * Calcule les dimensions en conservant le ratio
 */
function calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight }
  }

  const aspectRatio = originalWidth / originalHeight

  let width = maxWidth
  let height = width / aspectRatio

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return { width: Math.round(width), height: Math.round(height) }
}

/**
 * Compresse une image jusqu'à atteindre la taille cible
 */
async function compressToSize(canvas, mimeType, initialQuality, maxSizeBytes) {
  let quality = initialQuality
  let blob = null
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    blob = await new Promise(resolve => {
      canvas.toBlob(resolve, mimeType, quality)
    })

    if (blob.size <= maxSizeBytes || quality <= 0.1) {
      break
    }

    // Réduire la qualité de façon progressive
    quality *= 0.9
    attempts++
  }

  // Si toujours trop gros, réduire les dimensions
  if (blob.size > maxSizeBytes && attempts >= maxAttempts) {
    const scale = Math.sqrt(maxSizeBytes / blob.size)
    const newCanvas = document.createElement('canvas')
    newCanvas.width = Math.floor(canvas.width * scale)
    newCanvas.height = Math.floor(canvas.height * scale)
    
    const ctx = newCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height)
    
    blob = await new Promise(resolve => {
      newCanvas.toBlob(resolve, mimeType, quality)
    })
  }

  const file = new File([blob], 'image.jpg', { type: blob.type })
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })

  return { file, dataUrl }
}

/**
 * Génère les deux versions d'une photo d'intervenant (haute qualité et miniature)
 * @param {File} file - Le fichier image source
 * @returns {Promise<{highQuality: {file: File, dataUrl: string}, thumbnail: {file: File, dataUrl: string}}>}
 */
export async function processSpeakerPhoto(file) {
  try {
    // Générer la version haute qualité
    const highQuality = await processImage(file, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.9,
      maxSizeKB: 800
    })

    // Générer la miniature
    const thumbnail = await generateThumbnail(file, 150)

    return {
      highQuality,
      thumbnail
    }
  } catch (error) {
    throw new Error(`Erreur lors du traitement de la photo: ${error.message}`)
  }
}

/**
 * Génère les deux versions d'une bannière d'activité (haute et basse qualité)
 * @param {File} file - Le fichier image source
 * @returns {Promise<{highQuality: {file: File, dataUrl: string}, lowQuality: {file: File, dataUrl: string}}>}
 */
export async function processBannerImage(file) {
  try {
    // Vérifier d'abord la taille du fichier original
    const originalSizeKB = file.size / 1024

    let highQuality

    if (originalSizeKB <= 160) {
      // Si l'image fait déjà moins de 160KB, la garder telle quelle pour la haute qualité
      const reader = new FileReader()
      const dataUrl = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })

      highQuality = {
        file: file,
        dataUrl: dataUrl
      }
    } else {
      // Si l'image fait plus de 160KB, la compresser à 160KB max
      highQuality = await processImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
        maxSizeKB: 160
      })
    }

    // Générer la version basse qualité (entre 20KB et 30KB)
    // On vise 25KB comme cible optimale
    const lowQuality = await processImage(file, {
      maxWidth: 640,
      maxHeight: 360,
      quality: 0.7,
      maxSizeKB: 30
    })

    // Vérifier que la version basse qualité respecte la taille minimale
    if (lowQuality.file.size < 20 * 1024) {
      // Si trop petite, augmenter légèrement la qualité
      const adjustedLowQuality = await processImage(file, {
        maxWidth: 720,
        maxHeight: 405,
        quality: 0.75,
        maxSizeKB: 30
      })

      // Si toujours trop petite, accepter la version précédente
      if (adjustedLowQuality.file.size >= 20 * 1024) {
        return {
          highQuality,
          lowQuality: adjustedLowQuality
        }
      }
    }

    return {
      highQuality,
      lowQuality
    }
  } catch (error) {
    throw new Error(`Erreur lors du traitement de la bannière: ${error.message}`)
  }
}

/**
 * Valide un fichier image
 */
export function validateImageFile(file) {
  const errors = []

  // Vérifier le type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    errors.push('Format non supporté. Utilisez JPG, PNG ou WebP.')
  }

  // Vérifier la taille (5MB max pour le fichier original)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    errors.push('Le fichier est trop volumineux (max 5MB).')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}