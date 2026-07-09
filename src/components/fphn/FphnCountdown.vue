<template>
  <!-- Décompteur avant le début -->
  <div v-if="state === 'upcoming'">
    <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-2">
      {{ t('fphn.countdown.title') }}
    </p>
    <div class="flex gap-2">
      <div
        v-for="unit in units"
        :key="unit.key"
        class="flex-1 sm:flex-none sm:w-[74px] text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 shadow-sm"
      >
        <span class="block text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white leading-none">
          {{ unit.value }}
        </span>
        <span class="block mt-1 text-[9px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          {{ t(`fphn.countdown.${unit.key}`) }}
        </span>
      </div>
    </div>
  </div>

  <!-- Évènement en cours -->
  <div
    v-else-if="state === 'live'"
    class="inline-flex items-center gap-3 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-5 py-2.5"
  >
    <span class="relative flex h-3 w-3">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span>
    <span class="font-semibold text-sm text-red-700 dark:text-red-300">{{ t('fphn.countdown.live') }}</span>
  </div>

  <!-- Évènement terminé -->
  <div
    v-else
    class="inline-flex items-center gap-3 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-2.5"
  >
    <font-awesome-icon :icon="['fas', 'circle-check']" class="text-emerald-500" />
    <span class="font-medium text-sm text-gray-600 dark:text-gray-300">{{ t('fphn.countdown.ended') }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCountdown } from '@/composables/useCountdown'

const props = defineProps({
  /** Date de début (ISO string avec fuseau) */
  startDate: { type: String, required: true },
  /** Date de fin (ISO string avec fuseau) */
  endDate: { type: String, required: true },
})

const { t } = useI18n()
const { timeRemaining, formattedTime } = useCountdown(() => props.startDate)

const state = computed(() => {
  if (!timeRemaining.value?.isExpired) return 'upcoming'
  return Date.now() < new Date(props.endDate).getTime() ? 'live' : 'ended'
})

const units = computed(() => [
  { key: 'days', value: formattedTime.value?.days ?? '00' },
  { key: 'hours', value: formattedTime.value?.hours ?? '00' },
  { key: 'minutes', value: formattedTime.value?.minutes ?? '00' },
  { key: 'seconds', value: formattedTime.value?.seconds ?? '00' },
])
</script>
