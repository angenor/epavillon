<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
    <!-- Header avec logo et badge vérifié -->
    <div class="p-6 pb-4">
      <div class="flex items-start justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img
              v-if="organization.logo_url"
              :src="organization.logo_url"
              :alt="organization.name"
              class="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            />
            <div
              v-else
              class="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <span class="text-xl font-bold text-white">
                {{ organization.name.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {{ organization.name }}
            </h3>
            <div class="flex items-center mt-1">
              <OrganizationTypeIcon :type="organization.organization_type" class="h-4 w-4 mr-1" />
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ getOrganizationTypeLabel(organization.organization_type) }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="organization.is_verified" class="flex-shrink-0">
          <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            {{ $t('organizations.verified') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Informations -->
    <div class="px-6 py-3 border-t border-gray-100 dark:border-gray-700">
      <!-- Pays -->
      <div class="flex items-center mb-3">
        <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ organization.countries?.name_fr || $t('organizations.unknownCountry') }}
        </span>
        <img
          v-if="organization.countries?.code"
          :src="`https://flagcdn.com/w20/${organization.countries.code.toLowerCase()}.png`"
          :alt="organization.countries.name_fr"
          class="ml-2 h-4 w-6 object-cover border border-gray-200 dark:border-gray-600"
        />
      </div>

      <!-- Nombre d'activités -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('organizations.activitiesCount', { count: getActivityCount(organization) }) }}
          </span>
        </div>
        
        <!-- Site web -->
        <a
          v-if="organization.website"
          :href="organization.website"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          {{ $t('organizations.website') }}
        </a>
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <!-- Bouton de validation -->
        <button
          v-if="!organization.is_verified && isAuthenticated"
          @click="handleValidate"
          :disabled="validating"
          class="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!validating" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <div v-else class="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700 mr-1"></div>
          {{ $t('organizations.validate') }}
        </button>

        <!-- Compteur de validations -->
        <span v-if="organization.validation_count > 0" class="text-xs text-gray-500 dark:text-gray-400">
          {{ $t('organizations.validations', { count: organization.validation_count }) }}
        </span>
      </div>

      <!-- Bouton voir détail -->
      <router-link
        :to="`/organizations/${organization.id}`"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        {{ $t('organizations.viewDetails') }}
        <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import OrganizationTypeIcon from '@/components/organization/OrganizationTypeIcon.vue'

const props = defineProps({
  organization: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['validate'])

const { isAuthenticated } = useAuthStore()
const validating = ref(false)

const organizationTypeLabels = {
  'public_national_institution': 'Institution publique nationale',
  'international_organization': 'Organisation internationale',
  'regional_organization': 'Organisation régionale',
  'ngo_association': 'ONG/Association',
  'private_sector': 'Secteur privé'
}

function getOrganizationTypeLabel(type) {
  return organizationTypeLabels[type] || type
}

function getActivityCount(organization) {
  return organization.activities?.[0]?.count || 0
}

async function handleValidate() {
  try {
    validating.value = true
    emit('validate', props.organization.id)
  } finally {
    validating.value = false
  }
}
</script>