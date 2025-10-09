<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-roles">
    <!-- Header avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.roles.title') }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          {{ t('admin.roles.subtitle') }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <button @click="showCreateModal = true" 
                class="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
          <svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          {{ t('admin.roles.create') }}
        </button>
      </div>
    </div>

    <!-- Liste des rôles disponibles -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">
          {{ t('admin.roles.availableRoles') }}
        </h2>
      </div>

      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">{{ t('admin.roles.loading') }}</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          <div v-for="roleType in availableRoles" :key="roleType" 
               class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t(`admin.roles.types.${roleType}`) }}
              </h3>
              <span :class="getRoleClass(roleType)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ roleType }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ t(`admin.roles.descriptions.${roleType}`) }}
            </p>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('admin.roles.usersCount') }}: 
              <span v-if="!isLoading">{{ getUsersCountByRole(roleType) }}</span>
              <span v-else class="animate-pulse">...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau des attributions de rôles -->
    <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ t('admin.roles.assignments') }}
          </h2>
          <!-- Filtres -->
          <div class="flex items-center space-x-3">
            <select v-model="selectedRoleFilter"
                    class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.roles.allRoles') }}</option>
              <option v-for="role in availableRoles" :key="role" :value="role">
                {{ t(`admin.roles.types.${role}`) }}
              </option>
            </select>
            <button @click="loadRoleAssignments"
                    class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredRoleAssignments.length === 0" class="p-8 text-center">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400">{{ t('admin.roles.noAssignments') }}</p>
      </div>

      <div v-else>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.roles.user') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.roles.role') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.roles.assignedBy') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.roles.assignedAt') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.roles.validUntil') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.roles.status') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.roles.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="assignment in paginatedAssignments" :key="assignment.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <!-- Utilisateur -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img :src="assignment.user?.profile_photo_thumbnail_url || '/images/default-avatar.png'"
                       :alt="assignment.user?.first_name"
                       class="h-8 w-8 rounded-full">
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ assignment.user?.first_name }} {{ assignment.user?.last_name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ assignment.user?.email }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Rôle -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleClass(assignment.role)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ t(`admin.roles.types.${assignment.role}`) }}
                </span>
              </td>

              <!-- Assigné par -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ assignment.assigner?.first_name }} {{ assignment.assigner?.last_name }}
              </td>

              <!-- Date d'attribution -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(assignment.assigned_at) }}
              </td>

              <!-- Valide jusqu'à -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ assignment.valid_until ? formatDate(assignment.valid_until) : t('admin.roles.permanent') }}
              </td>

              <!-- Statut -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="assignment.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ assignment.is_active ? t('admin.roles.active') : t('admin.roles.inactive') }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button v-if="assignment.is_active"
                          @click="revokeRole(assignment)"
                          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    {{ t('admin.roles.revoke') }}
                  </button>
                  <button v-else
                          @click="activateRole(assignment)"
                          class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                    {{ t('admin.roles.activate') }}
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
              {{ t('admin.roles.previous') }}
            </button>
            <button @click="nextPage" 
                    :disabled="currentPage === totalPages"
                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50">
              {{ t('admin.roles.next') }}
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ t('admin.roles.showing') }}
                <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                {{ t('admin.roles.to') }}
                <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredRoleAssignments.length) }}</span>
                {{ t('admin.roles.of') }}
                <span class="font-medium">{{ filteredRoleAssignments.length }}</span>
                {{ t('admin.roles.results') }}
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

    <!-- Modal de création de rôle -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ t('admin.roles.assignRole') }}
          </h3>
          <button @click="showCreateModal = false" 
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="assignRole" class="space-y-4">
          <!-- Sélection utilisateur -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.roles.selectUser') }}
            </label>
            <input v-model="userSearch"
                   type="text"
                   :placeholder="t('admin.roles.searchUser')"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   @input="searchUsers">
            <div v-if="searchResults.length > 0" class="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg dark:border-gray-600">
              <div v-for="user in searchResults" :key="user.id"
                   @click="selectUser(user)"
                   class="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <div class="flex items-center">
                  <img :src="user.profile_photo_thumbnail_url || '/images/default-avatar.png'"
                       :alt="user.first_name"
                       class="h-6 w-6 rounded-full mr-2">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="newRoleAssignment.selectedUser" class="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div class="flex items-center">
                <img :src="newRoleAssignment.selectedUser.profile_photo_thumbnail_url || '/images/default-avatar.png'"
                     :alt="newRoleAssignment.selectedUser.first_name"
                     class="h-6 w-6 rounded-full mr-2">
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ newRoleAssignment.selectedUser.first_name }} {{ newRoleAssignment.selectedUser.last_name }}
                </span>
                <button @click="newRoleAssignment.selectedUser = null" 
                        class="ml-auto text-red-500 hover:text-red-700">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Sélection du rôle -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.roles.selectRole') }}
            </label>
            <select v-model="newRoleAssignment.role"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.roles.chooseRole') }}</option>
              <option v-for="role in availableRoles" :key="role" :value="role">
                {{ t(`admin.roles.types.${role}`) }}
              </option>
            </select>
          </div>

          <!-- Date d'expiration (optionnelle) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.roles.expirationDate') }} ({{ t('admin.roles.optional') }})
            </label>
            <input v-model="newRoleAssignment.validUntil"
                   type="datetime-local"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Boutons -->
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button type="button" 
                    @click="showCreateModal = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
              {{ t('admin.roles.cancel') }}
            </button>
            <button type="submit"
                    :disabled="!newRoleAssignment.selectedUser || !newRoleAssignment.role || isAssigning"
                    class="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 dark:bg-orange-500 dark:hover:bg-orange-600">
              {{ isAssigning ? t('admin.roles.assigning') : t('admin.roles.assign') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import { useRoles } from '@/composables/useRoles'

const { t } = useI18n()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()
const { assignUserRole, revokeUserRole } = useRoles()

// État
const isLoading = ref(true)
const isAssigning = ref(false)
const roleAssignments = ref([])
const availableRoles = ref(['standard', 'unfccc_focal_point', 'negotiator', 'trainer', 'revisionniste', 'admin', 'super_admin'])
const selectedRoleFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// Modal de création
const showCreateModal = ref(false)
const userSearch = ref('')
const searchResults = ref([])
const newRoleAssignment = ref({
  selectedUser: null,
  role: '',
  validUntil: ''
})

// Vérification des permissions
const checkAccess = async () => {
  await loadUserRoles()
  
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

// Computed
const filteredRoleAssignments = computed(() => {
  let filtered = roleAssignments.value

  if (selectedRoleFilter.value) {
    filtered = filtered.filter(assignment => assignment.role === selectedRoleFilter.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredRoleAssignments.value.length / pageSize.value))

const paginatedAssignments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRoleAssignments.value.slice(start, end)
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
const loadRoleAssignments = async () => {
  try {
    isLoading.value = true
    
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        role,
        assigned_at,
        valid_until,
        is_active,
        user:user_id (
          id,
          first_name,
          last_name,
          email,
          profile_photo_thumbnail_url
        ),
        assigner:assigned_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('assigned_at', { ascending: false })

    if (error) throw error

    roleAssignments.value = data || []
    
    // Debug: afficher les données chargées
    console.log('Role assignments loaded:', data)
    console.log('Negotiator count:', data?.filter(a => a.role === 'negotiator' && a.is_active).length)
  } catch (error) {
    console.error('Erreur lors du chargement des attributions de rôles:', error)
  } finally {
    isLoading.value = false
  }
}

const getRoleClass = (role) => {
  const classes = {
    standard: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    negotiator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    unfccc_focal_point: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    trainer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    revisionniste: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    super_admin: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200'
  }
  return classes[role] || classes.standard
}

const getUsersCountByRole = computed(() => {
  return (role) => {
    return roleAssignments.value.filter(assignment => 
      assignment.role === role && assignment.is_active
    ).length
  }
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const searchUsers = async () => {
  if (userSearch.value.length < 2) {
    searchResults.value = []
    return
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, profile_photo_thumbnail_url')
      .or(`first_name.ilike.%${userSearch.value}%,last_name.ilike.%${userSearch.value}%,email.ilike.%${userSearch.value}%`)
      .limit(10)

    if (error) throw error

    searchResults.value = data || []
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error)
  }
}

const selectUser = (user) => {
  newRoleAssignment.value.selectedUser = user
  userSearch.value = `${user.first_name} ${user.last_name}`
  searchResults.value = []
}

const assignRole = async () => {
  if (!newRoleAssignment.value.selectedUser || !newRoleAssignment.value.role) {
    return
  }

  try {
    isAssigning.value = true

    const validUntil = newRoleAssignment.value.validUntil ? 
      new Date(newRoleAssignment.value.validUntil).toISOString() : null

    await assignUserRole(
      newRoleAssignment.value.selectedUser.id,
      newRoleAssignment.value.role,
      validUntil
    )

    // Recharger les attributions
    await loadRoleAssignments()

    // Réinitialiser le formulaire
    showCreateModal.value = false
    newRoleAssignment.value = {
      selectedUser: null,
      role: '',
      validUntil: ''
    }
    userSearch.value = ''
    searchResults.value = []

  } catch (error) {
    console.error('Erreur lors de l\'attribution du rôle:', error)
  } finally {
    isAssigning.value = false
  }
}

const revokeRole = async (assignment) => {
  if (!confirm(t('admin.roles.confirmRevoke'))) {
    return
  }

  try {
    await revokeUserRole(assignment.user.id, assignment.role)
    await loadRoleAssignments()
  } catch (error) {
    console.error('Erreur lors de la révocation du rôle:', error)
  }
}

const activateRole = async (assignment) => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: true })
      .eq('id', assignment.id)

    if (error) throw error

    await loadRoleAssignments()
  } catch (error) {
    console.error('Erreur lors de l\'activation du rôle:', error)
  }
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
watch(selectedRoleFilter, () => {
  currentPage.value = 1
})

// Cycle de vie
onMounted(async () => {
  try {
    await checkAccess()
    await loadRoleAssignments()
  } catch (error) {
    console.error('Erreur lors du chargement de la page des rôles:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>