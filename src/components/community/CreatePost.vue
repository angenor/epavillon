<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
    <!-- Create Post Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-3">
        <!-- User Avatar -->
        <div class="flex-shrink-0">
          <div 
            v-if="user?.profile_photo_url"
            class="w-10 h-10 rounded-full overflow-hidden"
          >
            <img 
              :src="user.profile_photo_url" 
              :alt="`${user.first_name} ${user.last_name}`"
              class="w-full h-full object-cover"
            >
          </div>
          <div 
            v-else
            class="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-ifdd-green-500 to-ifdd-blue-500 text-white font-semibold"
          >
            {{ getInitials(user) }}
          </div>
        </div>

        <!-- Input Trigger -->
        <button
          @click="openPostModal()"
          class="flex-1 text-left px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
        >
          {{ t('community.createPost.placeholder') }}
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex items-center">
      <button
        @click="openPostModal('testimonial')"
        class="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
          {{ t('community.createPost.testimonial') }}
        </span>
      </button>

      <div class="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

      <button
        @click="openPostModal('innovation')"
        class="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
          {{ t('community.createPost.innovation') }}
        </span>
      </button>

      <div class="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

      <button
        @click="openPostModal('video')"
        class="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
          {{ t('community.createPost.video') }}
        </span>
      </button>
    </div>

    <!-- Create Post Modal -->
    <Teleport to="body">
      <CreatePostModal
        v-if="showModal"
        :type="postType"
        @close="showModal = false"
        @posted="handlePosted"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import CreatePostModal from './CreatePostModal.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const emit = defineEmits(['posted'])

const showModal = ref(false)
const postType = ref('testimonial')

const getInitials = (user) => {
  if (!user) return '?'
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

const openPostModal = (type = 'testimonial') => {
  postType.value = type
  showModal.value = true
}

const handlePosted = () => {
  showModal.value = false
  emit('posted')
}
</script>