<template>
  <div class="sound-wave-container">
    <div class="sound-wave-bars">
      <div v-for="i in 5" :key="i" class="wave-bar" :style="{ animationDelay: `${i * 0.1}s` }"></div>
    </div>
  </div>
</template>

<script setup>
// Composant d'animation d'ondes sonores pour la reconnaissance vocale
</script>

<style scoped>
.sound-wave-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
  height: 60px;
}

.sound-wave-bars {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
}

.wave-bar {
  width: 4px;
  height: 20px;
  background: linear-gradient(to top, #3b82f6, #8b5cf6);
  border-radius: 4px;
  animation: wave-pulse 0.8s ease-in-out infinite;
  transform-origin: center;
}

@keyframes wave-pulse {
  0%, 100% {
    height: 20px;
    opacity: 0.6;
  }
  50% {
    height: 50px;
    opacity: 1;
  }
}

/* Dark mode */
:global(.dark) .wave-bar {
  background: linear-gradient(to top, #60a5fa, #a78bfa);
}
</style>
