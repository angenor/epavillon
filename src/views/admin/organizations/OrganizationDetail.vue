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
      <!-- Header avec bouton modifier -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-4">
            <img v-if="organization.logo_url"
                 :src="organization.logo_url"
                 :alt="organization.name"
                 class="h-16 w-16 rounded-lg object-contain bg-gray-100 dark:bg-gray-700 p-1">
            <div v-else class="h-16 w-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ organization.name }}
                <span v-if="organization.acronym" class="text-lg text-gray-500 dark:text-gray-400 ml-2">
                  ({{ organization.acronym }})
                </span>
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
                <span v-if="!organization.is_active"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Inactive
                </span>
              </div>
            </div>
          </div>
          <button @click="openEditModal"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            Modifier
          </button>
        </div>
      </div>

      <!-- Informations détaillées -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Informations générales -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informations générales</h2>
          <dl class="space-y-4">
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Type d'organisation</dt>
              <dd class="mt-1">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      :class="getOrganizationTypeClass(organization.organization_type)">
                  <svg class="h-3 w-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  {{ getOrganizationTypeLabel(organization.organization_type) }}
                </span>
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
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email vérifié</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                <span v-if="organization.email_verified" class="text-green-600">Oui</span>
                <span v-else class="text-red-600">Non</span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Informations de création -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Créée par</h2>
          <div v-if="organization.creator" class="space-y-4">
            <div class="flex items-center space-x-3">
              <img v-if="organization.creator.profile_photo_url"
                   :src="organization.creator.profile_photo_url"
                   :alt="`${organization.creator.first_name} ${organization.creator.last_name}`"
                   class="h-12 w-12 rounded-full object-cover">
              <div v-else class="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ organization.creator.first_name }} {{ organization.creator.last_name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ organization.creator.email }}</p>
              </div>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Date de création</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(organization.created_at) }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière modification</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(organization.updated_at) }}
              </dd>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500 dark:text-gray-400">
            Aucune information sur le créateur
          </div>
        </div>

        <!-- Actions administratives -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Actions administratives</h2>
          <div class="space-y-3">
            <button v-if="!organization.is_verified"
                    @click="verifyOrganization"
                    :disabled="isUpdating"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer">
              {{ isUpdating ? 'En cours...' : 'Vérifier l\'organisation' }}
            </button>
            <button v-if="organization.is_active"
                    @click="deactivateOrganization"
                    :disabled="isUpdating"
                    class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer">
              {{ isUpdating ? 'En cours...' : 'Désactiver' }}
            </button>
            <button v-else
                    @click="activateOrganization"
                    :disabled="isUpdating"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer">
              {{ isUpdating ? 'En cours...' : 'Réactiver' }}
            </button>

            <!-- Informations de vérification -->
            <div v-if="organization.is_verified && organization.verified_by" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Vérifiée par {{ organization.verifier?.first_name }} {{ organization.verifier?.last_name }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500">
                {{ formatDate(organization.verified_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="organization.description" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Description</h2>
        <p class="text-gray-700 dark:text-gray-300">{{ organization.description }}</p>
      </div>

      <!-- Informations sur les doublons -->
      <div v-if="organization.is_duplicate && organization.duplicate_of" class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-yellow-800 dark:text-yellow-300">Information sur le doublon</h2>
        <p class="text-yellow-700 dark:text-yellow-400">
          Cette organisation est un doublon de :
          <router-link :to="`/admin/organizations/${organization.duplicate_of}`"
                       class="font-medium underline">
            Voir l'organisation originale
          </router-link>
        </p>
      </div>

      <!-- Activités soumises par l'organisation -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Activités soumises ({{ activities.length }})
        </h2>

        <div v-if="isLoadingActivities" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>

        <div v-else-if="activities.length === 0" class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">Aucune activité soumise par cette organisation</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="activity in activities" :key="activity.id"
               class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                  {{ activity.title }}
                </h3>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="{
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': activity.validation_status === 'draft',
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': activity.validation_status === 'submitted',
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': activity.validation_status === 'under_review',
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': activity.validation_status === 'approved',
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': activity.validation_status === 'rejected',
                          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300': activity.validation_status === 'live',
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': activity.validation_status === 'completed'
                        }">
                    {{ getValidationStatusLabel(activity.validation_status) }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {{ getActivityTypeLabel(activity.activity_type) }}
                  </span>
                </div>

                <!-- Informations du soumissionnaire -->
                <div class="flex items-center space-x-3 mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <img v-if="activity.submitter.profile_photo_url"
                       :src="activity.submitter.profile_photo_url"
                       :alt="`${activity.submitter.first_name} ${activity.submitter.last_name}`"
                       class="h-10 w-10 rounded-full object-cover">
                  <div v-else class="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      Soumis par : {{ activity.submitter.first_name }} {{ activity.submitter.last_name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ activity.submitter.email }}</p>
                  </div>
                </div>

                <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <p>Créée le {{ formatDate(activity.created_at) }}</p>
                  <p v-if="activity.proposed_start_date">
                    Date proposée : {{ formatDate(activity.proposed_start_date) }}
                  </p>
                </div>
              </div>

              <router-link :to="`/admin/activities/${activity.id}`"
                           class="ml-4 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 cursor-pointer">
                Voir détails
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Organisation non trouvée</p>
    </div>

    <!-- Modal d'édition -->
    <OrganizationEditModal
      :show="showEditModal"
      :organization="organization"
      :countries="countries"
      :all-organizations="allOrganizations"
      @close="closeEditModal"
      @saved="onOrganizationSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import OrganizationEditModal from '@/components/admin/organizations/OrganizationEditModal.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()

const isLoading = ref(true)
const isUpdating = ref(false)
const isLoadingActivities = ref(true)
const organization = ref(null)
const countries = ref([])
const allOrganizations = ref([])
const activities = ref([])
const showEditModal = ref(false)

// Vérification des permissions
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
        country:countries(id, name_fr),
        creator:created_by(
          id,
          first_name,
          last_name,
          email,
          profile_photo_url
        ),
        verifier:verified_by(
          id,
          first_name,
          last_name
        )
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

const loadAllOrganizations = async () => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name')
      .neq('id', route.params.id)
      .order('name')

    if (error) throw error
    allOrganizations.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des organisations:', error)
  }
}

const loadActivities = async () => {
  isLoadingActivities.value = true
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        activity_type,
        validation_status,
        proposed_start_date,
        created_at,
        submitter:submitted_by(
          id,
          first_name,
          last_name,
          email,
          profile_photo_url
        )
      `)
      .eq('organization_id', route.params.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    activities.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error)
  } finally {
    isLoadingActivities.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getOrganizationTypeLabel = (type) => {
  const types = {
    'public_national_institution': 'Institution publique nationale',
    'international_organization': 'Organisation internationale',
    'regional_organization': 'Organisation régionale',
    'ngo_association': 'ONG/Association',
    'private_sector': 'Secteur privé'
  }
  return types[type] || type
}

// Classes CSS pour les types d'organisation (correspondant aux couleurs du graphique)
const getOrganizationTypeClass = (type) => {
  const classes = {
    'public_national_institution': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'international_organization': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'regional_organization': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'ngo_association': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'private_sector': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  }
  return classes[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
}

const getValidationStatusLabel = (status) => {
  const statuses = {
    'draft': 'Brouillon',
    'submitted': 'Soumise',
    'under_review': 'En révision',
    'approved': 'Approuvée',
    'rejected': 'Rejetée',
    'cancelled': 'Annulée',
    'live': 'En direct',
    'completed': 'Terminée'
  }
  return statuses[status] || status
}

const getActivityTypeLabel = (type) => {
  const types = {
    'side_event': 'Événement parallèle',
    'country_day': 'Journée pays',
    'other': 'Autre'
  }
  return types[type] || type
}

const openEditModal = () => {
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const onOrganizationSaved = (updatedOrganization) => {
  organization.value = updatedOrganization
}

const verifyOrganization = async () => {
  isUpdating.value = true
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    const { data, error } = await supabase
      .from('organizations')
      .update({
        is_verified: true,
        verified_by: userData.user.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', organization.value.id)
      .select(`
        *,
        country:countries(id, name_fr),
        creator:created_by(
          id,
          first_name,
          last_name,
          email,
          profile_photo_url
        ),
        verifier:verified_by(
          id,
          first_name,
          last_name
        )
      `)
      .single()

    if (error) throw error

    organization.value = data
    console.log('Organisation vérifiée avec succès')
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    alert('Erreur lors de la vérification de l\'organisation')
  } finally {
    isUpdating.value = false
  }
}

const deactivateOrganization = async () => {
  isUpdating.value = true
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', organization.value.id)
      .select(`
        *,
        country:countries(id, name_fr),
        creator:created_by(
          id,
          first_name,
          last_name,
          email,
          profile_photo_url
        ),
        verifier:verified_by(
          id,
          first_name,
          last_name
        )
      `)
      .single()

    if (error) throw error

    organization.value = data
    console.log('Organisation désactivée avec succès')
  } catch (error) {
    console.error('Erreur lors de la désactivation:', error)
    alert('Erreur lors de la désactivation de l\'organisation')
  } finally {
    isUpdating.value = false
  }
}

const activateOrganization = async () => {
  isUpdating.value = true
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', organization.value.id)
      .select(`
        *,
        country:countries(id, name_fr),
        creator:created_by(
          id,
          first_name,
          last_name,
          email,
          profile_photo_url
        ),
        verifier:verified_by(
          id,
          first_name,
          last_name
        )
      `)
      .single()

    if (error) throw error

    organization.value = data
    console.log('Organisation réactivée avec succès')
  } catch (error) {
    console.error('Erreur lors de la réactivation:', error)
    alert('Erreur lors de la réactivation de l\'organisation')
  } finally {
    isUpdating.value = false
  }
}

onMounted(async () => {
  try {
    await checkAccess()
    await Promise.all([
      loadOrganization(),
      loadCountries(),
      loadAllOrganizations(),
      loadActivities()
    ])
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      router.push('/login')
    }
  }
})
</script>