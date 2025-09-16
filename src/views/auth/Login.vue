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
        <h1 class="mt-6 text-3xl font-bold tracking-tight text-black dark:text-white">
          {{ t('auth.login.title') }}
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ t('auth.login.subtitle') }}
          <router-link to="/register" class="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
            {{ t('auth.login.createAccount') }}
          </router-link>
        </p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-5 text-black dark:text-white">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium mb-2">
              {{ t('auth.fields.email') }}
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              :placeholder="t('auth.placeholders.email')"
            >
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-medium mb-2">
              {{ t('auth.fields.password') }}
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                :placeholder="t('auth.placeholders.password')"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <font-awesome-icon
                  :icon="showPassword ? ['far', 'eye-slash'] : ['far', 'eye']"
                  class="h-5 w-5 text-gray-400"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Remember me & Forgot password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            >
            <label for="remember-me" class="ml-2 block text-sm text-black dark:text-white">
              {{ t('auth.login.rememberMe') }}
            </label>
          </div>

          <div class="text-sm">
            <router-link to="/forgot-password" class="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
              {{ t('auth.login.forgotPassword') }}
            </router-link>
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

        <!-- Bouton de connexion -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <font-awesome-icon icon="spinner" class="h-5 w-5 text-green-500 animate-spin" />
            </span>
            {{ loading ? t('auth.login.loggingIn') : t('auth.login.submit') }}
          </button>
        </div>

        <!-- Séparateur -->
        <!-- <div class="relative mt-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">
              {{ t('auth.login.orContinueWith') }}
            </span>
          </div>
        </div> -->

        <!-- Connexion sociale -->
        <!-- <div class="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            @click="handleGoogleLogin"
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <font-awesome-icon :icon="['fab', 'google']" class="h-5 w-5" />
            <span class="ml-2">Google</span>
          </button>

          <button
            type="button"
            @click="handleMicrosoftLogin"
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <font-awesome-icon :icon="['fab', 'microsoft']" class="h-5 w-5" />
            <span class="ml-2">Microsoft</span>
          </button>
        </div> -->
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const router = useRouter()
const { auth } = useSupabase()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const { data, error: signInError } = await auth.signInWithPassword({
      email: form.email,
      password: form.password
    })

    if (signInError) throw signInError

    // Si l'utilisateur a coché "Se souvenir de moi", on garde la session plus longtemps
    if (!form.rememberMe) {
      // Session courte par défaut
      await auth.updateSession({ expiresIn: 3600 }) // 1 heure
    }

    // Redirection après connexion réussie
    router.push('/')
  } catch (err) {
    console.error('Login error:', err)
    error.value = t('auth.errors.invalidCredentials')
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    const { error } = await auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  } catch (err) {
    console.error('Google login error:', err)
    error.value = t('auth.errors.socialLoginFailed')
  }
}

const handleMicrosoftLogin = async () => {
  try {
    const { error } = await auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  } catch (err) {
    console.error('Microsoft login error:', err)
    error.value = t('auth.errors.socialLoginFailed')
  }
}
</script>
