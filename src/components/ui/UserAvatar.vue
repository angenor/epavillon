<template>
  <div
    :class="[
      'relative flex items-center justify-center font-semibold text-white rounded-full overflow-hidden',
      sizeClasses,
      'transition-all duration-300'
    ]"
    :style="avatarStyle"
  >
    <!-- Image si disponible -->
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="alt"
      :class="['absolute inset-0 w-full h-full object-cover']"
      @error="handleImageError"
      @load="handleImageLoad"
    />

    <!-- Fallback avec initiales et dégradé -->
    <div
      v-else
      :class="['absolute inset-0 flex items-center justify-center', textSizeClasses]"
      :style="gradientStyle"
    >
      {{ initials }}
    </div>

    <!-- Indicateur de statut (optionnel) -->
    <div
      v-if="showStatus"
      :class="[
        'absolute border-2 border-white dark:border-gray-800 rounded-full',
        statusPositionClasses,
        status === 'online' ? 'bg-green-400' :
        status === 'away' ? 'bg-yellow-400' :
        status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
      ]"
    ></div>

    <!-- Animation de chargement -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"
    ></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { generateInitials, generateGradientStyle } from '@/utils/avatar'

const props = defineProps({
  src: {
    type: String,
    default: null
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'Avatar'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value)
  },
  showStatus: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'offline',
    validator: (value) => ['online', 'away', 'busy', 'offline'].includes(value)
  }
})

// État local
const imageError = ref(false)
const loading = ref(false)

// Computed
const initials = computed(() => {
  return generateInitials(props.firstName, props.lastName)
})

const fullName = computed(() => {
  return `${props.firstName} ${props.lastName}`.trim()
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24'
  }
  return sizes[props.size]
})

const textSizeClasses = computed(() => {
  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  }
  return textSizes[props.size]
})

const statusPositionClasses = computed(() => {
  const positions = {
    xs: 'bottom-0 right-0 w-2 h-2',
    sm: 'bottom-0 right-0 w-2.5 h-2.5',
    md: 'bottom-0 right-0 w-3 h-3',
    lg: 'bottom-1 right-1 w-4 h-4',
    xl: 'bottom-1 right-1 w-5 h-5',
    '2xl': 'bottom-1 right-1 w-6 h-6'
  }
  return positions[props.size]
})

const avatarStyle = computed(() => {
  if (props.src && !imageError.value) {
    return {}
  }
  return {}
})

const gradientStyle = computed(() => {
  return {
    background: generateGradientStyle(fullName.value)
  }
})

// Méthodes
const handleImageError = () => {
  imageError.value = true
  loading.value = false
}

const handleImageLoad = () => {
  loading.value = false
}
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>