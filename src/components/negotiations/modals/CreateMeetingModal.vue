<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ $t('admin.createMeeting') }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
        >
          <font-awesome-icon icon="times" class="w-6 h-6" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('common.title') }} *
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('admin.meetingTitlePlaceholder')"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('common.description') }}
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('admin.meetingDescriptionPlaceholder')"
          ></textarea>
        </div>

        <!-- Meeting Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.meetingType') }} *
          </label>
          <select
            v-model="form.meeting_type"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
          >
            <option value="">{{ $t('admin.selectMeetingType') }}</option>
            <option value="conference">{{ $t('admin.meetingTypes.conference') }}</option>
            <option value="workshop">{{ $t('admin.meetingTypes.workshop') }}</option>
            <option value="summit">{{ $t('admin.meetingTypes.summit') }}</option>
            <option value="roundtable">{{ $t('admin.meetingTypes.roundtable') }}</option>
            <option value="forum">{{ $t('admin.meetingTypes.forum') }}</option>
            <option value="webinar">{{ $t('admin.meetingTypes.webinar') }}</option>
          </select>
        </div>

        <!-- Date and Time -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('common.startDate') }} *
            </label>
            <input
              v-model="form.start_date"
              type="datetime-local"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('common.endDate') }} *
            </label>
            <input
              v-model="form.end_date"
              type="datetime-local"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('common.location') }}
          </label>
          <input
            v-model="form.location"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('admin.meetingLocationPlaceholder')"
          />
        </div>

        <!-- Virtual Meeting Info -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-3">
            {{ $t('admin.virtualMeetingInfo') }}
          </h4>

          <!-- Meeting Platform -->
          <div class="mb-3">
            <label class="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
              {{ $t('admin.meetingPlatform') }}
            </label>
            <select
              v-model="form.platform"
              class="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-blue-900/30 dark:text-blue-100 cursor-pointer"
            >
              <option value="">{{ $t('admin.selectPlatform') }}</option>
              <option value="zoom">Zoom</option>
              <option value="teams">Microsoft Teams</option>
              <option value="meet">Google Meet</option>
              <option value="webex">Cisco Webex</option>
              <option value="other">{{ $t('admin.other') }}</option>
            </select>
          </div>

          <!-- Meeting URL -->
          <div class="mb-3">
            <label class="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
              {{ $t('admin.meetingUrl') }}
            </label>
            <input
              v-model="form.meeting_url"
              type="url"
              class="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-blue-900/30 dark:text-blue-100"
              :placeholder="$t('admin.meetingUrlPlaceholder')"
            />
          </div>

          <!-- Meeting ID -->
          <div>
            <label class="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
              {{ $t('admin.meetingId') }}
            </label>
            <input
              v-model="form.meeting_id"
              type="text"
              class="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-blue-900/30 dark:text-blue-100"
              :placeholder="$t('admin.meetingIdPlaceholder')"
            />
          </div>
        </div>

        <!-- Organizer -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.organizer') }}
          </label>
          <input
            v-model="form.organizer"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('admin.organizerPlaceholder')"
          />
        </div>

        <!-- Max Participants -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.maxParticipants') }}
          </label>
          <input
            v-model.number="form.max_participants"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="100"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('common.status') }}
          </label>
          <select
            v-model="form.status"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
          >
            <option value="draft">{{ $t('status.draft') }}</option>
            <option value="published">{{ $t('status.published') }}</option>
            <option value="registration_open">{{ $t('status.registrationOpen') }}</option>
            <option value="registration_closed">{{ $t('status.registrationClosed') }}</option>
            <option value="cancelled">{{ $t('status.cancelled') }}</option>
            <option value="completed">{{ $t('status.completed') }}</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 cursor-pointer"
          >
            <font-awesome-icon v-if="loading" icon="spinner" spin class="mr-2" />
            {{ loading ? $t('common.creating') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

// Props
const props = defineProps({
  category: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'created'])

// Composables
const { from } = useSupabase()

// State
const loading = ref(false)
const form = reactive({
  title: '',
  description: '',
  meeting_type: '',
  start_date: '',
  end_date: '',
  location: '',
  platform: '',
  meeting_url: '',
  meeting_id: '',
  organizer: '',
  max_participants: null,
  status: 'draft'
})

// Methods
const handleSubmit = async () => {
  try {
    loading.value = true

    const meetingData = {
      title: form.title,
      description: form.description || null,
      category: props.category,
      type: 'francophonie_meetings',
      event_type: form.meeting_type,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      location: form.location || null,
      virtual_details: {
        platform: form.platform || null,
        meeting_url: form.meeting_url || null,
        meeting_id: form.meeting_id || null
      },
      organizer: form.organizer || null,
      max_participants: form.max_participants,
      status: form.status,
      created_at: new Date().toISOString()
    }

    const { data, error } = await from('events').insert(meetingData).select().single()

    if (error) throw error

    emit('created', data)
  } catch (error) {
    console.error('Error creating meeting:', error)
    // TODO: Show error notification
  } finally {
    loading.value = false
  }
}
</script>