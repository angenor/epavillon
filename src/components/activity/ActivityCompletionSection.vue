<template>
  <div id="completion-report" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ $t('activity.completion.section.title') }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('activity.completion.section.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Status Badge -->
      <div
        v-if="validationResult"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="validationResult.is_valid
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'"
      >
        <span v-if="validationResult.is_valid">✓</span>
        <span v-else>⚠</span>
        <span>
          {{ validationResult.is_valid
            ? $t('activity.completion.section.complete')
            : $t('activity.completion.section.incomplete')
          }}
        </span>
      </div>
    </div>

    <!-- Completion Report Form -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ $t('activity.completion.section.reportLabel') }}
          <span class="text-red-500">*</span>
        </label>
        <span
          v-if="completionReport"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          {{ completionReport.length }} {{ $t('common.characters') }}
        </span>
      </div>

      <div class="relative">
        <textarea
          v-model="localReport"
          rows="8"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          :placeholder="$t('activity.completion.section.reportPlaceholder')"
          @input="onReportChange"
        ></textarea>

        <!-- Save/Cancel Buttons -->
        <Transition name="fade">
          <div
            v-if="hasUnsavedChanges"
            class="flex items-center gap-2 mt-3"
          >
            <button
              @click="saveReport"
              :disabled="saving"
              class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span v-if="!saving">{{ $t('common.save') }}</span>
              <span v-else class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ $t('common.saving') }}
              </span>
            </button>
            <button
              @click="cancelEdit"
              :disabled="saving"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {{ $t('common.cancel') }}
            </button>
          </div>
        </Transition>
      </div>

      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {{ $t('activity.completion.section.reportHint') }}
      </p>
    </div>

    <!-- Testimonials Section -->
    <div id="completion-testimonials" class="pt-6 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('activity.completion.section.testimonialsTitle') }}
            <span class="text-red-500">*</span>
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('activity.completion.section.testimonialsSubtitle') }}
            <span
              class="font-medium"
              :class="testimonials.length >= 2 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'"
            >
              ({{ testimonials.length }}/2)
            </span>
          </p>
        </div>

        <button
          @click="openAddTestimonialModal"
          class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ $t('activity.completion.section.addTestimonial') }}</span>
        </button>
      </div>

      <!-- Testimonials List -->
      <div v-if="testimonials.length > 0" class="space-y-4">
        <div
          v-for="testimonial in testimonials"
          :key="testimonial.id"
          class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3 flex-1">
              <!-- Photo -->
              <div class="flex-shrink-0">
                <div
                  v-if="testimonial.photo_url"
                  class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600"
                >
                  <img
                    :src="testimonial.photo_url"
                    :alt="getTestimonialAuthor(testimonial)"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div
                  v-else
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold"
                >
                  {{ getInitials(getTestimonialAuthor(testimonial)) }}
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-gray-900 dark:text-white">
                    {{ getTestimonialAuthor(testimonial) }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(testimonial.created_at) }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {{ testimonial.testimonial_text }}
                </p>
                <div v-if="testimonial.thematique_type && testimonial.thematique_type.length" class="flex flex-wrap gap-2 mt-2">
                  <span
                    v-for="theme in testimonial.thematique_type"
                    :key="theme"
                    class="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                  >
                    {{ $t(`themes.${theme}`) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Delete Button -->
            <button
              @click="removeTestimonial(testimonial.id)"
              class="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
              :aria-label="$t('common.delete')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
      >
        <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ $t('activity.completion.section.noTestimonials') }}
        </p>
        <button
          @click="openAddTestimonialModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ $t('activity.completion.section.addFirstTestimonial') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

const { t, locale } = useI18n()

const props = defineProps({
  completionReport: {
    type: String,
    default: ''
  },
  testimonials: {
    type: Array,
    default: () => []
  },
  validationResult: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:completionReport',
  'save-report',
  'add-testimonial',
  'remove-testimonial'
])

// Local state
const localReport = ref(props.completionReport)
const hasUnsavedChanges = ref(false)

// Watch for external changes
watch(() => props.completionReport, (newVal) => {
  localReport.value = newVal
  hasUnsavedChanges.value = false
})

// Methods
const onReportChange = () => {
  hasUnsavedChanges.value = localReport.value !== props.completionReport
}

const saveReport = () => {
  emit('save-report', localReport.value)
  hasUnsavedChanges.value = false
}

const cancelEdit = () => {
  localReport.value = props.completionReport
  hasUnsavedChanges.value = false
}

const openAddTestimonialModal = () => {
  emit('add-testimonial')
}

const removeTestimonial = (testimonialId) => {
  if (confirm(t('activity.completion.section.confirmDeleteTestimonial'))) {
    emit('remove-testimonial', testimonialId)
  }
}

const getTestimonialAuthor = (testimonial) => {
  if (testimonial.users) {
    return `${testimonial.users.first_name} ${testimonial.users.last_name}`
  }
  return t('activity.completion.section.anonymous')
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const dateLocale = locale.value === 'fr' ? fr : enUS
  return format(new Date(dateString), 'PPP', { locale: dateLocale })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
