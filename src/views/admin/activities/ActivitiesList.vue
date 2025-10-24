<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-activities max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.activities.title') }}
        </h1>
        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          {{ t('admin.activities.subtitle') }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <!-- <button @click="goToDatesManager"
                class="cursor-pointer px-5 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors duration-200 shadow-sm">
          <svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {{ t('admin.activities.manageDates') || 'Gérer les dates' }}
        </button> -->
        <button @click="exportActivities"
                class="cursor-pointer px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm">
          <svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          {{ t('admin.activities.export') }}
        </button>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100 dark:border-gray-700">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {{ t('admin.activities.stats.pending') }}
        </div>
        <div class="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">
          {{ stats.pending }}
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100 dark:border-gray-700">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {{ t('admin.activities.stats.approved') }}
        </div>
        <div class="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
          {{ stats.approved }}
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100 dark:border-gray-700">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {{ t('admin.activities.stats.rejected') }}
        </div>
        <div class="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
          {{ stats.rejected }}
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100 dark:border-gray-700">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {{ t('admin.activities.stats.total') }}
        </div>
        <div class="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
          {{ stats.total }}
        </div>
      </div>
    </div>

    <!-- Onglets de filtrage -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          <button v-for="tab in tabs" :key="tab.key"
                  @click="activeTab = tab.key"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === tab.key
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  ]">
            {{ t(tab.label) }}
            <span v-if="tab.count !== undefined"
                  :class="[
                    'ml-2 py-0.5 px-2 rounded-full text-xs',
                    activeTab === tab.key
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  ]">
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Filtres -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <!-- Recherche -->
          <div class="lg:col-span-2">
            <input v-model="filters.search"
                   type="text"
                   :placeholder="t('admin.activities.searchPlaceholder')"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Filtre par événement -->
          <div>
            <select v-model="filters.event"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.activities.allEvents') }}</option>
              <option v-for="event in events" :key="event.id" :value="event.id">
                {{ event.title }} ({{ event.year }})
              </option>
            </select>
          </div>

          <!-- Filtre par pays -->
          <div>
            <select v-model="filters.country"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.activities.allCountries') }}</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ country.name_fr }}
              </option>
            </select>
          </div>

          <!-- Filtre par thématique -->
          <div>
            <select v-model="filters.theme"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.activities.allThemes') }}</option>
              <option value="mitigation">{{ t('activities.themes.mitigation') }}</option>
              <option value="adaptation">{{ t('activities.themes.adaptation') }}</option>
              <option value="climate_resilience">{{ t('activities.themes.climate_resilience') }}</option>
              <option value="loss_and_damage">{{ t('activities.themes.loss_and_damage') }}</option>
              <option value="clean_tech_innovations">{{ t('activities.themes.clean_tech_innovations') }}</option>
              <option value="renewable_energy_land">{{ t('activities.themes.renewable_energy_land') }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des activités en cartes -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">{{ t('admin.activities.loading') }}</p>
      </div>
    </div>

    <div v-else-if="filteredActivities.length === 0" class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <p class="text-gray-500 dark:text-gray-400 text-lg">{{ t('admin.activities.noActivities') }}</p>
    </div>

    <div v-else>
      <!-- En-tête de sélection -->
      <div v-if="paginatedActivities.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-6 py-3 mb-4 flex items-center justify-between border border-gray-100 dark:border-gray-700">
        <div class="flex items-center">
          <input type="checkbox"
                 :checked="isAllPageSelected"
                 :indeterminate.prop="isSomePageSelected"
                 @change="toggleSelectAll"
                 class="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer">
          <label class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('admin.activities.selectAll') || 'Tout sélectionner sur cette page' }}
            <span v-if="selectedActivityIds.length > 0" class="text-orange-600 dark:text-orange-400">
              ({{ selectedActivityIds.length }} {{ t('admin.activities.selected') || 'sélectionnée(s)' }})
            </span>
          </label>
        </div>
      </div>

      <!-- Liste des activités -->
      <div class="space-y-4 mb-8">
        <div v-for="activity in paginatedActivities" :key="activity.id"
             :class="[
               'bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border overflow-hidden',
               selectedActivityIds.includes(activity.id)
                 ? 'border-orange-500 dark:border-orange-600 ring-2 ring-orange-200 dark:ring-orange-900/50'
                 : 'border-gray-100 dark:border-gray-700'
             ]">

          <div class="flex">
            <!-- Checkbox de sélection -->
            <div class="flex items-center justify-center w-12 bg-gray-50 dark:bg-gray-700/50">
              <input type="checkbox"
                     :checked="selectedActivityIds.includes(activity.id)"
                     @change="toggleSelectActivity(activity.id)"
                     @click.stop
                     class="w-5 h-5 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer">
            </div>

            <!-- Image miniature avec logo organisation -->
            <div @click="viewActivity(activity)" class="w-32 h-32 cursor-pointer flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600">
              <img v-if="activity.cover_image_low_url"
                   :src="activity.cover_image_low_url"
                   :alt="activity.title"
                   class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-10 h-10 text-orange-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>

              <!-- Logo de l'organisation en overlay avec indicateur de vue -->
              <div v-if="activity.organization?.logo_url" class="absolute bottom-2 right-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 border border-gray-200 dark:border-gray-600">
                <img :src="activity.organization.logo_url"
                     :alt="activity.organization.name"
                     :class="[
                       'w-full h-full object-contain',
                       hasViewedActivity(activity.id) ? 'opacity-60' : ''
                     ]">

                <!-- Badge "vue" -->
                <div
                  v-if="hasViewedActivity(activity.id)"
                  class="absolute -top-1 -right-1 bg-blue-500 dark:bg-blue-600 rounded-full p-0.5"
                  title="Activité déjà vue"
                >
                  <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Contenu principal -->
            <div class="flex-1 p-5">
              <div class="flex items-start justify-between">
                <div class="flex-1 mr-4">
                  <!-- Titre -->
                  <h3 @click="viewActivity(activity)" class="text-base cursor-pointer hover:text-amber-500 font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2"
                      :title="activity.title">
                    {{ activity.title }}
                  </h3>

                  <!-- Métadonnées sur une ligne -->
                  <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div class="flex items-center">
                      <!-- Logo de l'organisation ou icône par défaut -->
                      <div class="w-5 h-5 mr-2 flex-shrink-0">
                        <img v-if="activity.organization?.logo_url"
                             :src="activity.organization.logo_url"
                             :alt="activity.organization.name"
                             class="w-full h-full object-contain rounded">
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/>
                        </svg>
                      </div>
                      <span class="truncate max-w-[200px]">{{ activity.organization?.name || '-' }}</span>
                    </div>
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span>{{ activity.event?.title }}</span>
                    </div>
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>{{ formatDate(activity.created_at) }}</span>
                    </div>
                  </div>

                  <!-- Tags en ligne -->
                  <div class="flex items-center gap-2 flex-wrap">
                    <!-- Badge de statut -->
                    <span :class="getStatusClass(activity.validation_status)"
                          class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold">
                      {{ getStatusText(activity.validation_status) }}
                    </span>

                    <!-- Type et format -->
                    <span class="px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-md text-xs border border-gray-200 dark:border-gray-600">
                      {{ activity.activity_type }}
                    </span>
                    <span class="px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-md text-xs border border-gray-200 dark:border-gray-600">
                      {{ activity.format }}
                    </span>

                    <!-- Pays avec drapeau -->
                    <div v-if="activity.organization?.country" class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      <img v-if="activity.organization.country.code"
                           :src="`https://flagcdn.com/w20/${activity.organization.country.code.toLowerCase()}.png`"
                           :alt="activity.organization.country.name_fr"
                           class="w-4 h-3 mr-1.5 object-cover rounded-sm"
                           loading="lazy">
                      <span>{{ activity.organization.country.name_fr }}</span>
                    </div>

                    <!-- Nombre de commentaires -->
                    <div v-if="activity.comments_count > 0" class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500 text-white">
                      <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                      {{ activity.comments_count }}
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 ml-4">
                  <button @click="viewActivity(activity)"
                          class="cursor-pointer px-3 py-1.5 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/10 font-medium text-sm rounded-lg transition-all duration-150">
                    {{ t('admin.activities.view') }}
                  </button>
                  <!-- Bouton Email (Super Admin seulement) -->
                  <!-- <button v-if="canSendEmails"
                          @click="openForActivity(activity.id, activity.event_id)"
                          class="cursor-pointer p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-150"
                          :title="t('email.send_email') || 'Envoyer un email'">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </button>
                  <button v-if="['submitted', 'under_review'].includes(activity.validation_status)"
                          @click="approveActivity(activity)"
                          class="cursor-pointer p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-all duration-150"
                          :title="t('admin.activities.approve')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </button>
                  <button v-if="['submitted', 'under_review'].includes(activity.validation_status)"
                          @click="rejectActivity(activity)"
                          class="cursor-pointer p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150"
                          :title="t('admin.activities.reject')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Barre d'actions flottante pour la sélection multiple -->
      <Transition name="slide-up">
        <div v-if="selectedActivityIds.length > 0" class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 max-w-5xl">
          <div class="bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-2xl px-6 py-4 border border-gray-700">
            <div class="flex items-center space-x-4">
              <!-- Compteur de sélection -->
              <div class="flex items-center space-x-2">
                <div class="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {{ selectedActivityIds.length }}
                </div>
                <span class="text-sm font-medium whitespace-nowrap">
                  {{ selectedActivityIds.length === 1 ? t('admin.activities.oneSelected') : t('admin.activities.multipleSelected', { count: selectedActivityIds.length }) }}
                </span>
              </div>

              <!-- Divider -->
              <div class="h-8 w-px bg-gray-600"></div>

              <!-- Label -->
              <span class="text-sm font-medium whitespace-nowrap">{{ t('admin.activities.changeStatusTo') }}</span>

              <!-- Boutons de statut -->
              <div class="flex items-center gap-2 flex-wrap">
                <button v-for="status in availableStatuses" :key="status.value"
                        @click="bulkChangeStatus(status.value)"
                        :class="[
                          'cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center space-x-1.5 whitespace-nowrap',
                          status.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                          status.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                          status.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                          status.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700' :
                          status.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                          status.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' :
                          'bg-gray-600 hover:bg-gray-700',
                          'text-white'
                        ]">
                  <span>{{ status.icon }}</span>
                  <span>{{ status.label }}</span>
                </button>
              </div>

              <!-- Divider -->
              <div class="h-8 w-px bg-gray-600"></div>

              <!-- Bouton annuler -->
              <button @click="clearSelection"
                      class="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all duration-150 whitespace-nowrap">
                {{ t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-6 py-4 flex items-center justify-between border border-gray-100 dark:border-gray-700">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="previousPage"
                  :disabled="currentPage === 1"
                  class="cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
            {{ t('admin.activities.previous') }}
          </button>
          <button @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="cursor-pointer ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
            {{ t('admin.activities.next') }}
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('admin.activities.showing') }}
              <span class="font-semibold text-gray-900 dark:text-white">{{ (currentPage - 1) * pageSize + 1 }}</span>
              {{ t('admin.activities.to') }}
              <span class="font-semibold text-gray-900 dark:text-white">{{ Math.min(currentPage * pageSize, filteredActivities.length) }}</span>
              {{ t('admin.activities.of') }}
              <span class="font-semibold text-gray-900 dark:text-white">{{ filteredActivities.length }}</span>
              {{ t('admin.activities.results') }}
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
              <button @click="previousPage"
                      :disabled="currentPage === 1"
                      class="cursor-pointer relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button v-for="page in visiblePages" :key="page"
                      @click="goToPage(page)"
                      :class="[
                        'cursor-pointer relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-150',
                        page === currentPage
                          ? 'z-10 bg-orange-50 border-orange-500 text-orange-600 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-400'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                      ]">
                {{ page }}
              </button>
              <button @click="nextPage"
                      :disabled="currentPage === totalPages"
                      class="cursor-pointer relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de validation -->
    <div v-if="showValidationModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeValidationModal"></div>

        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div :class="[
                'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10',
                validationAction === 'approve' ? 'bg-green-100' : 'bg-red-100'
              ]">
                <svg v-if="validationAction === 'approve'" class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <svg v-else class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                  <template v-if="isBulkAction">
                    <span class="mr-2">{{ targetStatusInfo.icon }}</span>
                    <span>{{ t('admin.activities.confirmBulkStatusChange', { status: targetStatusInfo.label }) }}</span>
                  </template>
                  <template v-else>
                    {{ validationAction === 'approve' ? t('admin.activities.confirmApproval') : t('admin.activities.confirmRejection') }}
                  </template>
                </h3>
                <div class="mt-2">
                  <!-- Mode action simple -->
                  <template v-if="!isBulkAction">
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {{ selectedActivity?.title }}
                    </p>
                  </template>

                  <!-- Mode action en masse -->
                  <template v-else>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {{ t('admin.activities.bulkStatusChangeWarning', { count: selectedActivityIds.length, status: targetStatusInfo.label }) }}
                    </p>
                    <div class="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                      <ul class="space-y-1 text-xs">
                        <li v-for="activity in selectedActivities" :key="activity.id" class="flex items-start">
                          <svg class="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                          <span class="text-gray-700 dark:text-gray-300">{{ activity.title }}</span>
                        </li>
                      </ul>
                    </div>
                  </template>

                  <!-- Champ de raison pour les statuts qui le nécessitent -->
                  <textarea v-if="(isBulkAction && statusesRequiringReason.includes(bulkTargetStatus)) || (!isBulkAction && validationAction === 'reject')"
                           v-model="validationReason"
                           :placeholder="isBulkAction ? t('admin.activities.bulkStatusChangeReason') : t('admin.activities.rejectionReason')"
                           rows="3"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  </textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="confirmValidation"
                    :disabled="(isBulkAction && statusesRequiringReason.includes(bulkTargetStatus) && !validationReason.trim()) || (!isBulkAction && validationAction === 'reject' && !validationReason.trim())"
                    :class="[
                      'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer',
                      isBulkAction
                        ? (targetStatusInfo.color === 'green' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                           targetStatusInfo.color === 'red' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                           targetStatusInfo.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' :
                           targetStatusInfo.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' :
                           targetStatusInfo.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' :
                           targetStatusInfo.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' :
                           'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500')
                        : (validationAction === 'approve'
                          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                          : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'),
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    ]">
              <span v-if="isBulkAction">{{ t('admin.activities.confirmStatusChange') }}</span>
              <span v-else>{{ validationAction === 'approve' ? t('admin.activities.approve') : t('admin.activities.reject') }}</span>
            </button>
            <button @click="closeValidationModal"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import { useAuth } from '@/composables/useAuth'
import { useEmailModal } from '@/composables/useEmailModal'
import { useRevisionViews } from '@/composables/useRevisionViews'
import { useCommentBroadcast } from '@/composables/useCommentBroadcast'
import * as XLSX from 'xlsx'

const { t } = useI18n()
const router = useRouter()
const { supabase } = useSupabase()
const { hasReviewerOrAdminRole, isLoadingRoles, loadUserRoles, validateActivity } = useAdmin()
const { currentUser } = useAuth()
const { openForActivity, canSendEmails } = useEmailModal()
const { recordActivityView, loadViewedActivities, hasViewedActivity } = useRevisionViews()
const { addListener, removeListener } = useCommentBroadcast()

const LISTENER_ID = 'activities-list' // ID unique pour ce composant

// État
const isLoading = ref(true)
const activities = ref([])
const events = ref([])
const countries = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const activeTab = ref('pending')

// Modal de validation
const showValidationModal = ref(false)
const selectedActivity = ref(null)
const validationAction = ref(null)
const validationReason = ref('')

// Sélection multiple
const selectedActivityIds = ref([])
const isBulkAction = ref(false)
const bulkTargetStatus = ref('approved') // Statut cible pour l'action en masse

const filters = ref({
  search: '',
  event: '',
  country: '',
  theme: ''
})

const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
})

// Vérification des permissions (attendre le chargement des rôles)
const checkAccess = async () => {
  await loadUserRoles()

  if (!hasReviewerOrAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

// Computed
const tabs = computed(() => [
  {
    key: 'pending',
    label: 'admin.activities.tabs.pending',
    count: stats.value.pending
  },
  {
    key: 'under_review',
    label: 'admin.activities.tabs.underReview',
    count: activities.value.filter(a => a.validation_status === 'under_review').length
  },
  {
    key: 'approved',
    label: 'admin.activities.tabs.approved',
    count: stats.value.approved
  },
  {
    key: 'rejected',
    label: 'admin.activities.tabs.rejected',
    count: stats.value.rejected
  },
  {
    key: 'all',
    label: 'admin.activities.tabs.all',
    count: stats.value.total
  }
])

const filteredActivities = computed(() => {
  let filtered = activities.value

  // Filtrer par onglet actif
  if (activeTab.value !== 'all') {
    if (activeTab.value === 'pending') {
      filtered = filtered.filter(activity =>
        ['submitted', 'under_review'].includes(activity.validation_status)
      )
    } else {
      filtered = filtered.filter(activity =>
        activity.validation_status === activeTab.value
      )
    }
  }

  // Filtrer par recherche
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(activity =>
      activity.title?.toLowerCase().includes(search) ||
      activity.organization?.name?.toLowerCase().includes(search) ||
      activity.event?.title?.toLowerCase().includes(search)
    )
  }

  // Filtrer par événement
  if (filters.value.event) {
    filtered = filtered.filter(activity =>
      activity.event_id === filters.value.event
    )
  }

  // Filtrer par pays
  if (filters.value.country) {
    filtered = filtered.filter(activity =>
      activity.organization?.country?.id === filters.value.country
    )
  }

  // Filtrer par thématique
  if (filters.value.theme) {
    filtered = filtered.filter(activity =>
      activity.main_themes?.includes(filters.value.theme)
    )
  }

  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const totalPages = computed(() => Math.ceil(filteredActivities.value.length / pageSize.value))

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredActivities.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Liste de tous les statuts disponibles
const availableStatuses = computed(() => [
  { value: 'draft', label: t('admin.activities.statuses.draft'), icon: '📝', color: 'gray' },
  { value: 'submitted', label: t('admin.activities.statuses.submitted'), icon: '📤', color: 'blue' },
  { value: 'under_review', label: t('admin.activities.statuses.underReview'), icon: '👁️', color: 'amber' },
  { value: 'approved', label: t('admin.activities.statuses.approved'), icon: '✅', color: 'green' },
  { value: 'rejected', label: t('admin.activities.statuses.rejected'), icon: '❌', color: 'red' },
  { value: 'cancelled', label: t('admin.activities.statuses.cancelled'), icon: '🚫', color: 'gray' },
  { value: 'live', label: t('admin.activities.statuses.live'), icon: '🔴', color: 'purple' },
  { value: 'completed', label: t('admin.activities.statuses.completed'), icon: '🏁', color: 'indigo' }
])

// Computed properties pour la sélection multiple
const selectedActivities = computed(() => {
  return activities.value.filter(activity => selectedActivityIds.value.includes(activity.id))
})

const isAllPageSelected = computed(() => {
  return paginatedActivities.value.length > 0 &&
    paginatedActivities.value.every(activity => selectedActivityIds.value.includes(activity.id))
})

const isSomePageSelected = computed(() => {
  return paginatedActivities.value.some(activity => selectedActivityIds.value.includes(activity.id)) &&
    !isAllPageSelected.value
})

const canChangeStatus = computed(() => {
  return selectedActivityIds.value.length > 0
})

// Informations sur le statut cible pour le changement en masse
const targetStatusInfo = computed(() => {
  return availableStatuses.value.find(s => s.value === bulkTargetStatus.value) || availableStatuses.value[0]
})

// Les statuts qui nécessitent une raison/commentaire
const statusesRequiringReason = ['rejected', 'cancelled']

// Méthodes
const loadActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        organization:organizations(
          id,
          name,
          organization_type,
          logo_url,
          country:countries(id, name_fr, code)
        ),
        event:events(id, title, year)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Charger le nombre de commentaires non lus pour chaque activité
    const activitiesWithComments = await Promise.all(
      (data || []).map(async (activity) => {
        // Charger le nombre de commentaires non lus pour cet utilisateur
        const { data: unreadData } = await supabase
          .from('v_unread_comments_by_activity')
          .select('unread_count')
          .eq('activity_id', activity.id)
          .eq('revisionniste_id', currentUser.value?.id)
          .maybeSingle()

        return {
          ...activity,
          comments_count: unreadData?.unread_count || 0
        }
      })
    )

    activities.value = activitiesWithComments
    calculateStats()
  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error)
  } finally {
    isLoading.value = false
  }
}

const loadEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, year')
      .order('year', { ascending: false })

    if (error) throw error

    events.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des événements:', error)
  }
}

const loadCountries = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name_fr, code')
      .order('name_fr', { ascending: true })

    if (error) throw error

    countries.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des pays:', error)
  }
}

const calculateStats = () => {
  stats.value = {
    pending: activities.value.filter(a => ['submitted', 'under_review'].includes(a.validation_status)).length,
    approved: activities.value.filter(a => a.validation_status === 'approved').length,
    rejected: activities.value.filter(a => a.validation_status === 'rejected').length,
    total: activities.value.length
  }
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100/90 text-gray-700 dark:bg-gray-700/80 dark:text-gray-300',
    submitted: 'bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300',
    under_review: 'bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300',
    approved: 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300',
    rejected: 'bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300',
    cancelled: 'bg-gray-100/90 text-gray-700 dark:bg-gray-700/80 dark:text-gray-300'
  }
  return classes[status] || classes.draft
}

const getStatusText = (status) => {
  const texts = {
    draft: t('admin.activities.statuses.draft'),
    submitted: t('admin.activities.statuses.submitted'),
    under_review: t('admin.activities.statuses.underReview'),
    approved: t('admin.activities.statuses.approved'),
    rejected: t('admin.activities.statuses.rejected'),
    cancelled: t('admin.activities.statuses.cancelled')
  }
  return texts[status] || texts.draft
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const viewActivity = async (activity) => {
  // Enregistrer que le révisionniste a vu cette activité
  await recordActivityView(activity.id)

  router.push(`/admin/activities/${activity.id}`)
}

const approveActivity = (activity) => {
  selectedActivity.value = activity
  validationAction.value = 'approve'
  isBulkAction.value = false
  showValidationModal.value = true
}

const rejectActivity = (activity) => {
  selectedActivity.value = activity
  validationAction.value = 'reject'
  validationReason.value = ''
  isBulkAction.value = false
  showValidationModal.value = true
}

// Méthodes de sélection multiple
const toggleSelectAll = () => {
  if (isAllPageSelected.value) {
    // Désélectionner toutes les activités de la page
    const pageIds = paginatedActivities.value.map(a => a.id)
    selectedActivityIds.value = selectedActivityIds.value.filter(id => !pageIds.includes(id))
  } else {
    // Sélectionner toutes les activités de la page
    const pageIds = paginatedActivities.value.map(a => a.id)
    const newIds = pageIds.filter(id => !selectedActivityIds.value.includes(id))
    selectedActivityIds.value = [...selectedActivityIds.value, ...newIds]
  }
}

const toggleSelectActivity = (activityId) => {
  const index = selectedActivityIds.value.indexOf(activityId)
  if (index > -1) {
    selectedActivityIds.value.splice(index, 1)
  } else {
    selectedActivityIds.value.push(activityId)
  }
}

const clearSelection = () => {
  selectedActivityIds.value = []
}

const bulkChangeStatus = (targetStatus) => {
  if (selectedActivityIds.value.length === 0) return
  bulkTargetStatus.value = targetStatus
  validationAction.value = targetStatus === 'rejected' ? 'reject' : 'approve'
  validationReason.value = ''
  isBulkAction.value = true
  showValidationModal.value = true
}

const confirmValidation = async () => {
  if (!currentUser.value) return

  try {
    // Déterminer le statut cible
    let targetStatus
    if (isBulkAction.value) {
      targetStatus = bulkTargetStatus.value
    } else {
      targetStatus = validationAction.value === 'approve' ? 'approved' : 'rejected'
    }

    if (isBulkAction.value) {
      // Action en masse
      if (selectedActivityIds.value.length === 0) return

      let successCount = 0
      let errorCount = 0

      // Traiter chaque activité sélectionnée
      for (const activityId of selectedActivityIds.value) {
        const result = await validateActivity(
          activityId,
          targetStatus,
          currentUser.value.id,
          validationReason.value || null
        )

        if (result.success) {
          successCount++
          // Mettre à jour l'activité dans la liste
          const activityIndex = activities.value.findIndex(a => a.id === activityId)
          if (activityIndex !== -1) {
            activities.value[activityIndex].validation_status = targetStatus
          }
        } else {
          errorCount++
          console.error(`Erreur lors de la validation de l'activité ${activityId}:`, result.error)
        }
      }

      // Nettoyer la sélection
      selectedActivityIds.value = []
      calculateStats()
      closeValidationModal()

      console.log(`Changement de statut en masse terminé: ${successCount} succès, ${errorCount} erreurs`)
      // TODO: Afficher une notification avec le résumé
    } else {
      // Action simple
      if (!selectedActivity.value) return

      const result = await validateActivity(
        selectedActivity.value.id,
        targetStatus,
        currentUser.value.id,
        validationReason.value || null
      )

      if (result.success) {
        // Mettre à jour l'activité dans la liste
        const activityIndex = activities.value.findIndex(a => a.id === selectedActivity.value.id)
        if (activityIndex !== -1) {
          activities.value[activityIndex].validation_status = targetStatus
        }

        calculateStats()
        closeValidationModal()

        // TODO: Afficher une notification de succès
      } else {
        console.error('Erreur lors de la validation:', result.error)
        // TODO: Afficher une notification d'erreur
      }
    }
  } catch (error) {
    console.error('Erreur lors de la validation:', error)
  }
}

const closeValidationModal = () => {
  showValidationModal.value = false
  selectedActivity.value = null
  validationAction.value = null
  validationReason.value = ''
  isBulkAction.value = false
}

const exportActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        organization:organizations(
          id,
          name,
          email,
          organization_type,
          country:countries(name_fr, name_en)
        ),
        event:events(id, title, year),
        submitter:users!activities_submitted_by_fkey(
          id,
          email,
          first_name,
          last_name,
          phone,
          country:countries(name_fr, name_en)
        )
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    const exportData = data.map(activity => ({
      'ID': activity.id,
      'Titre': activity.title,
      'Type': activity.activity_type,
      'Format': activity.format,
      'Statut': getStatusText(activity.validation_status),
      'Thématiques': activity.main_themes?.join(', ') || '',
      'Catégories': activity.categories?.join(', ') || '',
      'Organisation': activity.organization?.name || '',
      'Type d\'organisation': activity.organization?.organization_type || '',
      'Pays organisation': activity.organization?.country?.name_fr || '',
      'Email organisation': activity.organization?.email || '',
      'Soumis par - Prénom': activity.submitter?.first_name || '',
      'Soumis par - Nom': activity.submitter?.last_name || '',
      'Soumis par - Email': activity.submitter?.email || '',
      'Soumis par - Téléphone': activity.submitter?.phone || '',
      'Soumis par - Pays': activity.submitter?.country?.name_fr || '',
      'Événement': activity.event?.title || '',
      'Année événement': activity.event?.year || '',
      'Date de début proposée': activity.proposed_start_date ? new Date(activity.proposed_start_date).toLocaleString('fr-FR') : '',
      'Date de fin proposée': activity.proposed_end_date ? new Date(activity.proposed_end_date).toLocaleString('fr-FR') : '',
      'Date de début finale': activity.final_start_date ? new Date(activity.final_start_date).toLocaleString('fr-FR') : '',
      'Date de fin finale': activity.final_end_date ? new Date(activity.final_end_date).toLocaleString('fr-FR') : '',
      'Date de soumission': new Date(activity.created_at).toLocaleString('fr-FR'),
      'Dernière mise à jour': new Date(activity.updated_at).toLocaleString('fr-FR')
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Activités')

    const date = new Date().toISOString().split('T')[0]
    const filename = `activites_export_${date}.xlsx`

    XLSX.writeFile(workbook, filename)
  } catch (error) {
    console.error('Erreur lors de l\'export des activités:', error)
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Fonction pour mettre à jour le compteur de commentaires non lus d'une activité spécifique
const updateActivityUnreadCount = async (activityId) => {
  if (!currentUser.value) return

  try {
    const { data, error } = await supabase
      .from('v_unread_comments_by_activity')
      .select('unread_count')
      .eq('activity_id', activityId)
      .eq('revisionniste_id', currentUser.value.id)
      .maybeSingle()

    if (error) throw error

    // Mettre à jour le compteur dans la liste des activités
    const activityIndex = activities.value.findIndex(a => a.id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].comments_count = data?.unread_count || 0
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur non lu:', error)
  }
}

// Subscription realtime pour les nouveaux commentaires
let realtimeSubscription = null

const subscribeToRealtimeComments = () => {
  if (!currentUser.value) return

  realtimeSubscription = supabase
    .channel('activities-list-comments')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'revision_comments'
    }, async (payload) => {
      console.log('ActivitiesList - Nouveau commentaire détecté:', payload.new)

      // Si l'utilisateur est destinataire, recharger le compteur pour cette activité
      if (payload.new.shared_with_revisionists?.includes(currentUser.value.id) ||
          payload.new.created_by === currentUser.value.id) {
        await updateActivityUnreadCount(payload.new.activity_id)
      }
    })
    .subscribe()

  console.log('ActivitiesList - Subscription realtime activée')
}

// S'abonner aux changements de lecture de commentaires via le composable partagé
const subscribeToCommentReads = () => {
  if (!currentUser.value) return

  // Ajouter un listener pour recevoir les broadcasts
  addListener(LISTENER_ID, async (payload) => {
    console.log('ActivitiesList - Broadcast reçu:', payload)

    if (payload?.activity_id) {
      // Mettre à jour le compteur pour cette activité
      await updateActivityUnreadCount(payload.activity_id)
    }
  })

  console.log('ActivitiesList - Listener ajouté')
}

// Watchers
watch([() => filters.value, activeTab], () => {
  currentPage.value = 1
}, { deep: true })

// Cycle de vie
onMounted(async () => {
  try {
    await checkAccess()
    await Promise.all([
      loadActivities(),
      loadEvents(),
      loadCountries(),
      loadViewedActivities() // Charger les activités déjà vues par le révisionniste
    ])

    // S'abonner aux changements de commentaires
    subscribeToCommentReads()
    subscribeToRealtimeComments()
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})

onBeforeUnmount(() => {
  // Retirer le listener
  removeListener(LISTENER_ID)
  console.log('ActivitiesList - Listener retiré')

  // Nettoyer la subscription realtime
  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription)
    console.log('ActivitiesList - Subscription realtime nettoyée')
  }
})
</script>

<style scoped>
/* Animation pour la barre d'actions flottante */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translate(-50%, 100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}
</style>
