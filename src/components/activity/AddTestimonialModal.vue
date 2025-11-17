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
              <!-- Participant Name -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('activity.completion.testimonial.participantName') }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.userName"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                  :placeholder="$t('activity.completion.testimonial.participantNamePlaceholder')"
                />
              </div>

              <!-- Participant Email -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('activity.completion.testimonial.participantEmail') }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.userEmail"
                  type="email"
                  required
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                  :placeholder="$t('activity.completion.testimonial.participantEmailPlaceholder')"
                />
              </div>

              <!-- Testimonial Text -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('activity.completion.testimonial.text') }}
                  <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.text"
                  rows="5"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  :placeholder="$t('activity.completion.testimonial.textPlaceholder')"
                ></textarea>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ form.text.length }} {{ $t('common.characters') }}
                </p>
              </div>

              <!-- Thématiques -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('activity.completion.testimonial.themes') }}
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <label
                    v-for="theme in availableThemes"
                    :key="theme"
                    class="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    :class="form.themes.includes(theme) ? 'bg-primary/10 border-primary' : ''"
                  >
                    <input
                      type="checkbox"
                      :value="theme"
                      v-model="form.themes"
                      class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ $t(`themes.${theme}`) }}
                    </span>
                  </label>
                </div>
              </div>

              <!-- Photo Upload (Optional) -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('activity.completion.testimonial.photo') }}
                  <span class="text-xs text-gray-500 font-normal ml-1">
                    ({{ $t('common.optional') }})
                  </span>
                </label>

                <div v-if="!form.photoUrl" class="relative">
                  <input
                    ref="photoInput"
                    type="file"
                    accept="image/*"
                    @change="handlePhotoUpload"
                    class="hidden"
                  />
                  <button
                    type="button"
                    @click="$refs.photoInput.click()"
                    class="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
                    :disabled="uploadingPhoto"
                  >
                    <div class="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg v-if="!uploadingPhoto" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <svg v-else class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>
                        {{ uploadingPhoto
                          ? $t('common.uploading')
                          : $t('activity.completion.testimonial.uploadPhoto')
                        }}
                      </span>
                    </div>
                  </button>
                </div>

                <div v-else class="relative">
                  <img
                    :src="form.photoUrl"
                    alt="Preview"
                    class="w-32 h-32 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    @click="removePhoto"
                    class="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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

// Thématiques disponibles
const availableThemes = [
  'pertes_et_prejudices',
  'adaptation',
  'attenuation',
  'financement_climatique',
  'transfert_technologique',
  'renforcement_capacites'
]

// Form state
const form = ref({
  userName: '',
  userEmail: '',
  text: '',
  photoUrl: '',
  themes: []
})

const uploadingPhoto = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.value.userName.trim() !== '' &&
         form.value.userEmail.trim() !== '' &&
         form.value.text.trim() !== ''
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
      userName: form.value.userName,
      userEmail: form.value.userEmail,
      text: form.value.text,
      photoUrl: form.value.photoUrl,
      themes: form.value.themes
    })
  }
}

const handlePhotoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  uploadingPhoto.value = true

  try {
    // Émettre l'événement pour que le parent gère l'upload
    emit('upload-photo', file, (url) => {
      form.value.photoUrl = url
      uploadingPhoto.value = false
    })
  } catch (error) {
    console.error('Error uploading photo:', error)
    uploadingPhoto.value = false
  }
}

const removePhoto = () => {
  form.value.photoUrl = ''
}

const resetForm = () => {
  form.value = {
    userName: '',
    userEmail: '',
    text: '',
    photoUrl: '',
    themes: []
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
