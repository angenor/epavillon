<template>
  <div
    v-if="medias.length > 0"
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 transition-colors duration-200"
  >
    <!-- En-tête de la section -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <svg
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('activities.mediaGallery') }}
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {{ mediaCount }}
          </p>
        </div>
      </div>
    </div>

    <!-- Grille de photos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      <div
        v-for="(media, index) in medias"
        :key="media.id"
        class="group relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        @click="openMediaViewer(index)"
      >
        <!-- Image -->
        <div class="aspect-square overflow-hidden">
          <img
            :src="media.thumbnail_url || media.media_url"
            :alt="media.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <!-- Overlay au hover -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3 class="font-semibold text-white text-sm sm:text-base line-clamp-2 mb-1">
                {{ media.title }}
              </h3>
              <p v-if="media.author" class="text-xs text-white/80">
                {{ t('activities.photoBy') }}: {{ media.author }}
              </p>
            </div>
          </div>
        </div>

        <!-- Badge compteur -->
        <div class="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {{ index + 1 }}/{{ medias.length }}
        </div>

        <!-- Icône zoom -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-xl">
            <svg class="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de visualisation -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showViewer"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          @click="closeMediaViewer"
        >
          <div class="relative w-full h-full flex items-center justify-center p-4">
            <!-- Bouton fermer -->
            <button
              @click.stop="closeMediaViewer"
              class="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors cursor-pointer"
              :aria-label="t('common.close')"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Navigation précédente -->
            <button
              v-if="medias.length > 1"
              @click.stop="previousMedia"
              class="absolute left-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors cursor-pointer"
              :aria-label="t('common.previous')"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <!-- Navigation suivante -->
            <button
              v-if="medias.length > 1"
              @click.stop="nextMedia"
              class="absolute right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors cursor-pointer"
              :aria-label="t('common.next')"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <!-- Contenu du modal -->
            <div
              @click.stop
              class="relative max-w-7xl max-h-full flex flex-col"
            >
              <!-- Image principale -->
              <div class="flex-1 flex items-center justify-center mb-4">
                <img
                  :src="currentMedia?.media_url"
                  :alt="currentMedia?.title"
                  class="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-2xl"
                />
              </div>

              <!-- Informations -->
              <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 max-w-3xl mx-auto w-full">
                <h3 class="text-xl sm:text-2xl font-bold text-white mb-2">
                  {{ currentMedia?.title }}
                </h3>
                <p
                  v-if="currentMedia?.description"
                  class="text-sm sm:text-base text-white/80 mb-3"
                >
                  {{ currentMedia?.description }}
                </p>
                <div class="flex items-center justify-between text-xs sm:text-sm text-white/70">
                  <p v-if="currentMedia?.author">
                    {{ t('activities.photoBy') }}: {{ currentMedia.author }}
                  </p>
                  <p>
                    {{ currentIndex + 1 }} / {{ medias.length }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  medias: {
    type: Array,
    required: true,
    default: () => []
  }
})

// État du viewer
const showViewer = ref(false)
const currentIndex = ref(0)

// Computed
const currentMedia = computed(() => props.medias[currentIndex.value])

const mediaCount = computed(() => {
  const count = props.medias.length
  return count === 1
    ? t('activities.onePhoto')
    : t('activities.photosCount', { count })
})

// Méthodes
const openMediaViewer = (index) => {
  currentIndex.value = index
  showViewer.value = true
  // Empêcher le scroll du body
  document.body.style.overflow = 'hidden'
}

const closeMediaViewer = () => {
  showViewer.value = false
  // Réactiver le scroll du body
  document.body.style.overflow = ''
}

const nextMedia = () => {
  currentIndex.value = (currentIndex.value + 1) % props.medias.length
}

const previousMedia = () => {
  currentIndex.value = (currentIndex.value - 1 + props.medias.length) % props.medias.length
}

// Support des touches clavier
const handleKeydown = (event) => {
  if (!showViewer.value) return

  if (event.key === 'Escape') {
    closeMediaViewer()
  } else if (event.key === 'ArrowRight') {
    nextMedia()
  } else if (event.key === 'ArrowLeft') {
    previousMedia()
  }
}

// Écouter les événements clavier
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
/* Animations pour le modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Animation pour les cartes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
