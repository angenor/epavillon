<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Requirements Check -->
      <div v-if="!canCreateEvents" class="mb-8">
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div class="flex">
            <svg class="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {{ t('events.create.requirements.title') }}
              </h3>
              <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p class="mb-3">{{ t('events.create.requirements.description') }}</p>
                <ul class="space-y-2">
                  <li v-for="(requirement, key) in requirementsStatus" :key="key" class="flex items-center">
                    <svg v-if="requirement.met" class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    <span :class="requirement.met ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
                      {{ t(requirement.label) }}
                    </span>
                  </li>
                </ul>
              </div>
              <div class="mt-4 flex space-x-3">
                <button
                  v-if="!authStore.isAuthenticated"
                  @click="goToLogin"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  {{ t('auth.login') }}
                </button>
                <button
                  v-if="authStore.isAuthenticated && !hasOrganization"
                  @click="goToOrganizationSetup"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  {{ t('organization.setup.title') }}
                </button>
                <button
                  v-if="authStore.isAuthenticated && !hasAdminRole"
                  @click="contactAdmin"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  {{ t('events.create.requirements.contactAdmin') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('events.create.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('events.create.subtitle') }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Basic Information Card -->
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {{ t('events.create.sections.basicInfo') }}
          </h2>
          
          <div class="space-y-6">
            <!-- Year -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('events.create.fields.year') }}
              </label>
              <input
                v-model.number="formData.year"
                type="number"
                :min="new Date().getFullYear()"
                :max="new Date().getFullYear() + 5"
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                :placeholder="new Date().getFullYear().toString()"
              />
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('events.create.fields.title') }}
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                :placeholder="t('events.create.placeholders.title')"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('events.create.fields.description') }}
              </label>
              <textarea
                v-model="formData.description"
                rows="4"
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                :placeholder="t('events.create.placeholders.description')"
              />
            </div>

            <!-- Submission Deadline -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('events.create.fields.submissionDeadline') }}
              </label>
              <input
                v-model="formData.submissionDeadline"
                type="datetime-local"
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Event Format Card -->
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {{ t('events.create.sections.format') }}
          </h2>

          <div class="space-y-6">
            <!-- Participation Mode -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('events.create.fields.participationMode') }}
              </label>
              <div class="grid grid-cols-3 gap-3">
                <label
                  v-for="mode in participationModes"
                  :key="mode"
                  class="relative flex cursor-pointer"
                >
                  <input
                    v-model="formData.participationMode"
                    type="radio"
                    :value="mode"
                    class="sr-only peer"
                    required
                  />
                  <div class="flex-1 text-center py-3 px-4 border-2 rounded-lg transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:dark:bg-blue-900/20 border-gray-300 dark:border-gray-600">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ t(`event.formats.${mode}`) }}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Online Event Details -->
            <div v-if="['online', 'hybrid'].includes(formData.participationMode)" class="space-y-4">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('events.create.fields.onlineDetails') }}
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {{ t('events.create.fields.onlineStartDate') }}
                  </label>
                  <input
                    v-model="formData.onlineStartDatetime"
                    type="datetime-local"
                    :required="['online', 'hybrid'].includes(formData.participationMode)"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
                
                <div>
                  <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {{ t('events.create.fields.onlineEndDate') }}
                  </label>
                  <input
                    v-model="formData.onlineEndDatetime"
                    type="datetime-local"
                    :required="['online', 'hybrid'].includes(formData.participationMode)"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <!-- In-Person Event Details -->
            <div v-if="['in_person', 'hybrid'].includes(formData.participationMode)" class="space-y-4">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('events.create.fields.inPersonDetails') }}
              </h3>
              
              <!-- Country Selection -->
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ t('events.create.fields.country') }}
                </label>
                <select
                  v-model="formData.countryId"
                  :required="['in_person', 'hybrid'].includes(formData.participationMode)"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                >
                  <option value="">{{ t('events.create.placeholders.selectCountry') }}</option>
                  <option v-for="country in countries" :key="country.id" :value="country.id">
                    {{ country.name_fr }}
                  </option>
                </select>
              </div>

              <!-- City -->
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ t('events.create.fields.city') }}
                </label>
                <input
                  v-model="formData.city"
                  type="text"
                  :required="['in_person', 'hybrid'].includes(formData.participationMode)"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  :placeholder="t('events.create.placeholders.city')"
                />
              </div>

              <!-- Address -->
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ t('events.create.fields.address') }}
                </label>
                <textarea
                  v-model="formData.address"
                  rows="3"
                  :required="['in_person', 'hybrid'].includes(formData.participationMode)"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                  :placeholder="t('events.create.placeholders.address')"
                />
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {{ t('events.create.fields.inPersonStartDate') }}
                  </label>
                  <input
                    v-model="formData.inPersonStartDate"
                    type="date"
                    :required="['in_person', 'hybrid'].includes(formData.participationMode)"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
                
                <div>
                  <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {{ t('events.create.fields.inPersonEndDate') }}
                  </label>
                  <input
                    v-model="formData.inPersonEndDate"
                    type="date"
                    :required="['in_person', 'hybrid'].includes(formData.participationMode)"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Media Upload Card -->
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {{ t('events.create.sections.media') }}
          </h2>
          
          <div class="space-y-6">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('events.create.mediaDescription') }}
            </p>
            
            <!-- Banner Upload Areas -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- 32:9 Banner -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('events.create.fields.banner32_9') }}
                </label>
                <div class="relative">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleFileUpload($event, 'banner_32_9')"
                    class="sr-only"
                    :id="`banner-32-9-${uniqueId}`"
                  />
                  <label
                    :for="`banner-32-9-${uniqueId}`"
                    class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span class="text-sm text-gray-600 dark:text-gray-400">32:9</span>
                  </label>
                  <div v-if="uploadedBanners.banner_32_9" class="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✓ {{ t('events.create.uploaded') }}
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ t('events.create.lowQualityGenerated') }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 16:9 Banner -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('events.create.fields.banner16_9') }}
                </label>
                <div class="relative">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleFileUpload($event, 'banner_16_9')"
                    class="sr-only"
                    :id="`banner-16-9-${uniqueId}`"
                  />
                  <label
                    :for="`banner-16-9-${uniqueId}`"
                    class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span class="text-sm text-gray-600 dark:text-gray-400">16:9</span>
                  </label>
                  <div v-if="uploadedBanners.banner_16_9" class="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✓ {{ t('events.create.uploaded') }}
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ t('events.create.lowQualityGenerated') }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 1:1 Banner -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('events.create.fields.banner1_1') }}
                </label>
                <div class="relative">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleFileUpload($event, 'banner_1_1')"
                    class="sr-only"
                    :id="`banner-1-1-${uniqueId}`"
                  />
                  <label
                    :for="`banner-1-1-${uniqueId}`"
                    class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span class="text-sm text-gray-600 dark:text-gray-400">1:1</span>
                  </label>
                  <div v-if="uploadedBanners.banner_1_1" class="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✓ {{ t('events.create.uploaded') }}
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ t('events.create.lowQualityGenerated') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            @click="handleCancel"
            class="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="!isSubmitting">{{ t('events.create.submit') }}</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('events.create.submitting') }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationCheck } from '@/composables/useOrganizationCheck'

const { t } = useI18n()
const router = useRouter()
const { supabase } = useSupabase()
const authStore = useAuthStore()
const { hasAdminRole, hasOrganization, canCreateEvents, getRequirementsStatus } = useOrganizationCheck()

// Unique ID for form elements
const uniqueId = Date.now()

// Form data
const formData = reactive({
  year: new Date().getFullYear(),
  title: '',
  description: '',
  submissionDeadline: '',
  participationMode: '',
  onlineStartDatetime: '',
  onlineEndDatetime: '',
  countryId: '',
  city: '',
  address: '',
  inPersonStartDate: '',
  inPersonEndDate: ''
})

// Upload tracking
const uploadedBanners = reactive({
  banner_32_9: null,
  banner_16_9: null,
  banner_1_1: null
})

// Generated banners (low quality versions)
const generatedBanners = reactive({
  banner_low_quality_32_9: null,
  banner_low_quality_16_9: null,
  banner_low_quality_1_1: null
})

// Countries data
const countries = ref([])

const isSubmitting = ref(false)
const participationModes = ['online', 'hybrid', 'in_person']

// Requirements check
const requirementsStatus = computed(() => getRequirementsStatus())

// Load countries on mount
const loadCountries = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name_fr, name_en')
      .order('name_fr')
    
    if (error) throw error
    countries.value = data || []
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

// Load countries when component mounts
loadCountries()


// Utility function to generate low quality version of an image
const generateLowQualityImage = (file, quality = 0.6) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Set canvas dimensions to original image size
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0)
      
      // Convert to blob with reduced quality
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Handle file upload
const handleFileUpload = async (event, bannerType) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    // Store the high quality original file
    uploadedBanners[bannerType] = file
    
    // Generate low quality version
    const lowQualityFile = await generateLowQualityImage(file, 0.4)
    generatedBanners[`banner_low_quality_${bannerType.split('_')[1]}_${bannerType.split('_')[2]}`] = lowQualityFile
    
    // TODO: Upload both versions to Supabase Storage
  } catch (error) {
    console.error('Upload error:', error)
  }
}

// Handle form submission
const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true

  try {
    // Prepare event data
    const eventData = {
      year: formData.year,
      title: formData.title,
      description: formData.description,
      submission_deadline: formData.submissionDeadline,
      participation_mode: formData.participationMode,
      event_status: 'upcoming',
      submission_status: 'open',
      created_by: authStore.user?.id
    }

    // Add online event details if applicable
    if (['online', 'hybrid'].includes(formData.participationMode)) {
      eventData.online_start_datetime = formData.onlineStartDatetime
      eventData.online_end_datetime = formData.onlineEndDatetime
    }

    // Add in-person event details if applicable
    if (['in_person', 'hybrid'].includes(formData.participationMode)) {
      eventData.country_id = formData.countryId
      eventData.city = formData.city
      eventData.address = formData.address
      eventData.in_person_start_date = formData.inPersonStartDate
      eventData.in_person_end_date = formData.inPersonEndDate
    }

    // Upload banners and add URLs to eventData
    if (uploadedBanners.banner_32_9) {
      // TODO: Upload high quality banner and set eventData.banner_high_quality_32_9_url
      // TODO: Upload generated low quality banner and set eventData.banner_low_quality_32_9_url
    }
    if (uploadedBanners.banner_16_9) {
      // TODO: Upload high quality banner and set eventData.banner_high_quality_16_9_url
      // TODO: Upload generated low quality banner and set eventData.banner_low_quality_16_9_url
    }
    if (uploadedBanners.banner_1_1) {
      // TODO: Upload high quality banner and set eventData.banner_high_quality_1_1_url
      // TODO: Upload generated low quality banner and set eventData.banner_low_quality_1_1_url
    }

    // Insert event into database
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (error) throw error

    // Redirect to event detail page
    router.push(`/events/${data.id}`)
  } catch (error) {
    console.error('Error creating event:', error)
    // TODO: Show error notification
  } finally {
    isSubmitting.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  router.back()
}

// Navigation methods for requirements
const goToLogin = () => {
  router.push('/auth/login?redirect=/events/create')
}

const goToOrganizationSetup = () => {
  router.push('/organization/setup?redirect=/events/create')
}

const contactAdmin = () => {
  // TODO: Implement contact admin functionality
  // Could open a modal, navigate to contact page, or show admin contacts
  console.log('Contact admin functionality to be implemented')
}
</script>