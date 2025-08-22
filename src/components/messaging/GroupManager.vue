<template>
  <div class="flex flex-col h-full">
    <!-- Header de groupe ou liste des groupes -->
    <div v-if="!currentGroup" class="flex-1 flex flex-col">
      <!-- Liste des groupes -->
      <div class="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          {{ $t('messaging.myGroups') }}
        </h3>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div
          v-if="loading"
          class="p-4 text-center text-gray-500 dark:text-gray-400"
        >
          <font-awesome-icon icon="spinner" class="animate-spin mr-2" />
          {{ $t('common.loading') }}
        </div>

        <div
          v-else-if="groups.length === 0"
          class="p-4 text-center text-gray-500 dark:text-gray-400"
        >
          <font-awesome-icon icon="users-slash" class="text-2xl mb-2" />
          <p>{{ $t('messaging.noGroups') }}</p>
        </div>

        <div v-else>
          <div
            v-for="group in groups"
            :key="group.id"
            @click="selectGroup(group)"
            class="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
          >
            <div class="w-12 h-12 mr-3 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <font-awesome-icon icon="users" class="text-primary-600 text-lg" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ group.name }}
                  <span
                    v-if="group.is_admin"
                    class="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded"
                  >
                    {{ $t('messaging.admin') }}
                  </span>
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ group.member_count }} {{ $t('messaging.members') }}
                </span>
              </div>

              <p class="text-sm text-gray-600 dark:text-gray-300 truncate">
                {{ group.description || $t('messaging.noDescription') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bouton créer un groupe -->
      <div class="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="showCreateGroupModal = true"
          class="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <font-awesome-icon icon="plus" class="mr-2" />
          {{ $t('messaging.createGroup') }}
        </button>
      </div>
    </div>

    <!-- Vue d'un groupe spécifique -->
    <div v-else class="flex flex-col h-full">
      <!-- Messages du groupe -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div
          v-if="groupMessagesLoading"
          class="text-center py-4"
        >
          <font-awesome-icon icon="spinner" class="animate-spin text-gray-500" />
        </div>

        <div
          v-for="message in groupMessages"
          :key="message.id"
          class="flex items-start space-x-3"
        >
          <img
            :src="message.sender?.profile_photo_thumbnail_url || '/default-avatar.png'"
            :alt="`${message.sender?.first_name} ${message.sender?.last_name}`"
            class="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />

          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-1">
              <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ message.sender?.first_name }} {{ message.sender?.last_name }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatTime(message.created_at) }}
              </span>
            </div>
            
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <p class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {{ message.content }}
              </p>
            </div>
          </div>
        </div>

        <div ref="scrollAnchor"></div>
      </div>

      <!-- Zone de saisie pour le groupe -->
      <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
        <div class="flex items-end space-x-2">
          <div class="flex-1">
            <textarea
              v-model="groupMessageContent"
              @keydown="handleGroupKeydown"
              :placeholder="$t('messaging.typeGroupMessage')"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="1"
              :maxlength="1000"
            />
          </div>

          <button
            @click="sendGroupMessage"
            :disabled="!groupMessageContent.trim() || sendingGroupMessage"
            class="p-2 rounded-lg transition-colors"
            :class="[
              groupMessageContent.trim() && !sendingGroupMessage
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            ]"
          >
            <font-awesome-icon
              :icon="sendingGroupMessage ? 'spinner' : 'paper-plane'"
              :class="[
                'text-sm',
                sendingGroupMessage ? 'animate-spin' : ''
              ]"
            />
          </button>
        </div>
      </div>

      <!-- Actions du groupe -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-3">
        <div class="flex justify-between items-center">
          <button
            @click="showGroupMembers = true"
            class="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <font-awesome-icon icon="users" class="mr-1" />
            {{ $t('messaging.viewMembers') }} ({{ currentGroup.member_count }})
          </button>

          <div class="flex space-x-2">
            <button
              v-if="currentGroup.is_admin"
              @click="showGroupSettings = true"
              class="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <font-awesome-icon icon="cog" />
            </button>

            <button
              @click="leaveGroup"
              class="text-sm text-red-600 hover:text-red-700"
            >
              <font-awesome-icon icon="sign-out-alt" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création de groupe -->
    <div
      v-if="showCreateGroupModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showCreateGroupModal = false"
    >
      <div
        @click.stop
        class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ $t('messaging.createGroup') }}
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ $t('messaging.groupName') }}
            </label>
            <input
              v-model="newGroup.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              :placeholder="$t('messaging.enterGroupName')"
              maxlength="100"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ $t('messaging.groupDescription') }}
            </label>
            <textarea
              v-model="newGroup.description"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              :placeholder="$t('messaging.enterGroupDescription')"
              rows="3"
              maxlength="500"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showCreateGroupModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="createGroup"
            :disabled="!newGroup.name.trim() || creatingGroup"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <font-awesome-icon
              v-if="creatingGroup"
              icon="spinner"
              class="animate-spin mr-2"
            />
            {{ $t('messaging.create') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal des membres du groupe -->
    <!-- TODO: Implémenter le modal des membres -->

    <!-- Modal des paramètres du groupe -->
    <!-- TODO: Implémenter le modal des paramètres -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessagingStore } from '@/stores/messaging'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const messagingStore = useMessagingStore()
const { showToast } = useToast()

const messagesContainer = ref(null)
const scrollAnchor = ref(null)
const groupMessageContent = ref('')

const showCreateGroupModal = ref(false)
const showGroupMembers = ref(false)
const showGroupSettings = ref(false)
const creatingGroup = ref(false)

const newGroup = ref({
  name: '',
  description: ''
})

// Computed
const loading = computed(() => messagingStore.groupsService.loading)
const groups = computed(() => messagingStore.groupsService.groups || [])
const currentGroup = computed(() => messagingStore.groupsService.currentGroup)
const groupMessages = computed(() => messagingStore.groupsService.groupMessages || [])
const groupMessagesLoading = computed(() => messagingStore.groupsService.loading)
const sendingGroupMessage = computed(() => messagingStore.groupsService.sendingMessage)

// Méthodes
const selectGroup = (group) => {
  messagingStore.openGroup(group.id, group)
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollAnchor.value) {
      scrollAnchor.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

const handleGroupKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendGroupMessage()
  }
}

const sendGroupMessage = async () => {
  if (!groupMessageContent.value.trim() || !currentGroup.value) return
  
  const result = await messagingStore.sendGroupMessage(currentGroup.value.id, groupMessageContent.value)
  
  if (result.success) {
    groupMessageContent.value = ''
    scrollToBottom()
  }
}

const createGroup = async () => {
  if (!newGroup.value.name.trim()) return
  
  creatingGroup.value = true
  
  try {
    const result = await messagingStore.groupsService.createGroup(
      newGroup.value.name,
      newGroup.value.description
    )
    
    if (result.success) {
      showToast(t('messaging.groupCreated'), 'success')
      showCreateGroupModal.value = false
      newGroup.value = { name: '', description: '' }
    } else {
      showToast(result.error, 'error')
    }
  } finally {
    creatingGroup.value = false
  }
}

const leaveGroup = async () => {
  if (!currentGroup.value) return
  
  if (confirm(t('messaging.confirmLeaveGroup'))) {
    const result = await messagingStore.groupsService.removeMemberFromGroup(
      currentGroup.value.id,
      messagingStore.authStore.user?.id
    )
    
    if (result.success) {
      showToast(t('messaging.leftGroup'), 'success')
      messagingStore.setCurrentView('conversations')
    } else {
      showToast(result.error, 'error')
    }
  }
}

// Lifecycle
onMounted(async () => {
  await messagingStore.groupsService.getUserGroups()
})
</script>