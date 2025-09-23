<template>
  <div v-if="show && selectedPhoto" class="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50" @click="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl max-h-[90vh] overflow-hidden" @click.stop>
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ selectedPhoto.name }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
            <font-awesome-icon :icon="['fas', 'times']" class="text-xl" />
          </button>
        </div>
        <div class="flex justify-center">
          <img
            :src="selectedPhoto.url"
            :alt="selectedPhoto.name"
            class="max-w-full max-h-[70vh] object-contain rounded-lg"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  selectedPhoto: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])
</script>