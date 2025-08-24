<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-blue-600 via-green-600 to-teal-600 text-white">
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            {{ $t('nav.negotiations') }}  {{ getCategoryLabel(currentCategory) }}
          </h1>
          <p class="text-xl opacity-90 mb-8">
            {{ $t('negotiations.subtitle') }}
          </p>
          <div class="flex flex-col items-center justify-center space-y-4">
            <span class="px-3 py-1 bg-white/20 rounded-full text-sm">
              {{ $t('negotiations.accessLevel.negotiatorsOnly') }}
            </span>
            
            <!-- Liens vers les autres catégories -->
            <div class="flex items-center justify-center space-x-4 mt-4">
              <router-link
                v-for="cat in allCategories"
                :key="cat.value"
                :to="`/nego/${cat.value}`"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                :class="currentCategory === cat.value 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'"
              >
                {{ cat.label }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link to="/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                {{ $t('common.home') }}
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="ml-1 text-gray-500 dark:text-gray-400">{{ $t('nav.negotiations') }}</span>
              </div>
            </li>
            <li v-if="currentCategory">
              <div class="flex items-center">
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="ml-1 text-gray-500 dark:text-gray-400">{{ $t(`nav.${currentCategory}`) }}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Section Tabs Navigation -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div class="container mx-auto px-4">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            v-for="section in sections"
            :key="section.value"
            @click="activeSection = section.value"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            :class="activeSection === section.value
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'"
          >
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="section.icon" class="w-5 h-5" />
              <span>{{ section.label }}</span>
            </div>
          </button>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="space-y-8">
        <!-- Sessions de négociation -->
        <div v-if="activeSection === 'negotiations'">
          <SessionSection :category="currentCategory" />
        </div>

        <!-- Documents d'aide à la négociation -->
        <div v-if="activeSection === 'documents'">
          <DocumentsSection :category="currentCategory" />
        </div>

        <!-- Réunions de la Francophonie -->
        <div v-if="activeSection === 'meetings'">
          <FrancophonieMeetingsSection :category="currentCategory" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SessionSection from '@/components/negotiations/SessionSection.vue'
import DocumentsSection from '@/components/negotiations/DocumentsSection.vue'
import FrancophonieMeetingsSection from '@/components/negotiations/FrancophonieMeetingsSection.vue'

const { t } = useI18n()
const route = useRoute()

// Section active (négociations par défaut)
const activeSection = ref('negotiations')

// Définition des sections avec leurs icônes
const sections = [
  {
    value: 'negotiations',
    label: 'Sessions de négociation',
    icon: ['fas', 'handshake'] // Icône de négociation
  },
  {
    value: 'documents',
    label: 'Documents d\'aide',
    icon: ['fas', 'file-alt'] // Icône de document
  },
  {
    value: 'meetings',
    label: 'Réunions Francophonie',
    icon: ['fas', 'users'] // Icône de réunion
  }
]

// Toutes les catégories disponibles
const allCategories = [
  { value: 'climat', label: 'Climat' },
  { value: 'biodiversite', label: 'Biodiversité' },
  { value: 'desertification', label: 'Désertification' }
]

const currentCategory = computed(() => {
  const category = route.params.category
  return ['climat', 'biodiversite', 'desertification'].includes(category) ? category : 'climat'
})

// Fonction pour obtenir le label de la catégorie
const getCategoryLabel = (category) => {
  const labels = {
    'climat': 'Climat',
    'biodiversite': 'Biodiversité',
    'desertification': 'Désertification'
  }
  return labels[category] || 'Climat'
}

onMounted(() => {
  // Set document title
  document.title = `${t('nav.negotiations')} - ${getCategoryLabel(currentCategory.value)} | ePavilion`
})
</script>
