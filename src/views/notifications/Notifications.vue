<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- En-tête de la page -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ t('notifications.title') }}
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ t('notifications.description') }}
            </p>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center space-x-3">
            <!-- Marquer toutes comme lues -->
            <button
              v-if="unreadCount > 0"
              @click="handleMarkAllAsRead"
              :disabled="markingAllAsRead"
              class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <span v-if="markingAllAsRead">{{ t('common.loading') }}...</span>
              <span v-else>{{ t('notifications.markAllRead') }} ({{ unreadCount }})</span>
            </button>
            
            <!-- Filtres -->
            <div class="relative">
              <button
                @click="showFilters = !showFilters"
                class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                :title="t('notifications.filters')"
              >
                <font-awesome-icon :icon="['fas', 'filter']" class="w-5 h-5" />
              </button>
              
              <!-- Menu des filtres -->
              <div
                v-if="showFilters"
                @click.stop
                class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-10"
              >
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {{ t('notifications.filters') }}
                </h3>
                
                <!-- Filtre par type -->
                <div class="mb-4">
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {{ t('notifications.type') }}
                  </label>
                  <select
                    v-model="selectedType"
                    class="w-full p-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{{ t('notifications.allTypes') }}</option>
                    <option value="connection_request">{{ t('notifications.types.connectionRequest') }}</option>
                    <option value="activity_validation">{{ t('notifications.types.activityValidation') }}</option>
                    <option value="message_received">{{ t('notifications.types.messageReceived') }}</option>
                    <option value="system_announcement">{{ t('notifications.types.systemAnnouncement') }}</option>
                  </select>
                </div>
                
                <!-- Filtre par statut de lecture -->
                <div class="mb-4">
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {{ t('notifications.status') }}
                  </label>
                  <select
                    v-model="selectedStatus"
                    class="w-full p-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{{ t('notifications.allStatuses') }}</option>
                    <option value="unread">{{ t('notifications.statuses.unread') }}</option>
                    <option value="read">{{ t('notifications.statuses.read') }}</option>
                  </select>
                </div>
                
                <!-- Actions de filtre -->
                <div class="flex items-center justify-between">
                  <button
                    @click="resetFilters"
                    class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {{ t('common.reset') }}
                  </button>
                  <button
                    @click="showFilters = false"
                    class="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {{ t('common.apply') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Statistiques -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'bell']" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ notifications.length }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('notifications.total') }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'envelope']" class="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ unreadCount }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('notifications.unread') }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'check']" class="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ readCount }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('notifications.read') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Liste des notifications -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- État de chargement -->
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">{{ t('common.loading') }}</p>
        </div>
        
        <!-- Erreur -->
        <div v-else-if="error" class="p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-red-600 dark:text-red-400 font-medium">{{ t('notifications.error') }}</p>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ error }}</p>
          <button
            @click="loadNotifications"
            class="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            {{ t('common.retry') }}
          </button>
        </div>
        
        <!-- Aucune notification -->
        <div v-else-if="filteredNotifications.length === 0" class="p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-1h1a1 1 0 011 1v12z" />
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400 font-medium">
            {{ notifications.length === 0 ? t('notifications.empty') : t('notifications.noResults') }}
          </p>
          <p v-if="notifications.length > 0" class="mt-2 text-sm text-gray-400">
            {{ t('notifications.tryDifferentFilters') }}
          </p>
        </div>
        
        <!-- Notifications -->
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            :class="[
              'p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer',
              !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            ]"
          >
            <div class="flex items-start space-x-4">
              <!-- Avatar ou icône -->
              <div class="flex-shrink-0">
                <div v-if="notification.notification_type === 'connection_request'" class="relative">
                  <img
                    v-if="notification.connections?.users?.profile_photo_thumbnail_url"
                    :src="notification.connections.users.profile_photo_thumbnail_url"
                    :alt="`${notification.connections.users.first_name} ${notification.connections.users.last_name}`"
                    class="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                  <div
                    v-else
                    class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-medium"
                  >
                    {{ getInitials(notification.connections?.users?.first_name, notification.connections?.users?.last_name) }}
                  </div>
                  <!-- Badge d'icône -->
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div v-else class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <font-awesome-icon 
                    :icon="getNotificationIcon(notification.notification_type)" 
                    class="w-6 h-6 text-gray-500" 
                  />
                </div>
              </div>
              
              <!-- Contenu -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-lg font-medium text-gray-900 dark:text-white">
                    {{ notification.title }}
                  </p>
                  <div class="flex items-center space-x-3">
                    <span v-if="!notification.is_read" class="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatTimeAgo(notification.created_at) }}
                    </span>
                    <!-- Menu d'actions -->
                    <div class="relative">
                      <button
                        @click.stop="toggleNotificationMenu(notification.id)"
                        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <font-awesome-icon :icon="['fas', 'ellipsis-v']" class="w-4 h-4" />
                      </button>
                      
                      <!-- Menu dropdown -->
                      <div
                        v-if="openMenuId === notification.id"
                        @click.stop
                        class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20"
                      >
                        <button
                          v-if="!notification.is_read"
                          @click="markAsRead(notification.id)"
                          class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <font-awesome-icon :icon="['fas', 'check']" class="w-4 h-4 mr-2" />
                          {{ t('notifications.markAsRead') }}
                        </button>
                        <button
                          v-else
                          @click="markAsUnread(notification.id)"
                          class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <font-awesome-icon :icon="['fas', 'envelope']" class="w-4 h-4 mr-2" />
                          {{ t('notifications.markAsUnread') }}
                        </button>
                        <button
                          @click="deleteNotification(notification.id)"
                          class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4 mr-2" />
                          {{ t('common.delete') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p class="mt-2 text-gray-600 dark:text-gray-300">
                  {{ notification.content }}
                </p>
                
                <!-- Type de notification -->
                <div class="mt-3 flex items-center space-x-2">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getNotificationTypeColor(notification.notification_type)
                  ]">
                    {{ t(`notifications.types.${notification.notification_type}`) }}
                  </span>
                  
                  <!-- Actions pour demandes de connexion -->
                  <div 
                    v-if="notification.notification_type === 'connection_request' && notification.connections?.status === 'pending'"
                    class="flex items-center space-x-2"
                    @click.stop
                  >
                    <button
                      @click="handleAcceptConnection(notification)"
                      class="px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                    >
                      {{ t('profile.connections.accept') }}
                    </button>
                    <button
                      @click="handleRejectConnection(notification)"
                      class="px-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      {{ t('profile.connections.reject') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination si nécessaire -->
      <div v-if="filteredNotifications.length > 0" class="mt-8 flex justify-center">
        <button
          v-if="notifications.length >= 20"
          @click="loadMoreNotifications"
          :disabled="loadingMore"
          class="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <span v-if="loadingMore">{{ t('common.loading') }}...</span>
          <span v-else>{{ t('notifications.loadMore') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
  error,
  unreadCount,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification: deleteNotificationAction,
  subscribeToNotifications
} = useNotifications()

const {
  acceptConnectionRequest,
  rejectConnectionRequest
} = useConnections()

// États locaux
const showFilters = ref(false)
const selectedType = ref('')
const selectedStatus = ref('')
const openMenuId = ref(null)
const markingAllAsRead = ref(false)
const loadingMore = ref(false)
let subscription = null

// Computed
const readCount = computed(() => notifications.value.filter(n => n.is_read).length)

const filteredNotifications = computed(() => {
  let filtered = [...notifications.value]
  
  // Filtre par type
  if (selectedType.value) {
    filtered = filtered.filter(n => n.notification_type === selectedType.value)
  }
  
  // Filtre par statut de lecture
  if (selectedStatus.value === 'read') {
    filtered = filtered.filter(n => n.is_read)
  } else if (selectedStatus.value === 'unread') {
    filtered = filtered.filter(n => !n.is_read)
  }
  
  return filtered
})

// Méthodes
const loadNotifications = async () => {
  await getNotifications()
}

const handleNotificationClick = async (notification) => {
  // Marquer comme lue
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }
  
  // Fermer le menu si ouvert
  openMenuId.value = null
  
  // Navigation selon le type
  if (notification.notification_type === 'connection_request') {
    router.push('/profile')
  }
}

const handleAcceptConnection = async (notification) => {
  const result = await acceptConnectionRequest(notification.related_entity_id)
  if (result.success) {
    await markAsRead(notification.id)
    await loadNotifications()
  }
}

const handleRejectConnection = async (notification) => {
  const result = await rejectConnectionRequest(notification.related_entity_id)
  if (result.success) {
    await markAsRead(notification.id)
    await loadNotifications()
  }
}

const handleMarkAllAsRead = async () => {
  markingAllAsRead.value = true
  try {
    await markAllAsRead()
  } finally {
    markingAllAsRead.value = false
  }
}

const markAsUnread = async (notificationId) => {
  // Note: Cette fonctionnalité nécessiterait d'ajouter une méthode dans useNotifications
  console.log('Mark as unread:', notificationId)
  openMenuId.value = null
}

const deleteNotification = async (notificationId) => {
  const result = await deleteNotificationAction(notificationId)
  if (result.success) {
    openMenuId.value = null
  }
}

const toggleNotificationMenu = (notificationId) => {
  openMenuId.value = openMenuId.value === notificationId ? null : notificationId
}

const resetFilters = () => {
  selectedType.value = ''
  selectedStatus.value = ''
}

const loadMoreNotifications = async () => {
  loadingMore.value = true
  try {
    // Note: Cette fonctionnalité nécessiterait d'ajouter la pagination dans useNotifications
    console.log('Load more notifications')
  } finally {
    loadingMore.value = false
  }
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

const getNotificationIcon = (type) => {
  const icons = {
    connection_request: ['fas', 'user-plus'],
    activity_validation: ['fas', 'check-circle'],
    message_received: ['fas', 'envelope'],
    appointment_request: ['fas', 'calendar'],
    training_reminder: ['fas', 'graduation-cap'],
    event_reminder: ['fas', 'calendar-alt'],
    system_announcement: ['fas', 'bullhorn'],
    newsletter: ['fas', 'newspaper']
  }
  return icons[type] || ['fas', 'bell']
}

const getNotificationTypeColor = (type) => {
  const colors = {
    connection_request: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    activity_validation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    message_received: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    appointment_request: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    training_reminder: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    event_reminder: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    system_announcement: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    newsletter: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// Fermer les menus quand on clique ailleurs
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    openMenuId.value = null
    showFilters.value = false
  }
}

// Watchers
watch([selectedType, selectedStatus], () => {
  showFilters.value = false
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Charger les notifications
  loadNotifications()
  
  // S'abonner aux notifications en temps réel
  if (authStore.isAuthenticated && authStore.user?.id) {
    subscription = subscribeToNotifications(authStore.user.id)
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