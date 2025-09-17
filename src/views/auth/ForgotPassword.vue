<template>
  <div class="min-h-screen relative flex items-center justify-center px-4 py-12">
    <!-- Image de fond avec repeat -->
    <div 
      class="absolute inset-0 z-0 dark:opacity-20"
      :style="{
        backgroundImage: 'url(/images/people-bg/people-bg-1.jpg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left'
      }"
    >
    </div>
    
    <!-- Contenu principal avec z-index élevé -->
    <div class="relative z-10 w-full max-w-md space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <img class="mx-auto h-24 w-auto" src="/logo-ifdd.png" :alt="t('common.logoAlt')">
        <h1 class="mt-6 text-3xl font-bold tracking-tight">
          {{ t('auth.forgotPassword.title') }}
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ t('auth.forgotPassword.subtitle') }}
        </p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleResetPassword" class="mt-8 space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium mb-2">
            {{ t('auth.fields.email') }}
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="appearance-none relative block w-full px-3 py-2 border rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
            :class="{
              'border-gray-300 dark:border-gray-600 focus:ring-green-500': !email || isEmailValid,
              'border-red-300 dark:border-red-500 focus:ring-red-500': email && !isEmailValid
            }"
            :placeholder="t('auth.placeholders.email')"
          >
        </div>

        <!-- Message de succès -->
        <div v-if="success" class="rounded-lg bg-green-50 dark:bg-green-900/50 p-4">
          <div class="flex">
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
          <div class="flex">
            <div class="flex-shrink-0">
              <font-awesome-icon icon="circle-exclamation" class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Boutons -->
        <div class="space-y-4">
          <button
            type="submit"
            :disabled="loading || success || !isEmailValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <font-awesome-icon icon="spinner" class="h-5 w-5 text-green-500 animate-spin" />
            </span>
            {{ loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.submit') }}
          </button>

          <router-link
            to="/login"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            {{ t('auth.forgotPassword.backToLogin') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const { auth } = useSupabase()

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

// Validation de l'email
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return email.value.trim() !== '' && emailRegex.test(email.value)
})

const handleResetPassword = async () => {
  if (!isEmailValid.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const { error: resetError } = await auth.resetPasswordForEmail(email.value, {
      redirectTo: 'https://epavillonclimatique.francophonie.org/reset-password'
    })

    if (resetError) throw resetError

    success.value = t('auth.forgotPassword.successMessage')
  } catch (err) {
    console.error('Password reset error:', err)

    // Si c'est une erreur de timeout du hook, ne pas bloquer la demande
    if (err.message?.includes('Failed to reach hook within maximum time')) {
      console.warn('Auth Hook timeout, but password reset email was likely sent')
      success.value = t('auth.forgotPassword.successMessage')
      return
    }

    if (err.message?.includes('after 16 seconds') || err.status === 429) {
      error.value = t('auth.errors.tooManyRequests')
    } else {
      error.value = t('auth.forgotPassword.errorMessage')
    }
  } finally {
    loading.value = false
  }
}
</script>