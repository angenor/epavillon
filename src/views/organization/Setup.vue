<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('organization.setup.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('organization.setup.subtitle') }}
        </p>
      </div>

      <!-- Steps Indicator -->
      <div class="mb-8">
        <div class="flex items-center">
          <div class="flex items-center text-blue-600 dark:text-blue-400">
            <div class="flex items-center justify-center w-8 h-8 border-2 border-blue-600 dark:border-blue-400 rounded-full">
              <span class="text-sm font-medium">1</span>
            </div>
            <span class="ml-2 text-sm font-medium">{{ t('organization.setup.step1') }}</span>
          </div>
          <div class="flex-1 mx-4 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
          <div :class="currentStep >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'" class="flex items-center">
            <div :class="currentStep >= 2 ? 'border-blue-600 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'" class="flex items-center justify-center w-8 h-8 border-2 rounded-full">
              <span class="text-sm font-medium">2</span>
            </div>
            <span class="ml-2 text-sm font-medium">{{ t('organization.setup.step2') }}</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Search Existing Organizations -->
      <div v-if="currentStep === 1" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {{ t('organization.setup.searchTitle') }}
        </h2>
        
        <!-- Search Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('organization.setup.searchLabel') }}
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              @input="searchOrganizations"
              :placeholder="t('organization.setup.searchPlaceholder')"
              class="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
            <svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="searchLoading" class="text-center py-8">
          <div class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ t('organization.setup.searching') }}
          </div>
        </div>

        <!-- Search Results -->
        <div v-else-if="searchResults.length > 0" class="space-y-3 mb-6">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('organization.setup.resultsTitle') }}
          </h3>
          <div class="space-y-2">
            <div
              v-for="org in searchResults"
              :key="org.organization_id"
              @click="selectOrganization(org)"
              class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ org.name }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ t(`organization.types.${org.organization_type}`) }}
                    <span v-if="org.is_verified" class="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      {{ t('organization.verified') }}
                    </span>
                  </p>
                  <p v-if="org.match_type !== 'exact_name'" class="text-xs text-blue-600 dark:text-blue-400">
                    {{ t('organization.setup.matchedAs') }}: "{{ org.matched_name }}"
                  </p>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results or Create New -->
        <div v-else-if="searchQuery.length > 2 && !searchLoading" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-4a1 1 0 011-1h4a1 1 0 011 1v4M7 7h10M7 11h10" />
          </svg>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('organization.setup.noResults') }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between pt-6">
          <button
            @click="goBack"
            class="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {{ t('common.back') }}
          </button>
          <button
            @click="goToCreateNew"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {{ t('organization.setup.createNew') }}
          </button>
        </div>
      </div>

      <!-- Step 2: Create New Organization -->
      <div v-if="currentStep === 2" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {{ t('organization.setup.createTitle') }}
        </h2>

        <form @submit.prevent="createOrganization" class="space-y-6">
          <!-- Organization Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('organization.fields.name') }} *
            </label>
            <input
              v-model="newOrganization.name"
              type="text"
              required
              :placeholder="t('organization.placeholders.name')"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <!-- Organization Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('organization.fields.email') }} *
            </label>
            <input
              v-model="newOrganization.email"
              type="email"
              required
              :placeholder="t('organization.placeholders.email')"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <!-- Organization Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('organization.fields.type') }} *
            </label>
            <select
              v-model="newOrganization.organization_type"
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="">{{ t('organization.placeholders.selectType') }}</option>
              <option v-for="type in organizationTypes" :key="type" :value="type">
                {{ t(`organization.types.${type}`) }}
              </option>
            </select>
          </div>

          <!-- Country -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('organization.fields.country') }} *
            </label>
            <select
              v-model="newOrganization.country_id"
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="">{{ t('organization.placeholders.selectCountry') }}</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ country.name_fr }}
              </option>
            </select>
          </div>

          <!-- Website (Optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('organization.fields.website') }}
            </label>
            <input
              v-model="newOrganization.website"
              type="url"
              :placeholder="t('organization.placeholders.website')"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <!-- Description (Optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('organization.fields.description') }}
            </label>
            <textarea
              v-model="newOrganization.description"
              rows="3"
              :placeholder="t('organization.placeholders.description')"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between pt-6">
            <button
              type="button"
              @click="goBackToSearch"
              class="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {{ t('common.back') }}
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="!isSubmitting">{{ t('organization.setup.create') }}</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ t('organization.setup.creating') }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { supabase } = useSupabase()
const authStore = useAuthStore()

// State
const currentStep = ref(1)
const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const isSubmitting = ref(false)
const countries = ref([])

// Form data for new organization  
const newOrganization = reactive({
  name: '',
  email: '',
  organization_type: '',
  country_id: '',
  website: '',
  description: ''
})

const organizationTypes = [
  'public_national_institution',
  'international_organization', 
  'regional_organization',
  'ngo_association',
  'private_sector'
]

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

// Search organizations with debounce
let searchTimeout = null
const searchOrganizations = async () => {
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    return
  }

  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      searchLoading.value = true
      
      // Use the search function from the database
      const { data, error } = await supabase
        .rpc('search_organizations', { search_query: searchQuery.value })
      
      if (error) throw error
      searchResults.value = data || []
    } catch (error) {
      console.error('Error searching organizations:', error)
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 300) // 300ms debounce
}

// Select existing organization
const selectOrganization = async (organization) => {
  try {
    // Update user's organization_id
    const { error } = await supabase
      .from('users')
      .update({ organization_id: organization.organization_id })
      .eq('id', authStore.user.id)
    
    if (error) throw error
    
    // Update the auth store profile
    await authStore.fetchUser()
    
    // Redirect to the original destination or events
    const redirectTo = route.query.redirect || '/events'
    router.push(redirectTo)
  } catch (error) {
    console.error('Error selecting organization:', error)
    // TODO: Show error notification
  }
}

// Create new organization
const createOrganization = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // Create the organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        ...newOrganization,
        created_by: authStore.user.id
      })
      .select()
      .single()
    
    if (orgError) throw orgError
    
    // Update user's organization_id
    const { error: userError } = await supabase
      .from('users')
      .update({ organization_id: orgData.id })
      .eq('id', authStore.user.id)
    
    if (userError) throw userError
    
    // Update the auth store profile
    await authStore.fetchUser()
    
    // Redirect to the original destination or events
    const redirectTo = route.query.redirect || '/events'
    router.push(redirectTo)
  } catch (error) {
    console.error('Error creating organization:', error)
    // TODO: Show error notification
  } finally {
    isSubmitting.value = false
  }
}

// Navigation methods
const goBack = () => {
  const redirectTo = route.query.redirect || '/events'
  router.push(redirectTo)
}

const goToCreateNew = () => {
  currentStep.value = 2
}

const goBackToSearch = () => {
  currentStep.value = 1
}

onMounted(() => {
  loadCountries()
})
</script>