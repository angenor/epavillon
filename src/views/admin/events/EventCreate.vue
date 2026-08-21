<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-event-create">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Créer un Événement
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        Créer un nouvel événement annuel
      </p>
    </div>

    <form @submit.prevent="createEvent" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre de l'événement *
            </label>
            <input v-model="formData.title"
                   type="text"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Acronyme
            </label>
            <input v-model="formData.acronym"
                   type="text"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Année *
            </label>
            <input v-model.number="formData.year"
                   type="number"
                   :min="new Date().getFullYear()"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mode de participation *
            </label>
            <select v-model="formData.participation_mode"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Sélectionner...</option>
              <option value="online">En ligne</option>
              <option value="hybrid">Hybride</option>
              <option value="in_person">Présentiel</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea v-model="formData.description"
                    rows="4"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date limite de soumission *
          </label>
          <input v-model="formData.submission_deadline"
                 type="datetime-local"
                 required
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>

        <!-- Localisation pour événements physiques -->
        <div v-if="formData.participation_mode !== 'online'" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Localisation</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ville *
              </label>
              <input v-model="formData.city"
                     type="text"
                     required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pays *
              </label>
              <select v-model="formData.country_id"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">Sélectionner un pays...</option>
                <option v-for="country in countries" :key="country.id" :value="country.id">
                  {{ country.name_fr }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse complète *
            </label>
            <textarea v-model="formData.address"
                      rows="2"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </textarea>
          </div>
        </div>

        <!-- Médias : bannière et logo -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Médias
          </h2>

          <div v-if="uploadError" class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            {{ uploadError }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Bannière 32:9 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bannière (32:9)
              </label>

              <div v-if="formData.banner_high_quality_32_9_url" class="flex items-center space-x-3 p-3 mb-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img :src="formData.banner_high_quality_32_9_url" alt="Bannière" class="w-32 h-12 object-cover rounded">
                <button type="button"
                        @click="formData.banner_high_quality_32_9_url = ''"
                        class="cursor-pointer ml-auto p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                </button>
              </div>

              <input ref="bannerFileInput"
                     type="file"
                     accept="image/*"
                     class="hidden"
                     @change="onBannerSelected">
              <button type="button"
                      @click="$refs.bannerFileInput.click()"
                      :disabled="isUploading"
                      class="cursor-pointer w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                {{ isUploading ? 'Téléchargement...' : 'Téléverser une bannière' }}
              </button>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Format recommandé : 32:9 (ex. 1920x540px). PNG, JPG ou WebP, 10 Mo max.
              </p>

              <input v-model="formData.banner_high_quality_32_9_url"
                     type="url"
                     placeholder="ou coller une URL d'image"
                     class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>

            <!-- Logo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo
              </label>

              <div v-if="formData.logo_url" class="flex items-center space-x-3 p-3 mb-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img :src="formData.logo_url" alt="Logo" class="w-16 h-16 object-contain rounded bg-white">
                <button type="button"
                        @click="formData.logo_url = ''"
                        class="cursor-pointer ml-auto p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                </button>
              </div>

              <input ref="logoFileInput"
                     type="file"
                     accept="image/*"
                     class="hidden"
                     @change="onLogoSelected">
              <button type="button"
                      @click="$refs.logoFileInput.click()"
                      :disabled="isUploading"
                      class="cursor-pointer w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                {{ isUploading ? 'Téléchargement...' : 'Téléverser un logo' }}
              </button>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, SVG ou WebP, 5 Mo max.
              </p>

              <input v-model="formData.logo_url"
                     type="url"
                     placeholder="ou coller une URL d'image"
                     class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <router-link to="/admin/events"
                       class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
            Annuler
          </router-link>
          <button type="submit"
                  :disabled="isSaving"
                  class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
            {{ isSaving ? 'Création...' : 'Créer l\'événement' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import { useAuth } from '@/composables/useAuth'
import { useEventMediaUpload } from '@/composables/useEventMediaUpload'

const { t } = useI18n()
const router = useRouter()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()
const { currentUser } = useAuth()
const { isUploading, uploadError, uploadBanner, uploadLogo } = useEventMediaUpload()

const isSaving = ref(false)
const countries = ref([])

const formData = ref({
  title: '',
  acronym: '',
  year: new Date().getFullYear() + 1,
  description: '',
  submission_deadline: '',
  participation_mode: '',
  city: '',
  country_id: '',
  address: '',
  banner_high_quality_32_9_url: '',
  logo_url: ''
})

const onBannerSelected = async (fileEvent) => {
  const file = fileEvent.target.files[0]
  const url = await uploadBanner(file)
  if (url) formData.value.banner_high_quality_32_9_url = url
  fileEvent.target.value = ''
}

const onLogoSelected = async (fileEvent) => {
  const file = fileEvent.target.files[0]
  const url = await uploadLogo(file)
  if (url) formData.value.logo_url = url
  fileEvent.target.value = ''
}

// Vérification des permissions (attendre le chargement des rôles)
const checkAccess = async () => {
  await loadUserRoles()
  
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
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

const createEvent = async () => {
  isSaving.value = true
  
  try {
    const eventData = {
      ...formData.value,
      banner_high_quality_32_9_url: formData.value.banner_high_quality_32_9_url || null,
      logo_url: formData.value.logo_url || null,
      created_by: currentUser.value?.id,
      event_status: 'upcoming',
      submission_status: 'open'
    }

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (error) throw error

    router.push(`/admin/events/${data.id}`)
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  try {
    await checkAccess()
    await loadCountries()
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>