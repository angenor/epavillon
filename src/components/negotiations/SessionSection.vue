<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ $t('negotiations.sessions.title') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        {{ $t('negotiations.sessions.subtitle') }}
      </p>
      
      <!-- Filter Tabs -->
      <div class="mt-4 flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          v-for="filter in sessionFilters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
          :class="activeFilter === filter.value
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
        >
          {{ $t(filter.label) }}
        </button>
      </div>
    </div>

    <div class="p-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Sessions List -->
      <div v-else-if="filteredSessions.length > 0" class="space-y-4">
        <!-- IFDD Sessions -->
        <div v-if="ifddSessions.length > 0">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ $t('negotiations.sessions.ifddOrganized') }}
          </h3>
          <div class="space-y-4">
            <SessionCard
              v-for="session in ifddSessions"
              :key="session.id"
              :session="session"
              :is-ifdd="true"
              @register="handleRegister"
              @unregister="handleUnregister"
            />
          </div>
        </div>

        <!-- External Sessions -->
        <div v-if="externalSessions.length > 0">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 mt-8">
            {{ $t('negotiations.sessions.external') }}
          </h3>
          <div class="space-y-4">
            <SessionCard
              v-for="session in externalSessions"
              :key="session.id"
              :session="session"
              :is-ifdd="false"
              @register="handleRegister"
              @unregister="handleUnregister"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ $t('negotiations.sessions.noSessions') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('negotiations.sessions.noSessionsDesc') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SessionCard from './SessionCard.vue'
import { useNegotiationSessions } from '@/composables/useNegotiationSessions'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  category: {
    type: String,
    required: true,
    validator: (value) => ['climat', 'biodiversite', 'desertification'].includes(value)
  }
})

const { t } = useI18n()
const { showToast } = useToast()
const { sessions, loading, fetchSessions, registerToSession, unregisterFromSession } = useNegotiationSessions()

const activeFilter = ref('all')

const sessionFilters = [
  { value: 'all', label: 'negotiations.sessions.filters.all' },
  { value: 'upcoming', label: 'negotiations.sessions.filters.upcoming' },
  { value: 'ongoing', label: 'negotiations.sessions.filters.ongoing' },
  { value: 'past', label: 'negotiations.sessions.filters.past' }
]

// Map category to database enum
const categoryMap = {
  'climat': 'climate',
  'biodiversite': 'biodiversity',
  'desertification': 'desertification'
}

const filteredSessions = computed(() => {
  let filtered = sessions.value.filter(session => 
    session.category === categoryMap[props.category]
  )

  if (activeFilter.value !== 'all') {
    const now = new Date()
    filtered = filtered.filter(session => {
      const startDate = new Date(session.start_datetime)
      const endDate = new Date(session.end_datetime)
      
      switch (activeFilter.value) {
        case 'upcoming':
          return startDate > now
        case 'ongoing':
          return startDate <= now && endDate >= now
        case 'past':
          return endDate < now
        default:
          return true
      }
    })
  }

  // Sort by start date
  return filtered.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
})

const ifddSessions = computed(() => 
  filteredSessions.value.filter(session => session.is_ifdd_organized)
)

const externalSessions = computed(() => 
  filteredSessions.value.filter(session => !session.is_ifdd_organized)
)

const handleRegister = async (sessionId) => {
  try {
    await registerToSession(sessionId)
    showToast(t('negotiations.sessions.registerSuccess'), 'success')
  } catch (error) {
    showToast(t('negotiations.sessions.registerError'), 'error')
  }
}

const handleUnregister = async (sessionId) => {
  try {
    await unregisterFromSession(sessionId)
    showToast(t('negotiations.sessions.unregisterSuccess'), 'success')
  } catch (error) {
    showToast(t('negotiations.sessions.unregisterError'), 'error')
  }
}

// Watch for category changes
watch(() => props.category, () => {
  fetchSessions()
}, { immediate: true })

onMounted(() => {
  fetchSessions()
})
</script>