<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
      >
        <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Header with gradient background -->
      <div 
        class="relative h-32 rounded-t-3xl"
        :style="{ background: getBackgroundStyle() }"
      >
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-3xl"></div>
      </div>

      <!-- Content -->
      <div class="p-8 -mt-12 relative">
        <!-- User Info Card -->
        <div class="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg mb-6">
          <div class="flex items-start gap-4">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div 
                v-if="testimonial.user?.profile_photo_url"
                class="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-700"
              >
                <img 
                  :src="testimonial.user.profile_photo_url" 
                  :alt="`${testimonial.user.first_name} ${testimonial.user.last_name}`"
                  class="w-full h-full object-cover"
                >
              </div>
              <div 
                v-else
                class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ring-4 ring-white dark:ring-gray-700"
                :style="{ backgroundColor: testimonial.background_color || getRandomColor() }"
              >
                {{ getInitials(testimonial.user) }}
              </div>
            </div>

            <!-- User Details -->
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ testimonial.user?.first_name }} {{ testimonial.user?.last_name }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                {{ testimonial.user?.organization?.name || 'Organisation' }}
              </p>
              <div class="flex items-center gap-4 mt-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(testimonial.created_at) }}
                </span>
                <span 
                  v-if="testimonial.featured"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  En vedette
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Content based on type -->
        <div class="mb-6">
          <!-- Video Testimonial -->
          <div v-if="testimonial.type === 'video_testimonial' && testimonial.video_url" class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {{ t('community.testimonialDetail.video') }}
            </h4>
            <video 
              :src="testimonial.video_url" 
              class="w-full rounded-xl shadow-lg"
              controls
              :poster="testimonial.thumbnail_url || testimonial.user?.profile_photo_url"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
            <p v-if="testimonial.duration_seconds" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Durée: {{ testimonial.duration_seconds }} secondes
            </p>
          </div>

          <!-- Testimonial Text -->
          <div v-if="testimonial.testimonial_text">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {{ t('community.testimonialDetail.testimonial') }}
            </h4>
            <blockquote class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic mb-4">
              "{{ testimonial.testimonial_text }}"
            </blockquote>
            
            <!-- Image pour témoignage simple -->
            <div v-if="testimonial.photo_url" class="mb-4">
              <img 
                :src="testimonial.photo_url" 
                :alt="'Photo témoignage'"
                class="w-full rounded-xl shadow-lg"
              >
            </div>
          </div>

          <!-- Innovation/Practice Content -->
          <div v-if="testimonial.type === 'innovation' || testimonial.type === 'practice'">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {{ testimonial.title }}
            </h4>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {{ testimonial.description }}
            </p>
            
            <!-- Image avec tous les champs possibles -->
            <div v-if="getMainImage()" class="mb-4">
              <img 
                :src="getMainImage()" 
                :alt="testimonial.title"
                class="w-full rounded-xl shadow-lg"
              >
            </div>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-if="testimonial.category" class="px-3 py-1 bg-ifdd-green-100 dark:bg-ifdd-green-900/30 text-ifdd-green-700 dark:text-ifdd-green-400 rounded-full text-sm">
                {{ testimonial.category === 'innovation' ? 'Innovation' : 'Bonne Pratique' }}
              </span>
              <span v-if="testimonial.application_sector" class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                {{ testimonial.application_sector }}
              </span>
              <span v-if="testimonial.view_count" class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                {{ testimonial.view_count }} vues
              </span>
            </div>
          </div>
        </div>

        <!-- Context Info -->
        <div v-if="testimonial.innovation_practice || testimonial.training" class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {{ t('community.testimonialDetail.context') }}
          </h4>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
            <!-- Image de contexte -->
            <div v-if="getContextImage()" class="h-32 w-full">
              <img 
                :src="getContextImage()" 
                :alt="getContextTitle()"
                class="w-full h-full object-cover"
              >
            </div>
            <div class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ getContextTitle() }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ getContextType() }}
                  </p>
                </div>
                <button class="px-4 py-2 bg-ifdd-green-600 hover:bg-ifdd-green-700 text-white rounded-lg font-medium transition-colors">
                  {{ t('community.testimonialDetail.viewProject') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
              </svg>
              {{ t('community.testimonialDetail.share') }}
            </span>
          </button>
          <button class="flex-1 px-4 py-3 bg-ifdd-green-600 hover:bg-ifdd-green-700 text-white rounded-xl font-medium transition-colors">
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {{ t('community.testimonialDetail.contact') }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  testimonial: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
const { t, d } = useI18n()

const getInitials = (user) => {
  if (!user) return '?'
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return d(new Date(dateString), 'long')
}

const getBackgroundStyle = () => {
  const color = props.testimonial.background_color || '#10B981'
  return `linear-gradient(135deg, ${color}88, ${color})`
}

const getRandomColor = () => {
  const colors = [
    '#10B981', // green
    '#3B82F6', // blue  
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#EF4444', // red
    '#EC4899', // pink
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const getMainImage = () => {
  // Pour un témoignage simple : utiliser photo_url
  if (props.testimonial.type === 'testimonial' && props.testimonial.photo_url) {
    return props.testimonial.photo_url
  }
  
  // Pour une innovation ou pratique : chercher dans tous les champs possibles
  if (props.testimonial.type === 'innovation' || props.testimonial.type === 'practice') {
    return props.testimonial.cover_image_hd_16_9_url ||
           props.testimonial.innovation?.cover_image_hd_16_9_url || 
           props.testimonial.practice?.cover_image_hd_16_9_url ||
           props.testimonial.innovation_practice?.cover_image_hd_16_9_url ||
           null
  }
  
  // Pour une vidéo témoignage : utiliser la miniature
  if (props.testimonial.type === 'video_testimonial' && props.testimonial.thumbnail_url) {
    return props.testimonial.thumbnail_url
  }
  
  return null
}

const getContextImage = () => {
  if (props.testimonial.innovation_practice?.cover_image_hd_16_9_url) {
    return props.testimonial.innovation_practice.cover_image_hd_16_9_url
  }
  if (props.testimonial.training?.cover_image_url) {
    return props.testimonial.training.cover_image_url
  }
  return null
}

const getContextTitle = () => {
  if (props.testimonial.innovation_practice) {
    return props.testimonial.innovation_practice.title
  }
  if (props.testimonial.training) {
    return props.testimonial.training.title
  }
  return ''
}

const getContextType = () => {
  if (props.testimonial.innovation_practice) {
    return props.testimonial.innovation_practice.category === 'innovation' ? 'Innovation' : 'Bonne Pratique'
  }
  if (props.testimonial.training) {
    return 'Formation'
  }
  return ''
}
</script>