<template>
  <div class="w-full mb-6">
    <div
      role="tablist"
      class="flex w-full gap-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-1.5 overflow-x-auto"
    >
      <button
        v-for="session in sessions"
        :key="session.edition"
        type="button"
        role="tab"
        :aria-selected="modelValue === session.edition"
        :tabindex="modelValue === session.edition ? 0 : -1"
        @click="selectSession(session.edition)"
        class="flex-1 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 min-w-[140px]"
        :class="[
          modelValue === session.edition
            ? 'bg-green-600 text-white shadow-lg shadow-green-900/30'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        ]"
      >
        <span class="truncate">
          {{ t(`paco.tabs.session${session.edition}`) }}
        </span>
        <span
          class="text-[9px] uppercase tracking-wide font-bold rounded-full px-2 py-0.5 shrink-0"
          :class="badgeClass(getSessionStatus(session))"
        >
          {{ t(`paco.tabs.status.${getSessionStatus(session)}`) }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { usePacoWebinarData } from '@/composables/paco/usePacoWebinarData'

const props = defineProps({
  sessions: { type: Array, required: true },
  modelValue: { type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const { getSessionStatus } = usePacoWebinarData()

function selectSession(edition) {
  if (edition !== props.modelValue) {
    emit('update:modelValue', edition)
  }
}

function badgeClass(status) {
  const map = {
    upcoming: 'bg-green-500/20 text-green-300 border border-green-400/30',
    live: 'bg-amber-500/20 text-amber-300 border border-amber-400/30 animate-pulse',
    ended: 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
  }
  return map[status] || map.ended
}
</script>
