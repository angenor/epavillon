<template>
  <section class="py-20 bg-white dark:bg-gray-800 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Contenu -->
        <div>
          <h2 class="text-4xl font-bold dark:text-gray-100 mb-4 font-maverick">
            {{ t('trainings.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {{ t('trainings.subtitle') }}
          </p>

          <!-- État de chargement -->
          <div v-if="loading" class="space-y-6 mb-8">
            <div v-for="i in 3" :key="i" class="animate-pulse">
              <div class="bg-gray-200 dark:bg-gray-700 rounded-xl p-6">
                <div class="flex items-center justify-between mb-3">
                  <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20"></div>
                  <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
                <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div class="space-y-2 mb-4">
                  <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex space-x-4">
                    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                  <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Liste des formations -->
          <div v-else-if="displayedFormations.length > 0" class="space-y-6 mb-8">
            <div 
              v-for="formation in displayedFormations" 
              :key="formation.id"
              :class="[
                'rounded-xl p-6 border transition-all duration-200',
                getFormationStatusClass(formation)
              ]"
            >
              <div class="flex items-center justify-between mb-3">
                <span :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                  getStatusBadgeClass(formation)
                ]">
                  {{ getStatusText(formation) }}
                </span>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ getFormationDateText(formation) }}
                </span>
              </div>
              
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {{ formation.title }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {{ formation.description }}
              </p>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center">
                    <font-awesome-icon :icon="['fas', 'clock']" class="w-4 h-4 mr-1" />
                    {{ formation.duration_hours || 0 }} {{ t('common.hours') }}
                  </span>
                  <span class="flex items-center">
                    <font-awesome-icon 
                      :icon="getFormatIcon(formation.format)" 
                      class="w-4 h-4 mr-1" 
                    />
                    {{ getFormatText(formation.format) }}
                  </span>
                  <span v-if="formation.participants_count" class="flex items-center">
                    <font-awesome-icon :icon="['fas', 'users']" class="w-4 h-4 mr-1" />
                    {{ formation.participants_count }} {{ t('common.participants') }}
                  </span>
                </div>
                <router-link
                  :to="`/formations/${formation.id}`"
                  :class="[
                    'font-medium transition-colors',
                    getFormationStatus(formation) === 'completed'
                      ? 'text-gray-500 dark:text-gray-400'
                      : 'text-ifdd-bleu hover:text-ifdd-bleu-dark dark:text-gray-100 dark:hover:text-ifdd-bleu'
                  ]"
                >
                  {{ getActionText(formation) }} →
                </router-link>
              </div>
            </div>
          </div>

          <!-- État vide -->
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 relative">
              <div class="absolute inset-0 bg-gradient-to-br from-ifdd-bleu/10 to-ifdd-vert/10 dark:from-ifdd-bleu/20 dark:to-ifdd-vert/20 rounded-full"></div>
              <font-awesome-icon 
                :icon="['fas', 'graduation-cap']" 
                class="w-8 h-8 text-ifdd-bleu dark:text-ifdd-bleu-light absolute inset-0 m-auto" 
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('trainings.empty.noFormations') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              {{ t('trainings.empty.firstFormation') }}
            </p>
          </div>

          <!-- Bouton voir toutes -->
          <router-link
            to="/formations"
            class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-ifdd-bleu hover:bg-ifdd-bleu-dark text-white dark:hover:bg-ifdd-bleu font-medium font-helvetica rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            {{ t('trainings.seeAllTrainings') }}
          </router-link>
        </div>

        <!-- Image -->
        <div>
          <img 
            src="/images/formation.jpg" 
            alt="Formations" 
            class="rounded-2xl shadow-xl w-full h-auto object-cover"
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const { supabase } = useSupabase()

// État
const loading = ref(true)
const formations = ref([])

// Formations affichées (limitées à 3 pour la section d'accueil)
const displayedFormations = computed(() => {
  return formations.value.slice(0, 3)
})

// Obtenir le statut d'une formation
const getFormationStatus = (formation) => {
  const now = new Date()
  const startDate = new Date(formation.start_date)
  const endDate = new Date(formation.end_date)

  if (startDate > now) return 'upcoming'
  if (startDate <= now && endDate >= now) return 'ongoing'
  return 'completed'
}

// Classes CSS pour le statut
const getFormationStatusClass = (formation) => {
  const status = getFormationStatus(formation)
  switch (status) {
    case 'ongoing':
      return 'bg-gradient-to-r from-ifdd-bleu/10 to-ifdd-bleu/20 dark:from-ifdd-bleu/20 dark:to-ifdd-bleu/30 border-ifdd-bleu/30 dark:border-ifdd-bleu/50'
    case 'upcoming':
      return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
    case 'completed':
      return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-75'
    default:
      return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
  }
}

// Classes CSS pour le badge de statut
const getStatusBadgeClass = (formation) => {
  const status = getFormationStatus(formation)
  switch (status) {
    case 'ongoing':
      return 'bg-ifdd-bleu dark:bg-ifdd-bleu-light text-white'
    case 'upcoming':
      return 'bg-ifdd-vert/20 dark:bg-ifdd-vert/30 text-ifdd-vert dark:text-ifdd-vert-light'
    case 'completed':
      return 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
    default:
      return 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
  }
}

// Texte du statut
const getStatusText = (formation) => {
  const status = getFormationStatus(formation)
  switch (status) {
    case 'ongoing':
      return t('trainings.status.ongoing')
    case 'upcoming':
      return t('trainings.status.upcoming')
    case 'completed':
      return t('trainings.status.completed')
    default:
      return ''
  }
}

// Texte de date pour la formation
const getFormationDateText = (formation) => {
  const status = getFormationStatus(formation)
  const startDate = new Date(formation.start_date)
  
  if (status === 'upcoming') {
    return `${t('common.start')}: ${startDate.toLocaleDateString()}`
  } else if (status === 'ongoing') {
    const participantsCount = formation.participants_count || 0
    return `${participantsCount} ${t('common.participants')}`
  } else {
    const endDate = new Date(formation.end_date)
    return endDate.toLocaleDateString()
  }
}

// Icône pour le format
const getFormatIcon = (format) => {
  switch (format) {
    case 'online':
      return ['fas', 'laptop']
    case 'hybrid':
      return ['fas', 'users']
    default:
      return ['fas', 'check-circle']
  }
}

// Texte du format
const getFormatText = (format) => {
  switch (format) {
    case 'online':
      return t('common.online')
    case 'hybrid':
      return t('formations.formats.hybrid')
    default:
      return t('common.certified')
  }
}

// Texte de l'action
const getActionText = (formation) => {
  const status = getFormationStatus(formation)
  switch (status) {
    case 'upcoming':
      return t('common.register')
    case 'ongoing':
      return t('common.seeMore')
    case 'completed':
      return t('common.consult')
    default:
      return t('common.seeMore')
  }
}

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
    formations.value = []
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadFormations()
})
</script>