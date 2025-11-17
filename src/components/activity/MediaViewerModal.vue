<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show && media"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/90"
        @click.self="$emit('close')"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Bouton fermer -->
          <button
            @click="$emit('close')"
            class="absolute top-4 right-4 text-white hover:text-gray-300 cursor-pointer z-10"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Contenu -->
          <div class="relative max-w-6xl w-full">
            <!-- Image -->
            <img
              :src="media.media_url"
              :alt="media.title"
              class="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />

            <!-- Informations -->
            <div class="mt-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 text-white">
              <h3 class="text-xl font-semibold mb-2">{{ media.title }}</h3>
              <p v-if="media.description" class="text-gray-300 mb-2">
                {{ media.description }}
              </p>
              <div class="flex items-center justify-between text-sm text-gray-400">
                <span v-if="media.author">{{ t('activities.photoBy') }}: {{ media.author }}</span>
                <span>{{ formatDate(media.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

const { t, locale } = useI18n()

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  media: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const dateLocale = locale.value === 'fr' ? fr : enUS
  return format(new Date(dateString), 'PPP', { locale: dateLocale })
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
