<template>
  <div class="youtube-stream-manager">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('admin.youtube.title') }}
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-300">
            {{ t('admin.youtube.subtitle') }}
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
            @change="loadActivities"
            :disabled="eventsLoading"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Activités à venir (triées par date) -->
      <div v-if="futureActivities.length > 0" class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex-shrink-0 w-1 h-8 bg-blue-500 rounded"></div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ t('admin.youtube.futureActivities') }}
          </h2>
          <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-semibold rounded-full">
            {{ futureActivities.length }}
          </span>
        </div>
        <div class="space-y-4">
          <ActivityStreamCard
            v-for="activity in futureActivities"
            :key="activity.id"
            :activity="activity"
            @update-link="handleUpdateLink"
            @remove-link="handleRemoveLink"
            @auto-fetch-link="handleAutoFetchLink"
            @update-validation-status="handleUpdateValidationStatus"
          />
        </div>
      </div>

      <!-- Finished Activities (Repliable) -->
      <div v-if="finishedActivities.length > 0" class="mb-8">
        <button
          @click="showFinished = !showFinished"
          class="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 w-1 h-8 bg-gray-400 rounded"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ t('admin.youtube.finishedActivities') }}
            </h2>
            <span class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-full">
              {{ finishedActivities.length }}
            </span>
          </div>
          <svg
            :class="['w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform', showFinished ? 'rotate-180' : '']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div v-if="showFinished" class="mt-4 space-y-4">
          <ActivityStreamCard
            v-for="activity in finishedActivities"
            :key="activity.id"
            :activity="activity"
            @update-link="handleUpdateLink"
            @remove-link="handleRemoveLink"
            @auto-fetch-link="handleAutoFetchLink"
            @update-validation-status="handleUpdateValidationStatus"
          />
        </div>
      </div>

      <!-- Cancelled Activities (Repliable) -->
      <div v-if="cancelledActivities.length > 0" class="mb-8">
        <button
          @click="showCancelled = !showCancelled"
          class="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 w-1 h-8 bg-gray-400 rounded"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ t('admin.youtube.cancelledActivities') }}
            </h2>
            <span class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-full">
              {{ cancelledActivities.length }}
            </span>
          </div>
          <svg
            :class="['w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform', showCancelled ? 'rotate-180' : '']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div v-if="showCancelled" class="mt-4 space-y-4">
          <ActivityStreamCard
            v-for="activity in cancelledActivities"
            :key="activity.id"
            :activity="activity"
            @update-link="handleUpdateLink"
            @remove-link="handleRemoveLink"
            @auto-fetch-link="handleAutoFetchLink"
            @update-validation-status="handleUpdateValidationStatus"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="activities.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ t('admin.youtube.noActivities') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('admin.youtube.noActivitiesDesc') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useYoutubeLivestream } from '@/composables/useYoutubeLivestream'
import useEvents from '@/composables/useEvents'
import { useAdmin } from '@/composables/useAdmin'
import { useAuthStore } from '@/stores/auth'
import ActivityStreamCard from '@/components/admin/ActivityStreamCard.vue'

const { t } = useI18n()
const {
  activities,
  isLoading,
  futureActivities,
  finishedActivities,
  cancelledActivities,
  fetchActivitiesWithStreamStatus,
  updateYoutubeLink,
  removeYoutubeLink
} = useYoutubeLivestream()

const { fetchActiveEvents, events: availableEvents } = useEvents()
const { validateActivity } = useAdmin()
const authStore = useAuthStore()

// État
const selectedEventId = ref('')
const eventsLoading = ref(false)
const showFinished = ref(false)
const showCancelled = ref(false)

// Méthodes
const loadActivities = async () => {
  await fetchActivitiesWithStreamStatus(selectedEventId.value || null)
}

const loadAvailableEvents = async () => {
  eventsLoading.value = true
  try {
    await fetchActiveEvents()
  } catch (error) {
    console.error('Error loading events:', error)
  } finally {
    eventsLoading.value = false
  }
}

const handleUpdateLink = async ({ activityId, videoId }) => {
  const result = await updateYoutubeLink(activityId, videoId)
  if (result.success) {
    // Succès géré dans le composable
  } else {
    alert(t('admin.youtube.updateError'))
  }
}

const handleRemoveLink = async (activityId) => {
  if (!confirm(t('admin.youtube.confirmRemove'))) return

  const result = await removeYoutubeLink(activityId)
  if (!result.success) {
    alert(t('admin.youtube.removeError'))
  }
}

const handleAutoFetchLink = async (activityId) => {
  // Cette fonctionnalité sera gérée dans le composant enfant
  // et appellera handleUpdateLink avec l'ID récupéré
}

const handleUpdateValidationStatus = async ({ activityId, status }) => {
  if (!authStore.user) {
    alert(t('common.errors.notAuthenticated'))
    return
  }

  const result = await validateActivity(activityId, status, authStore.user.id)

  if (result.success) {
    // Mettre à jour l'activité dans la liste locale
    const activityIndex = activities.value.findIndex(a => a.id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].validation_status = status
    }
    // Recharger pour recalculer les catégories (future/finished/cancelled)
    await loadActivities()
  } else {
    alert(t('admin.youtube.statusUpdateError'))
  }
}

// Lifecycle
onMounted(async () => {
  await loadAvailableEvents()
  await loadActivities()
})
</script>
