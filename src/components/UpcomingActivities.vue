<template>
  <div class="h-full bg-opacity-50 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl flex flex-col">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white font-maverick">
        {{ t('activities.title') }}
      </h2>
    </div>

    <!-- Activités -->
    <div class="flex-1 overflow-y-auto">
      <!-- Section Événements -->
      <div class="p-6 space-y-4">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {{ t('activities.events') }}
        </h3>
        
        <!-- Événement principal -->
        <div class="bg-ifdd-bleu/10 dark:bg-ifdd-bleu/20 rounded-lg p-4 border-l-4 border-ifdd-bleu transform hover:scale-105 transition-transform cursor-pointer">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 dark:text-white">
                Conférence Innovation 2024
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Découvrez les dernières tendances technologiques
              </p>
              <div class="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>15 Jan 2024</span>
              </div>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ifdd-bleu text-white">
              {{ t('activities.upcoming') }}
            </span>
          </div>
        </div>

        <!-- Autres événements -->
        <div class="space-y-3">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <h4 class="font-medium text-gray-900 dark:text-white text-sm">
              Atelier Développement Durable
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              20 Jan 2024 • 14h00
            </p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <h4 class="font-medium text-gray-900 dark:text-white text-sm">
              Forum Entrepreneuriat
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              25 Jan 2024 • 09h00
            </p>
          </div>
        </div>
      </div>

      <!-- Section Formations -->
      <div class="p-6 pt-2 space-y-4">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {{ t('activities.trainings') }}
        </h3>
        
        <div class="bg-gradient-to-r from-ifdd-vert/10 to-ifdd-bleu/10 dark:from-ifdd-vert/20 dark:to-ifdd-bleu/20 rounded-lg p-4 border border-ifdd-vert/20">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white">
                Formation Leadership Digital
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Programme intensif • 3 mois
              </p>
              <div class="flex items-center mt-2 gap-4">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  Début: 1 Fév 2024
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                  Places disponibles
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-6 border-t border-gray-200 dark:border-gray-700">
      <button class="w-full px-4 py-2 bg-ifdd-bleu hover:bg-ifdd-bleu-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center group">
        <span>{{ t('activities.viewAll') }}</span>
        <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  name: 'UpcomingActivities',
  setup() {
    const { t } = useI18n()
    return { t }
  }
}
</script>