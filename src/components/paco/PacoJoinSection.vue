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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePacoWebinarData } from '@/composables/paco/usePacoWebinarData'
import { PACO_TEAMS_LINK } from '@/composables/paco/constants'
import { trackPacoJoinClick } from '@/composables/paco/usePacoRegistration'
import { useAuth } from '@/composables/useAuth'
import PacoPartnerLogos from './PacoPartnerLogos.vue'

const props = defineProps({
  sessionData: { type: Object, default: null }
})

const { t } = useI18n()
const { currentSession } = usePacoWebinarData()
const { user, isAuthenticated } = useAuth()

const session = computed(() => props.sessionData || currentSession.value)

const PACO_PUBLIC_URL = 'https://epavillonclimatique.francophonie.org/paco'
const linkCopied = ref(false)

/**
 * Tracking non bloquant du clic « Rejoindre le webinaire ».
 * - On ne fait JAMAIS preventDefault : le <a href> Teams navigue normalement.
 * - On ne lit pas le retour du RPC : echec silencieux, l'utilisateur rejoint
 *   quand meme.
 * - Identite : userId si authentifie, sinon email persiste localement lors
 *   de l'inscription (cle paco_registration_data_session_<edition>).
 */
function handleJoinClick() {
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
