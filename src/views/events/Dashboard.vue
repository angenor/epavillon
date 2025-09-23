<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ t('events.myActivities') }}
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ t('events.dashboardDescription') }}
            </p>
          </div>

          <!-- Event Selector -->
          <div class="min-w-[250px]">
            <label for="event-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('events.selectEvent') }}
            </label>
            <select
              id="event-select"
              v-model="selectedEventId"
              @change="loadEvents"
              :disabled="eventsLoading"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ifdd-bleu focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{{ t('events.allEvents') }}</option>
              <option
                v-for="event in availableEvents"
                :key="event.id"
                :value="event.id"
              >
                {{ event.title }} ({{ event.year }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('events.stats.total') }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            </div>
            <div class="p-3 bg-ifdd-bleu/10 rounded-lg">
              <font-awesome-icon :icon="['fas', 'calendar-alt']" class="w-6 h-6 text-ifdd-bleu" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('events.stats.upcoming') }}</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.upcoming }}</p>
            </div>
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <font-awesome-icon :icon="['fas', 'clock']" class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('events.stats.draft') }}</p>
              <p class="text-2xl font-bold text-yellow-600">{{ stats.draft }}</p>
            </div>
            <div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <font-awesome-icon :icon="['fas', 'edit']" class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('events.stats.totalRegistrations') }}</p>
              <p class="text-2xl font-bold text-ifdd-bleu">{{ stats.totalRegistrations }}</p>
            </div>
            <div class="p-3 bg-ifdd-bleu/10 rounded-lg">
              <font-awesome-icon :icon="['fas', 'users']" class="w-6 h-6 text-ifdd-bleu" />
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px]">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('common.search')"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ifdd-bleu focus:border-transparent"
            />
          </div>

          <select
            v-model="filterStatus"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ifdd-bleu focus:border-transparent"
          >
            <option value="">{{ t('events.allStatuses') }}</option>
            <option value="draft">{{ t('events.status.draft') }}</option>
            <option value="submitted">{{ t('events.status.submitted') }}</option>
            <option value="under_review">{{ t('events.status.underReview') }}</option>
            <option value="approved">{{ t('events.status.approved') }}</option>
            <option value="rejected">{{ t('events.status.rejected') }}</option>
            <option value="cancelled">{{ t('events.status.cancelled') }}</option>
            <option value="live">{{ t('events.status.live') }}</option>
            <option value="completed">{{ t('events.status.completed') }}</option>
          </select>

          <select
            v-model="filterType"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ifdd-bleu focus:border-transparent"
          >
            <option value="">{{ t('events.allTypes') }}</option>
            <option value="side_event">{{ t('events.types.sideEvent') }}</option>
            <option value="country_day">{{ t('events.types.countryDay') }}</option>
            <option value="other">{{ t('events.types.other') }}</option>
          </select>
        </div>
      </div>

      <!-- Activities List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <!-- Loading State -->
        <div v-if="loading" class="p-8">
          <div class="animate-pulse space-y-4">
            <div v-for="i in 3" :key="i" class="flex space-x-4">
              <div class="h-20 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredEvents.length === 0" class="p-12 text-center">
          <font-awesome-icon :icon="['fas', 'calendar-times']" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ t('events.noActivities') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('events.noActivitiesDescription') }}
          </p>
        </div>

        <!-- Events List -->
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex items-start space-x-4">
              <!-- Event Image/Thumbnail -->
              <div class="flex-shrink-0">
                <div
                  class="w-32 h-20 rounded-lg bg-cover bg-center"
                  :style="{ backgroundImage: event.cover_image_low_url ? `url(${event.cover_image_low_url})` : '' }"
                  :class="{ 'bg-gradient-to-br from-ifdd-bleu to-ifdd-bleu-clair': !event.cover_image_low_url }"
                >
                  <div v-if="!event.cover_image_low_url" class="w-full h-full flex items-center justify-center">
                    <font-awesome-icon :icon="['fas', getEventIcon(event.activity_type)]" class="w-8 h-8 text-gray-500 dark:text-white/50" />
                  </div>
                </div>
              </div>

              <!-- Event Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <router-link
                      :to="`/activities/${event.id}/manage`"
                      class="text-lg font-semibold text-gray-900 dark:text-white hover:text-ifdd-bleu dark:hover:text-ifdd-bleu-clair transition-colors truncate block"
                    >
                      {{ event.title }}
                    </router-link>
                    <div class="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span class="flex items-center">
                        <font-awesome-icon :icon="['fas', 'calendar']" class="w-4 h-4 mr-1" />
                        {{ formatDate(event.proposed_start_date) }}
                      </span>
                      <span class="flex items-center">
                        <font-awesome-icon :icon="['fas', 'clock']" class="w-4 h-4 mr-1" />
                        {{ formatTime(event.proposed_start_date) }} - {{ formatTime(event.proposed_end_date) }}
                      </span>
                      <span class="flex items-center">
                        <font-awesome-icon :icon="['fas', 'users']" class="w-4 h-4 mr-1" />
                        {{ event.activity_registrations?.[0]?.count || 0 }} {{ t('events.registrations') }}
                      </span>
                    </div>

                    <!-- Status Badge -->
                    <div class="mt-2">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(event.validation_status)"
                      >
                        {{ t(`events.status.${event.validation_status}`) }}
                      </span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center space-x-2 ml-4">
                    <router-link
                      :to="`/activities/${event.id}/manage`"
                      class="p-2 text-ifdd-bleu hover:bg-ifdd-bleu/10 rounded-lg transition-colors"
                      :title="t('events.manage')"
                    >
                      <font-awesome-icon :icon="['fas', 'cog']" class="w-5 h-5" />
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import useUserActivities from '@/composables/useUserActivities'
import useEvents from '@/composables/useEvents'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const { fetchUserActivities } = useUserActivities()
const { fetchActiveEvents, events: availableEvents } = useEvents()

const loading = ref(true)
const events = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')
const selectedEventId = ref('')
const eventsLoading = ref(false)

const stats = computed(() => {
  const now = new Date()
  return {
    total: events.value.length,
    upcoming: events.value.filter(e => e.validation_status === 'approved' && new Date(e.proposed_start_date) > now).length,
    draft: events.value.filter(e => e.validation_status === 'draft').length,
    totalRegistrations: events.value.reduce((sum, e) => sum + (e.activity_registrations?.[0]?.count || 0), 0)
  }
})

const filteredEvents = computed(() => {
  let filtered = [...events.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(query) ||
      e.description?.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value) {
    filtered = filtered.filter(e => e.validation_status === filterStatus.value)
  }

  if (filterType.value) {
    filtered = filtered.filter(e => e.activity_type === filterType.value)
  }

  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getEventIcon = (type) => {
  const icons = {
    side_event: 'calendar-alt',
    country_day: 'flag',
    other: 'calendar'
  }
  return icons[type] || 'calendar'
}

const formatTime = (datetime) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    submitted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    under_review: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    live: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  }
  return classes[status] || classes.draft
}

const loadEvents = async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const { data } = await fetchUserActivities({
      page: 1,
      limit: 100,
      sortBy: 'created_at',
      sortOrder: 'desc',
      eventId: selectedEventId.value || null
    })
    events.value = data || []
  } catch (error) {
    console.error('Error loading events:', error)
    events.value = []
  } finally {
    loading.value = false
  }
}


const loadAvailableEvents = async () => {
  eventsLoading.value = true
  try {
    await fetchActiveEvents()
  } catch (error) {
    console.error('Error loading available events:', error)
  } finally {
    eventsLoading.value = false
  }
}

onMounted(async () => {
  await loadAvailableEvents()
  await loadEvents()
})
</script>
