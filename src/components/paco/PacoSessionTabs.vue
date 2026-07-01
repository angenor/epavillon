<template>
  <div class="w-full mb-6 relative">
    <!-- Flèche gauche -->
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <button
        v-if="canLeft"
        type="button"
        aria-label="Sessions précédentes"
        @click="scrollStep(-1)"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer w-8 h-8 rounded-full bg-gray-800/90 hover:bg-gray-700 border border-white/15 text-white/80 hover:text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-xs" />
      </button>
    </Transition>

    <!-- Flèche droite -->
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <button
        v-if="canRight"
        type="button"
        aria-label="Sessions suivantes"
        @click="scrollStep(1)"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer w-8 h-8 rounded-full bg-gray-800/90 hover:bg-gray-700 border border-white/15 text-white/80 hover:text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-xs" />
      </button>
    </Transition>

    <!-- Dégradés de bord (indiquent qu'il reste des sessions à faire défiler) -->
    <div
      v-show="canLeft"
      class="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-gray-900 to-transparent"
    ></div>
    <div
      v-show="canRight"
      class="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-gray-900 to-transparent"
    ></div>

    <!-- Onglets défilants -->
    <div
      ref="tablistEl"
      role="tablist"
      aria-label="Sessions du webinaire PACO"
      class="flex gap-2 overflow-x-auto scroll-smooth snap-x no-scrollbar py-1 px-1"
      @scroll="updateScrollState"
    >
      <button
        v-for="session in sessions"
        :key="session.edition"
        :ref="(el) => setTabRef(el, session.edition)"
        type="button"
        role="tab"
        :aria-selected="modelValue === session.edition"
        :tabindex="modelValue === session.edition ? 0 : -1"
        @click="selectSession(session.edition)"
        @keydown="onTabKeydown($event, session.edition)"
        class="snap-start shrink-0 min-w-[150px] max-w-[220px] cursor-pointer rounded-2xl px-4 py-2.5 text-left flex flex-col gap-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60"
        :class="modelValue === session.edition
          ? 'bg-green-600 shadow-lg shadow-green-900/30'
          : 'bg-white/5 hover:bg-white/10'"
      >
        <span class="flex items-center gap-1.5 min-w-0">
          <span
            class="text-[10px] font-extrabold tracking-wide rounded-md px-1.5 py-0.5 shrink-0"
            :class="modelValue === session.edition
              ? 'bg-white/20 text-white'
              : 'bg-white/10 text-white/60'"
          >
            S{{ sessionNumber(session) }}
          </span>
          <span
            class="text-sm font-semibold truncate"
            :class="modelValue === session.edition ? 'text-white' : 'text-white/80'"
          >
            {{ shortTitle(session) }}
          </span>
        </span>
        <span
          class="flex items-center gap-1.5 text-[11px] font-medium"
          :class="statusTextClass(getSessionStatus(session), modelValue === session.edition)"
        >
          <span class="relative flex h-2 w-2 shrink-0">
            <span
              v-if="getSessionStatus(session) === 'live'"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
            ></span>
            <span class="relative inline-flex rounded-full h-2 w-2" :class="dotClass(getSessionStatus(session))"></span>
          </span>
          {{ t(`paco.tabs.status.${getSessionStatus(session)}`) }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePacoWebinarData } from '@/composables/paco/usePacoWebinarData'

const props = defineProps({
  sessions: { type: Array, required: true },
  modelValue: { type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const { t, te } = useI18n()
const { getSessionStatus } = usePacoWebinarData()

// --- Libellés ---
/**
 * Numéro affiché : extrait du libellé "Session N" (i18n) pour rester cohérent
 * avec la numérotation chronologique. Repli sur la position dans la liste.
 */
function sessionNumber(session) {
  const match = t(`paco.tabs.session${session.edition}`).match(/\d+/)
  return match ? match[0] : String(props.sessions.indexOf(session) + 1)
}

function shortTitle(session) {
  const key = `${session.i18nPrefix}.shortTitle`
  return te(key) ? t(key) : t(`paco.tabs.session${session.edition}`)
}

function selectSession(edition) {
  if (edition !== props.modelValue) {
    emit('update:modelValue', edition)
  }
}

// Navigation clavier (flèches) entre les onglets.
function onTabKeydown(event, edition) {
  const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
  if (!keys.includes(event.key)) return
  event.preventDefault()

  const list = props.sessions
  const currentIdx = list.findIndex(s => s.edition === edition)
  let nextIdx = currentIdx
  if (event.key === 'ArrowRight') nextIdx = (currentIdx + 1) % list.length
  else if (event.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + list.length) % list.length
  else if (event.key === 'Home') nextIdx = 0
  else if (event.key === 'End') nextIdx = list.length - 1

  const next = list[nextIdx]
  if (next) {
    selectSession(next.edition)
    nextTick(() => tabRefs.get(next.edition)?.focus())
  }
}

// --- Styles statut ---
function dotClass(status) {
  const map = { upcoming: 'bg-green-400', live: 'bg-amber-400', ended: 'bg-gray-500' }
  return map[status] || map.ended
}
function statusTextClass(status, isActive) {
  if (isActive) return 'text-white/90'
  const map = { upcoming: 'text-green-300', live: 'text-amber-300', ended: 'text-white/40' }
  return map[status] || map.ended
}

// --- Défilement (flèches, dégradés, centrage de l'actif) ---
const tablistEl = ref(null)
const tabRefs = new Map()
const canLeft = ref(false)
const canRight = ref(false)

function setTabRef(el, edition) {
  if (el) tabRefs.set(edition, el)
  else tabRefs.delete(edition)
}

function updateScrollState() {
  const el = tablistEl.value
  if (!el) return
  canLeft.value = el.scrollLeft > 4
  canRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollStep(dir) {
  const el = tablistEl.value
  if (!el) return
  el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' })
}

function scrollActiveIntoView(behavior = 'smooth') {
  const container = tablistEl.value
  const tab = tabRefs.get(props.modelValue)
  if (!container || !tab) return
  const cRect = container.getBoundingClientRect()
  const tRect = tab.getBoundingClientRect()
  const offset = tRect.left - cRect.left - (cRect.width - tRect.width) / 2
  if (behavior === 'auto') container.scrollLeft += offset
  else container.scrollBy({ left: offset, behavior: 'smooth' })
}

let resizeObserver = null

onMounted(async () => {
  await nextTick()
  scrollActiveIntoView('auto')
  updateScrollState()
  if (typeof ResizeObserver !== 'undefined' && tablistEl.value) {
    resizeObserver = new ResizeObserver(() => updateScrollState())
    resizeObserver.observe(tablistEl.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

watch(() => props.modelValue, async () => {
  await nextTick()
  scrollActiveIntoView('smooth')
  updateScrollState()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
