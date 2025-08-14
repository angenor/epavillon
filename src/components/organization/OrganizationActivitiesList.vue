<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse"
      >
        <div class="flex space-x-4">
          <div class="bg-gray-200 dark:bg-gray-700 rounded-lg w-24 h-16 flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="activities.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ $t('organizationDetail.activities.empty.title') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('organizationDetail.activities.empty.description') }}
      </p>
    </div>

    <!-- Activities list -->
    <div v-else class="space-y-6">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
      >
        <div class="flex space-x-6">
          <!-- Activity image -->
          <div class="flex-shrink-0">
            <img
              v-if="activity.cover_image_low_url || activity.cover_image_high_url"
              :src="activity.cover_image_low_url || activity.cover_image_high_url"
              :alt="activity.title"
              class="h-20 w-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
            <div
              v-else
              class="h-20 w-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
            >
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
          </div>

          <!-- Activity details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <router-link
                  :to="`/activities/${activity.id}`"
                  class="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {{ activity.title }}
                </router-link>

                <!-- Event info -->
                <div class="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 6v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                  </svg>
                  <span>{{ activity.events?.title }} {{ activity.events?.year }}</span>
                </div>

                <!-- Dates -->
                <div class="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>
                    {{ formatDate(activity.final_start_date || activity.proposed_start_date) }}
                    <span v-if="activity.final_end_date || activity.proposed_end_date">
                      - {{ formatDate(activity.final_end_date || activity.proposed_end_date) }}
                    </span>
                  </span>
                </div>

                <!-- Activity type and format -->
                <div class="mt-2 flex items-center space-x-4">
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <ActivityTypeIcon :type="activity.activity_type" class="h-4 w-4 mr-2" />
                    <span>{{ getActivityTypeLabel(activity.activity_type) }}</span>
                  </div>
                  
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <ActivityFormatIcon :format="activity.format" class="h-4 w-4 mr-2" />
                    <span>{{ getActivityFormatLabel(activity.format) }}</span>
                  </div>
                </div>

                <!-- Themes -->
                <div v-if="activity.main_themes && activity.main_themes.length > 0" class="mt-3">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="theme in activity.main_themes.slice(0, 3)"
                      :key="theme"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {{ getThemeLabel(theme) }}
                    </span>
                    <span
                      v-if="activity.main_themes.length > 3"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      +{{ activity.main_themes.length - 3 }}
                    </span>
                  </div>
                </div>

                <!-- Objectives preview -->
                <div v-if="activity.objectives" class="mt-3">
                  <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {{ activity.objectives }}
                  </p>
                </div>
              </div>

              <!-- Status badge -->
              <div class="flex-shrink-0 ml-4">
                <span :class="getActivityStatusColor(activity)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                  {{ getActivityStatusLabel(activity) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="$emit('prev-page')"
            :disabled="!hasPrevPage"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('common.previous') }}
          </button>
          <button
            @click="$emit('next-page')"
            :disabled="!hasNextPage"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('common.next') }}
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              {{ $t('organizationDetail.activities.pagination.showing', {
                start: (currentPage - 1) * 10 + 1,
                end: Math.min(currentPage * 10, activities.length),
                total: activities.length
              }) }}
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="$emit('prev-page')"
                :disabled="!hasPrevPage"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              <button
                v-for="page in visiblePages"
                :key="page"
                @click="$emit('go-to-page', page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                {{ page }}
              </button>

              <button
                @click="$emit('next-page')"
                :disabled="!hasNextPage"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ActivityTypeIcon from '@/components/activity/ActivityTypeIcon.vue'
import ActivityFormatIcon from '@/components/activity/ActivityFormatIcon.vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  },
  hasNextPage: {
    type: Boolean,
    default: false
  },
  hasPrevPage: {
    type: Boolean,
    default: false
  }
})

defineEmits(['go-to-page', 'next-page', 'prev-page'])

const visiblePages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (
    let i = Math.max(2, props.currentPage - delta);
    i <= Math.min(props.totalPages - 1, props.currentPage + delta);
    i++
  ) {
    range.push(i)
  }

  if (props.currentPage - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (props.currentPage + delta < props.totalPages - 1) {
    rangeWithDots.push('...', props.totalPages)
  } else {
    rangeWithDots.push(props.totalPages)
  }

  return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index)
})

// Labels mapping
const activityTypeLabels = {
  'side_event': 'Événement parallèle',
  'country_day': 'Journée pays',
  'other': 'Autre'
}

const activityFormatLabels = {
  'online': 'En ligne',
  'in_person': 'En présentiel',
  'hybrid': 'Hybride'
}

const themeLabels = {
  'mitigation': 'Atténuation',
  'adaptation': 'Adaptation',
  'climate_resilience': 'Résilience climatique',
  'loss_and_damage': 'Pertes et dommages',
  'clean_tech_innovations': 'Innovations technologiques propres',
  'renewable_energy_land': 'Énergies renouvelables terrestres',
  'health_solidarity': 'Santé et solidarité',
  'industry_transition': 'Transition industrielle',
  'transport_urbanization': 'Transport et urbanisation',
  'nature_oceans': 'Nature et océans',
  'agriculture_food': 'Agriculture et alimentation',
  'sustainable_livestock': 'Élevage durable',
  'gender': 'Genre',
  'youth': 'Jeunesse',
  'technology': 'Technologie',
  'finance': 'Finance',
  'other': 'Autre'
}

function getActivityTypeLabel(type) {
  return activityTypeLabels[type] || type
}

function getActivityFormatLabel(format) {
  return activityFormatLabels[format] || format
}

function getThemeLabel(theme) {
  return themeLabels[theme] || theme
}

function getActivityStatusLabel(activity) {
  if (activity.activity_status) {
    return activity.activity_status
  }
  return activity.validation_status
}

function getActivityStatusColor(activity) {
  const status = getActivityStatusLabel(activity)
  const colorMap = {
    'live': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'approved': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'under_review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>