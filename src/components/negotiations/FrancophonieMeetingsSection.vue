<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        {{ $t('negotiations.francophonieMeetings.title') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-1 text-sm">
        {{ $t('negotiations.francophonieMeetings.subtitle') }}
      </p>
      
      <!-- Filters -->
      <div class="mt-4 space-y-3">
        <!-- Meeting Type Filter -->
        <div class="flex flex-wrap gap-2">
          <select
            v-model="selectedMeetingType"
            class="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{{ $t('negotiations.francophonieMeetings.filters.allTypes') }}</option>
            <option v-for="type in meetingTypes" :key="type.value" :value="type.value">
              {{ $t(type.label) }}
            </option>
          </select>
          
          <select
            v-model="statusFilter"
            class="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{{ $t('negotiations.francophonieMeetings.filters.allStatuses') }}</option>
            <option value="upcoming">{{ $t('negotiations.francophonieMeetings.filters.upcoming') }}</option>
            <option value="ongoing">{{ $t('negotiations.francophonieMeetings.filters.ongoing') }}</option>
            <option value="past">{{ $t('negotiations.francophonieMeetings.filters.past') }}</option>
          </select>
        </div>

        <!-- View Toggle -->
        <div class="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            @click="activeView = 'list'"
            class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
            :class="activeView === 'list'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
          >
            <div class="flex items-center justify-center space-x-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>{{ $t('negotiations.francophonieMeetings.views.list') }}</span>
            </div>
          </button>
          <button
            @click="activeView = 'calendar'"
            class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
            :class="activeView === 'calendar'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
          >
            <div class="flex items-center justify-center space-x-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ $t('negotiations.francophonieMeetings.views.calendar') }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- List View -->
      <div v-else-if="activeView === 'list'">
        <div v-if="filteredMeetings.length > 0" class="space-y-4">
          <MeetingCard
            v-for="meeting in filteredMeetings"
            :key="meeting.id"
            :meeting="meeting"
            @register="handleRegister"
            @unregister="handleUnregister"
            @view-details="handleViewDetails"
          />
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('negotiations.francophonieMeetings.noMeetings') }}
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ $t('negotiations.francophonieMeetings.noMeetingsDesc') }}
          </p>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-else-if="activeView === 'calendar'">
        <MeetingCalendar
          :meetings="filteredMeetings"
          :category="category"
          @meeting-click="handleViewDetails"
          @register="handleRegister"
          @unregister="handleUnregister"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MeetingCard from './MeetingCard.vue'
import MeetingCalendar from './MeetingCalendar.vue'
import { useFrancophonieMeetings } from '@/composables/useFrancophonieMeetings'
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
const { 
  meetings, 
  loading, 
  fetchMeetings, 
  registerToMeeting, 
  unregisterFromMeeting 
} = useFrancophonieMeetings()

const activeView = ref('list')
const selectedMeetingType = ref('all')
const statusFilter = ref('all')

const meetingTypes = [
  { value: 'Preparatory_Workshop', label: 'negotiations.meetingTypes.Preparatory_Workshop' },
  { value: 'Francophone_Consultation', label: 'negotiations.meetingTypes.Francophone_Consultation' },
  { value: 'Innovation', label: 'negotiations.meetingTypes.Innovation' },
  { value: 'Field_Training_Workshop', label: 'negotiations.meetingTypes.Field_Training_Workshop' }
]

// Map category to database enum
const categoryMap = {
  'climat': 'climate',
  'biodiversite': 'biodiversity',
  'desertification': 'desertification'
}

const filteredMeetings = computed(() => {
  let filtered = meetings.value.filter(meeting => 
    meeting.category === categoryMap[props.category]
  )

  // Filter by meeting type
  if (selectedMeetingType.value !== 'all') {
    filtered = filtered.filter(meeting => 
      meeting.meeting_type === selectedMeetingType.value
    )
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    const now = new Date()
    filtered = filtered.filter(meeting => {
      const startDate = new Date(meeting.start_datetime)
      const endDate = new Date(meeting.end_datetime)
      
      switch (statusFilter.value) {
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

  return filtered.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
})

const handleRegister = async (meetingId) => {
  try {
    await registerToMeeting(meetingId)
    showToast(t('negotiations.francophonieMeetings.registerSuccess'), 'success')
  } catch (error) {
    showToast(t('negotiations.francophonieMeetings.registerError'), 'error')
  }
}

const handleUnregister = async (meetingId) => {
  try {
    await unregisterFromMeeting(meetingId)
    showToast(t('negotiations.francophonieMeetings.unregisterSuccess'), 'success')
  } catch (error) {
    showToast(t('negotiations.francophonieMeetings.unregisterError'), 'error')
  }
}

const handleViewDetails = (meetingId) => {
  // Navigate to meeting detail page or open modal
  console.log('View details for meeting:', meetingId)
}

// Watch for category changes
watch(() => props.category, () => {
  fetchMeetings()
}, { immediate: true })

onMounted(() => {
  fetchMeetings()
})
</script>