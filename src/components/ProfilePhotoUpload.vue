<template>
  <div class="flex flex-col items-center space-y-4">
    <!-- Aperçu de la photo -->
    <div class="relative">
      <div
        class="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-600"
      >
        <img
          v-if="previewUrl"
          :src="previewUrl"
          :alt="t('auth.fields.profilePhoto')"
          class="w-full h-full object-cover"
        >
        <div
          v-else
          class="w-full h-full flex items-center justify-center"
        >
          <font-awesome-icon
            icon="user"
            class="text-4xl text-gray-400 dark:text-gray-500"
          />
        </div>
      </div>
      
      <!-- Badge de chargement -->
      <div
        v-if="processing"
        class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
      >
        <font-awesome-icon
          icon="spinner"
          class="text-white text-2xl animate-spin"
        />
      </div>
    </div>

    <!-- Bouton d'upload -->
    <div class="flex flex-col items-center space-y-2">
      <label
        for="photo-upload"
        class="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <font-awesome-icon
          icon="camera"
          class="mr-2"
        />
        {{ previewUrl ? t('auth.fields.changePhoto') : t('auth.fields.addPhoto') }}
      </label>
      <input
        id="photo-upload"
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        class="hidden"
        @change="handleFileSelect"
        :disabled="processing"
      >
      
      <!-- Texte d'aide -->
      <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
        {{ t('auth.helpers.photoRequirements') }}
      </p>
    </div>

    <!-- Messages d'erreur -->
    <div
      v-if="error"
      class="rounded-lg bg-red-50 dark:bg-red-900/50 p-3 max-w-xs"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <font-awesome-icon
            icon="circle-exclamation"
            class="h-5 w-5 text-red-400"
          />
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Informations sur le fichier -->
    <div
      v-if="fileInfo && !error"
      class="text-xs text-gray-500 dark:text-gray-400 space-y-1"
    >
      <p>{{ t('auth.helpers.originalSize') }}: {{ formatFileSize(fileInfo.originalSize) }}</p>
      <p>{{ t('auth.helpers.compressedSize') }}: {{ formatFileSize(fileInfo.compressedSize) }}</p>
      <p class="text-green-600 dark:text-green-400">
        {{ t('auth.helpers.compressionRatio') }}: {{ fileInfo.compressionRatio }}%
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { processImage, generateThumbnail, validateImageFile } from '@/utils/imageProcessor'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const processing = ref(false)
const error = ref('')
const previewUrl = ref('')
const fileInfo = ref(null)

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  error.value = ''
  processing.value = true

  try {
    // Valider le fichier
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      error.value = validation.errors.join(' ')
      return
    }

    const originalSize = file.size

    // Traiter l'image principale (haute qualité)
    const { file: processedFile, dataUrl } = await processImage(file, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.85,
      maxSizeKB: 500
    })

    // Générer la vignette (basse qualité)
    const { file: thumbnailFile, dataUrl: thumbnailDataUrl } = await generateThumbnail(file)

    // Mettre à jour l'aperçu
    previewUrl.value = dataUrl

    // Calculer les informations de compression
    fileInfo.value = {
      originalSize,
      compressedSize: processedFile.size,
      compressionRatio: Math.round((1 - processedFile.size / originalSize) * 100)
    }

    // Émettre les fichiers traités
    emit('update:modelValue', {
      original: file,
      processed: processedFile,
      thumbnail: thumbnailFile,
      previewUrl: dataUrl,
      thumbnailUrl: thumbnailDataUrl
    })

  } catch (err) {
    console.error('Error processing image:', err)
    error.value = t('auth.errors.imageProcessingFailed')
  } finally {
    processing.value = false
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>