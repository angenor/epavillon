<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ t('common.editPost.title') }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Post Type Display -->
        <div class="flex items-center gap-2 mb-4">
          <div
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium',
              getTypeBadgeClass()
            ]"
          >
            {{ getTypeLabel() }}
          </div>
        </div>

        <!-- Testimonial Fields -->
        <div v-if="post.type === 'testimonial'" class="space-y-4">
          <!-- Testimonial Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.testimonialTitle') }}
            </label>
            <input
              v-model="formData.testimonial_title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.testimonialTitlePlaceholder')"
              required
            />
          </div>

          <!-- Detail URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.detailUrl') }} ({{ t('common.optional') }})
            </label>
            <input
              v-model="formData.testimonial_detail_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.detailUrlPlaceholder')"
            />
          </div>

          <!-- Context Types -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.contextTypes') }}
            </label>
            <div class="space-y-2">
              <label
                v-for="contextType in availableContextTypes"
                :key="contextType.value"
                class="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  :value="contextType.value"
                  v-model="formData.context_types"
                  class="w-4 h-4 text-ifdd-green-600 bg-gray-100 border-gray-300 rounded focus:ring-ifdd-green-500 dark:focus:ring-ifdd-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                >
                <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">{{ contextType.label }}</span>
              </label>
            </div>
          </div>

          <!-- Thématiques -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('community.addTestimonial.thematiques') }}
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <label
                v-for="thematique in availableThematiques"
                :key="thematique.value"
                class="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  :value="thematique.value"
                  v-model="formData.thematique_types"
                  class="w-4 h-4 text-ifdd-green-600 bg-gray-100 border-gray-300 rounded focus:ring-ifdd-green-500 dark:focus:ring-ifdd-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                >
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ thematique.label }}</span>
              </label>
            </div>
          </div>

          <!-- Testimonial Text -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.testimonialText') }}
            </label>
            <textarea
              v-model="formData.testimonial_text"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.testimonialPlaceholder')"
              required
            ></textarea>
          </div>

          <!-- Photo URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.photoUrl') }} ({{ t('common.optional') }})
            </label>
            <input
              v-model="formData.photo_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.photoUrlPlaceholder')"
            />
          </div>

          <!-- Background Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.backgroundColor') }}
            </label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="color in backgroundColors"
                :key="color"
                type="button"
                @click="formData.background_color = color"
                :class="[
                  'w-10 h-10 rounded-lg border-2 transition-all',
                  formData.background_color === color
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-transparent hover:scale-105'
                ]"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>

          <!-- Featured Checkbox -->
          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="formData.featured"
              id="featured"
              class="h-4 w-4 text-ifdd-green-600 focus:ring-ifdd-green-500 border-gray-300 rounded"
            >
            <label for="featured" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {{ t('common.editPost.markAsFeatured') }}
            </label>
          </div>
        </div>

        <!-- Innovation/Practice Fields -->
        <div v-else-if="post.type === 'innovation' || post.type === 'practice'" class="space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.title') }}
            </label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.titlePlaceholder')"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.description') }}
            </label>
            <textarea
              v-model="formData.description"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.descriptionPlaceholder')"
              required
            ></textarea>
          </div>

          <!-- Application Sector (for innovations/practices) -->
          <div v-if="post.type === 'innovation' || post.type === 'practice'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.applicationSector') }}
            </label>
            <select
              v-model="formData.application_sector"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{{ t('common.editPost.selectSector') }}</option>
              <option value="agriculture">{{ t('common.sectors.agriculture') }}</option>
              <option value="livestock">{{ t('common.sectors.livestock') }}</option>
              <option value="industry">{{ t('common.sectors.industry') }}</option>
              <option value="other">{{ t('common.sectors.other') }}</option>
            </select>
          </div>

          <!-- Cover Image URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.coverImageUrl') }}
            </label>
            <input
              v-model="formData.cover_image_hd_16_9_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.coverImageUrlPlaceholder')"
            />
          </div>
        </div>

        <!-- Video Testimonial Fields -->
        <div v-else-if="post.type === 'video_testimonial'" class="space-y-4">
          <!-- Video Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.videoTitle') }}
            </label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.videoTitlePlaceholder')"
              required
            />
          </div>

          <!-- Detail URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.detailUrl') }} ({{ t('common.optional') }})
            </label>
            <input
              v-model="formData.detail_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.detailUrlPlaceholder')"
            />
          </div>

          <!-- Context Types -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.contextTypes') }} ({{ t('common.optional') }})
            </label>
            <div class="space-y-2">
              <label
                v-for="contextType in videoContextTypes"
                :key="contextType.value"
                class="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  :value="contextType.value"
                  v-model="formData.context_types"
                  class="w-4 h-4 text-ifdd-green-600 bg-gray-100 border-gray-300 rounded focus:ring-ifdd-green-500 dark:focus:ring-ifdd-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                >
                <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">{{ contextType.label }}</span>
              </label>
            </div>
          </div>

          <!-- Thématiques -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('community.addTestimonial.thematiques') }}
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <label
                v-for="thematique in availableThematiques"
                :key="thematique.value"
                class="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  :value="thematique.value"
                  v-model="formData.thematique_types"
                  class="w-4 h-4 text-ifdd-green-600 bg-gray-100 border-gray-300 rounded focus:ring-ifdd-green-500 dark:focus:ring-ifdd-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                >
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ thematique.label }}</span>
              </label>
            </div>
          </div>

          <!-- Video URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.videoUrl') }}
            </label>
            <input
              v-model="formData.video_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.videoUrlPlaceholder')"
              required
            />
          </div>

          <!-- Duration -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('common.editPost.duration') }}
            </label>
            <input
              v-model.number="formData.duration_seconds"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 dark:bg-gray-700 dark:text-white"
              :placeholder="t('common.editPost.durationPlaceholder')"
            />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p class="text-red-700 dark:text-red-400 text-sm">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-ifdd-green-600 hover:bg-ifdd-green-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTestimonials } from '@/composables/useTestimonials'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])
const { t } = useI18n()
const { updateTestimonial } = useTestimonials()

const loading = ref(false)
const error = ref('')

// Initialize form data with post values
const formData = reactive({
  // Common fields
  testimonial_text: '',
  testimonial_title: '',
  testimonial_detail_url: '',
  photo_url: '',
  context_types: [],
  context_id: null,
  thematique_types: [], // Nouveau: tableau pour les thématiques
  background_color: '',
  featured: false,

  // Innovation/Practice fields
  title: '',
  description: '',
  application_sector: '',
  cover_image_hd_16_9_url: '',

  // Video testimonial fields
  video_url: '',
  title: '', // Video title
  detail_url: '',
  duration_seconds: null
})

// Initialize form data based on post type
const initializeFormData = () => {
  // Common fields
  formData.featured = props.post.featured || false
  formData.background_color = props.post.background_color || '#10B981'
  formData.thematique_types = Array.isArray(props.post.thematique_type) ? props.post.thematique_type : (props.post.thematique_type ? [props.post.thematique_type] : [])

  if (props.post.type === 'testimonial') {
    formData.testimonial_text = props.post.testimonial_text || ''
    formData.testimonial_title = props.post.testimonial_title || ''
    formData.testimonial_detail_url = props.post.testimonial_detail_url || props.post.detail_url || ''
    formData.photo_url = props.post.photo_url || ''
    formData.context_types = Array.isArray(props.post.context_type) ? props.post.context_type : (props.post.context_type ? [props.post.context_type] : [])
    formData.context_id = props.post.context_id || null
  } else if (props.post.type === 'innovation' || props.post.type === 'practice') {
    formData.title = props.post.title || props.post.innovation?.title || props.post.practice?.title || ''
    formData.description = props.post.description || props.post.innovation?.description || props.post.practice?.description || ''
    formData.application_sector = props.post.application_sector || props.post.innovation?.application_sector || props.post.practice?.application_sector || ''
    formData.cover_image_hd_16_9_url = props.post.cover_image_hd_16_9_url || props.post.innovation?.cover_image_hd_16_9_url || props.post.practice?.cover_image_hd_16_9_url || ''
  } else if (props.post.type === 'video_testimonial') {
    formData.video_url = props.post.video_url || ''
    formData.title = props.post.title || ''
    formData.detail_url = props.post.detail_url || ''
    formData.duration_seconds = props.post.duration_seconds || null
    formData.context_types = Array.isArray(props.post.context_type) ? props.post.context_type : (props.post.context_type ? [props.post.context_type] : [])
    formData.context_id = props.post.context_id || null
  }
}

const getTypeLabel = () => {
  switch (props.post.type) {
    case 'testimonial':
      return props.post.context_type === 'training' ? 'Témoignage Formation' : 'Témoignage'
    case 'innovation':
      return 'Innovation'
    case 'practice':
      return 'Bonne Pratique'
    case 'video_testimonial':
      return 'Vidéo Témoignage'
    default:
      return 'Contenu'
  }
}

const getTypeBadgeClass = () => {
  switch (props.post.type) {
    case 'innovation':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'practice':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'video_testimonial':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'testimonial':
      return props.post.context_type === 'training'
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    // Prepare update data based on post type
    const updateData = { id: props.post.id }

    if (props.post.type === 'testimonial') {
      updateData.testimonial_text = formData.testimonial_text
      updateData.testimonial_title = formData.testimonial_title
      updateData.testimonial_detail_url = formData.testimonial_detail_url
      updateData.context_type = formData.context_types
      updateData.context_id = formData.context_id
      updateData.thematique_type = formData.thematique_types
      updateData.background_color = formData.background_color
      updateData.featured = formData.featured
      if (formData.photo_url) {
        updateData.photo_url = formData.photo_url
      }
    } else if (props.post.type === 'innovation' || props.post.type === 'practice') {
      updateData.title = formData.title
      updateData.description = formData.description
      updateData.application_sector = formData.application_sector
      if (formData.cover_image_hd_16_9_url) {
        updateData.cover_image_hd_16_9_url = formData.cover_image_hd_16_9_url
      }
    } else if (props.post.type === 'video_testimonial') {
      updateData.video_url = formData.video_url
      updateData.title = formData.title
      updateData.detail_url = formData.detail_url
      updateData.context_type = formData.context_types
      updateData.context_id = formData.context_id
      updateData.thematique_type = formData.thematique_types
      if (formData.duration_seconds) {
        updateData.duration_seconds = formData.duration_seconds
      }
    }

    await updateTestimonial(props.post.type, updateData)

    emit('updated')
    emit('close')
  } catch (err) {
    console.error('Error updating post:', err)
    error.value = t('common.editPost.error')
  } finally {
    loading.value = false
  }
}

// Types de contextes disponibles
const availableContextTypes = [
  { value: 'platform', label: 'Plateforme générale' },
  { value: 'training', label: 'Formation' },
  { value: 'event', label: 'Événement' },
  { value: 'innovation_practice', label: 'Innovation/Pratique' }
]

// Types de contextes pour vidéos (sous-ensemble)
const videoContextTypes = [
  { value: 'training', label: 'Formation' },
  { value: 'event', label: 'Événement' },
  { value: 'activity', label: 'Activité' }
]

// Thématiques disponibles
const availableThematiques = [
  { value: 'pertes_et_prejudices', label: t('common.thematiques.pertes_et_prejudices') },
  { value: 'adaptation', label: t('common.thematiques.adaptation') },
  { value: 'attenuation', label: t('common.thematiques.attenuation') },
  { value: 'finance', label: t('common.thematiques.finance') },
  { value: 'genre', label: t('common.thematiques.genre') },
  { value: 'ace', label: t('common.thematiques.ace') },
  { value: 'agriculture', label: t('common.thematiques.agriculture') },
  { value: 'transparence', label: t('common.thematiques.transparence') },
  { value: 'mecanismes_de_cooperation', label: t('common.thematiques.mecanismes_de_cooperation') },
  { value: 'bilan_mondial', label: t('common.thematiques.bilan_mondial') },
  { value: 'droits_de_l_homme_et_climat', label: t('common.thematiques.droits_de_l_homme_et_climat') }
]

// Background color options
const backgroundColors = [
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#14B8A6', // teal
  '#6366F1'  // indigo
]

onMounted(() => {
  initializeFormData()
})
</script>
