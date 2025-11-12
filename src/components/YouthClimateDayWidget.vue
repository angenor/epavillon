<template>
  <div v-if="shouldDisplay" class="px-3 py-4">
    <!-- Card de la Journée Jeunesse -->
    <div class="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-green-500/50 shadow-xl">
      <!-- Badge LIVE si en direct -->
      <div v-if="isLive" class="flex items-center gap-2 mb-3">
        <div class="flex items-center gap-1.5 bg-red-500 px-3 py-1.5 rounded-lg animate-pulse">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span class="text-white text-xs font-bold uppercase tracking-wider">{{ t('activities.live') || 'Direct' }}</span>
        </div>
      </div>

      <!-- Titre -->
      <h3 class="text-white font-bold text-lg mb-2 leading-tight">
        🌱 {{ t('youthClimateDay.shortTitle') }}
      </h3>

      <!-- Date et lieu -->
      <div class="flex flex-wrap gap-2 mb-3">
        <span class="bg-white/20 text-white px-2 py-1 rounded text-xs font-semibold">
          12 {{ t('youthClimateDay.november') }} 2025
        </span>
        <span class="bg-white/20 text-white px-2 py-1 rounded text-xs font-semibold">
          {{ t('youthClimateDay.belém') }}
        </span>
      </div>

      <!-- Description -->
      <p class="text-white/90 text-xs mb-3 line-clamp-2">
        {{ t('youthClimateDay.subtitle') }}
      </p>

      <!-- Programme -->
      <div class="bg-black/20 rounded-lg p-3 mb-3">
        <h4 class="text-white font-bold text-xs uppercase tracking-wide mb-2">
          {{ t('activities.program') || 'Programme' }}
        </h4>
        <div class="space-y-1.5">
          <div class="flex items-start gap-2 text-xs text-white/95">
            <span class="font-bold text-orange-300 flex-shrink-0 min-w-[70px]">9h00-10h10</span>
            <span class="line-clamp-1">{{ t('youthClimateDay.part1.title') }}</span>
          </div>
          <div class="flex items-start gap-2 text-xs text-white/95">
            <span class="font-bold text-green-300 flex-shrink-0 min-w-[70px]">10h10-11h20</span>
            <span class="line-clamp-1">{{ t('youthClimateDay.part2.title') }}</span>
          </div>
          <div class="flex items-start gap-2 text-xs text-white/95">
            <span class="font-bold text-blue-300 flex-shrink-0 min-w-[70px]">11h20-16h00</span>
            <span class="line-clamp-1">{{ t('youthClimateDay.part3.title') }}</span>
          </div>
          <div class="flex items-start gap-2 text-xs text-white/95">
            <span class="font-bold text-purple-300 flex-shrink-0 min-w-[70px]">16h00-17h45</span>
            <span class="line-clamp-1">{{ t('youthClimateDay.part4.title') }}</span>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="space-y-2">
        <!-- Bouton Voir le direct (si en direct) -->
        <button
          v-if="isLive"
          @click="goToYouthDay"
          class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
          </svg>
          <span class="text-sm">{{ t('activities.watchLive') || 'Voir le direct' }}</span>
        </button>

        <!-- Bouton Voir le programme complet -->
        <button
          @click="goToYouthDay"
          class="w-full bg-green-500/80 hover:bg-green-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-sm">{{ t('programmations.viewProgram') || 'Voir le programme' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

export default {
  name: 'YouthClimateDayWidget',
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const currentTime = ref(new Date())
    let intervalId = null

    // Mettre à jour l'heure toutes les minutes
    onMounted(() => {
      intervalId = setInterval(() => {
        currentTime.value = new Date()
      }, 60000) // Mise à jour toutes les 60 secondes
    })

    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    })

    // Vérifier si c'est le 12 novembre 2025
    const shouldDisplay = computed(() => {
      const now = currentTime.value
      const year = now.getFullYear()
      const month = now.getMonth() // 0-indexed (10 = novembre)
      const day = now.getDate()

      // Afficher uniquement le 12 novembre 2025
      return year === 2025 && month === 10 && day === 12
    })

    // Vérifier si le direct est en cours
    // 9h00-17h45 heure de Belém (GMT-3) = 12h00-20h45 UTC
    const isLive = computed(() => {
      if (!shouldDisplay.value) return false

      const now = currentTime.value
      const startTime = new Date('2025-11-12T12:00:00Z') // 9h00 Belém
      const endTime = new Date('2025-11-12T20:45:00Z')   // 17h45 Belém

      return now >= startTime && now <= endTime
    })

    // Rediriger vers la page de la Journée Jeunesse
    const goToYouthDay = () => {
      router.push('/programmations/2025/journee-jeunesse')
    }

    return {
      t,
      shouldDisplay,
      isLive,
      goToYouthDay
    }
  }
}
</script>
