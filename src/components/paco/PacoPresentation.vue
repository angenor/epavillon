<template>
  <div class="text-white">
    <!-- Organized by badge -->
    <p class="text-xs sm:text-sm font-semibold uppercase tracking-widest text-green-400 mb-3">
      {{ t('paco.organized_by') }}
    </p>

    <!-- Title -->
    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight tracking-tight">
      {{ t('paco.title') }}
    </h1>

    <!-- Subtitle -->
    <p class="text-lg sm:text-xl text-white/80 mb-5 lg:mb-6 font-light">
      {{ t('paco.subtitle') }}
    </p>

    <!-- Description (hidden on small screens for compactness) -->
    <p class="hidden lg:block text-white/55 leading-relaxed mb-8 text-sm max-w-lg">
      {{ t('paco.description') }}
    </p>

    <!-- Info badges -->
    <div class="flex flex-wrap gap-2 sm:gap-3">
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
        <font-awesome-icon :icon="['fas', 'calendar-days']" class="text-green-400 text-xs" />
        <span class="text-white/90">{{ t('paco.date') }}</span>
      </div>
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
        <font-awesome-icon :icon="['fas', 'clock']" class="text-green-400 text-xs" />
        <span class="text-white/90">{{ t('paco.duration') }}</span>
      </div>
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
        <font-awesome-icon :icon="['fas', 'video']" class="text-green-400 text-xs" />
        <span class="text-white/90">{{ t('paco.format') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
