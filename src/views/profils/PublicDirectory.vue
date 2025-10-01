<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <!-- Header Héro moderne -->
    <div class="relative bg-gradient-to-r from-ifdd-vert via-ifdd-vert-dark to-ifdd-violet-dark dark:from-ifdd-vert dark:via-ifdd-vert-dark dark:to-ifdd-violet-dark overflow-hidden">
      <!-- Pattern décoratif en arrière-plan -->
      <div class="absolute inset-0 bg-black bg-opacity-10 dark:bg-black dark:bg-opacity-20">
        <svg class="absolute bottom-0 left-0 right-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
          <path class="fill-white/20 dark:fill-white/10" d="M0,0L48,10.7C96,21,192,43,288,48C384,53,480,43,576,37.3C672,32,768,32,864,42.7C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
        </svg>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">

          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {{ $t('directory.title') }}
          </h1>

          <p class="max-w-3xl mx-auto text-xl md:text-2xl text-white text-opacity-90 leading-relaxed">
            {{ $t('directory.subtitle') }}
          </p>

          <!-- Statistiques -->
          <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white">{{ communityStats.totalUsers }}+</div>
              <div class="text-lg text-white text-opacity-80 mt-1">Membres actifs</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white">Plusieurs</div>
              <div class="text-lg text-white text-opacity-80 mt-1">Pays représentés</div>
            </div>
            <router-link
              to="/organizations"
              class="text-center block hover:bg-white/10 rounded-lg p-4 transition-colors duration-200 cursor-pointer"
            >
              <div class="text-3xl md:text-4xl font-bold text-white">{{ communityStats.organizationsCount }}+</div>
              <div class="text-lg text-white text-opacity-80 mt-1">Organisations</div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Section principale avec espacement moderne -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="lg:grid lg:grid-cols-4 lg:gap-10">
        <!-- Filtres avec style premium -->
        <div class="lg:col-span-1">
          <div class="sticky top-8">
            <PublicFilters
              v-model:search="filters.search"
              v-model:organization="filters.organization"
              v-model:country="filters.country"
              v-model:expertise="filters.expertise"
              @filter-change="handleFilterChange"
            />
          </div>
        </div>

        <!-- Liste des profils avec style amélioré -->
        <div class="lg:col-span-3 mt-10 lg:mt-0">
          <!-- Barre de résultats moderne -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div class="flex items-center space-x-3">
                <div class="flex items-center justify-center w-10 h-10 bg-ifdd-vert-light/20 dark:bg-ifdd-vert-dark/20 rounded-lg">
                  <svg class="w-5 h-5 text-ifdd-vert dark:text-ifdd-vert-light" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ $t('directory.results_count', { count: totalResults }) }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Membres du réseau</p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <!-- Toggle grille/liste avec design premium -->
                <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-inner">
                  <button
                    @click="viewMode = 'grid'"
                    :class="[
                      'relative p-2 rounded-md transition-all duration-200 transform cursor-pointer',
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-ifdd-vert dark:text-ifdd-vert-light shadow-md scale-105'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:scale-105'
                    ]"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    @click="viewMode = 'list'"
                    :class="[
                      'relative p-2 rounded-md transition-all duration-200 transform cursor-pointer',
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-ifdd-vert dark:text-ifdd-vert-light shadow-md scale-105'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:scale-105'
                    ]"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- État de chargement premium -->
          <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-ifdd-vert-light/20 to-ifdd-vert/20 dark:from-ifdd-vert-dark/20 dark:to-ifdd-violet-dark/20 rounded-full mb-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-ifdd-vert"></div>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ $t('common.loading') }}</h3>
              <p class="text-gray-500 dark:text-gray-400">Chargement des profils...</p>
            </div>
          </div>

          <!-- Aucun résultat avec design premium -->
          <div v-else-if="displayedProfiles.length === 0 && !isLoadingMore" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full mb-6">
                <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">{{ $t('directory.no_results') }}</h3>
              <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">{{ $t('directory.no_results_message') }}</p>
              <button
                @click="resetFilters"
                class="mt-6 inline-flex items-center px-6 py-3 bg-ifdd-vert hover:bg-ifdd-vert-dark text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Réinitialiser les filtres
              </button>
            </div>
          </div>

          <!-- Grille des profils avec animations -->
          <div v-else>
            <div
              :class="[
                'grid gap-6 transition-all duration-300',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              ]"
            >
              <div
                v-for="(profile, index) in displayedProfiles"
                :key="profile.id"
                :style="{ animationDelay: `${index * 50}ms` }"
                class="animate-fade-in-up"
              >
                <PublicUserCard
                  :profile="profile"
                  :view-mode="viewMode"
                  @connection-request="handleConnectionRequest"
                />
              </div>
            </div>

            <!-- Infinite scroll loader -->
            <div ref="infiniteScrollTrigger" class="mt-8 p-6 text-center">
              <div v-if="isLoadingMore" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-ifdd-vert"></div>
                <span class="ml-3 text-gray-500 dark:text-gray-400">Chargement...</span>
              </div>
              <div v-else-if="hasMore" class="text-gray-400 dark:text-gray-500 text-sm">
                Faites défiler pour charger plus de profils
              </div>
              <div v-else class="text-gray-400 dark:text-gray-500 text-sm">
                Tous les profils ont été chargés ({{ displayedProfiles.length }} au total)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PublicUserCard from '@/components/profils/PublicUserCard.vue'
import PublicFilters from '@/components/profils/PublicFilters.vue'
import { usePublicProfiles } from '@/composables/usePublicProfiles'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()

// État local
const viewMode = ref('grid')
const isLoading = ref(true)
const isLoadingMore = ref(false)
const displayedProfiles = ref([])
const currentPage = ref(0)
const pageSize = 20
const hasMore = ref(true)
const infiniteScrollTrigger = ref(null)
const observer = ref(null)

// Filtres
const filters = ref({
  search: route.query.search || '',
  organization: route.query.organization || '',
  country: route.query.country || '',
  expertise: route.query.expertise || ''
})

// Composable pour récupérer les données
const {
  totalResults,
  getCommunityStats
} = usePublicProfiles()

// Statistiques des profils
const communityStats = ref({
  totalUsers: 0,
  countriesCount: 0,
  organizationsCount: 0,
  activitiesCount: 0
})

// Méthodes
const loadProfiles = async (reset = false) => {
  if (reset) {
    currentPage.value = 0
    displayedProfiles.value = []
    hasMore.value = true
  }

  if (!hasMore.value || isLoadingMore.value) return

  try {
    if (reset) {
      isLoading.value = true
    } else {
      isLoadingMore.value = true
    }

    // Construction de la requête de base
    let query = supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        biography,
        profile_photo_url,
        profile_photo_thumbnail_url,
        address,
        networking_visibility,
        created_at,
        country_id,
        organization_id
      `, { count: 'exact' })
      .eq('is_blocked', false)
      .eq('is_suspended', false)
      .order('created_at', { ascending: false })
      .range(currentPage.value * pageSize, (currentPage.value + 1) * pageSize - 1)

    // Appliquer les filtres de recherche
    if (filters.value.search) {
      const search = `%${filters.value.search}%`
      query = query.or(`first_name.ilike.${search},last_name.ilike.${search}`)
    }

    if (filters.value.organization) {
      query = query.eq('organization_id', filters.value.organization)
    }

    if (filters.value.country) {
      query = query.eq('country_id', filters.value.country)
    }

    const { data: profilesData, error: profilesError, count } = await query

    if (profilesError) throw profilesError

    // Enrichir les données avec organisations, pays et rôles
    const enrichedProfiles = await Promise.all(
      (profilesData || []).map(async (profile) => {
        // Récupérer l'organisation si elle existe
        let organization = null
        if (profile.organization_id) {
          try {
            const { data: orgData } = await supabase
              .from('organizations')
              .select('id, name, is_verified')
              .eq('id', profile.organization_id)
              .single()
            organization = orgData
          } catch (orgError) {
            console.warn('Erreur organisation:', orgError)
          }
        }

        // Récupérer le pays si existe
        let country = null
        if (profile.country_id) {
          try {
            const { data: countryData } = await supabase
              .from('countries')
              .select('id, name_fr, name_en')
              .eq('id', profile.country_id)
              .single()
            country = countryData
          } catch (countryError) {
            console.warn('Erreur pays:', countryError)
          }
        }

        // Récupérer les rôles
        let roles = []
        try {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role, is_active')
            .eq('user_id', profile.id)
            .eq('is_active', true)

          roles = rolesData?.map(r => r.role) || []
        } catch (roleError) {
          console.warn('Erreur rôles:', roleError)
        }

        // Récupérer les statistiques d'activités
        let activities_count = 0
        try {
          const { count: activitiesCount } = await supabase
            .from('activities')
            .select('id', { count: 'exact', head: true })
            .eq('submitted_by', profile.id)
            .eq('validation_status', 'approved')
            .eq('is_deleted', false)

          activities_count = activitiesCount || 0
        } catch (activitiesError) {
          console.warn('Erreur activités:', activitiesError)
        }

        // Filtrer par expertise si spécifié
        if (filters.value.expertise) {
          const hasMatchingExpertise =
            (filters.value.expertise === 'negotiator' && roles.includes('negotiator')) ||
            (filters.value.expertise === 'trainer' && roles.includes('trainer')) ||
            (filters.value.expertise === 'sustainable_development' && roles.includes('standard'))

          if (!hasMatchingExpertise) {
            return null
          }
        }

        return {
          ...profile,
          organization,
          country,
          roles,
          stats: {
            member_since: new Date(profile.created_at).getFullYear(),
            activities_count
          }
        }
      })
    )

    // Filtrer les profils null
    const filteredProfiles = enrichedProfiles.filter(profile => profile !== null)

    displayedProfiles.value = [...displayedProfiles.value, ...filteredProfiles]
    currentPage.value++

    // Vérifier s'il y a plus de profils à charger
    hasMore.value = profilesData.length === pageSize

    // Mettre à jour totalResults seulement lors du premier chargement
    if (reset && count !== null) {
      totalResults.value = count
    }

  } catch (error) {
    console.error('Erreur lors du chargement des profils:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const setupIntersectionObserver = () => {
  observer.value = new IntersectionObserver(
    (entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore.value && !isLoadingMore.value) {
        loadProfiles()
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

const handleFilterChange = async () => {
  await loadProfiles(true)
  await nextTick()
  if (infiniteScrollTrigger.value && observer.value) {
    observer.value.observe(infiniteScrollTrigger.value)
  }
}

const handleConnectionRequest = (profileId) => {
  // Gérer la demande de connexion
  console.log('Demande de connexion pour:', profileId)
}

const resetFilters = async () => {
  filters.value = {
    search: '',
    organization: '',
    country: '',
    expertise: ''
  }
  await loadProfiles(true)
  await nextTick()
  if (infiniteScrollTrigger.value && observer.value) {
    observer.value.observe(infiniteScrollTrigger.value)
  }
}

const loadCommunityStats = async () => {
  try {
    const stats = await getCommunityStats()
    communityStats.value = stats
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

// Watchers
watch(() => filters.value, async () => {
  await handleFilterChange()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await loadProfiles(true)
  await loadCommunityStats()

  // Attendre que le DOM soit mis à jour
  await nextTick()

  // Configurer l'infinite scroll
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<style scoped>
/* Animations premium */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
  opacity: 0;
}

/* Styles pour les gradients et effets visuels */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

/* Effets de hover avancés */
.transform {
  transform: translateZ(0);
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.scale-110 {
  transform: scale(1.1);
}

/* Support pour les backdrop-blur */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Amélioration des transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-200 {
  transition-duration: 200ms;
}

.duration-300 {
  transition-duration: 300ms;
}

/* Styles pour les éléments premium */
.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Responsive design amélioré */
@media (max-width: 640px) {
  .text-4xl {
    font-size: 2.5rem;
  }

  .text-5xl {
    font-size: 3rem;
  }

  .text-6xl {
    font-size: 3.5rem;
  }
}
</style>
