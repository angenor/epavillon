<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ getTitle() }}
          </h2>
          <button
            @click="$emit('close')"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- User Info -->
      <div class="px-6 pt-4">
        <div class="flex items-center gap-3">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div 
              v-if="user?.profile_photo_url"
              class="w-12 h-12 rounded-full overflow-hidden"
            >
              <img 
                :src="user.profile_photo_url" 
                :alt="`${user.first_name} ${user.last_name}`"
                class="w-full h-full object-cover"
              >
            </div>
            <div 
              v-else
              class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
              :style="{ backgroundColor: selectedColor }"
            >
              {{ getInitials(user) }}
            </div>
          </div>
          
          <!-- Name and Context -->
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ user?.first_name }} {{ user?.last_name }}
            </h3>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{{ t('community.createPost.postingAs') }}</span>
              <select
                v-model="postCategory"
                class="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm"
              >
                <option value="innovation">{{ t('community.createPost.innovation') }}</option>
                <option value="practice">{{ t('community.createPost.practice') }}</option>
                <option value="testimonial">{{ t('community.createPost.testimonial') }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit" class="p-6">
        <!-- Text Content -->
        <div v-if="type !== 'video'" class="mb-4">
          <textarea
            v-model="content"
            :placeholder="getPlaceholder()"
            class="w-full min-h-[200px] p-4 text-lg bg-transparent border-0 focus:ring-0 resize-none text-gray-900 dark:text-white placeholder-gray-400"
            autofocus
          ></textarea>
        </div>

        <!-- Video Upload for Video Type -->
        <div v-if="type === 'video'" class="mb-4">
          <div 
            v-if="!videoFile"
            @click="$refs.videoInput.click()"
            @dragover.prevent
            @drop.prevent="handleVideoDrop"
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-ifdd-green-500 transition-colors"
          >
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-600 dark:text-gray-400 mb-2">
              {{ t('community.createPost.videoUpload') }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-500">
              {{ t('community.createPost.maxDuration') }}
            </p>
          </div>

          <div v-else class="relative">
            <video
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
          </div>

          <input
            ref="videoInput"
            type="file"
            accept="video/*"
            @change="handleVideoSelect"
            class="hidden"
          >

          <!-- Caption for video -->
          <textarea
            v-if="videoFile"
            v-model="content"
            :placeholder="t('community.createPost.videoCaption')"
            class="w-full mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400"
            rows="2"
          ></textarea>
        </div>

        <!-- Background Color Selector -->
        <div v-if="type === 'testimonial'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('community.createPost.backgroundColor') }}
          </label>
          <div class="flex gap-2">
            <button
              v-for="color in backgroundColors"
              :key="color"
              type="button"
              @click="selectedColor = color"
              :class="[
                'w-10 h-10 rounded-lg transition-all',
                selectedColor === color ? 'ring-2 ring-offset-2 ring-ifdd-green-500 scale-110' : ''
              ]"
              :style="{ backgroundColor: color }"
            ></button>
          </div>
        </div>

        <!-- Innovation/Practice Context -->
        <div v-if="postCategory !== 'testimonial'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('community.createPost.relatedTo') }}
          </label>
          <select
            v-model="contextId"
            class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{{ t('community.createPost.selectContext') }}</option>
            <!-- These would be loaded from store -->
            <option value="1">Système d'irrigation intelligent</option>
            <option value="2">Compostage communautaire</option>
            <option value="3">Capteurs météo connectés</option>
          </select>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200 dark:border-gray-700 -mx-6 mb-4"></div>

        <!-- Actions -->
        <div class="flex items-center justify-between">
          <!-- Additional Options -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Add photo"
            >
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Add emoji"
            >
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="!canSubmit"
            class="px-6 py-2 bg-ifdd-green-600 hover:bg-ifdd-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {{ t('community.createPost.publish') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useTestimonialsStore } from '@/stores/testimonials'

const props = defineProps({
  type: {
    type: String,
    default: 'testimonial'
  }
})

const emit = defineEmits(['close', 'posted'])
const { t } = useI18n()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const testimonialsStore = useTestimonialsStore()

const content = ref('')
const postCategory = ref(props.type === 'video' ? 'testimonial' : props.type)
const selectedColor = ref('#10B981')
const contextId = ref('')
const videoFile = ref(null)
const videoUrl = ref(null)

const backgroundColors = [
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F59E0B', // amber
  '#EF4444', // red
  '#6B7280', // gray
  '#0891B2'  // cyan
]

const canSubmit = computed(() => {
  if (props.type === 'video') {
    return videoFile.value && content.value.trim().length > 0
  }
  return content.value.trim().length > 10
})

const getTitle = () => {
  const titles = {
    testimonial: t('community.createPost.createTestimonial'),
    innovation: t('community.createPost.shareInnovation'),
    practice: t('community.createPost.sharePractice'),
    video: t('community.createPost.shareVideo')
  }
  return titles[props.type] || titles.testimonial
}

const getPlaceholder = () => {
  const placeholders = {
    testimonial: t('community.createPost.testimonialPlaceholder'),
    innovation: t('community.createPost.innovationPlaceholder'),
    practice: t('community.createPost.practicePlaceholder')
  }
  return placeholders[postCategory.value] || placeholders.testimonial
}

const getInitials = (user) => {
  if (!user) return '?'
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

const handleVideoSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processVideo(file)
  }
}

const handleVideoDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) {
    processVideo(file)
  }
}

const processVideo = (file) => {
  videoFile.value = file
  videoUrl.value = URL.createObjectURL(file)
}

const removeVideo = () => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
  videoFile.value = null
  videoUrl.value = null
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  const postData = {
    text: content.value,
    backgroundColor: selectedColor.value,
    contextId: contextId.value || null
  }

  try {
    if (props.type === 'video' && videoFile.value) {
      await testimonialsStore.addVideoTestimonial(videoFile.value, contextId.value)
    } else {
      await testimonialsStore.addTestimonial(postData)
    }
    emit('posted')
    emit('close')
  } catch (error) {
    console.error('Error creating post:', error)
  }
}
</script>