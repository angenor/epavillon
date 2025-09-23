<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ t('events.addNewSpeaker') }}
          </h3>
          <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>

        <form @submit.prevent="$emit('submit')" class="space-y-4">
          <!-- Civilité -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('events.civility') }}
            </label>
            <select
              :value="form.civility"
              @input="$emit('update:form', { ...form, civility: $event.target.value })"
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
            >
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
              <option value="Dr">Dr</option>
              <option value="Pr">Pr</option>
            </select>
          </div>

          <!-- Prénom -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('events.firstName') }} *
            </label>
            <input
              :value="form.first_name"
              @input="$emit('update:form', { ...form, first_name: $event.target.value })"
              type="text"
              required
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              :placeholder="t('events.firstNamePlaceholder')"
            >
          </div>

          <!-- Nom -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('events.lastName') }} *
            </label>
            <input
              :value="form.last_name"
              @input="$emit('update:form', { ...form, last_name: $event.target.value })"
              type="text"
              required
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              :placeholder="t('events.lastNamePlaceholder')"
            >
          </div>

          <!-- Poste -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('events.position') }} *
            </label>
            <input
              :value="form.position"
              @input="$emit('update:form', { ...form, position: $event.target.value })"
              type="text"
              required
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              :placeholder="t('events.positionPlaceholder')"
            >
          </div>

          <!-- Organisation -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('events.organization') }} *
            </label>
            <input
              :value="form.organization"
              @input="$emit('update:form', { ...form, organization: $event.target.value })"
              type="text"
              required
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              :placeholder="t('events.organizationPlaceholder')"
            >
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('events.email') }} *
            </label>
            <input
              :value="form.email"
              @input="$emit('update:form', { ...form, email: $event.target.value })"
              type="email"
              required
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              :placeholder="t('events.emailPlaceholder')"
            >
          </div>

          <!-- Buttons -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="$emit('cancel')"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors cursor-pointer"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce disabled:opacity-50 transition-colors cursor-pointer"
            >
              <font-awesome-icon v-if="saving" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
              {{ t('events.addSpeaker') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  form: {
    type: Object,
    required: true
  },
  saving: {
    type: Boolean,
    default: false
  }
})

defineEmits(['submit', 'cancel', 'update:form'])
</script>