<template>
  <div>
    <h3 class="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
      {{ t('paco.presentation.shareButton') }}
    </h3>
    <div class="flex flex-wrap items-center gap-2">
      <!-- Facebook -->
      <a
        :href="facebookUrl"
        target="_blank"
        rel="noopener noreferrer"
        :title="`${t('paco.presentation.shareOn')} Facebook`"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/70 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition cursor-pointer"
      >
        <font-awesome-icon :icon="['fab', 'facebook-f']" />
      </a>

      <!-- X / Twitter -->
      <a
        :href="twitterUrl"
        target="_blank"
        rel="noopener noreferrer"
        :title="`${t('paco.presentation.shareOn')} X (Twitter)`"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/70 hover:bg-black hover:text-white hover:border-white/30 transition cursor-pointer"
      >
        <font-awesome-icon :icon="['fab', 'x-twitter']" />
      </a>

      <!-- LinkedIn -->
      <a
        :href="linkedinUrl"
        target="_blank"
        rel="noopener noreferrer"
        :title="`${t('paco.presentation.shareOn')} LinkedIn`"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/70 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition cursor-pointer"
      >
        <font-awesome-icon :icon="['fab', 'linkedin-in']" />
      </a>

      <!-- WhatsApp -->
      <a
        :href="whatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        :title="`${t('paco.presentation.shareOn')} WhatsApp`"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/70 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition cursor-pointer"
      >
        <font-awesome-icon :icon="['fab', 'whatsapp']" />
      </a>

      <!-- Telegram -->
      <a
        :href="telegramUrl"
        target="_blank"
        rel="noopener noreferrer"
        :title="`${t('paco.presentation.shareOn')} Telegram`"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/70 hover:bg-[#26A5E4] hover:text-white hover:border-[#26A5E4] transition cursor-pointer"
      >
        <font-awesome-icon :icon="['fab', 'telegram']" />
      </a>

      <!-- Email -->
      <a
        :href="emailUrl"
        :title="`${t('paco.presentation.shareOn')} Email`"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'envelope']" />
      </a>

      <!-- Copy link -->
      <button
        @click="copyLink"
        :title="t('paco.presentation.shareCopyLink')"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/70 hover:bg-green-500/30 hover:text-green-400 hover:border-green-400/30 transition cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', copied ? 'check' : 'link']" :class="copied ? 'text-green-400' : ''" />
      </button>
    </div>

    <p v-if="copied" class="text-xs text-green-400 mt-2">
      {{ t('paco.presentation.shareCopied') }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const copied = ref(false)

const shareUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/paco`
  }
  return ''
})

const shareTitle = computed(() => t('paco.presentation.title'))
const shareText = computed(() => t('paco.presentation.subtitle'))

const facebookUrl = computed(() =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
)

const twitterUrl = computed(() =>
  `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareTitle.value)}`
)

const linkedinUrl = computed(() =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`
)

const whatsappUrl = computed(() =>
  `https://wa.me/?text=${encodeURIComponent(`${shareTitle.value} ${shareUrl.value}`)}`
)

const telegramUrl = computed(() =>
  `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareTitle.value)}`
)

const emailUrl = computed(() =>
  `mailto:?subject=${encodeURIComponent(shareTitle.value)}&body=${encodeURIComponent(`${shareText.value}\n\n${shareUrl.value}`)}`
)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
  } catch {
    const input = document.createElement('input')
    input.value = shareUrl.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
