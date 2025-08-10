<template>
  <div class="w-full">
    <!-- Upload Button (for authenticated users) -->
    <div v-if="user" class="flex justify-end mb-6">
      <button
        @click="showUploadModal = true"
        class="flex items-center gap-2 px-6 py-3 bg-ifdd-green-600 hover:bg-ifdd-green-700 text-white rounded-xl font-medium transition-colors duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {{ t('community.videoTestimonials.uploadButton') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="animate-pulse">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-2xl aspect-[9/16]"></div>
      </div>
    </div>

    <!-- Videos Grid -->
    <div v-else-if="videos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <VideoTestimonialCard
        v-for="video in videos"
        :key="video.id"
        :video="video"
        @play="playVideo(video)"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <div class="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ t('community.videoTestimonials.empty.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ t('community.videoTestimonials.empty.description') }}
      </p>
      <button
        v-if="user"
        @click="showUploadModal = true"
        class="inline-flex items-center gap-2 px-6 py-3 bg-ifdd-green-600 hover:bg-ifdd-green-700 text-white rounded-xl font-medium transition-colors duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('community.videoTestimonials.firstVideoButton') }}
      </button>
    </div>

    <!-- Video Player Modal -->
    <Teleport to="body">
      <VideoPlayerModal
        v-if="selectedVideo"
        :video="selectedVideo"
        @close="selectedVideo = null"
      />
    </Teleport>

    <!-- Upload Modal -->
    <Teleport to="body">
      <VideoUploadModal
        v-if="showUploadModal"
        @close="showUploadModal = false"
        @success="handleUploadSuccess"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useTestimonials } from '@/composables/useTestimonials'
import { checkVideoTestimonials, createTestVideoTestimonial } from '@/utils/testVideoData'
import VideoTestimonialCard from './VideoTestimonialCard.vue'
import VideoPlayerModal from './VideoPlayerModal.vue'
import VideoUploadModal from './VideoUploadModal.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { 
  loading,
  fetchVideoTestimonials
} = useTestimonials()

const videos = ref([])
const selectedVideo = ref(null)
const showUploadModal = ref(false)

// Charger les vidéos depuis la base de données
const loadVideos = async () => {
  console.log('Loading videos...')
  const data = await fetchVideoTestimonials(null) // null = toutes les vidéos (approuvées ou non)
  console.log('Videos loaded:', data)
  videos.value = data || []
  
  // Si aucune vidéo, afficher un message dans la console
  if (!data || data.length === 0) {
    console.log('Aucune vidéo trouvée dans la base de données')
  }
}

const playVideo = (video) => {
  selectedVideo.value = video
}

const handleUploadSuccess = async () => {
  showUploadModal.value = false
  // Recharger les vidéos après l'upload
  await loadVideos()
}

onMounted(async () => {
  // Vérifier d'abord les données dans la base
  await checkVideoTestimonials()
  
  // Charger les vidéos
  await loadVideos()
  
  // Si aucune vidéo, proposer de créer une vidéo de test
  if (videos.value.length === 0) {
    console.log('Aucune vidéo trouvée. Pour créer une vidéo de test, exécutez createTestVideoTestimonial() dans la console.')
    // Optionnel : créer automatiquement une vidéo de test
    // const testVideo = await createTestVideoTestimonial()
    // if (testVideo) {
    //   await loadVideos()
    // }
  }
})

// Exposer la fonction pour les tests (temporaire)
if (import.meta.env.DEV) {
  window.createTestVideo = async () => {
    const video = await createTestVideoTestimonial()
    if (video) {
      await loadVideos()
    }
    return video
  }
}
</script>