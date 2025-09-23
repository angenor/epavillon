<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-dashboard">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ t('admin.dashboard.title') }}
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        {{ t('admin.dashboard.subtitle') }}
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {{ t('admin.dashboard.totalUsers') }}
              </dt>
              <dd class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ stats.totalUsers || 0 }}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {{ t('admin.dashboard.activitiesApproved') }}
              </dt>
              <dd class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ stats.activitiesApproved || 0 }}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {{ t('admin.dashboard.activitiesPending') }}
              </dt>
              <dd class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ stats.activitiesPending || 0 }}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {{ t('admin.dashboard.activeOrganizations') }}
              </dt>
              <dd class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ stats.activeOrganizations || 0 }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="my-8 grid grid-cols-1 lg:grid-cols-1 gap-3">
      <!-- Submissions per Day Chart -->
      <SubmissionsPerDayChart />

      <!-- Organization Types Chart -->
      <OrganizationTypesChart />
    </div>

    <!-- Recent Activity & Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Pending Activities -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('admin.dashboard.pendingActivities') }}
          </h3>
        </div>
        <div class="p-6">
          <div v-if="isLoadingActivities" class="text-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          </div>
          <div v-else-if="pendingActivities.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
            {{ t('admin.dashboard.noPendingActivities') }}
          </div>
          <ul v-else class="space-y-4">
            <li v-for="activity in pendingActivities.slice(0, 5)" :key="activity.id"
                class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ activity.title }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ activity.organization?.name }}
                </p>
              </div>
              <button @click="$router.push(`/admin/activities/${activity.id}`)"
                      class="ml-4 text-orange-600 hover:text-orange-800 text-sm font-medium">
                {{ t('admin.dashboard.review') }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- System Alerts -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('admin.dashboard.systemAlerts') }}
          </h3>
        </div>
        <div class="p-6">
          <ul class="space-y-4">
            <li v-if="alerts.duplicateOrganizations > 0" class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div class="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ t('admin.dashboard.duplicateOrgsAlert', { count: alerts.duplicateOrganizations }) }}
                </p>
                <button @click="$router.push('/admin/organizations?tab=duplicates')"
                        class="text-sm text-orange-600 hover:text-orange-800 font-medium">
                  {{ t('admin.dashboard.viewDuplicates') }}
                </button>
              </div>
            </li>

            <li v-if="alerts.suspendedUsers > 0" class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div class="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ t('admin.dashboard.suspendedUsersAlert', { count: alerts.suspendedUsers }) }}
                </p>
                <button @click="$router.push('/admin/users?status=suspended')"
                        class="text-sm text-orange-600 hover:text-orange-800 font-medium">
                  {{ t('admin.dashboard.manageUsers') }}
                </button>
              </div>
            </li>

            <li v-if="alerts.unverifiedOrganizations > 0" class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div class="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ t('admin.dashboard.unverifiedOrgsAlert', { count: alerts.unverifiedOrganizations }) }}
                </p>
                <button @click="$router.push('/admin/organizations?tab=unverified')"
                        class="text-sm text-orange-600 hover:text-orange-800 font-medium">
                  {{ t('admin.dashboard.verifyOrganizations') }}
                </button>
              </div>
            </li>

            <li v-if="Object.values(alerts).every(val => val === 0)" class="text-center py-4">
              <div class="text-green-500 dark:text-green-400">
                <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm">{{ t('admin.dashboard.noAlertsGood') }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import SubmissionsPerDayChart from '@/components/admin/charts/SubmissionsPerDayChart.vue'
import OrganizationTypesChart from '@/components/admin/charts/OrganizationTypesChart.vue'

const { t } = useI18n()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()

// État
const isLoading = ref(true)
const isLoadingActivities = ref(true)
const stats = ref({
  totalUsers: 0,
  activitiesApproved: 0,
  activitiesPending: 0,
  activeOrganizations: 0
})

const alerts = ref({
  duplicateOrganizations: 0,
  suspendedUsers: 0,
  unverifiedOrganizations: 0
})

const pendingActivities = ref([])

// Vérification des permissions (attendre le chargement des rôles)
const checkAccess = async () => {
  // Attendre que les rôles soient chargés
  await loadUserRoles()

  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

// Méthodes
const loadStats = async () => {
  try {
    // Statistiques générales
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })

    if (!usersError) {
      stats.value.totalUsers = users || 0
    }

    const { data: approvedActivities, error: approvedError } = await supabase
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .eq('validation_status', 'approved')

    if (!approvedError) {
      stats.value.activitiesApproved = approvedActivities || 0
    }

    const { data: pendingCount, error: pendingError } = await supabase
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .in('validation_status', ['submitted', 'under_review'])

    if (!pendingError) {
      stats.value.activitiesPending = pendingCount || 0
    }

    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (!orgsError) {
      stats.value.activeOrganizations = organizations || 0
    }

  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  } finally {
    isLoading.value = false
  }
}

const loadAlerts = async () => {
  try {
    // Organisations en doublon
    const { count: duplicates } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('is_duplicate', true)

    alerts.value.duplicateOrganizations = duplicates || 0

    // Utilisateurs suspendus
    const { count: suspended } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_suspended', true)

    alerts.value.suspendedUsers = suspended || 0

    // Organisations non vérifiées
    const { count: unverified } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false)
      .eq('is_active', true)

    alerts.value.unverifiedOrganizations = unverified || 0

  } catch (error) {
    console.error('Erreur lors du chargement des alertes:', error)
  }
}

const loadPendingActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        created_at,
        organization:organizations(name)
      `)
      .in('validation_status', ['submitted', 'under_review'])
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    pendingActivities.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des activités en attente:', error)
  } finally {
    isLoadingActivities.value = false
  }
}

// Cycle de vie
onMounted(async () => {
  try {
    // D'abord vérifier les permissions
    await checkAccess()

    // Puis charger les données
    await Promise.all([
      loadStats(),
      loadAlerts(),
      loadPendingActivities()
    ])
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error)
    // Rediriger vers la page de login si l'accès n'est pas autorisé
    if (error.message === 'Accès non autorisé') {
      throw error // Laisser l'erreur remonter pour être gérée par Vue
    }
  }
})
</script>
