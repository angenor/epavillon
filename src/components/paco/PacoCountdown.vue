<template>
  <div class="space-y-3 mb-5">
    <!-- Horaires GMT + heure locale -->
    <div class="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
      <div class="flex items-center justify-center gap-2 text-sm text-white/80">
        <font-awesome-icon :icon="['fas', 'clock']" class="text-green-400 text-xs" />
        <span>{{ t('paco.join.timeGmt') }}</span>
      </div>
      <div class="flex items-center justify-center gap-2 text-sm text-green-400 font-medium">
        <font-awesome-icon :icon="['fas', 'globe']" class="text-xs" />
        <span>{{ localTimeLabel }}</span>
      </div>
    </div>

    <!-- Countdown (disparaît quand terminé) -->
    <div v-if="countdown.active" class="bg-white/5 border border-white/10 rounded-xl p-4">
      <p class="text-xs text-white/50 uppercase tracking-wide mb-2 text-center">{{ t('paco.join.countdown') }}</p>
      <div class="flex items-center justify-center gap-3">
        <div v-if="countdown.days > 0" class="text-center">
          <span class="text-2xl font-bold text-white">{{ countdown.days }}</span>
          <span class="block text-xs text-white/40">{{ t('paco.join.days') }}</span>
        </div>
        <div class="text-center">
          <span class="text-2xl font-bold text-white">{{ pad(countdown.hours) }}</span>
          <span class="block text-xs text-white/40">{{ t('paco.join.hours') }}</span>
        </div>
        <span class="text-xl text-white/30 font-light">:</span>
        <div class="text-center">
          <span class="text-2xl font-bold text-white">{{ pad(countdown.minutes) }}</span>
          <span class="block text-xs text-white/40">{{ t('paco.join.minutes') }}</span>
        </div>
        <span class="text-xl text-white/30 font-light">:</span>
        <div class="text-center">
          <span class="text-2xl font-bold text-white">{{ pad(countdown.seconds) }}</span>
          <span class="block text-xs text-white/40">{{ t('paco.join.seconds') }}</span>
        </div>
      </div>
    </div>

    <!-- Message salle d'attente (30 min avant le début) -->
    <div v-if="showWaitingRoomMessage" class="bg-amber-500/15 border border-amber-400/30 rounded-xl p-3">
      <p class="text-sm text-amber-300 flex items-center justify-center gap-2">
        <font-awesome-icon :icon="['fas', 'door-open']" class="shrink-0" />
        <span>{{ t('paco.join.waitingRoom') }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePacoWebinarData } from '@/composables/paco/usePacoWebinarData'

const props = defineProps({
  sessionData: { type: Object, default: null }
})

const { t } = useI18n()
const { currentSession } = usePacoWebinarData()

const session = computed(() => props.sessionData || currentSession.value)

const webinarStart = computed(() =>
  new Date(`${session.value.date}T${session.value.startTime}:00Z`)
)

const localTimeLabel = computed(() => {
  const startLocal = new Date(`${session.value.date}T${session.value.startTime}:00Z`)
  const endLocal = new Date(`${session.value.date}T${session.value.endTime}:00Z`)

  const opts = { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }
  const startStr = startLocal.toLocaleTimeString(undefined, opts)
  const endStr = endLocal.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  return `${startStr} – ${endStr} (${t('paco.join.localTime')})`
})

const now = ref(Date.now())
let timer = null

const countdown = computed(() => {
  const diff = webinarStart.value.getTime() - now.value
  if (diff <= 0) return { active: false, days: 0, hours: 0, minutes: 0, seconds: 0 }

  const totalSec = Math.floor(diff / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  return { active: true, days, hours, minutes, seconds }
})

const showWaitingRoomMessage = computed(() => {
  const diff = webinarStart.value.getTime() - now.value
  return diff > 0 && diff <= 30 * 60 * 1000
})

function pad(n) {
  return String(n).padStart(2, '0')
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
    if (!countdown.value.active && !showWaitingRoomMessage.value) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
