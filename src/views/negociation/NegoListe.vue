<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header avec titre -->
    <div class="relative bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl md:text-5xl font-bold text-white text-center">
          {{ t('negotiations.title') }}
        </h1>
        <p class="text-xl text-orange-100 text-center mt-4 max-w-3xl mx-auto">
          {{ t('negotiations.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Widgets des catégories -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <!-- Widget Climat -->
        <router-link
          :to="{ name: 'negotiations', params: { category: 'climat' } }"
          class="group relative h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
        >
          <img
            src="/images/nego-bg/climat.jpg"
            alt="Climat"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          >
          <div class="absolute inset-0 bg-blue-900/40 group-hover:bg-blue-900/60 transition-all duration-300"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center transform group-hover:scale-110 transition-transform duration-300">
              <h2 class="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-2xl">
                {{ t('negotiations.categories.climat') }}
              </h2>
              <div class="w-16 h-1 bg-white mx-auto rounded-full opacity-80"></div>
            </div>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </router-link>

        <!-- Widget Biodiversité -->
        <router-link
          :to="{ name: 'negotiations', params: { category: 'biodiversite' } }"
          class="group relative h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
        >
          <img
            src="/images/nego-bg/biodiversite.jpeg"
            alt="Biodiversité"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          >
          <div class="absolute inset-0 bg-green-800/40 group-hover:bg-green-800/60 transition-all duration-300"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center transform group-hover:scale-110 transition-transform duration-300">
              <h2 class="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-2xl">
                {{ t('negotiations.categories.biodiversite') }}
              </h2>
              <div class="w-16 h-1 bg-white mx-auto rounded-full opacity-80"></div>
            </div>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </router-link>

        <!-- Widget Désertification -->
        <router-link
          :to="{ name: 'negotiations', params: { category: 'desertification' } }"
          class="group relative h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 md:col-span-2 lg:col-span-1"
        >
          <img
            src="/images/nego-bg/desertification.jpeg"
            alt="Désertification"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          >
          <div class="absolute inset-0 bg-orange-900/40 group-hover:bg-orange-900/60 transition-all duration-300"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center transform group-hover:scale-110 transition-transform duration-300">
              <h2 class="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-2xl">
                {{ t('negotiations.categories.desertification') }}
              </h2>
              <div class="w-16 h-1 bg-white mx-auto rounded-full opacity-80"></div>
            </div>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </router-link>

      </div>
    </div>

    <!-- Section description optionnelle -->
    <div class="bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('negotiations.aboutTitle') }}
          </h3>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {{ t('negotiations.aboutDescription') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}
</style>
