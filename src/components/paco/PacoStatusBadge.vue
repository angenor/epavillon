<template>
  <span
    :class="badgeClasses"
    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border"
  >
    <span
      :class="[dotClass, isLive ? 'animate-pulse' : '']"
      class="w-2 h-2 rounded-full"
    />
    {{ displayLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * PacoStatusBadge - double usage :
 *   1. Statut de l'activité (live/upcoming/past) via les props `status`,
 *      `color`, `label` (mode historique utilisé dans PacoPresentation.vue).
 *   2. Type d'inscription (standard/secours/secours rattrapé) via la prop
 *      `variant` — utilisé par PacoRegistrantTable.vue (feature 005).
 *
 * Si `variant` est fourni, il prend le dessus sur les props legacy : les
 * couleurs, le label et l'animation sont déterminés automatiquement.
 */
const props = defineProps({
  // Mode legacy (statut activité)
  status: { type: String, default: null },
  color: { type: String, default: null },
  label: { type: String, default: null },
  // Feature 005 : type d'inscription
  variant: {
    type: String,
    default: null,
    validator: (v) => v === null || ['standard', 'fallback'].includes(v)
  },
  recovered: { type: Boolean, default: false }
})

const { t } = useI18n()

const isFallbackMode = computed(() => props.variant !== null)
const isLive = computed(() => !isFallbackMode.value && props.status === 'live')

// Couleur effective :
//   - Mode legacy : prop `color`
//   - Mode feature 005 : standard=green, fallback pending=amber, fallback recovered=gray
const effectiveColor = computed(() => {
  if (!isFallbackMode.value) return props.color || 'gray'
  if (props.variant === 'standard') return 'green'
  if (props.variant === 'fallback' && props.recovered) return 'gray'
  return 'amber' // fallback pending
})

// Label effectif :
//   - Mode legacy : prop `label`
//   - Mode feature 005 : clés i18n paco.admin.fallback.badge*
const displayLabel = computed(() => {
  if (!isFallbackMode.value) return props.label || ''
  if (props.variant === 'standard') return t('paco.admin.filter.type.standard')
  if (props.variant === 'fallback' && props.recovered) return t('paco.admin.fallback.badgeRecovered')
  return t('paco.admin.fallback.badgeFallback')
})

const badgeClasses = computed(() => {
  const map = {
    green: 'bg-green-500/20 text-green-400 border-green-400/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-400/30',
    amber: 'bg-amber-500/20 text-amber-600 border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-400/30',
    gray: 'bg-gray-500/20 text-gray-500 border-gray-400/30 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-400/30',
  }
  return map[effectiveColor.value] || map.gray
})

const dotClass = computed(() => {
  const map = {
    green: 'bg-green-400',
    amber: 'bg-amber-400',
    gray: 'bg-gray-400',
  }
  return map[effectiveColor.value] || map.gray
})
</script>
