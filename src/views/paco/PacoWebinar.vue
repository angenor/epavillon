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

        <!-- Right: Action panel -->
        <div class="lg:col-span-2">
          <div class="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">

            <!-- Loading -->
            <div v-if="pageLoading" class="text-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white mx-auto mb-4"></div>
              <p class="text-white/60 text-sm">{{ t('paco.emailCheck.checking') }}</p>
            </div>

            <!-- Step: email-check -->
            <PacoEmailCheck
              v-else-if="step === 'email-check'"
              :loading="emailCheckLoading"
              @email-checked="handleEmailChecked"
            />

            <!-- Step: login -->
            <PacoLoginForm
              v-else-if="step === 'login'"
              :email="checkedEmail"
              @login-success="handleLoginSuccess"
              @back="resetToEmailCheck"
            />

            <!-- Step: register -->
            <PacoRegisterForm
              v-else-if="step === 'register'"
              :email="checkedEmail"
              @register-success="handleRegisterSuccess"
              @back="resetToEmailCheck"
            />

            <!-- Step: activity-register -->
            <PacoActivityRegister
              v-else-if="step === 'activity-register'"
              :user="user"
              :profile="profile"
              @registration-complete="handleActivityRegistrationComplete"
            />

            <!-- Step: success -->
            <div v-else-if="step === 'success'" class="text-center py-4">
              <div class="w-16 h-16 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <font-awesome-icon :icon="['fas', 'check']" class="text-green-400 text-2xl" />
              </div>
              <h2 class="text-xl font-bold text-white mb-2">
                {{ t('paco.success.title') }}
              </h2>
              <p class="text-white/60 text-sm mb-4 leading-relaxed">
                {{ t('paco.success.message') }}
              </p>
              <p class="text-sm text-green-400 font-medium">
                <font-awesome-icon :icon="['fas', 'envelope']" class="mr-1" />
                {{ t('paco.success.checkEmail') }}
              </p>
            </div>

            <!-- Step: join -->
            <PacoJoinSection v-else-if="step === 'join'" />

            <!-- Error -->
            <div v-if="globalError" class="mt-4 bg-red-500/15 border border-red-400/20 rounded-xl p-3">
              <p class="text-sm text-red-300">{{ globalError }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { usePacoRegistration } from '@/composables/paco/usePacoRegistration'
import { usePacoEmail } from '@/composables/paco/usePacoEmail'
import PacoPresentation from '@/components/paco/PacoPresentation.vue'
import PacoEmailCheck from '@/components/paco/PacoEmailCheck.vue'
import PacoLoginForm from '@/components/paco/PacoLoginForm.vue'
import PacoRegisterForm from '@/components/paco/PacoRegisterForm.vue'
import PacoActivityRegister from '@/components/paco/PacoActivityRegister.vue'
import PacoJoinSection from '@/components/paco/PacoJoinSection.vue'

const { t } = useI18n()

// Auth state
const { isAuthenticated, user, profile } = useAuth()

// PACO composables
const { checkEmailExists, checkPacoRegistration, registerForPaco } = usePacoRegistration()
const { sendPacoEmail } = usePacoEmail()

// State machine
const step = ref('email-check') // email-check | login | register | activity-register | success | join
const pageLoading = ref(true)
const emailCheckLoading = ref(false)
const checkedEmail = ref('')
const globalError = ref('')

/**
 * On mount: check if already authenticated and registered
 */
onMounted(async () => {
  await checkInitialState()
})

// Watch for auth state changes (e.g. login from another tab)
watch(isAuthenticated, async (newVal) => {
  if (newVal && step.value === 'email-check') {
    await checkInitialState()
  }
})

async function checkInitialState() {
  pageLoading.value = true
  globalError.value = ''

  try {
    if (isAuthenticated.value && user.value) {
      const registered = await checkPacoRegistration(user.value.id)
      step.value = registered ? 'join' : 'activity-register'
    } else {
      step.value = 'email-check'
    }
  } catch (err) {
    console.error('Error checking initial state:', err)
    step.value = 'email-check'
  } finally {
    pageLoading.value = false
  }
}

/**
 * Handle email check result from PacoEmailCheck
 */
async function handleEmailChecked(email) {
  emailCheckLoading.value = true
  globalError.value = ''
  checkedEmail.value = email

  try {
    const exists = await checkEmailExists(email)
    step.value = exists ? 'login' : 'register'
  } catch (err) {
    globalError.value = t('paco.errors.generic')
  } finally {
    emailCheckLoading.value = false
  }
}

/**
 * Handle successful login from PacoLoginForm.
 * Auto-register for PACO if not already registered, then send email.
 */
async function handleLoginSuccess({ userId, email }) {
  pageLoading.value = true
  globalError.value = ''

  try {
    const alreadyRegistered = await checkPacoRegistration(userId)

    if (alreadyRegistered) {
      step.value = 'join'
    } else {
      // Register for PACO
      const registered = await registerForPaco(userId)
      if (!registered) {
        globalError.value = t('paco.errors.registration')
        step.value = 'email-check'
        return
      }

      // Send confirmation email (best-effort — don't block join on failure)
      try {
        const userName = profile.value
          ? `${profile.value.first_name || ''} ${profile.value.last_name || ''}`.trim()
          : email
        await sendPacoEmail(email, userName || email)
      } catch (emailErr) {
        console.warn('Email sending failed (non-blocking):', emailErr)
      }

      step.value = 'join'
    }
  } catch (err) {
    console.error('Post-login flow error:', err)
    globalError.value = t('paco.errors.generic')
  } finally {
    pageLoading.value = false
  }
}

/**
 * Handle successful registration from PacoRegisterForm.
 * Register for PACO activity and send email.
 */
async function handleRegisterSuccess({ userId, email, name }) {
  pageLoading.value = true
  globalError.value = ''

  try {
    // Register for PACO activity
    const registered = await registerForPaco(userId)
    if (!registered) {
      globalError.value = t('paco.errors.registration')
      step.value = 'email-check'
      return
    }

    // Send confirmation email (best-effort — don't block success on failure)
    try {
      await sendPacoEmail(email, name || email)
    } catch (emailErr) {
      console.warn('Email sending failed (non-blocking):', emailErr)
    }

    step.value = 'success'
  } catch (err) {
    console.error('Post-register flow error:', err)
    globalError.value = t('paco.errors.registration')
  } finally {
    pageLoading.value = false
  }
}

/**
 * Handle activity registration complete from PacoActivityRegister.
 * Transition to join section.
 */
function handleActivityRegistrationComplete() {
  step.value = 'join'
}

/**
 * Reset to email check step
 */
function resetToEmailCheck() {
  step.value = 'email-check'
  checkedEmail.value = ''
  globalError.value = ''
}
</script>
