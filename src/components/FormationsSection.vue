<template>
  <section class="py-20 bg-white dark:bg-gray-800 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Contenu -->
        <div>
          <h2 class="text-4xl font-bold text-ifdd-gris-dark dark:text-gray-100 mb-4 font-maverick">
            {{ t('trainings.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {{ t('trainings.subtitle') }}
          </p>

          <!-- Liste des formations -->
          <div class="space-y-6 mb-8">
            <!-- Formation en cours -->
            <div class="bg-gradient-to-r from-ifdd-bleu/10 to-ifdd-bleu/20 dark:from-ifdd-bleu/20 dark:to-ifdd-bleu/30 rounded-xl p-6 border border-ifdd-bleu/30 dark:border-ifdd-bleu/50">
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-ifdd-bleu dark:bg-ifdd-bleu-light text-white">
                  {{ t('trainings.status.ongoing') }}
                </span>
                <span class="text-sm text-gray-600 dark:text-gray-400">15 {{ t('common.participants') }}</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {{ t('trainings.climate.title') }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                {{ t('trainings.climate.description') }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    40 {{ t('common.hours') }}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ t('common.certified') }}
                  </span>
                </div>
                <button class="dark:text-gray-100 text-ifdd-bleu hover:text-ifdd-bleu-dark dark:hover:text-ifdd-bleu font-medium transition-colors">
                  {{ t('common.seeMore') }} →
                </button>
              </div>
            </div>

            <!-- Formations à venir -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-ifdd-vert/20 dark:bg-ifdd-vert/30 text-ifdd-vert dark:text-ifdd-vert-light">
                  {{ t('trainings.status.upcoming') }}
                </span>
                <span class="text-sm text-gray-600 dark:text-gray-400">Début: 1er Déc 2024</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {{ t('trainings.finance.title') }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                {{ t('trainings.finance.description') }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    30 {{ t('common.hours') }}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {{ t('common.online') }}
                  </span>
                </div>
                <button class="dark:text-gray-100 text-ifdd-bleu hover:text-ifdd-bleu-dark dark:hover:text-ifdd-bleu font-medium transition-colors">
                  {{ t('common.register') }} →
                </button>
              </div>
            </div>

            <!-- Formation passée -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 opacity-75">
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                  {{ t('trainings.status.completed') }}
                </span>
                <span class="text-sm text-gray-600 dark:text-gray-400">Oct 2024</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {{ t('trainings.biodiversity.title') }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                {{ t('trainings.biodiversity.description') }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    127 {{ t('common.graduates') }}
                  </span>
                </div>
                <button class="text-gray-500 dark:text-gray-400 font-medium">
                  {{ t('common.consult') }} →
                </button>
              </div>
            </div>
          </div>

          <!-- Bouton voir toutes -->
          <button class="w-full sm:w-auto px-6 py-3 bg-ifdd-bleu hover:bg-ifdd-bleu-dark dark:text-gray-100 dark:hover:bg-ifdd-bleu text-ifdd-bleu font-medium font-helvetica rounded-lg transition-colors shadow-lg hover:shadow-xl">
            {{ t('trainings.seeAllTrainings') }}
          </button>
        </div>

        <!-- Image -->
        <div>
          <img 
            src="/images/formation.jpg" 
            alt="Formations" 
            class="rounded-2xl shadow-xl w-full h-auto object-cover"
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  name: 'FormationsSection',
  setup() {
    const { t } = useI18n()
    return { t }
  }
}
</script>