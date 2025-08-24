<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
    :class="compact ? 'h-full' : ''"
  >
    <div class="p-6" :class="compact ? 'h-full flex flex-col' : ''">
      <div :class="compact ? 'flex-1' : 'flex-1'">
        <!-- Header with title and category badge -->
        <div class="flex items-start justify-between mb-3">
          <h3 :class="compact ? 'text-base font-semibold line-clamp-2' : 'text-lg font-semibold'" class="text-gray-900 dark:text-white pr-4">
            {{ session.title }}
          </h3>
          <div :class="compact ? 'flex flex-col space-y-1' : 'flex items-center space-x-2'" class="flex-shrink-0">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="categoryClasses"
            >
              {{ $t(`negotiations.categories.${session.category}`) }}
            </span>
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="statusClasses"
            >
              {{ $t(`negotiations.sessions.status.${sessionStatus}`) }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <p v-if="session.description" :class="compact ? 'text-sm line-clamp-2' : 'line-clamp-2'" class="text-gray-600 dark:text-gray-300 mb-4">
          {{ session.description }}
        </p>

        <!-- Session Details -->
        <div :class="compact ? 'space-y-3 mb-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'">
          <!-- Date and Time -->
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <div :class="compact ? 'text-xs' : ''">{{ formatDate(session.start_datetime) }}</div>
              <div class="text-xs opacity-75">{{ formatTime(session.start_datetime) }} - {{ formatTime(session.end_datetime) }}</div>
            </div>
          </div>

          <!-- Location -->
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span :class="compact ? 'text-xs' : ''">{{ session.location || $t('negotiations.sessions.onlineLocation') }}</span>
          </div>

          <!-- Participants count (for IFDD sessions) -->
          <div v-if="isIfdd" class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span :class="compact ? 'text-xs' : ''">{{ session.registrations_count || 0 }} {{ $t('negotiations.sessions.participants') }}</span>
          </div>

          <!-- External link (for external sessions) -->
          <div v-if="!isIfdd && session.external_link" class="flex items-center text-sm">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <a 
              :href="session.external_link" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {{ $t('negotiations.sessions.visitWebsite') }}
            </a>
          </div>
        </div>

        <!-- Action Buttons -->
        <div :class="compact ? 'mt-auto pt-4 space-y-2' : 'flex items-center justify-between'">
          <div :class="compact ? 'space-y-2' : 'flex items-center space-x-3'">
            <!-- Registration for IFDD sessions -->
            <template v-if="isIfdd">
              <button
                v-if="!session.is_registered"
                @click="$emit('register', session.id)"
                :class="compact ? 'w-full justify-center' : ''"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {{ $t('negotiations.sessions.register') }}
              </button>
              <button
                v-else
                @click="$emit('unregister', session.id)"
                :class="compact ? 'w-full justify-center' : ''"
                class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ $t('negotiations.sessions.registered') }}
              </button>

              <!-- Zoom link for registered users -->
              <a
                v-if="session.is_registered && session.zoom_meeting?.join_url"
                :href="session.zoom_meeting.join_url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {{ $t('negotiations.sessions.joinZoom') }}
              </a>
            </template>

            <!-- Add to calendar -->
            <button
              @click="addToCalendar"
              class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('negotiations.sessions.addToCalendar') }}
            </button>
          </div>

          <!-- Download documents -->
          <button
            v-if="session.documents && session.documents.length > 0"
            @click="downloadDocuments"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ $t('negotiations.sessions.documents') }}
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
  session: {
    type: Object,
    required: true
  },
  isIfdd: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['register', 'unregister'])

const { t, locale } = useI18n()

const sessionStatus = computed(() => {
  const now = new Date()
  const startDate = new Date(props.session.start_datetime)
  const endDate = new Date(props.session.end_datetime)
  
  if (endDate < now) return 'past'
  if (startDate <= now && endDate >= now) return 'ongoing'
  return 'upcoming'
})

const categoryClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  switch (props.session.category) {
    case 'climate':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'biodiversity':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'desertification':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
})

const statusClasses = computed(() => {
  switch (sessionStatus.value) {
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

const addToCalendar = () => {
  const startDate = new Date(props.session.start_datetime)
  const endDate = new Date(props.session.end_datetime)
  
  const event = {
    title: props.session.title,
    start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    description: props.session.description || '',
    location: props.session.location || ''
  }
  
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`
  
  window.open(googleCalendarUrl, '_blank')
}

const downloadDocuments = () => {
  // Implementation for downloading session documents
  console.log('Download documents for session:', props.session.id)
}
</script>