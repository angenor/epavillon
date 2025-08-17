<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-blue-600 via-green-600 to-teal-600 text-white">
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            {{ $t('nav.negotiations') }}
          </h1>
          <p class="text-xl opacity-90 mb-8">
            {{ $t('negotiations.subtitle') }}
          </p>
          <div class="flex items-center justify-center space-x-4 text-sm">
            <span class="px-3 py-1 bg-white/20 rounded-full">
              {{ $t('negotiations.accessLevel.negotiatorsOnly') }}
            </span>
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

    <!-- Category Tabs Navigation -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div class="container mx-auto px-4">
        <nav class="flex space-x-8" aria-label="Tabs">
          <router-link
            v-for="category in categories"
            :key="category.value"
            :to="`/nego/${category.value}`"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            :class="currentCategory === category.value
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'"
          >
            <div class="flex items-center space-x-2">
              <component :is="category.icon" class="w-5 h-5" />
              <span>{{ $t(`nav.${category.value}`) }}</span>
            </div>
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="space-y-8">
        <!-- Sessions Section -->
        <SessionSection :category="currentCategory" />
        
        <!-- Documents Section -->
        <DocumentsSection :category="currentCategory" />
        
        <!-- Francophonie Meetings -->
        <FrancophonieMeetingsSection :category="currentCategory" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SessionSection from '@/components/negotiations/SessionSection.vue'
import DocumentsSection from '@/components/negotiations/DocumentsSection.vue'
import FrancophonieMeetingsSection from '@/components/negotiations/FrancophonieMeetingsSection.vue'
import ClimateIcon from '@/components/icons/ClimateIcon.vue'
import BiodiversityIcon from '@/components/icons/BiodiversityIcon.vue'
import DesertificationIcon from '@/components/icons/DesertificationIcon.vue'

const { t } = useI18n()
const route = useRoute()

const categories = [
  {
    value: 'climat',
    icon: ClimateIcon
  },
  {
    value: 'biodiversite',
    icon: BiodiversityIcon
  },
  {
    value: 'desertification',
    icon: DesertificationIcon
  }
]

const currentCategory = computed(() => {
  const category = route.params.category
  return ['climat', 'biodiversite', 'desertification'].includes(category) ? category : 'climat'
})

onMounted(() => {
  // Set document title
  document.title = `${t('nav.negotiations')} - ${t('nav.' + currentCategory.value)} | ePavilion`
})
</script>