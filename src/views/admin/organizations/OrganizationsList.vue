<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-organizations">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Gestion des Organisations
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        Administration des organisations partenaires
      </p>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Total</div>
        <div class="mt-1 text-2xl font-bold text-blue-600">{{ stats.total }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Vérifiées</div>
        <div class="mt-1 text-2xl font-bold text-green-600">{{ stats.verified }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">En doublon</div>
        <div class="mt-1 text-2xl font-bold text-yellow-600">{{ stats.duplicates }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Actives</div>
        <div class="mt-1 text-2xl font-bold text-orange-600">{{ stats.active }}</div>
      </div>
    </div>

    <!-- Liste des organisations -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <input v-model="searchQuery"
               type="text"
               placeholder="Rechercher une organisation..."
               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>

      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Organisation
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Pays
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="org in filteredOrganizations" :key="org.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img v-if="org.logo_url"
                         :src="org.logo_url"
                         :alt="`Logo ${org.name}`"
                         class="h-10 w-10 rounded-lg object-contain bg-gray-100 dark:bg-gray-700 p-1">
                    <div v-else
                         class="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ org.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ org.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ org.organization_type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                  <span v-if="org.is_verified"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Vérifiée
                  </span>
                  <span v-if="org.is_duplicate"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Doublon
                  </span>
                  <span v-if="!org.is_active"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ org.country?.name_fr || 'Non renseigné' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <router-link :to="`/admin/organizations/${org.id}`"
                           class="text-orange-600 hover:text-orange-900">
                  Voir
                </router-link>
                <button @click="openEditModal(org)"
                        class="ml-3 text-blue-600 hover:text-blue-900 cursor-pointer">
                  Modifier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal d'édition -->
    <OrganizationEditModal
      :show="showEditModal"
      :organization="selectedOrganization"
      :countries="countries"
      :all-organizations="allOrganizations"
      @close="closeEditModal"
      @saved="onOrganizationSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import OrganizationEditModal from '@/components/admin/organizations/OrganizationEditModal.vue'

const { t } = useI18n()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()

const isLoading = ref(true)
const searchQuery = ref('')
const organizations = ref([])
const selectedOrganization = ref(null)
const stats = ref({
  total: 0,
  verified: 0,
  duplicates: 0,
  active: 0
})
const countries = ref([])
const allOrganizations = ref([])
const showEditModal = ref(false)

// Vérification des permissions (attendre le chargement des rôles)
const checkAccess = async () => {
  await loadUserRoles()

  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

const filteredOrganizations = computed(() => {
  if (!searchQuery.value) return organizations.value

  const query = searchQuery.value.toLowerCase()
  return organizations.value.filter(org =>
    org.name.toLowerCase().includes(query) ||
    org.email.toLowerCase().includes(query)
  )
})

const loadOrganizations = async () => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        country:countries(id, name_fr),
        creator:created_by(
          id,
          first_name,
          last_name,
          email,
          profile_photo_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    organizations.value = data || []
    allOrganizations.value = data || []
    calculateStats()
  } catch (error) {
    console.error('Erreur lors du chargement des organisations:', error)
  } finally {
    isLoading.value = false
  }
}

const loadCountries = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name_fr')
      .order('name_fr')

    if (error) throw error

    countries.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des pays:', error)
  }
}

const openEditModal = (organization) => {
  selectedOrganization.value = organization
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedOrganization.value = null
}

const onOrganizationSaved = (updatedOrganization) => {
  // Mettre à jour l'organisation dans la liste
  const index = organizations.value.findIndex(org => org.id === updatedOrganization.id)
  if (index > -1) {
    organizations.value[index] = updatedOrganization
  }
  calculateStats()
}

const calculateStats = () => {
  stats.value = {
    total: organizations.value.length,
    verified: organizations.value.filter(org => org.is_verified).length,
    duplicates: organizations.value.filter(org => org.is_duplicate).length,
    active: organizations.value.filter(org => org.is_active).length
  }
}

onMounted(async () => {
  try {
    await checkAccess()
    await Promise.all([
      loadOrganizations(),
      loadCountries()
    ])
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>
