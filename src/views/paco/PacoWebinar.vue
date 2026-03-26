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
import PacoPresentation from '@/components/paco/PacoPresentation.vue'
import PacoCountdown from '@/components/paco/PacoCountdown.vue'
import PacoQuickRegister from '@/components/paco/PacoQuickRegister.vue'
import PacoJoinSection from '@/components/paco/PacoJoinSection.vue'

const { t } = useI18n()

// SEO - OG meta tags pour le partage sur les réseaux sociaux
const PACO_OG_IMAGE = 'https://epavillonclimatique.francophonie.org/images/og_affiche_paco_avec_ecriture.jpg'
useSEO({
  title: 'Webinaire PACO - Collectivités locales face au changement climatique',
  description: 'Collectivites locales face au changement climatique : gouvernance, planification et financements pour l\'adaptation. Jeudi 26 mars 2026, en ligne, 14h00-15h30 GMT.',
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
