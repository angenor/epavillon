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
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ getOrganizationTypeLabel(organization.organization_type) }}
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
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Organisation non trouvée</p>
    </div>

    <!-- Modal d'édition -->
    <div v-if="showEditModal"
         class="fixed inset-0 z-50 overflow-y-auto"
         aria-labelledby="modal-title"
         role="dialog"
         aria-modal="true">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <!-- Overlay -->
        <div @click="closeEditModal"
             class="fixed inset-0 bg-gray-500/75 transition-opacity"
             aria-hidden="true"></div>

        <!-- Modal content -->
        <div class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4" id="modal-title">
                  Modifier l'organisation
                </h3>

                <!-- Informations sur le créateur -->
                <div v-if="organization.creator" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                    Organisation créée par :
                  </h4>
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
                      <p class="font-medium text-blue-900 dark:text-blue-200">
                        {{ organization.creator.first_name }} {{ organization.creator.last_name }}
                      </p>
                      <p class="text-sm text-blue-700 dark:text-blue-400">{{ organization.creator.email }}</p>
                      <p class="text-xs text-blue-600 dark:text-blue-500">
                        Créé le {{ formatDate(organization.created_at) }}
                      </p>
                    </div>
                  </div>
                  <p class="mt-3 text-sm text-blue-700 dark:text-blue-400">
                    Ces informations peuvent vous aider à décider si l'organisation doit être vérifiée.
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Nom -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom de l'organisation *
                    </label>
                    <input v-model="editForm.name"
                           type="text"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  </div>

                  <!-- Acronyme -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Acronyme
                    </label>
                    <input v-model="editForm.acronym"
                           type="text"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  </div>

                  <!-- Email -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input v-model="editForm.email"
                           type="email"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  </div>

                  <!-- Type d'organisation -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type d'organisation *
                    </label>
                    <select v-model="editForm.organization_type"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer">
                      <option value="public_national_institution">Institution publique nationale</option>
                      <option value="international_organization">Organisation internationale</option>
                      <option value="regional_organization">Organisation régionale</option>
                      <option value="ngo_association">ONG/Association</option>
                      <option value="private_sector">Secteur privé</option>
                    </select>
                  </div>

                  <!-- Site web -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Site web
                    </label>
                    <input v-model="editForm.website"
                           type="url"
                           placeholder="https://..."
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  </div>

                  <!-- Pays -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pays
                    </label>
                    <select v-model="editForm.country_id"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer">
                      <option value="">Sélectionner un pays</option>
                      <option v-for="country in countries" :key="country.id" :value="country.id">
                        {{ country.name_fr }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Logo de l'organisation -->
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Logo de l'organisation
                  </label>
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0 cursor-pointer" @click="$refs.logoInput.click()">
                      <img
                        v-if="logoPreview || editForm.logo_url"
                        :src="logoPreview || editForm.logo_url"
                        alt="Logo preview"
                        class="h-20 w-20 object-contain rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-1"
                      />
                      <div
                        v-else
                        class="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                      >
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1">
                      <input
                        type="file"
                        @change="handleLogoUpload"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        class="hidden"
                        ref="logoInput"
                      />
                      <button
                        type="button"
                        @click="$refs.logoInput.click()"
                        class="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Choisir un logo
                      </button>
                      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG ou SVG. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Description -->
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea v-model="editForm.description"
                            rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                </div>

                <!-- Statuts -->
                <div class="mt-4 space-y-2">
                  <label class="flex items-center">
                    <input v-model="editForm.is_active"
                           type="checkbox"
                           class="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 cursor-pointer">
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="editForm.is_verified"
                           type="checkbox"
                           class="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 cursor-pointer">
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Vérifiée</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="editForm.email_verified"
                           type="checkbox"
                           class="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 cursor-pointer">
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Email vérifié</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="editForm.is_duplicate"
                           type="checkbox"
                           class="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 cursor-pointer">
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">En doublon</span>
                  </label>
                </div>

                <!-- Organisation source en cas de doublon -->
                <div v-if="editForm.is_duplicate" class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Doublon de
                  </label>
                  <select v-model="editForm.duplicate_of"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer">
                    <option value="">Sélectionner l'organisation originale</option>
                    <option v-for="org in allOrganizations"
                            :key="org.id"
                            :value="org.id"
                            v-show="org.id !== organization.id">
                      {{ org.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="saveOrganization"
                    :disabled="isSaving"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 cursor-pointer">
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <button @click="closeEditModal"
                    :disabled="isSaving"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()

const isLoading = ref(true)
const isUpdating = ref(false)
const isSaving = ref(false)
const organization = ref(null)
const countries = ref([])
const allOrganizations = ref([])
const showEditModal = ref(false)
const editForm = ref({
  id: null,
  name: '',
  acronym: '',
  email: '',
  email_verified: false,
  organization_type: '',
  logo_url: '',
  website: '',
  country_id: '',
  description: '',
  is_active: true,
  is_duplicate: false,
  duplicate_of: null,
  is_verified: false
})

// Logo handling
const logoFile = ref(null)
const logoPreview = ref('')
const logoInput = ref(null)

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

const openEditModal = () => {
  editForm.value = {
    id: organization.value.id,
    name: organization.value.name || '',
    acronym: organization.value.acronym || '',
    email: organization.value.email || '',
    email_verified: organization.value.email_verified || false,
    organization_type: organization.value.organization_type || '',
    logo_url: organization.value.logo_url || '',
    website: organization.value.website || '',
    country_id: organization.value.country_id || '',
    description: organization.value.description || '',
    is_active: organization.value.is_active !== false,
    is_duplicate: organization.value.is_duplicate || false,
    duplicate_of: organization.value.duplicate_of || null,
    is_verified: organization.value.is_verified || false
  }
  logoPreview.value = ''
  logoFile.value = null
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  logoPreview.value = ''
  logoFile.value = null
}

// Handle logo upload
const handleLogoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('Le fichier est trop volumineux. Taille max: 2MB')
    return
  }

  logoFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Upload logo to storage
const uploadLogo = async (organizationId) => {
  if (!logoFile.value) return null

  const fileExt = logoFile.value.name.split('.').pop()
  const fileName = `logo/${organizationId}_logo_${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('epavillonp')
    .upload(fileName, logoFile.value, {
      upsert: true
    })

  if (error) {
    console.error('Error uploading logo:', error)
    return null
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('epavillonp')
    .getPublicUrl(fileName)

  return publicUrl
}

const saveOrganization = async () => {
  isSaving.value = true
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    // Upload logo first if a new file was selected
    let logoUrl = editForm.value.logo_url
    if (logoFile.value) {
      const uploadedUrl = await uploadLogo(editForm.value.id)
      if (uploadedUrl) {
        logoUrl = uploadedUrl
      }
    }

    const updateData = {
      name: editForm.value.name,
      acronym: editForm.value.acronym || null,
      email: editForm.value.email,
      email_verified: editForm.value.email_verified,
      organization_type: editForm.value.organization_type,
      logo_url: logoUrl || null,
      website: editForm.value.website || null,
      country_id: editForm.value.country_id || null,
      description: editForm.value.description || null,
      is_active: editForm.value.is_active,
      is_duplicate: editForm.value.is_duplicate,
      duplicate_of: editForm.value.is_duplicate ? editForm.value.duplicate_of : null,
      is_verified: editForm.value.is_verified,
      updated_at: new Date().toISOString()
    }

    // Si l'organisation est vérifiée, ajouter les informations de vérification
    if (editForm.value.is_verified && !organization.value.is_verified) {
      updateData.verified_by = userData.user.id
      updateData.verified_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', editForm.value.id)
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
    closeEditModal()

    console.log('Organisation mise à jour avec succès')
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'organisation:', error)
    alert('Erreur lors de la mise à jour de l\'organisation')
  } finally {
    isSaving.value = false
  }
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
      loadAllOrganizations()
    ])
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      router.push('/login')
    }
  }
})
</script>