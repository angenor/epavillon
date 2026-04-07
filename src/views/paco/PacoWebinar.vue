<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-900">
    <!-- Content -->
    <div class="flex items-start justify-center py-6 px-4 sm:px-6 lg:py-8 lg:px-8">
      <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-start">

        <!-- Left : PACO Info (below on mobile, left on desktop) -->
        <div class="lg:col-span-3 order-2 lg:order-1">
          <PacoPresentation />
        </div>


        <!-- Right: Action panel (top on mobile, sticky right on desktop) -->
        <div class="lg:col-span-2 lg:sticky lg:top-24 order-1 lg:order-2 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-white/20 lg:scrollbar-track-transparent">
          <div class="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">

            <!-- Countdown / horaires (toujours visible) -->
            <PacoCountdown />

            <!-- Timeline horizontale des sessions -->
            <div class="mb-5">
              <p class="text-[10px] text-white/40 uppercase tracking-widest mb-3 text-center">{{ t('paco.presentation.timelineTitle') }}</p>
              <div class="relative flex items-start">
                <div class="absolute top-3 h-px bg-white/15" :style="{ left: `calc(50% / ${webinar.pastSessions.length + 1})`, right: `calc(50% / ${webinar.pastSessions.length + 1})` }"></div>
                <div
                  v-for="session in webinar.pastSessions"
                  :key="session.edition"
                  class="relative flex flex-col items-center text-center flex-1"
                >
                  <div class="w-6 h-6 rounded-full bg-green-500/20 border border-green-400/50 flex items-center justify-center z-10">
                    <font-awesome-icon :icon="['fas', 'check']" class="text-green-400 text-[10px]" />
                  </div>
                  <span class="text-white/50 font-medium text-xs mt-2">#{{ session.edition }}</span>
                  <span class="text-white/40 text-[11px] leading-tight">{{ formatSessionDate(session.date) }}</span>
                  <span class="bg-green-500/15 text-green-400 text-[9px] uppercase tracking-wide font-semibold rounded-full px-2 py-0.5 mt-1">
                    {{ t('paco.presentation.status.ended') }}
                  </span>
                </div>
                <div class="relative flex flex-col items-center text-center flex-1">
                  <div class="w-6 h-6 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center z-10 animate-pulse">
                    <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                  </div>
                  <span class="text-white font-semibold text-xs mt-2">#{{ webinar.edition }}</span>
                  <span class="text-white text-[11px] font-medium leading-tight">{{ t('paco.presentation.dateLabel') }}</span>
                  <span class="bg-amber-500/15 text-amber-400 text-[9px] uppercase tracking-wide font-semibold rounded-full px-2 py-0.5 mt-1">
                    {{ t('paco.presentation.timelineCurrent') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="pageLoading" class="text-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white mx-auto mb-4"></div>
              <p class="text-white/60 text-sm">{{ t('paco.emailCheck.checking') }}</p>
            </div>

            <!-- Step: form (inscription rapide sans auth) -->
            <PacoQuickRegister
              v-else-if="step === 'form'"
              @registration-complete="handleRegistrationComplete"
            />

            <!-- Step: join -->
            <PacoJoinSection v-else-if="step === 'join'" />

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useSEO } from '@/composables/useSEO'
import { usePacoRegistration, isPacoRegisteredLocally, markPacoRegistered } from '@/composables/paco/usePacoRegistration'
import { supabase } from '@/composables/useSupabase'
import { PACO_ACTIVITY_ID } from '@/composables/paco/constants'
import { usePacoWebinarData } from '@/composables/paco/usePacoWebinarData'
import PacoPresentation from '@/components/paco/PacoPresentation.vue'
import PacoCountdown from '@/components/paco/PacoCountdown.vue'
import PacoQuickRegister from '@/components/paco/PacoQuickRegister.vue'
import PacoJoinSection from '@/components/paco/PacoJoinSection.vue'

const { t, locale } = useI18n()
const { webinar } = usePacoWebinarData()

function formatSessionDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00Z')
  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// SEO - OG meta tags pour le partage sur les réseaux sociaux
const PACO_OG_IMAGE = 'https://epavillonclimatique.francophonie.org/images/og_affiche_paco_avec_ecriture.jpg'
useSEO({
  title: 'Webinaire PACO - Collectivités locales face au changement climatique',
  description: 'Collectivites locales face au changement climatique : gouvernance, planification et financements pour l\'adaptation. Dimanche 26 avril 2026, en ligne, 14h00-15h30 GMT.',
  image: PACO_OG_IMAGE,
  url: 'https://epavillonclimatique.francophonie.org/paco',
  type: 'website',
  og: { type: 'website' },
  twitter: { card: 'summary_large_image' }
})

const { isAuthenticated, user } = useAuth()
const { checkPacoRegistration } = usePacoRegistration()

// State : loading | form | join
const step = ref('form')
const pageLoading = ref(true)

onMounted(async () => {
  trackUniqueView()
  await checkInitialState()
})

/**
 * Vérifie l'état initial :
 * 1. Si authentifié → vérifier inscription PACO en BD
 * 2. Sinon → vérifier localStorage
 * 3. Sinon → formulaire d'inscription rapide
 */
async function checkInitialState() {
  pageLoading.value = true

  try {
    // 1. Utilisateur authentifié → vérifier en BD
    if (isAuthenticated.value && user.value) {
      const registered = await checkPacoRegistration(user.value.id)
      if (registered) {
        markPacoRegistered()
        step.value = 'join'
        return
      }
    }

    // 2. Vérifier localStorage (inscriptions sans auth)
    if (isPacoRegisteredLocally()) {
      step.value = 'join'
      return
    }

    // 3. Aucune inscription trouvée → formulaire
    step.value = 'form'
  } catch (err) {
    console.error('Error checking initial state:', err)
    // En cas d'erreur, vérifier localStorage en fallback
    step.value = isPacoRegisteredLocally() ? 'join' : 'form'
  } finally {
    pageLoading.value = false
  }
}

/**
 * Track unique page view using localStorage to avoid counting the same visitor twice.
 */
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

/**
 * Inscription terminée — afficher le bouton join
 */
function handleRegistrationComplete() {
  step.value = 'join'
}
</script>
