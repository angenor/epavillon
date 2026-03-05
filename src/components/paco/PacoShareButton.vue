<template>
  <button
    class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white/80 cursor-pointer hover:bg-white/20 transition"
    @click="share"
  >
    <font-awesome-icon :icon="['fas', 'share-nodes']" class="text-green-400 text-xs" />
    <span>{{ copied ? t('paco.presentation.shareCopied') : t('paco.presentation.shareButton') }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const copied = ref(false)

async function share() {
  const url = window.location.href
  const title = t('paco.presentation.title')

  if (navigator.share) {
    try {
      await navigator.share({ title, url })
    } catch {
      // User cancelled share
    }
  } else {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>
