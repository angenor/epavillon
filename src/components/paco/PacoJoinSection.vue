<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
    <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
      <font-awesome-icon :icon="['fas', 'video']" class="text-green-600 dark:text-green-400 text-2xl" />
    </div>
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
      {{ t('paco.join.title') }}
    </h2>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      {{ t('paco.join.subtitle') }}
    </p>

    <!-- Join button -->
    <router-link
      :to="platformJoinLink"
      class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition cursor-pointer"
    >
      <font-awesome-icon :icon="['fas', 'video']" />
      {{ t('paco.join.joinButton') }}
    </router-link>

    <!-- Copy link + Resend email -->
    <div class="mt-4 flex items-center justify-center gap-3">
      <button
        @click="copyTeamsLink"
        class="text-sm text-green-700 dark:text-green-400 hover:underline cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'copy']" class="mr-1" />
        {{ linkCopied ? t('paco.join.linkCopied') : t('paco.join.copyLink') }}
      </button>
      <span class="text-gray-300 dark:text-gray-600">|</span>
      <button
        @click="handleResendEmail"
        :disabled="resendingEmail"
        class="text-sm text-green-700 dark:text-green-400 hover:underline cursor-pointer disabled:opacity-50"
      >
        <font-awesome-icon :icon="['fas', 'envelope']" class="mr-1" />
        {{ resendingEmail ? t('paco.join.resending') : t('paco.join.resendEmail') }}
      </button>
    </div>

    <!-- Resend feedback -->
    <p v-if="resendMessage" class="mt-2 text-sm" :class="resendError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
      {{ resendMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { usePacoEmail } from '@/composables/paco/usePacoEmail'

const { t } = useI18n()
const { user, profile } = useAuth()
const { sendPacoEmail } = usePacoEmail()

const platformJoinLink = '/paco/join'
const linkCopied = ref(false)
const resendingEmail = ref(false)
const resendMessage = ref('')
const resendError = ref(false)

async function copyTeamsLink() {
  const fullUrl = window.location.origin + platformJoinLink
  try {
    await navigator.clipboard.writeText(fullUrl)
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 2000)
  } catch {
    const input = document.createElement('input')
    input.value = fullUrl
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 2000)
  }
}

async function handleResendEmail() {
  resendingEmail.value = true
  resendMessage.value = ''
  resendError.value = false

  try {
    const email = user.value?.email
    const name = profile.value
      ? `${profile.value.first_name || ''} ${profile.value.last_name || ''}`.trim()
      : email

    const sent = await sendPacoEmail(email, name || email)
    if (sent) {
      resendMessage.value = t('paco.join.emailSent')
    } else {
      resendMessage.value = t('paco.join.emailError')
      resendError.value = true
    }
  } catch {
    resendMessage.value = t('paco.join.emailError')
    resendError.value = true
  } finally {
    resendingEmail.value = false
  }
}
</script>
