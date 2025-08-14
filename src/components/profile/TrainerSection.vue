<template>
  <div class="space-y-8">
    <!-- Activités de formation -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
              <font-awesome-icon
                icon="chalkboard-teacher"
                class="w-5 h-5 text-green-600 dark:text-green-400"
              />
            </div>
            {{ t('profile.trainer.formations.title') }}
          </h3>
          <button
            @click="$emit('create-formation')"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <font-awesome-icon icon="plus" class="mr-2" />
            {{ t('profile.trainer.formations.createNew') }}
          </button>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-4">
          <font-awesome-icon icon="spinner" class="animate-spin text-gray-400" />
        </div>
        <div v-else-if="formations.length === 0" class="text-center py-8">
          <font-awesome-icon
            icon="graduation-cap"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400">
            {{ t('profile.trainer.formations.noFormations') }}
          </p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {{ t('profile.trainer.formations.createDesc') }}
          </p>
        </div>
        <div v-else>
          <!-- Statistiques -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ formations.length }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ t('profile.trainer.formations.totalFormations') }}
              </div>
            </div>
            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ totalParticipants }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ t('profile.trainer.formations.totalParticipants') }}
              </div>
            </div>
            <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {{ averageRating.toFixed(1) }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ t('profile.trainer.formations.averageRating') }}
              </div>
            </div>
            <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {{ completedFormations }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ t('profile.trainer.formations.completed') }}
              </div>
            </div>
          </div>

          <!-- Liste des formations -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 dark:text-white">
              {{ t('profile.trainer.formations.formationsList') }}
            </h4>
            <div
              v-for="formation in formations"
              :key="formation.id"
              class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h5 class="font-medium text-gray-900 dark:text-white">
                      {{ formation.title }}
                    </h5>
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        getStatusClass(formation.status)
                      ]"
                    >
                      {{ t(`profile.trainer.formations.status.${formation.status}`) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {{ formation.description }}
                  </p>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="flex items-center text-gray-500 dark:text-gray-400">
                      <font-awesome-icon icon="users" class="mr-2" />
                      {{ formation.participants_count || 0 }} {{ t('profile.trainer.formations.participants') }}
                    </div>
                    <div class="flex items-center text-gray-500 dark:text-gray-400">
                      <font-awesome-icon icon="clock" class="mr-2" />
                      {{ formation.duration_hours }}h
                    </div>
                    <div class="flex items-center text-gray-500 dark:text-gray-400">
                      <font-awesome-icon icon="calendar" class="mr-2" />
                      {{ formatDate(formation.start_date) }}
                    </div>
                    <div v-if="formation.average_rating" class="flex items-center text-gray-500 dark:text-gray-400">
                      <font-awesome-icon icon="star" class="mr-2 text-yellow-500" />
                      {{ formation.average_rating.toFixed(1) }}/5
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-2 ml-4">
                  <button
                    @click="viewFormationDetails(formation)"
                    class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2"
                    :title="t('profile.trainer.formations.viewDetails')"
                  >
                    <font-awesome-icon icon="eye" />
                  </button>
                  <button
                    @click="editFormation(formation)"
                    class="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2"
                    :title="t('profile.trainer.formations.edit')"
                  >
                    <font-awesome-icon icon="edit" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Évaluations reçues -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="star"
              class="w-5 h-5 text-yellow-600 dark:text-yellow-400"
            />
          </div>
          {{ t('profile.trainer.evaluations.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div v-if="evaluations.length === 0" class="text-center py-8">
          <font-awesome-icon
            icon="star-half-alt"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400">
            {{ t('profile.trainer.evaluations.noEvaluations') }}
          </p>
        </div>
        <div v-else class="space-y-4">
          <!-- Résumé des évaluations -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div
              v-for="(count, rating) in ratingCounts"
              :key="rating"
              class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div class="flex items-center justify-center mb-1">
                <span class="text-lg font-bold text-gray-900 dark:text-white mr-1">{{ rating }}</span>
                <font-awesome-icon icon="star" class="text-yellow-500 text-sm" />
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ count }} {{ t('profile.trainer.evaluations.evaluations') }}
              </div>
            </div>
          </div>

          <!-- Commentaires récents -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">
              {{ t('profile.trainer.evaluations.recentComments') }}
            </h4>
            <div class="space-y-3">
              <div
                v-for="evaluation in evaluations.slice(0, 5)"
                :key="evaluation.id"
                class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="flex items-center">
                      <font-awesome-icon
                        v-for="star in 5"
                        :key="star"
                        icon="star"
                        :class="[
                          'text-sm',
                          star <= evaluation.rating 
                            ? 'text-yellow-500' 
                            : 'text-gray-300 dark:text-gray-600'
                        ]"
                      />
                    </div>
                    <span class="text-sm text-gray-600 dark:text-gray-300">
                      {{ evaluation.participant_name }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(evaluation.created_at) }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  {{ evaluation.comment }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ evaluation.formation_title }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="rocket"
              class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
            />
          </div>
          {{ t('profile.trainer.quickActions.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            @click="$emit('manage-formations')"
            class="flex items-center p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
              <font-awesome-icon
                icon="cogs"
                class="w-5 h-5 text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ t('profile.trainer.quickActions.manageFormations') }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('profile.trainer.quickActions.manageFormationsDesc') }}
              </div>
            </div>
          </button>
          <button
            @click="$emit('view-analytics')"
            class="flex items-center p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
              <font-awesome-icon
                icon="chart-line"
                class="w-5 h-5 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ t('profile.trainer.quickActions.viewAnalytics') }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('profile.trainer.quickActions.viewAnalyticsDesc') }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['create-formation', 'manage-formations', 'view-analytics'])

const loading = ref(false)
const formations = ref([])
const evaluations = ref([])

// Computed
const totalParticipants = computed(() => {
  return formations.value.reduce((total, formation) => total + (formation.participants_count || 0), 0)
})

const averageRating = computed(() => {
  const ratingsWithValues = formations.value.filter(f => f.average_rating)
  if (ratingsWithValues.length === 0) return 0
  const sum = ratingsWithValues.reduce((total, formation) => total + formation.average_rating, 0)
  return sum / ratingsWithValues.length
})

const completedFormations = computed(() => {
  return formations.value.filter(f => f.status === 'completed').length
})

const ratingCounts = computed(() => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  evaluations.value.forEach(evaluation => {
    if (counts[evaluation.rating] !== undefined) {
      counts[evaluation.rating]++
    }
  })
  return counts
})

// Méthodes
const loadTrainerData = async () => {
  if (!props.userId) return
  
  loading.value = true
  try {
    const { supabase } = await import('@/composables/useSupabase')
    
    // Note: Ces requêtes sont basées sur une structure supposée de la base de données
    // Il faudra ajuster selon la structure réelle des tables de formations
    
    // Charger les formations animées par ce formateur
    // Pour l'exemple, nous simulons des données
    formations.value = [
      {
        id: '1',
        title: 'Formation négociation climatique',
        description: 'Formation avancée sur les techniques de négociation dans le contexte climatique',
        status: 'completed',
        start_date: '2024-01-15',
        duration_hours: 20,
        participants_count: 25,
        average_rating: 4.5
      },
      {
        id: '2',
        title: 'Adaptation au changement climatique',
        description: 'Stratégies d\'adaptation pour les pays en développement',
        status: 'ongoing',
        start_date: '2024-03-01',
        duration_hours: 16,
        participants_count: 18,
        average_rating: 4.2
      }
    ]

    // Charger les évaluations reçues
    evaluations.value = [
      {
        id: '1',
        rating: 5,
        comment: 'Excellente formation, très instructive et bien structurée.',
        participant_name: 'Marie Dubois',
        formation_title: 'Formation négociation climatique',
        created_at: '2024-02-10'
      },
      {
        id: '2',
        rating: 4,
        comment: 'Très bonne formation, j\'ai appris beaucoup de choses utiles.',
        participant_name: 'Jean Martin',
        formation_title: 'Formation négociation climatique',
        created_at: '2024-02-08'
      }
    ]

  } catch (error) {
    console.error('Error loading trainer data:', error)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'published': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'ongoing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  }
  return classes[status] || classes.draft
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const viewFormationDetails = (formation) => {
  // TODO: Ouvrir une modal avec les détails de la formation
  console.log('View formation details:', formation)
}

const editFormation = (formation) => {
  // TODO: Naviguer vers la page d'édition de la formation
  console.log('Edit formation:', formation)
}

// Lifecycle
onMounted(() => {
  loadTrainerData()
})
</script>