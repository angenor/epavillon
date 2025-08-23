<template>
  <div class="flex flex-col h-full">
    <!-- Barre de recherche -->
    <div class="p-3 border-b border-gray-200 dark:border-gray-700">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('messaging.searchConversations')"
          class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <font-awesome-icon
          icon="search"
          class="absolute left-3 top-2.5 text-gray-400 text-sm"
        />
      </div>
    </div>

    <!-- Navigation par onglets -->
    <div class="flex border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors"
        :class="[
          activeTab === tab.key
            ? 'text-primary-600 border-primary-600'
            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
        ]"
      >
        <font-awesome-icon :icon="tab.icon" class="mr-1" />
        {{ tab.label }}
        <span
          v-if="tab.count > 0"
          class="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Liste des conversations -->
    <div class="flex-1 overflow-y-auto">
      <!-- Messages privés -->
      <div v-if="activeTab === 'messages'">
        <div
          v-if="loading"
          class="p-4 text-center text-gray-500 dark:text-gray-400"
        >
          <font-awesome-icon icon="spinner" class="animate-spin mr-2" />
          {{ $t('common.loading') }}
        </div>

        <div
          v-else-if="filteredConversations.length === 0"
          class="p-4 text-center text-gray-500 dark:text-gray-400"
        >
          <font-awesome-icon icon="comment-slash" class="text-2xl mb-2" />
          <p>{{ $t('messaging.noConversations') }}</p>
        </div>

        <div v-else>
          <div
            v-for="conversation in filteredConversations"
            :key="conversation.userId"
            @click="openConversation(conversation)"
            class="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
          >
            <!-- Avatar -->
            <div class="relative mr-3">
              <img
                :src="conversation.user.profile_photo_thumbnail_url || '/default-avatar.png'"
                :alt="`${conversation.user.first_name} ${conversation.user.last_name}`"
                class="w-12 h-12 rounded-full object-cover"
              />
              <UserStatusIndicator
                :user-id="conversation.userId"
                class="absolute -bottom-0.5 -right-0.5"
              />
            </div>

            <!-- Contenu -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ conversation.user.first_name }} {{ conversation.user.last_name }}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {{ formatMessageTime(conversation.lastMessage.created_at) }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-600 dark:text-gray-300 truncate">
                  <span v-if="conversation.lastMessage.sender_id === currentUserId" class="text-gray-500">
                    {{ $t('messaging.you') }}:
                  </span>
                  {{ conversation.lastMessage.content }}
                </p>
                <span
                  v-if="conversation.unreadCount > 0"
                  class="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5"
                >
                  {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Amis -->
      <div v-if="activeTab === 'friends'">
        <FriendsList @conversationStarted="handleConversationStarted" />
      </div>

      <!-- Groupes -->
      <div v-if="activeTab === 'groups'">
        <div
          v-if="groupsLoading"
          class="p-4 text-center text-gray-500 dark:text-gray-400"
        >
          <font-awesome-icon icon="spinner" class="animate-spin mr-2" />
          {{ $t('common.loading') }}
        </div>

        <div
          v-else-if="filteredGroups.length === 0"
          class="p-4 text-center text-gray-500 dark:text-gray-400"
        >
          <font-awesome-icon icon="users-slash" class="text-2xl mb-2" />
          <p>{{ $t('messaging.noGroups') }}</p>
        </div>

        <div v-else>
          <div
            v-for="group in filteredGroups"
            :key="group.id"
            @click="openGroup(group)"
            class="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
          >
            <!-- Icône du groupe -->
            <div class="w-12 h-12 mr-3 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <font-awesome-icon icon="users" class="text-primary-600 text-lg" />
            </div>

            <!-- Contenu -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ group.name }}
                </h4>
                <span
                  v-if="group.last_message"
                  class="text-xs text-gray-500 dark:text-gray-400 ml-2"
                >
                  {{ formatMessageTime(group.last_message.created_at) }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-600 dark:text-gray-300 truncate">
                  <span v-if="group.last_message">
                    <span class="text-gray-500">
                      {{ group.last_message.sender?.first_name }}:
                    </span>
                    {{ group.last_message.content }}
                  </span>
                  <span v-else class="text-gray-500 italic">
                    {{ $t('messaging.noMessages') }}
                  </span>
                </p>
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {{ group.member_count }} {{ $t('messaging.members') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Boutons d'action -->
    <div class="p-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex space-x-2">
        <button
          v-if="activeTab === 'messages'"
          @click="newMessage"
          class="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <font-awesome-icon icon="plus" class="mr-1" />
          {{ $t('messaging.newMessage') }}
        </button>

        <button
          v-if="activeTab === 'groups'"
          @click="newGroup"
          class="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <font-awesome-icon icon="plus" class="mr-1" />
          {{ $t('messaging.newGroup') }}
        </button>

        <button
          @click="messagingStore.setCurrentView('appointments')"
          class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <font-awesome-icon icon="calendar" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMessagingStore } from '@/stores/messaging'
import { useAuthStore } from '@/stores/auth'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import UserStatusIndicator from './UserStatusIndicator.vue'
import FriendsList from './FriendsList.vue'

const { t, locale } = useI18n()
const router = useRouter()
const messagingStore = useMessagingStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const activeTab = ref('messages')

// Computed
const currentUserId = computed(() => authStore.user?.id)

const loading = computed(() => messagingStore.messagesService.loading)
const groupsLoading = computed(() => messagingStore.groupsService.loading)

const tabs = computed(() => [
  {
    key: 'messages',
    label: t('messaging.messages'),
    icon: 'comment',
    count: messagingStore.messagesService.totalUnreadMessages
  },
  {
    key: 'friends',
    label: t('messaging.friends'),
    icon: 'user-friends',
    count: 0
  },
  {
    key: 'groups',
    label: t('messaging.groups'),
    icon: 'users',
    count: 0 // TODO: Compter les messages non lus des groupes
  }
])

const filteredConversations = computed(() => {
  const conversations = messagingStore.messagesService.conversations || []
  if (!searchQuery.value.trim()) return conversations

  const query = searchQuery.value.toLowerCase()
  return conversations.filter(conv => 
    `${conv.user.first_name} ${conv.user.last_name}`.toLowerCase().includes(query) ||
    conv.lastMessage.content.toLowerCase().includes(query)
  )
})

const filteredGroups = computed(() => {
  const groups = messagingStore.groupsService.groups || []
  if (!searchQuery.value.trim()) return groups

  const query = searchQuery.value.toLowerCase()
  return groups.filter(group => 
    group.name.toLowerCase().includes(query) ||
    (group.description && group.description.toLowerCase().includes(query))
  )
})

// Méthodes
const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    // Moins de 24h : afficher l'heure
    return date.toLocaleTimeString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else {
    // Plus de 24h : utiliser date-fns
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale.value === 'fr' ? fr : enUS
    })
  }
}

const openConversation = (conversation) => {
  messagingStore.openConversation(conversation.userId, conversation.user)
}

const openGroup = (group) => {
  messagingStore.openGroup(group.id, group)
}

const newMessage = () => {
  // Basculer vers l'onglet Amis au lieu de rediriger vers l'annuaire public
  activeTab.value = 'friends'
}

const newGroup = () => {
  // TODO: Ouvrir un modal de création de groupe
  console.log('Créer un nouveau groupe')
}

const handleConversationStarted = (user) => {
  // Cette méthode est appelée quand une conversation est démarrée depuis FriendsList
  console.log('Conversation started with:', user)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    messagingStore.messagesService.getConversations(),
    messagingStore.groupsService.getUserGroups()
  ])
})
</script>