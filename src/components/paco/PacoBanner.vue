<template>
  <div class="w-full rounded-2xl overflow-hidden">
    <!-- Banner image -->
    <img
      v-if="bannerUrl"
      :src="bannerUrl"
      :alt="t('paco.presentation.bannerPlaceholder')"
      class="w-full h-44 sm:h-52 object-cover"
      loading="lazy"
    />
    <!-- Gradient placeholder -->
    <div
      v-else
      class="w-full h-44 sm:h-52 bg-gradient-to-br from-green-900/60 via-emerald-800/40 to-teal-900/50 border border-white/10 flex flex-col items-center justify-center gap-3"
    >
      <div class="w-16 h-16 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
        <font-awesome-icon :icon="['fas', 'chalkboard-user']" class="text-green-400 text-2xl" />
      </div>
      <div class="text-center">
        <p class="text-white/80 text-sm font-semibold">{{ t('paco.presentation.bannerPlaceholder') }}</p>
        <p class="text-white/40 text-xs">{{ t('paco.presentation.seriesLabel') }} #{{ edition }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  bannerUrl: { type: String, default: null },
  edition: { type: Number, default: 3 },
})
</script>
