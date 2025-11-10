<template>
  <!-- Popup de notification pour le direct en cours -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show && !dismissed"
        class="fixed bottom-6 right-6 z-50 max-w-md"
        role="alert"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Header avec badge LIVE -->
          <div class="bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span class="text-white font-semibold text-sm">{{ t('livestream.liveNow') }}</span>
            </div>
            <button
              @click="dismiss"
              class="text-white hover:text-gray-200 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Thumbnail -->
          <div class="relative">
            <img
              :src="activity.cover_image_low_url || '/images/default-activity.jpg'"
              :alt="activity.title"
              class="w-full h-48 object-cover"
            />
            <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <svg class="w-16 h-16 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
              {{ activity.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ activity.organization?.name }}
            </p>

            <!-- Actions -->
            <div class="flex gap-2">
              <router-link
                :to="`/programmation/${activity.id}`"
                class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors text-center cursor-pointer"
                @click="dismiss"
              >
                {{ t('livestream.watchNow') }}
              </router-link>
              <button
                @click="dismissPermanently"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                {{ t('common.later') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

// Props
const props = defineProps({
  activity: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: true
  }
})

// État
const dismissed = ref(false)
const permanentlyDismissed = ref(false)

// Clé de stockage local basée sur l'ID de l'activité
const storageKey = `livestream-dismissed-${props.activity.id}`

// Méthodes
const dismiss = () => {
  dismissed.value = true
}

const dismissPermanently = () => {
  dismissed.value = true
  permanentlyDismissed.value = true
  localStorage.setItem(storageKey, 'true')
}

// Vérifier si on est sur la page de détail de l'activité
const isOnActivityPage = () => {
  return route.name === 'ProgrammationDetail' && route.params.id === props.activity.id
}

// Watchers
watch(() => route.path, () => {
  // Masquer la notification si on est sur la page de l'activité
  if (isOnActivityPage()) {
    dismissed.value = true
  }
})

// Lifecycle
onMounted(() => {
  // Vérifier si l'utilisateur a déjà masqué cette notification
  const wasDismissed = localStorage.getItem(storageKey)
  if (wasDismissed) {
    dismissed.value = true
    permanentlyDismissed.value = true
  }

  // Masquer si on est déjà sur la page de l'activité
  if (isOnActivityPage()) {
    dismissed.value = true
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(400px);
}
</style>
