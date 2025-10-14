<template>
  <aside
    :class="[
      'fixed left-20 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-30 overflow-hidden',
      isOpen ? '' : 'w-0'
    ]"
    :style="isOpen ? { width: sidebarWidth + 'px', transition: isResizing ? 'none' : 'all 0.3s' } : { transition: 'all 0.3s' }"
  >
    <!-- Resize handle -->
    <div
      v-if="isOpen"
      @mousedown="startResize"
      class="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-orange-500 cursor-col-resize transition-all z-50"
      title="Redimensionner"
    ></div>
    <!-- Header -->
    <div class="sticky mt-10 top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">


      <!-- Barre de recherche -->
      <div class="mt-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher (activité, organisation, sigle)..."
            class="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
          <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2 top-2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filtres de statut et pays -->
      <div class="mt-2 grid grid-cols-2 gap-2">
        <!-- Filtre de statut -->
        <div>
          <select
            v-model="filterStatus"
            class="w-full px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Tous les statuts</option>
            <option value="submitted">Soumises</option>
            <option value="under_review">En examen</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>

        <!-- Filtre de pays -->
        <div>
          <select
            v-model="filterCountry"
            class="w-full px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Tous les pays</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">
              {{ country.name_fr }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-between mt-2">
        <!-- Compteur -->
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ filteredActivities.length }} activité{{ filteredActivities.length > 1 ? 's' : '' }}
        </div>

        <!-- Boutons de tri -->
        <div class="flex items-center gap-2">
          <!-- Bouton Réinitialiser -->
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
            title="Réinitialiser tous les filtres"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span class="font-medium">Réinitialiser</span>
          </button>

          <!-- Bouton Commentaires -->
          <button
            @click="toggleCommentsFilter"
            :class="[
              'flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors cursor-pointer',
              filterByComments
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
            :title="filterByComments ? 'Afficher toutes les activités' : 'Filtrer par commentaires non lus'"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span v-if="totalUnreadComments > 0" class="font-semibold">{{ totalUnreadComments }}</span>
          </button>

          <!-- Bouton Notés -->
          <button
            @click="toggleRatedFilter"
            :class="[
              'flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors cursor-pointer',
              filterByRating
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
            :title="filterByRating ? 'Afficher toutes les activités' : 'Filtrer par activités notées'"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span v-if="totalRatedActivities > 0" class="font-semibold">{{ totalRatedActivities }}</span>
          </button>
        </div>
      </div>
      <!-- Filtre par révisionniste -->
      <div v-if="revisionists.length > 0" class="mt-2">
        <select
          v-model="filterRevisionist"
          class="w-full px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">Voir notes de...</option>
          <option v-if="currentUser" :value="currentUser.id">Mes notes</option>
          <option v-for="revisionist in revisionists.filter(r => r.id !== currentUser?.id)" :key="revisionist.id" :value="revisionist.id">
            Notes de {{ revisionist.full_name }}
          </option>
        </select>
      </div>

    </div>

    <!-- Liste des activités avec scroll -->
    <div class="overflow-y-auto h-[calc(100vh-16rem)] p-2" id="activity-list-container">
      <div v-if="isLoading && activities.length === 0" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>

      <div v-else-if="filteredActivities.length === 0 && !isLoading" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="mt-2 text-gray-500 dark:text-gray-400">
          {{ searchQuery ? 'Aucun résultat pour votre recherche' : 'Aucune activité trouvée' }}
        </p>
        <button
          v-if="searchQuery || filterStatus || filterCountry"
          @click="clearFilters"
          class="mt-4 px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
        >
          Réinitialiser les filtres
        </button>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(activity, index) in filteredActivities"
          :key="activity.id"
          :ref="el => setActivityRef(activity.id, el)"
          @click="selectActivity(activity.id)"
          :class="[
            'relative p-3 rounded-lg cursor-pointer transition-all duration-200 border',
            String(activity.id) === String(currentActivityId)
              ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm'
          ]"
        >
          <!-- Date de soumission -->
          <!-- <div class="absolute -left-2 -top-2 bg-orange-600 text-white text-xs font-semibold rounded-lg px-2 py-1 shadow-sm">
            {{ formatDate(activity.created_at) }}
          </div> -->

          <!-- Contenu -->
          <div class="flex items-start space-x-3 mt-1">
            <!-- Logo de l'organisation avec indicateur de vue et badge de commentaires -->
            <div class="flex-shrink-0 flex flex-col items-center gap-1">
              <div class="relative">
                <img
                  v-if="activity.organization?.logo_url"
                  :src="activity.organization.logo_url"
                  :alt="activity.organization.name"
                  :class="[
                    'w-10 h-10 rounded object-contain bg-gray-100 dark:bg-gray-700 p-1',
                    hasViewedActivity(activity.id) ? 'opacity-60' : ''
                  ]"
                >
                <div
                  v-else
                  :class="[
                    'w-10 h-10 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center',
                    hasViewedActivity(activity.id) ? 'opacity-60' : ''
                  ]"
                >
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>

                <!-- Badge "vue" -->
                <div
                  v-if="hasViewedActivity(activity.id)"
                  class="absolute -top-1 -right-1 bg-blue-500 dark:bg-blue-600 rounded-full p-0.5"
                  title="Activité déjà vue"
                >
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </div>
              </div>

              <!-- Badges sous le logo -->
              <div class="flex flex-col gap-1">
                <!-- Badge de commentaires -->
                <div v-if="activity.comments_count > 0" class="flex items-center bg-red-500 text-white rounded-full px-1.5 py-0.5">
                  <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <span class="text-xs font-semibold">{{ activity.comments_count }}</span>
                </div>

                <!-- Badge de note du révisionniste sélectionné -->
                <div v-if="filterRevisionist && activity.selected_revisionist_rating" class="flex items-center bg-orange-500 text-white rounded-full px-1.5 py-0.5">
                  <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-xs font-semibold">{{ activity.selected_revisionist_rating }}</span>
                </div>
              </div>
            </div>

            <!-- Informations -->
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                {{ activity.title }}
              </h3>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                {{ activity.organization?.name || 'Organisation inconnue' }}
                <span v-if="activity.organization?.acronym" class="text-gray-500">
                  ({{ activity.organization.acronym }})
                </span>
              </p>

              <!-- Date, pays et statut sur une ligne -->
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center space-x-2">
                  <!-- Date -->
                  <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {{ formatDate(activity.created_at) }}
                  </span>

                  <!-- Pays avec drapeau -->
                  <div v-if="activity.organization?.country" class="flex items-center">
                    <span class="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <img
                      v-if="activity.organization.country.code"
                      :src="`https://flagcdn.com/w20/${activity.organization.country.code.toLowerCase()}.png`"
                      :alt="activity.organization.country.name_fr"
                      class="w-4 h-3 ml-2 mr-1 object-cover rounded-sm"
                      loading="lazy"
                    >
                    <span class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[60px]">
                      {{ activity.organization.country.name_fr }}
                    </span>
                  </div>
                </div>

                <!-- Statut -->
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0',
                    getStatusClass(activity.validation_status)
                  ]"
                >
                  {{ getStatusLabel(activity.validation_status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Indicateur d'activité courante -->
          <div
            v-if="String(activity.id) === String(currentActivityId)"
            class="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg"
          ></div>
        </div>

      </div>
    </div>

    <!-- Footer avec navigation rapide -->
    <div class="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
      <div class="flex justify-between items-center">
        <button
          @click="navigateToPrevious"
          :disabled="!canNavigatePrevious"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Activité précédente"
        >
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ currentIndex !== -1 ? currentIndex + 1 : '-' }} / {{ filteredActivities.length }}
        </span>

        <button
          @click="navigateToNext"
          :disabled="!canNavigateNext"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Activité suivante"
        >
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'
import { useAdminPanel } from '@/composables/useAdminPanel'
import { useRevisionViews } from '@/composables/useRevisionViews'
import { useCommentBroadcast } from '@/composables/useCommentBroadcast'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentActivityId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['close', 'select'])

const router = useRouter()
const { supabase } = useSupabase()
const { currentUser } = useAuth()
const { setReviewSidebarWidth } = useAdminPanel()
const { viewedActivities, loadViewedActivities, recordActivityView, hasViewedActivity } = useRevisionViews()
const { addListener, removeListener } = useCommentBroadcast()

// État
const activities = ref([])
const countries = ref([])
const revisionists = ref([])
const isLoading = ref(false)
const filterStatus = ref('')
const filterCountry = ref('')
const filterRevisionist = ref('')
const searchQuery = ref('')
const activityRefs = ref({})
const LISTENER_ID = 'activity-review-sidebar' // ID unique pour ce composant
const filterByComments = ref(false)
const filterByRating = ref(false)

// État pour le redimensionnement
const MIN_WIDTH = 320 // 80 en Tailwind = 320px
const DEFAULT_WIDTH = 320
const sidebarWidth = ref(DEFAULT_WIDTH)
const isResizing = ref(false)

// Références aux éléments DOM
const setActivityRef = (id, el) => {
  if (el) {
    // S'assurer que l'ID est une chaîne de caractères
    activityRefs.value[String(id)] = el
  }
}

// Computed
const filteredActivities = computed(() => {
  let result = [...activities.value]

  // Filtrer par statut
  if (filterStatus.value) {
    result = result.filter(a => a.validation_status === filterStatus.value)
  }

  // Filtrer par pays
  if (filterCountry.value) {
    result = result.filter(a => a.organization?.country_id === filterCountry.value)
  }

  // Filtrer par recherche (nom d'activité, organisation ou sigle)
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase().trim()
    result = result.filter(a => {
      const activityTitle = a.title?.toLowerCase() || ''
      const organizationName = a.organization?.name?.toLowerCase() || ''
      const organizationAcronym = a.organization?.acronym?.toLowerCase() || ''
      return activityTitle.includes(search) ||
             organizationName.includes(search) ||
             organizationAcronym.includes(search)
    })
  }

  // Filtrer par révisionniste
  if (filterRevisionist.value) {
    result = result.filter(a => {
      // Vérifier si le révisionniste sélectionné a noté cette activité
      return a.all_ratings?.some(rating => rating.revisionniste_id === filterRevisionist.value)
    })
    // Ajouter une propriété temporaire pour le tri
    result = result.map(activity => {
      const revisionistRating = activity.all_ratings?.find(
        rating => rating.revisionniste_id === filterRevisionist.value
      )
      return {
        ...activity,
        selected_revisionist_rating: revisionistRating?.rating || 0
      }
    })
    // Trier par note décroissante du révisionniste sélectionné
    result.sort((a, b) => (b.selected_revisionist_rating || 0) - (a.selected_revisionist_rating || 0))
  }
  // Filtrer par commentaires non lus
  else if (filterByComments.value) {
    result = result.filter(a => a.comments_count > 0)
    // Trier par date de création du plus ancien au plus récent (premiers soumis en premier)
    result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }
  // Filtrer par activités notées
  else if (filterByRating.value) {
    result = result.filter(a => a.user_rating !== null && a.user_rating !== undefined)
    // Trier par note décroissante (meilleures notes en premier)
    result.sort((a, b) => (b.user_rating || 0) - (a.user_rating || 0))
  }
  // Tri par défaut : du plus récent au plus ancien
  else {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  return result
})

const totalUnreadComments = computed(() => {
  return activities.value.reduce((sum, activity) => sum + (activity.comments_count || 0), 0)
})

const totalRatedActivities = computed(() => {
  return activities.value.filter(a => a.user_rating !== null && a.user_rating !== undefined).length
})

const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    filterStatus.value ||
    filterCountry.value ||
    filterRevisionist.value ||
    filterByComments.value ||
    filterByRating.value
  )
})

const currentIndex = computed(() => {
  return filteredActivities.value.findIndex(a => String(a.id) === String(props.currentActivityId))
})

const canNavigatePrevious = computed(() => {
  return currentIndex.value > 0
})

const canNavigateNext = computed(() => {
  return currentIndex.value < filteredActivities.value.length - 1
})

// Méthodes
const loadActivities = async () => {
  isLoading.value = true

  try {
    // Construction de la requête pour charger TOUTES les activités
    let query = supabase
      .from('activities')
      .select(`
        id,
        title,
        created_at,
        validation_status,
        organization:organizations(
          id,
          name,
          acronym,
          logo_url,
          country_id,
          country:countries(
            id,
            name_fr,
            code
          )
        )
      `)
      .order('created_at', { ascending: false })

    // Appliquer le filtre de statut si nécessaire
    if (filterStatus.value) {
      query = query.eq('validation_status', filterStatus.value)
    }

    const { data, error } = await query

    if (error) throw error

    // Charger le nombre de commentaires non lus et les notes pour chaque activité
    const activitiesWithData = await Promise.all(
      (data || []).map(async (activity) => {
        // Charger le nombre de commentaires non lus pour cet utilisateur
        const { data: unreadData } = await supabase
          .from('v_unread_comments_by_activity')
          .select('unread_count')
          .eq('activity_id', activity.id)
          .eq('revisionniste_id', currentUser.value?.id)
          .maybeSingle()

        // Charger la note donnée par l'utilisateur courant (si existe)
        const { data: ratingData } = await supabase
          .from('activity_ratings')
          .select('rating')
          .eq('activity_id', activity.id)
          .eq('revisionniste_id', currentUser.value?.id)
          .maybeSingle()

        // Charger TOUTES les notes de tous les révisionnistes pour cette activité
        const { data: allRatingsData } = await supabase
          .from('activity_ratings')
          .select('rating, revisionniste_id')
          .eq('activity_id', activity.id)

        return {
          ...activity,
          comments_count: unreadData?.unread_count || 0,
          user_rating: ratingData?.rating || null,
          all_ratings: allRatingsData || []
        }
      })
    )

    activities.value = activitiesWithData

  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error)
  } finally {
    isLoading.value = false
  }
}

const loadCountries = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name_fr, code')
      .order('name_fr', { ascending: true })

    if (error) throw error

    countries.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des pays:', error)
  }
}

const loadRevisionists = async () => {
  try {
    // Charger les utilisateurs ayant le rôle 'revisionniste' depuis la table user_roles
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        users!user_id(id, first_name, last_name, email)
      `)
      .eq('role', 'revisionniste')
      .eq('is_active', true)

    if (error) throw error

    // Supprimer les doublons et créer la liste des révisionnistes
    const uniqueRevisionists = new Map()

    data?.forEach(item => {
      if (item.users && !uniqueRevisionists.has(item.users.id)) {
        uniqueRevisionists.set(item.users.id, {
          id: item.users.id,
          full_name: `${item.users.first_name} ${item.users.last_name}`
        })
      }
    })

    // Convertir en tableau et trier par nom
    revisionists.value = Array.from(uniqueRevisionists.values()).sort((a, b) =>
      a.full_name.localeCompare(b.full_name, 'fr')
    )

    console.log('Révisionnistes chargés:', revisionists.value.length, 'révisionniste(s)')
  } catch (error) {
    console.error('Erreur lors du chargement des révisionnistes:', error)
  }
}

const selectActivity = async (activityId) => {
  // Enregistrer que le révisionniste a vu cette activité
  await recordActivityView(activityId)

  router.push(`/admin/activities/${activityId}`)
  emit('select', activityId)
}

const navigateToPrevious = () => {
  if (canNavigatePrevious.value) {
    const previousActivity = filteredActivities.value[currentIndex.value - 1]
    selectActivity(previousActivity.id)
  }
}

const navigateToNext = () => {
  if (canNavigateNext.value) {
    const nextActivity = filteredActivities.value[currentIndex.value + 1]
    selectActivity(nextActivity.id)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterCountry.value = ''
  filterRevisionist.value = ''
  filterByComments.value = false
  filterByRating.value = false
}

const toggleCommentsFilter = () => {
  filterByComments.value = !filterByComments.value
  // Désactiver les autres filtres si celui-ci est activé
  if (filterByComments.value) {
    filterByRating.value = false
    filterRevisionist.value = ''
  }
}

const toggleRatedFilter = () => {
  filterByRating.value = !filterByRating.value
  // Désactiver les autres filtres si celui-ci est activé
  if (filterByRating.value) {
    filterByComments.value = false
    // Synchroniser avec le dropdown : sélectionner "Mes notes"
    filterRevisionist.value = currentUser.value?.id || ''
  } else {
    // Réinitialiser le dropdown si on désactive le filtre
    filterRevisionist.value = ''
  }
}

// Fonction pour mettre à jour le compteur de commentaires non lus d'une activité spécifique
const updateActivityUnreadCount = async (activityId) => {
  if (!currentUser.value) return

  try {
    const { data, error } = await supabase
      .from('v_unread_comments_by_activity')
      .select('unread_count')
      .eq('activity_id', activityId)
      .eq('revisionniste_id', currentUser.value.id)
      .maybeSingle()

    if (error) throw error

    // Mettre à jour le compteur dans la liste des activités
    const activityIndex = activities.value.findIndex(a => a.id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].comments_count = data?.unread_count || 0
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur non lu:', error)
  }
}

// Subscription realtime pour les nouveaux commentaires
let realtimeSubscription = null

const subscribeToRealtimeComments = () => {
  if (!currentUser.value) return

  realtimeSubscription = supabase
    .channel('activity-sidebar-comments')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'revision_comments'
    }, async (payload) => {
      console.log('ActivityReviewSidebar - Nouveau commentaire détecté:', payload.new)

      // Si l'utilisateur est destinataire, recharger le compteur pour cette activité
      if (payload.new.shared_with_revisionists?.includes(currentUser.value.id) ||
          payload.new.created_by === currentUser.value.id) {
        await updateActivityUnreadCount(payload.new.activity_id)
      }
    })
    .subscribe()

  console.log('ActivityReviewSidebar - Subscription realtime activée')
}

// S'abonner aux changements de lecture de commentaires via le composable partagé
const subscribeToCommentReads = () => {
  if (!currentUser.value) return

  // Ajouter un listener pour recevoir les broadcasts
  addListener(LISTENER_ID, async (payload) => {
    console.log('ActivityReviewSidebar - Broadcast reçu:', payload)

    if (payload?.activity_id) {
      // Mettre à jour le compteur pour cette activité
      await updateActivityUnreadCount(payload.activity_id)
    }
  })

  console.log('ActivityReviewSidebar - Listener ajouté')
}

// Gestion du redimensionnement
const startResize = (e) => {
  isResizing.value = true
  const startX = e.clientX
  const startWidth = sidebarWidth.value

  const handleMouseMove = (e) => {
    const deltaX = e.clientX - startX
    const newWidth = Math.max(MIN_WIDTH, startWidth + deltaX)
    sidebarWidth.value = newWidth
    // Mettre à jour la largeur globale en temps réel
    setReviewSidebarWidth(newWidth)
  }

  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    // Sauvegarder la largeur dans localStorage
    localStorage.setItem('activitySidebarWidth', sidebarWidth.value.toString())
    // Mettre à jour la largeur globale une dernière fois
    setReviewSidebarWidth(sidebarWidth.value)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const scrollToCurrentActivity = () => {
  const currentId = String(props.currentActivityId)

  if (!currentId || currentId === 'undefined') {
    console.log('Pas d\'ID d\'activité courante')
    return
  }

  // Trouver l'élément dans les refs
  const element = activityRefs.value[currentId]
  const container = document.getElementById('activity-list-container')

  if (!element) {
    console.log('Element non trouvé pour l\'ID:', currentId)
    return
  }

  if (!container) {
    console.log('Container non trouvé')
    return
  }

  // Calculer les positions avec précision
  const elementTop = element.offsetTop
  const elementHeight = element.offsetHeight
  const containerHeight = container.clientHeight
  const containerScrollTop = container.scrollTop
  const containerScrollHeight = container.scrollHeight

  // Vérifier si l'élément est déjà visible
  const elementVisibleTop = elementTop - containerScrollTop
  const elementVisibleBottom = elementVisibleTop + elementHeight
  const padding = 30 // Padding pour s'assurer que l'élément est bien visible

  // Si l'élément est déjà complètement visible avec padding, ne pas scroller
  if (elementVisibleTop >= padding && elementVisibleBottom <= (containerHeight - padding)) {
    console.log('L\'élément est déjà bien visible')
    return
  }

  // Calculer la position cible pour centrer l'élément
  let targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2)

  // S'assurer de ne pas dépasser les limites
  const minScroll = 0
  const maxScroll = containerScrollHeight - containerHeight
  targetScrollTop = Math.max(minScroll, Math.min(targetScrollTop, maxScroll))

  // Pour les longues distances, utiliser une approche en deux étapes
  const scrollDistance = Math.abs(targetScrollTop - containerScrollTop)

  if (scrollDistance > containerHeight * 2) {
    // Pour les grandes distances, d'abord un scroll rapide sans animation
    console.log('Grande distance détectée, scroll en deux étapes')

    // Étape 1: Scroll instantané proche de la cible
    const intermediatePosition = targetScrollTop
    container.scrollTop = intermediatePosition

    // Étape 2: Attendre un peu puis ajuster finement avec animation
    setTimeout(() => {
      // Recalculer après le scroll instantané
      const newElementTop = element.offsetTop
      const finalTargetScrollTop = newElementTop - (containerHeight / 2) + (elementHeight / 2)
      const finalTarget = Math.max(minScroll, Math.min(finalTargetScrollTop, maxScroll))

      container.scrollTo({
        top: finalTarget,
        behavior: 'smooth'
      })
    }, 50)
  } else {
    // Pour les courtes distances, scroll smooth direct
    console.log('Scroll normal vers la position:', targetScrollTop)
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
  }

  console.log('Détails du scroll:', {
    elementTop,
    elementHeight,
    containerHeight,
    currentScrollTop: containerScrollTop,
    targetScrollTop,
    scrollDistance,
    maxScroll
  })
}

// Fonctions utilitaires
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace('.', '')
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  }
  return classes[status] || classes.draft
}

const getStatusLabel = (status) => {
  const labels = {
    draft: 'Brouillon',
    submitted: 'Soumise',
    under_review: 'En examen',
    approved: 'Approuvée',
    rejected: 'Rejetée'
  }
  return labels[status] || status
}


// Watchers
watch(() => props.currentActivityId, async (newId, oldId) => {
  console.log('Watch currentActivityId:', newId, 'old:', oldId)
  if (props.isOpen && newId) {
    await nextTick()
    scrollToCurrentActivity()
  }
})

watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await nextTick()
    scrollToCurrentActivity()
  }
})

// Watcher pour recharger quand le filtre de statut change
watch(filterStatus, async () => {
  await loadActivities()
  await nextTick()
  // Ne pas scroller automatiquement lors du filtrage
  if (props.currentActivityId && filteredActivities.value.some(a => String(a.id) === String(props.currentActivityId))) {
    scrollToCurrentActivity()
  }
})

// Watcher pour le filtre de pays
watch(filterCountry, async () => {
  await nextTick()
  // Ne pas scroller automatiquement lors du filtrage
  if (props.currentActivityId && filteredActivities.value.some(a => String(a.id) === String(props.currentActivityId))) {
    scrollToCurrentActivity()
  }
})

// Watcher pour le filtre de révisionniste
watch(filterRevisionist, async (newValue) => {
  // Désactiver les autres filtres si celui-ci est activé
  if (newValue) {
    filterByComments.value = false
    // Si l'utilisateur sélectionne "Mes notes", activer aussi le bouton "Notés"
    if (newValue === currentUser.value?.id) {
      filterByRating.value = true
    } else {
      // Si c'est un autre révisionniste, désactiver le bouton "Notés"
      filterByRating.value = false
    }
  } else {
    // Si on désélectionne le filtre, désactiver aussi le bouton "Notés"
    filterByRating.value = false
  }

  await nextTick()
  // Ne pas scroller automatiquement lors du filtrage
  if (props.currentActivityId && filteredActivities.value.some(a => String(a.id) === String(props.currentActivityId))) {
    scrollToCurrentActivity()
  }
})

// Watcher pour la recherche (avec debounce)
let searchTimeout = null
watch(searchQuery, () => {
  // Annuler le timeout précédent
  if (searchTimeout) clearTimeout(searchTimeout)

  // Attendre 300ms avant de filtrer (debounce)
  searchTimeout = setTimeout(() => {
    // Si l'activité courante est toujours dans les résultats, scroller vers elle
    if (props.currentActivityId && filteredActivities.value.some(a => String(a.id) === String(props.currentActivityId))) {
      nextTick(() => scrollToCurrentActivity())
    }
  }, 300)
})

// Lifecycle
onMounted(async () => {
  console.log('ActivityReviewSidebar mounted, currentActivityId:', props.currentActivityId)

  // Restaurer la largeur sauvegardée
  const savedWidth = localStorage.getItem('activitySidebarWidth')
  if (savedWidth) {
    sidebarWidth.value = Math.max(MIN_WIDTH, parseInt(savedWidth))
  }

  await Promise.all([
    loadActivities(),
    loadCountries(),
    loadRevisionists(),
    loadViewedActivities() // Charger les activités déjà vues par le révisionniste
  ])

  // S'abonner aux changements de lecture de commentaires
  subscribeToCommentReads()
  // S'abonner aux nouveaux commentaires en temps réel
  subscribeToRealtimeComments()

  await nextTick()
  // Scroll initial vers l'activité courante avec un délai
  if (props.currentActivityId) {
    setTimeout(() => {
      console.log('Appel initial de scrollToCurrentActivity')
      scrollToCurrentActivity()
    }, 500) // Attendre 500ms pour être sûr que tout est rendu
  }
})

onBeforeUnmount(() => {
  // Retirer le listener
  removeListener(LISTENER_ID)
  console.log('ActivityReviewSidebar - Listener retiré')

  // Nettoyer la subscription realtime
  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription)
    console.log('ActivityReviewSidebar - Subscription realtime nettoyée')
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
