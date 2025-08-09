import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTestimonials } from '@/composables/useTestimonials'

export const useTestimonialsStore = defineStore('testimonials', () => {
  const {
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
  } = useTestimonials()

  // Additional store-specific state
  const currentPage = ref(1)
  const itemsPerPage = ref(9)
  const selectedCategory = ref('all')

  // Load all testimonials
  const loadTestimonials = async () => {
    await Promise.all([
      fetchUserTestimonials(),
      fetchVideoTestimonials()
    ])
  }

  // Load featured testimonials only
  const loadFeaturedTestimonials = async () => {
    await Promise.all([
      fetchUserTestimonials({ featured: true, limit: 6 }),
      fetchVideoTestimonials({ featured: true, limit: 3 })
    ])
  }

  // Paginated user testimonials
  const paginatedUserTestimonials = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredUserTestimonials.value.slice(start, end)
  })

  // Total pages for pagination
  const totalPages = computed(() => {
    return Math.ceil(filteredUserTestimonials.value.length / itemsPerPage.value)
  })

  // Featured testimonials getters
  const featuredUserTestimonials = computed(() => {
    return userTestimonials.value.filter(t => t.featured)
  })

  const featuredVideoTestimonials = computed(() => {
    return videoTestimonials.value.filter(t => t.featured)
  })

  // Reset pagination when filter changes
  const setFilter = (newFilter) => {
    filter.value = newFilter
    currentPage.value = 1
  }

  // Change page
  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  // Add new testimonial and refresh list
  const addTestimonial = async (testimonialData) => {
    const result = await createTestimonial(testimonialData)
    if (result) {
      await fetchUserTestimonials() // Refresh the list
    }
    return result
  }

  // Upload video and refresh list
  const addVideoTestimonial = async (videoFile, contextId) => {
    const result = await uploadVideoTestimonial(videoFile, contextId)
    if (result) {
      await fetchVideoTestimonials() // Refresh the list
    }
    return result
  }

  // Clear store data
  const clearStore = () => {
    userTestimonials.value = []
    videoTestimonials.value = []
    currentPage.value = 1
    filter.value = 'all'
    error.value = null
  }

  return {
    // State
    loading,
    error,
    userTestimonials,
    videoTestimonials,
    filter,
    currentPage,
    itemsPerPage,
    selectedCategory,
    
    // Computed
    filteredUserTestimonials,
    filteredVideoTestimonials,
    paginatedUserTestimonials,
    totalPages,
    featuredUserTestimonials,
    featuredVideoTestimonials,
    statistics,
    
    // Actions
    loadTestimonials,
    loadFeaturedTestimonials,
    setFilter,
    changePage,
    addTestimonial,
    addVideoTestimonial,
    toggleFeatured,
    clearStore
  }
})