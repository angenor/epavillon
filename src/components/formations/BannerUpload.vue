<template>
  <div class="space-y-4">
    <!-- Zone d'upload -->
    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
      <div class="space-y-1 text-center">
        <div v-if="!previewUrl" class="flex flex-col items-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="flex text-sm text-gray-600 dark:text-gray-400">
            <label for="banner-upload" class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <span>{{ t('formations.create.uploadBanner') }}</span>
              <input 
                id="banner-upload" 
                name="banner-upload" 
                type="file" 
                class="sr-only" 
                accept="image/jpeg,image/jpg,image/png,image/webp"
                @change="handleFileSelect"
                :disabled="uploading"
                ref="fileInput"
              >
            </label>
            <p class="pl-1">{{ t('formations.create.orDragDrop') }}</p>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, WebP {{ t('formations.create.maxFileSize') }}
          </p>
        </div>
        
        <!-- Prévisualisation de la bannière -->
        <div v-else class="relative">
          <img 
            :src="previewUrl" 
            alt="Aperçu bannière" 
            class="max-h-32 mx-auto rounded-lg shadow-sm"
          >
          <button
            type="button"
            @click="removeBanner"
            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ uploadedFileName }}</p>
        </div>
        
        <!-- Indicateur de téléchargement -->
        <div v-if="uploading" class="flex items-center justify-center mt-2">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('formations.create.uploading') }}</span>
        </div>
      </div>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/50 p-3">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Informations sur le fichier -->
    <div v-if="fileInfo && !error" class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
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
import { useSupabase } from '@/composables/useSupabase'
import { processImage, generateThumbnail, validateImageFile } from '@/utils/imageProcessor'

const { t } = useI18n()
const { supabase } = useSupabase()

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      banner_hd_url: '',
      banner_thumbnail_url: ''
    })
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const uploading = ref(false)
const error = ref('')
const previewUrl = ref('')
const uploadedFileName = ref('')
const fileInfo = ref(null)

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  error.value = ''
  uploading.value = true

  try {
    // Valider le fichier
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      error.value = validation.errors.join(' ')
      return
    }

    const originalSize = file.size

    // Traiter l'image haute qualité (banner_hd_url)
    const { file: hdFile, dataUrl } = await processImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.9,
      maxSizeKB: 1500 // Plus large pour la haute qualité
    })

    // Générer une vignette (banner_thumbnail_url)
    const { file: thumbnailFile } = await generateThumbnail(file, 400)

    // Créer des noms de fichiers uniques
    const fileExt = file.name.split('.').pop() || 'jpg'
    const baseFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`
    const hdFilePath = `formation/${baseFileName}_hd.${fileExt}`
    const thumbnailFilePath = `formation/${baseFileName}_thumb.${fileExt}`

    // Upload de l'image haute qualité
    const { data: hdData, error: hdError } = await supabase.storage
      .from('epavillonp')
      .upload(hdFilePath, hdFile)

    if (hdError) {
      console.error('Erreur upload HD:', hdError)
      error.value = t('formations.create.errors.uploadFailed')
      return
    }

    // Upload de la vignette
    const { data: thumbData, error: thumbError } = await supabase.storage
      .from('epavillonp')
      .upload(thumbnailFilePath, thumbnailFile)

    if (thumbError) {
      console.error('Erreur upload thumbnail:', thumbError)
      error.value = t('formations.create.errors.uploadFailed')
      return
    }

    // Obtenir les URLs publiques
    const { data: { publicUrl: hdPublicUrl } } = supabase.storage
      .from('epavillonp')
      .getPublicUrl(hdFilePath)

    const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
      .from('epavillonp')
      .getPublicUrl(thumbnailFilePath)

    // Mettre à jour les données
    previewUrl.value = dataUrl
    uploadedFileName.value = file.name
    
    // Calculer les informations de compression
    fileInfo.value = {
      originalSize,
      compressedSize: hdFile.size,
      compressionRatio: Math.round((1 - hdFile.size / originalSize) * 100)
    }

    // Émettre les URLs
    emit('update:modelValue', {
      banner_hd_url: hdPublicUrl,
      banner_thumbnail_url: thumbPublicUrl
    })

  } catch (err) {
    console.error('Erreur lors de l\'upload:', err)
    error.value = t('formations.create.errors.uploadFailed')
  } finally {
    uploading.value = false
    // Réinitialiser l'input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const removeBanner = async () => {
  if (props.modelValue?.banner_hd_url || props.modelValue?.banner_thumbnail_url) {
    try {
      const filesToRemove = []
      
      // Extraire les chemins des fichiers depuis les URLs
      if (props.modelValue.banner_hd_url) {
        const hdUrl = new URL(props.modelValue.banner_hd_url)
        const hdFilePath = hdUrl.pathname.split('/').slice(-2).join('/')
        filesToRemove.push(hdFilePath)
      }
      
      if (props.modelValue.banner_thumbnail_url) {
        const thumbUrl = new URL(props.modelValue.banner_thumbnail_url)
        const thumbFilePath = thumbUrl.pathname.split('/').slice(-2).join('/')
        filesToRemove.push(thumbFilePath)
      }
      
      // Supprimer les fichiers de Supabase Storage
      if (filesToRemove.length > 0) {
        await supabase.storage
          .from('epavillonp')
          .remove(filesToRemove)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
  
  // Réinitialiser les valeurs
  previewUrl.value = ''
  uploadedFileName.value = ''
  fileInfo.value = null
  error.value = ''
  emit('update:modelValue', {
    banner_hd_url: '',
    banner_thumbnail_url: ''
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>