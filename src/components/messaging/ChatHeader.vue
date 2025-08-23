<template>
  <div class="flex items-center justify-between p-3 bg-primary-600 text-white rounded-t-lg">
    <!-- Bouton retour (visible dans les vues de détail) -->
    <button
      v-if="showBackButton"
      @click="goBack"
      class="p-1 hover:bg-primary-700 rounded transition-colors"
    >
      <font-awesome-icon icon="arrow-left" class="text-sm" />
    </button>

    <!-- Titre principal -->
    <div class="flex-1 flex items-center" :class="{ 'ml-2': showBackButton }">
      <!-- Avatar pour conversation individuelle -->
      <img
        v-if="headerData.avatar"
        :src="headerData.avatar"
        :alt="headerData.title"
        class="w-8 h-8 rounded-full mr-2 border-2 border-white/20"
      />
      
      <!-- Icône pour les vues générales -->
      <font-awesome-icon
        v-else-if="headerData.icon"
        :icon="headerData.icon"
        class="mr-2 text-lg"
      />

      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-sm truncate">
          {{ headerData.title }}
        </h3>
        
        <!-- Sous-titre (statut, nb membres, etc.) -->
        <p
          v-if="headerData.subtitle"
          class="text-xs text-primary-100 truncate"
        >
          {{ headerData.subtitle }}
        </p>
      </div>

      <!-- Indicateur de statut en ligne -->
      <UserStatusIndicator
        v-if="headerData.userId"
        :user-id="headerData.userId"
        class="ml-2"
      />
    </div>

    <!-- Actions -->
    <div class="flex items-center space-x-2 ml-2">
      <!-- Menu d'options (visible pour les conversations) -->
      <div
        v-if="messagingStore.currentView === 'chat'"
        class="relative"
      >
        <button
          @click="showOptionsMenu = !showOptionsMenu"
          class="p-1 hover:bg-primary-700 rounded transition-colors"
          ref="optionsButton"
        >
          <font-awesome-icon icon="ellipsis-v" class="text-sm" />
        </button>

        <!-- Menu dropdown -->
        <div
          v-if="showOptionsMenu"
          v-click-outside="() => showOptionsMenu = false"
          class="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px] z-50"
        >
          <button
            @click="viewProfile"
            class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <font-awesome-icon icon="user" class="mr-2 text-xs" />
            {{ $t('messaging.viewProfile') }}
          </button>
          
          <button
            @click="scheduleAppointment"
            class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <font-awesome-icon icon="calendar-plus" class="mr-2 text-xs" />
            {{ $t('messaging.scheduleAppointment') }}
          </button>
          
          <button
            @click="searchInConversation"
            class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <font-awesome-icon icon="search" class="mr-2 text-xs" />
            {{ $t('messaging.search') }}
          </button>
          
          <hr class="my-1 border-gray-200 dark:border-gray-600" />
          
          <button
            @click="clearHistory"
            class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <font-awesome-icon icon="trash" class="mr-2 text-xs" />
            {{ $t('messaging.clearHistory') }}
          </button>
          
          <button
            @click="blockUser"
            class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
          >
            <font-awesome-icon icon="ban" class="mr-2 text-xs" />
            {{ $t('messaging.blockUser') }}
          </button>
        </div>
      </div>

      <!-- Bouton minimiser -->
      <button
        @click="messagingStore.minimizeMessaging"
        class="p-1 hover:bg-primary-700 rounded transition-colors"
        :title="$t('messaging.minimize')"
      >
        <font-awesome-icon icon="minus" class="text-sm" />
      </button>

      <!-- Bouton fermer -->
      <button
        @click="messagingStore.closeMessaging"
        class="p-1 hover:bg-primary-700 rounded transition-colors"
        :title="$t('messaging.close')"
      >
        <font-awesome-icon icon="times" class="text-sm" />
      </button>
    </div>
  </div>

  <!-- Header minimisé -->
  <div
    v-if="messagingStore.isMinimized"
    @click="messagingStore.maximizeMessaging"
    class="flex items-center justify-between p-3 cursor-pointer"
  >
    <div class="flex items-center">
      <font-awesome-icon icon="comments" class="mr-2 text-primary-600" />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ $t('messaging.title') }}
      </span>
      <span
        v-if="messagingStore.totalUnreadCount > 0"
        class="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5"
      >
        {{ messagingStore.totalUnreadCount }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessagingStore } from '@/stores/messaging'
import { useToast } from '@/composables/useToast'
import UserStatusIndicator from './UserStatusIndicator.vue'

const { t } = useI18n()
const router = useRouter()
const messagingStore = useMessagingStore()
const { showToast } = useToast()

const showOptionsMenu = ref(false)

// Computed pour déterminer les données du header
const headerData = computed(() => {
  switch (messagingStore.currentView) {
    case 'conversations':
      return {
        title: t('messaging.conversations'),
        icon: 'comments',
        subtitle: messagingStore.totalUnreadCount > 0 
          ? t('messaging.unreadMessages', { count: messagingStore.totalUnreadCount })
          : null
      }
    
    case 'chat':
      const conversation = messagingStore.messagesService.currentConversation
      if (conversation) {
        return {
          title: `${conversation.user.first_name} ${conversation.user.last_name}`,
          avatar: conversation.user.profile_photo_thumbnail_url,
          userId: conversation.userId,
          subtitle: messagingStore.isUserOnline(conversation.userId) 
            ? t('messaging.online') 
            : t('messaging.offline')
        }
      }
      return { title: t('messaging.chat'), icon: 'comment' }
    
    case 'groups':
      const group = messagingStore.groupsService.currentGroup
      if (group) {
        return {
          title: group.name,
          icon: 'users',
          subtitle: t('messaging.membersCount', { count: group.member_count || 0 })
        }
      }
      return { title: t('messaging.groups'), icon: 'users' }
    
    case 'appointments':
      return {
        title: t('messaging.appointments'),
        icon: 'calendar',
        subtitle: null
      }
    
    default:
      return { title: t('messaging.title'), icon: 'comments' }
  }
})

const showBackButton = computed(() => {
  return ['chat', 'groups', 'appointments'].includes(messagingStore.currentView)
})

const goBack = () => {
  messagingStore.setCurrentView('conversations')
}

// Actions du menu d'options
const viewProfile = () => {
  showOptionsMenu.value = false
  const conversation = messagingStore.messagesService.currentConversation
  if (conversation) {
    router.push(`/profils/public/${conversation.userId}`)
    messagingStore.closeMessaging()
  }
}

const scheduleAppointment = () => {
  showOptionsMenu.value = false
  messagingStore.setCurrentView('appointments')
}

const searchInConversation = () => {
  showOptionsMenu.value = false
  // TODO: Implémenter la recherche dans la conversation
  showToast(t('messaging.searchNotImplemented'), 'info')
}

const clearHistory = async () => {
  showOptionsMenu.value = false
  const conversation = messagingStore.messagesService.currentConversation
  if (conversation) {
    if (confirm(t('messaging.confirmClearHistory'))) {
      const result = await messagingStore.messagesService.clearConversationHistory(conversation.userId)
      if (result.success) {
        showToast(t('messaging.historyCleared'), 'success')
      } else {
        showToast(result.error, 'error')
      }
    }
  }
}

const blockUser = async () => {
  showOptionsMenu.value = false
  const conversation = messagingStore.messagesService.currentConversation
  if (conversation) {
    if (confirm(t('messaging.confirmBlockUser'))) {
      // TODO: Implémenter le blocage d'utilisateur
      showToast(t('messaging.userBlocked'), 'success')
      messagingStore.setCurrentView('conversations')
    }
  }
}
</script>

<style scoped>
/* Click outside directive pour fermer le menu */
</style>