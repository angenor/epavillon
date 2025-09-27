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
              <router-link to="/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline">
                {{ $t('common.home') }}
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <router-link to="/nego">
                  <span class="ml-1 text-gray-500 dark:text-gray-400 hover:underline">{{ $t('nav.negotiations') }}</span>
                </router-link>
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

    <!-- Admin Panel -->
    <div v-if="isSuperAdmin" class="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h3 class="text-sm font-medium text-orange-800 dark:text-orange-200">
              {{ $t('admin.panel') }}
            </h3>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="showCreateSession = true"
              class="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <font-awesome-icon icon="plus" class="mr-1" />
              {{ $t('admin.createSession') }}
            </button>
            <button
              @click="showCreateDocument = true"
              class="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors cursor-pointer"
            >
              <font-awesome-icon icon="plus" class="mr-1" />
              {{ $t('admin.createDocument') }}
            </button>
            <button
              @click="showCreateMeeting = true"
              class="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
            >
              <font-awesome-icon icon="plus" class="mr-1" />
              {{ $t('admin.createMeeting') }}
            </button>
            <button
              @click="showCreateTraining = true"
              class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <font-awesome-icon icon="plus" class="mr-1" />
              {{ $t('admin.createTraining') }}
            </button>
          </div>
        </div>
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
          <EventsAndTrainingsSection :category="currentCategory" type="francophonie_meetings" />
        </div>

        <!-- Formations -->
        <div v-if="activeSection === 'trainings'">
          <EventsAndTrainingsSection :category="currentCategory" type="trainings" />
        </div>
      </div>
    </div>

    <!-- Create Session Modal -->
    <CreateSessionModal
      v-if="showCreateSession"
      :category="currentCategory"
      @close="showCreateSession = false"
      @created="onSessionCreated"
    />

    <!-- Create Document Modal -->
    <CreateDocumentModal
      v-if="showCreateDocument"
      :category="currentCategory"
      @close="showCreateDocument = false"
      @created="onDocumentCreated"
    />

    <!-- Create Meeting Modal -->
    <CreateMeetingModal
      v-if="showCreateMeeting"
      :category="currentCategory"
      @close="showCreateMeeting = false"
      @created="onMeetingCreated"
    />

    <!-- Create Training Modal -->
    <CreateTrainingModal
      v-if="showCreateTraining"
      :category="currentCategory"
      @close="showCreateTraining = false"
      @created="onTrainingCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SessionSection from '@/components/negotiations/SessionSection.vue'
import DocumentsSection from '@/components/negotiations/DocumentsSection.vue'
import EventsAndTrainingsSection from '@/components/negotiations/EventsAndTrainingsSection.vue'
import CreateSessionModal from '@/components/negotiations/modals/CreateSessionModal.vue'
import CreateDocumentModal from '@/components/negotiations/modals/CreateDocumentModal.vue'
import CreateMeetingModal from '@/components/negotiations/modals/CreateMeetingModal.vue'
import CreateTrainingModal from '@/components/negotiations/modals/CreateTrainingModal.vue'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()

// Auth
const { isSuperAdmin } = authStore

// Section active (négociations par défaut)
const activeSection = ref('negotiations')

// Modal states
const showCreateSession = ref(false)
const showCreateDocument = ref(false)
const showCreateMeeting = ref(false)
const showCreateTraining = ref(false)

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
  },
  {
    value: 'trainings',
    label: 'Formations',
    icon: ['fas', 'graduation-cap'] // Icône de formation
  }
]

// Toutes les catégories disponibles
const allCategories = [
  { value: 'climat', label: 'Climat' },
  { value: 'biodiversite', label: 'Biodiversité' },
  { value: 'desertification', label: 'Désertification' },
]

const currentCategory = computed(() => {
  const category = route.params.category
  return ['climat', 'biodiversite', 'desertification', 'climate_finance'].includes(category) ? category : 'climat'
})

// Fonction pour obtenir le label de la catégorie
const getCategoryLabel = (category) => {
  const labels = {
    'climat': 'Climat',
    'biodiversite': 'Biodiversité',
    'desertification': 'Désertification',
    'climate_finance': 'Finance Climat'
  }
  return labels[category] || 'Climat'
}

// Event handlers for created items
const onSessionCreated = (session) => {
  showCreateSession.value = false
  // Optionally refresh the session section or show success message
  console.log('Session created:', session)
}

const onDocumentCreated = (document) => {
  showCreateDocument.value = false
  // Optionally refresh the documents section or show success message
  console.log('Document created:', document)
}

const onMeetingCreated = (meeting) => {
  showCreateMeeting.value = false
  // Optionally refresh the meetings section or show success message
  console.log('Meeting created:', meeting)
}

const onTrainingCreated = (training) => {
  showCreateTraining.value = false
  // Optionally refresh the trainings section or show success message
  console.log('Training created:', training)
}

onMounted(() => {
  // Set document title
  document.title = `${t('nav.negotiations')} - ${getCategoryLabel(currentCategory.value)} | ePavilion`
})
</script>
