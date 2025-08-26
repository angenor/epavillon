<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full shadow-2xl">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ t('community.uploadVideo.title') }}
        </h3>
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="space-y-4">
          <!-- Video Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('community.uploadVideo.videoFile') }}
            </label>
            
            <div 
              v-if="!videoFile"
              @click="$refs.fileInput.click()"
              @dragover.prevent
              @drop.prevent="handleDrop"
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-ifdd-green-500 transition-colors"
            >
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-gray-600 dark:text-gray-400 mb-2">
                {{ t('community.uploadVideo.dropzone') }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-500">
                {{ t('community.uploadVideo.maxDuration') }}
              </p>
            </div>

            <!-- Video Preview -->
            <div v-else class="relative">
              <video
                ref="videoPreview"
                :src="videoUrl"
                class="w-full rounded-xl"
                controls
              />
              <button
                type="button"
                @click="removeVideo"
                class="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div v-if="videoDuration" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Duration: {{ videoDuration }}s
                <span v-if="videoDuration > 10" class="text-red-500">
                  ({{ t('community.uploadVideo.tooLong') }})
                </span>
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="video/*"
              @change="handleFileSelect"
              class="hidden"
            >
          </div>

          <!-- Context Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('community.uploadVideo.context') }}
            </label>
            <select
              v-model="formData.contextId"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ifdd-green-500 focus:border-transparent transition-colors"
              required
            >
              <option value="">{{ t('community.uploadVideo.selectContext') }}</option>
              <!-- Options would be loaded from store -->
              <option value="1">Innovation Example 1</option>
              <option value="2">Practice Example 1</option>
            </select>
          </div>

          <!-- Thématiques Selection (Multiple) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('community.uploadVideo.thematiques') }}
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl p-3">
              <label 
                v-for="thematique in availableThematiques" 
                :key="thematique.value"
                class="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  :value="thematique.value"
                  v-model="formData.thematiqueTypes"
                  class="w-4 h-4 text-ifdd-green-600 bg-gray-100 border-gray-300 rounded focus:ring-ifdd-green-500 dark:focus:ring-ifdd-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                >
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ thematique.label }}</span>
              </label>
            </div>
          </div>

          <!-- Notice -->
          <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-yellow-800 dark:text-yellow-300">
                {{ t('community.uploadVideo.notice') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading || !videoFile || videoDuration > 10 || formData.thematiqueTypes.length === 0"
            class="flex-1 px-4 py-3 bg-ifdd-green-600 hover:bg-ifdd-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? t('common.uploading') : t('common.upload') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTestimonialsStore } from '@/stores/testimonials'

const emit = defineEmits(['close', 'success'])
const { t } = useI18n()
const testimonialsStore = useTestimonialsStore()

const loading = ref(false)
const videoFile = ref(null)
const videoUrl = ref(null)
const videoDuration = ref(null)
const formData = ref({
  contextId: '',
  thematiqueTypes: [] // Nouveau: tableau pour les thématiques
})

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processVideo(file)
  }
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) {
    processVideo(file)
  }
}

const processVideo = (file) => {
  videoFile.value = file
  videoUrl.value = URL.createObjectURL(file)
  
  // Check video duration
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.onloadedmetadata = () => {
    videoDuration.value = Math.round(video.duration)
    URL.revokeObjectURL(video.src)
  }
  video.src = videoUrl.value
}

const removeVideo = () => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
  videoFile.value = null
  videoUrl.value = null
  videoDuration.value = null
}

// Thématiques disponibles
const availableThematiques = [
  { value: 'pertes_et_prejudices', label: t('common.thematiques.pertes_et_prejudices') },
  { value: 'adaptation', label: t('common.thematiques.adaptation') },
  { value: 'attenuation', label: t('common.thematiques.attenuation') },
  { value: 'finance', label: t('common.thematiques.finance') },
  { value: 'genre', label: t('common.thematiques.genre') },
  { value: 'ace', label: t('common.thematiques.ace') },
  { value: 'agriculture', label: t('common.thematiques.agriculture') },
  { value: 'transparence', label: t('common.thematiques.transparence') },
  { value: 'mecanismes_de_cooperation', label: t('common.thematiques.mecanismes_de_cooperation') },
  { value: 'bilan_mondial', label: t('common.thematiques.bilan_mondial') },
  { value: 'droits_de_l_homme_et_climat', label: t('common.thematiques.droits_de_l_homme_et_climat') }
]

const handleSubmit = async () => {
  if (!videoFile.value || videoDuration.value > 10) return
  
  if (formData.value.thematiqueTypes.length === 0) {
    alert(t('community.uploadVideo.selectAtLeastOneThematique'))
    return
  }
  
  loading.value = true
  try {
    // Ajouter les thématiques aux données vidéo
    const videoData = {
      contextId: formData.value.contextId,
      thematiqueTypes: formData.value.thematiqueTypes
    }
    await testimonialsStore.addVideoTestimonial(videoFile.value, videoData)
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Error uploading video:', error)
  } finally {
    loading.value = false
  }
}
</script>