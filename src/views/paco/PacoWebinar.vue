<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-900">
    <div class="py-6 px-4 sm:px-6 lg:py-8 lg:px-8">
      <div class="w-full max-w-6xl mx-auto">
        <PacoSessionTabs v-model="activeEdition" :sessions="sessions" />

        <!-- Session 3 (terminée) : replay vidéo -->
        <PacoSession1
          v-if="activeEdition === 1"
          :session-data="sessions[0]"
        />

        <!-- Session 4 (terminée) : replay (ou message « bientôt disponible ») -->
        <PacoSession1
          v-else-if="activeEdition === 2"
          :session-data="sessions[1]"
        />

        <!-- Session 5 (à venir) : inscription -->
        <PacoSession2
          v-else-if="activeEdition === 3"
          :session-data="sessions[2]"
          :step="step"
          :page-loading="pageLoading"
          @registration-complete="handleRegistrationComplete"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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
import { usePacoWebinarData } from '@/composables/paco/usePacoWebinarData'
import PacoSessionTabs from '@/components/paco/PacoSessionTabs.vue'
import PacoSession1 from '@/components/paco/PacoSession1.vue'
import PacoSession2 from '@/components/paco/PacoSession2.vue'

const { sessions, currentSession } = usePacoWebinarData()

// SEO - OG meta tags pour le partage sur les réseaux sociaux
const PACO_OG_IMAGE = 'https://epavillonclimatique.francophonie.org/images/paco_n5.jpg'
useSEO({
  title: 'Webinaire PACO - Santé publique et adaptation aux impacts climatiques',
  description: 'Webinaire PACO sur la santé publique et l\'adaptation aux impacts climatiques : canicules, maladies vectorielles et systèmes de prévention. Jeudi 28 mai 2026, en ligne, 14h00-15h30 GMT.',
  image: PACO_OG_IMAGE,
  url: 'https://epavillonclimatique.francophonie.org/paco',
  type: 'website',
  og: { type: 'website' },
  twitter: { card: 'summary_large_image' }
})

const { isAuthenticated, user } = useAuth()
const { checkPacoRegistration } = usePacoRegistration()

// État
const activeEdition = ref(currentSession.value.edition)
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
