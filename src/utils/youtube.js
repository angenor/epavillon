/**
 * Utilitaires pour la gestion des vidéos YouTube
 */

/**
 * Extraire l'ID d'une vidéo YouTube depuis différents formats d'URL
 * @param {string} url - URL YouTube
 * @returns {string|null} - ID de la vidéo ou null si invalide
 */
export function extractYoutubeVideoId(url) {
  if (!url) return null

  // Si c'est déjà un ID (pas d'URL)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url
  }

  // Patterns d'URL YouTube supportés
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * Générer l'URL d'embed YouTube
 * @param {string} videoId - ID de la vidéo
 * @param {Object} options - Options d'embed
 * @returns {string} - URL d'embed
 */
export function getYoutubeEmbedUrl(videoId, options = {}) {
  const {
    autoplay = 0,
    mute = 0,
    controls = 1,
    modestbranding = 1
  } = options

  const params = new URLSearchParams({
    autoplay: autoplay.toString(),
    mute: mute.toString(),
    controls: controls.toString(),
    modestbranding: modestbranding.toString()
  })

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

/**
 * Générer l'URL de la miniature YouTube
 * @param {string} videoId - ID de la vidéo
 * @param {string} quality - Qualité (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns {string} - URL de la miniature
 */
export function getYoutubeThumbnailUrl(videoId, quality = 'maxresdefault') {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

/**
 * Générer l'URL de visionnage YouTube
 * @param {string} videoId - ID de la vidéo
 * @returns {string} - URL de visionnage
 */
export function getYoutubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/**
 * Récupérer l'ID du direct YouTube en cours sur la chaîne IFDD
 * Cette fonction appelle une edge function Supabase pour contourner les restrictions CORS
 * @returns {Promise<{success: boolean, videoId?: string, error?: string}>}
 */
export async function fetchCurrentLiveStreamId() {
  try {
    // Appel à l'edge function Supabase
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-youtube-live-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        channelHandle: '@ifddoif'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la récupération du direct')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur fetchCurrentLiveStreamId:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Valider un ID de vidéo YouTube
 * @param {string} videoId - ID à valider
 * @returns {boolean}
 */
export function isValidYoutubeVideoId(videoId) {
  if (!videoId) return false
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId)
}
