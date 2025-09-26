<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        {{ $t('negotiations.documents.title') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-1 text-sm">
        {{ $t('negotiations.documents.subtitle') }}
      </p>
      
      <!-- Search Bar -->
      <div class="mt-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('negotiations.documents.searchPlaceholder')"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-3 flex flex-wrap gap-2">
        <select
          v-model="selectedType"
          class="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">{{ $t('negotiations.documents.filters.allTypes') }}</option>
          <option v-for="type in documentTypes" :key="type.value" :value="type.value">
            {{ $t(type.label) }}
          </option>
        </select>
        
        <select
          v-model="sortBy"
          class="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="recent">{{ $t('negotiations.documents.sort.recent') }}</option>
          <option value="alphabetical">{{ $t('negotiations.documents.sort.alphabetical') }}</option>
          <option value="relevance">{{ $t('negotiations.documents.sort.relevance') }}</option>
        </select>
      </div>
    </div>

    <div class="p-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-6">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>

      <!-- Documents Grid -->
      <div
        v-else-if="filteredDocuments.length > 0"
        class="grid gap-6"
        :class="{
          'grid-cols-1': filteredDocuments.length === 1,
          'grid-cols-1 sm:grid-cols-2': filteredDocuments.length === 2,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': filteredDocuments.length >= 3
        }"
      >
        <div
          v-for="document in filteredDocuments"
          :key="document.id"
          :class="{
            'max-w-md mx-auto': filteredDocuments.length === 1,
            'max-w-sm mx-auto': filteredDocuments.length === 2
          }"
        >
          <DocumentCard
            :document="document"
            @view="handleViewDocument"
            @download="handleDownloadDocument"
            @favorite="handleToggleFavorite"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <div class="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ $t('negotiations.documents.noDocuments') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('negotiations.documents.noDocumentsDesc') }}
        </p>
      </div>

      <!-- View More Button -->
      <div v-if="hasMore && filteredDocuments.length > 0" class="mt-6 text-center">
        <button
          @click="loadMore"
          :disabled="loadingMore"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
        >
          <svg v-if="loadingMore" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loadingMore ? $t('common.loading') : $t('negotiations.documents.viewMore') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DocumentCard from './DocumentCard.vue'
import { useNegotiationDocuments } from '@/composables/useNegotiationDocuments'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  category: {
    type: String,
    required: true,
    validator: (value) => ['climat', 'biodiversite', 'desertification'].includes(value)
  }
})

const { t } = useI18n()
const { showToast } = useToast()
const { 
  documents, 
  loading, 
  loadingMore, 
  hasMore, 
  fetchDocuments, 
  loadMoreDocuments,
  viewDocument,
  downloadDocument,
  toggleFavorite
} = useNegotiationDocuments()

const searchQuery = ref('')
const selectedType = ref('all')
const sortBy = ref('recent')

const documentTypes = [
  { value: 'negotiation_guide', label: 'negotiations.documents.types.negotiationGuide' },
  { value: 'technical_note', label: 'negotiations.documents.types.technicalNote' },
  { value: 'relevant_document', label: 'negotiations.documents.types.relevantDocument' },
  { value: 'other', label: 'negotiations.documents.types.other' }
]

// Map category to database enum
const categoryMap = {
  'climat': 'climate',
  'biodiversite': 'biodiversity',
  'desertification': 'desertification'
}

const filteredDocuments = computed(() => {
  let filtered = documents.value.filter(doc => 
    doc.category === categoryMap[props.category]
  )

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      (doc.description && doc.description.toLowerCase().includes(query))
    )
  }

  // Filter by document type
  if (selectedType.value !== 'all') {
    filtered = filtered.filter(doc => doc.document_type === selectedType.value)
  }

  // Sort documents
  switch (sortBy.value) {
    case 'alphabetical':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'relevance':
      // Sort by relevance (could be based on downloads, views, etc.)
      filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      break
    case 'recent':
    default:
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
  }

  return filtered
})

const handleViewDocument = async (documentId) => {
  try {
    await viewDocument(documentId)
  } catch (error) {
    showToast(t('negotiations.documents.viewError'), 'error')
  }
}

const handleDownloadDocument = async (documentId) => {
  try {
    await downloadDocument(documentId)
    showToast('Document téléchargé avec succès', 'success')
  } catch (error) {
    console.error('Download error:', error)
    showToast('Erreur lors du téléchargement', 'error')
  }
}

const handleToggleFavorite = async (documentId) => {
  try {
    await toggleFavorite(documentId)
    showToast(t('negotiations.documents.favoriteToggled'), 'success')
  } catch (error) {
    showToast(t('negotiations.documents.favoriteError'), 'error')
  }
}

const loadMore = async () => {
  try {
    await loadMoreDocuments(categoryMap[props.category])
  } catch (error) {
    showToast(t('negotiations.documents.loadMoreError'), 'error')
  }
}

// Watch for category changes
watch(() => props.category, () => {
  fetchDocuments(categoryMap[props.category])
}, { immediate: true })

onMounted(() => {
  fetchDocuments(categoryMap[props.category])
})
</script>