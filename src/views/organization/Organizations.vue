<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header avec bannière héroïque -->
    <div class="relative h-64 md:h-80 lg:h-96 overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700">
      <!-- Image de fond avec overlay -->
      <div class="absolute inset-0">
        <img 
          src="/images/example/event_banniere_par_defaut_32_9.jpg"
          alt="Organizations banner"
          class="w-full h-full object-cover opacity-30"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      </div>
      
      <!-- Motif décoratif -->
      <div class="absolute inset-0 opacity-10">
        <svg class="absolute right-0 top-0 h-full" viewBox="0 0 400 400" fill="none">
          <circle cx="300" cy="100" r="150" stroke="white" stroke-width="2"/>
          <circle cx="350" cy="150" r="200" stroke="white" stroke-width="1"/>
        </svg>
      </div>
      
      <!-- Contenu du header -->
      <div class="relative h-full flex items-end">
        <div class="w-full p-6 md:p-8 lg:p-12">
          <div class="max-w-7xl mx-auto">
            <div class="flex items-center space-x-4 mb-4">
              <!-- Icône principale -->
              <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <!-- Titre et sous-titre -->
              <div>
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  {{ $t('organizations.title') }}
                </h1>
                <p class="mt-2 text-lg text-white/90">
                  {{ $t('organizations.subtitle', { count: totalItems }) }}
                </p>
              </div>
            </div>
            
            <!-- Statistiques rapides -->
            <div class="flex flex-wrap gap-6 text-white/90">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span>{{ organizations.filter(o => o.is_verified).length }} {{ $t('organizations.filters.verified') }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                <span>{{ organizationTypes.length }} {{ $t('organizations.categoriesCount') }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zM9.954 4.569c-1.01 1.265-1.654 2.92-1.769 4.43h3.63c-.115-1.51-.759-3.165-1.769-4.43-.015-.02-.03-.04-.045-.06A6.95 6.95 0 0010 4c0 .017-.001.033-.002.05a.521.521 0 00-.044.02zm.002 7.862c1.01-1.265 1.654-2.92 1.769-4.43h-3.63c.115 1.51.759 3.165 1.769 4.43.015.02.03.04.045.06 0 .169.001.338.002.507a.512.512 0 00.044-.02c.002-.017.002-.033.002-.05a6.95 6.95 0 00-.001-.497zm3.178-2.43h1.946a6.004 6.004 0 01-2.783 4.118c.454-1.147.748-2.572.837-4.118zm-.111-1h-1.946c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0113.023 9z" clip-rule="evenodd"/>
                </svg>
                <span>{{ uniqueCountriesCount }} {{ $t('organizations.countriesCount') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Carte de recherche avec design moderne -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <!-- Recherche -->
        <div class="mb-6">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="search"
              :placeholder="$t('organizations.search.placeholder')"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Filtres -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <!-- Filtre par pays -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('organizations.filters.country') }}
            </label>
            <select
              v-model="selectedCountry"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{{ $t('organizations.filters.allCountries') }}</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ country.name_fr }}
              </option>
            </select>
          </div>

          <!-- Filtre par type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('organizations.filters.type') }}
            </label>
            <select
              v-model="selectedType"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{{ $t('organizations.filters.allTypes') }}</option>
              <option v-for="type in organizationTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <!-- Filtre par statut de vérification -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('organizations.filters.verification') }}
            </label>
            <select
              v-model="selectedVerificationStatus"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{{ $t('organizations.filters.allStatuses') }}</option>
              <option value="verified">{{ $t('organizations.filters.verified') }}</option>
              <option value="unverified">{{ $t('organizations.filters.unverified') }}</option>
            </select>
          </div>

          <!-- Tri -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('organizations.filters.sortBy') }}
            </label>
            <div class="flex space-x-2">
              <select
                v-model="sortBy"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <button
                @click="toggleSortOrder"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg v-if="sortOrder === 'asc'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center">
          <button
            @click="resetFilters"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {{ $t('organizations.filters.reset') }}
          </button>

          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('organizations.results', { count: totalItems }) }}
            </span>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ $t('organizations.viewAs') }}:</span>
              <button
                @click="viewMode = 'grid'"
                :class="['p-2 rounded-md', viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300']"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="['p-2 rounded-md', viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300']"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton loaders -->
      <div v-if="loading" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse"
          >
            <div class="flex items-center mb-4">
              <div class="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des organisations -->
      <div v-else-if="organizations.length > 0">
        <!-- Vue grille -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <OrganizationCard
            v-for="organization in organizations"
            :key="organization.id"
            :organization="organization"
            @validate="handleValidateOrganization"
          />
        </div>

        <!-- Vue liste -->
        <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <OrganizationListItem
              v-for="organization in organizations"
              :key="organization.id"
              :organization="organization"
              @validate="handleValidateOrganization"
            />
          </div>
        </div>

        <!-- Infinite scroll loader -->
        <div ref="infiniteScrollTrigger" class="mt-8 p-4 text-center">
          <div v-if="isLoadingMore" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span class="ml-3 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}...</span>
          </div>
          <div v-else-if="hasMore" class="text-gray-400 dark:text-gray-500 text-sm">
            {{ $t('organizations.scrollToLoadMore') }}
          </div>
          <div v-else class="text-gray-400 dark:text-gray-500 text-sm">
            {{ $t('organizations.allLoaded', { count: organizations.length }) }}
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-else-if="!loading" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-2-5a2 2 0 100-4 2 2 0 000 4zm0 0c1.5 0 2.64.5 2.64.5s1.14-.5 2.64-.5 2.64.5 2.64.5 1.14-.5 2.64-.5"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ $t('organizations.empty.title') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('organizations.empty.description') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useOrganizations } from '@/composables/useOrganizations'
import OrganizationCard from '@/components/organization/OrganizationCard.vue'
import OrganizationListItem from '@/components/organization/OrganizationListItem.vue'

const {
  organizations,
  loading,
  isLoadingMore,
  error,
  totalItems,
  hasMore,
  searchQuery,
  selectedCountry,
  selectedType,
  selectedVerificationStatus,
  sortBy,
  sortOrder,
  organizationTypes,
  sortOptions,
  fetchOrganizations,
  fetchCountries,
  fetchUniqueCountriesFromOrganizations,
  validateOrganization,
  resetFilters,
  applyFilters
} = useOrganizations()

const countries = ref([])
const viewMode = ref('grid')
const uniqueCountriesCount = ref(0)
const infiniteScrollTrigger = ref(null)
const observer = ref(null)

const setupIntersectionObserver = () => {
  observer.value = new IntersectionObserver(
    (entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore.value && !isLoadingMore.value) {
        fetchOrganizations()
      }
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    }
  )

  if (infiniteScrollTrigger.value) {
    observer.value.observe(infiniteScrollTrigger.value)
  }
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  applyFilters()
}

async function handleValidateOrganization(organizationId) {
  try {
    await validateOrganization(organizationId)
    // Notification de succès (à implémenter avec un système de notifications)
  } catch (err) {
    console.error('Erreur lors de la validation:', err)
    // Notification d'erreur (à implémenter avec un système de notifications)
  }
}

// Watcher pour les filtres
watch(
  () => [searchQuery.value, selectedCountry.value, selectedType.value, selectedVerificationStatus.value, sortBy.value, sortOrder.value],
  async () => {
    await applyFilters()
    await nextTick()
    if (infiniteScrollTrigger.value && observer.value) {
      observer.value.disconnect()
      setupIntersectionObserver()
    }
  }
)

onMounted(async () => {
  await Promise.all([
    fetchOrganizations(true),
    fetchCountries().then(data => countries.value = data),
    fetchUniqueCountriesFromOrganizations().then(count => uniqueCountriesCount.value = count)
  ])

  await nextTick()
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>