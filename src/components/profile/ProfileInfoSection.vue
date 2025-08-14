<template>
  <div>
    <!-- Mode Lecture -->
    <div v-if="!isEditing" class="space-y-6">
      <!-- Informations Personnelles -->
      <div>
        <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('profile.personalInfo.title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('profile.personalInfo.firstName') }}
            </label>
            <p class="text-gray-900 dark:text-white">{{ user?.first_name || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('profile.personalInfo.lastName') }}
            </label>
            <p class="text-gray-900 dark:text-white">{{ user?.last_name || '-' }}</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('profile.personalInfo.biography') }}
            </label>
            <p class="text-gray-900 dark:text-white">{{ user?.biography || t('profile.personalInfo.noBiography') }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('profile.personalInfo.phone') }}
            </label>
            <p class="text-gray-900 dark:text-white">{{ user?.phone || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('profile.personalInfo.country') }}
            </label>
            <p class="text-gray-900 dark:text-white">{{ userCountry?.name_fr || '-' }}</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('profile.personalInfo.address') }}
            </label>
            <p class="text-gray-900 dark:text-white">{{ user?.address || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Informations Professionnelles -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('profile.professionalInfo.title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('profile.professionalInfo.primaryEmail') }}
            </label>
            <p class="text-gray-900 dark:text-white">{{ user?.email }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ t('profile.professionalInfo.emailNotModifiable') }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('profile.professionalInfo.professionalEmail') }}
            </label>
            <p class="text-gray-900 dark:text-white">{{ user?.email_pro || '-' }}</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('profile.professionalInfo.organization') }}
            </label>
            <div class="flex items-center space-x-2">
              <p class="text-gray-900 dark:text-white">{{ userOrganization?.name || t('profile.professionalInfo.noOrganization') }}</p>
              <div
                v-if="user?.is_organization_verified"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                <font-awesome-icon
                  icon="check-circle"
                  class="mr-1"
                />
                {{ t('profile.professionalInfo.verified') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statut et Badges -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('profile.statusBadges.title') }}
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ t('profile.statusBadges.accountVerified') }}
            </span>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <font-awesome-icon
                icon="check-circle"
                class="mr-1"
              />
              {{ t('profile.statusBadges.verified') }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ t('profile.statusBadges.organizationVerified') }}
            </span>
            <span
              v-if="user?.is_organization_verified"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              <font-awesome-icon
                icon="check-circle"
                class="mr-1"
              />
              {{ t('profile.statusBadges.verified') }}
            </span>
            <span
              v-else
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            >
              <font-awesome-icon
                icon="clock"
                class="mr-1"
              />
              {{ t('profile.statusBadges.pending') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode Édition -->
    <div v-else class="space-y-6">
      <form @submit.prevent="handleSave">
        <!-- Photo de profil -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('profile.personalInfo.profilePhoto') }}
          </label>
          <ProfilePhotoUpload
            v-model="formData.profilePhoto"
            :current-photo-url="user?.profile_photo_url"
            class="max-w-sm"
          />
        </div>

        <!-- Informations Personnelles -->
        <div>
          <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-4">
            {{ t('profile.personalInfo.title') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="firstName"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ t('profile.personalInfo.firstName') }} *
              </label>
              <input
                id="firstName"
                v-model="formData.first_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label
                for="lastName"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ t('profile.personalInfo.lastName') }} *
              </label>
              <input
                id="lastName"
                v-model="formData.last_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div class="md:col-span-2">
              <label
                for="biography"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ t('profile.personalInfo.biography') }}
              </label>
              <textarea
                id="biography"
                v-model="formData.biography"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                :placeholder="t('profile.personalInfo.biographyPlaceholder')"
              />
            </div>
            <div>
              <label
                for="phone"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ t('profile.personalInfo.phone') }}
              </label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label
                for="country"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ t('profile.personalInfo.country') }}
              </label>
              <select
                id="country"
                v-model="formData.country_id"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{{ t('profile.personalInfo.selectCountry') }}</option>
                <option
                  v-for="country in countries"
                  :key="country.id"
                  :value="country.id"
                >
                  {{ country.name_fr }}
                </option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label
                for="address"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ t('profile.personalInfo.address') }}
              </label>
              <textarea
                id="address"
                v-model="formData.address"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                :placeholder="t('profile.personalInfo.addressPlaceholder')"
              />
            </div>
          </div>
        </div>

        <!-- Email professionnel -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-4">
            {{ t('profile.professionalInfo.title') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('profile.professionalInfo.primaryEmail') }}
              </label>
              <input
                type="email"
                :value="user?.email"
                disabled
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              >
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ t('profile.professionalInfo.emailNotModifiable') }}
              </p>
            </div>
            <div>
              <label
                for="emailPro"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ t('profile.professionalInfo.professionalEmail') }}
              </label>
              <input
                id="emailPro"
                v-model="formData.email_pro"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('profile.professionalInfo.organization') }}
              </label>
              <OrganizationSelector
                v-model="formData.organization_id"
                :current-organization="userOrganization"
              />
            </div>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <font-awesome-icon
              v-if="saving"
              icon="spinner"
              class="animate-spin mr-2"
            />
            {{ saving ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload.vue'
import OrganizationSelector from '@/components/profile/OrganizationSelector.vue'

const { t } = useI18n()

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  userCountry: {
    type: Object,
    default: null
  },
  userOrganization: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:user', 'cancel-edit', 'save'])

const saving = ref(false)
const countries = ref([])

// Données du formulaire
const formData = reactive({
  first_name: '',
  last_name: '',
  biography: '',
  phone: '',
  address: '',
  country_id: '',
  email_pro: '',
  organization_id: '',
  profilePhoto: null
})

// Initialiser les données du formulaire
const initFormData = () => {
  console.log('initFormData appelé, profilePhoto actuel:', formData.profilePhoto) // Debug
  if (props.user) {
    Object.assign(formData, {
      first_name: props.user.first_name || '',
      last_name: props.user.last_name || '',
      biography: props.user.biography || '',
      phone: props.user.phone || '',
      address: props.user.address || '',
      country_id: props.user.country_id || '',
      email_pro: props.user.email_pro || '',
      organization_id: props.user.organization_id || '',
      // Ne pas réinitialiser profilePhoto si elle a déjà une valeur
      profilePhoto: formData.profilePhoto || null
    })
    console.log('FormData après init:', formData) // Debug
  }
}

// Charger les pays
const loadCountries = async () => {
  try {
    const { supabase } = await import('@/composables/useSupabase')
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name_fr')

    if (error) throw error
    countries.value = data || []
  } catch (error) {
    console.error('Error loading countries:', error)
    countries.value = []
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    // Préparer les données à sauvegarder
    const updateData = { ...formData }
    
    console.log('FormData avant sauvegarde:', formData) // Debug
    
    // Si une nouvelle photo a été sélectionnée, l'inclure
    if (formData.profilePhoto) {
      updateData.profilePhoto = formData.profilePhoto
      console.log('Photo détectée dans formData:', formData.profilePhoto) // Debug
    } else {
      console.log('Aucune nouvelle photo détectée') // Debug
    }
    
    console.log('UpdateData envoyé:', updateData) // Debug
    emit('save', updateData)
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  initFormData()
  emit('cancel-edit')
}

// Watchers
watch(() => props.user, () => {
  // Ne réinitialiser que si on n'est pas en mode édition pour préserver les changements en cours
  if (!props.isEditing) {
    initFormData()
  }
}, { immediate: true })

// Watcher pour initialiser quand on commence l'édition
watch(() => props.isEditing, (newIsEditing) => {
  if (newIsEditing) {
    initFormData()
  }
})

// Lifecycle
onMounted(() => {
  loadCountries()
})
</script>