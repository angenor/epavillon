import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import { generateVideoThumbnail, generateAndSaveThumbnail } from '@/utils/videoThumbnail'

export function useVideoThumbnails() {
  const { supabase } = useSupabase()
  const loading = ref(false)
  const error = ref(null)
  
  /**
   * Génère une miniature pour une vidéo localement (sans sauvegarder)
   */
  const generateThumbnail = async (videoUrl, maxWidth = 320, seekTime = 3) => {
    try {
      loading.value = true
      error.value = null
      
      const thumbnail = await generateVideoThumbnail(videoUrl, maxWidth, seekTime)
      return thumbnail
    } catch (err) {
      console.error('Erreur génération miniature:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Génère et sauvegarde une miniature dans Supabase
   */
  const generateAndSave = async (videoUrl, videoId) => {
    try {
      loading.value = true
      error.value = null
      
      const thumbnailUrl = await generateAndSaveThumbnail(supabase, videoUrl, videoId)
      return thumbnailUrl
    } catch (err) {
      console.error('Erreur génération/sauvegarde miniature:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Génère des miniatures pour une liste de vidéos
   */
  const generateThumbnailsForVideos = async (videos, saveToDb = false) => {
    const videosWithThumbnails = await Promise.all(
      videos.map(async (video) => {
        // Si la vidéo a déjà une miniature, la garder
        if (video.thumbnail_url) {
          return video
        }
        
        try {
          if (saveToDb && video.id) {
            // Générer et sauvegarder dans Supabase
            const thumbnailUrl = await generateAndSave(video.video_url, video.id)
            return {
              ...video,
              thumbnail_url: thumbnailUrl
            }
          } else {
            // Générer uniquement localement
            const thumbnail = await generateThumbnail(video.video_url)
            return {
              ...video,
              thumbnail_url: thumbnail
            }
          }
        } catch (error) {
          console.warn(`Impossible de générer la miniature pour ${video.id}:`, error)
          return video
        }
      })
    )
    
    return videosWithThumbnails
  }
  
  /**
   * Met à jour la miniature d'une vidéo dans la base de données
   */
  const updateVideoThumbnail = async (videoId, thumbnailUrl) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('video_testimonials')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', videoId)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      return data
    } catch (err) {
      console.error('Erreur mise à jour miniature:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading,
    error,
    generateThumbnail,
    generateAndSave,
    generateThumbnailsForVideos,
    updateVideoThumbnail
  }
}