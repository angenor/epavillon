<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm"
          @click="$emit('close')"
        ></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all"
            @click.stop
          >
            <!-- Header -->
            <div class="sticky top-0 z-10 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 rounded-t-2xl">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h2 class="text-2xl font-bold mb-2">
                    {{ $t('activity.completion.modal.title') }}
                  </h2>
                  <p class="text-white/90 text-sm">
                    {{ $t('activity.completion.modal.subtitle') }}
                  </p>
                </div>
                <button
                  @click="$emit('close')"
                  class="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  :aria-label="$t('common.close')"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 max-h-[70vh] overflow-y-auto">
              <!-- Validation Status -->
              <div v-if="validationResult" class="mb-6">
                <div
                  v-if="validationResult.is_valid"
                  class="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 class="font-semibold text-green-900 dark:text-green-100">
                      {{ $t('activity.completion.modal.allComplete') }}
                    </h3>
                    <p class="text-sm text-green-700 dark:text-green-300 mt-1">
                      {{ $t('activity.completion.modal.allCompleteDesc') }}
                    </p>
                  </div>
                </div>

                <div
                  v-else
                  class="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                >
                  <svg class="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div class="flex-1">
                    <h3 class="font-semibold text-orange-900 dark:text-orange-100">
                      {{ $t('activity.completion.modal.missing') }}
                    </h3>
                    <ul class="mt-2 space-y-1 text-sm text-orange-700 dark:text-orange-300">
                      <li
                        v-for="element in validationResult.missing_elements"
                        :key="element"
                        class="flex items-center gap-2"
                      >
                        <span class="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                        {{ element }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Requirements List -->
              <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  {{ $t('activity.completion.modal.requirements') }}
                </h3>
                <ul class="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li class="flex items-start gap-2">
                    <span :class="hasReport ? 'text-green-500' : 'text-gray-400'">
                      {{ hasReport ? '✓' : '○' }}
                    </span>
                    <span>{{ $t('activity.completion.modal.req1') }}</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span :class="hasEnoughTestimonials ? 'text-green-500' : 'text-gray-400'">
                      {{ hasEnoughTestimonials ? '✓' : '○' }}
                    </span>
                    <span>{{ $t('activity.completion.modal.req2') }} ({{ currentTestimonialsCount }}/2)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span :class="hasPhotos ? 'text-green-500' : 'text-gray-400'">
                      {{ hasPhotos ? '✓' : '○' }}
                    </span>
                    <span>{{ $t('activity.completion.modal.req3') }}</span>
                  </li>
                </ul>
              </div>

              <!-- Quick Actions -->
              <div class="grid gap-4 sm:grid-cols-3">
                <button
                  @click="scrollToSection('completion-report')"
                  class="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary dark:hover:border-primary transition-all cursor-pointer group"
                  :class="hasReport ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : ''"
                >
                  <div class="flex-shrink-0">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center"
                      :class="hasReport ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="text-left">
                    <div class="font-semibold text-gray-900 dark:text-white">
                      {{ $t('activity.completion.modal.action1') }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ hasReport ? $t('common.completed') : $t('common.required') }}
                    </div>
                  </div>
                </button>

                <button
                  @click="scrollToSection('completion-testimonials')"
                  class="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary dark:hover:border-primary transition-all cursor-pointer group"
                  :class="hasEnoughTestimonials ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : ''"
                >
                  <div class="flex-shrink-0">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center"
                      :class="hasEnoughTestimonials ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                  </div>
                  <div class="text-left">
                    <div class="font-semibold text-gray-900 dark:text-white">
                      {{ $t('activity.completion.modal.action2') }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ currentTestimonialsCount }}/2 {{ $t('common.added') }}
                    </div>
                  </div>
                </button>

                <button
                  @click="scrollToSection('media-gallery')"
                  class="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary dark:hover:border-primary transition-all cursor-pointer group"
                  :class="hasPhotos ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : ''"
                >
                  <div class="flex-shrink-0">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center"
                      :class="hasPhotos ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="text-left">
                    <div class="font-semibold text-gray-900 dark:text-white">
                      {{ $t('activity.completion.modal.action3') }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ hasPhotos ? $t('common.completed') : $t('common.required') }}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between gap-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('activity.completion.modal.footerNote') }}
                </p>
                <button
                  @click="$emit('close')"
                  class="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  {{ validationResult?.is_valid ? $t('common.close') : $t('activity.completion.modal.startNow') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  validationResult: {
    type: Object,
    default: null
  },
  hasReport: {
    type: Boolean,
    default: false
  },
  hasEnoughTestimonials: {
    type: Boolean,
    default: false
  },
  hasPhotos: {
    type: Boolean,
    default: false
  },
  currentTestimonialsCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const scrollToSection = (sectionId) => {
  // Fermer le modal
  emit('close')

  // Attendre que le modal se ferme puis scroller
  setTimeout(() => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Ajouter un effet visuel temporaire
      element.classList.add('ring-4', 'ring-primary', 'ring-opacity-50')
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-primary', 'ring-opacity-50')
      }, 2000)
    }
  }, 300)
}
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
