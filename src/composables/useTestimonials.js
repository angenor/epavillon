import { ref } from 'vue'
import { useSupabase } from './useSupabase'

export function useTestimonials() {
  const { supabase } = useSupabase()
  const loading = ref(false)
  const error = ref(null)

  // Fonction helper pour récupérer l'organisation d'un utilisateur
  const fetchUserOrganization = async (organizationId) => {
    if (!organizationId) return null
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single()
      
      if (error) return null
      return data
    } catch (err) {
      return null
    }
  }

  // Récupérer tous les témoignages avec les informations utilisateur
  const fetchTestimonials = async (filter = 'all') => {
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
        .order('created_at', { ascending: false })

      // Appliquer les filtres
      if (filter === 'featured') {
        query = query.eq('featured', true)
      } else if (filter && filter !== 'all') {
        query = query.eq('context_type', filter)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      
      // Enrichir avec les données d'organisation
      if (data && data.length > 0) {
        for (let testimonial of data) {
          if (testimonial.user?.organization_id) {
            testimonial.user.organization = await fetchUserOrganization(testimonial.user.organization_id)
          }
        }
      }
      
      return data || []
    } catch (err) {
      console.error('Error fetching testimonials:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Récupérer les témoignages vidéo
  const fetchVideoTestimonials = async (isApproved = true) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('Fetching video testimonials, isApproved:', isApproved)
      
      // Simplifier la requête pour éviter les erreurs de jointure
      let query = supabase
        .from('video_testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      if (isApproved !== null) {
        query = query.eq('is_approved', isApproved)
      }

      const { data, error: fetchError } = await query
      
      console.log('Video testimonials query result:', { data, error: fetchError })

      if (fetchError) throw fetchError
      
      // Enrichir avec les données utilisateur et organisation
      if (data && data.length > 0) {
        for (let video of data) {
          // Récupérer les infos utilisateur
          if (video.user_id) {
            const { data: userData } = await supabase
              .from('users')
              .select('id, first_name, last_name, profile_photo_url, organization_id')
              .eq('id', video.user_id)
              .single()
            
            if (userData) {
              video.user = userData
              // Récupérer l'organisation si elle existe
              if (userData.organization_id) {
                video.user.organization = await fetchUserOrganization(userData.organization_id)
              }
            }
          }
        }
      }
      
      return data || []
    } catch (err) {
      console.error('Error fetching video testimonials:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Récupérer les innovations et pratiques pour les témoignages
  const fetchInnovationsPractices = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('innovations_practices')
        .select(`
          id,
          title,
          category,
          cover_image_hd_16_9_url,
          application_sector,
          view_count,
          organization_id,
          submitted_by,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      // Enrichir avec les données d'organisation et d'utilisateur
      if (data && data.length > 0) {
        for (let item of data) {
          // Récupérer l'organisation
          if (item.organization_id) {
            const { data: orgData } = await supabase
              .from('organizations')
              .select('name, country_id')
              .eq('id', item.organization_id)
              .single()
            
            if (orgData) {
              item.organization = orgData
              // Récupérer le pays
              if (orgData.country_id) {
                const { data: countryData } = await supabase
                  .from('countries')
                  .select('name_fr')
                  .eq('id', orgData.country_id)
                  .single()
                
                if (countryData) {
                  item.organization.country = countryData
                }
              }
            }
          }
          
          // Récupérer les infos de l'utilisateur qui a soumis
          if (item.submitted_by) {
            const { data: userData } = await supabase
              .from('users')
              .select('first_name, last_name, profile_photo_url')
              .eq('id', item.submitted_by)
              .single()
            
            if (userData) {
              item.submitted_by = userData
            }
          }
        }
      }
      
      return data || []
    } catch (err) {
      console.error('Error fetching innovations/practices:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Récupérer les formations pour les témoignages
  const fetchTrainings = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('trainings')
        .select(`
          id,
          title,
          category,
          start_date,
          end_date
        `)
        .order('start_date', { ascending: false })

      if (fetchError) throw fetchError
      
      return data || []
    } catch (err) {
      console.error('Error fetching trainings:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Combiner tous les posts pour le feed communautaire
  const fetchCommunityFeed = async (filter = 'all', page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    
    try {
      const allPosts = []
      const offset = (page - 1) * limit

      // Récupérer les témoignages textuels
      if (filter === 'all' || filter === 'testimonials') {
        const testimonials = await fetchTestimonials(filter === 'testimonials' ? 'all' : filter)
        
        // Enrichir avec les données de contexte si nécessaire
        for (const testimonial of testimonials) {
          const enrichedTestimonial = {
            ...testimonial,
            type: 'testimonial'
          }

          // Si le témoignage est lié à une innovation/pratique
          if (testimonial.context_type === 'innovation_practice' && testimonial.context_id) {
            const { data: innovationData } = await supabase
              .from('innovations_practices')
              .select('title, category, cover_image_hd_16_9_url')
              .eq('id', testimonial.context_id)
              .single()
            
            if (innovationData) {
              enrichedTestimonial.innovation_practice = innovationData
            }
          }

          // Si le témoignage est lié à une formation
          if (testimonial.context_type === 'training' && testimonial.context_id) {
            const { data: trainingData } = await supabase
              .from('trainings')
              .select('title, category')
              .eq('id', testimonial.context_id)
              .single()
            
            if (trainingData) {
              enrichedTestimonial.training = trainingData
            }
          }

          allPosts.push(enrichedTestimonial)
        }
      }

      // Récupérer les témoignages vidéo
      if (filter === 'all' || filter === 'videos') {
        console.log('Fetching videos for community feed')
        const videos = await fetchVideoTestimonials(null) // null pour voir toutes les vidéos
        console.log('Videos fetched for feed:', videos)
        
        if (videos && videos.length > 0) {
          videos.forEach(video => {
            allPosts.push({
              ...video,
              type: 'video_testimonial'
            })
          })
        } else {
          console.log('No videos found in database')
        }
      }

      // Récupérer les innovations et pratiques
      if (filter === 'all' || filter === 'innovation' || filter === 'practice') {
        const innovationsPractices = await fetchInnovationsPractices()
        
        innovationsPractices.forEach(item => {
          if (filter === 'all' || 
              (filter === 'innovation' && item.category === 'innovation') ||
              (filter === 'practice' && item.category === 'best_practice')) {
            
            // Créer une description à partir du titre si elle n'existe pas
            allPosts.push({
              ...item,
              description: item.title, // Utiliser le titre comme description temporaire
              type: item.category === 'innovation' ? 'innovation' : 'practice'
            })
          }
        })
      }

      // Trier par date de création
      allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      // Pagination
      const paginatedPosts = allPosts.slice(offset, offset + limit)
      const hasMore = allPosts.length > offset + limit

      return {
        posts: paginatedPosts,
        total: allPosts.length,
        hasMore
      }
    } catch (err) {
      console.error('Error fetching community feed:', err)
      error.value = err.message
      return {
        posts: [],
        total: 0,
        hasMore: false
      }
    } finally {
      loading.value = false
    }
  }

  // Créer un témoignage
  const createTestimonial = async (testimonialData) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: createError } = await supabase
        .from('user_testimonials')
        .insert(testimonialData)
        .select()
        .single()

      if (createError) throw createError
      
      return data
    } catch (err) {
      console.error('Error creating testimonial:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  // Créer un témoignage vidéo
  const createVideoTestimonial = async (videoData) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: createError } = await supabase
        .from('video_testimonials')
        .insert(videoData)
        .select()
        .single()

      if (createError) throw createError
      
      return data
    } catch (err) {
      console.error('Error creating video testimonial:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchTestimonials,
    fetchVideoTestimonials,
    fetchInnovationsPractices,
    fetchTrainings,
    fetchCommunityFeed,
    createTestimonial,
    createVideoTestimonial
  }
}