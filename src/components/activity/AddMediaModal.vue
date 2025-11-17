<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="$emit('cancel')"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/50 transition-opacity" @click="$emit('cancel')"></div>

          <!-- Modal -->
          <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 z-10">
            <!-- En-tête -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg
                    class="w-5 h-5 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ t('activities.addPhoto') }}
                </h3>
              </div>
              <button
                @click="$emit('cancel')"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Formulaire -->
            <form @submit.prevent="$emit('submit')" class="space-y-6">
              <!-- Upload de fichier -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activities.selectImage') }}
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    type="file"
                    accept="image/*"
                    @change="$emit('file-selected', $event)"
                    class="hidden"
                    ref="fileInput"
                    required
                  />
                  <button
                    type="button"
                    @click="$refs.fileInput.click()"
                    class="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer text-center"
                  >
                    <svg
                      class="w-8 h-8 mx-auto mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ selectedFile ? selectedFile.name : t('activities.clickToSelectImage') }}
                    </span>
                  </button>
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {{ t('activities.imageFormatsSupported') }}
                </p>
              </div>

              <!-- Aperçu de l'image -->
              <div v-if="selectedFile" class="relative space-y-2">
                <img
                  :src="previewUrl"
                  alt="Aperçu"
                  class="w-full h-64 object-cover rounded-lg"
                />
                <!-- Informations sur le fichier -->
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">
                    {{ selectedFile.name }}
                  </span>
                  <span
                    :class="[
                      'font-medium',
                      fileSizeKB > 1024 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                    ]"
                  >
                    {{ formatSize(selectedFile.size) }}
                  </span>
                </div>
                <!-- Avertissement si trop gros -->
                <div v-if="fileSizeKB > 1024" class="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <svg class="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-orange-800 dark:text-orange-200">
                      {{ t('activities.imageTooLarge') }}
                    </p>
                    <p class="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      {{ t('activities.imageWillBeCompressed') }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Titre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activities.photoTitle') }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  :placeholder="t('activities.photoTitlePlaceholder')"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activities.photoDescription') }}
                </label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  :placeholder="t('activities.photoDescriptionPlaceholder')"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>

              <!-- Auteur -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activities.photoAuthor') }}
                </label>
                <input
                  v-model="form.author"
                  type="text"
                  :placeholder="t('activities.photoAuthorPlaceholder')"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- Barre de progression -->
              <div v-if="uploading && uploadProgress > 0" class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ t('activities.uploading') }}</span>
                  <span class="text-purple-600 dark:text-purple-400">{{ uploadProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Boutons -->
              <div class="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  @click="$emit('cancel')"
                  :disabled="uploading"
                  class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="uploading || !selectedFile || !form.title.trim()"
                  class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span v-if="uploading">{{ t('activities.uploading') }}...</span>
                  <span v-else>{{ t('common.add') }}</span>
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
import { computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  form: {
    type: Object,
    required: true
  },
  selectedFile: {
    type: File,
    default: null
  },
  uploading: {
    type: Boolean,
    default: false
  },
  uploadProgress: {
    type: Number,
    default: 0
  }
})

defineEmits(['submit', 'cancel', 'file-selected'])

// Aperçu de l'image
const previewUrl = ref('')

// Taille du fichier en KB
const fileSizeKB = computed(() => {
  if (!props.selectedFile) return 0
  return Math.round(props.selectedFile.size / 1024)
})

// Formater la taille du fichier
const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} octets`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} Mo`
}

watch(() => props.selectedFile, (newFile) => {
  if (newFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target.result
    }
    reader.readAsDataURL(newFile)
  } else {
    previewUrl.value = ''
  }
}, { immediate: true })
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
</style>
