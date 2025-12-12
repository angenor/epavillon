<template>
  <div v-if="isVisible" class="relative">
    <!-- Événement Widget -->
    <RouterLink
      to="/programmations/2025/atelier-bilan-cop30"
      class="block cursor-pointer group"
    >
      <div class="text-white bg-gradient-to-br from-green-500/40 via-green-600/40 to-emerald-700/40 backdrop-blur-sm rounded-xl px-4 py-3 hover:from-green-500/50 hover:via-green-600/50 hover:to-emerald-700/50 transition-all duration-300 shadow-lg border-2 border-green-400/30 relative overflow-hidden">
        <!-- Effet de brillance animé -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer pointer-events-none"></div>

        <div class="relative z-10">
          <!-- Badge En ligne -->
          <div class="flex items-center gap-2 mb-2">
            <span class="inline-flex items-center gap-1.5 bg-blue-500/80 px-2 py-0.5 rounded-md text-xs font-semibold">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ t('common.online') }}
            </span>
          </div>

          <!-- Titre -->
          <div class="font-bold text-lg mb-2 flex items-start gap-2">
            <svg class="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="line-clamp-2">{{ t('cop30Workshop.shortTitle') }}</span>
          </div>

          <!-- Informations -->
          <div class="space-y-2">
            <!-- Horaire -->
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium">{{ t('cop30Workshop.schedule') }}</span>
            </div>

            <!-- Description courte -->
            <p class="text-xs text-white/90 line-clamp-2">
              {{ t('cop30Workshop.title') }}
            </p>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
            <div class="flex items-center gap-2">
              <span class="text-xs opacity-75">IFDD-OIF</span>
              <div class="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                <span class="text-xs font-bold">I</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-xs font-semibold text-green-200 group-hover:text-white transition-colors">
              <span>{{ t('cop30Workshop.registerButton') }}</span>
              <svg class="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

const { t } = useI18n()

// Le widget est toujours visible car la date n'est pas encore définie
// TODO: Ajouter une date précise quand elle sera connue
const isVisible = computed(() => {
  return true
})
</script>

<style scoped>
/* Animation de brillance */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-12deg);
  }
  100% {
    transform: translateX(200%) skewX(-12deg);
  }
}

.animate-shimmer {
  animation: shimmer 3s infinite;
}

/* Effet hover sur le groupe */
.group:hover .group-hover\:translate-x-0\.5 {
  transform: translateX(0.125rem);
}

.group:hover .group-hover\:text-white {
  color: white;
}
</style>
