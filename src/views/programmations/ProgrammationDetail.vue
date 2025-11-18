<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header avec image de bannière - hauteur optimisée -->
    <div :class="[
      'relative overflow-hidden',
      isCopEvent ? 'min-h-[400px] md:h-80 lg:h-96' : 'h-64 md:h-80 lg:h-96'
    ]">
      <img
        src="/images/example/event_banniere_par_defaut_32_9_v3.jpg"
        :alt="event ? `${t('programmations.title')} - ${event.title} ${event.year}` : t('programmations.title')"
        class="absolute inset-0 w-full h-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      <!-- Contenu du header -->
      <div class="absolute bottom-0 left-0 right-0 p-4 pb-6 md:p-12">
        <div class="max-w-7xl mx-auto">
          <h1 v-if="event" class="text-xl sm:text-2xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
            {{ displayTitle }}
          </h1>
          <div v-if="event" class="flex flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
            <span v-if="event.year && !isCopEvent" class="bg-white/90 px-4 py-2 rounded-lg text-sm font-bold text-gray-900">
              {{ event.year }}
            </span>
            <span v-if="event.acronym" class="bg-orange-500/90 px-4 py-2 rounded-lg text-sm font-bold text-white">
              {{ event.acronym }}
            </span>
            <span :class="getStatusClass(event)" class="px-4 py-2 rounded-lg text-sm font-medium">
              {{ t(`events.status.${event.event_status || 'upcoming'}`) }}
            </span>
          </div>

          <!-- Statistiques avec design Glass -->
          <div v-if="event && activities.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <!-- Activités approuvées -->
            <div class="glass-card-mobile group">
              <div class="flex items-center gap-2 md:gap-3">
                <div class="p-1.5 md:p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                  <svg class="w-5 h-5 md:w-6 md:h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p class="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">+{{ approvedActivitiesCount }}</p>
                  <p class="text-[10px] md:text-xs font-medium text-white/90 leading-tight">{{ t('programmations.approvedActivitiesCount') }}</p>
                </div>
              </div>
            </div>

            <!-- Organisations -->
            <div class="glass-card-mobile group">
              <div class="flex items-center gap-2 md:gap-3">
                <div class="p-1.5 md:p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                  <svg class="w-5 h-5 md:w-6 md:h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p class="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">+{{ organizationsCount }}</p>
                  <p class="text-[10px] md:text-xs font-medium text-white/90 leading-tight">{{ t('programmations.organizationsCount') }}</p>
                </div>
              </div>
            </div>

            <!-- Pays -->
            <div class="glass-card-mobile group">
              <div class="flex items-center gap-2 md:gap-3">
                <div class="p-1.5 md:p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                  <svg class="w-5 h-5 md:w-6 md:h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">+{{ countriesCount }}</p>
                  <p class="text-[10px] md:text-xs font-medium text-white/90 leading-tight">{{ t('programmations.countriesCount') }}</p>
                </div>
              </div>
            </div>

            <!-- Dernière mise à jour -->
            <div v-if="lastUpdateDate" class="glass-card-mobile group">
              <div class="flex items-center gap-2 md:gap-3">
                <div class="p-1.5 md:p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                  <svg class="w-5 h-5 md:w-6 md:h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs md:text-sm font-bold text-white drop-shadow-lg truncate">{{ lastUpdateDate }}</p>
                  <p class="text-[10px] md:text-xs font-medium text-white/90 leading-tight">{{ t('programmations.lastUpdate') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link
                to="/programmations"
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
              >
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                {{ t('programmations.title') }}
              </router-link>
            </li>
            <li v-if="event">
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                  {{ event.title }}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Messages d'alerte/incidents -->
    <div v-if="!isLoading && event && incidentMessages.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <AlertBanner
        v-for="message in incidentMessages"
        :key="message.id"
        :message="locale === 'fr' ? message.message_fr : message.message_en"
        :severity="message.severity"
      />
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <!-- Contenu principal -->
    <div v-else-if="event">
      <!-- Sélecteur de vue et fuseau horaire -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <!-- Indicateur du fuseau horaire -->
          <div v-if="event?.timezone" class="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
              {{ t('programmations.timezoneInfo') }}: {{ timezoneWithGMT }}
            </span>
          </div>

          <!-- Boutons de vue -->
          <div class="flex gap-2">
            <!-- Bouton de recherche -->
            <button
              @click="isSearchModalOpen = true"
              class="px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="hidden sm:inline">{{ t('common.search') }}</span>
            </button>

            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span class="hidden sm:inline">{{ t('programmations.viewGrid') }}</span>
            </button>

            <!-- Bouton Liste - masqué sur mobile -->
            <button
              @click="viewMode = 'list'"
              :class="[
                'hidden md:flex px-4 py-2 rounded-lg font-medium transition-all items-center gap-2 cursor-pointer',
                viewMode === 'list'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span class="hidden sm:inline">{{ t('programmations.viewList') }}</span>
            </button>

            <button
              @click="viewMode = 'calendar'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer',
                viewMode === 'calendar'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="hidden sm:inline">{{ t('programmations.viewCalendar') }}</span>
            </button>

            <!-- Bouton Export PDF avec paramètres - visible uniquement pour les admins -->
            <div v-if="authStore.isAdmin" class="relative">
              <!-- Bouton principal Export PDF -->
              <div class="flex gap-1">
                <button
                  @click="exportDayProgramToPdf(event, activities, selectedDate, locale, t, pdfScale)"
                  class="px-4 py-2 rounded-l-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-all flex items-center gap-2 cursor-pointer"
                  title="Télécharger le programme du jour en PDF (format 16:9)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="hidden sm:inline">{{ t('programmations.exportDayProgramPdf') }}</span>
                </button>

                <!-- Bouton paramètres -->
                <button
                  @click="showPdfSettings = !showPdfSettings"
                  class="px-2 py-2 rounded-r-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-all cursor-pointer border-l border-green-500"
                  title="Paramètres d'export PDF"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              <!-- Menu des paramètres PDF -->
              <div
                v-if="showPdfSettings"
                class="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50"
              >
                <div class="space-y-4">
                  <!-- Titre -->
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ locale === 'fr' ? 'Paramètres d\'export PDF' : 'PDF Export Settings' }}
                    </h3>
                    <button
                      @click="showPdfSettings = false"
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <!-- Slider d'échelle -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ locale === 'fr' ? 'Échelle du contenu' : 'Content Scale' }}
                      </label>
                      <span class="text-sm font-semibold text-green-600 dark:text-green-400">
                        {{ Math.round(pdfScale * 100) }}%
                      </span>
                    </div>

                    <input
                      type="range"
                      v-model.number="pdfScale"
                      min="0.6"
                      max="1.4"
                      step="0.05"
                      class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />

                    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>60%</span>
                      <span>100%</span>
                      <span>140%</span>
                    </div>

                    <!-- Description -->
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {{ locale === 'fr'
                        ? 'Réduisez l\'échelle si le contenu déborde de la page'
                        : 'Reduce scale if content overflows the page' }}
                    </p>
                  </div>

                  <!-- Bouton Reset -->
                  <button
                    @click="pdfScale = 1.0"
                    class="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    {{ locale === 'fr' ? 'Réinitialiser (100%)' : 'Reset (100%)' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading activités -->
      <div v-if="isLoadingActivities" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="activities.length === 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ t('programmations.noActivities') }}
        </h3>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          {{ t('programmations.noActivitiesDescription') }}
        </p>
      </div>

      <!-- Vue Grille (largeur limitée) -->
      <div v-else-if="viewMode === 'grid'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <!-- Boucle sur les jours -->
        <div
          v-for="dayGroup in activitiesByDay"
          :key="dayGroup.dateKey"
          :data-date="dayGroup.dateKey"
          class="scroll-mt-24 day-section"
        >
          <!-- En-tête du jour -->
          <div class="mb-6 pb-4 border-b-2 border-orange-500">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <svg class="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ formatDayHeader(dayGroup.date) }}
              <span v-if="isToday(dayGroup.date)" class="ml-2 px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full">
                {{ t('programmations.today') }}
              </span>
            </h2>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ t('programmations.activitiesCount', { count: dayGroup.items.length }) }}
            </p>
          </div>

          <!-- Grille des activités du jour -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="item in dayGroup.items"
              :key="item.id"
              @click="item.isSpecialDay ? (item.internalLink ? router.push(item.internalLink) : window.open(item.externalLink, '_blank')) : goToActivityDetail(item.id)"
              class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
          <!-- Image de couverture -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="item.cover_image_low_url || '/images/example/event_banniere_par_defaut_16_9_reduit.jpg'"
              :alt="`${item.title} - ${t('activity.details')}`"
              class="w-full h-full object-cover"
            >
            <!-- Badges -->
            <div class="absolute top-4 right-4 flex flex-col gap-2 items-end">
              <!-- Badge activité terminée -->
              <span v-if="!item.isSpecialDay && isActivityFinished(item.final_end_date)" class="px-3 py-1 bg-gray-600/90 rounded-full text-xs font-medium text-white shadow-md">
                {{ t('programmations.finished') }}
              </span>
              <!-- Badge de type ou journée spéciale -->
              <span v-if="item.isSpecialDay" class="px-3 py-1 bg-orange-500/90 rounded-full text-xs font-medium text-white shadow-md">
                {{ t('programmations.specialDay') }}
              </span>
              <span v-else class="px-3 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-md">
                {{ t(`activity.submit.formats.${item.format || 'presentation'}`) }}
              </span>
            </div>
          </div>

          <!-- Contenu -->
          <div class="p-6">
            <!-- Informations de l'organisation (uniquement pour les activités) -->
            <div v-if="!item.isSpecialDay && item.organization" class="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <!-- Institution publique nationale : logo + drapeau entre parenthèses -->
              <template v-if="isPublicNationalInstitution(item.organization) && item.organization.country?.code">
                <div class="flex items-center gap-2">
                  <!-- Logo de l'organisation -->
                  <img
                    v-if="item.organization.logo_url"
                    :src="item.organization.logo_url"
                    :alt="`${t('common.logo')} ${item.organization.name}`"
                    class="w-10 h-10 rounded-lg object-contain bg-white shadow-sm"
                  >
                  <div v-else class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm">
                    <span class="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {{ item.organization.name?.[0]?.toUpperCase() || 'O' }}
                    </span>
                  </div>
                  <!-- Drapeau du pays entre parenthèses -->
                  <div class="flex items-center gap-1">
                    <span class="text-gray-400 text-sm">(</span>
                    <div class="w-6 h-6 rounded bg-white dark:bg-gray-700 flex items-center justify-center p-0.5">
                      <img
                        :src="`https://flagcdn.com/w80/${item.organization.country.code.toLowerCase()}.png`"
                        :alt="`${t('common.flag')} ${t('common.locale') === 'fr' ? item.organization.country.name_fr : item.organization.country.name_en}`"
                        class="w-full h-full object-contain rounded"
                        loading="lazy">
                    </div>
                    <span class="text-gray-400 text-sm">)</span>
                  </div>
                </div>
              </template>
              <!-- Autres types d'organisation : logo uniquement -->
              <template v-else>
                <img
                  v-if="item.organization.logo_url"
                  :src="item.organization.logo_url"
                  :alt="`${t('common.logo')} ${item.organization.name}`"
                  class="w-10 h-10 rounded-lg object-contain bg-white shadow-sm"
                >
                <div v-else class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm">
                  <span class="text-sm font-bold text-gray-600 dark:text-gray-300">
                    {{ item.organization.name?.[0]?.toUpperCase() || 'O' }}
                  </span>
                </div>
              </template>

              <!-- Nom de l'organisation -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {{ item.organization.name }}
                </p>
              </div>
            </div>

            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
              {{ item.title }}
            </h3>

            <p v-if="item.description" class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
              {{ stripHtml(item.description) }}
            </p>

            <!-- Détails -->
            <div class="space-y-2">
              <div v-if="item.final_start_date" class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(item.final_start_date) }}
              </div>

              <!-- Horaire dans le fuseau horaire de l'événement -->
              <div v-if="item.final_start_date && event?.timezone" class="flex items-start text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex-1">
                  <div class="font-medium text-gray-700 dark:text-gray-300">
                    {{ formatDateWithTimezone(item.final_start_date, event.timezone).eventTime }} - {{ formatDateWithTimezone(item.final_end_date, event.timezone).eventTime }}
                  </div>
                  <!-- Heure locale de l'utilisateur (si différente) -->
                  <div v-if="formatDateWithTimezone(item.final_start_date, event.timezone).showUserTime" class="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
                    {{ formatDateWithTimezone(item.final_start_date, event.timezone).userTime }} - {{ formatDateWithTimezone(item.final_end_date, event.timezone).userTime }} ({{ t('programmations.yourLocalTime') }})
                  </div>
                </div>
              </div>

              <div v-if="item.room" class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {{ item.room }}
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Liste (largeur limitée) -->
      <div v-else-if="viewMode === 'list'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div
          v-for="item in displayItems"
          :key="item.id"
          @click="item.isSpecialDay ? (item.internalLink ? router.push(item.internalLink) : window.open(item.externalLink, '_blank')) : goToActivityDetail(item.id)"
          class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          <div class="flex gap-6">
            <!-- Image de couverture -->
            <div class="flex-shrink-0 w-64 h-48 overflow-hidden relative">
              <img
                :src="item.cover_image_low_url || '/images/example/event_banniere_par_defaut_16_9_reduit.jpg'"
                :alt="`${item.title} - ${t('activity.details')}`"
                class="w-full h-full object-cover"
              >
              <!-- Badges -->
              <div class="absolute top-2 right-2 flex flex-col gap-2 items-end">
                <!-- Badge activité terminée -->
                <span v-if="!item.isSpecialDay && isActivityFinished(item.final_end_date)" class="px-3 py-1 bg-gray-600/90 rounded-full text-xs font-medium text-white shadow-md">
                  {{ t('programmations.finished') }}
                </span>
                <!-- Badge journée spéciale -->
                <span v-if="item.isSpecialDay" class="px-3 py-1 bg-orange-500/90 rounded-full text-xs font-medium text-white shadow-md">
                  {{ t('programmations.specialDay') }}
                </span>
              </div>
            </div>

            <!-- Contenu -->
            <div class="flex-1 p-6 flex justify-between items-start">
              <div class="flex-1">
                <!-- Informations de l'organisation (uniquement pour les activités) -->
                <div v-if="!item.isSpecialDay && item.organization" class="flex items-center gap-3 mb-3">
                  <!-- Institution publique nationale : logo + drapeau entre parenthèses -->
                  <template v-if="isPublicNationalInstitution(item.organization) && item.organization.country?.code">
                    <div class="flex items-center gap-1.5">
                      <!-- Logo de l'organisation -->
                      <img
                        v-if="item.organization.logo_url"
                        :src="item.organization.logo_url"
                        :alt="`${t('common.logo')} ${item.organization.name}`"
                        class="w-8 h-8 rounded object-contain bg-white shadow-sm"
                      >
                      <div v-else class="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm">
                        <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          {{ item.organization.name?.[0]?.toUpperCase() || 'O' }}
                        </span>
                      </div>
                      <!-- Drapeau du pays entre parenthèses -->
                      <div class="flex items-center gap-0.5">
                        <span class="text-gray-400 text-xs">(</span>
                        <div class="w-5 h-5 rounded bg-white dark:bg-gray-700 flex items-center justify-center p-0.5">
                          <img
                            :src="`https://flagcdn.com/w80/${item.organization.country.code.toLowerCase()}.png`"
                            :alt="`${t('common.flag')} ${t('common.locale') === 'fr' ? item.organization.country.name_fr : item.organization.country.name_en}`"
                            class="w-full h-full object-contain rounded"
                            loading="lazy">
                        </div>
                        <span class="text-gray-400 text-xs">)</span>
                      </div>
                    </div>
                  </template>
                  <!-- Autres types d'organisation : logo uniquement -->
                  <template v-else>
                    <img
                      v-if="item.organization.logo_url"
                      :src="item.organization.logo_url"
                      :alt="`${t('common.logo')} ${item.organization.name}`"
                      class="w-8 h-8 rounded object-contain bg-white shadow-sm"
                    >
                    <div v-else class="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm">
                      <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {{ item.organization.name?.[0]?.toUpperCase() || 'O' }}
                      </span>
                    </div>
                  </template>

                  <!-- Nom de l'organisation -->
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ item.organization.name }}
                  </p>
                </div>

                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ item.title }}
                  </h3>
                  <span v-if="!item.isSpecialDay" class="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 rounded-full text-xs font-medium">
                    {{ t(`activity.submit.formats.${item.format || 'presentation'}`) }}
                  </span>
                </div>

                <p v-if="item.description" class="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {{ stripHtml(item.description) }}
                </p>

                <div class="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div v-if="item.final_start_date" class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(item.final_start_date) }}
                  </div>

                  <!-- Horaire dans le fuseau horaire de l'événement -->
                  <div v-if="item.final_start_date && event?.timezone" class="flex items-start">
                    <svg class="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="flex-1">
                      <div class="font-medium text-gray-700 dark:text-gray-300">
                        {{ formatDateWithTimezone(item.final_start_date, event.timezone).eventTime }} - {{ formatDateWithTimezone(item.final_end_date, event.timezone).eventTime }}
                      </div>
                      <!-- Heure locale de l'utilisateur (si différente) -->
                      <div v-if="formatDateWithTimezone(item.final_start_date, event.timezone).showUserTime" class="text-xs text-blue-600 dark:text-blue-400 mt-0.5 italic">
                        {{ formatDateWithTimezone(item.final_start_date, event.timezone).userTime }} - {{ formatDateWithTimezone(item.final_end_date, event.timezone).userTime }} ({{ t('programmations.yourLocalTime') }})
                      </div>
                    </div>
                  </div>

                  <div v-if="item.room" class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {{ item.room }}
                  </div>

                  <div v-if="!item.isSpecialDay && item.max_participants" class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {{ item.max_participants }} {{ t('activity.participants') }}
                  </div>
                </div>
              </div>

              <div class="ml-4 flex-shrink-0">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Calendrier avec Vue-Cal (pleine largeur) :selected-date="selectedDate"-->
      <div v-else-if="viewMode === 'calendar'" class="w-full">
        <!-- Sélecteur de semaine -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <!-- Boutons de navigation par semaine -->
          <div class="flex justify-center gap-3">
            <button
              @click="goToWeek(1)"
              :class="[
                'px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-2',
                currentWeek === 1
                  ? 'bg-orange-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-102'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ t('programmations.week1') }}
            </button>

            <button
              @click="goToWeek(2)"
              :class="[
                'px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-2',
                currentWeek === 2
                  ? 'bg-orange-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-102'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ t('programmations.week2') }}
            </button>
          </div>
        </div>

        <!-- Wrapper avec scroll horizontal pour mobile -->
        <div class="bg-white mb-10 dark:bg-gray-800 shadow-lg overflow-x-auto w-full calendar-scroll-wrapper">
        <vue-cal

          :events="calendarEvents"
          :special-hours="specialHours"
          hide-view-selector
          hide-title-bar
          :time-from="8 * 60"
          :time-to="18 * 60"
          :disable-views="['years', 'year', 'month', 'day']"
          :selected-date="selectedDate"
          :editable-events="{
            title: false,
            drag: false,
            resize: false,
            delete: false,
            create: false
          }"
          :snap-to-time="15"
          :time-cell-height="120"
          :locale="currentLocale"
          :hide-weekends="false"
          class="vuecal--orange-theme calendar-mobile-optimized"
          @event-click="onEventClick"
        >
          <!-- Template personnalisé pour les événements -->
          <template #event="{ event }">
            <!-- Journées spéciales -->
            <div v-if="event.isSpecialDay" class="special-day-wrapper h-full cursor-pointer" :data-special-type="event.specialDayType">
              <div class="special-day-fixed-content">
                <p class="font-bold text-base mb-2 leading-tight">{{ event.title }}</p>
                <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md text-xs font-medium backdrop-blur-sm">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {{ t('programmations.viewProgram') }}
                </div>
              </div>
            </div>

            <!-- Activités régulières -->
            <div v-else class="px-2 h-full overflow-hidden cursor-pointer">
              <!-- Institution publique nationale : logo + drapeau entre parenthèses -->
              <template v-if="isPublicNationalInstitution(event.organization) && event.organization.country?.code">
                <div class="flex items-center justify-center gap-1 mb-1">
                  <!-- Logo de l'organisation -->
                  <img
                    v-if="event.organization?.logo_url"
                    :src="event.organization.logo_url"
                    :alt="`${t('common.logo')} ${event.organization.name}`"
                    class="w-7 h-7 rounded object-contain bg-white flex-shrink-0"
                  />
                  <div v-else class="w-7 h-7 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {{ event.organization?.name?.[0]?.toUpperCase() || 'A' }}
                    </span>
                  </div>
                  <!-- Drapeau du pays entre parenthèses -->
                  <div class="flex items-center gap-0.5">
                    <span class="text-gray-400 text-xs">(</span>
                    <div class="w-4 h-4 rounded bg-white flex items-center justify-center p-0.5">
                      <img
                        :src="`https://flagcdn.com/w80/${event.organization.country.code.toLowerCase()}.png`"
                        :alt="`${t('common.flag')} ${t('common.locale') === 'fr' ? event.organization.country.name_fr : event.organization.country.name_en}`"
                        class="w-full h-full object-contain rounded"
                        loading="lazy">
                    </div>
                    <span class="text-gray-400 text-xs">)</span>
                  </div>
                </div>
              </template>
              <!-- Autres types d'organisation : logo uniquement -->
              <template v-else>
                <img
                  v-if="event.organization?.logo_url"
                  :src="event.organization.logo_url"
                  :alt="`${t('common.logo')} ${event.organization.name}`"
                  class="w-8 h-8 rounded object-contain bg-white flex-shrink-0 mx-auto mb-1"
                />
                <div v-else class="w-8 h-8 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 mx-auto mb-1">
                  <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {{ event.organization?.name?.[0]?.toUpperCase() || 'A' }}
                  </span>
                </div>
              </template>

              <!-- Informations de l'activité -->
              <div class="flex-1 min-w-0">
                <!-- Badge LIVE -->
                <div v-if="isLive(event)" class="flex justify-center mb-1">
                  <div class="inline-flex items-center gap-1 bg-red-500/95 px-2 py-0.5 rounded-md shadow-md">
                    <span class="relative flex h-1.5 w-1.5">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                    </span>
                    <span class="text-white text-[10px] font-bold uppercase tracking-wide">{{ t('activities.live') || 'Direct' }}</span>
                  </div>
                </div>
                <!-- Badge Terminé -->
                <div v-else-if="event.isFinished" class="flex justify-center mb-1">
                  <div class="inline-flex items-center gap-1 bg-green-600/90 px-2 py-0.5 rounded-md shadow-md">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="text-white text-[10px] font-bold uppercase tracking-wide">{{ t('activities.finished') || 'Terminé' }}</span>
                  </div>
                </div>
                <p class="font-semibold text-sm line-clamp-2 text-center" :class="getEventTextClass(event)">
                  {{ event.title }}
                </p>
                <p class="text-xs opacity-90 truncate text-center" :class="getEventTextClass(event)">
                  {{ event.organization?.name }}
                </p>
                <p class="text-xs opacity-75 mt-1 text-center" :class="getEventTextClass(event)">
                  {{ formatEventTimeDisplay(event.start, event.end) }}
                </p>
              </div>
            </div>
          </template>
        </vue-cal>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else class="max-w-2xl mx-auto px-4 py-16">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div class="flex">
          <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              {{ t('programmations.error.title') }}
            </h3>
            <p class="mt-2 text-sm text-red-700 dark:text-red-300">
              {{ t('programmations.error.notFound') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de recherche -->
    <SearchModal
      :is-open="isSearchModalOpen"
      @close="isSearchModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@vueuse/head'
import VueCal from 'vue-cal'
import { useSupabase } from '@/composables/useSupabase'
import { useActivities } from '@/composables/useActivities'
import { usePdfExport } from '@/composables/usePdfExport'
import { useAuthStore } from '@/stores/auth'
import SearchModal from '@/components/SearchModal.vue'
import AlertBanner from '@/components/AlertBanner.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()
const { isLive } = useActivities()
const { exportDayProgramToPdf } = usePdfExport()
const authStore = useAuthStore()

// Détecter si on est sur mobile pour définir le mode d'affichage par défaut
const isMobile = window.matchMedia('(max-width: 768px)').matches

// État
const isLoading = ref(true)
const isLoadingActivities = ref(false)
const event = ref(null)
const activities = ref([])
const viewMode = ref(isMobile ? 'grid' : 'calendar') // 'grid' sur mobile, 'calendar' sur desktop
const selectedDate = ref(new Date())
const currentWeek = ref(2) // Semaine actuelle (1 ou 2)
const week1StartDate = ref(null)
const week2StartDate = ref(null)
const isSearchModalOpen = ref(false)
const incidentMessages = ref([]) // Messages d'alerte/incidents
const pdfScale = ref(1.0) // Facteur d'échelle pour l'export PDF (0.6 à 1.4)
const showPdfSettings = ref(false) // Afficher/masquer les paramètres PDF

// Paramètres de route
const year = computed(() => parseInt(route.params.year))
const eventId = computed(() => route.params.eventId)

// Locale pour vue-cal
const currentLocale = computed(() => locale.value)

// Vérifie si l'événement est une CdP
const isCopEvent = computed(() => {
  return event.value?.acronym?.startsWith('CdP') || event.value?.acronym?.startsWith('COP')
})

// Titre à afficher dans la hero section
const displayTitle = computed(() => {
  if (!event.value) return ''

  if (isCopEvent.value) {
    return `${t('programmations.francophoniePavilionTitle')} ${event.value.year}`
  }

  return event.value.title
})

// Nombre d'activités approuvées (incluant les activités terminées)
const approvedActivitiesCount = computed(() => {
  // Compter toutes les activités approuvées (terminées ou non)
  const approvedCount = activities.value.filter(a =>
    a.validation_status === 'approved'
  ).length

  // Ajouter 20 activités pour les journées spéciales si CdP 30
  const specialDaysBonus = event.value?.acronym === 'CdP 30' ? 20 : 0

  return approvedCount + specialDaysBonus
})

// Nombre d'organisations représentées (uniques)
const organizationsCount = computed(() => {
  const uniqueOrgs = new Set()
  activities.value.forEach(activity => {
    if (activity.organization?.id) {
      uniqueOrgs.add(activity.organization.id)
    }
  })

  // Ajouter 14 organisations pour les journées spéciales si CdP 30
  const specialDaysBonus = event.value?.acronym === 'CdP 30' ? 14 : 0

  return uniqueOrgs.size + specialDaysBonus
})

// Nombre de pays représentés (uniques)
const countriesCount = computed(() => {
  const uniqueCountries = new Set()
  activities.value.forEach(activity => {
    if (activity.organization?.country?.code) {
      uniqueCountries.add(activity.organization.country.code)
    }
  })
  return uniqueCountries.size
})

// Date de dernière mise à jour (la plus récente updated_at des activités approuvées)
const lastUpdateDate = computed(() => {
  const approvedActivities = activities.value.filter(a => a.validation_status === 'approved')

  if (approvedActivities.length === 0) return null

  const dates = approvedActivities
    .map(a => a.updated_at ? new Date(a.updated_at) : null)
    .filter(d => d !== null)

  if (dates.length === 0) return null

  const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())))

  // Formater la date selon la locale
  return mostRecent.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Items à afficher dans les vues grid et liste (activités + journées spéciales)
const displayItems = computed(() => {
  const items = []

  // Ajouter toutes les activités approuvées
  const approvedActivities = activities.value.filter(a => a.validation_status === 'approved')
  items.push(...approvedActivities.map(activity => ({
    ...activity,
    type: 'activity',
    isSpecialDay: false
  })))

  // Ajouter la Journée Jeunesse Climat si l'événement est la CdP 30
  if (isCopEvent.value && event.value?.year === 2025) {
    items.push({
      id: 'youth-climate-day',
      type: 'special-day',
      isSpecialDay: true,
      specialDayType: 'youth-climate',
      title: `🌱 ${t('programmations.youthClimateDay')}`,
      description: t('youthClimateDay.context'),
      final_start_date: '2025-11-12T12:00:00Z',
      final_end_date: '2025-11-12T20:45:00Z',
      internalLink: '/programmations/2025/journee-jeunesse',
      cover_image_low_url: '/images/example/event_banniere_par_defaut_16_9_reduit.jpg',
      format: 'networking',
      room: t('youthClimateDay.location')
    })

    // Ajouter la Journée Finance durable en Francophonie
    items.push({
      id: 'sustainable-finance-day',
      type: 'special-day',
      isSpecialDay: true,
      specialDayType: 'sustainable-finance',
      title: `💰 ${t('programmations.sustainableFinanceDay')}`,
      description: 'Journée Finance durable en Francophonie',
      final_start_date: '2025-11-14T12:00:00Z',
      final_end_date: '2025-11-14T20:45:00Z',
      internalLink: '/programmations/2025/journee-finance',
      cover_image_low_url: '/images/example/event_banniere_par_defaut_16_9_reduit.jpg',
      format: 'networking',
      room: t('youthClimateDay.location')
    })
  }

  // Trier par date de début
  items.sort((a, b) => {
    const dateA = new Date(a.final_start_date)
    const dateB = new Date(b.final_start_date)
    return dateA - dateB
  })

  return items
})

// Regrouper les activités par jour pour le mode grid
const activitiesByDay = computed(() => {
  const grouped = {}

  displayItems.value.forEach(item => {
    if (!item.final_start_date) return

    // Obtenir la date au format YYYY-MM-DD
    const date = new Date(item.final_start_date)
    const dateKey = date.toISOString().split('T')[0]

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: date,
        dateKey: dateKey,
        items: []
      }
    }

    grouped[dateKey].items.push(item)
  })

  // Convertir en tableau et trier par date
  return Object.values(grouped).sort((a, b) => a.date - b.date)
})

// Formater l'en-tête de jour pour le mode grid
const formatDayHeader = (date) => {
  if (!date) return ''

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', options)
}

// Vérifier si une date est aujourd'hui
const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

// Calculer le GMT offset pour un timezone donné
const getGMTOffset = (timezone) => {
  if (!timezone) return ''

  try {
    // Créer une date de référence
    const now = new Date()

    // Obtenir l'offset en minutes pour le timezone donné
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    })

    const parts = formatter.formatToParts(now)
    const offsetPart = parts.find(part => part.type === 'timeZoneName')

    if (offsetPart && offsetPart.value) {
      // Le format est généralement "GMT+/-HH:MM"
      const match = offsetPart.value.match(/GMT([+-]\d{1,2}):?(\d{2})?/)
      if (match) {
        const hours = parseInt(match[1])
        const minutes = match[2] ? parseInt(match[2]) : 0

        if (minutes === 0) {
          return `GMT${hours >= 0 ? '+' : ''}${hours}`
        } else {
          return `GMT${hours >= 0 ? '+' : ''}${hours}:${minutes.toString().padStart(2, '0')}`
        }
      }
    }

    // Fallback : calculer manuellement l'offset
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60)

    const hours = Math.floor(Math.abs(offset))
    const minutes = Math.round((Math.abs(offset) - hours) * 60)

    if (minutes === 0) {
      return `GMT${offset >= 0 ? '+' : '-'}${hours}`
    } else {
      return `GMT${offset >= 0 ? '+' : '-'}${hours}:${minutes.toString().padStart(2, '0')}`
    }
  } catch (error) {
    console.error('Error calculating GMT offset:', error)
    return ''
  }
}

// Timezone avec GMT offset
const timezoneWithGMT = computed(() => {
  if (!event.value?.timezone) return ''

  const gmtOffset = getGMTOffset(event.value.timezone)
  return gmtOffset ? `${event.value.timezone} (${gmtOffset})` : event.value.timezone
})

// Fonction pour convertir une date UTC en date "locale" représentant l'heure du timezone de l'événement
const convertUTCToEventTimezoneAsLocal = (dateString) => {
  if (!dateString) return new Date()
  if (!event.value?.timezone) return new Date(dateString)

  try {
    const utcDate = new Date(dateString)

    // Obtenir les composants de la date dans le timezone de l'événement
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: event.value.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(utcDate)
    const values = {}
    parts.forEach(part => {
      if (part.type !== 'literal') {
        values[part.type] = part.value
      }
    })

    // Créer une date "locale" avec ces composants
    // Cette date sera interprétée par vue-cal comme une heure locale,
    // affichant ainsi l'heure correcte du timezone de l'événement
    return new Date(
      parseInt(values.year),
      parseInt(values.month) - 1, // Les mois commencent à 0 en JavaScript
      parseInt(values.day),
      parseInt(values.hour),
      parseInt(values.minute),
      parseInt(values.second)
    )
  } catch (error) {
    console.error('Error converting to event timezone:', error)
    return new Date(dateString)
  }
}

// Fonction pour vérifier si une activité est terminée
const isActivityFinished = (endDate) => {
  if (!endDate) return false
  const now = new Date()
  return new Date(endDate) < now
}

// Computed pour le calendrier
const calendarEvents = computed(() => {
  const events = []

  // Ajouter les activités régulières
  activities.value.forEach(activity => {
    // Convertir les dates UTC en dates locales représentant l'heure du timezone de l'événement
    // Vue-cal les affichera alors dans le bon créneau horaire
    const startDate = activity.final_start_date
      ? convertUTCToEventTimezoneAsLocal(activity.final_start_date)
      : new Date()
    const endDate = activity.final_end_date
      ? convertUTCToEventTimezoneAsLocal(activity.final_end_date)
      : new Date()

    // Vérifier si l'activité est terminée
    const isFinished = isActivityFinished(activity.final_end_date)

    // Déterminer la classe CSS en fonction du type d'activité et du statut
    let cssClass = 'activity-event'

    // Ajouter une classe pour les activités terminées (prioritaire avant live)
    if (isFinished) {
      cssClass += ' activity-finished'
    }
    // Ajouter une classe spéciale pour les activités en direct (prioritaire)
    else if (activity.validation_status === 'live') {
      cssClass += ' activity-live'
    } else if (activity.validation_status === 'approved') {
      cssClass += ' activity-approved'
    } else if (activity.activity_type === 'side_event') {
      cssClass += ' activity-side-event'
    } else if (activity.activity_type === 'country_day') {
      cssClass += ' activity-country-day'
    }

    // Ajouter une classe spéciale pour les activités de l'IFDD
    if (activity.organization?.acronym === 'IFDD') {
      cssClass += ' activity-ifdd'
    }

    events.push({
      activityId: activity.id,
      title: activity.title,
      start: startDate,
      end: endDate,
      class: cssClass,
      isFinished,
      organization: {
        ...activity.organization,
        acronym: activity.organization?.acronym,
        organization_type: activity.organization?.organization_type,
        country: activity.organization?.country
      },
      activityType: activity.activity_type,
      validationStatus: activity.validation_status,
      room: activity.room || '',
      format: activity.format || 'presentation',
      deletable: false,
      resizable: false,
      draggable: false
    })
  })

  // Ajouter les journées spéciales en dur
  // Journée Jeunesse Climat - Mercredi 12 novembre 2025
  // Horaires : 9h00-17h45 heure de Belém (GMT-3)
  events.push({
    isSpecialDay: true,
    specialDayType: 'youth-climate',
    title: `🌱 ${t('programmations.youthClimateDay')}`,
    start: new Date(2025, 10, 12, 9, 0), // 12 novembre 2025 à 9h00 (mois 10 = novembre car 0-indexed)
    end: new Date(2025, 10, 12, 17, 45), // 12 novembre 2025 à 17h45
    class: 'special-day-event youth-climate-day',
    internalLink: '/programmations/2025/journee-jeunesse',
    deletable: false,
    resizable: false,
    draggable: false
  })

  // Journée Finance durable en Francophonie - Vendredi 14 novembre 2025
  // Horaires : 9h00-17h45 heure de Belém (GMT-3)
  events.push({
    isSpecialDay: true,
    specialDayType: 'sustainable-finance',
    title: `💰 ${t('programmations.sustainableFinanceDay')}`,
    start: new Date(2025, 10, 14, 9, 0), // 14 novembre 2025 à 9h00
    end: new Date(2025, 10, 14, 17, 45), // 14 novembre 2025 à 17h45
    class: 'special-day-event sustainable-finance-day',
    link: '/programmations/2025/journee-finance',
    deletable: false,
    resizable: false,
    draggable: false
  })

  return events
})

// Computed pour les heures spéciales (jour de repos et journées spéciales)
const specialHours = computed(() => {
  const special = {}

  // Si on a des activités, ajouter le jour de repos (dimanche)
  if (activities.value && activities.value.length > 0) {
    // Trouver la première activité avec une date de début
    const sortedActivities = [...activities.value]
      .filter(a => a.final_start_date)
      .sort((a, b) => new Date(a.final_start_date) - new Date(b.final_start_date))

    if (sortedActivities.length > 0) {
      // Obtenir la date de la première activité
      const firstActivityDate = new Date(sortedActivities[0].final_start_date)

      // Trouver le premier dimanche à partir de cette date
      const firstSunday = new Date(firstActivityDate)
      const dayOfWeek = firstSunday.getDay() // 0 = dimanche, 1 = lundi, ..., 6 = samedi

      // Si on n'est pas déjà dimanche, avancer jusqu'au prochain dimanche
      if (dayOfWeek !== 0) {
        const daysUntilSunday = 7 - dayOfWeek
        firstSunday.setDate(firstSunday.getDate() + daysUntilSunday)
      }

      // Vue-cal utilise 1-7 où 7 = dimanche
      special[7] = {
        from: 8 * 60, // De 8h00
        to: 18 * 60,  // À 18h00
        class: 'rest-day',
        label: `<div class="rest-day-sticky-content">🌴 ${t('programmations.restDay')}</div>`
      }
    }
  }

  return special
})

// Méthodes
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)

  // Si on a un timezone d'événement, l'utiliser pour le formatage
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  if (event.value?.timezone) {
    options.timeZone = event.value.timezone
  }

  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', options)
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)

  // Si on a un timezone d'événement, l'utiliser pour le formatage
  const options = {
    hour: '2-digit',
    minute: '2-digit'
  }

  if (event.value?.timezone) {
    options.timeZone = event.value.timezone
  }

  return date.toLocaleTimeString(locale.value === 'fr' ? 'fr-FR' : 'en-US', options)
}

// Fonction pour obtenir la ville principale d'un fuseau horaire
const getCityFromTimezone = (timezone) => {
  if (!timezone) return ''
  // Extraire la ville du fuseau horaire (ex: "America/Belem" -> "Bélem")
  const parts = timezone.split('/')
  const city = parts[parts.length - 1].replace(/_/g, ' ')
  return city
}

// Fonction pour formater une date avec les deux fuseaux horaires
const formatDateWithTimezone = (dateString, eventTimezone) => {
  if (!dateString || !eventTimezone) return { eventTime: '', userTime: '', showUserTime: false }

  const date = new Date(dateString)

  // Format pour l'événement
  const eventTimeStr = new Intl.DateTimeFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    timeZone: eventTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)

  // Fuseau horaire de l'utilisateur
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Format pour l'utilisateur
  const userTimeStr = new Intl.DateTimeFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)

  // Vérifier si les deux fuseaux sont différents
  const showUserTime = eventTimeStr !== userTimeStr && eventTimezone !== userTimezone

  return {
    eventTime: eventTimeStr,
    userTime: userTimeStr,
    showUserTime,
    eventTimezone,
    userTimezone
  }
}

const stripHtml = (html) => {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const getStatusClass = (event) => {
  const status = event?.event_status || 'upcoming'
  const statusClasses = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
  }
  return statusClasses[status] || statusClasses.upcoming
}

const goToActivityDetail = (activityId) => {
  router.push(`/activities/${activityId}`)
}

const onEventClick = (event) => {
  // Si c'est une journée spéciale avec un lien interne, naviguer vers la page
  if (event.isSpecialDay && event.internalLink) {
    router.push(event.internalLink)
  }
  // Si c'est une journée spéciale avec un lien externe, ouvrir le PDF dans un nouvel onglet
  else if (event.isSpecialDay && event.link) {
    window.open(event.link, '_blank', 'noopener,noreferrer')
  } else if (event.activityId) {
    // Sinon, naviguer vers la page de détail de l'activité
    goToActivityDetail(event.activityId)
  }
}

const getEventTextClass = (event) => {
  // Pour les activités terminées, utiliser du texte vert foncé
  if (event.isFinished) {
    return 'text-green-800 dark:text-green-200'
  }
  // Pour les activités approuvées avec fond blanc, utiliser du texte sombre
  if (event.validationStatus === 'approved') {
    return 'text-gray-900 dark:text-gray-900'
  }
  // Pour les autres, utiliser du texte blanc
  return 'text-white'
}

const formatEventTimeDisplay = (start, end) => {
  // Les dates reçues ici sont déjà converties en "local" par convertUTCToEventTimezoneAsLocal
  // On les formate donc simplement sans spécifier de timezone

  // Obtenir le nom du jour
  const dayName = start.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long'
  })

  // Capitaliser la première lettre du jour
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1)

  const options = {
    hour: '2-digit',
    minute: '2-digit'
  }

  const startTime = start.toLocaleTimeString(locale.value === 'fr' ? 'fr-FR' : 'en-US', options)
  const endTime = end.toLocaleTimeString(locale.value === 'fr' ? 'fr-FR' : 'en-US', options)

  return `${capitalizedDay} · ${startTime} - ${endTime}`
}

// Vérifie si l'organisation est une institution publique nationale
const isPublicNationalInstitution = (organization) => {
  return organization?.organization_type === 'public_national_institution'
}

// Fonction pour naviguer vers une semaine spécifique
const goToWeek = (weekNumber) => {
  currentWeek.value = weekNumber

  if (weekNumber === 1 && week1StartDate.value) {
    selectedDate.value = new Date(week1StartDate.value)
  } else if (weekNumber === 2 && week2StartDate.value) {
    selectedDate.value = new Date(week2StartDate.value)
  }
}

// Fonction pour calculer les dates de début des semaines 1 et 2
const calculateWeekDates = () => {
  if (!activities.value || activities.value.length === 0) return

  // Trier les activités par date
  const sortedActivities = [...activities.value]
    .filter(a => a.final_start_date)
    .sort((a, b) => new Date(a.final_start_date) - new Date(b.final_start_date))

  if (sortedActivities.length === 0) return

  // La première activité définit le début de la semaine 1
  const firstActivityDate = new Date(sortedActivities[0].final_start_date)
  week1StartDate.value = firstActivityDate

  // Trouver le début de la semaine 2 (7 jours après le début de la semaine 1)
  const week2Date = new Date(firstActivityDate)
  week2Date.setDate(week2Date.getDate() + 7)
  week2StartDate.value = week2Date

  // Toujours sélectionner la semaine 2 par défaut
  currentWeek.value = 2
  selectedDate.value = new Date(week2StartDate.value)
}

const loadEvent = async () => {
  try {
    isLoading.value = true

    // Charger l'événement
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId.value)
      .eq('year', year.value)
      .single()

    if (error) throw error

    event.value = data

    // Si on a un événement, charger ses activités et messages d'incidents
    if (data) {
      await Promise.all([
        loadActivities(),
        loadIncidentMessages()
      ])
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
      .select(`
        *,
        organization:organizations(
          id,
          name,
          acronym,
          logo_url,
          organization_type,
          country:countries(code, name_fr, name_en)
        )
      `)
      .eq('event_id', eventId.value)
      .not('validation_status', 'in', '(draft,submitted,under_review,rejected)')
      .order('final_start_date', { ascending: true })

    if (error) throw error

    activities.value = data || []

    // Calculer les dates des semaines 1 et 2
    if (data && data.length > 0) {
      calculateWeekDates()
    }

  } catch (error) {
    console.error('Error loading activities:', error)
  } finally {
    isLoadingActivities.value = false
  }
}

const loadIncidentMessages = async () => {
  try {
    const { data, error } = await supabase
      .from('incident_messages')
      .select(`
        *,
        organization:organizations(
          id,
          name,
          acronym
        )
      `)
      .eq('event_id', eventId.value)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Filtrer les messages selon les critères :
    // - Messages généraux (sans organization_id ni day_date)
    // - Messages pour des organisations spécifiques
    // - Messages pour des journées spécifiques
    incidentMessages.value = data || []

  } catch (error) {
    console.error('Error loading incident messages:', error)
    incidentMessages.value = []
  }
}

// Meta tags dynamiques pour le SEO
const siteUrl = computed(() => window.location.origin)
const pageUrl = computed(() => `${siteUrl.value}${route.fullPath}`)

const metaDescription = computed(() => {
  if (!event.value) return t('programmations.metaDescription')
  return `${t('programmations.metaDescriptionPrefix')} ${event.value.title} ${event.value.year}. ${t('programmations.metaDescriptionSuffix')}`
})

const metaTitle = computed(() => {
  if (!event.value) return t('programmations.title')
  return `${event.value.title} ${event.value.year} - ${t('programmations.title')}`
})

const eventImageUrl = computed(() => {
  const defaultImage = `${siteUrl.value}/images/example/event_banniere_par_defaut_32_9_v3.jpg`

  if (!event.value) return defaultImage

  // Si l'événement a une image de couverture, s'assurer qu'elle est absolue
  if (event.value.cover_image_url) {
    // Si l'URL est déjà absolue (commence par http:// ou https://), la retourner telle quelle
    if (event.value.cover_image_url.startsWith('http://') || event.value.cover_image_url.startsWith('https://')) {
      return event.value.cover_image_url
    }
    // Sinon, construire une URL absolue
    return `${siteUrl.value}${event.value.cover_image_url.startsWith('/') ? '' : '/'}${event.value.cover_image_url}`
  }

  return defaultImage
})

// Données structurées JSON-LD pour le SEO
const structuredData = computed(() => {
  if (!event.value) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.value.title,
    description: event.value.description || metaDescription.value,
    startDate: activities.value.length > 0 ? activities.value[0].final_start_date : undefined,
    endDate: activities.value.length > 0 ? activities.value[activities.value.length - 1].final_end_date : undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.value.venue || event.value.city,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.value.city,
        addressCountry: event.value.country
      }
    },
    image: eventImageUrl.value,
    organizer: {
      '@type': 'Organization',
      name: 'IFDD - Institut de la Francophonie pour le développement durable',
      url: 'https://www.ifdd.francophonie.org'
    },
    offers: activities.value.map(activity => ({
      '@type': 'Offer',
      name: activity.title,
      description: activity.description,
      availability: 'https://schema.org/InStock',
      price: 0,
      priceCurrency: 'USD'
    }))
  }
})

// Configuration des meta tags avec useHead
useHead({
  title: metaTitle,
  meta: [
    { name: 'description', content: metaDescription },
    { name: 'keywords', content: computed(() => `${event.value?.title || ''}, ${event.value?.acronym || ''}, ${event.value?.year || ''}, programmation, activités, IFDD, climat, francophonie`) },

    // Open Graph
    { property: 'og:title', content: metaTitle },
    { property: 'og:description', content: metaDescription },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: pageUrl },
    { property: 'og:image', content: eventImageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:site_name', content: 'e-Pavillon Climatique de la Francophonie' },
    { property: 'og:locale', content: computed(() => locale.value === 'fr' ? 'fr_FR' : 'en_US') },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: metaTitle },
    { name: 'twitter:description', content: metaDescription },
    { name: 'twitter:image', content: eventImageUrl },

    // Additional SEO
    { name: 'robots', content: 'index, follow' },
    { name: 'author', content: 'IFDD - Institut de la Francophonie pour le développement durable' }
  ],
  link: [
    { rel: 'canonical', href: pageUrl }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => structuredData.value ? JSON.stringify(structuredData.value) : '')
    }
  ]
})

// Fonction pour scroller automatiquement vers le jour courant ou le jour suivant
const scrollToCurrentOrNextDay = async () => {
  if (viewMode.value !== 'grid' || activitiesByDay.value.length === 0) return

  await nextTick()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Chercher le jour courant
  const todayGroup = activitiesByDay.value.find(dayGroup => {
    const groupDate = new Date(dayGroup.date)
    groupDate.setHours(0, 0, 0, 0)
    return groupDate.getTime() === today.getTime()
  })

  let targetDateKey = null

  if (todayGroup) {
    // Si on trouve le jour courant, scroller vers lui
    targetDateKey = todayGroup.dateKey
  } else {
    // Sinon, chercher le prochain jour avec activités
    const futureDay = activitiesByDay.value.find(dayGroup => {
      const groupDate = new Date(dayGroup.date)
      groupDate.setHours(0, 0, 0, 0)
      return groupDate.getTime() > today.getTime()
    })

    if (futureDay) {
      targetDateKey = futureDay.dateKey
    }
  }

  // Scroller vers l'élément cible
  if (targetDateKey) {
    setTimeout(() => {
      const element = document.querySelector(`[data-date="${targetDateKey}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}

// Watcher pour mettre à jour les meta tags quand les données changent
watch([event, activities, locale], () => {
  // Les meta tags seront automatiquement mis à jour grâce aux computed properties
  // Setup sticky après chargement des activités
  if (activities.value.length > 0 && viewMode.value === 'calendar') {
    addDayNameToTimeCells()
    setupStickySpecialDays()
  }
  // Scroll automatique en mode grid
  if (activities.value.length > 0 && viewMode.value === 'grid') {
    scrollToCurrentOrNextDay()
  }
}, { deep: true })

// Watcher pour empêcher le mode liste sur mobile
watch(() => viewMode.value, (newMode) => {
  const isMobileNow = window.matchMedia('(max-width: 768px)').matches
  if (isMobileNow && newMode === 'list') {
    viewMode.value = 'grid'
  }
})

// Gérer le redimensionnement de la fenêtre
const handleResize = () => {
  const isMobileNow = window.matchMedia('(max-width: 768px)').matches
  if (isMobileNow && viewMode.value === 'list') {
    viewMode.value = 'grid'
  }
}

// Variable pour stocker la référence à handleScroll pour le cleanup
let scrollHandler = null
let rafId = null

// Fonction pour ajouter le nom du jour dans les cellules de temps
const addDayNameToTimeCells = () => {
  console.log('📅 Ajout du nom du jour dans les cellules de temps...')

  setTimeout(() => {
    // Obtenir toutes les en-têtes de jours
    const weekdayHeadings = document.querySelectorAll('.vuecal__heading')

    if (weekdayHeadings.length === 0) {
      console.log('⚠️ Aucune en-tête de jour trouvée')
      return
    }

    console.log(`✅ ${weekdayHeadings.length} en-têtes de jours trouvées`)

    // Créer un tableau avec les noms de jours
    const dayNames = Array.from(weekdayHeadings).map(heading => heading.textContent.trim())

    // Obtenir toutes les colonnes de cellules (chaque jour)
    const allCells = document.querySelectorAll('.vuecal__cell')

    // Grouper les cellules par jour
    const cellsByDay = {}
    allCells.forEach(cell => {
      const split = cell.getAttribute('data-split')
      if (split) {
        if (!cellsByDay[split]) {
          cellsByDay[split] = []
        }
        cellsByDay[split].push(cell)
      }
    })

    // Pour chaque jour
    Object.keys(cellsByDay).forEach(split => {
      const dayIndex = parseInt(split) - 1
      if (dayIndex >= dayNames.length) return

      const dayName = dayNames[dayIndex]
      const cells = cellsByDay[split]

      // Pour chaque cellule de ce jour
      cells.forEach(cell => {
        const timeCells = cell.querySelectorAll('.vuecal__time-cell')

        // Modifier seulement la première cellule de temps de chaque colonne
        if (timeCells.length > 0 && !cell.dataset.dayNameAdded) {
          const firstTimeCell = timeCells[0]
          const timeCellLabel = firstTimeCell.querySelector('.vuecal__time-cell-label') || firstTimeCell

          // Sauvegarder le contenu original
          const originalContent = timeCellLabel.textContent

          // Créer le nouveau contenu avec le nom du jour
          timeCellLabel.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.875rem;">
              <span style="font-weight: 600; color: #f97316; white-space: nowrap;">${dayName}</span>
              <span style="color: #6b7280;">|</span>
              <span>${originalContent}</span>
            </div>
          `

          cell.dataset.dayNameAdded = 'true'
          console.log(`✨ "${dayName}" ajouté à la colonne ${split}`)
        }
      })
    })
  }, 1000)
}

// Gérer le positionnement sticky des journées spéciales lors du scroll
const setupStickySpecialDays = () => {
  // Attendre que Vue-Cal soit monté et que le DOM soit prêt
  setTimeout(() => {
    console.log('🔍 Initialisation sticky pour journées spéciales...')

    // Définir handleScroll avec requestAnimationFrame pour de meilleures performances
    scrollHandler = () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }

      rafId = requestAnimationFrame(() => {
        // Gérer les journées spéciales (Finance durable, Jeunesse climat)
        const specialDayWrappers = document.querySelectorAll('.special-day-wrapper')

        if (specialDayWrappers.length > 0) {
          console.log(`📊 ${specialDayWrappers.length} journées spéciales trouvées`)

          specialDayWrappers.forEach((wrapper, index) => {
            const content = wrapper.querySelector('.special-day-fixed-content')
            if (!content) return

            const wrapperRect = wrapper.getBoundingClientRect()
            const contentHeight = content.offsetHeight

            // Position depuis le haut du viewport
            const topOffset = 100 // Offset depuis le haut de la fenêtre

            // Si le wrapper est dans la zone visible et commence à être scrollé
            if (wrapperRect.top < topOffset && wrapperRect.bottom > topOffset + contentHeight) {
              // Calculer le décalage nécessaire
              const translateY = topOffset - wrapperRect.top
              content.style.transform = `translateY(${translateY}px)`
              content.style.zIndex = '50'
              console.log(`✨ Journée spéciale ${index} sticky avec offset ${translateY}px`)
            } else {
              content.style.transform = 'translateY(0)'
              content.style.zIndex = '20'
            }
          })
        }

        // Gérer le jour de repos (rest-day) - uniquement le contenu texte
        const restDays = document.querySelectorAll('.vuecal__special-hours.rest-day')

        if (restDays.length > 0) {
          console.log(`🌴 ${restDays.length} jours de repos trouvés`)

          restDays.forEach((restDay, index) => {
            const stickyContent = restDay.querySelector('.rest-day-sticky-content')
            if (!stickyContent) return

            const restDayRect = restDay.getBoundingClientRect()
            const contentHeight = stickyContent.offsetHeight

            // Position depuis le haut du viewport
            const topOffset = 100

            // Si le jour de repos est scrollé
            if (restDayRect.top < topOffset && restDayRect.bottom > topOffset + contentHeight) {
              // Calculer le décalage pour le contenu uniquement
              const translateY = topOffset - restDayRect.top
              stickyContent.style.transform = `translateY(${translateY}px)`
              stickyContent.style.position = 'relative'
              stickyContent.style.zIndex = '50'
              console.log(`✨ Jour de repos ${index} - contenu sticky avec offset ${translateY}px`)
            } else {
              stickyContent.style.transform = 'translateY(0)'
              stickyContent.style.position = 'relative'
              stickyContent.style.zIndex = '20'
            }
          })
        }
      })
    }

    // Ajouter les listeners sur window et tous les éléments scrollables
    window.addEventListener('scroll', scrollHandler, { passive: true })

    // Chercher tous les éléments avec overflow dans Vue-Cal
    const allElements = document.querySelectorAll('.vuecal, .vuecal__body, .calendar-scroll-wrapper')
    allElements.forEach(el => {
      el.addEventListener('scroll', scrollHandler, { passive: true })
      console.log('✅ Listener ajouté sur', el.className)
    })

    // Appeler une fois pour initialiser
    scrollHandler()
  }, 1000)
}

// Lifecycle
onMounted(() => {
  loadEvent()
  window.addEventListener('resize', handleResize)

  // Setup sticky après un délai pour laisser Vue-Cal se monter
  setTimeout(() => {
    if (viewMode.value === 'calendar') {
      addDayNameToTimeCells()
      setupStickySpecialDays()
    }
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  // Nettoyer les event listeners du scroll
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)

    const allElements = document.querySelectorAll('.vuecal, .vuecal__body, .calendar-scroll-wrapper')
    allElements.forEach(el => {
      el.removeEventListener('scroll', scrollHandler)
    })
  }

  // Annuler l'animation frame en cours
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
})

// Watcher pour setup sticky après changement de vue
watch(viewMode, (newMode) => {
  if (newMode === 'calendar') {
    addDayNameToTimeCells()
    setupStickySpecialDays()
  } else if (newMode === 'grid') {
    // Déclencher le scroll automatique vers le jour courant
    scrollToCurrentOrNextDay()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

/* Design Glassmorphism pour les cartes de statistiques */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

/* Version mobile optimisée des cartes glass */
.glass-card-mobile {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0.5rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .glass-card-mobile {
    border-radius: 12px;
    padding: 1rem;
  }
}

.glass-card-mobile:hover {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

/* Styles pour Vue-Cal theme orange */
:deep(.vuecal--orange-theme) {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  height: 100%;
}

:deep(.vuecal--orange-theme .vuecal__header) {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.vuecal--orange-theme .vuecal__title-bar) {
  background-color: transparent;
}

:deep(.vuecal--orange-theme .vuecal__title) {
  color: #111827;
}

:deep(.vuecal--orange-theme .vuecal__weekdays-headings) {
  border-bottom: 1px solid #e5e7eb;
}

:deep(.vuecal--orange-theme .vuecal__heading) {
  color: #374151;
  font-weight: 500;
}

:deep(.vuecal--orange-theme .vuecal__cell) {
  border: 1px solid #e5e7eb;
}

:deep(.vuecal--orange-theme .vuecal__cell-date) {
  color: #374151;
}

:deep(.vuecal--orange-theme .vuecal__cell--today) {
  background-color: transparent;
}

:deep(.vuecal--orange-theme .vuecal__cell--selected) {
  background-color: transparent;
}

:deep(.vuecal--orange-theme .vuecal__arrow) {
  color: #4b5563;
}

:deep(.vuecal--orange-theme .vuecal__arrow:hover) {
  color: #f97316;
}

:deep(.vuecal--orange-theme .vuecal__view-btn) {
  color: #374151;
}

:deep(.vuecal--orange-theme .vuecal__view-btn:hover) {
  color: #f97316;
}

:deep(.vuecal--orange-theme .vuecal__view-btn--active) {
  background-color: #f97316;
  color: white;
}

:deep(.vuecal--orange-theme .vuecal__view-btn--active:hover) {
  background-color: #ea580c;
}

:deep(.vuecal--orange-theme .vuecal__now-line) {
  background-color: #f97316;
}

:deep(.vuecal--orange-theme .vuecal__time-cell) {
  color: #4b5563;
}

/* Classes pour les événements */
:deep(.activity-event) {
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-width: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.activity-event:hover) {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transform: scale(1.02);
}

:deep(.activity-approved) {
  background-color: white;
  border-color: #d1d5db;
  color: #111827;
}

:deep(.activity-approved:hover) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

/* Styles pour les activités terminées */
:deep(.activity-finished) {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.12) 100%);
  border-color: #86efac;
  color: #166534;
}

:deep(.activity-finished:hover) {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.16) 100%);
  border-color: #4ade80;
}

:deep(.activity-side-event) {
  background-color: rgb(59 130 246);
  border-color: rgb(37 99 235);
  color: white;
}

:deep(.activity-side-event:hover) {
  background-color: rgb(37 99 235);
}

:deep(.activity-country-day) {
  background-color: rgb(34 197 94);
  border-color: rgb(22 163 74);
  color: white;
}

:deep(.activity-country-day:hover) {
  background-color: rgb(22 163 74);
}

/* Animation spéciale pour les activités de l'IFDD */
@keyframes borderGlow {
  0% {
    border-color: #f97316;
    box-shadow: 0 0 5px #f97316, 0 0 10px #f97316;
  }
  50% {
    border-color: #fb923c;
    box-shadow: 0 0 10px #fb923c, 0 0 20px #fb923c, 0 0 30px #f97316;
  }
  100% {
    border-color: #f97316;
    box-shadow: 0 0 5px #f97316, 0 0 10px #f97316;
  }
}

:deep(.activity-ifdd) {
  border-width: 3px;
  border-style: solid;
  animation: borderGlow 2s ease-in-out infinite;
}

:deep(.activity-ifdd.activity-approved) {
  animation: borderGlow 2s ease-in-out infinite;
}

/* Styles pour les activités en direct */
@keyframes liveGlow {
  0%, 100% {
    border-color: #ef4444;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3), inset 0 0 20px rgba(239, 68, 68, 0.1);
  }
  50% {
    border-color: #dc2626;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.7), 0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 30px rgba(239, 68, 68, 0.2);
  }
}

:deep(.activity-live) {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(249, 115, 22, 0.15) 100%) !important;
  border-width: 3px !important;
  border-style: solid !important;
  animation: liveGlow 2s ease-in-out infinite !important;
  position: relative;
  z-index: 10 !important;
}

:deep(.vuecal__event) {
  overflow: visible;
}

/* Styles pour le mode sombre */
.dark :deep(.vuecal--orange-theme) {
  border-color: #374151;
}

.dark :deep(.vuecal--orange-theme .vuecal__header) {
  background-color: #1f2937;
  border-bottom-color: #374151;
}

.dark :deep(.vuecal--orange-theme .vuecal__title) {
  color: white;
}

.dark :deep(.vuecal--orange-theme .vuecal__weekdays-headings) {
  border-bottom-color: #374151;
}

.dark :deep(.vuecal--orange-theme .vuecal__heading) {
  color: #d1d5db;
}

.dark :deep(.vuecal--orange-theme .vuecal__cell) {
  border-color: #374151;
  background-color: rgb(55 65 81);
}

.dark :deep(.vuecal--orange-theme .vuecal__cell-date) {
  color: #d1d5db;
}

.dark :deep(.vuecal--orange-theme .vuecal__cell--today) {
  background-color: transparent;
}

.dark :deep(.vuecal--orange-theme .vuecal__cell--selected) {
  background-color: transparent;
}

.dark :deep(.vuecal--orange-theme .vuecal__arrow) {
  color: #9ca3af;
}

.dark :deep(.vuecal--orange-theme .vuecal__arrow:hover) {
  color: #fb923c;
}

.dark :deep(.vuecal--orange-theme .vuecal__view-btn) {
  color: #d1d5db;
}

.dark :deep(.vuecal--orange-theme .vuecal__view-btn:hover) {
  color: #fb923c;
}

.dark :deep(.vuecal--orange-theme .vuecal__time-cell) {
  color: #9ca3af;
  border-color: rgb(75 85 99);
}

.dark :deep(.vuecal--orange-theme .vuecal__title-bar) {
  background-color: rgb(31 41 55);
}

/* Styles spécifiques pour les événements en mode sombre */
.dark :deep(.activity-approved) {
  background-color: rgb(243 244 246);
  border-color: #9ca3af;
  color: #111827;
}

.dark :deep(.activity-approved:hover) {
  background-color: rgb(229 231 235);
}

/* Styles pour les activités terminées en mode sombre */
.dark :deep(.activity-finished) {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.2) 100%);
  border-color: #4ade80;
  color: #86efac;
}

.dark :deep(.activity-finished:hover) {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.25) 100%);
  border-color: #22c55e;
}

/* Animation IFDD pour le mode sombre */
@keyframes borderGlowDark {
  0% {
    border-color: #fb923c;
    box-shadow: 0 0 8px #fb923c, 0 0 15px #f97316;
  }
  50% {
    border-color: #fdba74;
    box-shadow: 0 0 15px #fdba74, 0 0 25px #fb923c, 0 0 35px #f97316;
  }
  100% {
    border-color: #fb923c;
    box-shadow: 0 0 8px #fb923c, 0 0 15px #f97316;
  }
}

.dark :deep(.activity-ifdd) {
  animation: borderGlowDark 2s ease-in-out infinite;
}

.dark :deep(.activity-ifdd.activity-approved) {
  animation: borderGlowDark 2s ease-in-out infinite;
}

/* Styles pour les heures spéciales (jour de repos) */
:deep(.vuecal__special-hours) {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px 8px 8px 8px;
  font-size: 0.95em;
  font-weight: 500;
  position: relative;
}

:deep(.rest-day) {
  background:
    #fff7f0
    repeating-linear-gradient(
      -45deg,
      rgba(249, 115, 22, 0.15),
      rgba(249, 115, 22, 0.15) 10px,
      rgba(255, 255, 255, 0) 10px,
      rgba(255, 255, 255, 0) 20px
    );
  color: #ea580c;
  border: 2px dashed #fb923c;
}

.dark :deep(.rest-day) {
  background:
    rgb(55 65 81)
    repeating-linear-gradient(
      -45deg,
      rgba(249, 115, 22, 0.25),
      rgba(249, 115, 22, 0.25) 10px,
      rgba(55, 65, 81, 0) 10px,
      rgba(55, 65, 81, 0) 20px
    );
  color: #fb923c;
  border: 2px dashed #fb923c;
}

/* Styles pour le contenu sticky du jour de repos */
:deep(.rest-day-sticky-content) {
  display: inline-block;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
  transition: transform 0.1s ease-out, box-shadow 0.2s ease;
  will-change: transform;
  background:
    rgba(255, 247, 240, 0.95)
    repeating-linear-gradient(
      -45deg,
      rgba(249, 115, 22, 0.15),
      rgba(249, 115, 22, 0.15) 10px,
      rgba(255, 255, 255, 0) 10px,
      rgba(255, 255, 255, 0) 20px
    );
  color: #ea580c;
  border: 2px dashed #fb923c;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Effet quand le contenu du jour de repos est sticky */
:deep(.rest-day-sticky-content[style*="translateY"]) {
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35) !important;
  background:
    rgba(255, 247, 240, 0.98)
    repeating-linear-gradient(
      -45deg,
      rgba(249, 115, 22, 0.25),
      rgba(249, 115, 22, 0.25) 10px,
      rgba(255, 255, 255, 0) 10px,
      rgba(255, 255, 255, 0) 20px
    ) !important;
}

/* Mode sombre pour le contenu du jour de repos */
.dark :deep(.rest-day-sticky-content) {
  background:
    rgba(55, 65, 81, 0.95)
    repeating-linear-gradient(
      -45deg,
      rgba(249, 115, 22, 0.25),
      rgba(249, 115, 22, 0.25) 10px,
      rgba(55, 65, 81, 0) 10px,
      rgba(55, 65, 81, 0) 20px
    );
  color: #fb923c;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dark :deep(.rest-day-sticky-content[style*="translateY"]) {
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45) !important;
  background:
    rgba(55, 65, 81, 0.98)
    repeating-linear-gradient(
      -45deg,
      rgba(249, 115, 22, 0.35),
      rgba(249, 115, 22, 0.35) 10px,
      rgba(55, 65, 81, 0) 10px,
      rgba(55, 65, 81, 0) 20px
    ) !important;
}

/* Styles généraux pour les journées spéciales */
:deep(.special-day-event) {
  min-height: 100px;
  font-weight: 600;
}

:deep(.special-day-event:hover) {
  transform: scale(1.01);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Styles pour la Journée Jeunesse Climat */
:deep(.youth-climate-day) {
  background:
    linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%),
    repeating-linear-gradient(
      -45deg,
      rgba(34, 197, 94, 0.1),
      rgba(34, 197, 94, 0.1) 10px,
      transparent 10px,
      transparent 20px
    );
  color: #15803d;
  border: 3px solid #22c55e;
  background-blend-mode: overlay;
}

.dark :deep(.youth-climate-day) {
  background:
    linear-gradient(135deg, rgb(55 65 81) 0%, rgb(45 55 72) 100%),
    repeating-linear-gradient(
      -45deg,
      rgba(34, 197, 94, 0.3),
      rgba(34, 197, 94, 0.3) 10px,
      transparent 10px,
      transparent 20px
    );
  color: #4ade80;
  border: 3px solid #22c55e;
  background-blend-mode: overlay;
}

/* Styles pour la Journée Finance durable en Francophonie */
:deep(.sustainable-finance-day) {
  background:
    linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%),
    repeating-linear-gradient(
      -45deg,
      rgba(59, 130, 246, 0.1),
      rgba(59, 130, 246, 0.1) 10px,
      transparent 10px,
      transparent 20px
    );
  color: #1e40af;
  border: 3px solid #3b82f6;
  background-blend-mode: overlay;
}

.dark :deep(.sustainable-finance-day) {
  background:
    linear-gradient(135deg, rgb(55 65 81) 0%, rgb(45 55 72) 100%),
    repeating-linear-gradient(
      -45deg,
      rgba(59, 130, 246, 0.3),
      rgba(59, 130, 246, 0.3) 10px,
      transparent 10px,
      transparent 20px
    );
  color: #60a5fa;
  border: 3px solid #3b82f6;
  background-blend-mode: overlay;
}

/* Optimisation mobile pour le calendrier */
.calendar-scroll-wrapper {
  -webkit-overflow-scrolling: touch; /* Scroll fluide sur iOS */
}

/* Largeur minimale des cellules en mode mobile */
@media (max-width: 768px) {
  :deep(.calendar-mobile-optimized .vuecal__cell) {
    min-width: 150px; /* Largeur minimale pour une meilleure lisibilité */
  }

  /* Aligner l'en-tête avec le contenu */
  :deep(.calendar-mobile-optimized .vuecal__heading) {
    min-width: 150px; /* Même largeur que les cellules */
  }

  :deep(.calendar-mobile-optimized .vuecal__time-column) {
    min-width: 60px; /* Largeur minimale pour la colonne des heures */
  }

  /* S'assurer que le calendrier prend la largeur nécessaire */
  :deep(.calendar-mobile-optimized .vuecal__flex) {
    min-width: max-content;
  }

  :deep(.calendar-mobile-optimized .vuecal__body) {
    min-width: max-content;
  }

  :deep(.calendar-mobile-optimized .vuecal__weekdays-headings) {
    min-width: max-content;
  }
}

/* Amélioration du scroll horizontal pour mobile */
@media (max-width: 640px) {
  :deep(.calendar-mobile-optimized .vuecal__cell) {
    min-width: 130px; /* Largeur minimale réduite pour très petits écrans */
  }

  /* Aligner l'en-tête avec le contenu sur petits écrans */
  :deep(.calendar-mobile-optimized .vuecal__heading) {
    min-width: 130px; /* Même largeur que les cellules */
  }

  /* Indicateur visuel de scroll - supprimé pour éviter les problèmes de positionnement */
  .calendar-scroll-wrapper {
    position: relative;
  }
}

/* Styles pour les journées spéciales avec effet sticky JavaScript */
.special-day-wrapper {
  position: relative;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.special-day-fixed-content {
  text-align: center;
  padding: 12px 16px;
  border-radius: 12px;
  transition: transform 0.1s ease-out, box-shadow 0.2s ease;
  will-change: transform;
  z-index: 20;
}

/* Améliorer le backdrop pour les journées spéciales en mode light */
:deep(.youth-climate-day .special-day-fixed-content) {
  background: linear-gradient(135deg, rgba(240, 253, 244, 0.98) 0%, rgba(220, 252, 231, 0.98) 100%);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

:deep(.sustainable-finance-day .special-day-fixed-content) {
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.98) 0%, rgba(219, 234, 254, 0.98) 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* Mode sombre pour les journées spéciales */
.dark :deep(.youth-climate-day .special-day-fixed-content) {
  background: linear-gradient(135deg, rgba(55, 65, 81, 0.98) 0%, rgba(45, 55, 72, 0.98) 100%);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
}

.dark :deep(.sustainable-finance-day .special-day-fixed-content) {
  background: linear-gradient(135deg, rgba(55, 65, 81, 0.98) 0%, rgba(45, 55, 72, 0.98) 100%);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

/* Effet lors du scroll */
.special-day-fixed-content[style*="translateY"] {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
}

/* Amélioration du label pour le jour de repos */
:deep(.vuecal__special-hours.rest-day) {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 16px;
  position: relative;
}

/* S'assurer que les conteneurs permettent l'overflow visible */
:deep(.special-day-event) {
  overflow: visible !important;
}

:deep(.vuecal__event-title) {
  overflow: visible !important;
}

:deep(.vuecal__cell-content) {
  position: relative;
}

/* Styles pour les noms de jours ajoutés dynamiquement en mode sombre */
.dark :deep(.vuecal__time-cell-label) span[style*="color: #6b7280"] {
  color: #9ca3af !important;
}
</style>
