<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950">
    <!-- Access denied -->
    <div v-if="!hasAccess && !isCheckingPermissions" class="flex items-center justify-center min-h-screen">
      <div class="max-w-md w-full mx-4 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <font-awesome-icon icon="lock" class="text-3xl text-red-500 dark:text-red-400" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ t('chatbot.accessDenied') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ getAccessDeniedMessage() }}
        </p>
        <router-link
          to="/"
          class="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
        >
          {{ t('common.backToHome') }}
        </router-link>
      </div>
    </div>

    <!-- Main chatbot interface -->
    <div v-else-if="hasAccess" class="flex h-screen">
      <!-- Sidebar -->
      <div class="w-80 flex-shrink-0">
        <ChatSidebar
          :sessions="sessions"
          :current-session-id="currentSession?.id"
          :is-loading="isLoading"
          @new-session="handleNewSession"
          @select-session="handleSelectSession"
          @delete-session="handleDeleteSession"
        />
      </div>

      <!-- Chat area -->
      <div class="flex-1">
        <ChatbotWidget />
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <font-awesome-icon icon="spinner" spin class="text-4xl text-blue-500 mb-4" />
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('chatbot.checkingPermissions') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatPermissions } from '@/composables/ai/useChatPermissions'
import { useChatbot } from '@/composables/ai/useChatbot'
import { useToast } from '@/composables/useToast'
import ChatSidebar from '@/components/ai/ChatSidebar.vue'
import ChatbotWidget from '@/components/ai/ChatbotWidget.vue'

const { t } = useI18n()
const { success: showSuccess, error: showError } = useToast()

const {
  hasAccess,
  isLoading: isCheckingPermissions,
  initializePermissions,
  getAccessDeniedMessage
} = useChatPermissions()

const {
  currentSession,
  sessions,
  isLoading,
  createSession,
  loadSession,
  loadUserSessions,
  deleteSession: deleteChatSession
} = useChatbot()

// Methods
const handleNewSession = async () => {
  console.log('➕ [handleNewSession] Starting...')
  try {
    console.log('📝 [handleNewSession] Calling createSession...')
    const session = await createSession({
      title: t('chatbot.newConversation')
    })
    console.log('✅ [handleNewSession] Session created:', session)

    // Recharger la liste des sessions
    console.log('🔄 [handleNewSession] Reloading sessions...')
    await loadUserSessions()
    console.log('📋 [handleNewSession] Sessions after reload:', sessions.value)

    showSuccess(t('chatbot.sessionCreated'))
    console.log('✅ [handleNewSession] Complete. currentSession:', currentSession.value)
  } catch (error) {
    console.error('❌ [handleNewSession] Error creating session:', error)
    console.error('❌ [handleNewSession] Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    showError(t('chatbot.errorCreatingSession'))
  }
}

const handleSelectSession = async (sessionId) => {
  try {
    await loadSession(sessionId)
  } catch (error) {
    console.error('Error loading session:', error)
    showError(t('chatbot.errorLoadingSession'))
  }
}

const handleDeleteSession = async (sessionId) => {
  try {
    const success = await deleteChatSession(sessionId)

    if (success) {
      showSuccess(t('chatbot.sessionDeleted'))
    } else {
      showError(t('chatbot.errorDeletingSession'))
    }
  } catch (error) {
    console.error('Error deleting session:', error)
    showError(t('chatbot.errorDeletingSession'))
  }
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 [Chatbot] Mounting...')

  // Vérifier les permissions
  console.log('🔐 [Chatbot] Checking permissions...')
  const access = await initializePermissions()
  console.log('🔐 [Chatbot] Access granted:', access)

  if (access) {
    // Charger les sessions de l'utilisateur
    console.log('📥 [Chatbot] Loading user sessions...')
    await loadUserSessions()
    console.log('📥 [Chatbot] Sessions loaded:', sessions.value.length)

    // Charger la dernière session si elle existe, sinon créer une nouvelle
    if (sessions.value.length > 0) {
      console.log('📂 [Chatbot] Loading existing session:', sessions.value[0].id)
      await loadSession(sessions.value[0].id)
      console.log('✅ [Chatbot] Session loaded, currentSession:', currentSession.value?.id)
    } else {
      // Créer automatiquement une première session
      console.log('➕ [Chatbot] No sessions found, creating new session...')
      await handleNewSession()
      console.log('✅ [Chatbot] Session created, currentSession:', currentSession.value?.id)
    }
  } else {
    console.warn('⛔ [Chatbot] Access denied')
  }

  console.log('🏁 [Chatbot] Mount complete. Current session:', currentSession.value)
})
</script>
