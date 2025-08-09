<template>
  <div class="relative group cursor-pointer" @click="$emit('play')">
    <!-- Video Container -->
    <div class="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900">
      <!-- Video Preview/Thumbnail -->
      <video
        ref="videoRef"
        :src="video.video_url"
        class="w-full h-full object-cover"
        muted
        loop
        playsinline
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      />
      
      <!-- Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
      
      <!-- Play Button -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      
      <!-- Featured Badge -->
      <div v-if="video.featured" class="absolute top-3 left-3">
        <div class="flex items-center gap-1 px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span class="text-xs font-medium text-white">Featured</span>
        </div>
      </div>
      
      <!-- Duration -->
      <div class="absolute top-3 right-3">
        <div class="px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-white text-xs font-medium">
          {{ formatDuration(video.duration_seconds) }}
        </div>
      </div>
      
      <!-- User Info -->
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <div class="flex items-center gap-3">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div 
              v-if="video.user?.profile_photo_url"
              class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/50"
            >
              <img 
                :src="video.user.profile_photo_url" 
                :alt="`${video.user.first_name} ${video.user.last_name}`"
                class="w-full h-full object-cover"
              >
            </div>
            <div 
              v-else
              class="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-ifdd-green-500 to-ifdd-blue-500 text-white font-semibold ring-2 ring-white/50"
            >
              {{ getInitials(video.user) }}
            </div>
          </div>
          
          <!-- Name -->
          <div class="flex-1 min-w-0">
            <p class="text-white font-medium truncate">
              {{ video.user?.first_name }} {{ video.user?.last_name }}
            </p>
            <p class="text-white/70 text-sm">
              {{ formatTimeAgo(video.created_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['play'])
const { t } = useI18n()

const videoRef = ref(null)
let hoverTimeout = null

const handleMouseEnter = () => {
  if (videoRef.value && window.innerWidth > 768) { // Only on desktop
    hoverTimeout = setTimeout(() => {
      videoRef.value.play().catch(() => {
        // Silent fail if autoplay is blocked
      })
    }, 500)
  }
}

const handleMouseLeave = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
  }
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
}

const getInitials = (user) => {
  if (!user) return '?'
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffHours < 1) {
    return t('common.justNow')
  } else if (diffHours < 24) {
    return t('common.hoursAgo', { hours: diffHours })
  } else if (diffDays < 7) {
    return t('common.daysAgo', { days: diffDays })
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return t('common.weeksAgo', { weeks })
  } else {
    const months = Math.floor(diffDays / 30)
    return t('common.monthsAgo', { months })
  }
}
</script>