<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ $t('admin.createTraining') }}
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
            :placeholder="$t('admin.trainingTitlePlaceholder')"
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
            :placeholder="$t('admin.trainingDescriptionPlaceholder')"
          ></textarea>
        </div>

        <!-- Training Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.trainingType') }} *
          </label>
          <select
            v-model="form.training_type"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
          >
            <option value="">{{ $t('admin.selectTrainingType') }}</option>
            <option value="workshop">{{ $t('admin.trainingTypes.workshop') }}</option>
            <option value="course">{{ $t('admin.trainingTypes.course') }}</option>
            <option value="seminar">{{ $t('admin.trainingTypes.seminar') }}</option>
            <option value="certification">{{ $t('admin.trainingTypes.certification') }}</option>
            <option value="bootcamp">{{ $t('admin.trainingTypes.bootcamp') }}</option>
            <option value="webinar">{{ $t('admin.trainingTypes.webinar') }}</option>
          </select>
        </div>

        <!-- Level -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.trainingLevel') }} *
          </label>
          <select
            v-model="form.level"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
          >
            <option value="">{{ $t('admin.selectLevel') }}</option>
            <option value="beginner">{{ $t('admin.levels.beginner') }}</option>
            <option value="intermediate">{{ $t('admin.levels.intermediate') }}</option>
            <option value="advanced">{{ $t('admin.levels.advanced') }}</option>
            <option value="expert">{{ $t('admin.levels.expert') }}</option>
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

        <!-- Duration and Price -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('admin.duration') }} ({{ $t('common.hours') }})
            </label>
            <input
              v-model.number="form.duration_hours"
              type="number"
              min="1"
              step="0.5"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="8"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('admin.price') }} ({{ $t('common.currency') }})
            </label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
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
            :placeholder="$t('admin.trainingLocationPlaceholder')"
          />
        </div>

        <!-- Instructor -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.instructor') }}
          </label>
          <input
            v-model="form.instructor"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('admin.instructorPlaceholder')"
          />
        </div>

        <!-- Prerequisites -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.prerequisites') }}
          </label>
          <textarea
            v-model="form.prerequisites"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('admin.prerequisitesPlaceholder')"
          ></textarea>
        </div>

        <!-- Learning Objectives -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.learningObjectives') }}
          </label>
          <textarea
            v-model="form.learning_objectives"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('admin.learningObjectivesPlaceholder')"
          ></textarea>
        </div>

        <!-- Virtual Training Info -->
        <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
          <h4 class="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-3">
            {{ $t('admin.virtualTrainingInfo') }}
          </h4>

          <!-- Meeting Platform -->
          <div class="mb-3">
            <label class="block text-xs font-medium text-indigo-800 dark:text-indigo-300 mb-1">
              {{ $t('admin.platform') }}
            </label>
            <select
              v-model="form.platform"
              class="w-full px-3 py-2 text-sm border border-indigo-200 dark:border-indigo-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-100 cursor-pointer"
            >
              <option value="">{{ $t('admin.selectPlatform') }}</option>
              <option value="zoom">Zoom</option>
              <option value="teams">Microsoft Teams</option>
              <option value="meet">Google Meet</option>
              <option value="webex">Cisco Webex</option>
              <option value="moodle">Moodle</option>
              <option value="other">{{ $t('admin.other') }}</option>
            </select>
          </div>

          <!-- Access URL -->
          <div>
            <label class="block text-xs font-medium text-indigo-800 dark:text-indigo-300 mb-1">
              {{ $t('admin.accessUrl') }}
            </label>
            <input
              v-model="form.access_url"
              type="url"
              class="w-full px-3 py-2 text-sm border border-indigo-200 dark:border-indigo-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-100"
              :placeholder="$t('admin.accessUrlPlaceholder')"
            />
          </div>
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
            placeholder="30"
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
            <option value="in_progress">{{ $t('status.inProgress') }}</option>
            <option value="completed">{{ $t('status.completed') }}</option>
            <option value="cancelled">{{ $t('status.cancelled') }}</option>
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
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
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
  training_type: '',
  level: '',
  start_date: '',
  end_date: '',
  duration_hours: null,
  price: 0,
  location: '',
  instructor: '',
  prerequisites: '',
  learning_objectives: '',
  platform: '',
  access_url: '',
  max_participants: null,
  status: 'draft'
})

// Methods
const handleSubmit = async () => {
  try {
    loading.value = true

    const trainingData = {
      title: form.title,
      description: form.description || null,
      category: props.category,
      type: 'trainings',
      event_type: form.training_type,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      location: form.location || null,
      instructor: form.instructor || null,
      level: form.level,
      duration_hours: form.duration_hours,
      price: form.price || 0,
      prerequisites: form.prerequisites || null,
      learning_objectives: form.learning_objectives || null,
      virtual_details: {
        platform: form.platform || null,
        access_url: form.access_url || null
      },
      max_participants: form.max_participants,
      status: form.status,
      created_at: new Date().toISOString()
    }

    const { data, error } = await from('events').insert(trainingData).select().single()

    if (error) throw error

    emit('created', data)
  } catch (error) {
    console.error('Error creating training:', error)
    // TODO: Show error notification
  } finally {
    loading.value = false
  }
}
</script>