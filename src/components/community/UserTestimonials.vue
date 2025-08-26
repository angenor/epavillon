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
        @edit="handleEditPost"
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

    <!-- Edit Post Modal -->
    <Teleport to="body">
      <EditPostModal
        v-if="postToEdit"
        :post="postToEdit"
        @close="postToEdit = null"
        @updated="handlePostUpdated"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTestimonials } from '@/composables/useTestimonials'
import TestimonialCard from './TestimonialCard.vue'
import TestimonialDetailModal from './TestimonialDetailModal.vue'
import EditPostModal from './EditPostModal.vue'

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
const { 
  loading, 
  error, 
  fetchCommunityFeed 
} = useTestimonials()

const posts = ref([])
const selectedTestimonial = ref(null)
const postToEdit = ref(null)
const postsPerPage = ref(10)
const currentPage = ref(1)
const hasMore = ref(false)
const totalPosts = ref(0)

// Charger les données depuis la base de données
const loadPosts = async (resetPage = false) => {
  if (resetPage) {
    currentPage.value = 1
    posts.value = []
  }
  
  console.log('Loading posts with filter:', props.filter)
  
  const result = await fetchCommunityFeed(
    props.filter,
    currentPage.value,
    postsPerPage.value
  )
  
  console.log('Loaded posts result:', result)
  
  if (result) {
    if (resetPage) {
      posts.value = result.posts
    } else {
      posts.value = [...posts.value, ...result.posts]
    }
    totalPosts.value = result.total
    hasMore.value = result.hasMore
    
    console.log('Posts after loading:', posts.value)
  }
}

// Posts filtrés provenant de la base de données
const filteredPosts = computed(() => posts.value)

// Posts paginés pour le défilement infini
const paginatedPosts = computed(() => filteredPosts.value)

// Vérifier s'il y a plus de posts à charger
const hasMorePosts = computed(() => hasMore.value)

const openTestimonialDetail = (post) => {
  selectedTestimonial.value = post
}

const loadMorePosts = async () => {
  if (hasMorePosts.value && !loading.value) {
    currentPage.value++
    await loadPosts()
  }
}

// Handle edit post event
const handleEditPost = (post) => {
  console.log('Edit post:', post)
  postToEdit.value = post
}

// Handle post updated event
const handlePostUpdated = () => {
  // Refresh the feed after successful update
  loadPosts(true)
  postToEdit.value = null
}

// Réinitialiser quand le filtre change
watch(() => props.filter, () => {
  loadPosts(true)
})

onMounted(async () => {
  await loadPosts(true)
})
</script>