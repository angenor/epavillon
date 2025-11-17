<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleClose"
        ></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all"
            @click.stop
          >
            <!-- Header -->
            <div class="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 rounded-t-2xl">
              <div class="flex items-start justify-between">
                <div>
                  <h2 class="text-xl font-bold">
                    {{ $t('activity.completion.testimonial.addTitle') }}
                  </h2>
                  <p class="text-white/90 text-sm mt-1">
                    {{ $t('activity.completion.testimonial.addSubtitle') }}
                  </p>
                </div>
                <button
                  @click="handleClose"
                  class="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  :aria-label="$t('common.close')"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Content -->
            <form @submit.prevent="handleSubmit" class="p-6">
              <!-- Testimonial Text -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('activity.completion.testimonial.text') }}
                  <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.text"
                  rows="8"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  :placeholder="$t('activity.completion.testimonial.textPlaceholder')"
                ></textarea>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ form.text.length }} {{ $t('common.characters') }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  @click="handleClose"
                  class="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors cursor-pointer"
                  :disabled="saving"
                >
                  {{ $t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  class="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  :disabled="saving || !isFormValid"
                >
                  <span v-if="!saving">{{ $t('common.add') }}</span>
                  <span v-else class="flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ $t('common.saving') }}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

// Form state
const form = ref({
  text: ''
})

// Computed
const isFormValid = computed(() => {
  return form.value.text.trim() !== '' && form.value.text.trim().length >= 10
})

// Methods
const handleClose = () => {
  if (!props.saving) {
    resetForm()
    emit('close')
  }
}

const handleSubmit = () => {
  if (isFormValid.value && !props.saving) {
    emit('submit', {
      userId: authStore.user?.id,
      text: form.value.text
    })
  }
}

const resetForm = () => {
  form.value = {
    text: ''
  }
}

// Watch for modal close
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div > div,
.modal-leave-active > div > div {
  transition: all 0.3s ease;
}

.modal-enter-from > div > div,
.modal-leave-to > div > div {
  transform: scale(0.95);
  opacity: 0;
}
</style>
