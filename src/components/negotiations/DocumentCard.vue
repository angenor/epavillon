<template>
  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow duration-200">
    <!-- Document Image/Icon -->
    <div class="relative h-32 bg-gradient-to-br from-blue-500 to-blue-600">
      <img
        v-if="document.cover_image_url"
        :src="document.cover_image_url"
        :alt="document.title"
        class="w-full h-full object-cover"
        @error="onImageError"
      />
      <div v-else class="flex items-center justify-center w-full h-full">
        <svg class="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      
      <!-- Document Type Badge -->
      <div class="absolute top-2 left-2">
        <span 
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
          :class="documentTypeClasses"
        >
          {{ $t(`negotiations.documents.types.${document.document_type}`) }}
        </span>
      </div>

      <!-- Favorite Button -->
      <button
        @click="$emit('favorite', document.id)"
        class="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
      >
        <svg 
          class="w-4 h-4 text-white"
          :class="document.is_favorited ? 'fill-current' : 'fill-none'"
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>

    <!-- Document Content -->
    <div class="p-4">
      <!-- Title -->
      <h3 class="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {{ document.title }}
      </h3>

      <!-- Description -->
      <p v-if="document.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {{ document.description }}
      </p>

      <!-- Document Info -->
      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
        <div class="flex items-center space-x-2">
          <!-- Publication Date -->
          <span>{{ formatDate(document.created_at) }}</span>
          
          <!-- File Size -->
          <span v-if="document.file_size" class="flex items-center">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ formatFileSize(document.file_size) }}
          </span>
        </div>

        <!-- Downloads count -->
        <span v-if="document.downloads_count" class="flex items-center">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ document.downloads_count }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center space-x-2">
        <!-- View Document -->
        <button
          @click="$emit('view', document.id)"
          class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ $t('negotiations.documents.view') }}
        </button>

        <!-- Download Document -->
        <button
          @click="$emit('download', document.id)"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>

        <!-- Share Document -->
        <button
          @click="shareDocument"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'download', 'favorite'])

const { t, locale } = useI18n()

const documentTypeClasses = computed(() => {
  switch (props.document.document_type) {
    case 'negotiation_guide':
      return 'bg-green-500'
    case 'technical_note':
      return 'bg-blue-500'
    case 'relevant_document':
      return 'bg-orange-500'
    case 'other':
    default:
      return 'bg-gray-500'
  }
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const shareDocument = async () => {
  const shareData = {
    title: props.document.title,
    text: props.document.description || '',
    url: window.location.href
  }

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      console.log('Error sharing:', error)
      fallbackShare()
    }
  } else {
    fallbackShare()
  }
}

const fallbackShare = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    // Could show a toast message here
    console.log('Link copied to clipboard')
  }).catch(() => {
    console.log('Failed to copy link')
  })
}

const onImageError = (event) => {
  event.target.style.display = 'none'
  event.target.parentElement.querySelector('svg').style.display = 'block'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>