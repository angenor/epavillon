<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-organization-detail">
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
    
    <div v-else-if="organization" class="space-y-6">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center space-x-4">
          <img v-if="organization.logo_url"
               :src="organization.logo_url"
               :alt="organization.name"
               class="h-16 w-16 rounded-lg object-cover">
          <div class="h-16 w-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ organization.name }}
            </h1>
            <p class="text-gray-500 dark:text-gray-400">{{ organization.email }}</p>
            <div class="flex space-x-2 mt-2">
              <span v-if="organization.is_verified"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Vérifiée
              </span>
              <span v-if="organization.is_duplicate"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Doublon
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations détaillées -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Informations générales</h2>
          <dl class="space-y-4">
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Type d'organisation</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ organization.organization_type }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Pays</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ organization.country?.name_fr || 'Non renseigné' }}
              </dd>
            </div>
            <div v-if="organization.website">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Site web</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                <a :href="organization.website" target="_blank" class="text-orange-600 hover:text-orange-800">
                  {{ organization.website }}
                </a>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Créée le</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(organization.created_at) }}
              </dd>
            </div>
          </dl>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Actions administratives</h2>
          <div class="space-y-3">
            <button v-if="!organization.is_verified"
                    @click="verifyOrganization"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Vérifier l'organisation
            </button>
            <button v-if="organization.is_active"
                    @click="deactivateOrganization"
                    class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Désactiver
            </button>
            <button v-else
                    @click="activateOrganization"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Réactiver
            </button>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="organization.description" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Description</h2>
        <p class="text-gray-700 dark:text-gray-300">{{ organization.description }}</p>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Organisation non trouvée</p>
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
const organization = ref(null)

// Vérification des permissions (attendre le chargement des rôles)
const checkAccess = async () => {
  await loadUserRoles()
  
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

const loadOrganization = async () => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        country:countries(id, name_fr)
      `)
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    organization.value = data
  } catch (error) {
    console.error('Erreur lors du chargement de l\'organisation:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const verifyOrganization = async () => {
  console.log('Vérifier organisation:', organization.value.id)
}

const deactivateOrganization = async () => {
  console.log('Désactiver organisation:', organization.value.id)
}

const activateOrganization = async () => {
  console.log('Réactiver organisation:', organization.value.id)
}

onMounted(async () => {
  try {
    await checkAccess()
    await loadOrganization()
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>