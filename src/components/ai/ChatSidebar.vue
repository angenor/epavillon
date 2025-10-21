<template>
  <div class="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <button
        @click="$emit('new-session')"
        class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center gap-2 font-medium"
      >
        <font-awesome-icon icon="plus" />
        {{ t('chatbot.newConversation') }}
      </button>
    </div>

    <!-- Filter by category -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('chatbot.filterByCategory') }}
      </label>
      <select
        v-model="selectedCategory"
        class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
      >
        <option :value="null">{{ t('chatbot.allCategories') }}</option>
        <option value="climate">{{ t('chatbot.categories.climate') }}</option>
        <option value="biodiversity">{{ t('chatbot.categories.biodiversity') }}</option>
        <option value="desertification">{{ t('chatbot.categories.desertification') }}</option>
      </select>
    </div>

    <!-- Sessions list -->
    <div class="flex-1 overflow-y-auto p-4 space-y-2">
      <div v-if="isLoading" class="text-center py-8">
        <font-awesome-icon icon="spinner" spin class="text-2xl text-gray-400" />
      </div>

      <div v-else-if="filteredSessions.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        {{ t('chatbot.noSessions') }}
      </div>

      <div
        v-for="session in filteredSessions"
        :key="session.id"
        :class="[
          'p-3 rounded-lg cursor-pointer transition-all group',
          currentSessionId === session.id
            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
            : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
        ]"
        @click="$emit('select-session', session.id)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <!-- Title -->
            <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {{ session.title || t('chatbot.untitledConversation') }}
            </h4>

            <!-- Category badge -->
            <div v-if="session.category" class="mt-1">
              <span
                :class="[
                  'inline-block px-2 py-0.5 rounded text-xs font-medium',
                  getCategoryClass(session.category)
                ]"
              >
                {{ formatCategory(session.category) }}
              </span>
            </div>

            <!-- Date -->
            <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ formatDate(session.updated_at) }}
            </div>
          </div>

          <!-- Delete button -->
          <button
            @click.stop="confirmDelete(session)"
            class="flex-shrink-0 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-all cursor-pointer"
            :title="t('chatbot.deleteSession')"
          >
            <font-awesome-icon
              icon="trash"
              class="text-xs text-red-500 dark:text-red-400"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div
      v-if="sessionToDelete"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="sessionToDelete = null"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {{ t('chatbot.confirmDelete') }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {{ t('chatbot.confirmDeleteMessage', { title: sessionToDelete.title }) }}
        </p>

        <div class="flex justify-end gap-3">
          <button
            @click="sessionToDelete = null"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="deleteSession"
            class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDistance } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

const props = defineProps({
  sessions: {
    type: Array,
    default: () => []
  },
  currentSessionId: {
    type: String,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['new-session', 'select-session', 'delete-session'])

const { t, locale } = useI18n()

const selectedCategory = ref(null)
const sessionToDelete = ref(null)

// Computed
const filteredSessions = computed(() => {
  if (!selectedCategory.value) {
    return props.sessions
  }

  return props.sessions.filter(s => s.category === selectedCategory.value)
})

// Methods
const formatDate = (timestamp) => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const dateLocale = locale.value === 'fr' ? fr : enUS

  return formatDistance(date, new Date(), {
    addSuffix: true,
    locale: dateLocale
  })
}

const formatCategory = (category) => {
  const categoryMap = {
    climate: t('chatbot.categories.climate'),
    biodiversity: t('chatbot.categories.biodiversity'),
    desertification: t('chatbot.categories.desertification')
  }

  return categoryMap[category] || category
}

const getCategoryClass = (category) => {
  const classMap = {
    climate: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    biodiversity: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    desertification: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  }

  return classMap[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

const confirmDelete = (session) => {
  sessionToDelete.value = session
}

const deleteSession = () => {
  if (sessionToDelete.value) {
    emit('delete-session', sessionToDelete.value.id)
    sessionToDelete.value = null
  }
}
</script>
