<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <font-awesome-icon :icon="['fas', 'image']" class="mr-3 text-ifdd-bleu" />
        {{ t('events.tabs.banners') }}
      </h2>
    </div>
    <div class="p-6 space-y-6">
      <div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ t('events.coverImage') }}
        </h3>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <!-- Bannière actuelle si elle existe -->
          <div v-if="activity.cover_image_high_url && !editingBanner" class="relative mb-4">
            <img
              :src="activity.cover_image_high_url"
              alt="Cover"
              class="w-full aspect-video object-cover rounded-lg"
            >
            <button
              @click="$emit('toggle-editing')"
              class="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-opacity cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'edit']" />
            </button>
          </div>

          <!-- Image par défaut si pas de bannière -->
          <div v-else-if="!activity.cover_image_high_url && !editingBanner" class="relative mb-4">
            <img
              src="/images/example/event_banniere_par_defaut_16_9.jpg"
              alt="Cover par défaut"
              class="w-full aspect-video object-cover rounded-lg opacity-60"
            >
            <div class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <span class="text-white text-lg font-medium">{{ t('events.defaultBanner') }}</span>
            </div>
          </div>

          <!-- Éditeur d'image 16:9 -->
          <ImageCropper16x9
            v-if="editingBanner || !activity.cover_image_high_url"
            :initial-image="activity.cover_image_high_url"
            @image-selected="onBannerImageSelected"
            @image-processed="$emit('banner-processed', $event)"
          />

          <!-- Bouton d'upload si pas en mode édition -->
          <div v-if="!editingBanner && activity.cover_image_high_url" class="text-center">
            <button
              @click="$emit('toggle-editing')"
              class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce transition-colors cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'image']" class="mr-2" />
              {{ t('events.changeBanner') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import ImageCropper16x9 from '@/components/ui/ImageCropper16x9.vue'

const { t } = useI18n()

defineProps({
  activity: {
    type: Object,
    required: true
  },
  editingBanner: {
    type: Boolean,
    required: true
  }
})

defineEmits(['toggle-editing', 'banner-processed'])

const onBannerImageSelected = (file) => {
  console.log('Image selected for banner:', file.name)
}
</script>