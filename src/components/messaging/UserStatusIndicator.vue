<template>
  <div class="relative">
    <div
      class="w-2 h-2 rounded-full transition-all duration-300"
      :class="[
        isOnline ? 'bg-green-400' : 'bg-gray-400',
        isOnline ? 'animate-pulse' : ''
      ]"
      :title="isOnline ? $t('messaging.online') : $t('messaging.offline')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessagingStore } from '@/stores/messaging'

const { t } = useI18n()
const messagingStore = useMessagingStore()

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const isOnline = computed(() => {
  return messagingStore.isUserOnline(props.userId)
})
</script>