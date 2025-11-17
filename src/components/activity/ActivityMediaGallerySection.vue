<template>
  <div
    id="media-gallery"
    class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
  >
    <!-- En-tête -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
          <svg
            class="w-5 h-5 text-purple-600 dark:text-purple-400"
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
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('activities.mediaGallery') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('activities.mediaGalleryDescription') }}
          </p>
        </div>
      </div>

      <!-- Bouton ajouter -->
      <button
        v-if="canAddMedia"
        @click="$emit('add-media')"
        class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        {{ t('activities.addPhoto') }}
      </button>
    </div>

    <!-- Liste des médias -->
    <div v-if="medias.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="media in medias"
        :key="media.id"
        class="group relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
      >
        <!-- Image -->
        <div
          class="aspect-video cursor-pointer overflow-hidden"
          @click="$emit('view-media', media)"
        >
          <img
            :src="media.thumbnail_url || media.media_url"
            :alt="media.title"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        <!-- Informations -->
        <div class="p-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
            {{ media.title }}
          </h3>
          <p
            v-if="media.description"
            class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2"
          >
            {{ media.description }}
          </p>
          <div class="flex items-center justify-between">
            <p v-if="media.author" class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('activities.photoBy') }}: {{ media.author }}
            </p>
            <button
              v-if="canAddMedia"
              @click="$emit('remove-media', media.id)"
              class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
              :title="t('common.delete')"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Badge date -->
        <div class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {{ formatDate(media.created_at) }}
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div
      v-else
      class="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
    >
      <svg
        class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
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
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        {{ t('activities.noMediaYet') }}
      </p>
      <button
        v-if="canAddMedia"
        @click="$emit('add-media')"
        class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        {{ t('activities.addFirstPhoto') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

const { t, locale } = useI18n()

defineProps({
  medias: {
    type: Array,
    required: true
  },
  isActivityApproved: {
    type: Boolean,
    default: false
  },
  canAddMedia: {
    type: Boolean,
    default: true
  }
})

defineEmits(['add-media', 'remove-media', 'view-media'])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const dateLocale = locale.value === 'fr' ? fr : enUS
  return format(new Date(dateString), 'PPP', { locale: dateLocale })
}
</script>
