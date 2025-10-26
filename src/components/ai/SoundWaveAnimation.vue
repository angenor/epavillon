<template>
  <div class="sound-wave-container">
    <div class="sound-wave-bars">
      <div
        v-for="(amplitude, i) in audioData"
        :key="i"
        class="wave-bar"
        :style="{ height: getBarHeight(amplitude) }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  audioData: {
    type: Array,
    default: () => [0.3, 0.5, 0.7, 0.5, 0.3] // Valeurs par défaut pour 5 barres
  }
})

/**
 * Calcule la hauteur d'une barre en fonction de l'amplitude
 * @param {number} amplitude - Amplitude entre 0 et 1
 * @returns {string} Hauteur en pixels
 */
const getBarHeight = (amplitude) => {
  const minHeight = 20 // Hauteur minimum
  const maxHeight = 60 // Hauteur maximum
  const height = minHeight + (maxHeight - minHeight) * amplitude
  return `${Math.max(minHeight, Math.min(maxHeight, height))}px`
}
</script>

<style scoped>
.sound-wave-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
  height: 80px;
}

.sound-wave-bars {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.wave-bar {
  width: 6px;
  background: linear-gradient(to top, #3b82f6, #8b5cf6);
  border-radius: 4px;
  transition: height 0.05s ease-out;
  transform-origin: center;
}

/* Dark mode */
:global(.dark) .wave-bar {
  background: linear-gradient(to top, #60a5fa, #a78bfa);
}
</style>
