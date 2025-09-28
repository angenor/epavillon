<template>
  <div class="relative">
    <!-- Input file caché -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      class="hidden"
    >

    <!-- Bouton de sélection d'image -->
    <div v-if="!selectedImage" class="text-center">
      <button
        @click="triggerFileSelect"
        class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'upload']" class="mr-2" />
        {{ t('events.selectImage') }}
      </button>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {{ t('events.imageWillBeAdjustedTo16x9') }}
      </p>
    </div>

    <!-- Éditeur d'image -->
    <div v-if="selectedImage && showCropper" class="space-y-4">
      <!-- Info du ratio actuel -->
      <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <div class="flex items-center text-sm">
          <font-awesome-icon :icon="['fas', 'info-circle']" class="text-blue-500 mr-2" />
          <span class="text-blue-800 dark:text-blue-200">
            {{ t('events.currentRatio') }}: {{ currentRatio }}
            <span v-if="!isCorrectRatio" class="ml-2 text-orange-600 dark:text-orange-400">
              ({{ t('events.needsAdjustment') }})
            </span>
            <span v-else class="ml-2 text-green-600 dark:text-green-400">
              ({{ t('events.perfectRatio') }})
            </span>
          </span>
        </div>
      </div>

      <!-- Zone de recadrage -->
      <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <!-- Informations de débogage -->
        <div class="mb-2 text-xs text-gray-600 dark:text-gray-400">
          <p>Image: {{ imageWidth }}x{{ imageHeight }} | Ratio correct: {{ isCorrectRatio }}</p>
          <p>Crop zone: {{ Math.round(cropArea.width) }}x{{ Math.round(cropArea.height) }}</p>
        </div>

        <div class="relative mx-auto" :style="{ maxWidth: '600px' }">
          <!-- Image d'origine -->
          <img
            ref="originalImage"
            :src="selectedImage"
            alt="Image à recadrer"
            class="max-w-full h-auto block border-2 border-gray-300"
            crossorigin="anonymous"
            @load="onImageLoad"
            @error="onImageError"
          >

          <!-- Overlay de recadrage -->
          <div
            v-if="!isCorrectRatio && imageWidth > 0 && imageHeight > 0"
            class="absolute inset-0"
            style="pointer-events: none;"
          >
            <!-- Zone de recadrage 16:9 -->
            <div
              class="absolute border-2 border-red-500 bg-red-500/20 cursor-move"
              :style="cropAreaStyle"
              style="pointer-events: auto;"
              @mousedown="startDragging"
              @touchstart="startDragging"
            >
              <div class="absolute inset-0 bg-transparent">
                <!-- Texte de débogage -->
                <div class="text-white text-xs p-1 bg-black/50">
                  Recadrage 16:9
                </div>
              </div>

              <!-- Coins de redimensionnement -->
              <div
                v-for="corner in corners"
                :key="corner"
                :class="`absolute w-4 h-4 bg-red-500 border border-white ${getCornerClasses(corner)}`"
                @mousedown.stop="startResizing(corner)"
                @touchstart.stop="startResizing(corner)"
              ></div>
            </div>
          </div>

          <!-- Message si image non chargée -->
          <div v-if="imageWidth === 0" class="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
            <p class="text-gray-600">Chargement de l'image...</p>
          </div>
        </div>

        <!-- Contrôles de recadrage -->
        <div v-if="!isCorrectRatio" class="mt-4 flex justify-center space-x-4">
          <button
            @click="resetCrop"
            class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'undo']" class="mr-1" />
            {{ t('common.reset') }}
          </button>
          <button
            @click="autoFitCrop"
            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'magic']" class="mr-1" />
            {{ t('events.autoFit') }}
          </button>
        </div>
      </div>

      <!-- Prévisualisation -->
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {{ t('events.preview16x9') }}
        </h4>
        <div class="relative mx-auto bg-gray-200 dark:bg-gray-600 rounded" style="max-width: 400px;">
          <canvas
            ref="previewCanvas"
            class="w-full aspect-video rounded"
          ></canvas>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelEdit"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          @click="confirmCrop"
          :disabled="processing"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <font-awesome-icon v-if="processing" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
          {{ t('events.confirmAndUse') }}
        </button>
      </div>
    </div>

    <!-- Image finale (prévisualisation simple) -->
    <div v-if="selectedImage && !showCropper" class="space-y-4">
      <div class="relative">
        <img
          :src="selectedImage"
          alt="Bannière"
          class="w-full aspect-video object-cover rounded-lg"
        >
        <button
          @click="editImage"
          class="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
        >
          <font-awesome-icon :icon="['fas', 'edit']" />
        </button>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="selectNewImage"
          class=" cursor-pointer px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          {{ t('events.selectOtherImage') }}
        </button>
        <button
          @click="finalizeImage"
          :disabled="processing"
          class="cursor-pointer px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce disabled:opacity-50 transition-colors"
        >
          <font-awesome-icon v-if="processing" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
          {{ t('events.useThisImage') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
const props = defineProps({
  initialImage: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['imageSelected', 'imageProcessed'])

// Refs
const fileInput = ref(null)
const originalImage = ref(null)
const previewCanvas = ref(null)
const selectedImage = ref(props.initialImage)
const showCropper = ref(false)
const processing = ref(false)
const originalFile = ref(null)

// Image properties
const imageWidth = ref(0)
const imageHeight = ref(0)
const currentRatio = ref('1:1')

// Crop properties
const cropArea = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0
})

const isDragging = ref(false)
const isResizing = ref(false)
const resizeCorner = ref('')
const dragStart = ref({ x: 0, y: 0 })

// Computed
const isCorrectRatio = computed(() => {
  const ratio = imageWidth.value / imageHeight.value
  return Math.abs(ratio - 16/9) < 0.01 // Tolérance de 1%
})

const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

const cropAreaStyle = computed(() => {
  if (!originalImage.value || imageWidth.value === 0) return {}

  return {
    left: `${cropArea.value.x}px`,
    top: `${cropArea.value.y}px`,
    width: `${cropArea.value.width}px`,
    height: `${cropArea.value.height}px`
  }
})

// Methods
const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Stocker le fichier original
  originalFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target.result
    showCropper.value = true
    emit('imageSelected', file)
  }
  reader.readAsDataURL(file)
}

const onImageLoad = () => {
  const img = originalImage.value
  if (!img) return

  console.log('Image loaded:', img.naturalWidth, 'x', img.naturalHeight)

  imageWidth.value = img.naturalWidth
  imageHeight.value = img.naturalHeight

  const ratio = imageWidth.value / imageHeight.value
  currentRatio.value = `${Math.round(ratio * 100) / 100}:1`

  console.log('Current ratio:', currentRatio.value, 'Is correct:', isCorrectRatio.value)

  if (!isCorrectRatio.value) {
    setupInitialCrop()
  } else {
    showCropper.value = false
  }

  updatePreview()
}

const onImageError = (event) => {
  console.error('Error loading image:', event)
  imageWidth.value = 0
  imageHeight.value = 0
}

const setupInitialCrop = () => {
  const img = originalImage.value
  if (!img) {
    console.log('No image element found')
    return
  }

  // Attendre que l'image soit complètement chargée et rendue
  setTimeout(() => {
    const imgRect = img.getBoundingClientRect()
    console.log('Image rect:', imgRect)

    if (imgRect.width === 0 || imgRect.height === 0) {
      console.log('Image not yet rendered, retrying...')
      setTimeout(setupInitialCrop, 200)
      return
    }

    const targetRatio = 16 / 9
    const currentRatio = imageWidth.value / imageHeight.value
    const displayRatio = imgRect.width / imgRect.height

    console.log('Target ratio:', targetRatio, 'Current ratio:', currentRatio, 'Display ratio:', displayRatio)

    let cropWidth, cropHeight

    if (displayRatio > targetRatio) {
      // Image affichée trop large, recadrer la largeur
      cropHeight = imgRect.height
      cropWidth = cropHeight * targetRatio
    } else {
      // Image affichée trop haute, recadrer la hauteur
      cropWidth = imgRect.width
      cropHeight = cropWidth / targetRatio
    }

    // Centrer le recadrage
    const newCropArea = {
      x: (imgRect.width - cropWidth) / 2,
      y: (imgRect.height - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight
    }

    console.log('New crop area:', newCropArea)

    cropArea.value = newCropArea
    updatePreview()
  }, 200)
}

const autoFitCrop = () => {
  setupInitialCrop()
}

const resetCrop = () => {
  const img = originalImage.value
  if (!img) return

  const imgRect = img.getBoundingClientRect()
  const targetRatio = 16 / 9
  const imgRatio = imgRect.width / imgRect.height

  let cropWidth, cropHeight

  if (imgRatio > targetRatio) {
    // Image plus large que 16:9, prendre toute la hauteur
    cropHeight = imgRect.height
    cropWidth = cropHeight * targetRatio
  } else {
    // Image plus haute que 16:9, prendre toute la largeur
    cropWidth = imgRect.width
    cropHeight = cropWidth / targetRatio
  }

  cropArea.value = {
    x: (imgRect.width - cropWidth) / 2,
    y: (imgRect.height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight
  }
  updatePreview()
}

const updatePreview = () => {
  nextTick(() => {
    const canvas = previewCanvas.value
    const img = originalImage.value
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    const targetWidth = 400
    const targetHeight = targetWidth / (16/9)

    canvas.width = targetWidth
    canvas.height = targetHeight

    // Calculer les coordonnées de recadrage dans l'image originale
    const imgRect = img.getBoundingClientRect()
    const scaleX = imageWidth.value / imgRect.width
    const scaleY = imageHeight.value / imgRect.height

    const sourceX = cropArea.value.x * scaleX
    const sourceY = cropArea.value.y * scaleY
    const sourceWidth = cropArea.value.width * scaleX
    const sourceHeight = cropArea.value.height * scaleY

    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, targetWidth, targetHeight
    )
  })
}

const getCornerClasses = (corner) => {
  const classes = {
    'top-left': '-top-1 -left-1 cursor-nw-resize',
    'top-right': '-top-1 -right-1 cursor-ne-resize',
    'bottom-left': '-bottom-1 -left-1 cursor-sw-resize',
    'bottom-right': '-bottom-1 -right-1 cursor-se-resize'
  }
  return classes[corner]
}

const startDragging = (event) => {
  isDragging.value = true
  const clientX = event.clientX || event.touches[0].clientX
  const clientY = event.clientY || event.touches[0].clientY

  dragStart.value = {
    x: clientX - cropArea.value.x,
    y: clientY - cropArea.value.y
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDragging)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('touchend', stopDragging)
}

const handleDrag = (event) => {
  if (!isDragging.value) return

  const clientX = event.clientX || event.touches[0].clientX
  const clientY = event.clientY || event.touches[0].clientY

  const newX = clientX - dragStart.value.x
  const newY = clientY - dragStart.value.y

  // Contraintes de déplacement
  const img = originalImage.value
  if (!img) return

  const imgRect = img.getBoundingClientRect()
  const maxX = imgRect.width - cropArea.value.width
  const maxY = imgRect.height - cropArea.value.height

  cropArea.value.x = Math.max(0, Math.min(newX, maxX))
  cropArea.value.y = Math.max(0, Math.min(newY, maxY))

  updatePreview()
}

const stopDragging = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDragging)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDragging)
}

const startResizing = (corner) => {
  isResizing.value = true
  resizeCorner.value = corner

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResizing)
  document.addEventListener('touchmove', handleResize)
  document.addEventListener('touchend', stopResizing)
}

const handleResize = () => {
  if (!isResizing.value) return
  // Logique de redimensionnement ici si nécessaire
  // Pour l'instant, on garde le ratio 16:9 fixe
}

const stopResizing = () => {
  isResizing.value = false
  resizeCorner.value = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResizing)
  document.removeEventListener('touchmove', handleResize)
  document.removeEventListener('touchend', stopResizing)
}

const confirmCrop = async () => {
  processing.value = true
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = originalImage.value

    // Taille finale souhaitée (peut être configurée)
    const finalWidth = 1920
    const finalHeight = 1080

    canvas.width = finalWidth
    canvas.height = finalHeight

    // Calculer les coordonnées de recadrage
    const imgRect = img.getBoundingClientRect()
    const scaleX = imageWidth.value / imgRect.width
    const scaleY = imageHeight.value / imgRect.height

    const sourceX = cropArea.value.x * scaleX
    const sourceY = cropArea.value.y * scaleY
    const sourceWidth = cropArea.value.width * scaleX
    const sourceHeight = cropArea.value.height * scaleY

    try {
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, finalWidth, finalHeight
      )

      // Convertir en blob
      canvas.toBlob((blob) => {
        const croppedImageUrl = URL.createObjectURL(blob)
        selectedImage.value = croppedImageUrl
        showCropper.value = false
        emit('imageProcessed', blob)
        processing.value = false
      }, 'image/jpeg', 0.9)
    } catch (corsError) {
      console.error('CORS error in confirmCrop:', corsError)
      // Fallback : si erreur CORS, émettre le fichier original
      if (originalFile.value) {
        console.log('Utilisation du fichier original suite à une erreur CORS dans confirmCrop')
        showCropper.value = false
        emit('imageProcessed', originalFile.value)
        processing.value = false
      } else {
        throw corsError
      }
    }

  } catch (error) {
    console.error('Error processing image:', error)
    processing.value = false
  }
}

const cancelEdit = () => {
  selectedImage.value = null
  showCropper.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const editImage = () => {
  showCropper.value = true
}

const selectNewImage = () => {
  triggerFileSelect()
}

const finalizeImage = () => {
  // Si le fichier original fait moins de 160KB, l'émettre directement pour préserver la taille
  if (originalFile.value && (originalFile.value.size / 1024) <= 160) {
    console.log(`Image originale (${Math.round(originalFile.value.size / 1024)}KB) émise directement sans recompression`)
    emit('imageProcessed', originalFile.value)
    return
  }

  // Créer un nouvel élément Image pour charger l'image depuis selectedImage
  const img = new Image()

  // Ajouter l'attribut crossOrigin pour permettre l'utilisation avec canvas
  img.crossOrigin = 'anonymous'

  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    try {
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)

      canvas.toBlob((blob) => {
        if (blob) {
          console.log(`Image recompressée via canvas (${Math.round(blob.size / 1024)}KB)`)
          emit('imageProcessed', blob)
        } else {
          console.error('Failed to create blob from canvas')
        }
      }, 'image/jpeg', 0.9)
    } catch (error) {
      console.error('Error drawing image on canvas:', error)
      // Fallback: Si l'erreur CORS persiste, émettre le fichier original s'il existe
      if (originalFile.value) {
        console.log('Erreur CORS détectée, émission du fichier original')
        emit('imageProcessed', originalFile.value)
      }
    }
  }

  img.onerror = () => {
    console.error('Failed to load image for finalization')
    // Fallback: émettre le fichier original en cas d'erreur de chargement
    if (originalFile.value) {
      console.log('Erreur de chargement, émission du fichier original')
      emit('imageProcessed', originalFile.value)
    }
  }

  img.src = selectedImage.value
}
</script>
