<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header avec bannière -->
    <div class="relative h-64 md:h-80 lg:h-96 overflow-hidden">
      <img 
        src="/images/example/event_banniere_par_defaut_16_9.jpeg"
        alt="Formations bannière"
        class="w-full h-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      
      <!-- Contenu du header -->
      <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 class="text-3xl md:text-5xl font-bold text-white mb-3">
                {{ t('formations.title') }}
              </h1>
              <p class="text-lg text-white/90 mb-4">
                {{ t('formations.subtitle') }}
              </p>
              <div class="flex items-center space-x-4 text-white/80">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  {{ filteredFormations.length }} {{ t('formations.results', filteredFormations.length) }}
                </div>
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                  {{ t('formations.stats.totalParticipants') }}
                </div>
              </div>
            </div>
            
            <!-- Actions pour formateurs/admins -->
            <div v-if="canCreateFormation" class="flex items-center">
              <router-link
                to="/formations/create"
                class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-200 backdrop-blur-sm border border-green-500/30"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                {{ t('formations.create.title') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Barre de recherche et filtres -->
      <div class="mb-8">
        <!-- Section de recherche et filtres rapides -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <!-- Barre de recherche -->
          <div class="relative mb-6">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="block w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white dark:focus:bg-gray-600 transition-all"
              :placeholder="t('formations.search.placeholder')"
            >
          </div>

            <!-- Filtres -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- Catégorie -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('formations.filters.category') }}
                </label>
                <select
                  v-model="filters.category"
                  class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="">{{ t('formations.filters.allCategories') }}</option>
                  <option value="climate">{{ t('formations.categories.climate') }}</option>
                  <option value="desertification">{{ t('formations.categories.desertification') }}</option>
                  <option value="biodiversity">{{ t('formations.categories.biodiversity') }}</option>
                  <option value="other">{{ t('formations.categories.other') }}</option>
                </select>
              </div>

              <!-- Format -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('formations.filters.format') }}
                </label>
                <select
                  v-model="filters.format"
                  class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="">{{ t('formations.filters.allFormats') }}</option>
                  <option value="online">{{ t('formations.formats.online') }}</option>
                  <option value="hybrid">{{ t('formations.formats.hybrid') }}</option>
                </select>
              </div>

              <!-- Statut -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('formations.filters.status') }}
                </label>
                <select
                  v-model="filters.status"
                  class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="">{{ t('formations.filters.allStatuses') }}</option>
                  <option value="upcoming">{{ t('formations.filters.upcoming') }}</option>
                  <option value="ongoing">{{ t('formations.filters.ongoing') }}</option>
                  <option value="completed">{{ t('formations.filters.completed') }}</option>
                </select>
              </div>

              <!-- Prix -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('formations.filters.price') }}
                </label>
                <select
                  v-model="filters.price"
                  class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="">{{ t('formations.filters.allPrices') }}</option>
                  <option value="free">{{ t('formations.filters.free') }}</option>
                  <option value="paid">{{ t('formations.filters.paid') }}</option>
                </select>
              </div>

              <!-- Tri -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('formations.filters.sortBy') }}
                </label>
                <select
                  v-model="sortBy"
                  class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="newest">{{ t('formations.sort.newest') }}</option>
                  <option value="oldest">{{ t('formations.sort.oldest') }}</option>
                  <option value="startDate">{{ t('formations.sort.startDate') }}</option>
                  <option value="popularity">{{ t('formations.sort.popularity') }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Actions de filtres et vue -->
          <div class="flex items-center justify-between">
            <button
              @click="resetFilters"
              class="inline-flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ t('formations.filters.reset') }}
            </button>

            <!-- Toggle vue grille/liste -->
            <div class="flex items-center space-x-3">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('formations.view.label') }}:</span>
              <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  @click="viewMode = 'grid'"
                  :class="[
                    'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all',
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                  ]"
                >
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                  </svg>
                  {{ t('formations.view.grid') }}
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="[
                    'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all',
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                  ]"
                >
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                  </svg>
                  {{ t('formations.view.list') }}
                </button>
              </div>
            </div>
          </div>
        </div>

      <!-- Contenu principal -->
      <div v-if="loading" class="space-y-6">
        <!-- Skeleton loaders pour grille -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="group animate-pulse">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div class="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
              <div class="p-6 space-y-4">
                <div class="flex space-x-2">
                  <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                </div>
                <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div class="flex justify-between items-center">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton loaders pour liste -->
        <div v-else class="space-y-4">
          <div v-for="i in 4" :key="i" class="animate-pulse">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div class="flex space-x-6">
                <div class="w-24 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-md"></div>
                <div class="flex-1 space-y-3">
                  <div class="flex space-x-2">
                    <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                    <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  </div>
                  <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des formations -->
      <div v-else-if="filteredFormations.length > 0" class="space-y-6">
        <!-- Vue grille -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormationCard
            v-for="formation in filteredFormations"
            :key="formation.id"
            :formation="formation"
            :user-enrolled="isUserEnrolled()"
            :user-progress="getUserProgress()"
            @enroll="handleEnroll"
          />
        </div>

        <!-- Vue liste -->
        <div v-else class="space-y-4">
          <FormationListItem
            v-for="formation in filteredFormations"
            :key="formation.id"
            :formation="formation"
            :user-enrolled="isUserEnrolled()"
            :user-progress="getUserProgress()"
            @enroll="handleEnroll"
          />
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="text-center py-16">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 mx-auto mb-6 relative">
            <div class="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-full"></div>
            <svg class="w-12 h-12 text-green-600 dark:text-green-400 absolute inset-0 m-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {{ hasActiveFilters ? t('formations.empty.noResults') : t('formations.empty.noFormations') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            {{ hasActiveFilters ? t('formations.empty.tryDifferentFilters') : t('formations.empty.firstFormation') }}
          </p>
          
          <div v-if="!hasActiveFilters && canCreateFormation" class="space-y-4">
            <router-link
              to="/formations/create"
              class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-200"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              {{ t('formations.create.title') }}
            </router-link>
          </div>
          
          <div v-else-if="hasActiveFilters" class="mt-6">
            <button
              @click="resetFilters"
              class="inline-flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ t('formations.filters.reset') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useSupabase } from '@/composables/useSupabase'
import FormationCard from '@/components/formations/FormationCard.vue'
import FormationListItem from '@/components/formations/FormationListItem.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const { supabase } = useSupabase()

// État
const loading = ref(true)
const formations = ref([])
const searchQuery = ref('')
const viewMode = ref('grid')
const sortBy = ref('newest')

// Filtres
const filters = reactive({
  category: '',
  format: '',
  status: '',
  price: ''
})

// Permissions
const canCreateFormation = computed(() => {
  const profile = authStore.profile
  if (!profile || !profile.user_roles) return false
  
  const allowedRoles = ['trainer', 'admin', 'super_admin']
  const userRoles = profile.user_roles.map(roleObj => roleObj.role)
  
  return allowedRoles.some(role => userRoles.includes(role))
})

// Filtres actifs
const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         filters.category || 
         filters.format || 
         filters.status || 
         filters.price
})

// Formations filtrées
const filteredFormations = computed(() => {
  let result = [...formations.value]

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(formation => 
      formation.title.toLowerCase().includes(query) ||
      formation.description.toLowerCase().includes(query) ||
      formation.objectives.some(obj => obj.toLowerCase().includes(query)) ||
      formation.target_audience.toLowerCase().includes(query)
    )
  }

  // Filtres
  if (filters.category) {
    result = result.filter(formation => formation.category === filters.category)
  }

  if (filters.format) {
    result = result.filter(formation => formation.format === filters.format)
  }

  if (filters.status) {
    result = result.filter(formation => {
      const now = new Date()
      const startDate = new Date(formation.start_date)
      const endDate = new Date(formation.end_date)

      switch (filters.status) {
        case 'upcoming':
          return startDate > now
        case 'ongoing':
          return startDate <= now && endDate >= now
        case 'completed':
          return endDate < now
        default:
          return true
      }
    })
  }

  if (filters.price) {
    result = result.filter(formation => {
      if (filters.price === 'free') {
        return !formation.estimated_price || formation.estimated_price === 0
      } else if (filters.price === 'paid') {
        return formation.estimated_price && formation.estimated_price > 0
      }
      return true
    })
  }

  // Tri
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'startDate':
        return new Date(a.start_date) - new Date(b.start_date)
      case 'popularity':
        return (b.participants_count || 0) - (a.participants_count || 0)
      default:
        return 0
    }
  })

  return result
})

// Charger les formations
const loadFormations = async () => {
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('trainings')
      .select(`
        *,
        created_by_profile:users!created_by(
          first_name,
          last_name,
          profile_photo_url
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    formations.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des formations:', error)
  } finally {
    loading.value = false
  }
}

// Vérifier si l'utilisateur est inscrit
const isUserEnrolled = () => {
  // TODO: Implémenter la vérification d'inscription
  return false
}

// Obtenir la progression de l'utilisateur
const getUserProgress = () => {
  // TODO: Implémenter la récupération de progression
  return null
}

// Gérer l'inscription
const handleEnroll = async (formationId) => {
  try {
    if (!authStore.user) {
      // Rediriger vers la connexion
      return
    }

    // TODO: Implémenter l'inscription
    console.log('Inscription à la formation:', formationId)
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
  }
}

// Réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = ''
  filters.category = ''
  filters.format = ''
  filters.status = ''
  filters.price = ''
  sortBy.value = 'newest'
}

// Lifecycle
onMounted(() => {
  loadFormations()
})
</script>