<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/90 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative max-w-4xl w-full">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute -top-12 right-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Video Container -->
      <div class="relative aspect-video bg-black rounded-2xl overflow-hidden">
        <video
          ref="videoRef"
          :src="video.video_url"
          class="w-full h-full"
          controls
          autoplay
        />
      </div>

      <!-- Video Info -->
      <div class="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-6">
        <div class="flex items-center gap-4">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div 
              v-if="video.user?.profile_photo_url"
              class="w-12 h-12 rounded-full overflow-hidden"
            >
              <img 
                :src="video.user.profile_photo_url" 
                :alt="`${video.user.first_name} ${video.user.last_name}`"
                class="w-full h-full object-cover"
              >
            </div>
            <div 
              v-else
              class="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-ifdd-green-500 to-ifdd-blue-500 text-white font-semibold"
            >
              {{ getInitials(video.user) }}
            </div>
          </div>
          
          <!-- User Info -->
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ video.user?.first_name }} {{ video.user?.last_name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatTimeAgo(video.created_at) }}
            </p>
          </div>

          <!-- Featured Badge -->
          <div 
            v-if="video.featured"
            class="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Featured</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
const { t } = useI18n()
const videoRef = ref(null)

const getInitials = (user) => {
  if (!user) return '?'
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) {
    return t('common.today')
  } else if (diffDays < 7) {
    return t('common.daysAgo', { days: diffDays })
  } else {
    return t('common.weeksAgo', { weeks: Math.floor(diffDays / 7) })
  }
}

onMounted(() => {
  // Focus video on mount
  if (videoRef.value) {
    videoRef.value.focus()
  }
})
</script>