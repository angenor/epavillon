<template>
  <div class="w-full mb-6">
    <!-- Mobile : dropdown -->
    <div ref="dropdownEl" class="lg:hidden relative">
      <button
        type="button"
        :aria-expanded="open"
        aria-haspopup="listbox"
        @click="open = !open"
        class="cursor-pointer w-full flex items-center justify-between gap-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 text-left"
      >
        <span class="flex items-center gap-2 min-w-0">
          <span class="text-sm font-semibold text-white truncate">
            {{ activeLabel }}
          </span>
          <span
            v-if="activeSession"
            class="text-[9px] uppercase tracking-wide font-bold rounded-full px-2 py-0.5 shrink-0"
            :class="badgeClass(getSessionStatus(activeSession))"
          >
            {{ t(`paco.tabs.status.${getSessionStatus(activeSession)}`) }}
          </span>
        </span>
        <font-awesome-icon
          :icon="['fas', 'chevron-down']"
          class="text-white/60 text-xs transition-transform shrink-0"
          :class="{ 'rotate-180': open }"
        />
      </button>

      <Transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ul
          v-if="open"
          role="listbox"
          class="absolute z-30 mt-2 w-full max-h-[70vh] overflow-y-auto rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/40 p-1.5"
        >
          <li
            v-for="session in sessions"
            :key="session.edition"
            role="option"
            :aria-selected="modelValue === session.edition"
            @click="selectSession(session.edition)"
            class="cursor-pointer flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors"
            :class="modelValue === session.edition
              ? 'bg-green-600 text-white'
              : 'text-white/80 hover:bg-white/10'"
          >
            <span class="flex flex-col min-w-0">
              <span class="text-sm font-semibold truncate">
                {{ t(`paco.tabs.session${session.edition}`) }}
              </span>
              <span class="text-[11px] opacity-70 truncate">
                {{ t(`${session.i18nPrefix}.dateLabel`) }}
              </span>
            </span>
            <span
              class="text-[9px] uppercase tracking-wide font-bold rounded-full px-2 py-0.5 shrink-0"
              :class="badgeClass(getSessionStatus(session))"
            >
              {{ t(`paco.tabs.status.${getSessionStatus(session)}`) }}
            </span>
          </li>
        </ul>
      </Transition>
    </div>

    <!-- Desktop : onglets -->
    <div
      ref="tablistEl"
      role="tablist"
      class="hidden lg:flex w-full gap-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-1.5 overflow-x-auto scroll-smooth"
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePacoWebinarData } from '@/composables/paco/usePacoWebinarData'

const props = defineProps({
  sessions: { type: Array, required: true },
  modelValue: { type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const { getSessionStatus } = usePacoWebinarData()

// --- Dropdown mobile ---
const open = ref(false)
const dropdownEl = ref(null)

const activeSession = computed(() =>
  props.sessions.find(s => s.edition === props.modelValue)
)
const activeLabel = computed(() =>
  activeSession.value ? t(`paco.tabs.session${activeSession.value.edition}`) : ''
)

function onClickOutside(event) {
  if (!open.value) return
  if (dropdownEl.value && !dropdownEl.value.contains(event.target)) {
    open.value = false
  }
}
function onEscape(event) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onEscape)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onEscape)
})

// --- Onglets desktop (centrage de l'actif) ---
const tablistEl = ref(null)
const tabRefs = new Map()

function setTabRef(el, edition) {
  if (el) tabRefs.set(edition, el)
  else tabRefs.delete(edition)
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

onMounted(async () => {
  await nextTick()
  scrollActiveIntoView('auto')
})

watch(() => props.modelValue, async () => {
  await nextTick()
  scrollActiveIntoView('smooth')
})

function selectSession(edition) {
  open.value = false
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
