<template>
  <div class="relative min-h-[calc(100vh-4rem)]">
    <!-- Fixed background image -->
    <div
      class="fixed inset-x-0 top-16 bottom-0 bg-gray-900 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://www.aip.ci/wp-content/uploads/2025/07/Lancement-du-PACO-a-Abidjan.jpg')"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-green-950/65"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] py-6 px-4 sm:px-6 lg:py-8 lg:px-8">
      <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-center">

        <!-- Left: PACO Info -->
        <div class="lg:col-span-3">
          <PacoPresentation />
        </div>

        <!-- Right: Gateway panel -->
        <div class="lg:col-span-2">
          <div class="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">

            <!-- Loading state -->
            <div v-if="state === 'loading'" class="text-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white mx-auto mb-4"></div>
              <p class="text-white/60 text-sm">{{ t('paco.gateway.loading') }}</p>
            </div>

            <!-- Login state -->
            <template v-else-if="state === 'login'">
              <!-- Contextual header -->
              <div class="text-center mb-6">
                <div class="w-14 h-14 bg-blue-500/20 border border-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <font-awesome-icon :icon="['fas', 'lock']" class="text-blue-400 text-xl" />
                </div>
                <h2 class="text-xl font-bold text-white mb-1">
                  {{ t('paco.gateway.loginTitle') }}
                </h2>
                <p class="text-white/50 text-sm">
                  {{ t('paco.gateway.loginSubtitle') }}
                </p>
              </div>

              <!-- Email input (before showing PacoLoginForm) -->
              <div v-if="!gatewayEmail">
                <form @submit.prevent="handleGatewayEmailSubmit" class="space-y-4">
                  <div>
                    <label for="gateway-email" class="block text-sm font-medium text-white/70 mb-1">
                      {{ t('paco.emailCheck.emailLabel') }}
                    </label>
                    <input
                      id="gateway-email"
                      v-model="gatewayEmailInput"
                      type="email"
                      :placeholder="t('paco.emailCheck.emailPlaceholder')"
                      required
                      class="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    class="w-full cursor-pointer bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-xl transition"
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
            <div v-else-if="state === 'not-registered'" class="text-center py-4">
              <div class="w-14 h-14 bg-amber-500/20 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="text-amber-400 text-xl" />
              </div>
              <h2 class="text-xl font-bold text-white mb-2">
                {{ t('paco.gateway.notRegisteredTitle') }}
              </h2>
              <p class="text-white/50 text-sm mb-6 leading-relaxed">
                {{ t('paco.gateway.notRegisteredMessage') }}
              </p>
              <router-link
                to="/paco"
                class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-xl transition cursor-pointer"
              >
                <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                {{ t('paco.gateway.registerButton') }}
              </router-link>
            </div>

            <!-- Redirecting state -->
            <div v-else-if="state === 'redirecting'" class="text-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white mx-auto mb-4"></div>
              <p class="text-white/60 text-sm">{{ t('paco.gateway.redirecting') }}</p>
            </div>

            <!-- Error state -->
            <div v-if="errorMessage" class="mt-4 bg-red-500/15 border border-red-400/20 rounded-xl p-3">
              <p class="text-sm text-red-300">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
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
import PacoPresentation from '@/components/paco/PacoPresentation.vue'
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
