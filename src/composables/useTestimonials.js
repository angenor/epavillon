import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function useTestimonials() {
  const loading = ref(false)
  const error = ref(null)
  const userTestimonials = ref([])
  const videoTestimonials = ref([])
  const filter = ref('all') // 'all', 'innovation', 'practice'

  // Fetch user testimonials for innovations/practices
  const fetchUserTestimonials = async (options = {}) => {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase
        .from('user_testimonials')
        .select(`
          *,
          user:users!user_id (
            id,
            first_name,
            last_name,
            profile_photo_url,
            organization_id
          )
        `)
        .eq('context_type', 'innovation, practice')
        
      // Apply filters
      if (options.featured) {
        query = query.eq('featured', true)
      }
      
      if (options.contextId) {
        query = query.eq('context_id', options.contextId)
      }
      
      // Order by creation date
      query = query.order('created_at', { ascending: false })
      
      // Limit if specified
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      // Fetch organization details separately
      const testimonialsWithOrgs = await Promise.all(
        data.map(async (testimonial) => {
          if (testimonial.user?.organization_id) {
            const { data: orgData } = await supabase
              .from('organizations')
              .select('name')
              .eq('id', testimonial.user.organization_id)
              .single()
            
            return {
              ...testimonial,
              user: {
                ...testimonial.user,
                organization: orgData
              }
            }
          }
          return testimonial
        })
      )
      
      // Fetch innovation/practice details
      const testimonialsWithContext = await Promise.all(
        testimonialsWithOrgs.map(async (testimonial) => {
          if (testimonial.context_id) {
            const { data: contextData } = await supabase
              .from('innovations_practices')
              .select('title, category')
              .eq('id', testimonial.context_id)
              .single()
            
            return {
              ...testimonial,
              innovation_practice: contextData
            }
          }
          return testimonial
        })
      )
      
      userTestimonials.value = testimonialsWithContext
      return testimonialsWithContext
    } catch (err) {
      console.error('Error fetching user testimonials:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch video testimonials for innovations/practices
  const fetchVideoTestimonials = async (options = {}) => {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase
        .from('video_testimonials')
        .select(`
          *,
          user:users!user_id (
            id,
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .eq('context_type', 'innovation, practice')
        .eq('is_approved', true)
        
      // Apply filters
      if (options.featured) {
        query = query.eq('featured', true)
      }
      
      if (options.contextId) {
        query = query.eq('context_id', options.contextId)
      }
      
      // Order by creation date
      query = query.order('created_at', { ascending: false })
      
      // Limit if specified
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      videoTestimonials.value = data || []
      return data || []
    } catch (err) {
      console.error('Error fetching video testimonials:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Create a new user testimonial
  const createTestimonial = async (testimonialData) => {
    loading.value = true
    error.value = null
    
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error('User not authenticated')
      
      const { data, error: insertError } = await supabase
        .from('user_testimonials')
        .insert({
          user_id: userData.user.id,
          testimonial_text: testimonialData.text,
          context_type: 'innovation, practice',
          context_id: testimonialData.contextId,
          photo_url: testimonialData.photoUrl || null,
          background_color: testimonialData.backgroundColor || '#10B981',
          featured: false
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      return data
    } catch (err) {
      console.error('Error creating testimonial:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Upload video testimonial
  const uploadVideoTestimonial = async (videoFile, contextId) => {
    loading.value = true
    error.value = null
    
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error('User not authenticated')
      
      // Check video duration (must be <= 10 seconds)
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      const checkDuration = new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          if (video.duration > 10) {
            reject(new Error('Video must be 10 seconds or less'))
          } else {
            resolve(video.duration)
          }
        }
        video.onerror = () => reject(new Error('Invalid video file'))
      })
      
      video.src = URL.createObjectURL(videoFile)
      const duration = await checkDuration
      
      // Upload video to Supabase Storage
      const fileName = `${userData.user.id}_${Date.now()}.${videoFile.name.split('.').pop()}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('video-testimonials')
        .upload(fileName, videoFile)
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('video-testimonials')
        .getPublicUrl(fileName)
      
      // Create testimonial record
      const { data, error: insertError } = await supabase
        .from('video_testimonials')
        .insert({
          user_id: userData.user.id,
          context_type: 'innovation, practice',
          context_id: contextId,
          video_url: publicUrl,
          duration_seconds: Math.floor(duration),
          featured: false,
          is_approved: false // Requires admin approval
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      return data
    } catch (err) {
      console.error('Error uploading video testimonial:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Toggle featured status (admin only)
  const toggleFeatured = async (testimonialId, type = 'user') => {
    loading.value = true
    error.value = null
    
    try {
      const table = type === 'user' ? 'user_testimonials' : 'video_testimonials'
      
      // Get current featured status
      const { data: currentData, error: fetchError } = await supabase
        .from(table)
        .select('featured')
        .eq('id', testimonialId)
        .single()
      
      if (fetchError) throw fetchError
      
      // Update featured status
      const { data, error: updateError } = await supabase
        .from(table)
        .update({ featured: !currentData.featured })
        .eq('id', testimonialId)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      return data
    } catch (err) {
      console.error('Error toggling featured status:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Filtered testimonials
  const filteredUserTestimonials = computed(() => {
    if (filter.value === 'all') {
      return userTestimonials.value
    }
    
    return userTestimonials.value.filter(t => {
      if (!t.innovation_practice) return false
      if (filter.value === 'innovation') {
        return t.innovation_practice.category === 'innovation'
      }
      if (filter.value === 'practice') {
        return t.innovation_practice.category === 'best_practice'
      }
      return true
    })
  })

  const filteredVideoTestimonials = computed(() => {
    // Video testimonials don't have category filter in this implementation
    // Could be extended if needed
    return videoTestimonials.value
  })

  // Statistics
  const statistics = computed(() => {
    return {
      totalTestimonials: userTestimonials.value.length + videoTestimonials.value.length,
      textTestimonials: userTestimonials.value.length,
      videoTestimonials: videoTestimonials.value.length,
      featuredCount: [
        ...userTestimonials.value.filter(t => t.featured),
        ...videoTestimonials.value.filter(t => t.featured)
      ].length
    }
  })

  return {
    loading,
    error,
    userTestimonials,
    videoTestimonials,
    filter,
    filteredUserTestimonials,
    filteredVideoTestimonials,
    statistics,
    fetchUserTestimonials,
    fetchVideoTestimonials,
    createTestimonial,
    uploadVideoTestimonial,
    toggleFeatured
  }
}