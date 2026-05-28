<template>
  <div class="text-center py-2">
    <div class="w-16 h-16 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
      <font-awesome-icon :icon="['fas', 'video']" class="text-green-400 text-2xl" />
    </div>
    <h2 class="text-xl font-bold text-white mb-2">
      {{ t('paco.join.title') }}
    </h2>
    <p class="text-white/50 text-sm mb-6 leading-relaxed">
      {{ t('paco.join.subtitle') }}
    </p>

    <!-- Join button -->
    <a
      :href="PACO_TEAMS_LINK"
      @click="handleJoinClick"
      class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-xl transition cursor-pointer shadow-lg shadow-indigo-600/20"
    >
      <font-awesome-icon :icon="['fas', 'video']" />
      {{ t('paco.join.joinButton') }}
    </a>

    <!-- Copy link -->
    <div class="mt-5 flex items-center justify-center">
      <button
        @click="copyTeamsLink"
        class="text-sm text-green-400 hover:text-green-300 hover:underline cursor-pointer transition"
      >
        <font-awesome-icon :icon="['fas', 'copy']" class="mr-1" />
        {{ linkCopied ? t('paco.join.linkCopied') : t('paco.join.copyLink') }}
      </button>
    </div>

    <!-- Partner logos -->
    <div class="mt-8 pt-6 border-t border-white/10">
      <PacoPartnerLogos :partners="session.partners" />
    </div>

    <!-- Modal : session pas encore ouverte (>1h avant le démarrage) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showNotStartedModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          @click.self="showNotStartedModal = false"
        >
          <div
            class="bg-gray-900 border-2 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full transition-colors duration-500"
            :class="isWaitingRoomOpen
              ? 'border-green-500/60 shadow-green-500/20'
              : 'border-red-500/60 shadow-red-500/20'"
          >
            <div class="flex items-start gap-3 mb-4">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-500"
                :class="isWaitingRoomOpen
                  ? 'bg-green-500/20 border-green-400/40'
                  : 'bg-red-500/20 border-red-400/40'"
              >
                <font-awesome-icon
                  :icon="['fas', isWaitingRoomOpen ? 'door-open' : 'triangle-exclamation']"
                  :class="isWaitingRoomOpen ? 'text-green-400' : 'text-red-400'"
                />
              </div>
              <div class="text-left">
                <h3
                  class="text-lg font-bold transition-colors duration-500"
                  :class="isWaitingRoomOpen ? 'text-green-400' : 'text-red-400'"
                >
                  {{ isWaitingRoomOpen
                    ? t('paco.join.notStarted.waitingRoomOpenTitle')
                    : t('paco.join.notStarted.title') }}
                </h3>
                <p class="text-sm text-white/70 mt-1 leading-relaxed">
                  {{ isWaitingRoomOpen
                    ? t('paco.join.notStarted.waitingRoomOpenMessage')
                    : t('paco.join.notStarted.message') }}
                </p>
              </div>
            </div>

            <!-- Countdown -->
            <div
              class="border rounded-xl p-4 mb-4 transition-colors duration-500"
              :class="isWaitingRoomOpen
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'"
            >
              <p
                class="text-xs uppercase tracking-wider mb-2 text-center transition-colors duration-500"
                :class="isWaitingRoomOpen ? 'text-green-300/80' : 'text-red-300/80'"
              >
                {{ t('paco.join.notStarted.startsIn') }}
              </p>
              <div class="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div class="text-2xl font-bold text-white tabular-nums">{{ countdown.days }}</div>
                  <div class="text-[10px] uppercase text-white/50">{{ t('paco.join.days') }}</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-white tabular-nums">{{ pad(countdown.hours) }}</div>
                  <div class="text-[10px] uppercase text-white/50">{{ t('paco.join.hours') }}</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-white tabular-nums">{{ pad(countdown.minutes) }}</div>
                  <div class="text-[10px] uppercase text-white/50">{{ t('paco.join.minutes') }}</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-white tabular-nums">{{ pad(countdown.seconds) }}</div>
                  <div class="text-[10px] uppercase text-white/50">{{ t('paco.join.seconds') }}</div>
                </div>
              </div>
            </div>

            <!-- Heures -->
            <div class="space-y-2 mb-5 text-sm">
              <div class="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <span class="text-white/60">
                  <font-awesome-icon :icon="['fas', 'globe']" class="mr-2 text-white/40" />
                  {{ t('paco.join.notStarted.gmtLabel') }}
                </span>
                <span class="text-white font-semibold tabular-nums">{{ gmtTimeLabel }}</span>
              </div>
              <div v-if="!isLocalSameAsGmt" class="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <span class="text-white/60">
                  <font-awesome-icon :icon="['fas', 'clock']" class="mr-2 text-white/40" />
                  {{ t('paco.join.notStarted.localLabel') }}
                </span>
                <span class="text-white font-semibold tabular-nums">{{ localTimeLabel }}</span>
              </div>
            </div>

            <!-- Invitation salle d'attente (< 30 min) -->
            <div
              v-if="isWithinWaitingRoomWindow"
              class="mb-4 bg-amber-500/10 border border-amber-400/40 rounded-lg px-3 py-2.5 text-sm text-amber-200 flex items-start gap-2"
            >
              <font-awesome-icon :icon="['fas', 'door-open']" class="mt-0.5 shrink-0" />
              <span>{{ t('paco.join.notStarted.waitingRoomInvite') }}</span>
            </div>

            <div class="flex flex-col sm:flex-row gap-2">
              <button
                @click="showNotStartedModal = false"
                class="cursor-pointer flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition"
              >
                {{ t('paco.join.notStarted.close') }}
              </button>
              <a
                :href="PACO_TEAMS_LINK"
                @click="handleJoinAnyway"
                class="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white font-medium rounded-lg transition"
                :class="isWaitingRoomOpen
                  ? 'bg-green-600 hover:bg-green-500'
                  : isWithinWaitingRoomWindow
                    ? 'bg-indigo-600 hover:bg-indigo-500'
                    : 'bg-red-600 hover:bg-red-500'"
              >
                <font-awesome-icon :icon="['fas', 'video']" />
                {{ isWaitingRoomOpen
                  ? t('paco.join.notStarted.joinNow')
                  : t('paco.join.notStarted.joinAnyway') }}
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePacoWebinarData } from '@/composables/paco/usePacoWebinarData'
import { PACO_TEAMS_LINK } from '@/composables/paco/constants'
import { trackPacoJoinClick } from '@/composables/paco/usePacoRegistration'
import { useAuth } from '@/composables/useAuth'
import PacoPartnerLogos from './PacoPartnerLogos.vue'

const props = defineProps({
  sessionData: { type: Object, default: null }
})

const { t, locale } = useI18n()
const { currentSession } = usePacoWebinarData()
const { user, isAuthenticated } = useAuth()

const session = computed(() => props.sessionData || currentSession.value)

const PACO_PUBLIC_URL = 'https://epavillonclimatique.francophonie.org/paco'
const linkCopied = ref(false)

// Seuil : on n'autorise le clic « Rejoindre » qu'à partir de 1h avant le start.
const ONE_HOUR_MS = 60 * 60 * 1000

const sessionStartDate = computed(() => {
  const s = session.value
  if (!s?.date || !s?.startTime) return null
  // timezone GMT/UTC : le suffixe Z force l'interprétation UTC.
  return new Date(`${s.date}T${s.startTime}:00Z`)
})

const sessionEndDate = computed(() => {
  const s = session.value
  if (!s?.date || !s?.endTime) return null
  return new Date(`${s.date}T${s.endTime}:00Z`)
})

const showNotStartedModal = ref(false)
const now = ref(Date.now())
let countdownTimer = null

const countdown = computed(() => {
  const start = sessionStartDate.value
  if (!start) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const diff = Math.max(0, start.getTime() - now.value)
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  }
})

const pad = (n) => String(n).padStart(2, '0')

const gmtTimeLabel = computed(() => {
  const start = sessionStartDate.value
  const end = sessionEndDate.value
  if (!start || !end) return ''
  const fmt = (d) =>
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
  const datePart = start.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'
  })
  return `${datePart} · ${fmt(start)}–${fmt(end)} GMT`
})

const localTimeLabel = computed(() => {
  const start = sessionStartDate.value
  const end = sessionEndDate.value
  if (!start || !end) return ''
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const tag = locale.value === 'fr' ? 'fr-FR' : 'en-US'
  const fmt = (d) =>
    d.toLocaleTimeString(tag, { hour: '2-digit', minute: '2-digit' })
  const datePart = start.toLocaleDateString(tag, {
    day: '2-digit', month: 'short', year: 'numeric'
  })
  return `${datePart} · ${fmt(start)}–${fmt(end)} (${tz})`
})

const THIRTY_MIN_MS = 30 * 60 * 1000

// Vrai dès qu'on franchit le seuil de 1 h avant le start : la modale, si elle
// reste ouverte, bascule alors de l'état rouge "pas encore commencé" à l'état
// vert "salle d'attente ouverte".
const isWaitingRoomOpen = computed(() => {
  const start = sessionStartDate.value
  if (!start) return false
  return start.getTime() - now.value <= ONE_HOUR_MS
})

// Vrai si on est à 30 min ou moins du démarrage : on suggère explicitement
// à l'utilisateur de prendre place dans la salle d'attente Teams.
const isWithinWaitingRoomWindow = computed(() => {
  const start = sessionStartDate.value
  if (!start) return false
  const diff = start.getTime() - now.value
  return diff > 0 && diff <= THIRTY_MIN_MS
})

// Vrai si le fuseau de l'utilisateur est aligné sur UTC (offset 0).
// Dans ce cas, l'heure locale est identique à l'heure GMT : inutile de
// l'afficher deux fois.
const isLocalSameAsGmt = computed(() => {
  const start = sessionStartDate.value
  if (!start) return false
  return start.getTimezoneOffset() === 0
})

function startCountdown() {
  if (countdownTimer) return
  countdownTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

onUnmounted(stopCountdown)

/**
 * Tracking non bloquant du clic « Rejoindre le webinaire ».
 * - On ne fait JAMAIS preventDefault : le <a href> Teams navigue normalement.
 * - On ne lit pas le retour du RPC : echec silencieux, l'utilisateur rejoint
 *   quand meme.
 * - Identite : userId si authentifie, sinon email persiste localement lors
 *   de l'inscription (cle paco_registration_data_session_<edition>).
 */
function handleJoinClick(event) {
  // Bloque la navigation si on est à plus d'1h du démarrage.
  const start = sessionStartDate.value
  if (start) {
    const msUntilStart = start.getTime() - Date.now()
    if (msUntilStart > ONE_HOUR_MS) {
      event.preventDefault()
      now.value = Date.now()
      showNotStartedModal.value = true
      startCountdown()
      return
    }
  }

  try {
    const edition = session.value?.edition
    if (!edition) return

    const userId = isAuthenticated.value ? (user.value?.id || null) : null
    let email = null
    if (!userId && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`paco_registration_data_session_${edition}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          email = parsed?.email || null
        }
      } catch {
        // localStorage parse errors are non-blocking.
      }
    }

    // Fire-and-forget : aucun await, aucun then, aucune erreur ne peut
    // remonter (la fonction est elle-meme absorbante).
    trackPacoJoinClick({ userId, email, sessionEdition: edition })
  } catch {
    // Filet de securite : si meme la lecture du contexte plante, on ignore.
  }
}

/**
 * « Rejoindre quand même » depuis la modale : on laisse passer la navigation
 * vers Teams, on déclenche le tracking et on ferme la modale.
 */
function handleJoinAnyway() {
  showNotStartedModal.value = false
  stopCountdown()
  try {
    const edition = session.value?.edition
    if (!edition) return
    const userId = isAuthenticated.value ? (user.value?.id || null) : null
    let email = null
    if (!userId && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`paco_registration_data_session_${edition}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          email = parsed?.email || null
        }
      } catch {
        // ignore
      }
    }
    trackPacoJoinClick({ userId, email, sessionEdition: edition })
  } catch {
    // non-blocking
  }
}

async function copyTeamsLink() {
  const fullUrl = PACO_PUBLIC_URL
  try {
    await navigator.clipboard.writeText(fullUrl)
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 2000)
  } catch {
    const input = document.createElement('input')
    input.value = fullUrl
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 2000)
  }
}
</script>
