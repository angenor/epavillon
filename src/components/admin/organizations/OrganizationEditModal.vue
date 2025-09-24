<template>
  <div v-if="show"
       class="fixed inset-0 z-50 overflow-y-auto"
       aria-labelledby="modal-title"
       role="dialog"
       aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
      <!-- Overlay -->
      <div @click="$emit('close')"
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
              <div v-if="organization?.creator" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
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
                  <input v-model="form.name"
                         type="text"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>

                <!-- Acronyme -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Acronyme
                  </label>
                  <input v-model="form.acronym"
                         type="text"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input v-model="form.email"
                         type="email"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>

                <!-- Type d'organisation -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type d'organisation *
                  </label>
                  <select v-model="form.organization_type"
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
                  <input v-model="form.website"
                         type="url"
                         placeholder="https://..."
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>

                <!-- Pays -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pays
                  </label>
                  <select v-model="form.country_id"
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
                      v-if="logoPreview || form.logo_url"
                      :src="logoPreview || form.logo_url"
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
                      PNG, JPG ou SVG. Max 500kb.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea v-model="form.description"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
              </div>

              <!-- Statuts -->
              <div class="mt-4 space-y-2">
                <label class="flex items-center">
                  <input v-model="form.is_active"
                         type="checkbox"
                         class="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 cursor-pointer">
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
                <label class="flex items-center">
                  <input v-model="form.is_verified"
                         type="checkbox"
                         class="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 cursor-pointer">
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Vérifiée</span>
                </label>
                <label class="flex items-center">
                  <input v-model="form.email_verified"
                         type="checkbox"
                         class="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 cursor-pointer">
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Email vérifié</span>
                </label>
                <label class="flex items-center">
                  <input v-model="form.is_duplicate"
                         type="checkbox"
                         class="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 cursor-pointer">
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">En doublon</span>
                </label>
              </div>

              <!-- Organisation source en cas de doublon -->
              <div v-if="form.is_duplicate" class="mt-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Doublon de
                </label>
                <select v-model="form.duplicate_of"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer">
                  <option value="">Sélectionner l'organisation originale</option>
                  <option v-for="org in allOrganizations"
                          :key="org.id"
                          :value="org.id"
                          v-show="org.id !== organization?.id">
                    {{ org.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="handleSave"
                  :disabled="isSaving"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 cursor-pointer">
            {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
          <button @click="handleClose"
                  :disabled="isSaving"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  organization: {
    type: Object,
    default: null
  },
  countries: {
    type: Array,
    default: () => []
  },
  allOrganizations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

const { supabase } = useSupabase()

// Form data
const form = ref({
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
const isSaving = ref(false)

// Watch for organization changes
watch(() => props.organization, (newOrg) => {
  if (newOrg) {
    form.value = {
      id: newOrg.id,
      name: newOrg.name || '',
      acronym: newOrg.acronym || '',
      email: newOrg.email || '',
      email_verified: newOrg.email_verified || false,
      organization_type: newOrg.organization_type || '',
      logo_url: newOrg.logo_url || '',
      website: newOrg.website || '',
      country_id: newOrg.country_id || '',
      description: newOrg.description || '',
      is_active: newOrg.is_active !== false,
      is_duplicate: newOrg.is_duplicate || false,
      duplicate_of: newOrg.duplicate_of || null,
      is_verified: newOrg.is_verified || false
    }
    // Reset logo preview
    logoPreview.value = ''
    logoFile.value = null
  }
}, { immediate: true })

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handleLogoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (max 500kb)
  if (file.size > 0.5 * 1024 * 1024) {
    alert('Le fichier est trop volumineux. Taille max: 500kb')
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

const handleSave = async () => {
  isSaving.value = true
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    // Upload logo first if a new file was selected
    let logoUrl = form.value.logo_url
    if (logoFile.value) {
      const uploadedUrl = await uploadLogo(form.value.id)
      if (uploadedUrl) {
        logoUrl = uploadedUrl
      }
    }

    const updateData = {
      name: form.value.name,
      acronym: form.value.acronym || null,
      email: form.value.email,
      email_verified: form.value.email_verified,
      organization_type: form.value.organization_type,
      logo_url: logoUrl || null,
      website: form.value.website || null,
      country_id: form.value.country_id || null,
      description: form.value.description || null,
      is_active: form.value.is_active,
      is_duplicate: form.value.is_duplicate,
      duplicate_of: form.value.is_duplicate ? form.value.duplicate_of : null,
      is_verified: form.value.is_verified,
      updated_at: new Date().toISOString()
    }

    // Si l'organisation est vérifiée pour la première fois
    if (form.value.is_verified && !props.organization?.is_verified) {
      updateData.verified_by = userData.user.id
      updateData.verified_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', form.value.id)
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

    emit('saved', data)
    handleClose()
    console.log('Organisation mise à jour avec succès')
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'organisation:', error)
    alert('Erreur lors de la mise à jour de l\'organisation')
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  logoPreview.value = ''
  logoFile.value = null
  emit('close')
}
</script>
