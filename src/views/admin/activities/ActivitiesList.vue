<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-activities">
    <!-- Header avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.activities.title') }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          {{ t('admin.activities.subtitle') }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <button @click="exportActivities" 
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
          <svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          {{ t('admin.activities.export') }}
        </button>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('admin.activities.stats.pending') }}
        </div>
        <div class="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
          {{ stats.pending }}
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('admin.activities.stats.approved') }}
        </div>
        <div class="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
          {{ stats.approved }}
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('admin.activities.stats.rejected') }}
        </div>
        <div class="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
          {{ stats.rejected }}
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('admin.activities.stats.total') }}
        </div>
        <div class="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ stats.total }}
        </div>
      </div>
    </div>

    <!-- Onglets de filtrage -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          <button v-for="tab in tabs" :key="tab.key"
                  @click="activeTab = tab.key"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === tab.key
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  ]">
            {{ t(tab.label) }}
            <span v-if="tab.count !== undefined" 
                  :class="[
                    'ml-2 py-0.5 px-2 rounded-full text-xs',
                    activeTab === tab.key
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  ]">
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Filtres -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <!-- Recherche -->
          <div class="lg:col-span-2">
            <input v-model="filters.search"
                   type="text"
                   :placeholder="t('admin.activities.searchPlaceholder')"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Filtre par événement -->
          <div>
            <select v-model="filters.event"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.activities.allEvents') }}</option>
              <option v-for="event in events" :key="event.id" :value="event.id">
                {{ event.title }} ({{ event.year }})
              </option>
            </select>
          </div>

          <!-- Filtre par thématique -->
          <div>
            <select v-model="filters.theme"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.activities.allThemes') }}</option>
              <option value="mitigation">{{ t('activities.themes.mitigation') }}</option>
              <option value="adaptation">{{ t('activities.themes.adaptation') }}</option>
              <option value="climate_resilience">{{ t('activities.themes.climate_resilience') }}</option>
              <option value="loss_and_damage">{{ t('activities.themes.loss_and_damage') }}</option>
              <option value="clean_tech_innovations">{{ t('activities.themes.clean_tech_innovations') }}</option>
              <option value="renewable_energy_land">{{ t('activities.themes.renewable_energy_land') }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des activités -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">{{ t('admin.activities.loading') }}</p>
      </div>

      <div v-else-if="filteredActivities.length === 0" class="p-8 text-center">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400">{{ t('admin.activities.noActivities') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.activities.activity') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.activities.organization') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.activities.event') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.activities.status') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.activities.submittedAt') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.activities.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="activity in paginatedActivities" :key="activity.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <!-- Activité -->
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12">
                    <img v-if="activity.cover_image_low_url"
                         :src="activity.cover_image_low_url"
                         :alt="activity.title"
                         class="h-12 w-12 rounded-lg object-cover">
                    <div v-else class="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ activity.title }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ activity.activity_type }} - {{ activity.format }}
                    </div>
                    <div v-if="activity.main_themes?.length" class="flex flex-wrap gap-1 mt-1">
                      <span v-for="theme in activity.main_themes.slice(0, 2)" :key="theme"
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {{ t(`activities.themes.${theme}`) }}
                      </span>
                      <span v-if="activity.main_themes.length > 2"
                            class="text-xs text-gray-500 dark:text-gray-400">
                        +{{ activity.main_themes.length - 2 }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Organisation -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ activity.organization?.name }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ activity.organization?.organization_type }}
                </div>
              </td>

              <!-- Événement -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ activity.event?.title }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ activity.event?.year }}
                </div>
              </td>

              <!-- Statut -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(activity.validation_status)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ getStatusText(activity.validation_status) }}
                </span>
              </td>

              <!-- Date de soumission -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(activity.created_at) }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="viewActivity(activity)"
                          class="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300">
                    {{ t('admin.activities.view') }}
                  </button>
                  <button v-if="['submitted', 'under_review'].includes(activity.validation_status)"
                          @click="approveActivity(activity)"
                          class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                    {{ t('admin.activities.approve') }}
                  </button>
                  <button v-if="['submitted', 'under_review'].includes(activity.validation_status)"
                          @click="rejectActivity(activity)"
                          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    {{ t('admin.activities.reject') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button @click="previousPage" 
                    :disabled="currentPage === 1"
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50">
              {{ t('admin.activities.previous') }}
            </button>
            <button @click="nextPage" 
                    :disabled="currentPage === totalPages"
                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50">
              {{ t('admin.activities.next') }}
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ t('admin.activities.showing') }}
                <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                {{ t('admin.activities.to') }}
                <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredActivities.length) }}</span>
                {{ t('admin.activities.of') }}
                <span class="font-medium">{{ filteredActivities.length }}</span>
                {{ t('admin.activities.results') }}
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button @click="previousPage" 
                        :disabled="currentPage === 1"
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 disabled:opacity-50">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </button>
                <button v-for="page in visiblePages" :key="page"
                        @click="goToPage(page)"
                        :class="[
                          'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                          page === currentPage
                            ? 'z-10 bg-orange-50 border-orange-500 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
                        ]">
                  {{ page }}
                </button>
                <button @click="nextPage" 
                        :disabled="currentPage === totalPages"
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 disabled:opacity-50">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de validation -->
    <div v-if="showValidationModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeValidationModal"></div>

        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div :class="[
                'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10',
                validationAction === 'approve' ? 'bg-green-100' : 'bg-red-100'
              ]">
                <svg v-if="validationAction === 'approve'" class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <svg v-else class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {{ validationAction === 'approve' ? t('admin.activities.confirmApproval') : t('admin.activities.confirmRejection') }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {{ selectedActivity?.title }}
                  </p>
                  <textarea v-if="validationAction === 'reject'"
                           v-model="validationReason"
                           :placeholder="t('admin.activities.rejectionReason')"
                           rows="3"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  </textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="confirmValidation"
                    :disabled="validationAction === 'reject' && !validationReason.trim()"
                    :class="[
                      'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                      validationAction === 'approve'
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    ]">
              {{ validationAction === 'approve' ? t('admin.activities.approve') : t('admin.activities.reject') }}
            </button>
            <button @click="closeValidationModal"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import { useAuth } from '@/composables/useAuth'

const { t } = useI18n()
const router = useRouter()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles, validateActivity } = useAdmin()
const { currentUser } = useAuth()

// État
const isLoading = ref(true)
const activities = ref([])
const events = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const activeTab = ref('pending')

// Modal de validation
const showValidationModal = ref(false)
const selectedActivity = ref(null)
const validationAction = ref(null)
const validationReason = ref('')

const filters = ref({
  search: '',
  event: '',
  theme: ''
})

const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
})

// Vérification des permissions (attendre le chargement des rôles)
const checkAccess = async () => {
  await loadUserRoles()
  
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

// Computed
const tabs = computed(() => [
  {
    key: 'pending',
    label: 'admin.activities.tabs.pending',
    count: stats.value.pending
  },
  {
    key: 'under_review',
    label: 'admin.activities.tabs.underReview',
    count: activities.value.filter(a => a.validation_status === 'under_review').length
  },
  {
    key: 'approved',
    label: 'admin.activities.tabs.approved',
    count: stats.value.approved
  },
  {
    key: 'rejected',
    label: 'admin.activities.tabs.rejected',
    count: stats.value.rejected
  },
  {
    key: 'all',
    label: 'admin.activities.tabs.all',
    count: stats.value.total
  }
])

const filteredActivities = computed(() => {
  let filtered = activities.value

  // Filtrer par onglet actif
  if (activeTab.value !== 'all') {
    if (activeTab.value === 'pending') {
      filtered = filtered.filter(activity => 
        ['submitted', 'under_review'].includes(activity.validation_status)
      )
    } else {
      filtered = filtered.filter(activity => 
        activity.validation_status === activeTab.value
      )
    }
  }

  // Filtrer par recherche
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(activity => 
      activity.title?.toLowerCase().includes(search) ||
      activity.organization?.name?.toLowerCase().includes(search) ||
      activity.event?.title?.toLowerCase().includes(search)
    )
  }

  // Filtrer par événement
  if (filters.value.event) {
    filtered = filtered.filter(activity => 
      activity.event_id === filters.value.event
    )
  }

  // Filtrer par thématique
  if (filters.value.theme) {
    filtered = filtered.filter(activity => 
      activity.main_themes?.includes(filters.value.theme)
    )
  }

  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const totalPages = computed(() => Math.ceil(filteredActivities.value.length / pageSize.value))

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredActivities.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Méthodes
const loadActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        organization:organizations(id, name, organization_type),
        event:events(id, title, year)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    activities.value = data || []
    calculateStats()
  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error)
  } finally {
    isLoading.value = false
  }
}

const loadEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, year')
      .order('year', { ascending: false })

    if (error) throw error

    events.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des événements:', error)
  }
}

const calculateStats = () => {
  stats.value = {
    pending: activities.value.filter(a => ['submitted', 'under_review'].includes(a.validation_status)).length,
    approved: activities.value.filter(a => a.validation_status === 'approved').length,
    rejected: activities.value.filter(a => a.validation_status === 'rejected').length,
    total: activities.value.length
  }
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[status] || classes.draft
}

const getStatusText = (status) => {
  const texts = {
    draft: t('admin.activities.statuses.draft'),
    submitted: t('admin.activities.statuses.submitted'),
    under_review: t('admin.activities.statuses.underReview'),
    approved: t('admin.activities.statuses.approved'),
    rejected: t('admin.activities.statuses.rejected'),
    cancelled: t('admin.activities.statuses.cancelled')
  }
  return texts[status] || texts.draft
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const viewActivity = (activity) => {
  router.push(`/admin/activities/${activity.id}`)
}

const approveActivity = (activity) => {
  selectedActivity.value = activity
  validationAction.value = 'approve'
  showValidationModal.value = true
}

const rejectActivity = (activity) => {
  selectedActivity.value = activity
  validationAction.value = 'reject'
  validationReason.value = ''
  showValidationModal.value = true
}

const confirmValidation = async () => {
  if (!selectedActivity.value || !currentUser.value) return

  try {
    const status = validationAction.value === 'approve' ? 'approved' : 'rejected'
    const result = await validateActivity(
      selectedActivity.value.id,
      status,
      currentUser.value.id,
      validationReason.value || null
    )

    if (result.success) {
      // Mettre à jour l'activité dans la liste
      const activityIndex = activities.value.findIndex(a => a.id === selectedActivity.value.id)
      if (activityIndex !== -1) {
        activities.value[activityIndex].validation_status = status
      }
      
      calculateStats()
      closeValidationModal()
      
      // TODO: Afficher une notification de succès
    } else {
      console.error('Erreur lors de la validation:', result.error)
      // TODO: Afficher une notification d'erreur
    }
  } catch (error) {
    console.error('Erreur lors de la validation:', error)
  }
}

const closeValidationModal = () => {
  showValidationModal.value = false
  selectedActivity.value = null
  validationAction.value = null
  validationReason.value = ''
}

const exportActivities = () => {
  // TODO: Implémenter l'export
  console.log('Export des activités')
}

const goToPage = (page) => {
  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Watchers
watch([() => filters.value, activeTab], () => {
  currentPage.value = 1
}, { deep: true })

// Cycle de vie
onMounted(async () => {
  try {
    await checkAccess()
    await Promise.all([
      loadActivities(),
      loadEvents()
    ])
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>