<template>
  <div
    :class="[
      'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 group',
      viewMode === 'list' ? 'flex' : ''
    ]"
  >
    <!-- Photo de profil premium -->
    <div :class="[
      'flex-shrink-0 flex justify-center relative',
      viewMode === 'list' ? 'w-20 h-20 items-center' : 'w-full pt-6 pb-4'
    ]">
      <div class="relative">
        <img
          :src="profile.profile_photo_thumbnail_url || '/images/default-avatar.png'"
          :alt="`Photo de ${profile.first_name} ${profile.last_name}`"
          :class="[
            'object-cover rounded-full border-3 border-white dark:border-gray-700 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-110',
            viewMode === 'list' ? 'w-16 h-16' : 'w-20 h-20'
          ]"
        />
        <!-- Anneau de statut décoratif -->
        <div :class="[
          'absolute -inset-1 rounded-full bg-gradient-to-r from-ifdd-vert-light to-ifdd-vert opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          viewMode === 'list' ? 'w-18 h-18' : 'w-22 h-22'
        ]"></div>
        <!-- Indicateur en ligne (optionnel) -->
        <div class="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
      </div>
    </div>

    <!-- Contenu -->
    <div :class="[
      'p-4 flex-1',
      viewMode === 'list' ? 'flex flex-col justify-between' : ''
    ]">
      <div>
        <!-- En-tête avec nom et badges -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
              {{ profile.first_name }} {{ profile.last_name }}
            </h3>
            <p v-if="profile.address" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
              {{ profile.address }}
            </p>
          </div>
          
          <!-- Badges -->
          <div class="flex flex-col items-end space-y-1 ml-2">
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

        <!-- Organisation -->
        <div v-if="profile.organization" class="mb-3">
          <div class="flex items-center text-sm">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
            </svg>
            <span class="text-gray-700 dark:text-gray-300 line-clamp-1">
              {{ profile.organization.name }}
            </span>
            <div class="ml-2">
              <span
                v-if="profile.organization.is_verified"
                class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                {{ $t('directory.verified') }}
              </span>
              <span
                v-else
                class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              >
                {{ $t('directory.not_verified') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Pays -->
        <div v-if="profile.country" class="mb-3">
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ profile.country.name_fr }}
          </div>
        </div>

        <!-- Statistiques (en mode grille seulement) -->
        <div v-if="viewMode === 'grid' && profile.stats" class="mb-4">
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div v-if="profile.stats.activities_count" class="flex items-center">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              {{ profile.stats.activities_count }} {{ $t('directory.activities') }}
            </div>
            <div v-if="profile.stats.member_since" class="flex items-center">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              {{ $t('directory.member_since') }} {{ profile.stats.member_since }}
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div :class="[
        'flex items-center space-x-3',
        viewMode === 'list' ? 'mt-3' : 'pt-4 border-t border-gray-200 dark:border-gray-700'
      ]">
        <router-link
          :to="{ name: 'public-profile', params: { id: profile.id } }"
          class="flex-1 bg-gradient-to-r from-ifdd-vert to-ifdd-vert-dark hover:from-ifdd-vert-dark hover:to-ifdd-violet-dark text-white text-sm font-semibold py-3 px-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg group-hover:shadow-ifdd-vert/25 flex items-center justify-center space-x-2"
        >
          <span>{{ $t('directory.view_profile') }}</span>
          <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </router-link>
        
        <button
          v-if="isAuthenticated"
          @click="$emit('connection-request', profile.id)"
          class="flex-shrink-0 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-ifdd-vert-light text-sm font-medium p-3 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-md group"
          title="Se connecter"
        >
          <svg class="w-5 h-5 transition-colors duration-300 group-hover:text-ifdd-vert" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  profile: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  }
})

const emit = defineEmits(['connection-request'])

// Computed
const isNegotiator = computed(() => {
  return props.profile.roles?.includes('negotiator') || false
})

const isTrainer = computed(() => {
  return props.profile.roles?.includes('trainer') || false
})

const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>