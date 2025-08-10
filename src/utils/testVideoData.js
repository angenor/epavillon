// Script temporaire pour tester les témoignages vidéo
import { useSupabase } from '@/composables/useSupabase'

export async function checkVideoTestimonials() {
  const { supabase } = useSupabase()
  
  try {
    // 1. Vérifier combien de vidéos il y a dans la table
    const { data: videos, error: countError, count } = await supabase
      .from('video_testimonials')
      .select('*', { count: 'exact' })
    
    console.log('=== VIDEO TESTIMONIALS CHECK ===')
    console.log('Total videos in database:', count)
    console.log('Videos data:', videos)
    
    if (countError) {
      console.error('Error fetching videos:', countError)
      return
    }
    
    // 2. Si aucune vidéo, en créer une de test (optionnel)
    if (!videos || videos.length === 0) {
      console.log('No videos found. You may want to create test data.')
      
      // Pour créer une vidéo de test, décommentez ce code:
      /*
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const testVideo = {
          video_url: '/videos/video_couverture.mp4', // URL de test
          duration_seconds: 30,
          featured: false,
          context_type: 'event',
          context_id: null,
          is_approved: true, // Approuvée pour qu'elle apparaisse
          user_id: user.id
        }
        
        const { data: newVideo, error: createError } = await supabase
          .from('video_testimonials')
          .insert(testVideo)
          .select()
          .single()
        
        if (createError) {
          console.error('Error creating test video:', createError)
        } else {
          console.log('Test video created:', newVideo)
        }
      }
      */
    }
    
    // 3. Vérifier les vidéos approuvées
    const { data: approvedVideos, count: approvedCount } = await supabase
      .from('video_testimonials')
      .select('*', { count: 'exact' })
      .eq('is_approved', true)
    
    console.log('Approved videos:', approvedCount)
    console.log('Approved videos data:', approvedVideos)
    
    return videos
  } catch (err) {
    console.error('Error in checkVideoTestimonials:', err)
  }
}

// Fonction pour créer une vidéo de test
export async function createTestVideoTestimonial() {
  const { supabase } = useSupabase()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated')
      return
    }
    
    const testVideo = {
      video_url: '/videos/video_couverture.mp4', // Utilise une vidéo existante
      duration_seconds: 8,
      featured: false,
      context_type: 'event',
      context_id: null,
      is_approved: true, // Approuvée directement pour les tests
      user_id: user.id
    }
    
    const { data: newVideo, error: createError } = await supabase
      .from('video_testimonials')
      .insert(testVideo)
      .select()
      .single()
    
    if (createError) {
      console.error('Error creating test video:', createError)
      return null
    }
    
    console.log('Test video created successfully:', newVideo)
    return newVideo
  } catch (err) {
    console.error('Error in createTestVideoTestimonial:', err)
    return null
  }
}