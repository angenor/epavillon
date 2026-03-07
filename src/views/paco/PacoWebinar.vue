<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-900">
    <!-- Content -->
    <div class="flex items-start justify-center py-6 px-4 sm:px-6 lg:py-8 lg:px-8">
      <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-start">

        <!-- Left : PACO Info (below on mobile, left on desktop) -->
        <div class="lg:col-span-3 order-2 lg:order-1">
          <PacoPresentation />
        </div>


        <!-- Right: Action panel (top on mobile, sticky right on desktop) -->
        <div class="lg:col-span-2 lg:sticky lg:top-24 order-1 lg:order-2 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-white/20 lg:scrollbar-track-transparent">
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
              @needs-verification="handleNeedsVerification"
              @back="resetToEmailCheck"
            />

            <!-- Step: register -->
            <PacoRegisterForm
              v-else-if="step === 'register'"
              :email="checkedEmail"
              @register-success="handleRegisterSuccess"
              @back="resetToEmailCheck"
            />

            <!-- Step: verify-email -->
            <PacoEmailVerification
              v-else-if="step === 'verify-email'"
              :email="checkedEmail"
              @verified="handleOtpVerified"
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
import { usePacoRegistration, finalizePacoRegistration, getPendingRegistration } from '@/composables/paco/usePacoRegistration'
import { usePacoEmail } from '@/composables/paco/usePacoEmail'
import PacoPresentation from '@/components/paco/PacoPresentation.vue'
import PacoEmailCheck from '@/components/paco/PacoEmailCheck.vue'
import PacoLoginForm from '@/components/paco/PacoLoginForm.vue'
import PacoRegisterForm from '@/components/paco/PacoRegisterForm.vue'
import PacoActivityRegister from '@/components/paco/PacoActivityRegister.vue'
import PacoJoinSection from '@/components/paco/PacoJoinSection.vue'
import PacoEmailVerification from '@/components/paco/PacoEmailVerification.vue'

const { t } = useI18n()

// Auth state
const { isAuthenticated, user, profile } = useAuth()

// PACO composables
const { checkEmailExists, checkPacoRegistration } = usePacoRegistration()
const { sendPacoEmail } = usePacoEmail()

// State machine
const step = ref('email-check') // email-check | login | register | verify-email | activity-register | success | join
const pageLoading = ref(true)
const emailCheckLoading = ref(false)
const checkedEmail = ref('')
const globalError = ref('')
const pacoEmailSent = ref(false) // Guard to prevent sending the PACO email multiple times
const otpExpired = ref(false) // Flag when OTP link has expired

/**
 * Parse URL hash for Supabase auth errors (e.g. otp_expired after email confirmation link)
 */
function handleUrlHashError() {
  const hash = window.location.hash
  if (!hash) return

  const params = new URLSearchParams(hash.substring(1))
  const errorCode = params.get('error_code')

  if (errorCode === 'otp_expired') {
    otpExpired.value = true
    // Try to recover email from pending registration in localStorage
    const pending = getPendingRegistration()
    if (pending?.email) {
      checkedEmail.value = pending.email
    }
    // Clean the hash from the URL
    window.history.replaceState(null, '', window.location.pathname)
  }
}

/**
 * On mount: check URL hash for auth errors, then check initial state
 */
onMounted(async () => {
  handleUrlHashError()
  await checkInitialState()
})

// Watch for auth state changes (e.g. login from another tab or returning user)
watch(isAuthenticated, async (newVal) => {
  if (newVal && (step.value === 'email-check' || step.value === 'verify-email')) {
    await checkInitialState()
  }
})

// Watch for email verification (user verified in another tab or returned after verification)
watch(
  () => user.value?.email_confirmed_at,
  async (newVal, oldVal) => {
    if (newVal && !oldVal && step.value === 'verify-email') {
      // Email just got confirmed — attempt auto-finalization
      pageLoading.value = true
      globalError.value = ''

      try {
        const pending = getPendingRegistration(user.value.id)
        if (pending) {
          const result = await finalizePacoRegistration(user.value.id)
          if (result.success) {
            if (!pacoEmailSent.value) {
              pacoEmailSent.value = true
              try {
                await sendPacoEmail(pending.email, pending.name || pending.email)
              } catch (emailErr) {
                console.warn('Email sending failed (non-blocking):', emailErr)
              }
            }
            step.value = 'join'
          } else {
            step.value = 'activity-register'
          }
        } else {
          // No sessionStorage data — check if already registered or go to activity-register
          const registered = await checkPacoRegistration(user.value.id)
          step.value = registered ? 'join' : 'activity-register'
        }
      } catch (err) {
        console.error('Error during auto-finalization:', err)
        globalError.value = t('paco.errors.registration')
        step.value = 'activity-register'
      } finally {
        pageLoading.value = false
      }
    }
  }
)

async function checkInitialState() {
  pageLoading.value = true
  globalError.value = ''

  try {
    if (isAuthenticated.value && user.value) {
      // Check if email is verified
      if (!user.value.email_confirmed_at) {
        // Email not verified yet — show verification screen
        checkedEmail.value = user.value.email
        step.value = 'verify-email'
        return
      }

      // Email verified — check PACO registration
      const registered = await checkPacoRegistration(user.value.id)
      if (registered) {
        step.value = 'join'
      } else {
        // Try auto-finalization from sessionStorage
        const pending = getPendingRegistration(user.value.id)
        if (pending) {
          const result = await finalizePacoRegistration(user.value.id)
          if (result.success) {
            if (!pacoEmailSent.value) {
              pacoEmailSent.value = true
              try {
                await sendPacoEmail(pending.email, pending.name || pending.email)
              } catch (emailErr) {
                console.warn('Email sending failed (non-blocking):', emailErr)
              }
            }
            step.value = 'join'
          } else {
            step.value = 'activity-register'
          }
        } else {
          step.value = 'activity-register'
        }
      }
    } else if (otpExpired.value && checkedEmail.value) {
      // OTP expired — show verify-email so user can resend
      step.value = 'verify-email'
      globalError.value = t('paco.errors.otpExpired')
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
    if (exists) {
      // Check if there's a pending registration for this email (user created account
      // but hasn't confirmed email yet — e.g. refreshed page during OTP step)
      const pending = getPendingRegistration()
      if (pending?.email?.toLowerCase() === email.toLowerCase()) {
        step.value = 'verify-email'
      } else {
        step.value = 'login'
      }
    } else {
      step.value = 'register'
    }
  } catch (err) {
    globalError.value = t('paco.errors.generic')
  } finally {
    emailCheckLoading.value = false
  }
}

/**
 * Handle unverified email from PacoLoginForm.
 * Redirect to verify-email step so user can enter OTP code.
 */
function handleNeedsVerification({ email }) {
  checkedEmail.value = email
  step.value = 'verify-email'
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
      // Redirect to activity-register so user fills demographic form
      step.value = 'activity-register'
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
 * Transition to verify-email step (registration will be finalized after email verification).
 */
function handleRegisterSuccess({ userId, email, name }) {
  checkedEmail.value = email
  step.value = 'verify-email'
}

/**
 * Handle OTP verification success from PacoEmailVerification.
 * The user is now authenticated — finalize registration or go to activity-register.
 */
async function handleOtpVerified() {
  pageLoading.value = true
  globalError.value = ''

  // Re-check auth state after OTP verification created a session
  await checkInitialState()
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
