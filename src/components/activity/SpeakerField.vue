<template>
  <div class="mb-2">
    <!-- Display mode -->
    <div v-if="!editing" class="relative">
      <component
        :is="field === 'name' ? 'h4' : 'p'"
        @click="$emit('start-edit', speaker.id, field)"
        class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 -ml-2 rounded"
        :class="field === 'name' ? 'font-medium text-gray-900 dark:text-white' : 'text-sm text-gray-600 dark:text-gray-400'"
      >
        <template v-if="field === 'name'">
          {{ speaker.civility }} {{ speaker.first_name }} {{ speaker.last_name }}
        </template>
        <template v-else>
          {{ speaker[field] }}
        </template>
        <font-awesome-icon
          :icon="['fas', 'edit']"
          :class="field === 'name' ? 'ml-2 text-sm text-gray-400' : 'ml-2 text-xs text-gray-400'"
        />
      </component>
    </div>

    <!-- Edit mode -->
    <div v-else class="relative">
      <!-- Name field (special case with 3 inputs) -->
      <div v-if="field === 'name'" class="space-y-2">
        <div class="grid grid-cols-3 gap-2">
          <input
            v-model="tempValue.civility"
            @input="$emit('field-change', speaker.id, field)"
            placeholder="Civilité"
            class="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
          <input
            v-model="tempValue.first_name"
            @input="$emit('field-change', speaker.id, field)"
            placeholder="Prénom"
            class="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
          <input
            v-model="tempValue.last_name"
            @input="$emit('field-change', speaker.id, field)"
            placeholder="Nom"
            class="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
        </div>
        <div class="flex space-x-2">
          <button
            v-if="hasChanges"
            @click="$emit('save', speaker.id, field)"
            :disabled="saving"
            class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
          >
            <font-awesome-icon v-if="saving" :icon="['fas', 'spinner']" class="animate-spin" />
            <font-awesome-icon v-else :icon="['fas', 'save']" />
          </button>
          <button
            @click="$emit('cancel-edit', speaker.id, field)"
            class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer"
          >
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
      </div>

      <!-- Other fields (single input) -->
      <div v-else class="flex items-center space-x-2">
        <input
          v-model="tempValue[field]"
          @input="$emit('field-change', speaker.id, field)"
          :type="type"
          :placeholder="getPlaceholder(field)"
          class="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 flex-1"
        >
        <button
          v-if="hasChanges"
          @click="$emit('save', speaker.id, field)"
          :disabled="saving"
          class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
        >
          <font-awesome-icon v-if="saving" :icon="['fas', 'spinner']" class="animate-spin" />
          <font-awesome-icon v-else :icon="['fas', 'save']" />
        </button>
        <button
          @click="$emit('cancel-edit', speaker.id, field)"
          class="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer"
        >
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  speaker: {
    type: Object,
    required: true
  },
  field: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  editing: {
    type: Boolean,
    default: false
  },
  tempValue: {
    type: Object,
    default: () => ({})
  },
  hasChanges: {
    type: Boolean,
    default: false
  },
  saving: {
    type: Boolean,
    default: false
  }
})

defineEmits(['start-edit', 'cancel-edit', 'field-change', 'save'])

const getPlaceholder = (field) => {
  const placeholders = {
    position: t('events.positionPlaceholder'),
    organization: t('events.organizationPlaceholder'),
    email: t('events.emailPlaceholder')
  }
  return placeholders[field] || ''
}
</script>