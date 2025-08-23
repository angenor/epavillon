<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header avec image de bannière -->
    <div class="relative h-64 md:h-80 lg:h-96 overflow-hidden">
      <img
        src="/images/example/event_banniere_par_defaut_32_9.jpg"
        alt="Négociation bannière"
        class="w-full h-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

      <!-- Contenu du header -->
      <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-3xl md:text-5xl font-bold text-white mb-6">
            {{ t('nego.title') }}
          </h1>
          <p class="text-lg md:text-xl text-white/90 max-w-3xl">
            {{ t('nego.description') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Grille des catégories -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="category in categories"
          :key="category.id"
          @click="goToCategory(category.id)"
          class="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <!-- Image de la catégorie -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="category.image"
              :alt="category.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            <!-- Icône de la catégorie -->
            <div class="absolute top-4 right-4">
              <div class="bg-white/90 dark:bg-gray-900/90 p-3 rounded-full">
                <i :class="category.icon" class="text-2xl text-orange-600"></i>
              </div>
            </div>

            <!-- Titre overlay -->
            <div class="absolute bottom-4 left-4 right-4">
              <h3 class="text-xl font-bold text-white mb-2">
                {{ t(`nego.categories.${category.id}.name`) }}
              </h3>
            </div>
          </div>

          <!-- Contenu -->
          <div class="p-6">
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
              {{ t(`nego.categories.${category.id}.description`) }}
            </p>

            <!-- Statistiques -->
            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                {{ category.itemCount }} {{ t('nego.elements') }}
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ t('nego.lastUpdate') }}
              </div>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in category.tags"
                :key="tag"
                class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded-full"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Bouton d'action -->
            <button
              @click.stop="goToCategory(category.id)"
              class="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {{ t('nego.explore') }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Section d'information supplémentaire -->
      <div class="mt-16 bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 rounded-2xl p-8">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('nego.info.title') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
            {{ t('nego.info.description') }}
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div class="text-center">
              <div class="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-leaf text-2xl text-green-600"></i>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">{{ t('nego.info.collaborative') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('nego.info.collaborativeDesc') }}</p>
            </div>
            <div class="text-center">
              <div class="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-globe text-2xl text-blue-600"></i>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">{{ t('nego.info.global') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('nego.info.globalDesc') }}</p>
            </div>
            <div class="text-center">
              <div class="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-lightbulb text-2xl text-yellow-600"></i>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">{{ t('nego.info.innovative') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('nego.info.innovativeDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

// Données des catégories
const categories = ref([
  {
    id: 'climat',
    name: 'Climat',
    image: '/images/nego/climat.jpg',
    icon: 'fas fa-thermometer-half',
    itemCount: 12,
    tags: ['COP', 'Adaptation', 'Mitigation']
  },
  {
    id: 'biodiversite',
    name: 'Biodiversité',
    image: '/images/nego/biodiversite.jpg',
    icon: 'fas fa-seedling',
    itemCount: 8,
    tags: ['CBD', 'Conservation', 'Écosystèmes']
  },
  {
    id: 'desertification',
    name: 'Désertification',
    image: '/images/nego/desertification.jpg',
    icon: 'fas fa-mountain',
    itemCount: 6,
    tags: ['UNCCD', 'Dégradation', 'Restauration']
  }
])

// Méthodes
const goToCategory = (categoryId) => {
  router.push(`/nego/${categoryId}`)
}

onMounted(() => {
  // Initialiser les données si nécessaire
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}
</style>
