<template>
  <span
    :class="badgeClasses"
    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border"
  >
    <span
      :class="[dotClass, status === 'live' ? 'animate-pulse' : '']"
      class="w-2 h-2 rounded-full"
    />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
  color: { type: String, required: true },
  label: { type: String, required: true },
})

const badgeClasses = computed(() => {
  const map = {
    green: 'bg-green-500/20 text-green-400 border-green-400/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-400/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-400/30',
  }
  return map[props.color] || map.gray
})

const dotClass = computed(() => {
  const map = {
    green: 'bg-green-400',
    amber: 'bg-amber-400',
    gray: 'bg-gray-400',
  }
  return map[props.color] || map.gray
})
</script>
