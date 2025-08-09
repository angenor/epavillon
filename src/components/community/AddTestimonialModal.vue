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

          <!-- Context Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('community.addTestimonial.context') }}
            </label>
            <select
              v-model="formData.contextId"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ifdd-green-500 focus:border-transparent transition-colors"
              required
            >
              <option value="">{{ t('community.addTestimonial.selectContext') }}</option>
              <!-- Options would be loaded from store -->
              <option value="1">Innovation Example 1</option>
              <option value="2">Practice Example 1</option>
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
  contextId: '',
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

const handleSubmit = async () => {
  loading.value = true
  try {
    await testimonialsStore.addTestimonial(formData.value)
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Error submitting testimonial:', error)
  } finally {
    loading.value = false
  }
}
</script>