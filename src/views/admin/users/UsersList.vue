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

      <div v-else-if="displayedUsers.length === 0 && !isLoadingMore" class="p-8 text-center">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400">{{ t('admin.users.noUsers') }}</p>
      </div>

      <div v-else>
        <!-- Vue en cartes pour une meilleure lisibilité -->
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="user in displayedUsers"
               :key="user.id"
               class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div class="flex items-start space-x-4">
              <!-- Avatar avec initiales -->
              <div class="flex-shrink-0">
                <img v-if="user.profile_photo_thumbnail_url"
                     :src="user.profile_photo_thumbnail_url"
                     :alt="`${user.first_name} ${user.last_name}`"
                     class="h-12 w-12 rounded-full object-cover">
                <div v-else
                     :class="getAvatarColor(user)"
                     class="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {{ getInitials(user) }}
                </div>
              </div>

              <!-- Informations principales -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <!-- Nom et email -->
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {{ user.first_name }} {{ user.last_name }}
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {{ user.email }}
                    </p>

                    <!-- Organisation et date -->
                    <div class="flex items-center space-x-3 mt-2 text-xs">
                      <div v-if="user.organization" class="flex items-center text-gray-600 dark:text-gray-400">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <span class="truncate max-w-[150px]">{{ user.organization.name }}</span>
                      </div>
                      <div class="flex items-center text-gray-500 dark:text-gray-400">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        {{ formatDate(user.created_at) }}
                      </div>
                    </div>

                    <!-- Rôles et statut -->
                    <div class="flex flex-wrap items-center gap-1.5 mt-2">
                      <!-- Statut -->
                      <span :class="getStatusClass(user)"
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                        {{ getUserStatus(user) }}
                      </span>
                      <!-- Rôles -->
                      <span v-for="role in user.user_roles"
                            :key="role.id"
                            :class="getRoleClass(role.role)"
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                        {{ t(`admin.users.roles.${role.role}`) }}
                      </span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex flex-col space-y-1 ml-4">
                    <button @click="viewUser(user)"
                            class="px-3 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded cursor-pointer">
                      Voir
                    </button>
                    <button @click="editUser(user)"
                            class="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded cursor-pointer">
                      Modifier
                    </button>
                    <button v-if="!user.is_blocked && !user.is_suspended"
                            @click="suspendUser(user)"
                            class="px-3 py-1 text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded cursor-pointer">
                      Suspendre
                    </button>
                    <button v-if="user.is_suspended"
                            @click="unsuspendUser(user)"
                            class="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded cursor-pointer">
                      Activer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Infinite scroll loader -->
        <div ref="infiniteScrollTrigger" class="p-4 text-center">
          <div v-if="isLoadingMore" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span class="ml-3 text-gray-500 dark:text-gray-400">Chargement...</span>
          </div>
          <div v-else-if="hasMore" class="text-gray-400 dark:text-gray-500 text-sm">
            Faites défiler pour charger plus d'utilisateurs
          </div>
          <div v-else class="text-gray-400 dark:text-gray-500 text-sm">
            Tous les utilisateurs ont été chargés ({{ displayedUsers.length }} au total)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
const isLoadingMore = ref(false)
const displayedUsers = ref([])
const currentPage = ref(0)
const pageSize = 20
const hasMore = ref(true)
const infiniteScrollTrigger = ref(null)
const observer = ref(null)

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

// Méthodes
const loadUsers = async (reset = false) => {
  if (reset) {
    currentPage.value = 0
    displayedUsers.value = []
    hasMore.value = true
  }

  if (!hasMore.value || isLoadingMore.value) return

  try {
    if (reset) {
      isLoading.value = true
    } else {
      isLoadingMore.value = true
    }

    // Si un filtre de rôle est appliqué, récupérer d'abord les IDs des utilisateurs avec ce rôle
    let userIdsWithRole = null
    if (filters.value.role) {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', filters.value.role)
        .eq('is_active', true)

      if (roleError) throw roleError

      userIdsWithRole = (roleData || []).map(r => r.user_id)

      // Si aucun utilisateur n'a ce rôle, arrêter ici
      if (userIdsWithRole.length === 0) {
        hasMore.value = false
        isLoading.value = false
        isLoadingMore.value = false
        return
      }
    }

    // Construction de la requête de base
    let query = supabase
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
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(currentPage.value * pageSize, (currentPage.value + 1) * pageSize - 1)

    // Filtrer par les IDs des utilisateurs avec le rôle
    if (userIdsWithRole) {
      query = query.in('id', userIdsWithRole)
    }

    // Appliquer les filtres de recherche
    if (filters.value.search) {
      const search = `%${filters.value.search}%`
      query = query.or(`first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search}`)
    }

    // Appliquer le filtre de statut
    if (filters.value.status) {
      switch (filters.value.status) {
        case 'active':
          query = query.eq('is_blocked', false).eq('is_suspended', false)
          break
        case 'blocked':
          query = query.eq('is_blocked', true)
          break
        case 'suspended':
          query = query.eq('is_suspended', true)
          break
      }
    }

    const { data: usersData, error: usersError, count } = await query

    if (usersError) throw usersError

    // Enrichir les données avec organisations et rôles
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

    displayedUsers.value = [...displayedUsers.value, ...enrichedUsers]
    currentPage.value++

    // Vérifier s'il y a plus d'utilisateurs à charger
    hasMore.value = enrichedUsers.length === pageSize

  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const setupIntersectionObserver = () => {
  observer.value = new IntersectionObserver(
    (entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore.value && !isLoadingMore.value) {
        loadUsers()
      }
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    }
  )

  if (infiniteScrollTrigger.value) {
    observer.value.observe(infiniteScrollTrigger.value)
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

// Fonction pour générer les initiales
const getInitials = (user) => {
  const firstInitial = user.first_name?.charAt(0)?.toUpperCase() || ''
  const lastInitial = user.last_name?.charAt(0)?.toUpperCase() || ''
  return `${firstInitial}${lastInitial}` || '?'
}

// Fonction pour générer une couleur d'avatar basée sur le nom
const getAvatarColor = (user) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ]

  // Générer un index basé sur le nom pour avoir une couleur cohérente
  const fullName = `${user.first_name}${user.last_name}`.toLowerCase()
  let hash = 0
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}

// Watchers
watch(() => filters.value, async () => {
  await loadUsers(true)
  await nextTick()
  if (infiniteScrollTrigger.value && observer.value) {
    observer.value.observe(infiniteScrollTrigger.value)
  }
}, { deep: true })

// Cycle de vie
onMounted(async () => {
  try {
    // D'abord vérifier les permissions
    await checkAccess()

    // Puis charger les premiers utilisateurs
    await loadUsers(true)

    // Attendre que le DOM soit mis à jour
    await nextTick()

    // Configurer l'infinite scroll
    setupIntersectionObserver()
  } catch (error) {
    console.error('Erreur lors du chargement de la page utilisateurs:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>