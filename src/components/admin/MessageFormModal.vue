<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="relative inline-block w-full max-w-3xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ isEditing ? t('admin.incidentMessages.modal.editTitle') : t('admin.incidentMessages.modal.createTitle') }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Événement -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.incidentMessages.form.event') }} <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.event_id"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option :value="null" disabled>{{ t('admin.incidentMessages.form.selectEvent') }}</option>
              <option v-for="event in events" :key="event.id" :value="event.id">
                {{ event.title }} {{ event.year }}
              </option>
            </select>
          </div>

          <!-- Type de message -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.incidentMessages.form.messageType') }}
            </label>
            <div class="grid grid-cols-3 gap-4">
              <button
                type="button"
                @click="setMessageType('general')"
                :class="[
                  'p-3 border-2 rounded-lg transition-all cursor-pointer',
                  messageType === 'general'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                ]"
              >
                <div class="text-center">
                  <svg class="w-6 h-6 mx-auto mb-2" :class="messageType === 'general' ? 'text-orange-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm font-medium" :class="messageType === 'general' ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'">
                    {{ t('admin.incidentMessages.types.general') }}
                  </p>
                </div>
              </button>

              <button
                type="button"
                @click="setMessageType('organization')"
                :class="[
                  'p-3 border-2 rounded-lg transition-all cursor-pointer',
                  messageType === 'organization'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                ]"
              >
                <div class="text-center">
                  <svg class="w-6 h-6 mx-auto mb-2" :class="messageType === 'organization' ? 'text-orange-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p class="text-sm font-medium" :class="messageType === 'organization' ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'">
                    {{ t('admin.incidentMessages.types.organization') }}
                  </p>
                </div>
              </button>

              <button
                type="button"
                @click="setMessageType('day')"
                :class="[
                  'p-3 border-2 rounded-lg transition-all cursor-pointer',
                  messageType === 'day'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                ]"
              >
                <div class="text-center">
                  <svg class="w-6 h-6 mx-auto mb-2" :class="messageType === 'day' ? 'text-orange-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm font-medium" :class="messageType === 'day' ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'">
                    {{ t('admin.incidentMessages.types.day') }}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <!-- Organisation (si type = organization) -->
          <div v-if="messageType === 'organization'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.incidentMessages.form.organization') }} <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.organization_id"
              :required="messageType === 'organization'"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              @focus="loadOrganizations"
            >
              <option :value="null" disabled>{{ t('admin.incidentMessages.form.selectOrganization') }}</option>
              <option v-for="org in organizations" :key="org.id" :value="org.id">
                {{ org.name }} {{ org.acronym ? `(${org.acronym})` : '' }}
              </option>
            </select>
          </div>

          <!-- Date (si type = day) -->
          <div v-if="messageType === 'day'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.incidentMessages.form.dayDate') }} <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              v-model="form.day_date"
              :required="messageType === 'day'"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
          </div>

          <!-- Gravité -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.incidentMessages.form.severity') }} <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-4">
              <button
                type="button"
                @click="form.severity = 'info'"
                :class="[
                  'p-4 border-2 rounded-lg transition-all cursor-pointer',
                  form.severity === 'info'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                ]"
              >
                <div class="text-center">
                  <svg class="w-8 h-8 mx-auto mb-2" :class="form.severity === 'info' ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm font-medium" :class="form.severity === 'info' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'">
                    {{ t('admin.incidentMessages.severity.info') }}
                  </p>
                </div>
              </button>

              <button
                type="button"
                @click="form.severity = 'warning'"
                :class="[
                  'p-4 border-2 rounded-lg transition-all cursor-pointer',
                  form.severity === 'warning'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                ]"
              >
                <div class="text-center">
                  <svg class="w-8 h-8 mx-auto mb-2" :class="form.severity === 'warning' ? 'text-orange-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p class="text-sm font-medium" :class="form.severity === 'warning' ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'">
                    {{ t('admin.incidentMessages.severity.warning') }}
                  </p>
                </div>
              </button>

              <button
                type="button"
                @click="form.severity = 'error'"
                :class="[
                  'p-4 border-2 rounded-lg transition-all cursor-pointer',
                  form.severity === 'error'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                ]"
              >
                <div class="text-center">
                  <svg class="w-8 h-8 mx-auto mb-2" :class="form.severity === 'error' ? 'text-red-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm font-medium" :class="form.severity === 'error' ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'">
                    {{ t('admin.incidentMessages.severity.error') }}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <!-- Message FR -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🇫🇷 {{ t('admin.incidentMessages.form.messageFr') }} <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.message_fr"
              required
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              :placeholder="t('admin.incidentMessages.form.messageFrPlaceholder')"
            ></textarea>
          </div>

          <!-- Message EN -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🇬🇧 {{ t('admin.incidentMessages.form.messageEn') }} <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.message_en"
              required
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              :placeholder="t('admin.incidentMessages.form.messageEnPlaceholder')"
            ></textarea>
          </div>

          <!-- Actif -->
          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="form.is_active"
              id="is_active"
              class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
            >
            <label for="is_active" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {{ t('admin.incidentMessages.form.isActive') }}
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {{ isSaving ? t('common.saving') : (isEditing ? t('common.save') : t('common.create')) }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const props = defineProps({
  message: {
    type: Object,
    default: null
  },
  events: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const { t } = useI18n()
const { supabase } = useSupabase()

// État
const isSaving = ref(false)
const organizations = ref([])
const messageType = ref('general')

const form = ref({
  event_id: null,
  organization_id: null,
  day_date: null,
  message_fr: '',
  message_en: '',
  severity: 'warning',
  is_active: true
})

// Computed
const isEditing = computed(() => !!props.message)

// Méthodes
const setMessageType = (type) => {
  messageType.value = type

  // Réinitialiser les champs non utilisés
  if (type !== 'organization') {
    form.value.organization_id = null
  }
  if (type !== 'day') {
    form.value.day_date = null
  }
}

const loadOrganizations = async () => {
  if (organizations.value.length > 0) return

  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, acronym')
      .order('name')

    if (error) throw error

    organizations.value = data || []
  } catch (error) {
    console.error('Error loading organizations:', error)
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true

    const payload = {
      event_id: form.value.event_id,
      organization_id: form.value.organization_id,
      day_date: form.value.day_date,
      message_fr: form.value.message_fr,
      message_en: form.value.message_en,
      severity: form.value.severity,
      is_active: form.value.is_active
    }

    let error

    if (isEditing.value) {
      // Mise à jour
      const result = await supabase
        .from('incident_messages')
        .update(payload)
        .eq('id', props.message.id)

      error = result.error
    } else {
      // Création
      const result = await supabase
        .from('incident_messages')
        .insert([payload])

      error = result.error
    }

    if (error) throw error

    emit('save')
  } catch (error) {
    console.error('Error saving message:', error)
    alert(t('admin.incidentMessages.errors.saveFailed'))
  } finally {
    isSaving.value = false
  }
}

// Initialisation
if (props.message) {
  form.value = {
    event_id: props.message.event_id,
    organization_id: props.message.organization_id,
    day_date: props.message.day_date,
    message_fr: props.message.message_fr,
    message_en: props.message.message_en,
    severity: props.message.severity,
    is_active: props.message.is_active
  }

  // Déterminer le type de message
  if (props.message.organization_id) {
    messageType.value = 'organization'
    loadOrganizations()
  } else if (props.message.day_date) {
    messageType.value = 'day'
  }
}
</script>
