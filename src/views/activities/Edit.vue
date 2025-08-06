<template>
  <div class="min-h-screen relative transition-colors duration-200">
    <!-- Image de fond avec repeat -->
    <div 
      class="absolute inset-0 z-0"
      :style="{
        backgroundImage: 'url(/images/people-bg/people-bg-2.jpg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left'
      }"
    >
      <!-- Overlay pour améliorer la lisibilité -->
      <div class="absolute inset-0 bg-white/80 dark:bg-gray-900/80"></div>
    </div>
    
    <div class="relative z-10 max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-96">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div class="flex">
          <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              {{ t('activities.edit.error.title') }}
            </h3>
            <p class="mt-2 text-sm text-red-700 dark:text-red-300">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Edit form -->
      <div v-else-if="activity && !canEdit" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div class="flex">
          <svg class="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {{ t('activities.edit.noPermission.title') }}
            </h3>
            <p class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              {{ t('activities.edit.noPermission.description') }}
            </p>
          </div>
        </div>
      </div>

      <div v-else-if="activity" class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <!-- Modern Header -->
        <div class="bg-orange-600 dark:bg-orange-700 text-white px-6 py-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold mb-2">
                {{ t('activities.edit.title') }}
              </h1>
              <p class="text-orange-100 dark:text-orange-200 text-sm md:text-base">
                {{ t('activities.edit.subtitle') }}
              </p>
            </div>
            <div class="hidden md:block p-3 bg-white/10 rounded-xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-8">
          <!-- Basic Information -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('activities.edit.sections.basicInfo') }}
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Title -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    {{ t('activity.submit.fields.title') }}
                  </span>
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  :placeholder="t('activity.submit.placeholders.title')"
                />
              </div>

              <!-- Activity Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    {{ t('activity.submit.fields.activityType') }}
                  </span>
                </label>
                <select
                  v-model="formData.activity_type"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="">{{ t('activity.submit.placeholders.selectType') }}</option>
                  <option value="side_event">{{ t('activity.submit.types.side_event') }}</option>
                  <option value="country_day">{{ t('activity.submit.types.country_day') }}</option>
                  <option value="other">{{ t('activity.submit.types.other') }}</option>
                </select>
              </div>

              <!-- Format -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
                    </svg>
                    {{ t('activity.submit.fields.format') }}
                  </span>
                </label>
                <select
                  v-model="formData.format"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="">{{ t('activity.submit.placeholders.selectFormat') }}</option>
                  <option value="online">{{ t('activity.submit.formats.online') }}</option>
                  <option value="in_person">{{ t('activity.submit.formats.in_person') }}</option>
                  <option value="hybrid">{{ t('activity.submit.formats.hybrid') }}</option>
                </select>
              </div>

              <!-- Country -->
              <div v-if="formData.format === 'in_person' || formData.format === 'hybrid'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {{ t('activity.submit.fields.country') }}
                  </span>
                </label>
                <select
                  v-model="formData.country_id"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="">{{ t('activity.submit.placeholders.selectCountry') }}</option>
                  <option v-for="country in countries" :key="country.id" :value="country.id">
                    {{ country.name_fr }}
                  </option>
                </select>
              </div>
            </div>
          </div>

              <!-- Objectives -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                    </svg>
                    {{ t('activity.submit.fields.objectives') }}
                  </span>
                </label>
                <textarea
                  v-model="formData.objectives"
                  rows="4"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                  :placeholder="t('activity.submit.placeholders.objectives')"
                />
              </div>

          <!-- Detailed Presentation -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('activity.submit.fields.detailedPresentation') }}
              </h2>
            </div>

            <RichTextEditor
              v-model="formData.detailed_presentation"
              :max-length="5000"
              :placeholder="t('activity.submit.placeholders.detailedPresentation')"
            />
          </div>

          <!-- Themes and Categories -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('activities.edit.sections.themesAndCategories') }}
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Main Themes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {{ t('activity.submit.fields.themes') }}
                </label>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  <label v-for="theme in themes" :key="theme" class="flex items-center">
                    <input
                      v-model="formData.main_themes"
                      type="checkbox"
                      :value="theme"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {{ t(`activity.submit.themes.${theme}`) }}
                    </span>
                  </label>
                </div>
              </div>

              <!-- Categories -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {{ t('activity.submit.fields.categories') }}
                </label>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  <label v-for="category in categories" :key="category" class="flex items-center">
                    <input
                      v-model="formData.categories"
                      type="checkbox"
                      :value="category"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {{ t(`activity.submit.categories.${category}`) }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('activities.edit.sections.schedule') }}
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Start Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activity.submit.fields.proposedStartDate') }}
                </label>
                <input
                  v-model="formData.proposed_start_date"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>

              <!-- End Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activity.submit.fields.proposedEndDate') }}
                </label>
                <input
                  v-model="formData.proposed_end_date"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              @click="goBack"
              class="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              {{ t('common.cancel') }}
            </button>

            <div class="flex space-x-3">
              <button
                type="button"
                @click="saveDraft"
                :disabled="isSaving"
                class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                <span v-if="isSaving" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t('activity.draft.saving') }}
                </span>
                <span v-else>{{ t('activity.draft.save') }}</span>
              </button>

              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                <span v-if="isSubmitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t('activities.edit.updating') }}
                </span>
                <span v-else>{{ t('activities.edit.update') }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()
const authStore = useAuthStore()

// Reactive data
const isLoading = ref(true)
const isSubmitting = ref(false)
const isSaving = ref(false)
const error = ref(null)
const activity = ref(null)
const countries = ref([])

// Form data
const formData = ref({
  title: '',
  activity_type: '',
  format: '',
  objectives: '',
  detailed_presentation: '',
  main_themes: [],
  categories: [],
  proposed_start_date: '',
  proposed_end_date: '',
  country_id: ''
})

// Static options
const themes = [
  'mitigation', 'adaptation', 'climate_resilience', 'loss_and_damage',
  'clean_tech_innovations', 'renewable_energy_land', 'health_solidarity',
  'industry_transition', 'transport_urbanization', 'nature_oceans',
  'agriculture_food', 'sustainable_livestock', 'gender', 'youth',
  'technology', 'finance', 'other'
]

const categories = [
  'capacity_building', 'results_sharing', 'technological_innovation',
  'field_project', 'best_practices', 'awareness', 'consultation'
]

// Computed properties
const canEdit = computed(() => {
  if (!activity.value || !authStore.user) return false
  
  // User can edit their own activity or if they are admin
  return activity.value.submitted_by === authStore.user.id || 
         authStore.profile?.user_roles?.some(role => 
           ['admin', 'super_admin'].includes(role.role) && role.is_active
         )
})

// Methods
const loadActivity = async () => {
  try {
    isLoading.value = true
    error.value = null

    const activityId = route.params.id
    
    // Load activity
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single()

    if (activityError) throw activityError

    activity.value = activityData
    
    // Populate form data
    // Convert HTML to plain text for objectives if it contains HTML tags
    let plainObjectives = activityData.objectives || ''
    if (plainObjectives.includes('<p>')) {
      // Remove HTML tags from objectives
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = plainObjectives
      plainObjectives = tempDiv.textContent || tempDiv.innerText || ''
    }

    formData.value = {
      title: activityData.title || '',
      activity_type: activityData.activity_type || '',
      format: activityData.format || '',
      objectives: plainObjectives,
      detailed_presentation: activityData.detailed_presentation || '',
      main_themes: activityData.main_themes || [],
      categories: activityData.categories || [],
      proposed_start_date: activityData.proposed_start_date ? 
        new Date(activityData.proposed_start_date).toISOString().slice(0, 16) : '',
      proposed_end_date: activityData.proposed_end_date ? 
        new Date(activityData.proposed_end_date).toISOString().slice(0, 16) : '',
      country_id: activityData.country_id || ''
    }

  } catch (err) {
    console.error('Error loading activity:', err)
    error.value = t('activities.edit.error.loadFailed')
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
  } catch (err) {
    console.error('Error loading countries:', err)
  }
}

const handleSubmit = async () => {
  if (!canEdit.value || isSubmitting.value) return

  try {
    isSubmitting.value = true
    error.value = null

    console.log('=== STARTING UPDATE PROCESS ===')
    console.log('Activity ID:', activity.value.id)
    console.log('User ID:', authStore.user.id)

    // First, let's try a simple title-only update to isolate the issue
    const testTitle = `EDITED: ${formData.value.title} - ${new Date().toISOString()}`
    console.log('Testing with simple title update:', testTitle)

    // Perform update with explicit transaction handling
    const { data: titleUpdateResult, error: titleUpdateError } = await supabase
      .from('activities')
      .update({ 
        title: testTitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', activity.value.id)
      .select('id, title, updated_at')

    if (titleUpdateError) {
      console.error('Title update failed:', titleUpdateError)
      throw titleUpdateError
    }

    console.log('Title update result:', titleUpdateResult)

    // Wait a moment for the database to process
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify the simple update worked
    const { data: verifyTitle, error: verifyTitleError } = await supabase
      .from('activities')
      .select('id, title, updated_at')
      .eq('id', activity.value.id)
      .single()

    if (verifyTitleError) {
      console.error('Title verification failed:', verifyTitleError)
      throw verifyTitleError
    }

    console.log('Title verification result:', verifyTitle)
    const titleMatches = verifyTitle.title === testTitle
    console.log('Title persistence check:', titleMatches ? 'SUCCESS' : 'FAILED')

    if (!titleMatches) {
      throw new Error(`Title update failed to persist. Expected: "${testTitle}", Found: "${verifyTitle.title}"`)
    }

    // If simple update worked, proceed with full update
    console.log('Simple update successful, proceeding with full update...')

    // Ensure datetime values are properly formatted
    const startDate = formData.value.proposed_start_date ? 
      new Date(formData.value.proposed_start_date).toISOString() : null
    const endDate = formData.value.proposed_end_date ? 
      new Date(formData.value.proposed_end_date).toISOString() : null

    // Ensure arrays are properly formatted
    const finalMainThemes = Array.isArray(formData.value.main_themes) && formData.value.main_themes.length > 0 ? 
      formData.value.main_themes : ['other']
    const finalCategories = Array.isArray(formData.value.categories) && formData.value.categories.length > 0 ? 
      formData.value.categories : ['other']

    const fullUpdateData = {
      title: formData.value.title,
      activity_type: formData.value.activity_type,
      format: formData.value.format,
      objectives: formData.value.objectives,
      detailed_presentation: formData.value.detailed_presentation,
      main_themes: finalMainThemes,
      categories: finalCategories,
      proposed_start_date: startDate,
      proposed_end_date: endDate,
      country_id: formData.value.country_id || null,
      updated_at: new Date().toISOString()
    }

    console.log('Full update data:', fullUpdateData)

    // Perform the full update
    const { data: fullUpdateResult, error: fullUpdateError } = await supabase
      .from('activities')
      .update(fullUpdateData)
      .eq('id', activity.value.id)
      .select()

    if (fullUpdateError) {
      console.error('Full update failed:', fullUpdateError)
      throw fullUpdateError
    }

    console.log('Full update result:', fullUpdateResult)

    // Wait for database processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Final verification
    const { data: finalVerification, error: finalVerifyError } = await supabase
      .from('activities')
      .select('title, activity_type, format, objectives, detailed_presentation, main_themes, categories, updated_at')
      .eq('id', activity.value.id)
      .single()

    if (finalVerifyError) {
      console.error('Final verification failed:', finalVerifyError)
      throw finalVerifyError
    }

    console.log('Final verification result:', finalVerification)

    // Check if the final update persisted
    const finalTitleMatches = finalVerification.title === formData.value.title
    console.log('Final update persistence check:', finalTitleMatches ? 'SUCCESS' : 'FAILED')
    console.log('Expected title:', formData.value.title)
    console.log('Actual title:', finalVerification.title)

    if (!finalTitleMatches) {
      throw new Error('Full update failed to persist. The changes were not saved to the database.')
    }

    // Update local activity data
    activity.value = { ...activity.value, ...fullUpdateResult[0] }

    console.log('=== UPDATE PROCESS COMPLETED SUCCESSFULLY ===')

    // Redirect to activity detail page
    setTimeout(() => {
      router.push(`/activities/${activity.value.id}`)
    }, 500)

  } catch (err) {
    console.error('=== UPDATE PROCESS FAILED ===')
    console.error('Error updating activity:', err)
    error.value = t('activities.edit.error.updateFailed') + ': ' + err.message
  } finally {
    isSubmitting.value = false
  }
}

const saveDraft = async () => {
  if (!canEdit.value || isSaving.value) return

  try {
    isSaving.value = true
    
    // Ensure datetime values are properly formatted
    const startDate = formData.value.proposed_start_date ? 
      new Date(formData.value.proposed_start_date).toISOString() : null
    const endDate = formData.value.proposed_end_date ? 
      new Date(formData.value.proposed_end_date).toISOString() : null
    
    const draftData = {
      title: formData.value.title,
      activity_type: formData.value.activity_type,
      format: formData.value.format,
      objectives: formData.value.objectives,
      detailed_presentation: formData.value.detailed_presentation,
      main_themes: formData.value.main_themes,
      categories: formData.value.categories,
      proposed_start_date: startDate,
      proposed_end_date: endDate,
      country_id: formData.value.country_id || null,
      validation_status: 'draft'
    }

    const { error: saveError } = await supabase
      .from('activities')
      .update(draftData)
      .eq('id', activity.value.id)
      .select()

    if (saveError) throw saveError

    // Show success message (optional)
    alert(t('activities.edit.draftSaved'))

  } catch (err) {
    console.error('Error saving draft:', err)
    error.value = t('activities.edit.error.saveFailed') + ': ' + err.message
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.back()
}

// Lifecycle
onMounted(() => {
  loadActivity()
  loadCountries()
})
</script>