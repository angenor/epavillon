<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-trainings">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Gestion des Formations
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        Administration des formations et parcours pédagogiques
      </p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
      
      <div v-else>
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <div class="text-sm font-medium text-blue-600 dark:text-blue-300">Formations actives</div>
              <div class="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">{{ activeTrainings }}</div>
            </div>
            <div class="bg-green-50 dark:bg-green-900 rounded-lg p-4">
              <div class="text-sm font-medium text-green-600 dark:text-green-300">Participants totaux</div>
              <div class="mt-1 text-2xl font-bold text-green-900 dark:text-green-100">{{ totalParticipants }}</div>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
              <div class="text-sm font-medium text-purple-600 dark:text-purple-300">Taux de completion</div>
              <div class="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-100">{{ completionRate }}%</div>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Formation
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Catégorie
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Format
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Participants
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Statut
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="training in trainings" :key="training.id">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <img v-if="training.banner_thumbnail_url"
                         :src="training.banner_thumbnail_url"
                         :alt="training.title"
                         class="h-12 w-12 rounded-lg object-cover">
                    <div class="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ training.title }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ formatDateRange(training.start_date, training.end_date) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ training.category }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ training.format }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ training.participant_count || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="training.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ training.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="viewTraining(training)"
                          class="text-orange-600 hover:text-orange-900 mr-4">
                    Voir
                  </button>
                  <button @click="toggleTrainingStatus(training)"
                          :class="training.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'">
                    {{ training.is_active ? 'Désactiver' : 'Activer' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const { t } = useI18n()
const router = useRouter()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()

const isLoading = ref(true)
const trainings = ref([])

// Vérification des permissions (attendre le chargement des rôles)
const checkAccess = async () => {
  await loadUserRoles()
  
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

const activeTrainings = computed(() => 
  trainings.value.filter(t => t.is_active).length
)

const totalParticipants = computed(() => 
  trainings.value.reduce((sum, t) => sum + (t.participant_count || 0), 0)
)

const completionRate = computed(() => {
  const total = trainings.value.reduce((sum, t) => sum + (t.participant_count || 0), 0)
  const completed = trainings.value.reduce((sum, t) => sum + (t.completed_count || 0), 0)
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const loadTrainings = async () => {
  try {
    // D'abord récupérer les formations de base
    const { data: trainingsData, error } = await supabase
      .from('trainings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Ensuite enrichir avec les comptages de participants
    const enrichedTrainings = await Promise.all(
      (trainingsData || []).map(async (training) => {
        // Compter tous les participants
        const { count: totalParticipants } = await supabase
          .from('training_participants')
          .select('*', { count: 'exact', head: true })
          .eq('training_id', training.id)

        // Compter les participants qui ont terminé
        const { count: completedParticipants } = await supabase
          .from('training_participants')
          .select('*', { count: 'exact', head: true })
          .eq('training_id', training.id)
          .eq('is_completed', true)

        return {
          ...training,
          participant_count: totalParticipants || 0,
          completed_count: completedParticipants || 0
        }
      })
    )

    trainings.value = enrichedTrainings
  } catch (error) {
    console.error('Erreur lors du chargement des formations:', error)
    trainings.value = []
  } finally {
    isLoading.value = false
  }
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('fr-FR')
  const end = new Date(endDate).toLocaleDateString('fr-FR')
  return `${start} - ${end}`
}

const viewTraining = (training) => {
  router.push(`/formations/${training.id}`)
}

const toggleTrainingStatus = async (training) => {
  try {
    const { error } = await supabase
      .from('trainings')
      .update({ is_active: !training.is_active })
      .eq('id', training.id)

    if (error) throw error
    training.is_active = !training.is_active
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  }
}

onMounted(async () => {
  try {
    await checkAccess()
    await loadTrainings()
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>