<template>
  <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
    <!-- Photo or placeholder -->
    <div v-if="panelist.photoUrl" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0">
      <img :src="panelist.photoUrl" :alt="panelist.name" class="w-full h-full object-cover" loading="lazy" />
    </div>
    <div v-else class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
      <font-awesome-icon :icon="['fas', 'user']" class="text-white/40 text-2xl" />
    </div>
    <!-- Info -->
    <div class="min-w-0">
      <p class="text-sm font-semibold text-white truncate">{{ panelist.name }}</p>
      <p class="text-xs text-green-400 line-clamp-2">{{ roleLabel }}</p>
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  panelist: { type: Object, required: true },
  i18nPrefix: { type: String, default: 'paco.presentation' },
})

const { t, te } = useI18n()

const roleLabel = computed(() => {
  const key = `${props.i18nPrefix}.panelists.${props.panelist.id}.role`
  if (te(key)) return t(key)
  // Fallback vers le préfixe historique
  const fallback = `paco.presentation.panelists.${props.panelist.id}.role`
  return te(fallback) ? t(fallback) : ''
})
</script>
