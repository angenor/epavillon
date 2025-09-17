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
          {{ t('auth.resetPassword.title') }}
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ t('auth.resetPassword.subtitle') }}
        </p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleResetPassword" class="mt-8 space-y-6 bg-white text-black dark:text-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <!-- Nouveau mot de passe -->
        <div>
          <label for="password" class="block text-sm font-medium mb-2">
            {{ t('auth.fields.newPassword') }}
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              :placeholder="t('auth.placeholders.newPassword')"
              @input="checkPasswordStrength"
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
          <!-- Indicateur de force du mot de passe -->
          <div v-if="form.password" class="mt-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-gray-500">{{ t('auth.register.passwordStrength') }}</span>
              <span class="text-xs font-medium" :class="passwordStrengthColor">
                {{ passwordStrengthText }}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="passwordStrengthColor"
                :style="{ width: `${passwordStrength}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Confirmer mot de passe -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium mb-2">
            {{ t('auth.fields.confirmNewPassword') }}
          </label>
          <div class="relative">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              class="appearance-none relative block w-full px-3 py-2 pr-10 border rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-colors"
              :class="confirmPasswordClasses"
              :placeholder="t('auth.placeholders.confirmNewPassword')"
              @input="checkPasswordMatch"
            >
            <!-- Icône de validation -->
            <div v-if="form.confirmPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <font-awesome-icon
                v-if="passwordsMatch"
                icon="check-circle"
                class="h-5 w-5 text-green-500"
              />
              <font-awesome-icon
                v-else
                icon="times-circle"
                class="h-5 w-5 text-red-500"
              />
            </div>
          </div>
          <!-- Message d'erreur -->
          <p v-if="form.confirmPassword && !passwordsMatch" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ t('auth.errors.passwordsDontMatch') }}
          </p>
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

        <!-- Bouton de soumission -->
        <div>
          <button
            type="submit"
            :disabled="loading || !formIsValid"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <font-awesome-icon icon="spinner" class="h-5 w-5 text-green-500 animate-spin" />
            </span>
            {{ loading ? t('auth.resetPassword.resetting') : t('auth.resetPassword.submit') }}
          </button>
        </div>

        <!-- Lien retour -->
        <div class="text-center">
          <router-link to="/login" class="text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
            {{ t('auth.resetPassword.backToLogin') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { auth } = useSupabase()

const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const passwordStrength = ref(0)
const passwordsMatch = ref(true)

const form = reactive({
  password: '',
  confirmPassword: ''
})

// Vérification du token au montage
onMounted(async () => {
  // Vérifier si on a un access_token dans l'URL (après redirection de Supabase)
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const accessToken = hashParams.get('access_token')

  if (!accessToken) {
    error.value = t('auth.resetPassword.invalidToken')
    setTimeout(() => {
      router.push('/forgot-password')
    }, 5000)
  }
})

// Vérification de la force du mot de passe
const checkPasswordStrength = () => {
  const password = form.password
  let strength = 0

  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 25
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 12.5
  if (/[^A-Za-z0-9]/.test(password)) strength += 12.5

  passwordStrength.value = strength

  // Vérifier aussi la correspondance si confirmPassword est rempli
  if (form.confirmPassword) {
    checkPasswordMatch()
  }
}

// Vérification de la correspondance des mots de passe
const checkPasswordMatch = () => {
  passwordsMatch.value = form.password === form.confirmPassword
}

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 25) return t('auth.register.weak')
  if (passwordStrength.value < 50) return t('auth.register.fair')
  if (passwordStrength.value < 75) return t('auth.register.good')
  return t('auth.register.strong')
})

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 25) return 'text-red-600 bg-red-600'
  if (passwordStrength.value < 50) return 'text-orange-600 bg-orange-600'
  if (passwordStrength.value < 75) return 'text-yellow-600 bg-yellow-600'
  return 'text-green-600 bg-green-600'
})

const confirmPasswordClasses = computed(() => {
  if (!form.confirmPassword) {
    return 'border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-transparent'
  }

  if (passwordsMatch.value) {
    return 'border-green-500 dark:border-green-500 focus:ring-green-500 focus:border-green-500'
  } else {
    return 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
  }
})

const formIsValid = computed(() => {
  return (
    form.password &&
    form.password === form.confirmPassword &&
    passwordStrength.value >= 50
  )
})

const handleResetPassword = async () => {
  if (!formIsValid.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    // Mettre à jour le mot de passe
    const { error: updateError } = await auth.updateUser({
      password: form.password
    })

    if (updateError) throw updateError

    success.value = t('auth.resetPassword.successMessage')

    // Redirection après 2 secondes
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    console.error('Password reset error:', err)
    error.value = t('auth.resetPassword.errorMessage')
  } finally {
    loading.value = false
  }
}
</script>
