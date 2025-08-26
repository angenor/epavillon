<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full shadow-2xl">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ t('community.addTestimonial.title') }}
        </h3>
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="space-y-4">
          <!-- Testimonial Text -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('community.addTestimonial.testimonialText') }}
            </label>
            <textarea
              v-model="formData.text"
              rows="4"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ifdd-green-500 focus:border-transparent transition-colors"
              :placeholder="t('community.addTestimonial.textPlaceholder')"
              required
            ></textarea>
          </div>

          <!-- Context Types Selection (Multiple) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('community.addTestimonial.contextTypes') }}
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
                  v-model="formData.contextTypes"
                  class="w-4 h-4 text-ifdd-green-600 bg-gray-100 border-gray-300 rounded focus:ring-ifdd-green-500 dark:focus:ring-ifdd-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                >
                <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">{{ contextType.label }}</span>
              </label>
            </div>
          </div>

          <!-- Thématiques Selection (Multiple) -->
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
                  v-model="formData.thematiqueTypes"
                  class="w-4 h-4 text-ifdd-green-600 bg-gray-100 border-gray-300 rounded focus:ring-ifdd-green-500 dark:focus:ring-ifdd-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                >
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ thematique.label }}</span>
              </label>
            </div>
          </div>

          <!-- Context ID (Optional - for specific context) -->
          <div v-if="formData.contextTypes.length === 1 && formData.contextTypes[0] !== 'platform'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('community.addTestimonial.specificContext') }}
            </label>
            <select
              v-model="formData.contextId"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ifdd-green-500 focus:border-transparent transition-colors"
            >
              <option value="">{{ t('community.addTestimonial.selectSpecificContext') }}</option>
              <!-- Options dynamiques selon le type de contexte sélectionné -->
              <option v-if="formData.contextTypes[0] === 'training'" value="training-1">Formation Exemple 1</option>
              <option v-if="formData.contextTypes[0] === 'event'" value="event-1">Événement Exemple 1</option>
              <option v-if="formData.contextTypes[0] === 'innovation_practice'" value="innovation-1">Innovation Exemple 1</option>
            </select>
          </div>

          <!-- Background Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('community.addTestimonial.backgroundColor') }}
            </label>
            <div class="flex gap-2">
              <button
                v-for="color in backgroundColors"
                :key="color"
                type="button"
                @click="formData.backgroundColor = color"
                :class="[
                  'w-10 h-10 rounded-lg transition-all',
                  formData.backgroundColor === color ? 'ring-2 ring-offset-2 ring-ifdd-green-500' : ''
                ]"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-4 py-3 bg-ifdd-green-600 hover:bg-ifdd-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {{ loading ? t('common.loading') : t('common.submit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTestimonialsStore } from '@/stores/testimonials'

const emit = defineEmits(['close', 'success'])
const { t } = useI18n()
const testimonialsStore = useTestimonialsStore()

const loading = ref(false)
const formData = ref({
  text: '',
  contextTypes: [], // Nouveau: tableau pour multiples contextes
  contextId: null, // Optionnel: ID spécifique si un seul contexte
  thematiqueTypes: [], // Nouveau: tableau pour les thématiques
  backgroundColor: '#10B981'
})

const backgroundColors = [
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#EF4444'
]

// Types de contextes disponibles
const availableContextTypes = [
  { value: 'platform', label: t('community.contextTypes.platform') },
  { value: 'training', label: t('community.contextTypes.training') },
  { value: 'event', label: t('community.contextTypes.event') },
  { value: 'innovation_practice', label: t('community.contextTypes.innovationPractice') }
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

const handleSubmit = async () => {
  if (formData.value.contextTypes.length === 0) {
    alert(t('community.addTestimonial.selectAtLeastOneContext'))
    return
  }
  
  if (formData.value.thematiqueTypes.length === 0) {
    alert(t('community.addTestimonial.selectAtLeastOneThematique'))
    return
  }

  loading.value = true
  try {
    // Préparer les données pour la base de données
    const testimonialData = {
      testimonial_text: formData.value.text,
      context_type: formData.value.contextTypes, // Envoie le tableau
      context_id: formData.value.contextTypes.length === 1 && formData.value.contextTypes[0] !== 'platform' ? formData.value.contextId : null,
      thematique_type: formData.value.thematiqueTypes, // Nouveau: tableau des thématiques
      background_color: formData.value.backgroundColor
    }

    await testimonialsStore.addTestimonial(testimonialData)
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Error submitting testimonial:', error)
  } finally {
    loading.value = false
  }
}
</script>