<template>
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {{ $t('profile.connections.title') }}
      </h3>
      
      <!-- Onglets -->
      <div class="border-b border-gray-200 dark:border-gray-600">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'received'"
            :class="[
              activeTab === 'received'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            {{ $t('profile.connections.received') }}
            <span v-if="connectionRequests.length > 0" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {{ connectionRequests.length }}
            </span>
          </button>
          <button
            @click="activeTab = 'sent'"
            :class="[
              activeTab === 'sent'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            {{ $t('profile.connections.sent') }}
            <span v-if="sentRequests.length > 0" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {{ sentRequests.length }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <div class="p-6">
      <!-- Contenu de l'onglet demandes reçues -->
      <div v-if="activeTab === 'received'">
        <!-- État de chargement -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
        </div>

        <!-- Aucune demande -->
        <div v-else-if="connectionRequests.length === 0" class="text-center py-8">
          <div class="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('profile.connections.noRequests') }}</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ $t('profile.connections.noRequestsMessage') }}</p>
        </div>

        <!-- Liste des demandes reçues -->
        <div v-else class="space-y-4">
        <div
          v-for="request in connectionRequests"
          :key="request.id"
          class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <!-- Photo de profil -->
            <div class="flex-shrink-0">
              <img
                :src="request.users.profile_photo_thumbnail_url || '/images/default-avatar.png'"
                :alt="`${request.users.first_name} ${request.users.last_name}`"
                class="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
            </div>

            <!-- Informations utilisateur -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ request.users.first_name }} {{ request.users.last_name }}
              </p>
              <div class="flex items-center space-x-2 mt-1">
                <p v-if="request.users.address" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ request.users.address }}
                </p>
                <span v-if="request.users.address && (request.users.countries || request.users.organizations)" class="text-xs text-gray-400">•</span>
                <p v-if="request.users.countries" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ request.users.countries.name_fr }}
                </p>
                <span v-if="request.users.countries && request.users.organizations" class="text-xs text-gray-400">•</span>
                <p v-if="request.users.organizations" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ request.users.organizations.name }}
                  <span v-if="request.users.organizations.is_verified" class="text-green-600">✓</span>
                </p>
              </div>
              <p class="text-xs text-gray-400 mt-1">
                {{ $t('profile.connections.requestedOn') }} {{ formatDate(request.created_at) }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <!-- Voir profil -->
            <router-link
              :to="{ name: 'public-profile', params: { id: request.users.id } }"
              class="inline-flex items-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              :title="$t('profile.connections.viewProfile')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </router-link>

            <!-- Accepter -->
            <button
              @click="handleAccept(request.id)"
              :disabled="processingAction === request.id"
              class="inline-flex items-center p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors disabled:opacity-50"
              :title="$t('profile.connections.accept')"
            >
              <svg v-if="processingAction !== request.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div v-else class="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
            </button>

            <!-- Rejeter -->
            <button
              @click="handleReject(request.id)"
              :disabled="processingAction === request.id"
              class="inline-flex items-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
              :title="$t('profile.connections.reject')"
            >
              <svg v-if="processingAction !== request.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div v-else class="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
            </button>

            <!-- Menu actions supplémentaires -->
            <div class="relative">
              <button
                @click="toggleMenu(request.id)"
                class="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                </svg>
              </button>

              <!-- Menu déroulant -->
              <div
                v-if="openMenu === request.id"
                class="absolute right-0 z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600"
              >
                <div class="py-1">
                  <button
                    @click="handleBlock(request.id, request.users.id)"
                    :disabled="processingAction === request.id"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    {{ $t('profile.connections.blockUser') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      <!-- Contenu de l'onglet demandes envoyées -->
      <div v-if="activeTab === 'sent'">
        <SentConnectionsSection 
          :sent-requests="sentRequests"
          :loading="loading"
          @cancel-request="handleCancelRequest"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConnections } from '@/composables/useConnections'
import SentConnectionsSection from './SentConnectionsSection.vue'

const { t } = useI18n()

const {
  connectionRequests,
  sentRequests,
  loading,
  error,
  getConnectionRequests,
  getSentConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  blockUser,
  cancelConnectionRequest
} = useConnections()

const processingAction = ref(null)
const openMenu = ref(null)
const activeTab = ref('received')

// Méthodes
const handleAccept = async (connectionId) => {
  processingAction.value = connectionId
  const result = await acceptConnectionRequest(connectionId)
  
  if (result.success) {
    // Optionnel: afficher une notification de succès
  } else {
    console.error('Erreur lors de l\'acceptation:', result.error)
    // Optionnel: afficher une notification d'erreur
  }
  
  processingAction.value = null
  openMenu.value = null
}

const handleReject = async (connectionId) => {
  processingAction.value = connectionId
  const result = await rejectConnectionRequest(connectionId)
  
  if (result.success) {
    // Optionnel: afficher une notification de succès
  } else {
    console.error('Erreur lors du rejet:', result.error)
    // Optionnel: afficher une notification d'erreur
  }
  
  processingAction.value = null
  openMenu.value = null
}

const handleBlock = async (connectionId, userId) => {
  if (!confirm(t('profile.connections.confirmBlock'))) {
    return
  }
  
  processingAction.value = connectionId
  const result = await blockUser(connectionId, userId)
  
  if (result.success) {
    // Optionnel: afficher une notification de succès
  } else {
    console.error('Erreur lors du blocage:', result.error)
    // Optionnel: afficher une notification d'erreur
  }
  
  processingAction.value = null
  openMenu.value = null
}

const toggleMenu = (requestId) => {
  openMenu.value = openMenu.value === requestId ? null : requestId
}

const handleCancelRequest = async (connectionId) => {
  if (!confirm(t('profile.connections.confirmCancel'))) {
    return
  }
  
  const result = await cancelConnectionRequest(connectionId)
  
  if (result.success) {
    // Optionnel: afficher une notification de succès
    console.log('Demande de connexion annulée avec succès')
  } else {
    console.error('Erreur lors de l\'annulation:', result.error)
    // Optionnel: afficher une notification d'erreur
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Fermer le menu quand on clique ailleurs
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    openMenu.value = null
  }
}

// Lifecycle
onMounted(() => {
  getConnectionRequests()
  getSentConnectionRequests()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>