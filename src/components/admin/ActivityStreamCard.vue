<template>
  <div :class="[
    'rounded-lg border p-6 transition-all duration-200',
    activity.streamStatus.cssClass
  ]">
    <div class="flex items-start gap-4">
      <!-- Thumbnail -->
      <div class="flex-shrink-0">
        <img
          :src="activity.cover_image_low_url || '/images/default-activity.jpg'"
          :alt="activity.title"
          class="w-24 h-16 object-cover rounded-lg"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 mb-2">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {{ activity.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ activity.organization?.name }} • {{ activity.event?.title }}
            </p>
          </div>

          <!-- Status Badge -->
          <span :class="[
            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap',
            getStatusBadgeClass(activity.streamStatus.status)
          ]">
            {{ activity.streamStatus.message }}
          </span>
        </div>

        <!-- Validation Status Selector -->
        <div class="flex items-center gap-2 mb-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('admin.youtube.validationStatus') }}:
          </label>
          <select
            v-model="selectedValidationStatus"
            @change="handleValidationStatusChange"
            :disabled="isUpdatingStatus"
            class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option v-for="status in validationStatuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
          <span v-if="isUpdatingStatus" class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('common.saving') }}...
          </span>
        </div>

        <!-- Date Info -->
        <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {{ formatDate(activity.final_start_date || activity.proposed_start_date) }}
          </div>
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ formatTime(activity.final_start_date || activity.proposed_start_date) }}
          </div>
        </div>

        <!-- YouTube Link Section -->
        <div class="space-y-3">
          <!-- Current Link (if exists) -->
          <div v-if="activity.youtube_link" class="flex items-center gap-2">
            <div class="flex-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <a
                :href="getYoutubeWatchUrl(activity.youtube_link)"
                target="_blank"
                class="flex-1 text-sm text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 truncate"
              >
                {{ activity.youtube_link }}
              </a>
              <button
                @click="$emit('remove-link', activity.id)"
                class="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                :title="t('admin.youtube.removeLink')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <router-link
              :to="`/programmation/${activity.id}`"
              target="_blank"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              {{ t('admin.youtube.viewActivity') }}
            </router-link>
          </div>

          <!-- Add/Update Link Form -->
          <div v-else class="space-y-2">
            <div class="flex items-center gap-2">
              <input
                v-model="videoIdInput"
                type="text"
                :placeholder="t('admin.youtube.enterVideoId')"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                @keyup.enter="handleManualUpdate"
              />
              <button
                @click="handleManualUpdate"
                :disabled="!videoIdInput || isUpdating"
                class="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                {{ isUpdating ? t('common.saving') : t('admin.youtube.addLink') }}
              </button>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('common.or') }}</span>
              <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>

            <button
              @click="handleAutoFetch"
              :disabled="isFetching"
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <svg v-if="!isFetching" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ isFetching ? t('admin.youtube.fetching') : t('admin.youtube.autoFetchLink') }}
            </button>
          </div>

          <!-- Email Action Buttons -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ t('admin.youtube.quickEmailActions') }}</p>
            <div class="flex flex-wrap gap-2">
              <!-- Bouton alerte imminence (si activité à venir dans moins de 24h) -->
              <button
                v-if="shouldShowImminenceButton"
                @click="handleSendImminenceAlert"
                class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                :title="t('admin.youtube.alertImminence')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ t('admin.youtube.alertImminence') }}
              </button>

              <!-- Bouton annulation pour absence -->
              <button
                v-if="shouldShowCancellationButton"
                @click="handleSendCancellation"
                class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                :title="t('admin.youtube.cancelForAbsence')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                {{ t('admin.youtube.cancelForAbsence') }}
              </button>

              <!-- Bouton demande éléments post-activité (si terminée) -->
              <button
                v-if="shouldShowPostActivityButton"
                @click="handleSendPostActivityRequest"
                class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                :title="t('admin.youtube.requestPostElements')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ t('admin.youtube.requestPostElements') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { extractYoutubeVideoId, getYoutubeWatchUrl, fetchCurrentLiveStreamId } from '@/utils/youtube'
import { useActivityEmailTemplates } from '@/composables/useActivityEmailTemplates'

const { t } = useI18n()
const {
  sendImminenceAlert,
  sendCancellationForAbsence,
  sendPostActivityRequest,
  getMinutesUntilStart
} = useActivityEmailTemplates()

// Props
const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['update-link', 'remove-link', 'auto-fetch-link', 'update-validation-status'])

// État
const videoIdInput = ref('')
const isUpdating = ref(false)
const isFetching = ref(false)
const isUpdatingStatus = ref(false)
const selectedValidationStatus = ref(props.activity.validation_status || 'approved')

// Mettre à jour le statut sélectionné quand l'activité change
watch(() => props.activity.validation_status, (newStatus) => {
  if (newStatus) {
    selectedValidationStatus.value = newStatus
  }
})

// Liste des statuts de validation disponibles
const validationStatuses = computed(() => [
  { value: 'approved', label: t('activity.status.approved') },
  { value: 'live', label: t('activity.status.live') },
  { value: 'completed', label: t('activity.status.completed') },
  { value: 'cancelled', label: t('activity.status.cancelled') }
])

// Gestion du changement de statut de validation
const handleValidationStatusChange = async () => {
  if (isUpdatingStatus.value) return

  isUpdatingStatus.value = true
  try {
    emit('update-validation-status', {
      activityId: props.activity.id,
      status: selectedValidationStatus.value
    })
  } finally {
    isUpdatingStatus.value = false
  }
}

// Méthodes
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'live': 'bg-green-600 text-white',
    'live_missing_link': 'bg-red-600 text-white',
    'imminent': 'bg-yellow-500 text-white',
    'imminent_missing_link': 'bg-orange-600 text-white',
    'upcoming': 'bg-blue-500 text-white',
    'upcoming_missing_link': 'bg-yellow-300 text-gray-900',
    'next': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'cancelled': 'bg-gray-400 text-white',
    'finished': 'bg-gray-400 text-white',
    'future': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[status] || classes.future
}

const handleManualUpdate = async () => {
  if (!videoIdInput.value || isUpdating.value) return

  isUpdating.value = true
  try {
    const videoId = extractYoutubeVideoId(videoIdInput.value)
    if (!videoId) {
      alert(t('admin.youtube.invalidVideoId'))
      return
    }

    emit('update-link', {
      activityId: props.activity.id,
      videoId
    })

    videoIdInput.value = ''
  } catch (error) {
    console.error('Error updating link:', error)
    alert(t('admin.youtube.updateError'))
  } finally {
    isUpdating.value = false
  }
}

const handleAutoFetch = async () => {
  if (isFetching.value) return

  isFetching.value = true
  try {
    const result = await fetchCurrentLiveStreamId()

    if (result.success && result.videoId) {
      emit('update-link', {
        activityId: props.activity.id,
        videoId: result.videoId
      })
    } else {
      alert(result.error || t('admin.youtube.noLiveFound'))
    }
  } catch (error) {
    console.error('Error fetching live stream:', error)
    alert(t('admin.youtube.fetchError'))
  } finally {
    isFetching.value = false
  }
}

// Email Actions - Computed
const shouldShowImminenceButton = computed(() => {
  const now = new Date()
  const startDate = new Date(props.activity.final_start_date || props.activity.proposed_start_date)
  const hoursUntilStart = (startDate - now) / (1000 * 60 * 60)

  // Afficher si l'activité commence dans moins de 24h et n'est pas annulée ou terminée
  return hoursUntilStart > 0 &&
         hoursUntilStart <= 24 &&
         props.activity.activity_status !== 'cancelled' &&
         props.activity.streamStatus.status !== 'finished'
})

const shouldShowCancellationButton = computed(() => {
  // Afficher si l'activité devrait être en cours ou passée mais pas encore marquée comme annulée
  const now = new Date()
  const startDate = new Date(props.activity.final_start_date || props.activity.proposed_start_date)

  return startDate <= now &&
         props.activity.activity_status !== 'cancelled' &&
         props.activity.streamStatus.status !== 'finished'
})

const shouldShowPostActivityButton = computed(() => {
  // Afficher uniquement si l'activité est terminée
  return props.activity.streamStatus.status === 'finished'
})

// Email Actions - Méthodes
const handleSendImminenceAlert = () => {
  sendImminenceAlert(props.activity)
}

const handleSendCancellation = () => {
  if (confirm(t('admin.youtube.confirmCancellationEmail'))) {
    sendCancellationForAbsence(props.activity)
  }
}

const handleSendPostActivityRequest = () => {
  sendPostActivityRequest(props.activity)
}
</script>
