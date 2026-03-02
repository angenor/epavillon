<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Presentation section (always visible) -->
      <PacoPresentation />

      <!-- Dynamic section based on state -->

      <!-- Loading state (checking auth / registration) -->
      <div v-if="pageLoading" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">{{ t('paco.emailCheck.checking') }}</p>
      </div>

      <!-- Step: email-check (unauthenticated, no email entered yet) -->
      <PacoEmailCheck
        v-else-if="step === 'email-check'"
        :loading="emailCheckLoading"
        @email-checked="handleEmailChecked"
      />

      <!-- Step: login (email exists, show login form) -->
      <PacoLoginForm
        v-else-if="step === 'login'"
        :email="checkedEmail"
        @login-success="handleLoginSuccess"
        @back="resetToEmailCheck"
      />

      <!-- Step: register (email doesn't exist, show registration form) -->
      <PacoRegisterForm
        v-else-if="step === 'register'"
        :email="checkedEmail"
        @register-success="handleRegisterSuccess"
        @back="resetToEmailCheck"
      />

      <!-- Step: activity-register (authenticated but not registered for PACO) -->
      <PacoActivityRegister
        v-else-if="step === 'activity-register'"
        :user="user"
        :profile="profile"
        @registration-complete="handleActivityRegistrationComplete"
      />

      <!-- Step: success (just registered as new user) -->
      <div v-else-if="step === 'success'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <font-awesome-icon :icon="['fas', 'check']" class="text-green-600 dark:text-green-400 text-2xl" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('paco.success.title') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ t('paco.success.message') }}
        </p>
        <p class="text-sm text-green-700 dark:text-green-400 font-medium">
          <font-awesome-icon :icon="['fas', 'envelope']" class="mr-1" />
          {{ t('paco.success.checkEmail') }}
        </p>
      </div>

      <!-- Step: join (authenticated + registered for PACO) -->
      <PacoJoinSection v-else-if="step === 'join'" />

      <!-- Error state -->
      <div v-if="globalError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-sm text-red-700 dark:text-red-400">{{ globalError }}</p>
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
