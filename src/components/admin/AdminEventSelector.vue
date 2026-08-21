<template>
  <div class="relative" ref="selectorRef">
    <button
      type="button"
      @click="isOpen = !isOpen"
      :disabled="isLoading"
      class="flex items-center gap-2 max-w-[220px] sm:max-w-[280px] px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-orange-500 dark:hover:border-orange-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      :title="selectedEvent?.title || t('events.allEvents')"
    >
      <font-awesome-icon :icon="['fas', 'calendar-alt']" class="h-4 w-4 text-orange-500 flex-shrink-0" />
      <span class="truncate font-medium">
        {{ selectedEvent ? (selectedEvent.acronym || selectedEvent.title) : t('events.allEvents') }}
      </span>
      <font-awesome-icon
        :icon="['fas', 'chevron-down']"
        class="h-3 w-3 text-gray-400 flex-shrink-0 transition-transform"
        :class="isOpen ? 'rotate-180' : ''" />
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute right-0 z-50 mt-2 w-72 max-h-80 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1"
    >
      <p class="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {{ t('events.selectEvent') }}
      </p>

      <button
        type="button"
        @click="select('')"
        :class="optionClass('')"
      >
        <span class="truncate">{{ t('events.allEvents') }}</span>
        <font-awesome-icon v-if="selectedEventId === ''" :icon="['fas', 'check']" class="h-3 w-3 text-orange-500" />
      </button>

      <button
        v-for="event in events"
        :key="event.id"
        type="button"
        @click="select(event.id)"
        :class="optionClass(event.id)"
      >
        <span class="truncate">{{ event.title }} ({{ event.year }})</span>
        <font-awesome-icon v-if="selectedEventId === event.id" :icon="['fas', 'check']" class="h-3 w-3 text-orange-500 flex-shrink-0" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminEvent } from '@/composables/useAdminEvent'

const { t } = useI18n()
const { events, selectedEventId, selectedEvent, isLoading, loadEvents, setSelectedEventId } = useAdminEvent()

const isOpen = ref(false)
const selectorRef = ref(null)

const optionClass = (eventId) => [
  'w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-left transition-colors cursor-pointer',
  selectedEventId.value === eventId
    ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium'
    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
]

const select = (eventId) => {
  setSelectedEventId(eventId)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (selectorRef.value && !selectorRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(async () => {
  await loadEvents()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
