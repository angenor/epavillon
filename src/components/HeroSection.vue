<template>
  <section class="relative h-screen flex items-center justify-center overflow-hidden">
    <!-- Vidéo de fond -->
    <video 
      class="absolute inset-0 z-0 w-full h-full object-cover dark:sepia"
      src="/videos/IFDD_Roumanie.mp4"
      autoplay
      muted
      loop
      playsinline
    ></video>
    
    <!-- Overlay gradient -->
    <div class="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/30 to-black/50 dark:from-black/70 dark:via-black/50 dark:to-black/70"></div>

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
    <div class="absolute z-20 bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-2xl text-white" />
    </div>

    <!-- galerie video -->
    <div class="z-0 absolute bottom-0 left-0 w-full h-56 bg-gradient-to-t from-black to-transparent">
      <div class="flex mt-16 ml-10">
        <div class="p-1 bg-white/70 rounded-md backdrop-blur-sm border border-white">
          <div class="h-14 w-20 bg-amber-200 rounded-md flex">
            <button class="flex items-center justify-center h-full w-full cursor-pointer">
              <div class="p-1 bg-white/70 rounded-full backdrop-blur-sm border border-white">
                <font-awesome-icon :icon="['fas', 'play']" class=" text-ifdd-violet-dark" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Panneau des activités -->
    <div class="h-screen absolute top-0 right-0 z-20">
      <UpcomingActivities />
    </div>
  </section>
</template>

<script>
import { useI18n } from 'vue-i18n'
import UpcomingActivities from './UpcomingActivities.vue'

export default {
  name: 'HeroSection',
  components: {
    UpcomingActivities
  },
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