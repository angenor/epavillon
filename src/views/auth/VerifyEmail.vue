<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md space-y-8 text-center">
      <!-- Logo -->
      <div>
        <img class="mx-auto h-24 w-auto" src="/logo-ifdd.png" :alt="t('common.logoAlt')">
      </div>

      <!-- Icône email -->
      <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900">
        <font-awesome-icon icon="envelope" class="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>

      <!-- Contenu -->
      <div class="space-y-4">
        <h1 class="text-3xl font-bold tracking-tight">
          {{ t('auth.verifyEmail.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('auth.verifyEmail.message') }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-500">
          {{ email }}
        </p>
      </div>

      <!-- Instructions -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left">
        <h2 class="font-medium mb-3">{{ t('auth.verifyEmail.instructions') }}</h2>
        <ol class="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>{{ t('auth.verifyEmail.step1') }}</li>
          <li>{{ t('auth.verifyEmail.step2') }}</li>
          <li>{{ t('auth.verifyEmail.step3') }}</li>
        </ol>
      </div>

      <!-- Actions -->
      <div class="space-y-4">
        <button
          @click="resendEmail"
          :disabled="loading || countdown > 0"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="loading" class="flex items-center">
            <font-awesome-icon icon="spinner" class="h-4 w-4 mr-2 animate-spin" />
            {{ t('auth.verifyEmail.resending') }}
          </span>
          <span v-else-if="countdown > 0">
            {{ t('auth.verifyEmail.resendIn', { seconds: countdown }) }}
          </span>
          <span v-else>
            {{ t('auth.verifyEmail.resendEmail') }}
          </span>
        </button>

        <router-link
          to="/login"
          class="text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
        >
          {{ t('auth.verifyEmail.backToLogin') }}
        </router-link>
      </div>

      <!-- Message de succès -->
      <div v-if="success" class="rounded-lg bg-green-50 dark:bg-green-900/50 p-4">
        <div class="flex justify-center">
          <div class="flex-shrink-0">
            <font-awesome-icon icon="check-circle" class="h-5 w-5 text-green-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-800 dark:text-green-300">{{ success }}</p>
          </div>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/50 p-4">
        <div class="flex justify-center">
          <div class="flex-shrink-0">
            <font-awesome-icon icon="circle-exclamation" class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const { auth } = useSupabase()

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const countdown = ref(0)
let countdownInterval = null

onMounted(() => {
  // Récupérer l'email depuis la session
  const user = auth.user?.value
  if (user) {
    email.value = user.email
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

const startCountdown = () => {
  countdown.value = 60
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
    }
  }, 1000)
}

const resendEmail = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const { error: resendError } = await auth.resend({
      type: 'signup',
      email: email.value
    })

    if (resendError) throw resendError

    success.value = t('auth.verifyEmail.emailSent')
    startCountdown()
  } catch (err) {
    console.error('Resend email error:', err)
    error.value = t('auth.verifyEmail.resendError')
  } finally {
    loading.value = false
  }
}
</script>