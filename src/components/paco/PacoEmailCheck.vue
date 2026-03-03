<template>
  <div>
    <h2 class="text-xl font-bold text-white mb-1">
      {{ t('paco.emailCheck.title') }}
    </h2>
    <p class="text-sm text-white/50 mb-6">
      {{ t('paco.emailCheck.subtitle') }}
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="paco-email" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.emailCheck.emailLabel') }}
        </label>
        <input
          id="paco-email"
          v-model="email"
          type="email"
          :placeholder="t('paco.emailCheck.emailPlaceholder')"
          required
          class="w-full px-4 py-2.5 rounded-xl border bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm"
          :class="validationError ? 'border-red-400/50' : 'border-white/15'"
        />
        <p v-if="validationError" class="mt-1 text-sm text-red-300">
          {{ validationError }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full cursor-pointer bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
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
