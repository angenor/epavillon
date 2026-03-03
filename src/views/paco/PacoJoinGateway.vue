<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto space-y-6">

      <!-- Loading state -->
      <div v-if="state === 'loading'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">{{ t('paco.gateway.loading') }}</p>
      </div>

      <!-- Login state -->
      <template v-else-if="state === 'login'">
        <!-- Contextual message -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <font-awesome-icon :icon="['fas', 'lock']" class="text-blue-600 dark:text-blue-400 text-2xl" />
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {{ t('paco.gateway.loginTitle') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('paco.gateway.loginSubtitle') }}
          </p>
        </div>

        <!-- Email input (before showing PacoLoginForm) -->
        <div v-if="!gatewayEmail" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
          <form @submit.prevent="handleGatewayEmailSubmit" class="space-y-4">
            <div>
              <label for="gateway-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('paco.emailCheck.emailLabel') }}
              </label>
              <input
                id="gateway-email"
                v-model="gatewayEmailInput"
                type="email"
                :placeholder="t('paco.emailCheck.emailPlaceholder')"
                required
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              class="w-full cursor-pointer bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
            >
              {{ t('paco.emailCheck.submit') }}
            </button>
          </form>
        </div>

        <!-- PacoLoginForm (after email entered) -->
        <PacoLoginForm
          v-else
          :email="gatewayEmail"
          @login-success="handleLoginSuccess"
          @back="gatewayEmail = ''"
        />
      </template>

      <!-- Not-registered state -->
      <div v-else-if="state === 'not-registered'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
        <div class="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="text-amber-600 dark:text-amber-400 text-2xl" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('paco.gateway.notRegisteredTitle') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ t('paco.gateway.notRegisteredMessage') }}
        </p>
        <router-link
          to="/paco"
          class="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition cursor-pointer"
        >
          <font-awesome-icon :icon="['fas', 'pen-to-square']" />
          {{ t('paco.gateway.registerButton') }}
        </router-link>
      </div>

      <!-- Redirecting state -->
      <div v-else-if="state === 'redirecting'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">{{ t('paco.gateway.redirecting') }}</p>
      </div>

      <!-- Error state -->
      <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-sm text-red-700 dark:text-red-400">{{ errorMessage }}</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { usePacoRegistration } from '@/composables/paco/usePacoRegistration'
import { PACO_TEAMS_LINK } from '@/composables/paco/constants'
import PacoLoginForm from '@/components/paco/PacoLoginForm.vue'

const { t } = useI18n()
const { isAuthenticated, user } = useAuth()
const { checkPacoRegistration } = usePacoRegistration()

// State machine: loading | login | not-registered | redirecting
const state = ref('loading')
const errorMessage = ref('')

// Login sub-state: email input before showing PacoLoginForm
const gatewayEmailInput = ref('')
const gatewayEmail = ref('')

function handleGatewayEmailSubmit() {
  gatewayEmail.value = gatewayEmailInput.value.trim()
}

/**
 * On mount: check auth + registration → determine initial state
 */
onMounted(async () => {
  await checkAndRoute()
})

async function checkAndRoute() {
  state.value = 'loading'
  errorMessage.value = ''

  try {
    if (!isAuthenticated.value || !user.value) {
      state.value = 'login'
      return
    }

    const registered = await checkPacoRegistration(user.value.id)
    if (registered) {
      state.value = 'redirecting'
      window.location.href = PACO_TEAMS_LINK
    } else {
      state.value = 'not-registered'
    }
  } catch (err) {
    console.error('Gateway check error:', err)
    errorMessage.value = t('paco.gateway.error')
    state.value = 'login'
  }
}

/**
 * Handle login success from PacoLoginForm → re-check registration
 */
async function handleLoginSuccess() {
  state.value = 'loading'
  errorMessage.value = ''

  try {
    // Small delay to let auth state propagate
    await new Promise(resolve => setTimeout(resolve, 500))

    const currentUser = user.value
    if (!currentUser) {
      state.value = 'login'
      return
    }

    const registered = await checkPacoRegistration(currentUser.id)
    if (registered) {
      state.value = 'redirecting'
      window.location.href = PACO_TEAMS_LINK
    } else {
      state.value = 'not-registered'
    }
  } catch (err) {
    console.error('Post-login check error:', err)
    errorMessage.value = t('paco.gateway.error')
  }
}
</script>
