<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-[-100%]"
    enter-to-class="transform translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0"
    leave-to-class="transform translate-y-[-100%]"
  >
    <div
      v-if="showNotification && !isDismissed"
      class="fixed top-0 left-0 right-0 z-50 bg-amber-500/95 dark:bg-amber-600/95 text-white shadow-lg"
    >
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center flex-1">
            <svg
              class="w-6 h-6 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="text-sm sm:text-base">
              <p class="font-medium">{{ t('common.browserRecommendation.title') }}</p>
              <p class="text-xs sm:text-sm opacity-90 mt-1">
                {{ t('common.browserRecommendation.message') }}
              </p>
            </div>
          </div>
          <button
            @click="dismiss"
            class="ml-4 text-white hover:text-amber-200 transition-colors cursor-pointer"
            :aria-label="t('common.close')"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const showNotification = ref(false)
const isDismissed = ref(false)

const detectBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase()

  // Détecter si c'est Edge
  const isEdge = userAgent.includes('edg/') || userAgent.includes('edge/')

  // Détecter si c'est Safari (également problématique pour certaines fonctionnalités)
  const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('chromium')

  // Détecter si c'est un navigateur peu supporté
  const isInternetExplorer = userAgent.includes('msie') || userAgent.includes('trident')

  return isEdge || isSafari || isInternetExplorer
}

const dismiss = () => {
  isDismissed.value = true
  // Stocker dans localStorage pour ne pas afficher à chaque fois
  localStorage.setItem('browserRecommendationDismissed', 'true')
  localStorage.setItem('browserRecommendationDismissedDate', new Date().toISOString())
}

onMounted(() => {
  // Vérifier si l'utilisateur a déjà fermé la notification récemment
  const wasDismissed = localStorage.getItem('browserRecommendationDismissed')
  const dismissedDate = localStorage.getItem('browserRecommendationDismissedDate')

  if (wasDismissed && dismissedDate) {
    const daysSinceDismissed = (new Date() - new Date(dismissedDate)) / (1000 * 60 * 60 * 24)
    // Ne pas afficher si fermé il y a moins de 7 jours
    if (daysSinceDismissed < 7) {
      isDismissed.value = true
      return
    }
  }

  // Afficher la notification si navigateur non optimal
  if (detectBrowser()) {
    setTimeout(() => {
      showNotification.value = true
    }, 2000) // Afficher après 2 secondes pour ne pas être trop intrusif
  }
})
</script>