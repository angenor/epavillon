<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ $t('admin.createSession') }}
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
            :placeholder="$t('admin.sessionTitlePlaceholder')"
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
            :placeholder="$t('admin.sessionDescriptionPlaceholder')"
          ></textarea>
        </div>

        <!-- Date and Time -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('common.date') }} *
            </label>
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('common.time') }} *
            </label>
            <input
              v-model="form.time"
              type="time"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('common.duration') }} ({{ $t('common.minutes') }})
          </label>
          <input
            v-model.number="form.duration"
            type="number"
            min="30"
            step="30"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="120"
          />
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
            :placeholder="$t('admin.locationPlaceholder')"
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
            <option value="active">{{ $t('status.active') }}</option>
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
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
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
  date: '',
  time: '',
  duration: 120,
  location: '',
  status: 'draft'
})

// Methods
const handleSubmit = async () => {
  try {
    loading.value = true

    // Combine date and time
    const startDateTime = new Date(`${form.date}T${form.time}`)
    const endDateTime = new Date(startDateTime.getTime() + (form.duration * 60000))

    const sessionData = {
      title: form.title,
      description: form.description || null,
      category: props.category,
      start_date: startDateTime.toISOString(),
      end_date: endDateTime.toISOString(),
      location: form.location || null,
      status: form.status,
      created_at: new Date().toISOString()
    }

    const { data, error } = await from('negotiation_sessions').insert(sessionData).select().single()

    if (error) throw error

    emit('created', data)
  } catch (error) {
    console.error('Error creating session:', error)
    // TODO: Show error notification
  } finally {
    loading.value = false
  }
}
</script>