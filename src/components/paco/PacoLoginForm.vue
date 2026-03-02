<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
      {{ t('paco.login.title') }}
    </h2>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
      {{ t('paco.login.subtitle') }}
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email (pre-filled, read-only) -->
      <div>
        <label for="paco-login-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ t('paco.emailCheck.emailLabel') }}
        </label>
        <input
          id="paco-login-email"
          :value="email"
          type="email"
          readonly
          class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 outline-none cursor-not-allowed"
        />
      </div>

      <!-- Password -->
      <div>
        <label for="paco-login-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ t('paco.login.passwordLabel') }}
        </label>
        <input
          id="paco-login-password"
          v-model="password"
          type="password"
          :placeholder="t('paco.login.passwordPlaceholder')"
          required
          class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
        />
      </div>

      <!-- Error message -->
      <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="submitting"
        class="w-full cursor-pointer bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ submitting ? t('paco.login.submitting') : t('paco.login.submit') }}
      </button>

      <!-- Forgot password + back -->
      <div class="flex justify-between items-center">
        <router-link
          to="/forgot-password"
          class="text-sm text-green-700 dark:text-green-400 hover:underline"
        >
          {{ t('paco.login.forgotPassword') }}
        </router-link>
        <button
          type="button"
          @click="$emit('back')"
          class="text-sm text-green-700 dark:text-green-400 hover:underline cursor-pointer"
        >
          {{ t('paco.login.backToEmail') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/composables/useSupabase'

const { t } = useI18n()

const props = defineProps({
  email: { type: String, required: true }
})

const emit = defineEmits(['login-success', 'back'])

const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: props.email,
      password: password.value
    })

    if (error) {
      errorMessage.value = t('paco.login.error')
      return
    }

    emit('login-success', {
      userId: data.user.id,
      email: data.user.email
    })
  } catch (err) {
    console.error('Login error:', err)
    errorMessage.value = t('paco.login.error')
  } finally {
    submitting.value = false
  }
}
</script>
