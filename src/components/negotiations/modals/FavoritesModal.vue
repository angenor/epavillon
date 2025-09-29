<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="close"
    >
      <div class="flex items-center justify-center min-h-screen p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 transition-opacity"></div>

        <!-- Modal Content -->
        <div
          class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl transition-all"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold flex items-center gap-2">
                  <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {{ $t('negotiations.favorites.myFavorites') }}
                </h2>
                <p class="text-sm opacity-90 mt-1">
                  {{ $t('negotiations.favorites.subtitle') }}
                </p>
              </div>
              <button
                @click="close"
                class="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2 p-4">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('negotiations.favorites.filterByCategory') }}:</span>
              <button
                v-for="cat in categories"
                :key="cat.value"
                @click="selectedCategory = cat.value"
                class="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer"
                :class="selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 200px)">
            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredFavorites.length === 0" class="text-center py-12">
              <div class="mx-auto h-16 w-16 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {{ selectedCategory === 'all'
                  ? $t('negotiations.favorites.noFavorites')
                  : $t('negotiations.favorites.noFavoritesInCategory') }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('negotiations.favorites.addDocumentsToFavorites') }}
              </p>
            </div>

            <!-- Favorites Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="document in filteredFavorites"
                :key="document.id"
                class="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
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
                    <svg class="w-10 h-10 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <!-- Type Badge -->
                  <div class="absolute top-2 left-2">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur text-white">
                      {{ getCategoryLabel(document.category) }}
                    </span>
                  </div>

                  <!-- Remove from Favorites -->
                  <button
                    @click="removeFromFavorites(document.id)"
                    class="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors duration-200 cursor-pointer"
                    :title="$t('negotiations.favorites.removeFromFavorites')"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Content -->
                <div class="p-3">
                  <h3 class="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                    {{ document.title }}
                  </h3>
                  <p v-if="document.description" class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {{ document.description }}
                  </p>

                  <!-- Favorited Date -->
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span class="inline-flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ $t('negotiations.favorites.addedOn') }} {{ formatDate(document.favorited_at) }}
                    </span>
                  </p>

                  <!-- Actions -->
                  <div class="flex items-center gap-2">
                    <button
                      @click="viewDocument(document)"
                      class="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors duration-200 cursor-pointer"
                    >
                      {{ $t('negotiations.documents.view') }}
                    </button>
                    <button
                      @click="downloadDocument(document)"
                      class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ filteredFavorites.length }} {{ $t('negotiations.favorites.documentsInFavorites') }}
              </p>
              <button
                @click="close"
                class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-200 font-medium text-sm cursor-pointer"
              >
                {{ $t('common.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFavorites } from '@/composables/useFavorites'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const { t, locale } = useI18n()
const { success: showSuccess, error: showError } = useToast()
const { favorites, loading, fetchFavorites, removeFavorite, favoritesByCategory } = useFavorites()

const selectedCategory = ref('all')

const categories = [
  { value: 'all', label: t('common.all') },
  { value: 'climate', label: t('nav.climat') },
  { value: 'biodiversity', label: t('nav.biodiversite') },
  { value: 'desertification', label: t('nav.desertification') }
]

const filteredFavorites = computed(() => {
  return favoritesByCategory.value(selectedCategory.value === 'all' ? null : selectedCategory.value)
})

const close = () => {
  emit('update:modelValue', false)
}

const viewDocument = (doc) => {
  if (doc.file_url) {
    window.open(doc.file_url, '_blank')
  }
}

const downloadDocument = (doc) => {
  if (doc.file_url) {
    const link = document.createElement('a')
    link.href = doc.file_url
    link.download = doc.title || 'document'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showSuccess(t('negotiations.documents.downloadSuccess'))
  }
}

const removeFromFavorites = async (documentId) => {
  try {
    await removeFavorite(documentId)
    showSuccess(t('negotiations.favorites.removedFromFavorites'))
  } catch (error) {
    showError(t('negotiations.favorites.removeError'))
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getCategoryLabel = (category) => {
  const labels = {
    'climate': t('nav.climat'),
    'biodiversity': t('nav.biodiversite'),
    'desertification': t('nav.desertification')
  }
  return labels[category] || category
}

const onImageError = (event) => {
  event.target.style.display = 'none'
  event.target.parentElement.querySelector('svg').style.display = 'block'
}

// Fetch favorites when modal opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    fetchFavorites()
  }
})

onMounted(() => {
  if (props.modelValue) {
    fetchFavorites()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>