<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        {{ $t(sectionConfig.titleKey) }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-1 text-sm">
        {{ $t(sectionConfig.subtitleKey) }}
      </p>
      
      <!-- Filters -->
      <div class="mt-4 space-y-3">
        <!-- Meeting Type Filter -->
        <div class="flex flex-wrap gap-2">
          <select
            v-model="selectedItemType"
            class="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{{ $t(sectionConfig.filters.allTypes) }}</option>
            <option v-for="type in itemTypes" :key="type.value" :value="type.value">
              {{ $t(type.label) }}
            </option>
          </select>
          
          <select
            v-model="statusFilter"
            class="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{{ $t(sectionConfig.filters.allStatuses) }}</option>
            <option value="upcoming">{{ $t(sectionConfig.filters.upcoming) }}</option>
            <option value="ongoing">{{ $t(sectionConfig.filters.ongoing) }}</option>
            <option value="past">{{ $t(sectionConfig.filters.past) }}</option>
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
              <span>{{ $t(sectionConfig.views.list) }}</span>
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
              <span>{{ $t(sectionConfig.views.calendar) }}</span>
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
        <div v-if="filteredItems.length > 0" class="space-y-4">
          <MeetingCard
            v-for="item in filteredItems"
            :key="item.id"
            :meeting="item"
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
            {{ $t(sectionConfig.empty.title) }}
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ $t(sectionConfig.empty.description) }}
          </p>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-else-if="activeView === 'calendar'">
        <MeetingCalendar
          :meetings="filteredItems"
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
import { useEventsAndTrainings } from '@/composables/useEventsAndTrainings'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  category: {
    type: String,
    required: true,
    validator: (value) => ['climat', 'biodiversite', 'desertification'].includes(value)
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['francophonie_meetings', 'trainings'].includes(value)
  }
})

const { t } = useI18n()
const { showToast } = useToast()
const {
  items,
  loading,
  fetchItems,
  registerToItem,
  unregisterFromItem
} = useEventsAndTrainings()

const activeView = ref('list')
const selectedItemType = ref('all')
const statusFilter = ref('all')

// Configuration based on type prop
const sectionConfig = computed(() => {
  if (props.type === 'francophonie_meetings') {
    return {
      titleKey: 'negotiations.francophonieMeetings.title',
      subtitleKey: 'negotiations.francophonieMeetings.subtitle',
      views: {
        list: 'negotiations.francophonieMeetings.views.list',
        calendar: 'negotiations.francophonieMeetings.views.calendar'
      },
      filters: {
        allTypes: 'negotiations.francophonieMeetings.filters.allTypes',
        allStatuses: 'negotiations.francophonieMeetings.filters.allStatuses',
        upcoming: 'negotiations.francophonieMeetings.filters.upcoming',
        ongoing: 'negotiations.francophonieMeetings.filters.ongoing',
        past: 'negotiations.francophonieMeetings.filters.past'
      },
      empty: {
        title: 'negotiations.francophonieMeetings.noMeetings',
        description: 'negotiations.francophonieMeetings.noMeetingsDesc'
      },
      messages: {
        registerSuccess: 'negotiations.francophonieMeetings.registerSuccess',
        registerError: 'negotiations.francophonieMeetings.registerError',
        unregisterSuccess: 'negotiations.francophonieMeetings.unregisterSuccess',
        unregisterError: 'negotiations.francophonieMeetings.unregisterError'
      }
    }
  } else {
    return {
      titleKey: 'negotiations.trainings.title',
      subtitleKey: 'negotiations.trainings.subtitle',
      views: {
        list: 'negotiations.trainings.views.list',
        calendar: 'negotiations.trainings.views.calendar'
      },
      filters: {
        allTypes: 'negotiations.trainings.filters.allTypes',
        allStatuses: 'negotiations.trainings.filters.allStatuses',
        upcoming: 'negotiations.trainings.filters.upcoming',
        ongoing: 'negotiations.trainings.filters.ongoing',
        past: 'negotiations.trainings.filters.past'
      },
      empty: {
        title: 'negotiations.trainings.noTrainings',
        description: 'negotiations.trainings.noTrainingsDesc'
      },
      messages: {
        registerSuccess: 'negotiations.trainings.registerSuccess',
        registerError: 'negotiations.trainings.registerError',
        unregisterSuccess: 'negotiations.trainings.unregisterSuccess',
        unregisterError: 'negotiations.trainings.unregisterError'
      }
    }
  }
})

const itemTypes = computed(() => {
  if (props.type === 'francophonie_meetings') {
    return [
      { value: 'Preparatory_Workshop', label: 'negotiations.meetingTypes.Preparatory_Workshop' },
      { value: 'Francophone_Consultation', label: 'negotiations.meetingTypes.Francophone_Consultation' },
      { value: 'Innovation', label: 'negotiations.meetingTypes.Innovation' },
      { value: 'Field_Training_Workshop', label: 'negotiations.meetingTypes.Field_Training_Workshop' }
    ]
  } else {
    return [
      { value: 'online', label: 'negotiations.trainingTypes.online' },
      { value: 'hybrid', label: 'negotiations.trainingTypes.hybrid' }
    ]
  }
})

// Map category to database enum
const categoryMap = {
  'climat': 'climate',
  'biodiversite': 'biodiversity',
  'desertification': 'desertification'
}

const filteredItems = computed(() => {
  let filtered = items.value.filter(item =>
    item.category === categoryMap[props.category]
  )

  // Filter by item type
  if (selectedItemType.value !== 'all') {
    filtered = filtered.filter(item =>
      item.item_type === selectedItemType.value
    )
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    const now = new Date()
    filtered = filtered.filter(item => {
      const startDate = new Date(item.start_datetime)
      const endDate = new Date(item.end_datetime)

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

const handleRegister = async (itemId) => {
  try {
    await registerToItem(itemId, props.type)
    showToast(t(sectionConfig.value.messages.registerSuccess), 'success')
  } catch (error) {
    showToast(t(sectionConfig.value.messages.registerError), 'error')
  }
}

const handleUnregister = async (itemId) => {
  try {
    await unregisterFromItem(itemId, props.type)
    showToast(t(sectionConfig.value.messages.unregisterSuccess), 'success')
  } catch (error) {
    showToast(t(sectionConfig.value.messages.unregisterError), 'error')
  }
}

const handleViewDetails = (itemId) => {
  // Navigate to item detail page or open modal
  console.log('View details for item:', itemId)
}

// Watch for category or type changes
watch([() => props.category, () => props.type], () => {
  fetchItems(props.type, categoryMap[props.category])
}, { immediate: true })

onMounted(() => {
  fetchItems(props.type, categoryMap[props.category])
})
</script>