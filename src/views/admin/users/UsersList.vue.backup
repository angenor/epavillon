<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-users">
    <!-- Header avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.users.title') }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          {{ t('admin.users.subtitle') }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <button @click="exportUsers" 
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
          <svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          {{ t('admin.users.export') }}
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Recherche -->
          <div class="lg:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.users.search') }}
            </label>
            <input v-model="filters.search"
                   type="text"
                   :placeholder="t('admin.users.searchPlaceholder')"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Filtre par rôle -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.users.role') }}
            </label>
            <select v-model="filters.role"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.users.allRoles') }}</option>
              <option value="standard">{{ t('admin.users.roles.standard') }}</option>
              <option value="negotiator">{{ t('admin.users.roles.negotiator') }}</option>
              <option value="unfccc_focal_point">{{ t('admin.users.roles.unfccc_focal_point') }}</option>
              <option value="trainer">{{ t('admin.users.roles.trainer') }}</option>
              <option value="admin">{{ t('admin.users.roles.admin') }}</option>
            </select>
          </div>

          <!-- Filtre par statut -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.users.status') }}
            </label>
            <select v-model="filters.status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.users.allStatuses') }}</option>
              <option value="active">{{ t('admin.users.statuses.active') }}</option>
              <option value="blocked">{{ t('admin.users.statuses.blocked') }}</option>
              <option value="suspended">{{ t('admin.users.statuses.suspended') }}</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <button @click="resetFilters"
                  class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            {{ t('admin.users.resetFilters') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">{{ t('admin.users.loading') }}</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="p-8 text-center">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400">{{ t('admin.users.noUsers') }}</p>
      </div>

      <div v-else>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.users.user') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.users.organization') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.users.roles') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.users.status') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.users.joinedAt') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t('admin.users.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <!-- Utilisateur -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img :src="user.profile_photo_thumbnail_url || '/images/default-avatar.png'"
                       :alt="user.first_name"
                       class="h-10 w-10 rounded-full">
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Organisation -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="user.organization" class="text-sm text-gray-900 dark:text-white">
                  {{ user.organization.name }}
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t('admin.users.noOrganization') }}
                </div>
              </td>

              <!-- Rôles -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-1">
                  <span v-for="role in user.user_roles" :key="role.id"
                        :class="getRoleClass(role.role)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ t(`admin.users.roles.${role.role}`) }}
                  </span>
                </div>
              </td>

              <!-- Statut -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(user)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ getUserStatus(user) }}
                </span>
              </td>

              <!-- Date d'inscription -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.created_at) }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="viewUser(user)"
                          class="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300">
                    {{ t('admin.users.view') }}
                  </button>
                  <button @click="editUser(user)"
                          class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                    {{ t('admin.users.edit') }}
                  </button>
                  <button v-if="!user.is_blocked && !user.is_suspended"
                          @click="suspendUser(user)"
                          class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
                    {{ t('admin.users.suspend') }}
                  </button>
                  <button v-if="user.is_suspended"
                          @click="unsuspendUser(user)"
                          class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                    {{ t('admin.users.unsuspend') }}
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
              {{ t('admin.users.previous') }}
            </button>
            <button @click="nextPage" 
                    :disabled="currentPage === totalPages"
                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50">
              {{ t('admin.users.next') }}
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ t('admin.users.showing') }}
                <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                {{ t('admin.users.to') }}
                <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredUsers.length) }}</span>
                {{ t('admin.users.of') }}
                <span class="font-medium">{{ filteredUsers.length }}</span>
                {{ t('admin.users.results') }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const { t } = useI18n()
const router = useRouter()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()

// État
const isLoading = ref(true)
const users = ref([])
const currentPage = ref(1)
const pageSize = ref(20)

const filters = ref({
  search: '',
  role: '',
  status: ''
})

// Vérification des permissions (attendre le chargement des rôles)
const checkAccess = async () => {
  await loadUserRoles()
  
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(user => 
      user.first_name?.toLowerCase().includes(search) ||
      user.last_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.organization?.name?.toLowerCase().includes(search)
    )
  }

  if (filters.value.role) {
    filtered = filtered.filter(user =>
      user.user_roles?.some(role => role.role === filters.value.role)
    )
  }

  if (filters.value.status) {
    filtered = filtered.filter(user => {
      switch (filters.value.status) {
        case 'active': return !user.is_blocked && !user.is_suspended
        case 'blocked': return user.is_blocked
        case 'suspended': return user.is_suspended
        default: return true
      }
    })
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
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
const loadUsers = async () => {
  try {
    // Première requête : récupérer les utilisateurs de base
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        profile_photo_thumbnail_url,
        is_blocked,
        is_suspended,
        created_at,
        organization_id,
        country_id
      `)
      .order('created_at', { ascending: false })

    if (usersError) throw usersError

    // Ensuite, enrichir avec les organisations et rôles
    const enrichedUsers = await Promise.all(
      (usersData || []).map(async (user) => {
        // Récupérer l'organisation si elle existe
        let organization = null
        if (user.organization_id) {
          try {
            const { data: orgData } = await supabase
              .from('organizations')
              .select('id, name')
              .eq('id', user.organization_id)
              .single()
            organization = orgData
          } catch (orgError) {
            console.warn('Erreur organisation:', orgError)
          }
        }

        // Récupérer les rôles
        let user_roles = []
        try {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('id, role, is_active')
            .eq('user_id', user.id)
            .eq('is_active', true)
          user_roles = rolesData || []
        } catch (roleError) {
          console.warn('Erreur rôles:', roleError)
        }

        return {
          ...user,
          organization,
          user_roles
        }
      })
    )

    users.value = enrichedUsers
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
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
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    super_admin: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200'
  }
  return classes[role] || classes.standard
}

const getStatusClass = (user) => {
  if (user.is_blocked) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  if (user.is_suspended) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }
  return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
}

const getUserStatus = (user) => {
  if (user.is_blocked) {
    return t('admin.users.statuses.blocked')
  }
  if (user.is_suspended) {
    return t('admin.users.statuses.suspended')
  }
  return t('admin.users.statuses.active')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const resetFilters = () => {
  filters.value = {
    search: '',
    role: '',
    status: ''
  }
  currentPage.value = 1
}

const viewUser = (user) => {
  router.push(`/admin/users/${user.id}`)
}

const editUser = (user) => {
  router.push(`/admin/users/${user.id}/edit`)
}

const suspendUser = (user) => {
  // TODO: Implémenter la suspension
  console.log('Suspendre utilisateur:', user.id)
}

const unsuspendUser = (user) => {
  // TODO: Implémenter la levée de suspension
  console.log('Lever suspension utilisateur:', user.id)
}

const exportUsers = () => {
  // TODO: Implémenter l'export
  console.log('Export des utilisateurs')
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
watch(() => filters.value, () => {
  currentPage.value = 1
}, { deep: true })

// Cycle de vie
onMounted(async () => {
  try {
    // D'abord vérifier les permissions
    await checkAccess()
    
    // Puis charger les utilisateurs
    await loadUsers()
  } catch (error) {
    console.error('Erreur lors du chargement de la page utilisateurs:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>