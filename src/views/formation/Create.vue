<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ t('formations.create.title') }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('formations.create.subtitle') }}
            </p>
          </div>
          <button
            @click="$router.go(-1)"
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            {{ t('common.back') }}
          </button>
        </div>
      </div>
    </header>

    <!-- Vérification des permissions -->
    <div v-if="!hasPermission" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <div>
            <h3 class="text-lg font-medium text-yellow-800 dark:text-yellow-200">
              {{ t('formations.create.permissions.title') }}
            </h3>
            <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>{{ t('formations.create.permissions.description') }}</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                <li>{{ t('formations.create.permissions.trainer') }}</li>
                <li>{{ t('formations.create.permissions.admin') }}</li>
                <li>{{ t('formations.create.permissions.superAdmin') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulaire multi-étapes -->
    <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Indicateur de progression -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div v-for="(step, index) in steps" :key="index" class="flex items-center">
            <div class="flex items-center">
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  currentStep > index + 1 
                    ? 'bg-green-600 text-white' 
                    : currentStep === index + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                ]"
              >
                <svg v-if="currentStep > index + 1" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="ml-3 hidden sm:block">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ step.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ step.description }}</p>
              </div>
            </div>
            <div v-if="index < steps.length - 1" class="hidden sm:block w-16 h-0.5 bg-gray-300 dark:bg-gray-600 ml-4"></div>
          </div>
        </div>
      </div>

      <!-- Indicateur de sauvegarde automatique -->
      <div v-if="lastSaved" class="mb-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        {{ t('formations.create.autoSaved') }} {{ formatTime(lastSaved) }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Étape 1: Informations de base -->
        <div v-show="currentStep === 1" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
            {{ t('formations.create.steps.basicInfo.title') }}
          </h2>
          
          <div class="grid grid-cols-1 gap-6">
            <!-- Titre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('formations.create.fields.title') }} *
              </label>
              <input
                v-model="formData.title"
                type="text"
                :placeholder="t('formations.create.placeholders.title')"
                maxlength="200"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': errors.title }"
                @input="validateField('title')"
              />
              <div class="flex justify-between mt-1">
                <p v-if="errors.title" class="text-sm text-red-600 dark:text-red-400">{{ errors.title }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ formData.title.length }}/200 {{ t('common.characters') }}</p>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('formations.create.fields.description') }} *
              </label>
              <RichTextEditor
                v-model="formData.description"
                :placeholder="t('formations.create.placeholders.description')"
                :max-length="3000"
                :show-character-count="true"
                @update:modelValue="validateField('description')"
              />
              <p v-if="errors.description" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.description }}</p>
            </div>

            <!-- Catégorie et Format -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Catégorie -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('formations.create.fields.category') }} *
                </label>
                <select
                  v-model="formData.category"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.category }"
                  @change="validateField('category')"
                >
                  <option value="">{{ t('formations.create.placeholders.selectCategory') }}</option>
                  <option value="climate">{{ t('formations.categories.climate') }}</option>
                  <option value="desertification">{{ t('formations.categories.desertification') }}</option>
                  <option value="biodiversity">{{ t('formations.categories.biodiversity') }}</option>
                  <option value="other">{{ t('formations.categories.other') }}</option>
                </select>
                <p v-if="errors.category" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.category }}</p>
              </div>

              <!-- Format -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('formations.create.fields.format') }} *
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="formData.format"
                      type="radio"
                      value="online"
                      class="text-blue-600 focus:ring-blue-500"
                      @change="validateField('format')"
                    />
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                      {{ t('formations.formats.online') }}
                    </span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="formData.format"
                      type="radio"
                      value="hybrid"
                      class="text-blue-600 focus:ring-blue-500"
                      @change="validateField('format')"
                    />
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"/>
                      </svg>
                      {{ t('formations.formats.hybrid') }}
                    </span>
                  </label>
                </div>
                <p v-if="errors.format" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.format }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Étape 2: Détails pédagogiques -->
        <div v-show="currentStep === 2" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
            {{ t('formations.create.steps.pedagogicalDetails.title') }}
          </h2>
          
          <div class="space-y-6">
            <!-- Public cible -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('formations.create.fields.targetAudience') }} *
              </label>
              <textarea
                v-model="formData.target_audience"
                :placeholder="t('formations.create.placeholders.targetAudience')"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': errors.target_audience }"
                @input="validateField('target_audience')"
              ></textarea>
              <p v-if="errors.target_audience" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.target_audience }}</p>
              
              <!-- Suggestions -->
              <div class="mt-2">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ t('formations.create.suggestions.label') }}:</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="suggestion in targetAudienceSuggestions"
                    :key="suggestion"
                    type="button"
                    @click="addTargetAudienceSuggestion(suggestion)"
                    class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    + {{ suggestion }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Objectifs pédagogiques -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('formations.create.fields.objectives') }} *
              </label>
              <div class="space-y-2">
                <div
                  v-for="(objective, index) in formData.objectives"
                  :key="index"
                  class="flex items-start space-x-2"
                >
                  <div class="flex-1">
                    <textarea
                      v-model="formData.objectives[index]"
                      :placeholder="`${t('formations.create.placeholders.objective')} ${index + 1}`"
                      rows="2"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>
                  <button
                    v-if="formData.objectives.length > 1"
                    type="button"
                    @click="removeObjective(index)"
                    class="mt-2 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addObjective"
                  class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  {{ t('formations.create.buttons.addObjective') }}
                </button>
              </div>
              <p v-if="errors.objectives" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.objectives }}</p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ t('formations.create.helpers.minimumObjectives') }}
              </p>
            </div>

            <!-- Méthodologie -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('formations.create.fields.methodology') }} *
              </label>
              <textarea
                v-model="formData.methodology"
                :placeholder="t('formations.create.placeholders.methodology')"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': errors.methodology }"
                @input="validateField('methodology')"
              ></textarea>
              <p v-if="errors.methodology" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.methodology }}</p>
            </div>

            <!-- Dates de formation -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('formations.create.fields.startDate') }} *
                </label>
                <input
                  v-model="formData.start_date"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.start_date }"
                  @change="validateField('start_date')"
                />
                <p v-if="errors.start_date" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.start_date }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('formations.create.fields.endDate') }} *
                </label>
                <input
                  v-model="formData.end_date"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.end_date }"
                  @change="validateField('end_date')"
                />
                <p v-if="errors.end_date" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.end_date }}</p>
              </div>
            </div>

            <!-- Prix estimé -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('formations.create.fields.estimatedPrice') }}
              </label>
              <div class="relative">
                <input
                  v-model="formData.estimated_price"
                  type="number"
                  step="0.01"
                  min="0"
                  :placeholder="t('formations.create.placeholders.estimatedPrice')"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 dark:text-gray-400 text-sm">USD</span>
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ t('formations.create.helpers.estimatedPrice') }}
              </p>
            </div>

            <!-- Bannière de formation -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('formations.create.fields.banner') }}
              </label>
              <BannerUpload v-model="bannerUrls" @update:modelValue="updateBannerUrls" />
            </div>
          </div>
        </div>

        <!-- Navigation entre les étapes -->
        <div class="flex justify-between">
          <button
            type="button"
            @click="currentStep--"
            :disabled="currentStep === 1"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            {{ t('common.previous') }}
          </button>

          <div class="flex space-x-3">
            <button
              type="button"
              @click="saveDraft"
              :disabled="isSubmitting"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              {{ t('common.save') }}
            </button>

            <button
              v-if="currentStep < steps.length"
              type="button"
              @click="nextStep"
              :disabled="!canGoToNextStep"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('common.next') }}
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <button
              v-else
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSubmitting ? t('common.submitting') : t('formations.create.buttons.createFormation') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useSupabase } from '@/composables/useSupabase'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import BannerUpload from '@/components/formations/BannerUpload.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { supabase } = useSupabase()

// État du formulaire
const currentStep = ref(1)
const isSubmitting = ref(false)
const lastSaved = ref(null)
let autoSaveInterval = null

// État des bannières
const bannerUrls = ref({
  banner_hd_url: '',
  banner_thumbnail_url: ''
})

// Étapes du formulaire
const steps = [
  {
    title: t('formations.create.steps.basicInfo.title'),
    description: t('formations.create.steps.basicInfo.description')
  },
  {
    title: t('formations.create.steps.pedagogicalDetails.title'),
    description: t('formations.create.steps.pedagogicalDetails.description')
  }
]

// Données du formulaire
const formData = reactive({
  title: '',
  description: '',
  category: '',
  format: '',
  estimated_price: '',
  target_audience: '',
  objectives: [''],
  methodology: '',
  banner_hd_url: '',
  banner_thumbnail_url: '',
  start_date: '',
  end_date: '',
  is_active: true
})

// Erreurs de validation
const errors = reactive({})

// Suggestions pour le public cible
const targetAudienceSuggestions = [
  t('formations.targetAudience.negotiators'),
  t('formations.targetAudience.focalPoints'),
  t('formations.targetAudience.professionals'),
  t('formations.targetAudience.students'),
  t('formations.targetAudience.general')
]

// Vérification des permissions
const hasPermission = computed(() => {
  const profile = authStore.profile
  if (!profile || !profile.user_roles) return false
  
  const allowedRoles = ['trainer', 'admin', 'super_admin']
  const userRoles = profile.user_roles.map(roleObj => roleObj.role)
  
  return allowedRoles.some(role => userRoles.includes(role))
})

// Validation des champs
const validateField = (fieldName) => {
  switch (fieldName) {
    case 'title':
      if (!formData.title.trim()) {
        errors.title = t('formations.create.errors.titleRequired')
      } else {
        delete errors.title
      }
      break
    
    case 'description':
      if (!formData.description.trim()) {
        errors.description = t('formations.create.errors.descriptionRequired')
      } else {
        delete errors.description
      }
      break
    
    case 'category':
      if (!formData.category) {
        errors.category = t('formations.create.errors.categoryRequired')
      } else {
        delete errors.category
      }
      break
    
    case 'format':
      if (!formData.format) {
        errors.format = t('formations.create.errors.formatRequired')
      } else {
        delete errors.format
      }
      break
    
    case 'target_audience':
      if (!formData.target_audience.trim()) {
        errors.target_audience = t('formations.create.errors.targetAudienceRequired')
      } else {
        delete errors.target_audience
      }
      break
    
    case 'start_date':
      if (!formData.start_date) {
        errors.start_date = t('formations.create.errors.startDateRequired')
      } else {
        delete errors.start_date
      }
      break
    
    case 'end_date':
      if (!formData.end_date) {
        errors.end_date = t('formations.create.errors.endDateRequired')
      } else if (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
        errors.end_date = t('formations.create.errors.endDateAfterStart')
      } else {
        delete errors.end_date
      }
      break
    
    case 'objectives':
      const validObjectives = formData.objectives.filter(obj => obj.trim())
      if (validObjectives.length < 1) {
        errors.objectives = t('formations.create.errors.minimumObjectives')
      } else {
        delete errors.objectives
      }
      break
    
    case 'methodology':
      if (!formData.methodology.trim()) {
        errors.methodology = t('formations.create.errors.methodologyRequired')
      } else {
        delete errors.methodology
      }
      break
  }
}

// Validation de l'étape actuelle
const canGoToNextStep = computed(() => {
  if (currentStep.value === 1) {
    return formData.title.trim() && 
           formData.description.trim() && 
           formData.category && 
           formData.format &&
           !errors.title && 
           !errors.description && 
           !errors.category && 
           !errors.format
  }
  
  if (currentStep.value === 2) {
    const validObjectives = formData.objectives.filter(obj => obj.trim())
    return formData.target_audience.trim() && 
           validObjectives.length >= 1 && 
           formData.methodology.trim() && 
           formData.start_date && 
           formData.end_date &&
           !errors.target_audience && 
           !errors.objectives && 
           !errors.methodology && 
           !errors.start_date && 
           !errors.end_date
  }
  
  return true
})

// Validation complète du formulaire
const isFormValid = computed(() => {
  const validObjectives = formData.objectives.filter(obj => obj.trim())
  return formData.title.trim() && 
         formData.description.trim() && 
         formData.category && 
         formData.format && 
         formData.target_audience.trim() && 
         validObjectives.length >= 1 && 
         formData.methodology.trim() && 
         formData.start_date && 
         formData.end_date &&
         Object.keys(errors).length === 0
})

// Fonctions de gestion des objectifs
const addObjective = () => {
  formData.objectives.push('')
}

const removeObjective = (index) => {
  formData.objectives.splice(index, 1)
  validateField('objectives')
}

// Ajouter une suggestion au public cible
const addTargetAudienceSuggestion = (suggestion) => {
  if (!formData.target_audience.includes(suggestion)) {
    if (formData.target_audience) {
      formData.target_audience += ', ' + suggestion
    } else {
      formData.target_audience = suggestion
    }
    validateField('target_audience')
  }
}

// Navigation entre les étapes
const nextStep = () => {
  // Valider l'étape actuelle
  if (currentStep.value === 1) {
    validateField('title')
    validateField('description')
    validateField('category')
    validateField('format')
  } else if (currentStep.value === 2) {
    validateField('target_audience')
    validateField('objectives')
    validateField('methodology')
    validateField('start_date')
    validateField('end_date')
  }
  
  if (canGoToNextStep.value) {
    currentStep.value++
  }
}

// Sauvegarde automatique
const saveToLocalStorage = () => {
  try {
    localStorage.setItem('formation-draft', JSON.stringify({
      formData: formData,
      bannerUrls: bannerUrls.value,
      currentStep: currentStep.value,
      timestamp: Date.now()
    }))
    lastSaved.value = new Date()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('formation-draft')
    if (saved) {
      const data = JSON.parse(saved)
      // Vérifier que la sauvegarde n'est pas trop ancienne (24h max)
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        Object.assign(formData, data.formData)
        if (data.bannerUrls) {
          bannerUrls.value = data.bannerUrls
        }
        currentStep.value = data.currentStep
        lastSaved.value = new Date(data.timestamp)
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  }
}

// Mettre à jour les URLs de bannière
const updateBannerUrls = (urls) => {
  bannerUrls.value = urls
  formData.banner_hd_url = urls.banner_hd_url
  formData.banner_thumbnail_url = urls.banner_thumbnail_url
}

// Sauvegarde manuelle en brouillon
const saveDraft = () => {
  saveToLocalStorage()
  // Ici, vous pourriez aussi envoyer vers l'API
}

// Soumission du formulaire
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    // Nettoyer les objectifs vides et les garder comme tableau (selon le schéma DB TEXT[])
    const cleanedObjectives = formData.objectives.filter(obj => obj.trim())
    
    const formationData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      format: formData.format,
      estimated_price: formData.estimated_price ? parseFloat(formData.estimated_price) : null,
      target_audience: formData.target_audience.trim(),
      objectives: cleanedObjectives, // Tableau de strings
      methodology: formData.methodology.trim(),
      banner_hd_url: formData.banner_hd_url || null,
      banner_thumbnail_url: formData.banner_thumbnail_url || null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active
    }
    
    // Ajouter l'ID de l'utilisateur créateur
    formationData.created_by = authStore.user?.id
    
    console.log('Données de formation à soumettre:', formationData)
    
    // Insérer dans la table trainings de Supabase
    const { data, error } = await supabase
      .from('trainings')
      .insert([formationData])
      .select()
      .single()
    
    if (error) {
      console.error('Erreur Supabase:', error)
      throw new Error(`Erreur lors de la création: ${error.message}`)
    }
    
    console.log('Formation créée avec succès:', data)
    
    // Supprimer le brouillon local
    localStorage.removeItem('formation-draft')
    
    // Rediriger vers la liste des formations
    router.push('/formations')
    
  } catch (error) {
    console.error('Erreur lors de la création:', error)
    // TODO: Afficher une notification d'erreur à l'utilisateur
    alert(error.message || t('formations.create.errors.submitFailed'))
  } finally {
    isSubmitting.value = false
  }
}

// Formater l'heure pour l'affichage
const formatTime = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Lifecycle hooks
onMounted(() => {
  // Vérifier les permissions
  if (!hasPermission.value) {
    return
  }
  
  // Charger le brouillon si disponible
  loadFromLocalStorage()
  
  // Configurer la sauvegarde automatique
  autoSaveInterval = setInterval(saveToLocalStorage, 30000) // Toutes les 30 secondes
})

onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
  }
})
</script>