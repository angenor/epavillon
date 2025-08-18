<template>
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('profile.sections.connections') }}
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {{ t('profile.connections.subtitle', { count: connectionsCount }) }}
      </p>
    </div>

    <div class="p-6">
      <!-- État de chargement -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ t('common.loading') }}</p>
      </div>

      <!-- Aucune connexion -->
      <div v-else-if="acceptedConnections.length === 0" class="text-center py-8">
        <div class="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ t('profile.connections.noConnections') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('profile.connections.noConnectionsDescription') }}
        </p>
      </div>

      <!-- Liste des connexions -->
      <div v-else class="space-y-4">
        <div
          v-for="connection in acceptedConnections"
          :key="connection.id"
          class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <!-- Photo de profil -->
            <div class="flex-shrink-0">
              <img
                :src="connection.contact.profile_photo_thumbnail_url || '/images/default-avatar.png'"
                :alt="`${connection.contact.first_name} ${connection.contact.last_name}`"
                class="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
            </div>

            <!-- Informations du contact -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ connection.contact.first_name }} {{ connection.contact.last_name }}
              </p>
              
              <div class="flex items-center space-x-2 mt-1">
                <p v-if="connection.contact.biography" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ connection.contact.biography }}
                </p>
                <span v-if="connection.contact.biography && connection.contact.countries" class="text-xs text-gray-400">•</span>
                <p v-if="connection.contact.countries" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ connection.contact.countries.name_fr }}
                </p>
              </div>
              
              <div class="flex items-center space-x-2 mt-1">
                <!-- Organisation si présente -->
                <span v-if="connection.contact.organizations" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {{ connection.contact.organizations.name }}
                  <span v-if="connection.contact.organizations.is_verified" class="ml-1 text-green-600">✓</span>
                </span>
              </div>
              
              <p class="text-xs text-gray-400 mt-1">
                {{ t('profile.connections.connectedSince') }} {{ formatDate(connection.connected_at) }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <!-- Voir profil -->
            <router-link
              :to="{ name: 'public-profile', params: { id: connection.contact.id } }"
              class="inline-flex items-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              :title="t('profile.connections.viewProfile')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </router-link>

            <!-- Envoyer un message -->
            <button
              @click="sendMessage(connection.contact)"
              class="inline-flex items-center p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
              :title="t('profile.connections.sendMessage')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConnections } from '@/composables/useConnections'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { success } = useToast()

const {
  acceptedConnections,
  connectionsCount,
  loading,
  getAcceptedConnections
} = useConnections()


const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const sendMessage = (contact) => {
  // TODO: Implémenter l'envoi de message
  success(t('profile.connections.messageFeatureComingSoon'))
}

onMounted(() => {
  getAcceptedConnections()
})
</script>