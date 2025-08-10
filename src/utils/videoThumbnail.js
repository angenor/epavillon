/**
 * Utilitaires pour la gestion des miniatures vidéo
 */

/**
 * Capture une miniature depuis une vidéo HTML5
 * @param {string} videoUrl - URL de la vidéo
 * @param {number} seekTime - Temps en secondes où capturer la miniature (par défaut 1s)
 * @returns {Promise<string>} - Data URL de l'image capturée
 */
export async function captureVideoThumbnail(videoUrl, seekTime = 1) {
  return new Promise((resolve, reject) => {
    // Créer un élément vidéo temporaire
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous' // Important pour les vidéos cross-origin
    video.muted = true
    video.preload = 'metadata'
    
    // Créer un canvas pour capturer l'image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Quand les métadonnées sont chargées
    video.onloadedmetadata = () => {
      // Définir le temps de capture
      video.currentTime = Math.min(seekTime, video.duration)
    }
    
    // Quand la frame est prête
    video.onseeked = () => {
      try {
        // Définir les dimensions du canvas
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Dessiner la frame actuelle sur le canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convertir en data URL (format JPEG avec qualité 0.8)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        
        // Nettoyer
        video.remove()
        canvas.remove()
        
        resolve(dataUrl)
      } catch (error) {
        reject(new Error(`Erreur lors de la capture: ${error.message}`))
      }
    }
    
    // Gestion des erreurs
    video.onerror = () => {
      video.remove()
      canvas.remove()
      reject(new Error('Impossible de charger la vidéo'))
    }
    
    // Définir la source et charger
    video.src = videoUrl
    video.load()
  })
}

/**
 * Génère une miniature en base64 plus petite pour le stockage
 * @param {string} videoUrl - URL de la vidéo
 * @param {number} maxWidth - Largeur maximale de la miniature (par défaut 320px)
 * @param {number} seekTime - Temps en secondes où capturer
 * @returns {Promise<string>} - Data URL de la miniature redimensionnée
 */
export async function generateVideoThumbnail(videoUrl, maxWidth = 320, seekTime = 1) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.preload = 'metadata'
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(seekTime, video.duration)
    }
    
    video.onseeked = () => {
      try {
        // Calculer les dimensions en gardant le ratio
        const aspectRatio = video.videoHeight / video.videoWidth
        const width = Math.min(maxWidth, video.videoWidth)
        const height = width * aspectRatio
        
        canvas.width = width
        canvas.height = height
        
        // Dessiner la vidéo redimensionnée
        ctx.drawImage(video, 0, 0, width, height)
        
        // Convertir en base64 avec compression
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
        
        // Nettoyer
        video.remove()
        canvas.remove()
        
        resolve(dataUrl)
      } catch (error) {
        reject(new Error(`Erreur lors de la génération: ${error.message}`))
      }
    }
    
    video.onerror = () => {
      video.remove()
      canvas.remove()
      reject(new Error('Impossible de charger la vidéo'))
    }
    
    video.src = videoUrl
    video.load()
  })
}

/**
 * Convertit une data URL en Blob pour l'upload
 * @param {string} dataUrl - Data URL de l'image
 * @returns {Blob} - Blob de l'image
 */
export function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while(n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

/**
 * Upload une miniature vers Supabase Storage
 * @param {Object} supabase - Instance Supabase
 * @param {string} dataUrl - Data URL de la miniature
 * @param {string} fileName - Nom du fichier
 * @returns {Promise<string>} - URL publique de la miniature
 */
export async function uploadThumbnailToSupabase(supabase, dataUrl, fileName) {
  try {
    const blob = dataUrlToBlob(dataUrl)
    const file = new File([blob], fileName, { type: 'image/jpeg' })
    
    const { data, error } = await supabase.storage
      .from('video-thumbnails')
      .upload(`thumbnails/${fileName}`, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    
    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('video-thumbnails')
      .getPublicUrl(data.path)
    
    return publicUrl
  } catch (error) {
    console.error('Erreur upload thumbnail:', error)
    throw error
  }
}

/**
 * Génère et sauvegarde une miniature pour une vidéo
 * @param {Object} supabase - Instance Supabase
 * @param {string} videoUrl - URL de la vidéo
 * @param {string} videoId - ID de la vidéo pour le nommage
 * @returns {Promise<string|null>} - URL de la miniature ou null si échec
 */
export async function generateAndSaveThumbnail(supabase, videoUrl, videoId) {
  try {
    // Générer la miniature
    const thumbnail = await generateVideoThumbnail(videoUrl, 480, 2)
    
    // Upload vers Supabase
    const fileName = `${videoId}-${Date.now()}.jpg`
    const thumbnailUrl = await uploadThumbnailToSupabase(supabase, thumbnail, fileName)
    
    // Mettre à jour la base de données
    const { error } = await supabase
      .from('video_testimonials')
      .update({ thumbnail_url: thumbnailUrl })
      .eq('id', videoId)
    
    if (error) throw error
    
    return thumbnailUrl
  } catch (error) {
    console.error('Erreur génération/sauvegarde thumbnail:', error)
    return null
  }
}