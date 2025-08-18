<template>
  <div class="relative">
    <!-- Bouton notifications -->
    <button 
      @click="toggleDropdown"
      class="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
      :title="$t('notifications.title')"
    >
      <font-awesome-icon :icon="['fas', 'bell']" class="w-5 h-5" />
      <!-- Badge de notification -->
      <span 
        v-if="unreadCount > 0" 
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center font-medium animate-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      @click.stop
      class="absolute right-0 mt-2 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
    >
      <!-- En-tête -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('notifications.title') }}
          <span v-if="unreadCount > 0" class="ml-2 text-sm text-gray-500">({{ unreadCount }})</span>
        </h3>
        <button
          v-if="unreadCount > 0"
          @click="handleMarkAllAsRead"
          class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {{ $t('notifications.markAllRead') }}
        </button>
      </div>

      <!-- Liste des notifications -->
      <div class="max-h-80 overflow-y-auto">
        <!-- État de chargement -->
        <div v-if="loading" class="p-4 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
        </div>

        <!-- Aucune notification -->
        <div v-else-if="notifications.length === 0" class="p-6 text-center">
          <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-1h1a1 1 0 011 1v12z" />
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('notifications.empty') }}</p>
        </div>

        <!-- Notifications -->
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            :class="[
              'p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer',
              !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            ]"
          >
            <div class="flex items-start space-x-3">
              <!-- Avatar ou icône -->
              <div class="flex-shrink-0">
                <div v-if="notification.notification_type === 'connection_request'" class="relative">
                  <img
                    v-if="notification.connections?.users?.profile_photo_thumbnail_url"
                    :src="notification.connections.users.profile_photo_thumbnail_url"
                    :alt="`${notification.connections.users.first_name} ${notification.connections.users.last_name}`"
                    class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-medium"
                  >
                    {{ getInitials(notification.connections?.users?.first_name, notification.connections?.users?.last_name) }}
                  </div>
                  <!-- Badge d'icône de connexion -->
                  <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div v-else class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'bell']" class="w-5 h-5 text-gray-500" />
                </div>
              </div>

              <!-- Contenu -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ notification.title }}
                  </p>
                  <div class="flex items-center space-x-2">
                    <span v-if="!notification.is_read" class="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatTimeAgo(notification.created_at) }}
                    </span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {{ notification.content }}
                </p>
                
                <!-- Actions pour demandes de connexion -->
                <div 
                  v-if="notification.notification_type === 'connection_request' && notification.connections?.status === 'pending'"
                  class="flex items-center space-x-2 mt-3"
                  @click.stop
                >
                  <button
                    @click="handleAcceptConnection(notification)"
                    class="px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                  >
                    {{ $t('profile.connections.accept') }}
                  </button>
                  <button
                    @click="handleRejectConnection(notification)"
                    class="px-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    {{ $t('profile.connections.reject') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pied de page -->
      <div class="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <router-link
          to="/notifications"
          @click="closeDropdown"
          class="block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {{ $t('notifications.viewAll') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'
import { useConnections } from '@/composables/useConnections'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const {
  notifications,
  loading,
  unreadCount,
  getNotifications,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications
} = useNotifications()

const {
  acceptConnectionRequest,
  rejectConnectionRequest
} = useConnections()

const isOpen = ref(false)
let subscription = null

// Méthodes
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && notifications.value.length === 0) {
    getNotifications()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleNotificationClick = async (notification) => {
  // Marquer comme lue
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }

  // Navigation selon le type
  if (notification.notification_type === 'connection_request') {
    router.push('/profile')
    closeDropdown()
  }
}

const handleAcceptConnection = async (notification) => {
  const result = await acceptConnectionRequest(notification.related_entity_id)
  if (result.success) {
    // Marquer la notification comme lue
    await markAsRead(notification.id)
    // Recharger les notifications
    await getNotifications()
  }
}

const handleRejectConnection = async (notification) => {
  const result = await rejectConnectionRequest(notification.related_entity_id)
  if (result.success) {
    // Marquer la notification comme lue
    await markAsRead(notification.id)
    // Recharger les notifications
    await getNotifications()
  }
}

const handleMarkAllAsRead = async () => {
  await markAllAsRead()
}

const getInitials = (firstName, lastName) => {
  if (!firstName || !lastName) return 'U'
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return t('notifications.timeAgo.justNow')
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return t('notifications.timeAgo.minutesAgo', { minutes })
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return t('notifications.timeAgo.hoursAgo', { hours })
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return t('notifications.timeAgo.daysAgo', { days })
  }
}

// Fermer le dropdown quand on clique ailleurs
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    isOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // S'abonner aux notifications en temps réel si connecté
  if (authStore.isAuthenticated && authStore.user?.id) {
    subscription = subscribeToNotifications(authStore.user.id)
    getNotifications()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  
  // Désabonnement
  if (subscription) {
    subscription.unsubscribe()
  }
})
</script>