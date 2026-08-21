<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-900">
    <div class="py-6 px-4 sm:px-6 lg:py-8 lg:px-8">
      <div class="w-full max-w-6xl mx-auto">
        <PacoSessionTabs v-model="activeEdition" :sessions="sessions" />

        <!-- Sessions terminées (1, 2, 3, 4) : replay vidéo -->
        <PacoSession1
          v-if="activeSession && activeSession.completed"
          :key="activeSession.edition"
          :session-data="activeSession"
        />

        <!-- Sessions à venir / en direct (5, 6) : inscription ou replay -->
        <PacoSession2
          v-else-if="activeSession"
          :key="activeSession.edition"
          :session-data="activeSession"
          :step="step"
          :page-loading="pageLoading"
          @registration-complete="handleRegistrationComplete"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useSEO } from '@/composables/useSEO'
import {
  usePacoRegistration,
  isPacoRegisteredLocally,
  markPacoRegistered,
  migrateLegacyLocalStorage,
} from '@/composables/paco/usePacoRegistration'
import { supabase } from '@/composables/useSupabase'
import { PACO_ACTIVITY_ID } from '@/composables/paco/constants'
import { usePacoWebinarData, areRegistrationsClosed } from '@/composables/paco/usePacoWebinarData'
import PacoSessionTabs from '@/components/paco/PacoSessionTabs.vue'
import PacoSession1 from '@/components/paco/PacoSession1.vue'
import PacoSession2 from '@/components/paco/PacoSession2.vue'

const { t } = useI18n()
const { sessions, currentSession } = usePacoWebinarData()

// SEO - meta tags pour le partage sur les réseaux sociaux.
// Dérivés de la session courante afin de rester à jour à chaque nouvelle édition.
// Volontairement sans image : l'aperçu se limite au titre et à la description,
// une illustration générique prêtant à confusion sur la session concernée.
const SITE_ORIGIN = 'https://epavillonclimatique.francophonie.org'
const seoPrefix = currentSession.value.i18nPrefix
useSEO({
  title: `Webinaire PACO - ${t(`${seoPrefix}.title`)}`,
  description: `${t(`${seoPrefix}.subtitle`)}. ${t(`${seoPrefix}.dateLabel`)}, en ligne, ${t(`${seoPrefix}.timeLabel`)}.`,
  url: `${SITE_ORIGIN}/paco`,
  type: 'website',
  noImage: true,
  og: { type: 'website' },
  twitter: { card: 'summary' }
})

const { isAuthenticated, user } = useAuth()
const { checkPacoRegistration } = usePacoRegistration()

// État
const activeEdition = ref(currentSession.value.edition)
const activeSession = computed(() => sessions.value.find(s => s.edition === activeEdition.value))
const step = ref('form')
const pageLoading = ref(true)

onMounted(async () => {
  migrateLegacyLocalStorage()
  trackUniqueView()
  await checkInitialState(activeEdition.value)
})

watch(activeEdition, async (newEdition) => {
  await checkInitialState(newEdition)
})

/**
 * Vérifie l'état initial pour la session active.
 * Session 3 (terminée) → état neutre (replay), pas de check inscription.
 * Session 4 (à venir) → check inscription DB ou localStorage.
 */
async function checkInitialState(edition) {
  pageLoading.value = true

  // Pour une session terminée (replay), pas d'inscription à vérifier.
  const target = sessions.value.find(s => s.edition === edition)
  if (target?.completed) {
    pageLoading.value = false
    return
  }

  // Suspension automatique : 30 min après l'heure de fin, les inscriptions
  // sont fermées même si la session n'a pas encore été marquée `completed`.
  if (areRegistrationsClosed(target)) {
    step.value = 'closed'
    pageLoading.value = false
    return
  }

  try {
    if (isAuthenticated.value && user.value) {
      const registered = await checkPacoRegistration(user.value.id, edition)
      if (registered) {
        markPacoRegistered(edition)
        step.value = 'join'
        return
      }
    }

    if (isPacoRegisteredLocally(edition)) {
      step.value = 'join'
      return
    }

    step.value = 'form'
  } catch (err) {
    console.error('Error checking initial state:', err)
    step.value = isPacoRegisteredLocally(edition) ? 'join' : 'form'
  } finally {
    pageLoading.value = false
  }
}

async function trackUniqueView() {
  const STORAGE_KEY = 'paco_page_viewed'
  if (localStorage.getItem(STORAGE_KEY)) return

  try {
    const { error } = await supabase.rpc('increment_activity_view_count', {
      activity_uuid: PACO_ACTIVITY_ID
    })
    if (!error) {
      localStorage.setItem(STORAGE_KEY, '1')
    }
  } catch {
    // Non-blocking
  }
}

function handleRegistrationComplete() {
  step.value = 'join'
}
</script>
