<template>
  <div class="text-center py-2">
    <div class="w-16 h-16 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
      <font-awesome-icon :icon="['fas', 'video']" class="text-green-400 text-2xl" />
    </div>
    <h2 class="text-xl font-bold text-white mb-2">
      {{ t('paco.join.title') }}
    </h2>
    <p class="text-white/50 text-sm mb-6 leading-relaxed">
      {{ t('paco.join.subtitle') }}
    </p>

    <!-- Join button -->
    <router-link
      :to="platformJoinLink"
      class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-xl transition cursor-pointer shadow-lg shadow-indigo-600/20"
    >
      <font-awesome-icon :icon="['fas', 'video']" />
      {{ t('paco.join.joinButton') }}
    </router-link>

    <!-- Copy link -->
    <div class="mt-5 flex items-center justify-center">
      <button
        @click="copyTeamsLink"
        class="text-sm text-green-400 hover:text-green-300 hover:underline cursor-pointer transition"
      >
        <font-awesome-icon :icon="['fas', 'copy']" class="mr-1" />
        {{ linkCopied ? t('paco.join.linkCopied') : t('paco.join.copyLink') }}
      </button>
    </div>

    <!-- Partner logos -->
    <div class="mt-8 pt-6 border-t border-white/10">
      <PacoPartnerLogos :partners="webinar.partners" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePacoWebinarData } from '@/composables/paco/usePacoWebinarData'
import PacoPartnerLogos from './PacoPartnerLogos.vue'

const { t } = useI18n()
const { webinar } = usePacoWebinarData()

const platformJoinLink = '/paco/join'
const linkCopied = ref(false)

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
</script>
