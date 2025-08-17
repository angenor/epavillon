<template>
  <div class="meeting-calendar">
    <!-- Calendar will be integrated with Vue Cal v4 -->
    <div v-if="!vuecalLoaded" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
    
    <!-- Vue Cal Component will be rendered here -->
    <div ref="calendarContainer" class="min-h-96"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  meetings: {
    type: Array,
    default: () => []
  },
  category: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['meeting-click', 'register', 'unregister'])

const { t, locale } = useI18n()
const calendarContainer = ref(null)
const vuecalLoaded = ref(false)

// Vue Cal will be dynamically imported and initialized
let vueCalInstance = null

const initializeCalendar = async () => {
  try {
    // TODO: Install and configure Vue Cal v4 when ready
    // For now, use fallback calendar
    renderFallbackCalendar()
  } catch (error) {
    console.error('Failed to load Vue Cal:', error)
    // Fallback to simple calendar view
    renderFallbackCalendar()
  }
}

const renderFallbackCalendar = () => {
  if (!calendarContainer.value) return
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Clear container
  calendarContainer.value.innerHTML = ''
  
  // Create calendar container
  const calendarDiv = document.createElement('div')
  calendarDiv.className = 'fallback-calendar bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'
  
  // Header
  const headerDiv = document.createElement('div')
  headerDiv.className = 'p-4 border-b border-gray-200 dark:border-gray-700'
  headerDiv.innerHTML = `
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      ${new Date(currentYear, currentMonth).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', { 
        month: 'long', 
        year: 'numeric' 
      })}
    </h3>
  `
  
  // Content
  const contentDiv = document.createElement('div')
  contentDiv.className = 'p-4'
  
  const meetingsDiv = document.createElement('div')
  meetingsDiv.className = 'space-y-2'
  
  // Add meetings
  props.meetings.forEach(meeting => {
    const meetingDiv = document.createElement('div')
    meetingDiv.className = 'p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200'
    meetingDiv.addEventListener('click', () => {
      emit('meeting-click', meeting.id)
    })
    
    meetingDiv.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <h4 class="font-medium text-gray-900 dark:text-white">${meeting.title}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ${new Date(meeting.start_datetime).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US')} 
            ${new Date(meeting.start_datetime).toLocaleTimeString(locale.value === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          ${t(`negotiations.meetingTypes.${meeting.meeting_type}`)}
        </span>
      </div>
    `
    
    meetingsDiv.appendChild(meetingDiv)
  })
  
  contentDiv.appendChild(meetingsDiv)
  calendarDiv.appendChild(headerDiv)
  calendarDiv.appendChild(contentDiv)
  calendarContainer.value.appendChild(calendarDiv)
  
  vuecalLoaded.value = true
}

const updateCalendarEvents = () => {
  if (vueCalInstance && vuecalLoaded.value) {
    const events = props.meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      start: new Date(meeting.start_datetime),
      end: new Date(meeting.end_datetime),
      content: meeting.description || '',
      class: `meeting-${meeting.category} meeting-${meeting.meeting_type}`,
      meeting: meeting
    }))
    
    // Update events in Vue Cal
    if (vueCalInstance.updateEvents) {
      vueCalInstance.updateEvents(events)
    }
  }
}

// Watch for meetings changes
watch(() => props.meetings, () => {
  if (vuecalLoaded.value) {
    updateCalendarEvents()
  }
}, { deep: true })

// Watch for locale changes
watch(() => locale.value, () => {
  if (vueCalInstance && vueCalInstance.updateLocale) {
    vueCalInstance.updateLocale(locale.value === 'fr' ? 'fr' : 'en')
  }
})

onMounted(async () => {
  await nextTick()
  initializeCalendar()
})
</script>

<style scoped>
.meeting-calendar {
  min-height: 400px;
}

/* Vue Cal custom styles */
:deep(.vuecal__event) {
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 4px;
}

:deep(.vuecal__event.meeting-climate) {
  background-color: #3B82F6;
  border-color: #2563EB;
  color: white;
}

:deep(.vuecal__event.meeting-biodiversity) {
  background-color: #10B981;
  border-color: #059669;
  color: white;
}

:deep(.vuecal__event.meeting-desertification) {
  background-color: #F59E0B;
  border-color: #D97706;
  color: white;
}

:deep(.vuecal__event.meeting-Preparatory_Workshop) {
  border-left: 4px solid #8B5CF6;
}

:deep(.vuecal__event.meeting-Francophone_Consultation) {
  border-left: 4px solid #6366F1;
}

:deep(.vuecal__event.meeting-Innovation) {
  border-left: 4px solid #14B8A6;
}

:deep(.vuecal__event.meeting-Field_Training_Workshop) {
  border-left: 4px solid #F97316;
}

.fallback-calendar {
  min-height: 400px;
}
</style>