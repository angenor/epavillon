<template>
  <section class="relative h-64 md:h-80 overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img 
        src="/images/example/event_banniere_par_defaut_32_9.jpg" 
        alt="Community Banner"
        class="w-full h-full object-cover"
      >
      <!-- Dark Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
    </div>

    <!-- Content -->
    <div class="relative h-full flex items-end">
      <div class="container mx-auto px-4 pb-8">
        <div class="max-w-4xl">
          <!-- Title -->
          <h1 class="text-3xl md:text-5xl font-bold text-white mb-3">
            {{ t('community.hero.title') }}
          </h1>
          
          <!-- Description -->
          <p class="text-lg md:text-xl text-white/90 max-w-2xl">
            {{ t('community.hero.subtitle') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>