<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
      {{ t('paco.emailCheck.title') }}
    </h2>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
      {{ t('paco.emailCheck.subtitle') }}
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="paco-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ t('paco.emailCheck.emailLabel') }}
        </label>
        <input
          id="paco-email"
          v-model="email"
          type="email"
          :placeholder="t('paco.emailCheck.emailPlaceholder')"
          required
          class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
          :class="{ 'border-red-500 dark:border-red-400': validationError }"
        />
        <p v-if="validationError" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ validationError }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full cursor-pointer bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? t('paco.emailCheck.checking') : t('paco.emailCheck.submit') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['email-checked'])

const email = ref('')
const validationError = ref('')

const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

const handleSubmit = () => {
  validationError.value = ''

  const trimmed = email.value.trim()
  if (!trimmed || !isValidEmail(trimmed)) {
    validationError.value = t('paco.emailCheck.invalidEmail')
    return
  }

  emit('email-checked', trimmed)
}
</script>
