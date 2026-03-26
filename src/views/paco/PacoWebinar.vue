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

            <!-- Step: form (inscription rapide sans auth) -->
            <PacoQuickRegister
              v-if="step === 'form'"
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
import { useSEO } from '@/composables/useSEO'
import { isPacoRegisteredLocally } from '@/composables/paco/usePacoRegistration'
import { supabase } from '@/composables/useSupabase'
import { PACO_ACTIVITY_ID } from '@/composables/paco/constants'
import PacoPresentation from '@/components/paco/PacoPresentation.vue'
import PacoQuickRegister from '@/components/paco/PacoQuickRegister.vue'
import PacoJoinSection from '@/components/paco/PacoJoinSection.vue'

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

// State : form | join
const step = ref('form')

onMounted(() => {
  trackUniqueView()

  // Si déjà inscrit (localStorage), aller directement au bouton join
  if (isPacoRegisteredLocally()) {
    step.value = 'join'
  }
})

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
