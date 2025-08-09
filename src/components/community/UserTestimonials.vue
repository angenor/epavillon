<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <div v-for="i in 5" :key="i" class="animate-pulse">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div class="flex items-start gap-4 mb-4">
            <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            </div>
            <div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div class="space-y-3 mb-4">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div class="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex gap-4">
              <div class="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div class="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Facebook-like Single Column Feed -->
    <div v-else-if="filteredPosts.length > 0" class="space-y-6">
      <TestimonialCard
        v-for="post in paginatedPosts"
        :key="`${post.type}-${post.id}`"
        :testimonial="post"
        :style="'facebook'"
        @click="openTestimonialDetail(post)"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ t('community.testimonials.empty.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('community.testimonials.empty.description') }}
      </p>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMorePosts" class="flex justify-center mt-8">
      <button
        @click="loadMorePosts"
        :disabled="loading"
        class="px-8 py-3 bg-ifdd-green-600 hover:bg-ifdd-green-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors duration-200 flex items-center gap-2"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ loading ? t('common.loading') : t('community.loadMore') }}
      </button>
    </div>

    <!-- Testimonial Detail Modal -->
    <Teleport to="body">
      <TestimonialDetailModal
        v-if="selectedTestimonial"
        :testimonial="selectedTestimonial"
        @close="selectedTestimonial = null"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTestimonialsStore } from '@/stores/testimonials'
import TestimonialCard from './TestimonialCard.vue'
import TestimonialDetailModal from './TestimonialDetailModal.vue'

// Props
const props = defineProps({
  filter: {
    type: String,
    default: 'all'
  },
  style: {
    type: String,
    default: 'facebook'
  }
})

const { t } = useI18n()
// const testimonialsStore = useTestimonialsStore() // Temporairement commenté pour les données simulées

const loading = ref(false)
const selectedTestimonial = ref(null)
const postsPerPage = ref(10)
const currentPage = ref(1)

// Enhanced mock data with all database fields and sample images
const mockPosts = ref([
  {
    id: '1',
    type: 'testimonial',
    testimonial_text: "L'innovation présentée sur cette plateforme a transformé notre approche de l'agriculture durable. Les résultats sont remarquables après seulement 6 mois d'implémentation!",
    photo_url: '/images/formation.jpg', // Photo du témoignage lui-même
    background_color: '#10B981',
    featured: true,
    user: {
      first_name: 'Jean',
      last_name: 'Dupont',
      profile_photo_url: null,
      organization: { name: 'AgroTech Solutions' }
    },
    innovation_practice: {
      title: 'Système d\'irrigation intelligent IoT',
      category: 'innovation',
      cover_image_hd_16_9_url: '/images/formation.jpg'
    },
    context_type: 'innovation, practice',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'testimonial',
    testimonial_text: "Cette pratique a considérablement amélioré notre productivité tout en réduisant notre impact environnemental de 40%. Une véritable révolution pour notre communauté agricole.",
    photo_url: null, // Pas de photo pour ce témoignage
    background_color: '#3B82F6',
    featured: false,
    user: {
      first_name: 'Marie',
      last_name: 'Martin',
      profile_photo_url: null,
      organization: { name: 'EcoFarm Cooperative' }
    },
    innovation_practice: {
      title: 'Compostage communautaire avancé',
      category: 'best_practice',
      cover_image_hd_16_9_url: '/images/image_de_fond_page_accueil.jpg'
    },
    context_type: 'innovation, practice',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'innovation',
    title: 'Capteurs météorologiques connectés',
    description: "Une solution innovante de surveillance climatique qui permet aux agriculteurs de prendre des décisions éclairées basées sur des données en temps réel.",
    category: 'innovation',
    cover_image_hd_16_9_url: '/images/cop.jpg',
    application_sector: 'agriculture',
    view_count: 245,
    organization: {
      name: 'Climate Tech Labs',
      country: { name_fr: 'Sénégal' }
    },
    submitted_by: {
      first_name: 'Ahmed',
      last_name: 'Saleh',
      profile_photo_url: null
    },
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    type: 'testimonial',
    testimonial_text: "Formation exceptionnelle sur les négociations climatiques! J'ai acquis des compétences pratiques que j'utilise maintenant dans mes missions diplomatiques.",
    photo_url: null,
    background_color: '#8B5CF6',
    featured: true,
    user: {
      first_name: 'Fatima',
      last_name: 'Ouali',
      profile_photo_url: null,
      organization: { name: 'Ministère de l\'Environnement - Maroc' }
    },
    training: {
      title: 'Négociations climatiques internationales',
      category: 'climate'
    },
    context_type: 'training',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    type: 'practice',
    title: 'Agriculture de conservation en zone aride',
    description: "Techniques agricoles durables adaptées aux conditions climatiques difficiles, permettant d'améliorer les rendements tout en préservant les sols.",
    category: 'best_practice',
    cover_image_hd_16_9_url: '/images/example/event_banniere_par_defaut_16_9.jpeg',
    application_sector: 'agriculture',
    view_count: 189,
    organization: {
      name: 'Institut Agronomique du Sahel',
      country: { name_fr: 'Niger' }
    },
    submitted_by: {
      first_name: 'Boubacar',
      last_name: 'Traore',
      profile_photo_url: '/images/people-bg/people-bg-one.jpg'
    },
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    type: 'video_testimonial',
    video_url: '/videos/video_couverture.mp4',
    duration_seconds: 8,
    featured: false,
    user: {
      first_name: 'Laurent',
      last_name: 'Dubois',
      profile_photo_url: null,
      organization: { name: 'Green Energy Solutions' }
    },
    context_type: 'event',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
])

// Filtered posts based on the parent filter prop
const filteredPosts = computed(() => {
  if (props.filter === 'all') {
    return mockPosts.value
  }
  
  return mockPosts.value.filter(post => {
    if (props.filter === 'innovation') {
      return post.type === 'innovation' || 
             (post.type === 'testimonial' && post.innovation_practice?.category === 'innovation')
    }
    if (props.filter === 'practice') {
      return post.type === 'practice' || 
             (post.type === 'testimonial' && post.innovation_practice?.category === 'best_practice')
    }
    if (props.filter === 'videos') {
      return post.type === 'video_testimonial'
    }
    return true
  })
})

// Paginated posts for infinite scroll effect
const paginatedPosts = computed(() => {
  const end = currentPage.value * postsPerPage.value
  return filteredPosts.value.slice(0, end)
})

// Check if there are more posts to load
const hasMorePosts = computed(() => {
  return paginatedPosts.value.length < filteredPosts.value.length
})

const openTestimonialDetail = (post) => {
  selectedTestimonial.value = post
}

const loadMorePosts = () => {
  if (hasMorePosts.value && !loading.value) {
    currentPage.value++
  }
}

// Reset when filter changes
watch(() => props.filter, () => {
  currentPage.value = 1
})

onMounted(async () => {
  // In production, load from store
  // loading.value = true
  // await testimonialsStore.loadTestimonials()
  // loading.value = false
})
</script>