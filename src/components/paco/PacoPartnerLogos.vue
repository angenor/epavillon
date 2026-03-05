<template>
  <div>
    <h3 class="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
      {{ t('paco.presentation.partnersTitle') }}
    </h3>
    <div class="flex flex-wrap items-center gap-2">
      <template v-for="partner in partners" :key="partner.id">
        <img
          v-if="partner.logoUrl"
          :src="partner.logoUrl"
          :alt="partner.name"
          class="h-8 object-contain rounded"
          loading="lazy"
        />
        <span
          v-else
          class="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium text-white/70"
        >
          {{ partner.name }}
        </span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  partners: { type: Array, required: true },
})
</script>
