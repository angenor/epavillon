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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const { t } = useI18n()
const route = useRoute()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()

const isLoading = ref(true)
const user = ref(null)

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
        organization:organizations(id, name),
        country:countries(id, name_fr),
        user_roles(id, role, is_active)
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
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>