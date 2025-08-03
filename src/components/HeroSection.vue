<template>
  <section class="relative h-screen flex items-center justify-center overflow-hidden">
    <!-- Image de fond -->
    <div 
      class="absolute inset-0 z-0 dark:sepia"
      :style="{
        backgroundImage: 'url(/images/image_de_fond_page_accueil.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }"
    >
      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 dark:from-black/70 dark:via-black/50 dark:to-black/70"></div>
    </div>

    <!-- Contenu -->
    <div class="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in font-maverick">
        {{ t('hero.welcome') }}
      </h1>
      <p class="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 animate-fade-in-delay">
        {{ t('hero.subtitle') }}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
        <button class="px-8 py-3 bg-ifdd-bleu hover:bg-ifdd-bleu-dark text-white font-medium font-helvetica rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          {{ t('common.discover') }}
        </button>
        <button class="px-8 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium font-helvetica rounded-lg transition-colors border border-white/30">
          {{ t('common.learnMore') }}
        </button>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  name: 'HeroSection',
  setup() {
    const { t } = useI18n()
    return { t }
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-fade-in-delay {
  animation: fade-in 1s ease-out 0.3s both;
}

.animate-fade-in-delay-2 {
  animation: fade-in 1s ease-out 0.6s both;
}
</style>