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
        <div class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  Modifier l'organisation
                </h3>
                <div class="mt-4 space-y-4">
                  <!-- Nom -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom de l'organisation
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
                      Email
                    </label>
                    <input v-model="editForm.email"
                           type="email"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  </div>

                  <!-- Type d'organisation -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type d'organisation
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
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  </div>

                  <!-- Logo de l'organisation -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Logo de l'organisation
                    </label>
                    <div class="flex items-center space-x-4">
                      <div class="flex-shrink-0 cursor-pointer" @click="$refs.logoInput.click()">
                        <img
                          v-if="logoPreview || editForm.logo_url"
                          :src="logoPreview || editForm.logo_url"
                          alt="Logo preview"
                          class="h-20 w-20 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
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
                          PNG, JPG ou SVG. Max 500kb.
                        </p>
                      </div>
                    </div>
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

                  <!-- Description -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea v-model="editForm.description"
                              rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                  </div>

                  <!-- Statuts -->
                  <div class="space-y-2">
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
                  <div v-if="editForm.is_duplicate">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Doublon de
                    </label>
                    <select v-model="editForm.duplicate_of"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer">
                      <option value="">Sélectionner l'organisation originale</option>
                      <option v-for="org in allOrganizations" :key="org.id" :value="org.id">
                        {{ org.name }}
                      </option>
                    </select>
                  </div>
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const { t } = useI18n()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()

const isLoading = ref(true)
const searchQuery = ref('')
const organizations = ref([])
const stats = ref({
  total: 0,
  verified: 0,
  duplicates: 0,
  active: 0
})
const countries = ref([])
const allOrganizations = ref([])
const showEditModal = ref(false)
const isSaving = ref(false)
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
        country:countries(id, name_fr)
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
  editForm.value = {
    id: organization.id,
    name: organization.name || '',
    acronym: organization.acronym || '',
    email: organization.email || '',
    email_verified: organization.email_verified || false,
    organization_type: organization.organization_type || '',
    logo_url: organization.logo_url || '',
    website: organization.website || '',
    country_id: organization.country_id || '',
    description: organization.description || '',
    is_active: organization.is_active !== false,
    is_duplicate: organization.is_duplicate || false,
    duplicate_of: organization.duplicate_of || null,
    is_verified: organization.is_verified || false
  }
  // Reset logo preview
  logoPreview.value = ''
  logoFile.value = null
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {
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
  }
  // Reset logo
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
    if (editForm.value.is_verified && !organizations.value.find(o => o.id === editForm.value.id)?.is_verified) {
      updateData.verified_by = userData.user.id
      updateData.verified_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', editForm.value.id)
      .select(`
        *,
        country:countries(id, name_fr)
      `)
      .single()

    if (error) throw error

    // Mettre à jour l'organisation dans la liste
    const index = organizations.value.findIndex(org => org.id === editForm.value.id)
    if (index > -1) {
      organizations.value[index] = data
    }

    calculateStats()
    closeEditModal()

    // Message de succès optionnel
    console.log('Organisation mise à jour avec succès')
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'organisation:', error)
    alert('Erreur lors de la mise à jour de l\'organisation')
  } finally {
    isSaving.value = false
  }
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
