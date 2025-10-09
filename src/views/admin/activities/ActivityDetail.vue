<template>
  <div class="admin-activity-detail">
    <!-- Sidebar de navigation des activités -->
    <ActivityReviewSidebar
      :is-open="isReviewSidebarOpen"
      :current-activity-id="route.params.id"
      @close="closeReviewSidebar"
      @select="handleActivitySelect"
    />

    <!-- Contenu principal avec marge ajustée -->
    <div :class="['transition-all duration-300', isReviewSidebarOpen ? 'ml-80' : 'ml-0']">
      <div v-if="isLoadingRoles || isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Chargement...</p>
      </div>
    </div>


    <div v-else-if="activity" class="space-y-6">
      <!-- Banner de l'activité si disponible -->
      <div v-if="activity.banner_url || activity.cover_image_high_url" class="relative h-64 rounded-lg overflow-hidden shadow-lg">
        <img :src="activity.banner_url || activity.cover_image_high_url"
             :alt="activity.title"
             class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6">
          <h1 class="text-3xl font-bold text-white mb-2">{{ activity.title }}</h1>
          <p class="text-white/90">{{ activity.organization?.name }}</p>
        </div>
      </div>

      <!-- Header avec actions -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-start">
          <div class="flex items-start space-x-4">
            <!-- Logo de l'organisation -->
            <div v-if="activity.organization?.logo_url" class="flex-shrink-0">
              <img :src="activity.organization.logo_url"
                   :alt="activity.organization.name"
                   class="w-16 h-16 rounded-lg object-contain bg-gray-100 dark:bg-gray-700 p-2">
            </div>
            <div>
              <h1 v-if="!activity.banner_url && !activity.cover_image_high_url" class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ activity.title }}
              </h1>
              <div class="mt-1">
                <p class="text-lg text-gray-700 dark:text-gray-300">
                  {{ activity.organization?.name }}
                </p>
                <!-- Pays de l'organisation avec drapeau -->
                <div v-if="activity.organization?.country" class="flex items-center mt-1">
                  <svg class="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span class="text-sm text-gray-600 dark:text-gray-400 mr-2">
                    {{ activity.organization.country.name_fr || 'Pays non spécifié' }}
                  </span>
                  <img
                    v-if="activity.organization.country?.code"
                    :src="`https://flagcdn.com/w20/${activity.organization.country.code.toLowerCase()}.png`"
                    :alt="activity.organization.country.name_fr"
                    class="h-4 w-6 object-cover border border-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {{ activity.event?.title }} - {{ activity.event?.year }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Dropdown de statut -->
            <div class="relative">
              <select v-model="activity.validation_status"
                      @focus="previousStatusValue = activity.validation_status"
                      @change="handleStatusChange"
                      :disabled="isUpdatingStatus"
                      :class="[
                        'appearance-none rounded-full px-4 py-2 text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                        getStatusClass(activity.validation_status)
                      ]">
                <option value="draft">Brouillon</option>
                <option value="submitted">Soumise</option>
                <option value="under_review">En examen</option>
                <option value="approved">Approuvée</option>
                <option value="rejected">Rejetée</option>
              </select>
              <!-- Icône dropdown -->
              <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            <!-- Bouton notification activité reçue -->
            <button @click="sendActivityReceivedNotification"
                    :disabled="isSendingNotification"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              <div v-if="isSendingNotification" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <svg v-else class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              {{ isSendingNotification ? 'Envoi...' : 'Notifier réception' }}
            </button>

            <!-- Indicateur de chargement -->
            <div v-if="isUpdatingStatus" class="flex items-center text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
              <span class="text-sm">Mise à jour...</span>
            </div>
          </div>
        </div>

        <!-- Message d'erreur pour le changement de statut -->
        <div v-if="statusError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ statusError }}
          <button @click="statusError = null" class="ml-2 text-red-900 hover:text-red-700">
            <svg class="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Messages pour la notification -->
        <div v-if="notificationError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ notificationError }}
          <button @click="notificationError = null" class="ml-2 text-red-900 hover:text-red-700">
            <svg class="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div v-if="notificationSuccess" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {{ notificationSuccess }}
          <button @click="notificationSuccess = null" class="ml-2 text-green-900 hover:text-green-700">
            <svg class="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Section Informations importantes mise en valeur -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-200 dark:border-blue-700">
        <h2 class="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100 flex items-center">
          <svg class="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Informations essentielles
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Date et heure - MISE EN ÉVIDENCE -->
          <div class="md:col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-lg p-6 shadow-xl border-2 border-orange-400 dark:border-orange-500">
            <dt class="text-sm font-bold text-white mb-3 flex items-center">
              <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {{ activity.final_start_date ? '📅 DATE ET HEURE CONFIRMÉES' : '📅 DATE ET HEURE PROPOSÉES' }}
            </dt>
            <dd class="text-white">
              <div class="flex items-start space-x-3">
                <div class="flex-1">
                  <div class="text-2xl font-bold mb-2">{{ formatDateWithDay(activity.final_start_date || activity.proposed_start_date) }}</div>
                  <div class="text-lg font-semibold text-orange-100 mb-2">
                    {{ formatTimeRange(activity.final_start_date || activity.proposed_start_date, activity.final_end_date || activity.proposed_end_date) }}
                  </div>
                  <div v-if="activity.event?.timezone" class="text-sm text-orange-100 flex items-center">
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ getTimezoneLabel(activity.event.timezone, 'fr') }}
                  </div>
                </div>
              </div>
            </dd>
          </div>

          <!-- Soumissionnaire -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center justify-between">
              <div class="flex items-center">
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Soumis par
              </div>
              <button
                @click="showChangeSubmitterModal = true"
                class="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 cursor-pointer"
                title="Changer le soumissionnaire"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
            </dt>
            <dd class="space-y-2">
              <div class="flex items-center space-x-2">
                <img v-if="activity.submitted_user?.profile_photo_url"
                     :src="activity.submitted_user.profile_photo_url"
                     :alt="`${activity.submitted_user.first_name} ${activity.submitted_user.last_name}`"
                     class="h-10 w-10 rounded-full object-cover">
                <div v-else class="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {{ activity.submitted_user?.first_name?.[0] }}{{ activity.submitted_user?.last_name?.[0] }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {{ activity.submitted_user?.first_name }} {{ activity.submitted_user?.last_name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ activity.submitted_user?.email }}
                  </p>
                </div>
              </div>
            </dd>
          </div>

          <!-- Type d'activité -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Type d'activité</dt>
            <dd>
              <span class="px-3 py-1.5 text-sm font-medium rounded-full inline-flex items-center"
                    :class="getActivityTypeClass(activity.activity_type)">
                <svg class="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 00-2-2V5z" clip-rule="evenodd"/>
                </svg>
                {{ getActivityTypeLabel(activity.activity_type) }}
              </span>
            </dd>
          </div>

          <!-- Format -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Format</dt>
            <dd>
              <span class="px-3 py-1.5 text-sm font-medium rounded-full inline-flex items-center"
                    :class="getFormatClass(activity.format)">
                <svg class="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd"/>
                </svg>
                {{ getFormatLabel(activity.format) }}
              </span>
            </dd>
          </div>

          <!-- Intervenants -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Intervenants</dt>
            <dd class="flex items-center">
              <svg class="h-5 w-5 mr-1.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ speakers.length }}</span>
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">panéliste{{ speakers.length > 1 ? 's' : '' }}</span>
            </dd>
          </div>

          <!-- Documents -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Documents</dt>
            <dd class="flex items-center">
              <svg class="h-5 w-5 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-2xl font-bold text-green-600 dark:text-green-400">{{ documents.length }}</span>
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">support{{ documents.length > 1 ? 's' : '' }}</span>
            </dd>
          </div>
        </div>
      </div>

      <!-- Détails de l'activité -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Informations principales -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Description détaillée</h2>
            <div class="prose dark:prose-invert max-w-none" v-html="activity.detailed_presentation"></div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Objectifs</h2>
            <div class="prose dark:prose-invert max-w-none" v-html="activity.objectives"></div>
          </div>

          <!-- Intervenants / Panelistes -->
          <div v-if="speakers.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Intervenants / Panélistes ({{ speakers.length }})</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="speaker in speakers" :key="speaker.id"
                   class="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <img v-if="speaker.photo_url"
                     :src="speaker.photo_thumbnail_url || speaker.photo_url"
                     :alt="`${speaker.first_name} ${speaker.last_name}`"
                     class="w-12 h-12 rounded-full object-cover">
                <div v-else class="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span class="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {{ speaker.first_name[0] }}{{ speaker.last_name[0] }}
                  </span>
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ speaker.civility }} {{ speaker.first_name }} {{ speaker.last_name }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-300">{{ speaker.position }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ speaker.organization }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ speaker.email }}</p>
                  <div class="mt-1 flex items-center space-x-2">
                    <span v-if="speaker.has_confirmed_by_email"
                          class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Email confirmé
                    </span>
                    <span v-if="speaker.is_available_for_questions"
                          class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      Disponible pour Q&R
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Autres activités de l'organisation -->
          <div v-if="organizationActivities.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Autres activités soumises par {{ activity.organization?.name }} ({{ organizationActivities.length }})
            </h2>

            <div v-if="isLoadingOrgActivities" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>

            <div v-else class="space-y-4">
              <div v-for="otherActivity in organizationActivities" :key="otherActivity.id"
                   class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                      {{ otherActivity.title }}
                    </h3>
                    <div class="flex flex-wrap gap-2 mb-3">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="{
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': otherActivity.validation_status === 'draft',
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': otherActivity.validation_status === 'submitted',
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': otherActivity.validation_status === 'under_review',
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': otherActivity.validation_status === 'approved',
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': otherActivity.validation_status === 'rejected',
                              'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300': otherActivity.validation_status === 'live',
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': otherActivity.validation_status === 'completed'
                            }">
                        {{ getValidationStatusLabel(otherActivity.validation_status) }}
                      </span>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {{ getActivityTypeLabel(otherActivity.activity_type) }}
                      </span>
                    </div>

                    <!-- Informations du soumissionnaire -->
                    <div class="flex items-center space-x-3 mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <img v-if="otherActivity.submitted_user?.profile_photo_thumbnail_url || otherActivity.submitted_user?.profile_photo_url"
                           :src="otherActivity.submitted_user.profile_photo_thumbnail_url || otherActivity.submitted_user.profile_photo_url"
                           :alt="`${otherActivity.submitted_user.first_name} ${otherActivity.submitted_user.last_name}`"
                           class="h-10 w-10 rounded-full object-cover">
                      <div v-else class="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">
                          Soumis par : {{ otherActivity.submitted_user?.first_name }} {{ otherActivity.submitted_user?.last_name }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ otherActivity.submitted_user?.email }}</p>
                      </div>
                    </div>

                    <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <p>Créée le {{ formatDate(otherActivity.created_at) }}</p>
                      <p v-if="otherActivity.proposed_start_date">
                        Date proposée : {{ formatDate(otherActivity.proposed_start_date) }}
                      </p>
                    </div>
                  </div>

                  <router-link :to="`/admin/activities/${otherActivity.id}`"
                               class="ml-4 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 cursor-pointer">
                    Voir détails
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents supports -->
          <div v-if="documents.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Documents supports ({{ documents.length }})</h2>
            <div class="space-y-2">
              <div v-for="doc in documents" :key="doc.id"
                   class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div class="flex items-center space-x-3">
                  <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ doc.title }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Types: {{ doc.types?.join(', ') || 'Document' }}
                    </p>
                  </div>
                </div>
                <a :href="doc.file_url" target="_blank"
                   class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 cursor-pointer">
                  <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Télécharger
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar avec métadonnées -->
        <div class="space-y-6">
          <!-- Statistiques -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Statistiques d'engagement</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {{ activity.activites_dashboard_view_count || 0 }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Vues dashboard</p>
              </div>
              <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                  {{ activity.send_activites_recu_email_count || 0 }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Emails envoyés</p>
              </div>
              <div class="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {{ registrations.length }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Inscriptions</p>
              </div>
              <div class="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {{ speakers.length }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Intervenants</p>
              </div>
            </div>
            <div v-if="activity.last_viewed_at" class="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              Dernière vue: {{ formatDateTime(activity.last_viewed_at) }}
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Détails complémentaires</h3>
            <dl class="space-y-3">
              <div v-if="activity.youtube_link">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Lien YouTube</dt>
                <dd class="mt-1">
                  <a :href="activity.youtube_link" target="_blank"
                     class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer">
                    Voir sur YouTube
                  </a>
                </dd>
              </div>
              <div v-if="activity.zoom_meeting_id">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Réunion Zoom</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  ID: {{ activity.zoom_meeting_id }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Soumis par</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ activity.submitted_user?.first_name }} {{ activity.submitted_user?.last_name }}
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ activity.submitted_user?.email }}
                  </div>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Soumis le</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ formatDate(activity.created_at) }}
                </dd>
              </div>
            </dl>
          </div>

          <div v-if="activity.main_themes?.length" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Thématiques</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="theme in activity.main_themes" :key="theme"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {{ getThemeLabel(theme) }}
              </span>
            </div>
          </div>

          <div v-if="activity.categories?.length" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Catégories</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="category in activity.categories" :key="category"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                {{ getCategoryLabel(category) }}
              </span>
            </div>
          </div>

          <div v-if="activity.tags?.length" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in activity.tags" :key="tag"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Activité non trouvée</p>
    </div>

    <!-- Modal de validation -->
    <div v-if="showValidationModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <div class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full mx-4 z-10">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Motif du rejet
            </h3>

            <!-- Message d'erreur -->
            <div v-if="validationError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {{ validationError }}
            </div>

            <textarea v-model="validationReason"
                     placeholder="Expliquez brièvement pourquoi cette activité est rejetée..."
                     rows="4"
                     :disabled="isValidating"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
            </textarea>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="confirmValidation"
                    :disabled="isValidating"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700">
              <div v-if="isValidating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ isValidating ? 'En cours...' : 'Confirmer le rejet' }}
            </button>
            <button @click="closeModal"
                    :disabled="isValidating"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation générale pour changement de statut -->
    <div v-if="showStatusConfirmModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeStatusConfirmModal"></div>

        <div class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-md w-full mx-4 z-10">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Confirmer le changement de statut
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-300">
                    {{ getStatusChangeMessage() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="confirmStatusChange"
                    :disabled="isUpdatingStatus"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <div v-if="isUpdatingStatus" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ isUpdatingStatus ? 'En cours...' : 'Confirmer' }}
            </button>
            <button @click="closeStatusConfirmModal"
                    :disabled="isUpdatingStatus"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de changement de soumissionnaire -->
    <ChangeSubmitterModal
      :show="showChangeSubmitterModal"
      :current-submitter="activity?.submitted_user"
      :activity-id="activity?.id"
      @close="showChangeSubmitterModal = false"
      @update="handleSubmitterUpdate"
    />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import { useAuth } from '@/composables/useAuth'
import { useTimezone } from '@/composables/useTimezone'
import { useAdminPanel } from '@/composables/useAdminPanel'
import ChangeSubmitterModal from '@/components/admin/ChangeSubmitterModal.vue'
import ActivityReviewSidebar from '@/components/admin/ActivityReviewSidebar.vue'

const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles, validateActivity } = useAdmin()
const { currentUser } = useAuth()
const { getCityFromTimezone, formatDateTimeWithTimezone, getTimezoneLabel } = useTimezone()
const { enableActivityReviewMode, disableActivityReviewMode, closeReviewSidebar: closeReviewSidebarState, isReviewSidebarOpen } = useAdminPanel()

const isLoading = ref(true)
const activity = ref(null)
const showValidationModal = ref(false)
const validationAction = ref(null)
const validationReason = ref('')
const isValidating = ref(false)
const validationError = ref(null)
const isUpdatingStatus = ref(false)
const statusError = ref(null)
const previousStatusValue = ref(null)
const showStatusConfirmModal = ref(false)
const pendingStatusChange = ref(null)
const isSendingNotification = ref(false)
const notificationError = ref(null)
const notificationSuccess = ref(null)
const speakers = ref([])
const documents = ref([])
const registrations = ref([])
const showChangeSubmitterModal = ref(false)
const activityId = computed(() => route.params.id)
const organizationActivities = ref([])
const isLoadingOrgActivities = ref(false)

const checkAccess = async () => {
  await loadUserRoles()
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

const loadActivity = async () => {
  try {
    // Charger l'activité avec toutes les relations
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        organization:organizations(id, name, logo_url, email, website, organization_type, country:countries(id, name_fr, name_en, code)),
        event:events(id, title, year, banner_high_quality_1_1_url, timezone, city, address, country:countries(name_fr, name_en)),
        submitted_user:users!submitted_by(id, first_name, last_name, email),
        country:countries(id, name_fr, name_en, code)
      `)
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    activity.value = data

    // Charger les intervenants
    await loadSpeakers()

    // Charger les documents
    await loadDocuments()

    // Charger les inscriptions
    await loadRegistrations()

    // Charger les autres activités de l'organisation
    if (data.organization?.id) {
      await loadOrganizationActivities(data.organization.id)
    }

  } catch (error) {
    console.error('Erreur lors du chargement de l\'activité:', error)
  } finally {
    isLoading.value = false
  }
}

const loadSpeakers = async () => {
  if (!activity.value) return

  try {
    const { data, error } = await supabase
      .from('activity_speakers')
      .select('*')
      .eq('activity_id', activity.value.id)
      .order('created_at')

    if (error) throw error
    speakers.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des intervenants:', error)
  }
}

const loadDocuments = async () => {
  if (!activity.value) return

  try {
    const { data, error } = await supabase
      .from('activity_documents')
      .select('*')
      .eq('activity_id', activity.value.id)
      .order('uploaded_at')

    if (error) throw error
    documents.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des documents:', error)
  }
}

const loadRegistrations = async () => {
  if (!activity.value) return

  try {
    const { data, error } = await supabase
      .from('activity_registrations')
      .select(`
        *,
        user:users(id, first_name, last_name, email)
      `)
      .eq('activity_id', activity.value.id)
      .order('registration_date')

    if (error) throw error
    registrations.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des inscriptions:', error)
  }
}

const loadOrganizationActivities = async (organizationId) => {
  if (!organizationId) return

  isLoadingOrgActivities.value = true
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        submitted_user:users!submitted_by(
          id,
          first_name,
          last_name,
          email,
          profile_photo_url,
          profile_photo_thumbnail_url
        )
      `)
      .eq('organization_id', organizationId)
      .neq('id', route.params.id) // Exclure l'activité actuelle
      .order('created_at', { ascending: false })

    if (error) throw error
    organizationActivities.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des autres activités:', error)
    organizationActivities.value = []
  } finally {
    isLoadingOrgActivities.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-orange-100 text-orange-800',
    live: 'bg-purple-100 text-purple-800',
    completed: 'bg-indigo-100 text-indigo-800'
  }
  return classes[status] || classes.draft
}

// Labels pour les statuts de validation
const getValidationStatusLabel = (status) => {
  const labels = {
    draft: 'Brouillon',
    submitted: 'Soumise',
    under_review: 'En examen',
    approved: 'Approuvée',
    rejected: 'Rejetée',
    cancelled: 'Annulée',
    live: 'En ligne',
    completed: 'Complétée'
  }
  return labels[status] || status
}

// Labels pour les types d'activité
const getActivityTypeLabel = (type) => {
  const labels = {
    'side_event': 'Événement parallèle',
    'country_day': 'Journée pays',
    'other': 'Autre'
  }
  return labels[type] || type
}

const getActivityTypeClass = (type) => {
  const classes = {
    'side_event': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'country_day': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
  return classes[type] || classes.other
}

// Labels pour les formats
const getFormatLabel = (format) => {
  const labels = {
    'online': 'En ligne',
    'in_person': 'En présentiel',
    'hybrid': 'Hybride'
  }
  return labels[format] || format
}

const getFormatClass = (format) => {
  const classes = {
    'online': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in_person': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'hybrid': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  }
  return classes[format] || classes.online
}

// Labels pour les thématiques
const getThemeLabel = (theme) => {
  const labels = {
    'mitigation': 'Atténuation',
    'adaptation': 'Adaptation',
    'climate_ambition_ndc': 'Ambition climatique & NDC',
    'loss_and_damage': 'Pertes et préjudices',
    'water_fisheries': 'Eau et pêcheries',
    'renewable_energy_land': 'Énergies renouvelables',
    'health_solidarity': 'Santé et solidarité',
    'industry_transition_and_technology': 'Transition industrielle et technologie',
    'transport_urbanization': 'Transport et urbanisation',
    'climate_justice_indigenous': 'Justice climatique et peuples autochtones',
    'agriculture_food': 'Agriculture et alimentation',
    'sustainable_livestock': 'Élevage durable',
    'gender_youth_and_education': 'Genre, jeunesse et éducation',
    'just_energy_transition': 'Transition énergétique juste',
    'forests_nature_based_solutions': 'Forêts et solutions basées sur la nature',
    'finance': 'Finance',
    'other': 'Autre'
  }
  return labels[theme] || theme
}

// Labels pour les catégories
const getCategoryLabel = (category) => {
  const labels = {
    'capacity_building': 'Renforcement des capacités',
    'results_sharing': 'Partage de résultats',
    'technological_innovation': 'Innovation technologique',
    'field_project': 'Projet de terrain',
    'best_practices': 'Bonnes pratiques',
    'awareness': 'Sensibilisation',
    'concertation': 'Concertation'
  }
  return labels[category] || category
}

const getStatusText = (status) => {
  const texts = {
    draft: 'Brouillon',
    submitted: 'Soumise',
    under_review: 'En examen',
    approved: 'Approuvée',
    rejected: 'Rejetée'
  }
  return texts[status] || texts.draft
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'

  // Utiliser le fuseau horaire de l'événement s'il existe
  const timezone = activity.value?.event?.timezone || 'UTC'

  return formatDateTimeWithTimezone(dateString, timezone, 'fr-FR')
}

// Formater la date avec le jour de la semaine
const formatDateWithDay = (dateString) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: activity.value?.event?.timezone || 'UTC'
  }
  return date.toLocaleDateString('fr-FR', options)
}

// Formater la plage horaire
const formatTimeRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '-'

  const start = new Date(startDate)
  const end = new Date(endDate)
  const timezone = activity.value?.event?.timezone || 'UTC'

  const startTime = start.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone
  })

  const endTime = end.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone
  })

  return `${startTime} - ${endTime}`
}

// Gestion du changement de statut direct
const handleStatusChange = async (event) => {
  const newStatus = event.target.value
  const previousStatus = previousStatusValue.value

  // Ne rien faire si c'est le même statut
  if (newStatus === previousStatus) return

  // Stocker le changement en attente
  pendingStatusChange.value = { newStatus, previousStatus }

  // Restaurer l'ancien statut en attendant la confirmation
  activity.value.validation_status = previousStatus

  // Si c'est un rejet, on ouvre la modale spéciale pour demander la raison
  if (newStatus === 'rejected') {
    validationAction.value = 'reject'
    validationReason.value = ''
    showValidationModal.value = true
    return
  }

  // Pour les autres statuts, ouvrir la modale de confirmation générale
  showStatusConfirmModal.value = true
}

// Mise à jour du statut de l'activité
const updateActivityStatus = async (newStatus, previousStatus, rejectionReason = null) => {
  if (!currentUser.value) return

  isUpdatingStatus.value = true
  statusError.value = null

  try {
    const result = await validateActivity(
      activity.value.id,
      newStatus,
      currentUser.value.id,
      rejectionReason
    )

    if (result.success) {
      // Mettre à jour le statut dans l'interface après succès
      activity.value.validation_status = newStatus
      console.log(`Statut mis à jour vers: ${newStatus}`)
    } else {
      // Restaurer l'ancien statut en cas d'erreur
      activity.value.validation_status = previousStatus
      statusError.value = result.error?.message || 'Erreur lors de la mise à jour du statut'
    }
  } catch (error) {
    // Restaurer l'ancien statut en cas d'erreur
    activity.value.validation_status = previousStatus
    statusError.value = error.message || 'Une erreur inattendue s\'est produite'
    console.error('Erreur lors de la mise à jour du statut:', error)
  } finally {
    isUpdatingStatus.value = false
  }
}

const confirmValidation = async () => {
  if (!currentUser.value) return

  isValidating.value = true
  validationError.value = null

  try {
    // Seulement pour les rejets maintenant (l'approbation se fait directement via le dropdown)
    if (validationAction.value === 'reject') {
      await updateActivityStatus('rejected', previousStatusValue.value, validationReason.value)
      closeModal()
    }
  } catch (error) {
    console.error('Erreur lors de la validation:', error)
    validationError.value = error.message || 'Une erreur inattendue s\'est produite'
  } finally {
    isValidating.value = false
  }
}

const closeModal = () => {
  showValidationModal.value = false
  validationAction.value = null
  validationReason.value = ''
  validationError.value = null
}

// Fonctions pour la modale de confirmation générale
const confirmStatusChange = async () => {
  if (!pendingStatusChange.value) return

  const { newStatus, previousStatus } = pendingStatusChange.value
  await updateActivityStatus(newStatus, previousStatus)
  closeStatusConfirmModal()
}

const closeStatusConfirmModal = () => {
  showStatusConfirmModal.value = false
  pendingStatusChange.value = null
}

const getStatusChangeMessage = () => {
  if (!pendingStatusChange.value) return ''

  const { newStatus, previousStatus } = pendingStatusChange.value
  const statusTexts = {
    draft: 'Brouillon',
    submitted: 'Soumise',
    under_review: 'En examen',
    approved: 'Approuvée',
    rejected: 'Rejetée'
  }

  return `Êtes-vous sûr de vouloir changer le statut de "${statusTexts[previousStatus]}" vers "${statusTexts[newStatus]}" ?`
}

// Fonction pour envoyer la notification d'activité reçue
const sendActivityReceivedNotification = async () => {
  if (!activity.value || !currentUser.value) return

  isSendingNotification.value = true
  notificationError.value = null
  notificationSuccess.value = null

  try {
    // Utiliser le timezone de l'événement s'il existe, sinon celui de l'activité, sinon UTC
    const timezone = activity.value.event?.timezone || activity.value.timezone || 'UTC'
    const cityName = getCityFromTimezone(timezone)

    console.log('Timezone utilisé:', timezone, 'Ville extraite:', cityName) // Debug

    const { data, error } = await supabase.functions.invoke('send-activity-notification', {
      body: {
        activity_id: activity.value.id,
        activity_title: activity.value.title,
        coordinator_email: activity.value.submitted_user?.email,
        coordinator_name: activity.value.submitted_user ? `${activity.value.submitted_user.first_name} ${activity.value.submitted_user.last_name}` : null,
        organization_name: activity.value.organization?.name,
        event_title: activity.value.event?.title,
        event_logo: activity.value.event?.banner_high_quality_1_1_url,
        event_city: cityName, // Envoyer le nom de la ville extrait du timezone
        event_country: activity.value.event?.country?.name_fr,
        proposed_start_date: activity.value.proposed_start_date,
        proposed_end_date: activity.value.proposed_end_date,
        timezone: timezone
      }
    })

    if (error) {
      throw error
    }

    notificationSuccess.value = 'Notification envoyée avec succès au coordinateur'

    // Incrémenter le compteur localement pour un feedback immédiat
    if (activity.value) {
      activity.value.send_activites_recu_email_count = (activity.value.send_activites_recu_email_count || 0) + 1
    }
    console.log('Notification sent successfully:', data)

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error)
    notificationError.value = error.message || 'Erreur lors de l\'envoi de la notification'
  } finally {
    isSendingNotification.value = false
  }
}

// Fonction pour gérer la mise à jour du soumissionnaire
const handleSubmitterUpdate = async (newSubmitter) => {
  if (!activity.value) return

  // Mettre à jour l'objet activity avec le nouveau soumissionnaire
  activity.value.submitted_user = {
    id: newSubmitter.id,
    first_name: newSubmitter.first_name,
    last_name: newSubmitter.last_name,
    email: newSubmitter.email,
    profile_photo_url: newSubmitter.profile_photo_url
  }

  console.log('Soumissionnaire mis à jour avec succès')
}

// Fonctions pour gérer la sidebar de révision
const closeReviewSidebar = () => {
  closeReviewSidebarState()
}

const handleActivitySelect = (selectedActivityId) => {
  // Navigation gérée par le composant sidebar
  // Le router change automatiquement l'activité
}

// Watcher pour recharger l'activité quand l'ID change
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadActivity()

    // Recharger les autres activités de l'organisation
    if (activity.value?.organization?.id) {
      await loadOrganizationActivities(activity.value.organization.id)
    }

    enableActivityReviewMode(newId)
  }
})

onMounted(async () => {
  try {
    await checkAccess()
    await loadActivity()

    // Activer le mode révision d'activités et rétracter le panel admin
    enableActivityReviewMode(route.params.id)
  } catch (error) {
    if (error.message === 'Accès non autorisé') {
      throw error
    }
    console.error('Erreur lors de l\'initialisation:', error)
  }
})

// Désactiver le mode révision quand on quitte la page
onBeforeUnmount(() => {
  disableActivityReviewMode()
})
</script>
