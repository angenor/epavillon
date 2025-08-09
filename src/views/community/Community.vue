<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Hero Section -->
    <CommunityHero />

    <!-- Main Content Container - Facebook-like layout -->
    <div class="container mx-auto px-4 py-6">
      <div class="max-w-4xl mx-auto">
        <!-- Create Post Section -->
        <CreatePost 
          v-if="user"
          @posted="handleNewPost" 
          class="mb-6"
        />

        <!-- Feed Filters -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div class="flex items-center gap-1 p-2">
            <button
              v-for="filter in feedFilters"
              :key="filter.value"
              @click="currentFilter = filter.value"
              :class="[
                'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200',
                currentFilter === filter.value
                  ? 'bg-ifdd-green-50 dark:bg-ifdd-green-900/30 text-ifdd-green-600 dark:text-ifdd-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <span class="flex items-center justify-center gap-2">
                <component :is="filter.icon" class="w-5 h-5" />
                {{ filter.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- Unified Facebook-like Feed -->
        <div class="space-y-6">
          <UserTestimonials 
            :filter="currentFilter"
            :style="'facebook'"
          />
        </div>
      </div>
    </div>

    <!-- Add Testimonial Modal -->
    <Teleport to="body">
      <AddTestimonialModal 
        v-if="showTestimonialModal" 
        @close="showTestimonialModal = false"
        @success="handleTestimonialSuccess"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import CommunityHero from '@/components/community/CommunityHero.vue'
import UserTestimonials from '@/components/community/UserTestimonials.vue'
import CreatePost from '@/components/community/CreatePost.vue'
import AddTestimonialModal from '@/components/community/AddTestimonialModal.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const showTestimonialModal = ref(false)
const currentFilter = ref('all')

// Icon components
const AllIcon = {
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z' })
    ])
  }
}

const InnovationIcon = {
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' })
    ])
  }
}

const PracticeIcon = {
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z' })
    ])
  }
}

const VideoIcon = {
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z' })
    ])
  }
}

const feedFilters = [
  { value: 'all', label: t('community.filters.all'), icon: AllIcon },
  { value: 'innovation', label: t('community.filters.innovations'), icon: InnovationIcon },
  { value: 'practice', label: t('community.filters.practices'), icon: PracticeIcon },
  { value: 'videos', label: t('community.filters.videos'), icon: VideoIcon }
]

const handleTestimonialSuccess = () => {
  showTestimonialModal.value = false
  // Refresh feed
}

const handleNewPost = () => {
  // Refresh feed after new post
}
</script>