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
        :style="{ background: `linear-gradient(135deg, ${testimonial.background_color}88, ${testimonial.background_color})` }"
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
                :style="{ backgroundColor: testimonial.background_color || '#10B981' }"
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

        <!-- Testimonial Text -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {{ t('community.testimonialDetail.testimonial') }}
          </h4>
          <blockquote class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
            "{{ testimonial.testimonial_text }}"
          </blockquote>
        </div>

        <!-- Context Info -->
        <div v-if="testimonial.innovation_practice" class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {{ t('community.testimonialDetail.context') }}
          </h4>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ testimonial.innovation_practice.title }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ testimonial.innovation_practice.category === 'innovation' ? 'Innovation' : 'Bonne Pratique' }}
                </p>
              </div>
              <button class="px-4 py-2 bg-ifdd-green-600 hover:bg-ifdd-green-700 text-white rounded-lg font-medium transition-colors">
                {{ t('community.testimonialDetail.viewProject') }}
              </button>
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
</script>