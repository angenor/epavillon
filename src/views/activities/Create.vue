<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Draft Alert -->
      <div v-if="hasDraft" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-blue-800 dark:text-blue-200 font-medium">
              {{ t('activity.draft.found') }}
            </span>
          </div>
          <div class="flex space-x-2">
            <button
              @click="loadDraft"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {{ t('activity.draft.load') }}
            </button>
            <button
              @click="deleteDraft"
              class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              {{ t('activity.draft.delete') }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ t('activity.submit.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            {{ t('activity.submit.subtitle') }}
          </p>

          <!-- Progress Bar -->
          <ProgressBar
            :steps="steps"
            :current-step="currentStep"
          />

          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Step 1: Basic Information -->
            <div v-show="currentStep === 0" class="space-y-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('activity.submit.sections.basicInfo') }}
              </h2>

              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('activity.submit.fields.title') }} *
                </label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="t('activity.submit.placeholders.title')"
                />
              </div>

              <div>
                <label for="organization" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('activity.submit.fields.organization') }} *
                </label>
                <input
                  id="organization"
                  :value="organizationName"
                  type="text"
                  disabled
                  class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ t('activity.submit.helpers.organizationInfo') }}
                </p>
              </div>

              <div>
                <label for="activity_type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('activity.submit.fields.activityType') }} *
                </label>
                <select
                  id="activity_type"
                  v-model="form.activity_type"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{{ t('activity.submit.placeholders.selectType') }}</option>
                  <option value="side_event">{{ t('activity.submit.types.side_event') + ' (1 H 00 max)'}}</option>
                  <option value="country_day">{{ t('activity.submit.types.country_day') + ' (2 H 30 max)' }}</option>
                  <option value="other">{{ t('activity.submit.types.other') }}</option>
                </select>
              </div>

              <div>
                <label for="objectives" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('activity.submit.fields.objectives') }} *
                </label>
                <textarea
                  id="objectives"
                  v-model="form.objectives"
                  rows="3"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="t('activity.submit.placeholders.objectives')"
                ></textarea>
              </div>

              <div>
                <label for="detailed_presentation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('activity.submit.fields.detailedPresentation') }} *
                </label>
                <textarea
                  id="detailed_presentation"
                  v-model="form.detailed_presentation"
                  rows="5"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="t('activity.submit.placeholders.detailedPresentation')"
                ></textarea>
              </div>
            </div>

            <!-- Step 2: Format and Themes -->
            <div v-show="currentStep === 1" class="space-y-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('activity.submit.sections.formatAndThemes') }}
              </h2>

              <div>
                <label for="format" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('activity.submit.fields.format') }} *
                </label>
                <select
                  id="format"
                  v-model="form.format"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{{ t('activity.submit.placeholders.selectFormat') }}</option>
                  <option value="online">{{ t('activity.submit.formats.online') }}</option>
                  <option value="in_person">{{ t('activity.submit.formats.in_person') }}</option>
                  <option value="hybrid">{{ t('activity.submit.formats.hybrid') }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activity.submit.fields.themes') }} *
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    v-for="theme in availableThemes"
                    :key="theme"
                    class="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="theme"
                      v-model="form.main_themes"
                      class="rounded border-gray-300 text-green-600 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ t(`activity.submit.themes.${theme}`) }}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activity.submit.fields.categories') }} *
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    v-for="category in availableCategories"
                    :key="category"
                    class="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="category"
                      v-model="form.categories"
                      class="rounded border-gray-300 text-green-600 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ t(`activity.submit.categories.${category}`) }}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Step 3: Schedule and Location -->
            <div v-show="currentStep === 2" class="space-y-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('activity.submit.sections.schedule') }}
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="proposed_start_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('activity.submit.fields.proposedStartDate') }} *
                  </label>
                  <input
                    id="proposed_start_date"
                    v-model="form.proposed_start_date"
                    type="datetime-local"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label for="proposed_end_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('activity.submit.fields.proposedEndDate') }} *
                  </label>
                  <input
                    id="proposed_end_date"
                    v-model="form.proposed_end_date"
                    type="datetime-local"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ t('activity.submit.sections.location') }}
                </h3>
                <div>
                  <label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('activity.submit.fields.country') }}
                  </label>
                  <select
                    id="country"
                    v-model="form.country_id"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{{ t('activity.submit.placeholders.selectCountry') }}</option>
                    <option v-for="country in countries" :key="country.id" :value="country.id">
                      {{ locale === 'fr' ? country.name_fr : country.name_en }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 4: Speakers -->
            <div v-show="currentStep === 3" class="space-y-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('activity.submit.sections.speakers') }}
              </h2>

              <div class="space-y-4">
                <div v-for="(speaker, index) in form.speakers" :key="index" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ t('activity.submit.fields.speaker') }} {{ index + 1 }}
                    </h3>
                    <button
                      v-if="form.speakers.length > 1"
                      @click="removeSpeaker(index)"
                      type="button"
                      class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label :for="`civility-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('activity.submit.fields.civility') }}
                      </label>
                      <select
                        :id="`civility-${index}`"
                        v-model="speaker.civility"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      >
                        <option value="">{{ t('activity.submit.placeholders.selectCivility') }}</option>
                        <option value="mr">{{ t('activity.submit.civilities.mr') }}</option>
                        <option value="mrs">{{ t('activity.submit.civilities.mrs') }}</option>
                        <option value="ms">{{ t('activity.submit.civilities.ms') }}</option>
                        <option value="dr">{{ t('activity.submit.civilities.dr') }}</option>
                        <option value="prof">{{ t('activity.submit.civilities.prof') }}</option>
                      </select>
                    </div>

                    <div>
                      <label :for="`firstName-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('activity.submit.fields.firstName') }} *
                      </label>
                      <input
                        :id="`firstName-${index}`"
                        v-model="speaker.first_name"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        :placeholder="t('activity.submit.placeholders.speakerFirstName')"
                      />
                    </div>

                    <div>
                      <label :for="`lastName-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('activity.submit.fields.lastName') }} *
                      </label>
                      <input
                        :id="`lastName-${index}`"
                        v-model="speaker.last_name"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        :placeholder="t('activity.submit.placeholders.speakerLastName')"
                      />
                    </div>

                    <div>
                      <label :for="`email-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('activity.submit.fields.email') }} *
                      </label>
                      <input
                        :id="`email-${index}`"
                        v-model="speaker.email"
                        type="email"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        :placeholder="t('activity.submit.placeholders.speakerEmail')"
                      />
                    </div>

                    <div>
                      <label :for="`position-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('activity.submit.fields.position') }}
                      </label>
                      <input
                        :id="`position-${index}`"
                        v-model="speaker.position"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        :placeholder="t('activity.submit.placeholders.position')"
                      />
                    </div>

                    <div>
                      <label :for="`speakerOrganization-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('activity.submit.fields.speakerOrganization') }}
                      </label>
                      <input
                        :id="`speakerOrganization-${index}`"
                        v-model="speaker.organization"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        :placeholder="t('activity.submit.placeholders.speakerOrganization')"
                      />
                    </div>
                  </div>

                  <div class="mt-4">
                    <label class="flex items-center">
                      <input
                        v-model="speaker.is_available_for_questions"
                        type="checkbox"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500"
                      />
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {{ t('activity.submit.fields.availableForQuestions') }}
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  @click="addSpeaker"
                  type="button"
                  class="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ t('activity.submit.addSpeaker') }}
                </button>
              </div>
            </div>

            <!-- Step 5: Summary -->
            <div v-show="currentStep === 4" class="space-y-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                {{ t('activity.submit.sections.summary') }}
              </h2>
              
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ t('activity.submit.fields.title') }}</h3>
                  <p class="text-gray-600 dark:text-gray-300">{{ form.title }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ t('activity.submit.fields.activityType') }}</h3>
                  <p class="text-gray-600 dark:text-gray-300">{{ form.activity_type ? t(`activity.submit.types.${form.activity_type}`) : '-' }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ t('activity.submit.fields.format') }}</h3>
                  <p class="text-gray-600 dark:text-gray-300">{{ form.format ? t(`activity.submit.formats.${form.format}`) : '-' }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ t('activity.submit.fields.themes') }}</h3>
                  <p class="text-gray-600 dark:text-gray-300">{{ form.main_themes.map(theme => t(`activity.submit.themes.${theme}`)).join(', ') }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ t('activity.submit.fields.speakers') }}</h3>
                  <p class="text-gray-600 dark:text-gray-300">{{ form.speakers.length }} {{ form.speakers.length === 1 ? t('activity.submit.speaker') : t('activity.submit.speakers') }}</p>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <div class="flex space-x-3">
                <button
                  v-if="currentStep > 0"
                  type="button"
                  @click="previousStep"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  {{ t('common.previous') }}
                </button>
                <button
                  type="button"
                  @click="router.back()"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  {{ t('common.cancel') }}
                </button>
              </div>
              
              <div class="flex space-x-3">
                <button
                  type="button"
                  @click="saveDraft"
                  :disabled="isSavingDraft"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  {{ isSavingDraft ? t('activity.draft.saving') : t('activity.draft.save') }}
                </button>
                
                <button
                  v-if="currentStep < steps.length - 1"
                  type="button"
                  @click="nextStep"
                  :disabled="!canProceedToNextStep"
                  class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ t('common.next') }}
                </button>
                
                <button
                  v-else
                  type="submit"
                  :disabled="isSubmitting || !canSubmit"
                  class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSubmitting ? t('activity.submit.submitting') : t('activity.submit.submit') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useCountries } from '@/composables/useCountries'
import { useSupabase } from '@/composables/useSupabase'
import ProgressBar from '@/components/ui/ProgressBar.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const { countries, fetchCountries } = useCountries()

const eventId = route.params.eventId

const form = ref({
  title: '',
  activity_type: '',
  objectives: '',
  detailed_presentation: '',
  format: '',
  main_themes: [],
  categories: [],
  proposed_start_date: '',
  proposed_end_date: '',
  country_id: '',
  speakers: [{
    civility: '',
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    organization: '',
    is_available_for_questions: true
  }]
})

const isSubmitting = ref(false)
const isSavingDraft = ref(false)
const currentStep = ref(0)
const hasDraft = ref(false)

const steps = [
  { title: t('activity.submit.steps.basicInfo'), subtitle: t('activity.submit.steps.basicInfoDesc') },
  { title: t('activity.submit.steps.formatThemes'), subtitle: t('activity.submit.steps.formatThemesDesc') },
  { title: t('activity.submit.steps.schedule'), subtitle: t('activity.submit.steps.scheduleDesc') },
  { title: t('activity.submit.steps.speakers'), subtitle: t('activity.submit.steps.speakersDesc') },
  { title: t('activity.submit.steps.summary'), subtitle: t('activity.submit.steps.summaryDesc') }
]

const availableThemes = [
  'mitigation',
  'adaptation',
  'climate_resilience',
  'loss_and_damage',
  'clean_tech_innovations',
  'renewable_energy_land',
  'health_solidarity',
  'industry_transition',
  'transport_urbanization',
  'nature_oceans',
  'agriculture_food',
  'sustainable_livestock',
  'gender',
  'youth',
  'technology',
  'finance',
  'other'
]

const availableCategories = [
  'capacity_building',
  'results_sharing',
  'technological_innovation',
  'field_project',
  'best_practices',
  'awareness',
  'consultation'
]

const canSubmit = computed(() => {
  return authStore.profile?.organization_id &&
    form.value.title &&
    form.value.activity_type &&
    form.value.objectives &&
    form.value.detailed_presentation &&
    form.value.format &&
    form.value.main_themes.length > 0 &&
    form.value.categories.length > 0 &&
    form.value.proposed_start_date &&
    form.value.proposed_end_date &&
    form.value.speakers.length > 0 &&
    form.value.speakers.every(s => s.first_name && s.last_name && s.email)
})

const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 0: // Basic Info
      return form.value.title && form.value.activity_type && form.value.objectives && form.value.detailed_presentation
    case 1: // Format and Themes
      return form.value.format && form.value.main_themes.length > 0 && form.value.categories.length > 0
    case 2: // Schedule and Location
      return form.value.proposed_start_date && form.value.proposed_end_date
    case 3: // Speakers
      return form.value.speakers.length > 0 && form.value.speakers.every(s => s.first_name && s.last_name && s.email)
    default:
      return true
  }
})


const organizationName = computed(() => {
  // Utiliser directement les données du profil utilisateur
  if (authStore.profile?.organization_id) {
    // Essayer d'abord avec les données chargées
    if (organizationData.value?.name) {
      return organizationData.value.name
    }
    // Sinon, utiliser un nom temporaire basé sur l'ID
    return `Organisation (${authStore.profile.organization_id.slice(0, 8)}...)`
  }
  return t('activity.submit.loadingOrganization')
})

const organizationData = ref(null)

const addSpeaker = () => {
  form.value.speakers.push({
    civility: '',
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    organization: '',
    is_available_for_questions: true
  })
}

const removeSpeaker = (index) => {
  if (form.value.speakers.length > 1) {
    form.value.speakers.splice(index, 1)
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const getDraftKey = () => {
  return `activity_draft_${eventId}_${authStore.user?.id}`
}

const saveDraft = async () => {
  isSavingDraft.value = true
  try {
    const draftData = {
      ...form.value,
      currentStep: currentStep.value,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(getDraftKey(), JSON.stringify(draftData))
    // Show success message
    console.log('Draft saved successfully')
  } catch (error) {
    console.error('Error saving draft:', error)
  } finally {
    isSavingDraft.value = false
  }
}

const loadDraft = () => {
  try {
    const draftData = localStorage.getItem(getDraftKey())
    if (draftData) {
      const parsed = JSON.parse(draftData)
      form.value = { ...parsed }
      currentStep.value = parsed.currentStep || 0
      hasDraft.value = false
    }
  } catch (error) {
    console.error('Error loading draft:', error)
  }
}

const deleteDraft = () => {
  try {
    localStorage.removeItem(getDraftKey())
    hasDraft.value = false
  } catch (error) {
    console.error('Error deleting draft:', error)
  }
}

const checkForDraft = () => {
  try {
    const draftData = localStorage.getItem(getDraftKey())
    hasDraft.value = !!draftData
  } catch (error) {
    console.error('Error checking for draft:', error)
    hasDraft.value = false
  }
}


const handleSubmit = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  try {
    const { supabase } = useSupabase()
    
    // Créer l'activité
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .insert({
        event_id: eventId,
        organization_id: authStore.profile.organization_id,
        submitted_by: authStore.user.id,
        title: form.value.title,
        activity_type: form.value.activity_type,
        objectives: form.value.objectives,
        detailed_presentation: form.value.detailed_presentation,
        format: form.value.format,
        main_themes: form.value.main_themes,
        categories: form.value.categories,
        proposed_start_date: form.value.proposed_start_date,
        proposed_end_date: form.value.proposed_end_date,
        country_id: form.value.country_id || null,
        validation_status: 'submitted'
      })
      .select()
      .single()

    if (activityError) throw activityError

    // Ajouter les intervenants
    const speakersToInsert = form.value.speakers.map(speaker => ({
      activity_id: activityData.id,
      civility: speaker.civility || null,
      first_name: speaker.first_name,
      last_name: speaker.last_name,
      email: speaker.email,
      position: speaker.position || null,
      organization: speaker.organization || null,
      is_available_for_questions: speaker.is_available_for_questions
    }))

    const { error: speakersError } = await supabase
      .from('activity_speakers')
      .insert(speakersToInsert)

    if (speakersError) throw speakersError

    // Clear draft after successful submission
    deleteDraft()
    
    router.push(`/activities/${activityData.id}`)
  } catch (error) {
    console.error('Error submitting activity:', error)
    alert(t('activity.submit.errors.submitFailed'))
  } finally {
    isSubmitting.value = false
  }
}

// Rediriger vers Setup si pas d'organisation
watch(() => authStore.profile, (profile) => {
  if (profile && !profile.organization_id) {
    const currentPath = route.fullPath
    router.push(`/organization/setup?redirect=${encodeURIComponent(currentPath)}`)
  }
}, { immediate: true })

// Charger les données de l'organisation
const loadOrganizationData = async () => {
  if (authStore.profile?.organization_id) {
    try {
      const { supabase } = useSupabase()
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, email, organization_type')
        .eq('id', authStore.profile.organization_id)
        .single()
      
      if (error) {
        console.error('Erreur lors du chargement de l\'organisation:', error)
        // En cas d'erreur, utiliser un nom par défaut
        organizationData.value = { 
          name: `Organisation ID: ${authStore.profile.organization_id.slice(0, 8)}...`
        }
        return
      }
      
      organizationData.value = data
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'organisation:', error)
      // En cas d'erreur, utiliser un nom par défaut
      organizationData.value = { 
        name: `Organisation ID: ${authStore.profile.organization_id.slice(0, 8)}...`
      }
    }
  }
}

onMounted(async () => {
  // Charger les pays une seule fois
  await fetchCountries()
  
  // Charger l'organisation si disponible
  if (authStore.profile?.organization_id && !organizationData.value) {
    await loadOrganizationData()
  }
  
  // Vérifier s'il y a un brouillon
  checkForDraft()
})

// Watcher pour charger l'organisation quand le profil est disponible
watch(() => authStore.profile?.organization_id, async (organizationId, oldOrganizationId) => {
  // Éviter de recharger si c'est la même organisation ou si on a déjà les données
  if (organizationId && organizationId !== oldOrganizationId && !organizationData.value) {
    await loadOrganizationData()
  }
})
</script>