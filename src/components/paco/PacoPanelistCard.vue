<template>
  <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
    <!-- Photo or placeholder -->
    <div v-if="panelist.photoUrl" class="w-12 h-12 rounded-full overflow-hidden shrink-0">
      <img :src="panelist.photoUrl" :alt="panelist.name" class="w-full h-full object-cover" loading="lazy" />
    </div>
    <div v-else class="w-12 h-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
      <font-awesome-icon :icon="['fas', 'user']" class="text-white/40" />
    </div>
    <!-- Info -->
    <div class="min-w-0">
      <p class="text-sm font-semibold text-white truncate">{{ panelist.name }}</p>
      <p class="text-xs text-green-400 truncate">{{ t(`paco.presentation.panelists.${panelist.id}.role`) }}</p>
      <p class="text-xs text-white/50 truncate">{{ panelist.organization }}</p>
      <a
        v-if="panelist.email"
        :href="`mailto:${panelist.email}`"
        class="text-xs text-white/40 hover:text-white/60 transition truncate block"
      >
        {{ panelist.email }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  panelist: { type: Object, required: true },
})
</script>
