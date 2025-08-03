<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Image -->
        <div class="order-2 lg:order-1">
          <img 
            src="/images/cop.jpg" 
            alt="Événements COP" 
            class="rounded-2xl shadow-xl w-full h-auto object-cover"
          >
        </div>

        <!-- Contenu -->
        <div class="order-1 lg:order-2">
          <h2 class="text-4xl font-bold text-ifdd-gris-dark dark:text-gray-100 mb-4 font-maverick">
            {{ t('events.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {{ t('events.subtitle') }}
          </p>

          <!-- Carousel d'événements -->
          <div class="space-y-4 mb-8">
            <!-- Événement en cours -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border-l-4 border-ifdd-bleu">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-green-600 dark:text-green-500">{{ t('events.status.ongoing') }}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">15-20 Nov 2024</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ t('events.cop29.title') }}</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                {{ t('events.cop29.description') }}
              </p>
              <button class="text-ifdd-bleu dark:text-ifdd-bleu-light hover:text-ifdd-bleu-dark dark:hover:text-ifdd-bleu font-medium flex items-center space-x-2 transition-colors">
                <span class="text-gray-900 dark:text-gray-100">{{ t('common.seeMore') }}</span>
                <svg class="w-4 h-4 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Événements à venir -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 opacity-75 hover:opacity-100 transition-opacity">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">{{ t('events.status.upcoming') }}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">5-10 Déc 2024</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ t('events.cop16bio.title') }}</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                {{ t('events.cop16bio.description') }}
              </p>
              <button class="text-ifdd-bleu dark:text-ifdd-bleu-light hover:text-ifdd-bleu-dark dark:hover:text-ifdd-bleu font-medium flex items-center space-x-2 transition-colors">
                <span class="text-gray-900 dark:text-gray-100">{{ t('common.seeMore') }}</span>
                <svg class="w-4 h-4 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Événements passés -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 opacity-50 hover:opacity-75 transition-opacity">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-red-600 dark:text-red-500">{{ t('events.status.completed') }}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">2-13 Oct 2024</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ t('events.unccd.title') }}</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                {{ t('events.unccd.description') }}
              </p>
              <button class="text-ifdd-bleu dark:text-ifdd-bleu-light hover:text-ifdd-bleu-dark dark:hover:text-ifdd-bleu font-medium flex items-center space-x-2 transition-colors">
                <span class="text-gray-900 dark:text-gray-100">{{ t('common.seeMore') }}</span>
                <svg class="w-4 h-4 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Bouton voir tous -->
          <button class="w-full sm:w-auto px-6 py-3 bg-ifdd-bleu hover:bg-ifdd-bleu-dark dark:bg-ifdd-bleu-light dark:hover:bg-ifdd-bleu text-ifdd-bleu dark:text-white font-medium font-helvetica rounded-lg transition-colors shadow-lg hover:shadow-xl">
            {{ t('events.seeAllEvents') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  name: 'EventsSection',
  setup() {
    const { t } = useI18n()
    return { t }
  }
}
</script>