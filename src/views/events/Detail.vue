<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
    <!-- Skeleton loader -->
    <div v-if="isLoading">
      <!-- Hero Skeleton -->
      <div class="relative w-full">
        <div class="relative w-full" style="aspect-ratio: 32/9">
          <div class="relative w-full h-full" style="min-height: 250px; max-height: 70vh;">
            <div class="absolute inset-0 w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
          </div>
        </div>

        <!-- Contenu Hero Skeleton -->
        <div class="absolute inset-x-0 bottom-0 flex flex-col justify-end">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <!-- Badges skeleton -->
            <div class="flex flex-wrap gap-3 mb-6">
              <div class="w-24 h-8 bg-white/20 rounded-full animate-pulse"></div>
              <div class="w-20 h-8 bg-white/20 rounded-full animate-pulse"></div>
              <div class="w-16 h-8 bg-white/20 rounded-full animate-pulse"></div>
            </div>

            <!-- Titre skeleton -->
            <div class="space-y-3 mb-4">
              <div class="w-3/4 h-12 md:h-16 bg-white/20 rounded-lg animate-pulse"></div>
              <div class="w-1/2 h-12 md:h-16 bg-white/20 rounded-lg animate-pulse"></div>
            </div>

            <!-- Infos skeleton -->
            <div class="flex flex-wrap gap-6">
              <div class="w-32 h-6 bg-white/20 rounded animate-pulse"></div>
              <div class="w-28 h-6 bg-white/20 rounded animate-pulse"></div>
              <div class="w-24 h-6 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions skeleton -->
      <div class="relative -mt-8 mb-8">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div class="w-full sm:w-48 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div class="w-full sm:w-48 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div class="w-full sm:w-auto sm:ml-auto h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu principal skeleton -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Description skeleton -->
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div class="w-32 h-7 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
              <div class="space-y-4">
                <div class="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div class="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div class="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div class="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div class="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <!-- Sidebar skeleton -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Logo skeleton -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div class="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            <!-- Stats skeleton -->
            <div class="bg-gray-200 dark:bg-gray-700 rounded-2xl p-6 animate-pulse">
              <div class="w-24 h-5 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <div class="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div class="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div class="flex justify-between items-center">
                  <div class="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div class="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div class="flex justify-between items-center">
                  <div class="w-18 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div class="w-14 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section activités skeleton -->
      <div class="mt-16 py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <div class="w-64 h-10 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-4 animate-pulse"></div>
            <div class="w-96 h-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="i in 6" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <div class="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div class="p-6">
                <div class="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
                <div class="space-y-2">
                  <div class="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div class="w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div class="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded mt-4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu réel -->
    <div v-else>
    <!-- Hero Section avec ratio préservé 32:9 -->
    <div class="relative w-full ">
      <!-- Container avec aspect ratio 32:9 pour préserver l'image complète -->
      <div class="relative w-full" style="aspect-ratio: 32/9">
        <!-- Container responsive avec hauteur min/max -->
        <div class="relative w-full h-full" style="min-height: 250px; max-height: 70vh;">
          <!-- Image de fond sans découpage -->
          <img
            :src="getBannerUrl()"
            :alt="event.title"
            class="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          >
          <!-- Overlay léger pour améliorer la lisibilité du texte -->
        </div>
      </div>

      <!-- Contenu Hero positionné en superposition -->
      <div class="absolute inset-x-0 bottom-0 flex flex-col justify-end">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <!-- Badges flottants -->
          <div class="flex flex-wrap gap-3 mb-6">
            <span class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up">
              <span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              {{ t(`event.status.${event.event_status || event.status}`) }}
            </span>

            <span v-if="event.submission_status" class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up animation-delay-100">
              {{ t(`event.submissionStatus.${event.submission_status}`) }}
            </span>

            <span v-if="event.year" class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up animation-delay-200">
              {{ event.year }}
            </span>

            <span v-if="event.acronym" class="backdrop-blur-md bg-orange-500/80 border border-orange-400/50 text-white px-4 py-2 rounded-full text-sm font-bold animate-fade-in-up animation-delay-300">
              {{ event.acronym }}
            </span>
          </div>

          <!-- Titre avec animation -->
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-fade-in-up animation-delay-400 [text-shadow:_0_4px_8px_rgb(0_0_0_/_40%),_0_2px_4px_rgb(0_0_0_/_30%)]">
            {{ event.title }}
          </h1>

          <!-- Informations rapides -->
          <div class="flex flex-wrap items-center gap-6 text-white/90 animate-fade-in-up animation-delay-500 [text-shadow:_0_2px_4px_rgb(0_0_0_/_30%)]">
            <div v-if="event.city" class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ event.city }}<span v-if="country">, {{ country.name_fr }}</span></span>
            </div>

            <div v-if="getEventDate()" class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatShortDate(getEventDate()) }}</span>
            </div>

            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>{{ t(`event.participationModes.${event.participation_mode || event.format}`) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions flottantes -->
    <div class="relative -mt-8 mb-8">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-lg border border-gray-100 dark:border-gray-700">
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              @click="goToActivities"
              class="group relative w-full sm:w-auto px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <span class="relative z-10 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-sm sm:text-base">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {{ t('event.viewProgramming') }}
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              v-if="canSubmitActivity"
              @click="goToSubmission"
              class="group relative w-full sm:w-auto px-4 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-500 hover:shadow-lg hover:scale-105"
            >
              <span class="relative z-10 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-sm sm:text-base">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ t('event.submitActivity') }}
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-600 dark:to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <!-- Deadline countdown si applicable -->
            <div v-if="event.submission_deadline && remainingDays > 0" class="w-full sm:w-auto sm:ml-auto flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <svg class="w-5 h-5 flex-shrink-0 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-center sm:text-left">
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{{ t('event.submissionDeadline') }}</p>
                <p class="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400">{{ remainingDays }} {{ t('event.daysRemaining') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Description et détails -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Description -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div class="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              {{ t('event.description') }}
            </h2>
            <div
              v-html="event.description"
              class="prose prose-lg prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>

        <!-- Sidebar avec informations complémentaires -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Logo de l'événement -->
          <div v-if="event.logo_url" class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center">
            <img
              :src="event.logo_url"
              :alt="`${event.title} logo`"
              class="max-h-32 w-auto"
            >
          </div>

          <!-- Statistiques -->
          <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 class="font-semibold mb-4 text-white/90">{{ t('event.quickStats') }}</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-white/80">{{ t('event.participationMode') }}</span>
                <span class="font-bold">{{ t(`event.participationModes.${event.participation_mode || event.format}`) }}</span>
              </div>
              <div v-if="activities.length > 0" class="flex justify-between items-center">
                <span class="text-white/80">{{ t('event.totalActivities') }}</span>
                <span class="font-bold">{{ activities.length }}+</span>
              </div>
              <div v-if="event.submission_status" class="flex justify-between items-center">
                <span class="text-white/80">{{ t('event.submissions') }}</span>
                <span class="font-bold">{{ t(`event.submissionStatus.${event.submission_status}`) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Activités -->
    <div v-if="isLoadingActivities || activities.length > 0" class="mt-16 py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('event.upcomingProgramming') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {{ t('event.programmingDescription') }}
          </p>
        </div>

        <!-- Skeleton pour les activités -->
        <div v-if="isLoadingActivities" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 6" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div class="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div class="p-6">
              <div class="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
              <div class="space-y-2">
                <div class="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div class="w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div class="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded mt-4 animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Contenu réel des activités -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="activity in activities.slice(0, 6)"
            :key="activity.id"
            @click="goToActivityDetail(activity.id)"
            class="group cursor-pointer"
          >
            <div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <!-- Image ou gradient -->
              <div class="h-48 relative overflow-hidden">
                <div v-if="activity.banner" class="absolute inset-0">
                  <img
                    :src="activity.banner"
                    :alt="activity.title"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  >
                </div>
                <div v-else class="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"></div>

                <!-- Overlay avec format -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div class="absolute bottom-4 left-4">
                  <span class="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-medium border border-white/30">
                    {{ t(`event.formats.${activity.format}`) }}
                  </span>
                </div>
              </div>

              <!-- Contenu -->
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {{ activity.title }}
                </h3>

                <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatShortDate(activity.proposed_start_date) }}
                  </div>

                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatTime(activity.proposed_start_date) }}
                  </div>

                  <div v-if="activity.location" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ activity.location }}
                  </div>
                </div>

                <!-- Flèche d'action -->
                <div class="mt-4 flex items-center text-orange-600 dark:text-orange-400 font-medium group-hover:gap-3 transition-all">
                  <span>{{ t('common.learnMore') }}</span>
                  <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bouton voir toutes les activités -->
        <div v-if="!isLoadingActivities" class="text-center mt-12">
          <button
            @click="goToActivities"
            class="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700"
          >
            {{ t('event.viewAllProgramming') }}
            <svg class="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        <!-- Skeleton pour le bouton -->
        <div v-else class="text-center mt-12">
          <div class="w-48 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const supabase = useSupabase()

// État
const isLoading = ref(true)
const isLoadingActivities = ref(true)
const event = ref({
  id: '',
  year: new Date().getFullYear(),
  title: '',
  description: '',
  banner: '',
  status: 'upcoming',
  start_date: '',
  end_date: '',
  location: '',
  format: 'hybrid',
  event_status: 'upcoming',
  submission_status: 'open',
  submission_deadline: '',
  banner_high_quality_32_9_url: '',
  banner_high_quality_16_9_url: '',
  banner_high_quality_1_1_url: '',
  banner_low_quality_32_9_url: '',
  banner_low_quality_16_9_url: '',
  banner_low_quality_1_1_url: '',
  participation_mode: 'hybrid',
  online_start_datetime: '',
  online_end_datetime: '',
  in_person_start_date: '',
  in_person_end_date: '',
  country_id: '',
  city: '',
  address: '',
  logo_url: '',
  acronym: '',
  created_by: '',
  created_at: '',
  updated_at: ''
})

const activities = ref([])
const country = ref(null)

// Computed
const canSubmitActivity = computed(() => {
  if (event.value.submission_status === 'closed') return false
  if (!event.value.submission_deadline) return false
  return new Date(event.value.submission_deadline) > new Date()
})

const remainingDays = computed(() => {
  if (!event.value.submission_deadline) return 0
  const deadline = new Date(event.value.submission_deadline)
  const today = new Date()
  const diffTime = deadline - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
})

// Méthodes
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(t('common.locale'), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatShortDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(t('common.locale'), {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString(t('common.locale'), {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEventDate = () => {
  return event.value.online_start_datetime ||
         event.value.in_person_start_date ||
         event.value.start_date ||
         null
}

const goToActivities = () => {
  router.push(`/programmations/${event.value.year}/${event.value.id}`)
}

const goToSubmission = () => {
  router.push({ name: 'create-activity', params: { eventId: event.value.id } })
}

const goToActivityDetail = (activityId) => {
  router.push(`/activities/${activityId}`)
}

const getBannerUrl = () => {
  return event.value.banner_high_quality_32_9_url ||
         event.value.banner ||
         '/images/example/event_banniere_par_defaut_32_9_v3.jpg'
}

const loadEvent = async () => {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from('events')
      .select('*, countries(id, name_fr, name_en)')
      .eq('id', route.params.id)
      .single()

    if (error) throw error

    if (data.countries) {
      country.value = data.countries
      delete data.countries
    }

    event.value = {
      ...event.value,
      ...data,
      status: data.event_status || data.status || 'upcoming',
      format: data.participation_mode || data.format || 'hybrid'
    }
  } catch (error) {
    console.error('Error loading event:', error)
  } finally {
    isLoading.value = false
  }
}

const loadActivities = async () => {
  try {
    isLoadingActivities.value = true
    const { data, error } = await supabase
      .from('activities')
      .select('*, organizations(id, name, logo_url)')
      .eq('event_id', route.params.id)
      .eq('validation_status', 'approved')
      .order('proposed_start_date', { ascending: true })
      .limit(6)

    if (error) throw error

    activities.value = (data || []).map(activity => ({
      ...activity,
      format: activity.format || 'hybrid'
    }))
  } catch (error) {
    console.error('Error loading activities:', error)
  } finally {
    isLoadingActivities.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadEvent()
  loadActivities()
})
</script>

<style scoped>
@keyframes subtle-zoom {
  0%, 100% { transform: scale(1.05); }
  50% { transform: scale(1.08); }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-subtle-zoom {
  animation: subtle-zoom 20s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animation-delay-100 {
  animation-delay: 100ms;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

.animation-delay-500 {
  animation-delay: 500ms;
}

/* Classe prose personnalisée */
.prose h1, .prose h2, .prose h3 {
  font-weight: 700;
  color: #111827;
}

.dark .prose h1, .dark .prose h2, .dark .prose h3 {
  color: white;
}

.prose p {
  color: #374151;
  line-height: 1.75;
}

.dark .prose p {
  color: #d1d5db;
}

.prose ul, .prose ol {
  color: #374151;
}

.dark .prose ul, .dark .prose ol {
  color: #d1d5db;
}

.prose a {
  color: #f97316;
  transition: color 0.2s;
}

.prose a:hover {
  color: #ea580c;
}

.dark .prose a {
  color: #fb923c;
}

.dark .prose a:hover {
  color: #fdba74;
}

.prose strong {
  font-weight: 600;
  color: #111827;
}

.dark .prose strong {
  color: white;
}
</style>
