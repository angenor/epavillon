<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-user-detail">
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
    
    <div v-else-if="user" class="space-y-6">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center space-x-4">
          <img :src="user.profile_photo_thumbnail_url || '/images/default-avatar.png'"
               :alt="user.first_name"
               class="h-16 w-16 rounded-full">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ user.first_name }} {{ user.last_name }}
            </h1>
            <p class="text-gray-500 dark:text-gray-400">{{ user.email }}</p>
          </div>
        </div>
      </div>

      <!-- Informations utilisateur -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Informations utilisateur</h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Organisation</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ user.organization?.name || 'Aucune organisation' }}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Pays</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ user.country?.name_fr || 'Non renseigné' }}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</dt>
            <dd class="mt-1">
              <span :class="getStatusClass()"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ getUserStatus() }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Inscription</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ formatDate(user.created_at) }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Gestion des rôles -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">{{ t('admin.users.roleManagement.title') }}</h2>
        
        <!-- Rôles actuels -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {{ t('admin.users.roleManagement.currentRoles') }}
          </h3>
          <div v-if="userRoles.length > 0" class="space-y-3">
            <div v-for="role in userRoles" :key="role.id" 
                 class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div class="flex items-center space-x-3">
                <span :class="getRoleClass(role.role)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ t(`admin.users.roles.${role.role}`) }}
                </span>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  <div>{{ t('admin.users.roleManagement.assignedAt') }}: {{ formatDate(role.assigned_at) }}</div>
                  <div v-if="editingExpiry !== role.id" class="flex items-center space-x-2">
                    <span v-if="role.valid_until">
                      {{ t('admin.users.roleManagement.expiry') }}: {{ formatDate(role.valid_until) }}
                      <span v-if="isRoleExpired(role.valid_until)" 
                            class="ml-2 text-red-600 font-medium">({{ t('admin.users.roleManagement.expired') }})</span>
                    </span>
                    <span v-else class="text-green-600">{{ t('admin.users.roleManagement.noExpiry') }}</span>
                    <button @click="startEditExpiry(role)"
                            class="text-blue-600 hover:text-blue-800 text-xs font-medium ml-2">
                      ✏️
                    </button>
                  </div>
                  <div v-else class="flex items-center space-x-2">
                    <input v-model="editExpiryDate"
                           type="date"
                           class="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <button @click="saveExpiry(role.id)"
                            :disabled="roleManagementLoading"
                            class="text-green-600 hover:text-green-800 text-xs font-medium">
                      ✓
                    </button>
                    <button @click="cancelEditExpiry"
                            class="text-gray-600 hover:text-gray-800 text-xs font-medium">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span :class="role.is_active ? 'text-green-600' : 'text-gray-500'"
                      class="text-xs font-medium">
                  {{ role.is_active ? t('admin.users.roleManagement.active') : t('admin.users.roleManagement.inactive') }}
                </span>
                <button v-if="!role.is_active"
                        @click="activateRole(role.id)"
                        :disabled="roleManagementLoading"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50">
                  {{ t('admin.users.roleManagement.activateRole') }}
                </button>
                <button v-if="role.is_active"
                        @click="confirmRemoveRole(role)"
                        :disabled="roleManagementLoading"
                        class="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">
                  {{ t('admin.users.roleManagement.removeRole') }}
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 dark:text-gray-400 text-sm">
            {{ t('admin.users.roleManagement.noRoles') }}
          </div>
        </div>

        <!-- Ajouter un nouveau rôle -->
        <div class="border-t border-gray-200 dark:border-gray-600 pt-6">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {{ t('admin.users.roleManagement.addRole') }}
          </h3>
          <div class="flex flex-col sm:flex-row gap-3">
            <select v-model="newRole.type"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.users.roleManagement.selectRole') }}</option>
              <option v-for="role in availableRolesToAdd" :key="role.value" :value="role.value">
                {{ t(`admin.users.roles.${role.value}`) }}
              </option>
            </select>
            <input v-model="newRole.validUntil"
                   type="date"
                   :placeholder="t('admin.users.roleManagement.validUntil')"
                   class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <button @click="addRole"
                    :disabled="!newRole.type || roleManagementLoading"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="roleManagementLoading" class="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              {{ t('admin.users.roleManagement.addRole') }}
            </button>
          </div>
          <div v-if="roleError" class="mt-2 text-sm text-red-600 dark:text-red-400">
            {{ roleError }}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Actions</h2>
        <div class="flex flex-wrap gap-3">
          <router-link :to="`/admin/users/${user.id}/edit`"
                       class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Modifier
          </router-link>
          <button v-if="!user.is_blocked && !user.is_suspended"
                  @click="suspendUser"
                  class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
            Suspendre
          </button>
          <button v-if="user.is_suspended"
                  @click="unsuspendUser"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Lever la suspension
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Utilisateur non trouvé</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import { useUserRoles } from '@/composables/useUserRoles'

const { t } = useI18n()
const route = useRoute()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()
const { 
  getUserRoles, 
  addUserRole, 
  removeUserRole, 
  activateUserRole,
  updateRoleExpiry,
  getRoleClass,
  isRoleExpired,
  availableRoles,
  isLoading: roleManagementLoading,
  error: roleError
} = useUserRoles()

const isLoading = ref(true)
const user = ref(null)
const userRoles = ref([])
const newRole = ref({
  type: '',
  validUntil: null
})
const editingExpiry = ref(null)
const editExpiryDate = ref('')

// Vérification des permissions (attendre le chargement des rôles)
const checkAccess = async () => {
  await loadUserRoles()
  
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

const loadUser = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        organization:organization_id(id, name),
        country:country_id(id, name_fr),
        user_roles!user_roles_user_id_fkey(id, role, is_active)
      `)
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    user.value = data
  } catch (error) {
    console.error('Erreur lors du chargement de l\'utilisateur:', error)
  } finally {
    isLoading.value = false
  }
}

const getStatusClass = () => {
  if (user.value.is_blocked) return 'bg-red-100 text-red-800'
  if (user.value.is_suspended) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getUserStatus = () => {
  if (user.value.is_blocked) return 'Bloqué'
  if (user.value.is_suspended) return 'Suspendu'
  return 'Actif'
}

// Computed
const availableRolesToAdd = computed(() => {
  const currentRoleTypes = userRoles.value
    .filter(role => role.is_active)
    .map(role => role.role)
  
  return availableRoles.filter(role => !currentRoleTypes.includes(role.value))
})

// Méthodes pour la gestion des rôles
const loadCurrentUserRoles = async () => {
  try {
    userRoles.value = await getUserRoles(route.params.id)
  } catch (error) {
    console.error('Erreur lors du chargement des rôles:', error)
  }
}

const addRole = async () => {
  try {
    if (!newRole.value.type) return
    
    const validUntil = newRole.value.validUntil || null
    await addUserRole(route.params.id, newRole.value.type, validUntil)
    
    // Recharger les rôles
    await loadCurrentUserRoles()
    
    // Réinitialiser le formulaire
    newRole.value = { type: '', validUntil: null }
    
    // Notification de succès (vous pouvez ajouter un système de notifications)
    console.log(t('admin.users.roleManagement.roleAdded'))
  } catch (error) {
    console.error('Erreur lors de l\'ajout du rôle:', error)
  }
}

const confirmRemoveRole = (role) => {
  if (confirm(t('admin.users.roleManagement.confirmRemove'))) {
    removeRole(role.id)
  }
}

const removeRole = async (roleId) => {
  try {
    await removeUserRole(roleId)
    await loadCurrentUserRoles()
    console.log(t('admin.users.roleManagement.roleRemoved'))
  } catch (error) {
    console.error('Erreur lors de la suppression du rôle:', error)
  }
}

const activateRole = async (roleId) => {
  try {
    await activateUserRole(roleId)
    await loadCurrentUserRoles()
    console.log(t('admin.users.roleManagement.roleActivated'))
  } catch (error) {
    console.error('Erreur lors de l\'activation du rôle:', error)
  }
}

// Méthodes pour l'édition de l'expiration
const startEditExpiry = (role) => {
  editingExpiry.value = role.id
  editExpiryDate.value = role.valid_until ? role.valid_until.split('T')[0] : ''
}

const saveExpiry = async (roleId) => {
  try {
    const validUntil = editExpiryDate.value ? new Date(editExpiryDate.value).toISOString() : null
    await updateRoleExpiry(roleId, validUntil)
    await loadCurrentUserRoles()
    editingExpiry.value = null
    console.log('Date d\'expiration mise à jour avec succès')
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'expiration:', error)
  }
}

const cancelEditExpiry = () => {
  editingExpiry.value = null
  editExpiryDate.value = ''
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const suspendUser = () => {
  console.log('Suspendre utilisateur:', user.value.id)
}

const unsuspendUser = () => {
  console.log('Lever suspension utilisateur:', user.value.id)
}

onMounted(async () => {
  try {
    await checkAccess()
    await loadUser()
    await loadCurrentUserRoles()
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>