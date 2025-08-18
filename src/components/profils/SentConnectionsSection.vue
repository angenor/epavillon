<template>
  <div class="space-y-4">
    <!-- État de chargement -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
    </div>

    <!-- Aucune demande envoyée -->
    <div v-else-if="sentRequests.length === 0" class="text-center py-8">
      <div class="mx-auto h-12 w-12 text-gray-400">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('profile.connections.noSentRequests') }}</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ $t('profile.connections.noSentRequestsMessage') }}</p>
    </div>

    <!-- Liste des demandes envoyées -->
    <div v-else class="space-y-4">
      <div
        v-for="request in sentRequests"
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
            <div class="flex items-center space-x-2 mt-1">
              <p class="text-xs text-gray-400">
                {{ $t('profile.connections.sentOn') }} {{ formatDate(request.created_at) }}
              </p>
              <span v-if="request.updated_at && request.updated_at !== request.created_at" class="text-xs text-gray-400">•</span>
              <p v-if="request.updated_at && request.updated_at !== request.created_at" class="text-xs text-gray-400">
                {{ $t('profile.connections.lastUpdate') }} {{ formatDate(request.updated_at) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Statut -->
          <div class="flex items-center">
            <span
              :class="getStatusClass(request.status)"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            >
              {{ $t(`profile.connections.status.${request.status}`) }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <!-- Annuler (seulement pour les demandes en attente) -->
            <button
              v-if="request.status === 'pending'"
              @click="$emit('cancel-request', request.id)"
              class="inline-flex items-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              :title="$t('profile.connections.cancel')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  sentRequests: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cancel-request'])

// Méthodes
const getStatusClass = (status) => {
  const statusClasses = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'accepted': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'blocked': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
  return statusClasses[status] || statusClasses.pending
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>