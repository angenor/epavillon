<template>
  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- Header with title and badges -->
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white pr-4">
            {{ meeting.title }}
          </h3>
          <div class="flex items-center space-x-2 flex-shrink-0">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="meetingTypeClasses"
            >
              {{ $t(`negotiations.meetingTypes.${meeting.meeting_type}`) }}
            </span>
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="statusClasses"
            >
              {{ $t(`negotiations.meetingStatus.${meetingStatus}`) }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <p v-if="meeting.description" class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {{ meeting.description }}
        </p>

        <!-- Meeting Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Date and Time -->
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <div>{{ formatDate(meeting.start_datetime) }}</div>
              <div class="text-xs">{{ formatTime(meeting.start_datetime) }} - {{ formatTime(meeting.end_datetime) }}</div>
            </div>
          </div>

          <!-- Location and Country -->
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div class="flex items-center space-x-2">
              <span>{{ meeting.location }}</span>
              <div v-if="meeting.country" class="flex items-center space-x-1">
                <img
                  v-if="meeting.country.code"
                  :src="`https://flagcdn.com/w20/${meeting.country.code.toLowerCase()}.png`"
                  :alt="meeting.country.name_fr"
                  class="w-4 h-3 rounded-sm"
                />
                <span class="text-xs">{{ meeting.country.name_fr }}</span>
              </div>
            </div>
          </div>

          <!-- Participants count -->
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{{ meeting.registrations_count || 0 }} {{ $t('negotiations.francophonieMeetings.participants') }}</span>
          </div>

          <!-- Meeting Category -->
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>{{ $t(`negotiations.categories.${meeting.category}`) }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Registration -->
            <button
              v-if="!meeting.is_registered"
              @click="$emit('register', meeting.id)"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('negotiations.francophonieMeetings.register') }}
            </button>
            <button
              v-else
              @click="$emit('unregister', meeting.id)"
              class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('negotiations.francophonieMeetings.registered') }}
            </button>

            <!-- Zoom link for registered users -->
            <a
              v-if="meeting.is_registered && meeting.zoom_meeting?.join_url"
              :href="meeting.zoom_meeting.join_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ $t('negotiations.francophonieMeetings.joinZoom') }}
            </a>
          </div>

          <!-- View Details -->
          <button
            @click="$emit('view-details', meeting.id)"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ $t('negotiations.francophonieMeetings.viewDetails') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  meeting: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['register', 'unregister', 'view-details'])

const { t, locale } = useI18n()

const meetingStatus = computed(() => {
  const now = new Date()
  const startDate = new Date(props.meeting.start_datetime)
  const endDate = new Date(props.meeting.end_datetime)
  
  if (endDate < now) return 'past'
  if (startDate <= now && endDate >= now) return 'ongoing'
  return 'upcoming'
})

const meetingTypeClasses = computed(() => {
  switch (props.meeting.meeting_type) {
    case 'Preparatory_Workshop':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'Francophone_Consultation':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    case 'Innovation':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
    case 'Field_Training_Workshop':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
})

const statusClasses = computed(() => {
  switch (meetingStatus.value) {
    case 'ongoing':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'upcoming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'past':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
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