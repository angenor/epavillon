<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <font-awesome-icon icon="comments" class="text-primary-600 text-xl mr-3" />
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ $t('messaging.title') }}
            </h1>
          </div>

          <!-- Actions header -->
          <div class="flex items-center space-x-4">
            <!-- Indicateur de statut temps réel -->
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div
                class="w-2 h-2 rounded-full mr-2"
                :class="[
                  realtimeConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                ]"
              />
              {{ realtimeConnected ? $t('messaging.connected') : $t('messaging.disconnected') }}
            </div>

            <!-- Bouton actualiser -->
            <button
              @click="refreshData"
              :disabled="loading"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :title="$t('common.refresh')"
            >
              <font-awesome-icon
                icon="sync"
                :class="[
                  'text-sm',
                  loading ? 'animate-spin' : ''
                ]"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar des conversations -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)]">
            <ConversationList />
          </div>
        </div>

        <!-- Zone principale -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)]">
            <!-- Vue par défaut -->
            <div
              v-if="currentView === 'default'"
              class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
            >
              <font-awesome-icon icon="comments" class="text-6xl mb-4 opacity-50" />
              <h2 class="text-xl font-semibold mb-2">
                {{ $t('messaging.welcome') }}
              </h2>
              <p class="text-center max-w-md">
                {{ $t('messaging.welcomeDescription') }}
              </p>
              
              <div class="mt-6 space-y-3">
                <button
                  @click="$router.push('/profils/public')"
                  class="block w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {{ $t('messaging.findContacts') }}
                </button>
                
                <button
                  @click="messagingStore.setCurrentView('groups')"
                  class="block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {{ $t('messaging.createGroup') }}
                </button>
              </div>
            </div>

            <!-- Vue conversation -->
            <ChatConversation
              v-else-if="currentView === 'chat'"
              class="h-full"
            />

            <!-- Vue groupes -->
            <GroupManager
              v-else-if="currentView === 'groups'"
              class="h-full"
            />

            <!-- Vue rendez-vous -->
            <AppointmentScheduler
              v-else-if="currentView === 'appointments'"
              class="h-full"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div
      v-if="showStats"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
    >
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon icon="comment" class="text-primary-600 text-xl" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ $t('messaging.totalConversations') }}
              </p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ messagingStore.messagesService.conversations.length }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon icon="users" class="text-green-600 text-xl" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ $t('messaging.totalGroups') }}
              </p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ messagingStore.groupsService.groups.length }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon icon="calendar" class="text-blue-600 text-xl" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ $t('messaging.upcomingAppointments') }}
              </p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ messagingStore.appointmentsService.upcomingAppointments.length }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon icon="bell" class="text-red-600 text-xl" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ $t('messaging.unreadMessages') }}
              </p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ messagingStore.totalUnreadCount }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessagingStore } from '@/stores/messaging'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

// Composants
import ConversationList from '@/components/messaging/ConversationList.vue'
import ChatConversation from '@/components/messaging/ChatConversation.vue'
import GroupManager from '@/components/messaging/GroupManager.vue'
import AppointmentScheduler from '@/components/messaging/AppointmentScheduler.vue'

const { t } = useI18n()
const router = useRouter()
const messagingStore = useMessagingStore()
const authStore = useAuthStore()
const { showToast } = useToast()

const loading = ref(false)
const showStats = ref(true)

// Computed
const currentView = computed(() => {
  if (messagingStore.currentView === 'conversations') {
    return 'default'
  }
  return messagingStore.currentView
})

const realtimeConnected = computed(() => {
  return messagingStore.realtimeService.isConnected
})

// Méthodes
const refreshData = async () => {
  loading.value = true
  
  try {
    await messagingStore.loadInitialData()
    showToast(t('common.dataRefreshed'), 'success')
  } catch (error) {
    console.error('Erreur lors de l\'actualisation:', error)
    showToast(t('common.refreshError'), 'error')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Vérifier que l'utilisateur est connecté
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }

  // Initialiser le système de messagerie
  try {
    await messagingStore.loadInitialData()
    
    if (authStore.user?.id) {
      messagingStore.initializeRealtimeSubscriptions(authStore.user.id)
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la messagerie:', error)
    showToast(t('messaging.initializationError'), 'error')
  }
})

onUnmounted(() => {
  messagingStore.cleanup()
})
</script>

<style scoped>
/* Styles spécifiques à la vue messagerie */
.messaging-container {
  height: calc(100vh - 4rem);
}

/* Animation pour les statistiques */
.stats-enter-active,
.stats-leave-active {
  transition: all 0.3s ease;
}

.stats-enter-from,
.stats-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>