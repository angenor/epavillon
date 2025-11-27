<template>
  <div v-if="isVisible" class="relative">
    <!-- Événement Widget -->
    <RouterLink
      to="/programmations/2025/seminaire-chypre"
      class="block cursor-pointer group"
    >
      <div class="text-white bg-gradient-to-br from-orange-500/40 via-blue-600/40 to-blue-700/40 backdrop-blur-sm rounded-xl px-4 py-3 hover:from-orange-500/50 hover:via-blue-600/50 hover:to-blue-700/50 transition-all duration-300 shadow-lg border-2 border-orange-400/30 relative overflow-hidden">
        <!-- Effet de brillance animé -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer pointer-events-none"></div>

        <div class="relative z-10">
          <!-- Titre -->
          <div class="font-bold text-xl mb-2 flex items-center gap-2">
            <svg class="w-5 h-5 text-orange-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Séminaire IA & Francophonie</span>
          </div>

          <!-- Informations -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-orange-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-sm font-medium">Larnaka, Chypre</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-orange-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm font-medium">1-3 Décembre 2025</span>
            </div>

            <!-- Description courte -->
            <p class="text-xs text-white/90 mt-2 line-clamp-2">
              Séminaire régional sur l'intelligence artificielle et la gouvernance climatique dans l'espace francophone
            </p>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
            <div class="flex items-center gap-2">
              <span class="text-xs opacity-75">OIF / IFDD</span>
              <div class="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                <span class="text-xs font-bold">O</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-xs font-semibold text-orange-200 group-hover:text-white transition-colors">
              <span>Voir le programme</span>
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
import { RouterLink } from 'vue-router'

// Dates du séminaire (en heure de Chypre - UTC+2)
const seminarStartDate = new Date('2025-12-01T09:00:00+02:00')
const seminarEndDate = new Date('2025-12-03T18:00:00+02:00')

// Le widget est visible 7 jours avant le séminaire jusqu'à sa fin
const isVisible = computed(() => {
  const now = new Date()
  const oneWeekBefore = new Date(seminarStartDate)
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7)

  return now >= oneWeekBefore && now <= seminarEndDate
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
