<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ $t('directory.title') }}
            </h1>
            <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
              {{ $t('directory.subtitle') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="lg:grid lg:grid-cols-4 lg:gap-8">
        <!-- Filtres -->
        <div class="lg:col-span-1">
          <PublicFilters
            v-model:search="filters.search"
            v-model:organization="filters.organization"
            v-model:country="filters.country"
            v-model:expertise="filters.expertise"
            @filter-change="handleFilterChange"
          />
        </div>

        <!-- Liste des profils -->
        <div class="lg:col-span-3 mt-8 lg:mt-0">
          <!-- Barre de résultats -->
          <div class="flex items-center justify-between mb-6">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('directory.results_count', { count: totalResults }) }}
            </div>
            <div class="flex items-center space-x-4">
              <!-- Sélecteur de nombre par page -->
              <select
                v-model="pagination.perPage"
                @change="handlePerPageChange"
                class="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="20">20 {{ $t('common.per_page') }}</option>
                <option value="50">50 {{ $t('common.per_page') }}</option>
                <option value="100">100 {{ $t('common.per_page') }}</option>
              </select>

              <!-- Toggle grille/liste -->
              <div class="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                  @click="viewMode = 'grid'"
                  :class="[
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  ]"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="[
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  ]"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- État de chargement -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ifdd-green-600"></div>
            <p class="mt-2 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
          </div>

          <!-- Aucun résultat -->
          <div v-else-if="profiles.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('directory.no_results') }}</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ $t('directory.no_results_message') }}</p>
          </div>

          <!-- Grille des profils -->
          <div
            v-else
            :class="[
              'grid gap-6',
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            ]"
          >
            <PublicUserCard
              v-for="profile in profiles"
              :key="profile.id"
              :profile="profile"
              :view-mode="viewMode"
              @connection-request="handleConnectionRequest"
            />
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center">
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="changePage(pagination.currentPage - 1)"
                :disabled="pagination.currentPage === 1"
                :class="[
                  'relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium',
                  pagination.currentPage === 1
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                ]"
              >
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="sr-only">{{ $t('common.previous') }}</span>
              </button>

              <template v-for="page in visiblePages" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="changePage(page)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === pagination.currentPage
                      ? 'z-10 bg-ifdd-green-50 border-ifdd-green-500 text-ifdd-green-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                  ]"
                >
                  {{ page }}
                </button>
                <span
                  v-else
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                  ...
                </span>
              </template>

              <button
                @click="changePage(pagination.currentPage + 1)"
                :disabled="pagination.currentPage === totalPages"
                :class="[
                  'relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium',
                  pagination.currentPage === totalPages
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                ]"
              >
                <span class="sr-only">{{ $t('common.next') }}</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PublicUserCard from '@/components/profils/PublicUserCard.vue'
import PublicFilters from '@/components/profils/PublicFilters.vue'
import { usePublicProfiles } from '@/composables/usePublicProfiles'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// État local
const viewMode = ref('grid')
const loading = ref(true)

// Filtres
const filters = ref({
  search: route.query.search || '',
  organization: route.query.organization || '',
  country: route.query.country || '',
  expertise: route.query.expertise || ''
})

// Pagination
const pagination = ref({
  currentPage: parseInt(route.query.page) || 1,
  perPage: parseInt(route.query.perPage) || 20
})

// Composable pour récupérer les données
const {
  profiles,
  totalResults,
  totalPages,
  searchProfiles
} = usePublicProfiles()

// Computed
const visiblePages = computed(() => {
  const current = pagination.value.currentPage
  const total = totalPages.value
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else if (total > 1) {
    rangeWithDots.push(total)
  }

  return rangeWithDots
})

// Méthodes
const handleFilterChange = () => {
  pagination.value.currentPage = 1
  updateURLParams()
  loadProfiles()
}

const handlePerPageChange = () => {
  pagination.value.currentPage = 1
  updateURLParams()
  loadProfiles()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    pagination.value.currentPage = page
    updateURLParams()
    loadProfiles()
  }
}

const updateURLParams = () => {
  const query = {
    ...filters.value,
    page: pagination.value.currentPage,
    perPage: pagination.value.perPage
  }
  
  // Supprimer les paramètres vides
  Object.keys(query).forEach(key => {
    if (!query[key] || (typeof query[key] === 'string' && !query[key].trim())) {
      delete query[key]
    }
  })

  router.replace({ query })
}

const loadProfiles = async () => {
  loading.value = true
  try {
    await searchProfiles({
      ...filters.value,
      page: pagination.value.currentPage,
      perPage: pagination.value.perPage
    })
  } catch (error) {
    console.error('Erreur lors du chargement des profils:', error)
  } finally {
    loading.value = false
  }
}

const handleConnectionRequest = (profileId) => {
  // Gérer la demande de connexion
  console.log('Demande de connexion pour:', profileId)
}

// Watchers
watch([filters], () => {
  handleFilterChange()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadProfiles()
})
</script>