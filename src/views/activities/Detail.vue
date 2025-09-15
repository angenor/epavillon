<template>
  <div class="min-h-screen relative transition-colors duration-200">
    <!-- Logo de l'événement parent -->
    <div v-if="event?.logo_url" class="absolute right-2 sm:right-5 top-2 sm:top-5 h-12 w-12 sm:h-16 md:h-20 sm:w-16 md:w-20 z-10 rounded-full shadow-xl overflow-hidden bg-white">
      <img :src="event.logo_url" :alt="event.title" class="w-full h-full object-cover">
    </div>
    <!-- Image de fond avec repeat -->
    <div 
      class="absolute inset-0 z-0 dark:opacity-20"
      :style="{
        backgroundImage: 'url(/images/people-bg/people-bg-2.jpg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left'
      }"
    >
    </div>
    
    <!-- Hero Section avec effet parallaxe -->
    <div class="relative h-[40vh] sm:h-[50vh] min-h-[250px] sm:min-h-[300px] overflow-hidden">
      <!-- Image de couverture de l'événement parent -->
      <div class="absolute inset-0">
        <img 
          :src="getBannerUrl()" 
          :alt="activity?.title || 'Activity banner'"
          class="w-full h-full object-cover scale-105 animate-subtle-zoom"
          loading="eager"
        >
        <!-- Overlay avec gradient complexe -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-transparent"></div>
      </div>
      
      <!-- Contenu Hero -->
      <div class="relative h-full flex flex-col justify-end">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16">
          <!-- Badges flottants -->
          <div class="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span v-if="activity?.activity_status" class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium animate-fade-in-up">
              <span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              {{ t(`activity.status.${activity.activity_status}`) }}
            </span>
            
            <span v-if="activity?.format" class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium animate-fade-in-up animation-delay-100">
              <div class="flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'globe']" class="w-4 h-4" />
                <span>{{ t(`activity.format.${activity.format}`) }}</span>
              </div>
            </span>

            <button 
              v-if="canRegister"
              @click="registerToActivity"
              class="backdrop-blur-md bg-orange-500/80 border border-orange-400/50 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold animate-fade-in-up animation-delay-300 hover:bg-orange-600/90 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'user-plus']" class="mr-2" />
              {{ t('activity.register') }}
            </button>
          </div>

          <!-- Titre avec animation -->
          <h1 class="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 animate-fade-in-up animation-delay-400 line-clamp-3">
            {{ activity?.title || '' }}
          </h1>

          <!-- Informations rapides -->
          <div class="flex flex-wrap items-center font-semibold sm:font-bold text-sm sm:text-base md:text-lg gap-3 sm:gap-4 md:gap-6 text-white/90 animate-fade-in-up animation-delay-500">
            <div v-if="activityCountry" class="flex items-center gap-1 sm:gap-2">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{{ event?.city }}<span v-if="activityCountry">, {{ activityCountry.name_fr }}</span></span>
            </div>

            <div v-if="activity?.proposed_start_date" class="flex items-center gap-1 sm:gap-2">
              <font-awesome-icon :icon="['fas', 'calendar']" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{{ formatDate(activity.proposed_start_date) }}</span>
            </div>
            
            <div v-if="organization" class="flex items-center gap-1 sm:gap-2">
              <font-awesome-icon :icon="['fas', 'building']" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{{ organization.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative -mt-6 sm:-mt-8 md:-mt-10 mb-10">
      <div class="w-full lg:max-w-3xl bg-white dark:bg-gray-800 rounded-xl h-min pb-10 shadow-xl">
        <!-- Affiche/Poster de l'activité -->
        <div 
          class="h-64 sm:h-80 md:h-96 rounded-xl shadow-md relative overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20"
        >
          <img 
            :src="activity?.cover_image_high_url || activity?.cover_image_low_url || '/images/example/poster-default.png'"
            :alt="activity?.title || 'Activity poster'"
            class="w-full h-full object-cover"
            loading="lazy"
          >
        </div>
        <div class="p-4 sm:p-6 md:p-8">
          
          <!-- Objectifs -->
          <div v-if="activity?.objectives" class="mb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center text-xl uppercase">
              <font-awesome-icon :icon="['fas', 'bullseye']" class="mr-2 text-blue-800" />
              {{ t('activity.objectives') }}
            </h3>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ activity.objectives }}</p>
          </div>
          
          <!-- Présentation détaillée -->
          <div v-if="activity?.detailed_presentation" class="mb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center  text-xl uppercase">
              <font-awesome-icon :icon="['fas', 'file-alt']" class="mr-2 text-blue-800" />
              {{ t('activity.presentation') }}
            </h3>
            <div>
              <div class="relative">
                <div 
                  ref="descriptionContainer"
                  class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                  :class="{
                    'max-h-[300px] overflow-hidden': !isDescriptionExpanded && shouldShowToggleButton,
                    'description-fade': !isDescriptionExpanded && shouldShowToggleButton
                  }"
                  v-html="activity.detailed_presentation"
                ></div>
              </div>
              <!-- Bouton Voir plus/moins si la description est trop longue -->
              <div v-if="shouldShowToggleButton" class="mt-3 relative z-10 cursor-pointer">
                <button 
                  @click="toggleDescription"
                  class="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  <font-awesome-icon 
                    :icon="['fas', isDescriptionExpanded ? 'chevron-up' : 'chevron-down']" 
                    class="mr-2 text-xs" 
                  />
                  {{ isDescriptionExpanded ? t('activity.showLess') : t('activity.showMore') }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Documents si disponibles -->
          <div v-if="documents && documents.length > 0" class="mt-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <font-awesome-icon :icon="['fas', 'folder-open']" class="mr-2 text-orange-600" />
              {{ t('activity.documents') }}
            </h3>
            <div class="space-y-2">
              <a 
                v-for="doc in documents" 
                :key="doc.id"
                :href="doc.file_url"
                target="_blank"
                class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'download']" class="text-gray-500" />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ doc.title }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full lg:w-96 h-min bg-white/0 dark:bg-gray-800/10 backdrop-blur-xl shadow-xl rounded-b-xl overflow-hidden">
        <div class="w-full h-2 bg-gradient-to-r from-blue-700 to-blue-800"></div>
          <div class="p-4 sm:p-6">
            <!-- Thèmes -->
            <h2 class="text-base sm:text-lg font-semibold text-center mb-3 text-gray-900 dark:text-white flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'tags']" class="mr-2 text-blue-700" />
              {{ t('activity.themes') }}
            </h2>
            <div class="flex flex-wrap justify-center gap-2 mb-6">
              <div 
                v-for="theme in activity?.main_themes || []" 
                :key="theme"
                class="border border-green-700 dark:border-green-500 px-3 py-1 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                {{ t(`activity.theme.${theme}`) }}
              </div>
              <div v-if="!activity?.main_themes || activity.main_themes.length === 0" class="text-gray-500 dark:text-gray-400 text-sm italic">
                {{ t('common.noData') }}
              </div>
            </div>

            <!-- Catégories -->
            <h2 class="text-base sm:text-lg font-semibold text-center mb-3 text-gray-900 dark:text-white flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'layer-group']" class="mr-2 text-blue-700" />
              {{ t('activity.categories') }}
            </h2>
            <div class="flex flex-wrap justify-center gap-2 mb-6">
              <div 
                v-for="category in activity?.categories || []" 
                :key="category"
                class="border border-blue-700 dark:border-blue-500 px-3 py-1 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                {{ t(`activity.category.${category}`) }}
              </div>
              <div v-if="!activity?.categories || activity.categories.length === 0" class="text-gray-500 dark:text-gray-400 text-sm italic">
                {{ t('common.noData') }}
              </div>
            </div>

            <!-- Panélistes/Intervenants -->
            <h2 class="text-base sm:text-lg font-semibold mt-4 text-center text-gray-900 dark:text-white flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'users']" class="mr-2 text-blue-700" />
              {{ t('activity.speakers') }}
            </h2>
            <div class="flex flex-wrap gap-3 justify-center mt-4">
              <div 
                v-for="speaker in speakers" 
                :key="speaker.id"
                class="flex flex-col justify-center items-center group cursor-pointer"
              >
                <div class="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-amber-200 to-orange-300 shadow-md rounded-full flex items-center justify-center text-gray-700 font-bold text-lg group-hover:scale-110 transition-transform">
                  {{ getInitials(speaker) }}
                </div>
                <div class="text-xs sm:text-sm w-32 sm:w-40 text-center mt-2">
                  <div class="font-bold text-gray-900 dark:text-white line-clamp-2">
                    {{ speaker.civility }} {{ speaker.first_name }} {{ speaker.last_name }}
                  </div>
                  <div class="text-xs italic font-normal text-gray-600 dark:text-gray-400 mt-1">{{ speaker.position }}</div>
                  <div v-if="speaker.organization" class="text-xs text-gray-500 dark:text-gray-500">{{ speaker.organization }}</div>
                </div>
              </div>
              
              <div v-if="!speakers || speakers.length === 0" class="text-gray-500 dark:text-gray-400 text-sm italic w-full text-center py-4">
                {{ t('activity.noSpeakers') }}
              </div>
            </div>
            
            <!-- Bouton poser une question -->
            <button 
              v-if="speakers && speakers.length > 0 && canAskQuestions"
              @click="openQuestionModal"
              class="mt-6 w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white py-2 px-4 rounded-full shadow-md transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <font-awesome-icon :icon="['fas', 'question-circle']" />
              {{ t('activity.askQuestion') }}
            </button>
          </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const route = useRoute()
const supabase = useSupabase()
const authStore = useAuthStore()

// État
const activity = ref(null)
const event = ref(null)
const organization = ref(null)
const speakers = ref([])
const documents = ref([])
const activityCountry = ref(null)
const isRegistered = ref(false)
const loading = ref(true)
const isDescriptionExpanded = ref(false)
const descriptionContainer = ref(null)
const shouldShowToggleButton = ref(false)

// Computed
const canRegister = computed(() => {
  if (!authStore.user) return false
  if (isRegistered.value) return false
  if (!activity.value) return false
  
  // Vérifier si l'activité n'est pas passée
  const now = new Date()
  const endDate = activity.value.final_end_date || activity.value.proposed_end_date
  if (endDate && new Date(endDate) < now) return false
  
  return activity.value.validation_status === 'approved'
})

const canAskQuestions = computed(() => {
  if (!authStore.user) return false
  if (!activity.value) return false
  if (!speakers.value || speakers.value.length === 0) return false
  
  // Vérifier si au moins un intervenant accepte les questions
  return speakers.value.some(s => s.is_available_for_questions)
})

// Fonction pour vérifier si le contenu dépasse 300px de hauteur
const checkContentHeight = async () => {
  if (!descriptionContainer.value || !activity.value?.detailed_presentation) {
    shouldShowToggleButton.value = false
    return
  }
  
  await nextTick()
  
  // Créer un élément temporaire pour mesurer la hauteur complète
  const tempElement = document.createElement('div')
  tempElement.innerHTML = activity.value.detailed_presentation
  tempElement.style.cssText = `
    position: absolute;
    visibility: hidden;
    width: ${descriptionContainer.value.offsetWidth}px;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    white-space: pre-wrap;
  `
  
  document.body.appendChild(tempElement)
  const fullHeight = tempElement.offsetHeight
  document.body.removeChild(tempElement)
  
  shouldShowToggleButton.value = fullHeight > 300
}

// Fonction pour basculer l'affichage de la description
const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value
}

// Méthodes
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(t('common.locale'), {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getInitials = (speaker) => {
  if (!speaker) return '?'
  const firstInitial = speaker.first_name ? speaker.first_name[0].toUpperCase() : ''
  const lastInitial = speaker.last_name ? speaker.last_name[0].toUpperCase() : ''
  return firstInitial + lastInitial || '?'
}

const getBannerUrl = () => {
  // Priorité : bannière de l'événement parent
  if (event.value?.banner_high_quality_32_9_url) return event.value.banner_high_quality_32_9_url
  if (event.value?.banner_low_quality_32_9_url) return event.value.banner_low_quality_32_9_url
  
  // Sinon bannière de l'activité
  if (activity.value?.banner_url) return activity.value.banner_url
  
  // Par défaut
  return '/images/example/event_banniere_par_defaut_32_9.jpg'
}

const loadActivity = async () => {
  try {
    loading.value = true
    
    // Charger l'activité avec toutes les relations (seulement si approuvée)
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select(`
        *,
        events!inner (
          id,
          title,
          year,
          city,
          country_id,
          logo_url,
          banner_high_quality_32_9_url,
          banner_low_quality_32_9_url
        ),
        organizations!inner (
          id,
          name,
          logo_url
        ),
        countries (
          id,
          name_fr,
          name_en
        )
      `)
      .eq('id', route.params.id)
      .eq('validation_status', 'approved')
      .single()

    if (activityError) throw activityError
    
    activity.value = activityData
    
    // Extraire les relations
    if (activityData.events) {
      event.value = activityData.events
    }
    
    if (activityData.organizations) {
      organization.value = activityData.organizations
    }
    
    if (activityData.countries) {
      activityCountry.value = activityData.countries
    }
    
    // Charger les intervenants
    const { data: speakersData, error: speakersError } = await supabase
      .from('activity_speakers')
      .select('*')
      .eq('activity_id', route.params.id)
      .order('created_at')
    
    if (!speakersError && speakersData) {
      speakers.value = speakersData
    }
    
    // Charger les documents
    const { data: docsData, error: docsError } = await supabase
      .from('activity_documents')
      .select('*')
      .eq('activity_id', route.params.id)
      .order('uploaded_at')
    
    if (!docsError && docsData) {
      documents.value = docsData
    }
    
    // Vérifier si l'utilisateur est inscrit
    if (authStore.user) {
      const { data: regData } = await supabase
        .from('activity_registrations')
        .select('id')
        .eq('activity_id', route.params.id)
        .eq('user_id', authStore.user.id)
        .single()
      
      isRegistered.value = !!regData
    }
    
    // Vérifier la hauteur du contenu après le chargement
    await checkContentHeight()
    
  } catch (error) {
    console.error('Error loading activity:', error)
  } finally {
    loading.value = false
  }
}

const registerToActivity = async () => {
  if (!authStore.user || !activity.value) return
  
  try {
    const { error } = await supabase
      .from('activity_registrations')
      .insert({
        activity_id: activity.value.id,
        user_id: authStore.user.id
      })
    
    if (error) throw error
    
    isRegistered.value = true
    // Afficher un message de succès
  } catch (error) {
    console.error('Error registering to activity:', error)
    // Afficher un message d'erreur
  }
}

const openQuestionModal = () => {
  // Implémenter l'ouverture du modal de questions
  console.log('Opening question modal')
}

// Lifecycle
onMounted(() => {
  loadActivity()
})
</script>

<style scoped>
@keyframes subtle-zoom {
  0%, 100% { transform: scale(1.05); }
  50% { transform: scale(1.08); }
}

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

.animate-subtle-zoom {
  animation: subtle-zoom 20s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animation-delay-100 {
  animation-delay: 100ms;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

.animation-delay-500 {
  animation-delay: 500ms;
}

/* Style pour l'effet de fade sur la description tronquée */
.description-fade::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, transparent, rgb(255 255 255 / 1));
  pointer-events: none;
}

.dark .description-fade::after {
  background: linear-gradient(to bottom, transparent, rgb(31 41 55 / 1));
}
</style>