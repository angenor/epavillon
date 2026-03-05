<template>
  <div class="text-center py-4">
    <!-- Envelope icon -->
    <div class="w-16 h-16 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
      <font-awesome-icon :icon="['fas', 'envelope']" class="text-green-400 text-2xl" />
    </div>

    <h2 class="text-xl font-bold text-white mb-2">
      {{ t('paco.verifyEmail.title') }}
    </h2>

    <p class="text-white/60 text-sm mb-4 leading-relaxed">
      {{ t('paco.verifyEmail.subtitle', { email }) }}
    </p>

    <p class="text-sm text-white/40 mb-6">
      <font-awesome-icon :icon="['fas', 'inbox']" class="mr-1" />
      {{ t('paco.verifyEmail.checkInbox') }}
    </p>

    <!-- Resend button -->
    <button
      @click="handleResend"
      :disabled="resending || resendCooldown > 0"
      class="w-full cursor-pointer bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium py-2.5 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      <template v-if="resending">
        <font-awesome-icon :icon="['fas', 'spinner']" spin class="mr-1" />
        {{ t('paco.verifyEmail.resending') }}
      </template>
      <template v-else-if="resendCooldown > 0">
        {{ t('paco.verifyEmail.resendButton') }} ({{ resendCooldown }}s)
      </template>
      <template v-else>
        {{ t('paco.verifyEmail.resendButton') }}
      </template>
    </button>

    <!-- Success message -->
    <p v-if="resendSuccess" class="text-sm text-green-400 mt-3">
      {{ t('paco.verifyEmail.resent') }}
    </p>

    <!-- Error message -->
    <p v-if="resendError" class="text-sm text-red-300 mt-3">
      {{ t('paco.verifyEmail.resendError') }}
    </p>
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

const resending = ref(false)
const resendSuccess = ref(false)
const resendError = ref(false)
const resendCooldown = ref(0)

let cooldownInterval = null

async function handleResend() {
  resending.value = true
  resendSuccess.value = false
  resendError.value = false

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: props.email,
      options: {
        emailRedirectTo: `${window.location.origin}/paco`
      }
    })

    if (error) throw error

    resendSuccess.value = true

    // Start cooldown (60s)
    resendCooldown.value = 60
    if (cooldownInterval) clearInterval(cooldownInterval)
    cooldownInterval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(cooldownInterval)
        cooldownInterval = null
      }
    }, 1000)
  } catch (err) {
    console.error('Error resending verification email:', err)
    resendError.value = true
  } finally {
    resending.value = false
  }
}
</script>
