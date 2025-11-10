<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.incidentMessages.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {{ t('admin.incidentMessages.description') }}
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('admin.incidentMessages.createNew') }}
      </button>
    </div>

    <!-- Filtres -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Filtre par événement -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('admin.incidentMessages.filters.event') }}
          </label>
          <select
            v-model="filters.eventId"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option :value="null">{{ t('common.all') }}</option>
            <option v-for="event in events" :key="event.id" :value="event.id">
              {{ event.title }} {{ event.year }}
            </option>
          </select>
        </div>

        <!-- Filtre par gravité -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('admin.incidentMessages.filters.severity') }}
          </label>
          <select
            v-model="filters.severity"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option :value="null">{{ t('common.all') }}</option>
            <option value="info">{{ t('admin.incidentMessages.severity.info') }}</option>
            <option value="warning">{{ t('admin.incidentMessages.severity.warning') }}</option>
            <option value="error">{{ t('admin.incidentMessages.severity.error') }}</option>
          </select>
        </div>

        <!-- Filtre par statut -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('admin.incidentMessages.filters.status') }}
          </label>
          <select
            v-model="filters.isActive"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option :value="null">{{ t('common.all') }}</option>
            <option :value="true">{{ t('admin.incidentMessages.status.active') }}</option>
            <option :value="false">{{ t('admin.incidentMessages.status.inactive') }}</option>
          </select>
        </div>

        <!-- Bouton réinitialiser -->
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {{ t('common.reset') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <!-- Liste des messages -->
    <div v-else-if="filteredMessages.length > 0" class="space-y-4">
      <div
        v-for="message in filteredMessages"
        :key="message.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
      >
        <div class="p-6">
          <!-- Header du message -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <!-- Badge de gravité -->
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  getSeverityClass(message.severity)
                ]"
              >
                {{ t(`admin.incidentMessages.severity.${message.severity}`) }}
              </span>

              <!-- Badge de statut -->
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  message.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                ]"
              >
                {{ message.is_active ? t('admin.incidentMessages.status.active') : t('admin.incidentMessages.status.inactive') }}
              </span>

              <!-- Badge de type -->
              <span class="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 rounded-full text-xs font-medium">
                {{ getMessageType(message) }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <!-- Toggle actif/inactif -->
              <button
                @click="toggleMessageStatus(message)"
                :class="[
                  'p-2 rounded-lg transition-colors cursor-pointer',
                  message.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                ]"
                :title="message.is_active ? t('admin.incidentMessages.actions.deactivate') : t('admin.incidentMessages.actions.activate')"
              >
                <svg v-if="message.is_active" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>

              <!-- Modifier -->
              <button
                @click="openEditModal(message)"
                class="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg transition-colors cursor-pointer"
                :title="t('common.edit')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <!-- Supprimer -->
              <button
                @click="deleteMessage(message)"
                class="p-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 rounded-lg transition-colors cursor-pointer"
                :title="t('common.delete')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenu du message -->
          <div class="space-y-3">
            <!-- Événement -->
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">{{ t('admin.incidentMessages.event') }}:</span>
              <span class="ml-2">{{ getEventName(message.event_id) }}</span>
            </div>

            <!-- Organisation (si applicable) -->
            <div v-if="message.organization" class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="font-medium">{{ t('admin.incidentMessages.organization') }}:</span>
              <span class="ml-2">{{ message.organization.name }}</span>
            </div>

            <!-- Date (si applicable) -->
            <div v-if="message.day_date" class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">{{ t('admin.incidentMessages.dayDate') }}:</span>
              <span class="ml-2">{{ formatDate(message.day_date) }}</span>
            </div>

            <!-- Messages FR/EN -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">🇫🇷 Français</p>
                <p class="text-sm text-gray-900 dark:text-white">{{ message.message_fr }}</p>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">🇬🇧 English</p>
                <p class="text-sm text-gray-900 dark:text-white">{{ message.message_en }}</p>
              </div>
            </div>

            <!-- Métadonnées -->
            <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span>{{ t('admin.incidentMessages.createdAt') }}: {{ formatDateTime(message.created_at) }}</span>
              <span v-if="message.updated_at !== message.created_at">
                {{ t('admin.incidentMessages.updatedAt') }}: {{ formatDateTime(message.updated_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ t('admin.incidentMessages.noMessages') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ t('admin.incidentMessages.noMessagesDescription') }}
      </p>
      <div class="mt-6">
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ t('admin.incidentMessages.createFirst') }}
        </button>
      </div>
    </div>

    <!-- Modal de création/édition -->
    <MessageFormModal
      v-if="isModalOpen"
      :message="selectedMessage"
      :events="events"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import MessageFormModal from '@/components/admin/MessageFormModal.vue'

const { t, locale } = useI18n()
const { supabase } = useSupabase()

// État
const isLoading = ref(true)
const messages = ref([])
const events = ref([])
const isModalOpen = ref(false)
const selectedMessage = ref(null)

// Filtres
const filters = ref({
  eventId: null,
  severity: null,
  isActive: null
})

// Computed
const filteredMessages = computed(() => {
  let filtered = [...messages.value]

  if (filters.value.eventId) {
    filtered = filtered.filter(m => m.event_id === filters.value.eventId)
  }

  if (filters.value.severity) {
    filtered = filtered.filter(m => m.severity === filters.value.severity)
  }

  if (filters.value.isActive !== null) {
    filtered = filtered.filter(m => m.is_active === filters.value.isActive)
  }

  return filtered
})

// Méthodes
const loadMessages = async () => {
  try {
    isLoading.value = true

    const { data, error } = await supabase
      .from('incident_messages')
      .select(`
        *,
        organization:organizations(id, name, acronym)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    messages.value = data || []
  } catch (error) {
    console.error('Error loading messages:', error)
  } finally {
    isLoading.value = false
  }
}

const loadEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, year, acronym')
      .order('year', { ascending: false })

    if (error) throw error

    events.value = data || []
  } catch (error) {
    console.error('Error loading events:', error)
  }
}

const openCreateModal = () => {
  selectedMessage.value = null
  isModalOpen.value = true
}

const openEditModal = (message) => {
  selectedMessage.value = { ...message }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedMessage.value = null
}

const handleSave = async () => {
  await loadMessages()
  closeModal()
}

const toggleMessageStatus = async (message) => {
  try {
    const { error } = await supabase
      .from('incident_messages')
      .update({ is_active: !message.is_active })
      .eq('id', message.id)

    if (error) throw error

    await loadMessages()
  } catch (error) {
    console.error('Error toggling message status:', error)
    alert(t('admin.incidentMessages.errors.toggleFailed'))
  }
}

const deleteMessage = async (message) => {
  if (!confirm(t('admin.incidentMessages.confirmDelete'))) return

  try {
    const { error } = await supabase
      .from('incident_messages')
      .delete()
      .eq('id', message.id)

    if (error) throw error

    await loadMessages()
  } catch (error) {
    console.error('Error deleting message:', error)
    alert(t('admin.incidentMessages.errors.deleteFailed'))
  }
}

const resetFilters = () => {
  filters.value = {
    eventId: null,
    severity: null,
    isActive: null
  }
}

const getSeverityClass = (severity) => {
  const classes = {
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
  }
  return classes[severity] || classes.warning
}

const getMessageType = (message) => {
  if (message.organization_id && message.day_date) {
    return t('admin.incidentMessages.types.organizationAndDay')
  } else if (message.organization_id) {
    return t('admin.incidentMessages.types.organization')
  } else if (message.day_date) {
    return t('admin.incidentMessages.types.day')
  }
  return t('admin.incidentMessages.types.general')
}

const getEventName = (eventId) => {
  const event = events.value.find(e => e.id === eventId)
  return event ? `${event.title} ${event.year}` : '-'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadMessages(), loadEvents()])
})
</script>
