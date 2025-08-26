<template>
  <div class="admin-activity-detail">
    <div v-if="isLoadingRoles || isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Chargement...</p>
      </div>
    </div>
    
    <div v-else-if="activity" class="space-y-6">
      <!-- Header avec actions -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ activity.title }}
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              {{ activity.organization?.name }} - {{ activity.event?.title }}
            </p>
          </div>
          <div class="flex space-x-3">
            <span :class="getStatusClass(activity.validation_status)"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
              {{ getStatusText(activity.validation_status) }}
            </span>
          </div>
        </div>
        
        <div v-if="['submitted', 'under_review'].includes(activity.validation_status)" 
             class="mt-6 flex space-x-3">
          <button @click="approveActivity"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Approuver
          </button>
          <button @click="rejectActivity"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Rejeter
          </button>
        </div>
      </div>

      <!-- Détails de l'activité -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Informations principales -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Description détaillée</h2>
            <div class="prose dark:prose-invert max-w-none" v-html="activity.detailed_presentation"></div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Objectifs</h2>
            <div class="prose dark:prose-invert max-w-none" v-html="activity.objectives"></div>
          </div>
        </div>

        <!-- Sidebar avec métadonnées -->
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Informations</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ activity.activity_type }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Format</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ activity.format }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Date proposée</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ formatDate(activity.proposed_start_date) }} - {{ formatDate(activity.proposed_end_date) }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Soumis le</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ formatDate(activity.created_at) }}
                </dd>
              </div>
            </dl>
          </div>

          <div v-if="activity.main_themes?.length" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Thématiques</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="theme in activity.main_themes" :key="theme"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {{ theme }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Activité non trouvée</p>
    </div>

    <!-- Modal de validation -->
    <div v-if="showValidationModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <div class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full mx-4 z-10">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              {{ validationAction === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet' }}
            </h3>
            
            <!-- Message d'erreur -->
            <div v-if="validationError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {{ validationError }}
            </div>
            
            <textarea v-if="validationAction === 'reject'"
                     v-model="validationReason"
                     placeholder="Raison du rejet..."
                     rows="3"
                     :disabled="isValidating"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
            </textarea>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="confirmValidation"
                    :disabled="isValidating"
                    :class="[
                      'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed',
                      validationAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    ]">
              <div v-if="isValidating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ isValidating ? 'En cours...' : (validationAction === 'approve' ? 'Approuver' : 'Rejeter') }}
            </button>
            <button @click="closeModal"
                    :disabled="isValidating"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles, validateActivity } = useAdmin()
const { currentUser } = useAuth()

const isLoading = ref(true)
const activity = ref(null)
const showValidationModal = ref(false)
const validationAction = ref(null)
const validationReason = ref('')
const isValidating = ref(false)
const validationError = ref(null)

const checkAccess = async () => {
  await loadUserRoles()
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

const loadActivity = async () => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        organization:organizations(id, name),
        event:events(id, title, year)
      `)
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    activity.value = data
  } catch (error) {
    console.error('Erreur lors du chargement de l\'activité:', error)
  } finally {
    isLoading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return classes[status] || classes.draft
}

const getStatusText = (status) => {
  const texts = {
    draft: 'Brouillon',
    submitted: 'Soumise',
    under_review: 'En examen',
    approved: 'Approuvée',
    rejected: 'Rejetée'
  }
  return texts[status] || texts.draft
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const approveActivity = () => {
  validationAction.value = 'approve'
  showValidationModal.value = true
}

const rejectActivity = () => {
  validationAction.value = 'reject'
  validationReason.value = ''
  showValidationModal.value = true
}

const confirmValidation = async () => {
  if (!currentUser.value) return

  isValidating.value = true
  validationError.value = null

  try {
    const status = validationAction.value === 'approve' ? 'approved' : 'rejected'
    const result = await validateActivity(
      activity.value.id,
      status,
      currentUser.value.id,
      validationReason.value || null
    )

    if (result.success) {
      activity.value.validation_status = status
      closeModal()
      // Optionnellement, afficher un message de succès
      console.log(`Activité ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès`)
    } else {
      validationError.value = result.error?.message || 'Erreur lors de la validation'
    }
  } catch (error) {
    console.error('Erreur lors de la validation:', error)
    validationError.value = error.message || 'Une erreur inattendue s\'est produite'
  } finally {
    isValidating.value = false
  }
}

const closeModal = () => {
  showValidationModal.value = false
  validationAction.value = null
  validationReason.value = ''
  validationError.value = null
}

onMounted(async () => {
  try {
    await checkAccess()
    await loadActivity()
  } catch (error) {
    if (error.message === 'Accès non autorisé') {
      throw error
    }
    console.error('Erreur lors de l\'initialisation:', error)
  }
})
</script>