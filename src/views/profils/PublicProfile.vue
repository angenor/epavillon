<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav class="flex" aria-label="Breadcrumb">
          <ol role="list" class="flex items-center space-x-4">
            <li>
              <div>
                <router-link 
                  :to="{ name: 'public-directory' }"
                  class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  {{ $t('directory.title') }}
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {{ profile?.first_name }} {{ profile?.last_name }}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex justify-center items-center py-32">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ifdd-green-600"></div>
      <p class="ml-3 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Profil non trouvé</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Le profil demandé n'existe pas ou n'est pas public.</p>
        <div class="mt-6">
          <router-link
            :to="{ name: 'public-directory' }"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-ifdd-green-600 hover:bg-ifdd-green-700"
          >
            Retour à l'annuaire
          </router-link>
        </div>
      </div>
    </div>

    <!-- Profil -->
    <div v-else-if="profile" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- En-tête du profil -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
        <div class="relative h-32 bg-gradient-to-r from-ifdd-green-500 to-ifdd-blue-600">
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent h-16"></div>
        </div>
        <div class="relative px-6 pb-6">
          <!-- Photo de profil -->
          <div class="flex items-end -mt-16 mb-4">
            <div class="flex-shrink-0">
              <img
                :src="profile.profile_photo_url || '/images/default-avatar.png'"
                :alt="`Photo de ${profile.first_name} ${profile.last_name}`"
                class="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 object-cover"
              />
            </div>
            <div class="ml-6 flex-1">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex-1">
                  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ profile.first_name }} {{ profile.last_name }}
                  </h1>
                  <p v-if="profile.address" class="text-lg text-gray-600 dark:text-gray-400">
                    {{ profile.address }}
                  </p>
                </div>
                <!-- Actions -->
                <div class="flex-shrink-0">
                  <!-- Bouton de connexion dynamique -->
                  <button
                    v-if="connectionButtonInfo"
                    @click="handleConnectionAction"
                    :disabled="sending"
                    :class="connectionButtonInfo.class"
                  >
                    <svg v-if="!sending && connectionButtonInfo.action === 'connect'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <svg v-else-if="!sending && connectionButtonInfo.action === 'cancel'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <svg v-else-if="!sending && connectionButtonInfo.action === 'none'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div v-if="sending" class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    {{ connectionButtonInfo.text }}
                  </button>
                  
                  <!-- Bouton pour utilisateurs non authentifiés -->
                  <router-link
                    v-else-if="!isAuthenticated"
                    :to="{ name: 'login' }"
                    class="inline-flex items-center justify-center px-6 py-3 border border-ifdd-green-600 shadow-sm text-sm font-medium rounded-md text-ifdd-green-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifdd-green-500 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {{ $t('auth.login_to_connect') || 'Se connecter pour établir le contact' }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Badges et informations clés -->
          <div class="flex flex-wrap items-center gap-4 mb-6">
            <!-- Organisation -->
            <div v-if="profile.organization" class="flex items-center text-sm">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
              </svg>
              <span class="text-gray-700 dark:text-gray-300">{{ profile.organization.name }}</span>
              <span
                v-if="profile.organization.is_verified"
                class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                {{ $t('directory.verified') }}
              </span>
            </div>

            <!-- Pays -->
            <div v-if="profile.country" class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ profile.country.name_fr }}
            </div>

            <!-- Badges de rôles -->
            <div class="flex flex-wrap gap-2">
              <div v-if="isNegotiator" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                {{ $t('directory.badges.negotiator') }}
              </div>
              
              <div v-if="isTrainer" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.75 2.524z" />
                </svg>
                {{ $t('directory.badges.trainer') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Biographie -->
          <div v-if="profile.biography" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Biographie professionnelle
            </h2>
            <div class="prose prose-sm dark:prose-invert max-w-none">
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ profile.biography }}</p>
            </div>
          </div>

          <!-- Informations de négociateur -->
          <div v-if="isNegotiator && profile.negotiators && profile.negotiators.length > 0" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Expertise en négociation
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Années d'expérience
                </h3>
                <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {{ new Date().getFullYear() - Math.min(...profile.negotiators.map(n => n.designation_year)) }} ans
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Désignations
                </h3>
                <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {{ profile.negotiators[0].total_designations }}
                </p>
              </div>
              <div v-if="profile.negotiators[0].specialization_themes?.length">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Thématiques de spécialisation
                </h3>
                <div class="mt-2 flex flex-wrap gap-1">
                  <span 
                    v-for="theme in profile.negotiators[0].specialization_themes" 
                    :key="theme"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ theme }}
                  </span>
                </div>
              </div>
              <div v-if="profile.negotiators[0].cop_participations?.length">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  COP participées
                </h3>
                <div class="mt-2 flex flex-wrap gap-1">
                  <span 
                    v-for="cop in profile.negotiators[0].cop_participations" 
                    :key="cop"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300"
                  >
                    {{ cop }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Activités publiques -->
          <div v-if="profile.activities?.length" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Activités organisées
            </h2>
            <div class="space-y-4">
              <div 
                v-for="activity in profile.activities" 
                :key="activity.id"
                class="border-l-4 border-ifdd-green-500 pl-4"
              >
                <h3 class="font-medium text-gray-900 dark:text-white">{{ activity.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(activity.created_at) }}
                </p>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-2">
                  Organisateur
                </span>
              </div>
            </div>
          </div>

          <!-- Activités d'intervention -->
          <div v-if="profile.speaker_activities?.length" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Activités d'intervention
            </h2>
            <div class="space-y-4">
              <div 
                v-for="activity in profile.speaker_activities" 
                :key="`speaker-${activity.id}`"
                class="border-l-4 border-blue-500 pl-4"
              >
                <h3 class="font-medium text-gray-900 dark:text-white">{{ activity.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(activity.created_at) }}
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Intervenant
                  </span>
                  <span v-if="activity.speaker_info?.position" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {{ activity.speaker_info.position }}
                  </span>
                  <span v-if="activity.speaker_info?.organization" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {{ activity.speaker_info.organization }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Formations dispensées -->
          <div v-if="isTrainer && profile.trainings?.length" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Formations dispensées
            </h2>
            <div class="space-y-4">
              <div 
                v-for="training in profile.trainings" 
                :key="training.id"
                class="border-l-4 border-blue-500 pl-4"
              >
                <h3 class="font-medium text-gray-900 dark:text-white">{{ training.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(training.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne latérale -->
        <div class="space-y-6">
          <!-- Statistiques -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Statistiques
            </h3>
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('directory.member_since') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ profile.stats?.member_since }}</span>
                </div>
              </div>
              <div v-if="profile.stats?.activities_count">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Activités organisées</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ profile.stats.activities_count }}</span>
                </div>
              </div>
              <div v-if="profile.stats?.speaker_activities_count">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Interventions</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ profile.stats.speaker_activities_count }}</span>
                </div>
              </div>
              <div v-if="profile.stats?.trainings_count">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Formations</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ profile.stats.trainings_count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Organisation détaillée -->
          <div v-if="profile.organization" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Organisation
            </h3>
            <div class="space-y-3">
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">{{ profile.organization.name }}</h4>
                <p v-if="profile.organization.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ profile.organization.description }}
                </p>
              </div>
              <div v-if="profile.organization.website" class="pt-3 border-t border-gray-200 dark:border-gray-700">
                <a 
                  :href="profile.organization.website" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center text-sm text-ifdd-green-600 hover:text-ifdd-green-500"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Site web
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePublicProfiles } from '@/composables/usePublicProfiles'
import { useConnections } from '@/composables/useConnections'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()

// État local
const profile = ref(null)
const loading = ref(true)
const error = ref(null)
const sending = ref(false)
const connectionStatus = ref(null)
const connectionId = ref(null)
const isSentByCurrentUser = ref(false)

// Composables
const { getPublicProfile, sendConnectionRequest: sendConnection } = usePublicProfiles()
const { getConnectionStatus, cancelConnectionRequest } = useConnections()

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUserId = computed(() => authStore.user?.id)

const isNegotiator = computed(() => {
  return profile.value?.roles?.includes('negotiator') || false
})

const isTrainer = computed(() => {
  return profile.value?.roles?.includes('trainer') || false
})

const connectionButtonInfo = computed(() => {
  if (!isAuthenticated.value || currentUserId.value === profile.value?.id) {
    return null // Pas de bouton si non connecté ou même utilisateur
  }

  if (connectionStatus.value === 'pending' && isSentByCurrentUser.value) {
    return {
      text: t('profile.connections.status.pending') || 'Demande envoyée',
      action: 'cancel',
      class: 'inline-flex items-center justify-center px-6 py-3 border border-yellow-600 shadow-sm text-sm font-medium rounded-md text-yellow-600 bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200'
    }
  }

  if (connectionStatus.value === 'accepted') {
    return {
      text: t('profile.connections.status.accepted') || 'Connecté',
      action: 'none',
      class: 'inline-flex items-center justify-center px-6 py-3 border border-green-600 shadow-sm text-sm font-medium rounded-md text-green-600 bg-green-50 dark:bg-green-900/20 cursor-default'
    }
  }

  return {
    text: t('directory.connect') || 'Se connecter',
    action: 'connect',
    class: 'inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-ifdd-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifdd-green-500 transition-colors duration-200'
  }
})

// Méthodes
const checkConnectionStatus = async () => {
  if (!isAuthenticated.value || !profile.value?.id) return
  
  try {
    const result = await getConnectionStatus(profile.value.id)
    connectionStatus.value = result.status
    connectionId.value = result.connectionId
    isSentByCurrentUser.value = result.isSentByCurrentUser || false
  } catch (err) {
    console.error('Erreur lors de la vérification du statut de connexion:', err)
  }
}

const loadProfile = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await getPublicProfile(route.params.id)
    if (data) {
      profile.value = data
      // Vérifier le statut de connexion après avoir chargé le profil
      await checkConnectionStatus()
    } else {
      error.value = 'Profil non trouvé'
    }
  } catch (err) {
    console.error('Erreur lors du chargement du profil:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleConnectionAction = async () => {
  if (!profile.value || sending.value) return
  
  const buttonInfo = connectionButtonInfo.value
  if (!buttonInfo || buttonInfo.action === 'none') return
  
  sending.value = true
  try {
    if (buttonInfo.action === 'connect') {
      await sendConnection(profile.value.id)
      console.log('Demande de connexion envoyée avec succès')
      // Recharger le statut de connexion
      await checkConnectionStatus()
    } else if (buttonInfo.action === 'cancel' && connectionId.value) {
      const result = await cancelConnectionRequest(connectionId.value)
      if (result.success) {
        console.log('Demande de connexion annulée avec succès')
        // Réinitialiser le statut
        connectionStatus.value = null
        connectionId.value = null
        isSentByCurrentUser.value = false
      }
    }
  } catch (err) {
    console.error('Erreur lors de l\'action de connexion:', err)
    // Notifier l'utilisateur de l'erreur
  } finally {
    sending.value = false
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

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>