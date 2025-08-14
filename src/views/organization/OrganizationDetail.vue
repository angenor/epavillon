<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ $t('organizationDetail.error.title') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('organizationDetail.error.notFound') }}
        </p>
        <div class="mt-6">
          <router-link
            to="/organizations"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {{ $t('common.back') }}
          </router-link>
        </div>
      </div>
    </div>

    <div v-else-if="organization">
      <!-- Header avec bannière -->
      <div class="relative h-48 md:h-64 lg:h-80 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
        <div class="absolute inset-0">
          <img 
            v-if="organization.banner_url"
            :src="organization.banner_url"
            :alt="organization.name + ' banner'"
            class="w-full h-full object-cover opacity-40"
          />
          <img 
            v-else
            src="/images/example/event_banniere_par_defaut_32_9.jpg"
            alt="Organization banner"
            class="w-full h-full object-cover opacity-30"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        </div>
        
        <div class="absolute inset-0 opacity-10">
          <svg class="absolute left-0 top-0 h-full" viewBox="0 0 400 400" fill="none">
            <circle cx="100" cy="200" r="150" stroke="white" stroke-width="2"/>
            <circle cx="50" cy="250" r="200" stroke="white" stroke-width="1"/>
          </svg>
        </div>
        
        <div class="relative h-full flex items-end">
          <div class="w-full p-6 md:p-8 lg:p-12">
            <div class="max-w-7xl mx-auto">
              <div class="flex items-center space-x-6">
                <div class="flex-shrink-0">
                  <div class="p-1 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <img
                      v-if="organization.logo_url"
                      :src="organization.logo_url"
                      :alt="organization.name"
                      class="h-20 w-20 md:h-24 md:w-24 rounded-xl object-cover"
                    />
                    <div
                      v-else
                      class="h-20 w-20 md:h-24 md:w-24 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                    >
                      <span class="text-2xl md:text-3xl font-bold text-white">
                        {{ organization.name?.charAt(0)?.toUpperCase() || 'O' }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="flex-1">
                  <div class="flex items-center flex-wrap gap-3 mb-2">
                    <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                      {{ organization.name || 'Organization' }}
                    </h1>
                    <div v-if="organization.is_verified" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 backdrop-blur-sm text-green-100 border border-green-400/30">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                      {{ $t('organizationDetail.verified') }}
                    </div>
                  </div>
                  
                  <div class="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base">
                    <div class="flex items-center">
                      <OrganizationTypeIcon :type="organization.organization_type" class="h-5 w-5 mr-2" />
                      <span>{{ getOrganizationTypeLabel(organization.organization_type) }}</span>
                    </div>
                    
                    <div class="flex items-center">
                      <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span>{{ organization.countries?.name_fr || $t('organizationDetail.unknownCountry') }}</span>
                      <img
                        v-if="organization.countries?.code"
                        :src="`https://flagcdn.com/w20/${organization.countries.code.toLowerCase()}.png`"
                        :alt="organization.countries.name_fr"
                        class="ml-2 h-4 w-6 object-cover rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav class="flex mb-6" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link
                to="/organizations"
                class="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                {{ $t('organizationDetail.breadcrumbs.organizations') }}
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                  {{ organization.name || 'Organization' }}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <!-- Organization Details Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
          <div class="p-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Left side: Description and details -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Contact info -->
                <div class="flex flex-wrap items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg class="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 6v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ $t('organizationDetail.createdOn') }} {{ formatDate(organization.created_at) }}</span>
                  </div>

                  <a
                    v-if="organization.email"
                    :href="`mailto:${organization.email}`"
                    class="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    {{ organization.email }}
                  </a>

                  <a
                    v-if="organization.website"
                    :href="organization.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    {{ $t('organizationDetail.website') }}
                  </a>
                </div>

                <!-- Description -->
                <div v-if="organization.description">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {{ $t('organizationDetail.description') }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{{ organization.description }}</p>
                </div>

                <!-- Aliases -->
                <div v-if="organization.organization_aliases && organization.organization_aliases.length > 0">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {{ $t('organizationDetail.aliases') }}
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="alias in organization.organization_aliases"
                      :key="alias.id"
                      :class="[
                        'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105',
                        alias.is_acronym 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      ]"
                    >
                      {{ alias.alias_name }}
                      <span v-if="alias.is_acronym" class="ml-1 text-xs opacity-90">{{ $t('organizationDetail.acronym') }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Right side: Actions and stats -->
              <div class="mt-6 lg:mt-0 lg:ml-6 lg:flex-shrink-0">
                <div class="space-y-4">
                  <!-- Validation button -->
                  <div v-if="!organization.is_verified && isAuthenticated">
                    <button
                      @click="handleValidateOrganization"
                      :disabled="validating"
                      class="w-full inline-flex justify-center items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="!validating" class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                      <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></div>
                      {{ $t('organizationDetail.validate') }}
                    </button>
                  </div>

                  <!-- Organization stats -->
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      {{ $t('organizationDetail.statistics') }}
                    </h3>
                    <div class="space-y-2">
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">{{ $t('organizationDetail.totalActivities') }}</span>
                        <span class="font-medium text-gray-900 dark:text-white">{{ organizationStats?.total || 0 }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">{{ $t('organizationDetail.liveActivities') }}</span>
                        <span class="font-medium text-green-600 dark:text-green-400">{{ organizationStats?.live || 0 }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">{{ $t('organizationDetail.upcomingActivities') }}</span>
                        <span class="font-medium text-blue-600 dark:text-blue-400">{{ organizationStats?.upcoming || 0 }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">{{ $t('organizationDetail.completedActivities') }}</span>
                        <span class="font-medium text-gray-600 dark:text-gray-400">{{ organizationStats?.completed || 0 }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Validations -->
                  <div v-if="organization.organization_validations && organization.organization_validations.length > 0" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      {{ $t('organizationDetail.validations') }} ({{ organization.organization_validations.length }})
                    </h3>
                    <div class="space-y-2">
                      <div
                        v-for="validation in organization.organization_validations.slice(0, 3)"
                        :key="validation.id"
                        class="flex items-center text-xs text-gray-600 dark:text-gray-400"
                      >
                        <svg class="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        <span>
                          {{ validation.users?.first_name }} {{ validation.users?.last_name }}
                        </span>
                      </div>
                      <div v-if="organization.organization_validations.length > 3" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ $t('organizationDetail.andMore', { count: organization.organization_validations.length - 3 }) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activities Section -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ $t('organizationDetail.activities.title') }}
              </h2>
            </div>

            <!-- Activity tabs -->
            <div class="flex space-x-1 mb-6">
              <button
                @click="changeTab('all')"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === 'all'
                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                {{ $t('organizationDetail.activities.all') }}
                <span v-if="organizationStats?.total > 0" class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gray-600 rounded-full">
                  {{ organizationStats.total }}
                </span>
              </button>
              <button
                @click="changeTab('upcoming')"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === 'upcoming'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                {{ $t('organizationDetail.activities.upcoming') }}
                <span v-if="organizationStats?.upcoming > 0" class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                  {{ organizationStats.upcoming }}
                </span>
              </button>
              <button
                @click="changeTab('live')"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === 'live'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                {{ $t('organizationDetail.activities.live') }}
                <span v-if="organizationStats?.live > 0" class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-600 rounded-full">
                  {{ organizationStats.live }}
                </span>
              </button>
              <button
                @click="changeTab('completed')"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === 'completed'
                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                {{ $t('organizationDetail.activities.completed') }}
                <span v-if="organizationStats?.completed > 0" class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gray-600 rounded-full">
                  {{ organizationStats.completed }}
                </span>
              </button>
            </div>

            <!-- Filters -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <!-- Event filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('organizationDetail.activities.filterByEvent') }}
                </label>
                <select
                  v-model="selectedEvent"
                  @change="applyFilters"
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{{ $t('organizationDetail.activities.allEvents') }}</option>
                  <option
                    v-for="event in events"
                    :key="event.id"
                    :value="event.id"
                  >
                    {{ event.acronym || event.title }} ({{ event.year }})
                  </option>
                </select>
              </div>

              <!-- Theme filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('organizationDetail.activities.filterByTheme') }}
                </label>
                <select
                  v-model="selectedTheme"
                  @change="applyFilters"
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{{ $t('organizationDetail.activities.allThemes') }}</option>
                  <option
                    v-for="theme in activityThemes"
                    :key="theme.value"
                    :value="theme.value"
                  >
                    {{ theme.label }}
                  </option>
                </select>
              </div>

              <!-- Sort -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('organizationDetail.activities.sortBy') }}
                </label>
                <div class="flex space-x-2">
                  <select
                    v-model="sortBy"
                    @change="applyFilters"
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option
                      v-for="option in sortOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <button
                    @click="toggleSortOrder"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg v-if="sortOrder === 'asc'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                    </svg>
                    <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Activities List -->
            <OrganizationActivitiesList
              :activities="activities"
              :loading="activitiesLoading"
              :current-page="currentPage"
              :total-pages="totalPages"
              :has-next-page="hasNextPage"
              :has-prev-page="hasPrevPage"
              @go-to-page="goToPage"
              @next-page="nextPage"
              @prev-page="prevPage"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Organization Detail
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          This page is under development.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrganizationDetail } from '@/composables/useOrganizationDetail'
import { useAuthStore } from '@/stores/auth'
import OrganizationTypeIcon from '@/components/organization/OrganizationTypeIcon.vue'
import OrganizationActivitiesList from '@/components/organization/OrganizationActivitiesList.vue'

const route = useRoute()
const { isAuthenticated } = useAuthStore()

const {
  organization,
  activities,
  events,
  loading,
  activitiesLoading,
  error,
  activeTab,
  selectedEvent,
  selectedTheme,
  sortBy,
  sortOrder,
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  activityThemes,
  sortOptions,
  organizationStats,
  fetchOrganizationDetail,
  fetchEvents,
  validateOrganization,
  changeTab,
  applyFilters,
  goToPage,
  nextPage,
  prevPage,
  toggleSortOrder,
  formatDate
} = useOrganizationDetail()

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

async function handleValidateOrganization() {
  try {
    validating.value = true
    await validateOrganization(organization.value.id)
  } catch (err) {
    console.error('Erreur lors de la validation:', err)
  } finally {
    validating.value = false
  }
}

onMounted(async () => {
  const organizationId = route.params.id
  if (organizationId) {
    await Promise.all([
      fetchOrganizationDetail(organizationId),
      fetchEvents()
    ])
  }
})
</script>