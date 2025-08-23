<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-3 border-b border-gray-200 dark:border-gray-700">
      <h3 class="font-semibold text-gray-900 dark:text-white">
        {{ $t('messaging.appointments') }}
      </h3>
    </div>

    <!-- Navigation par onglets -->
    <div class="flex border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="tab in appointmentTabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors"
        :class="[
          activeTab === tab.key
            ? 'text-primary-600 border-primary-600'
            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        <font-awesome-icon :icon="tab.icon" class="mr-1" />
        {{ tab.label }}
        <span
          v-if="tab.count > 0"
          class="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary-500 text-white"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Contenu des onglets -->
    <div class="flex-1 overflow-y-auto">
      <!-- Rendez-vous à venir -->
      <div v-if="activeTab === 'upcoming'">
        <div
          v-if="loading"
          class="p-4 text-center text-gray-500 dark:text-gray-400"
        >
          <font-awesome-icon icon="spinner" class="animate-spin mr-2" />
          {{ $t('common.loading') }}
        </div>

        <div
          v-else-if="upcomingAppointments.length === 0"
          class="p-4 text-center text-gray-500 dark:text-gray-400"
        >
          <font-awesome-icon icon="calendar-times" class="text-2xl mb-2" />
          <p>{{ $t('messaging.noUpcomingAppointments') }}</p>
        </div>

        <div v-else>
          <div
            v-for="appointment in upcomingAppointments"
            :key="appointment.id"
            class="p-4 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
          >
            <div class="flex items-start space-x-3">
              <!-- Avatar de l'autre participant -->
              <img
                :src="getOtherUser(appointment)?.profile_photo_thumbnail_url || '/default-avatar.png'"
                :alt="getOtherUserName(appointment)"
                class="w-10 h-10 rounded-full object-cover"
              />

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ getOtherUserName(appointment) }}
                  </h4>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusClasses(appointment.status)"
                  >
                    {{ $t(`messaging.appointmentStatus.${appointment.status}`) }}
                  </span>
                </div>

                <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <div class="flex items-center">
                    <font-awesome-icon icon="calendar" class="mr-2 text-xs" />
                    {{ formatAppointmentDate(appointment.scheduled_at) }}
                  </div>
                  <div class="flex items-center">
                    <font-awesome-icon :icon="getTypeIcon(appointment.appointment_type)" class="mr-2 text-xs" />
                    {{ $t(`messaging.appointmentType.${appointment.appointment_type}`) }}
                  </div>
                  <div v-if="appointment.notes" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ appointment.notes }}
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center space-x-2 mt-3">
                  <button
                    v-if="appointment.status === 'pending' && appointment.recipient_id === currentUserId"
                    @click="confirmAppointment(appointment.id)"
                    class="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    {{ $t('messaging.confirm') }}
                  </button>

                  <button
                    v-if="appointment.status === 'confirmed' && appointment.meeting_link"
                    @click="joinMeeting(appointment.meeting_link)"
                    class="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    {{ $t('messaging.joinMeeting') }}
                  </button>

                  <button
                    v-if="['pending', 'confirmed'].includes(appointment.status)"
                    @click="cancelAppointment(appointment.id)"
                    class="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    {{ $t('messaging.cancel') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historique -->
      <div v-if="activeTab === 'history'">
        <div
          v-if="pastAppointments.length === 0"
          class="p-4 text-center text-gray-500 dark:text-gray-400"
        >
          <font-awesome-icon icon="history" class="text-2xl mb-2" />
          <p>{{ $t('messaging.noAppointmentHistory') }}</p>
        </div>

        <div v-else>
          <div
            v-for="appointment in pastAppointments"
            :key="appointment.id"
            class="p-4 border-b border-gray-100 dark:border-gray-600 last:border-b-0 opacity-75"
          >
            <div class="flex items-start space-x-3">
              <img
                :src="getOtherUser(appointment)?.profile_photo_thumbnail_url || '/default-avatar.png'"
                :alt="getOtherUserName(appointment)"
                class="w-10 h-10 rounded-full object-cover"
              />

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ getOtherUserName(appointment) }}
                  </h4>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusClasses(appointment.status)"
                  >
                    {{ $t(`messaging.appointmentStatus.${appointment.status}`) }}
                  </span>
                </div>

                <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <div class="flex items-center">
                    <font-awesome-icon icon="calendar" class="mr-2 text-xs" />
                    {{ formatAppointmentDate(appointment.scheduled_at) }}
                  </div>
                  <div class="flex items-center">
                    <font-awesome-icon :icon="getTypeIcon(appointment.appointment_type)" class="mr-2 text-xs" />
                    {{ $t(`messaging.appointmentType.${appointment.appointment_type}`) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nouveau rendez-vous -->
      <div v-if="activeTab === 'new'">
        <div class="p-4">
          <div
            v-if="!currentConversation"
            class="text-center text-gray-500 dark:text-gray-400"
          >
            <font-awesome-icon icon="info-circle" class="text-2xl mb-2" />
            <p>{{ $t('messaging.selectContactForAppointment') }}</p>
          </div>

          <div v-else>
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {{ $t('messaging.scheduleWith') }} {{ currentConversation.user.first_name }} {{ currentConversation.user.last_name }}
            </h4>

            <form @submit.prevent="scheduleAppointment" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ $t('messaging.appointmentTypeLabel') }}
                </label>
                <select
                  v-model="newAppointment.type"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="video">{{ $t('messaging.appointmentType.video') }}</option>
                  <option value="audio">{{ $t('messaging.appointmentType.audio') }}</option>
                  <option value="in_person">{{ $t('messaging.appointmentType.in_person') }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ $t('messaging.date') }}
                </label>
                <input
                  v-model="newAppointment.date"
                  type="date"
                  :min="tomorrow"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ $t('messaging.time') }}
                </label>
                <input
                  v-model="newAppointment.time"
                  type="time"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ $t('messaging.notes') }} ({{ $t('common.optional') }})
                </label>
                <textarea
                  v-model="newAppointment.notes"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  :placeholder="$t('messaging.appointmentNotesPlaceholder')"
                  rows="3"
                  maxlength="500"
                />
              </div>

              <button
                type="submit"
                :disabled="!canSchedule || scheduling"
                class="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <font-awesome-icon
                  v-if="scheduling"
                  icon="spinner"
                  class="animate-spin mr-2"
                />
                {{ $t('messaging.scheduleAppointment') }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessagingStore } from '@/stores/messaging'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

const { t, locale } = useI18n()
const messagingStore = useMessagingStore()
const authStore = useAuthStore()
const { showToast } = useToast()

const activeTab = ref('upcoming')
const scheduling = ref(false)

const newAppointment = ref({
  type: 'video',
  date: '',
  time: '',
  notes: ''
})

// Computed
const currentUserId = computed(() => authStore.user?.id)
const loading = computed(() => messagingStore.appointmentsService.loading)
const upcomingAppointments = computed(() => messagingStore.appointmentsService.upcomingAppointments || [])
const pastAppointments = computed(() => messagingStore.appointmentsService.pastAppointments || [])
const currentConversation = computed(() => messagingStore.messagesService.currentConversation)

const appointmentTabs = computed(() => [
  {
    key: 'upcoming',
    label: t('messaging.upcoming'),
    icon: 'calendar-day',
    count: upcomingAppointments.value.length
  },
  {
    key: 'history',
    label: t('messaging.history'),
    icon: 'history',
    count: 0
  },
  {
    key: 'new',
    label: t('messaging.schedule'),
    icon: 'calendar-plus',
    count: 0
  }
])

const tomorrow = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
})

const canSchedule = computed(() => {
  return newAppointment.value.date && 
         newAppointment.value.time && 
         currentConversation.value
})

// Méthodes
const getOtherUser = (appointment) => {
  return appointment.requester_id === currentUserId.value 
    ? appointment.recipient 
    : appointment.requester
}

const getOtherUserName = (appointment) => {
  const user = getOtherUser(appointment)
  return user ? `${user.first_name} ${user.last_name}` : ''
}

const getStatusClasses = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTypeIcon = (type) => {
  switch (type) {
    case 'video':
      return 'video'
    case 'audio':
      return 'phone'
    case 'in_person':
      return 'handshake'
    default:
      return 'calendar'
  }
}

const formatAppointmentDate = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return format(date, 'PPpp', {
    locale: locale.value === 'fr' ? fr : enUS
  })
}

const confirmAppointment = async (appointmentId) => {
  const result = await messagingStore.appointmentsService.confirmAppointment(appointmentId)
  
  if (result.success) {
    showToast(t('messaging.appointmentConfirmed'), 'success')
  } else {
    showToast(result.error, 'error')
  }
}

const cancelAppointment = async (appointmentId) => {
  if (confirm(t('messaging.confirmCancelAppointment'))) {
    const result = await messagingStore.appointmentsService.cancelAppointment(appointmentId)
    
    if (result.success) {
      showToast(t('messaging.appointmentCancelled'), 'success')
    } else {
      showToast(result.error, 'error')
    }
  }
}

const joinMeeting = (meetingLink) => {
  window.open(meetingLink, '_blank')
}

const scheduleAppointment = async () => {
  if (!canSchedule.value) return
  
  scheduling.value = true
  
  try {
    // Combiner date et heure
    const scheduledAt = new Date(`${newAppointment.value.date}T${newAppointment.value.time}`)
    
    const result = await messagingStore.appointmentsService.requestAppointment(
      currentConversation.value.userId,
      newAppointment.value.type,
      scheduledAt.toISOString(),
      newAppointment.value.notes
    )
    
    if (result.success) {
      showToast(t('messaging.appointmentScheduled'), 'success')
      activeTab.value = 'upcoming'
      
      // Réinitialiser le formulaire
      newAppointment.value = {
        type: 'video',
        date: '',
        time: '',
        notes: ''
      }
    } else {
      showToast(result.error, 'error')
    }
  } finally {
    scheduling.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await messagingStore.appointmentsService.getUserAppointments()
})
</script>