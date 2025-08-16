<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
    <div class="p-6">
      <div class="flex items-start space-x-6">
        <!-- Image thumbnail -->
        <div class="flex-shrink-0 w-24 h-16">
          <img
            v-if="formation.banner_thumbnail_url || formation.banner_hd_url"
            :src="formation.banner_thumbnail_url || formation.banner_hd_url"
            :alt="formation.title"
            class="w-full h-full object-cover rounded-md"
          >
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-blue-500 to-green-500 rounded-md flex items-center justify-center"
          >
            <svg class="w-6 h-6 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>

        <!-- Contenu principal -->
        <div class="flex-1 min-w-0">
          <!-- En-tête avec titre et badges -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <!-- Badge catégorie -->
                <span
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    categoryBadgeClass
                  ]"
                >
                  {{ t(`formations.categories.${formation.category}`) }}
                </span>
                
                <!-- Badge format -->
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  <svg v-if="formation.format === 'online'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"/>
                  </svg>
                  {{ t(`formations.formats.${formation.format}`) }}
                </span>

                <!-- Badge de statut -->
                <span
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    statusBadgeClass
                  ]"
                >
                  {{ statusLabel }}
                </span>

                <!-- Badge d'inscription -->
                <span v-if="userEnrolled" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ t('formations.enrolled') }}
                </span>
              </div>

              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ formation.title }}
              </h3>
            </div>

            <!-- Prix -->
            <div class="text-right ml-4">
              <div v-if="formation.estimated_price" class="text-xl font-bold text-green-600 dark:text-green-400">
                {{ formatPrice(formation.estimated_price) }}
              </div>
              <div v-else class="text-lg font-medium text-green-600 dark:text-green-400">
                {{ t('formations.free') }}
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-4">
            <p class="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {{ truncateText(stripHtml(formation.description), 200) }}
            </p>
          </div>

          <!-- Objectifs principaux -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {{ t('formations.objectives') }}:
            </h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li v-for="(objective, index) in formation.objectives.slice(0, 3)" :key="index" class="flex items-start">
                <svg class="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                {{ objective }}
              </li>
              <li v-if="formation.objectives.length > 3" class="text-xs text-gray-500 dark:text-gray-400 italic">
                {{ t('formations.andMore', { count: formation.objectives.length - 3 }) }}
              </li>
            </ul>
          </div>

          <!-- Méthodologie -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {{ t('formations.methodology') }}:
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ truncateText(formation.methodology, 150) }}
            </p>
          </div>

          <!-- Informations détaillées -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <!-- Dates -->
            <div>
              <span class="text-gray-500 dark:text-gray-400">{{ t('formations.dates') }}:</span>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ formatDateRange(formation.start_date, formation.end_date) }}
              </div>
            </div>

            <!-- Participants -->
            <div>
              <span class="text-gray-500 dark:text-gray-400">{{ t('formations.participants') }}:</span>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ formation.participants_count || 0 }}
              </div>
            </div>

            <!-- Durée -->
            <div>
              <span class="text-gray-500 dark:text-gray-400">{{ t('formations.duration') }}:</span>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ calculateDuration(formation.start_date, formation.end_date) }}
              </div>
            </div>

            <!-- Public cible -->
            <div>
              <span class="text-gray-500 dark:text-gray-400">{{ t('formations.targetAudience') }}:</span>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ truncateText(formation.target_audience, 30) }}
              </div>
            </div>
          </div>

          <!-- Progression (si inscrit) -->
          <div v-if="userProgress" class="mb-4">
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-600 dark:text-gray-400">{{ t('formations.progress') }}</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ userProgress.percentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${userProgress.percentage}%` }"
              ></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                {{ t('formations.chapters', { count: formation.chapters_count || 0 }) }}
              </div>
              
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {{ t('formations.createdBy') }} {{ getCreatorName(formation.created_by_profile) }}
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <router-link
                :to="`/formations/${formation.id}`"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                {{ t('formations.viewDetails') }}
              </router-link>

              <!-- Bouton d'inscription/continuation -->
              <button
                v-if="!userEnrolled"
                @click="$emit('enroll', formation.id)"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                {{ t('formations.enroll') }}
              </button>
              <router-link
                v-else
                :to="`/formations/${formation.id}/continue`"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                {{ t('formations.continue') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  formation: {
    type: Object,
    required: true
  },
  userEnrolled: {
    type: Boolean,
    default: false
  },
  userProgress: {
    type: Object,
    default: null
  }
})

defineEmits(['enroll'])

// Statut de la formation
const formationStatus = computed(() => {
  const now = new Date()
  const startDate = new Date(props.formation.start_date)
  const endDate = new Date(props.formation.end_date)

  if (startDate > now) return 'upcoming'
  if (startDate <= now && endDate >= now) return 'ongoing'
  return 'completed'
})

// Classe du badge de statut
const statusBadgeClass = computed(() => {
  switch (formationStatus.value) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'ongoing':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
})

// Label du statut
const statusLabel = computed(() => {
  return t(`formations.status.${formationStatus.value}`)
})

// Classe du badge de catégorie
const categoryBadgeClass = computed(() => {
  switch (props.formation.category) {
    case 'climate':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'biodiversity':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'desertification':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'other':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
})

// Utilitaires
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
  
  return `${formatter.format(start)} - ${formatter.format(end)}`
}

const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return t('formations.duration.oneDay')
  if (diffDays < 7) return t('formations.duration.days', { count: diffDays })
  if (diffDays < 30) return t('formations.duration.weeks', { count: Math.ceil(diffDays / 7) })
  return t('formations.duration.months', { count: Math.ceil(diffDays / 30) })
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const stripHtml = (html) => {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

const getCreatorName = (profile) => {
  if (!profile) return t('formations.unknownCreator')
  return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || t('formations.unknownCreator')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>