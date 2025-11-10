<template>
  <div class="min-h-screen relative transition-colors duration-200">
    <!-- Image de fond avec repeat -->
    <div
      class="absolute inset-0 z-0 dark:opacity-20"
      :style="{
        backgroundImage: 'url(/images/people-bg/people-bg-2.jpg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left'
      }"
    >
    </div>

    <!-- Hero Section avec effet parallaxe -->
    <div class="relative h-[55vh] sm:h-[60vh] md:h-[65vh] min-h-[400px] sm:min-h-[450px] overflow-hidden">
      <!-- Image de couverture de l'événement parent -->
      <div class="absolute inset-0">
        <img
          :src="getBannerUrl()"
          :alt="activity?.title || 'Activity banner'"
          class="w-full h-full object-cover scale-105 animate-subtle-zoom"
          loading="eager"
        >
        <!-- Overlay avec gradient complexe -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-transparent"></div>
      </div>

      <!-- Contenu Hero -->
      <div class="relative h-full flex flex-col justify-end">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-10 md:pb-14">
          <!-- Badges flottants -->
          <div class="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span v-if="activity?.validation_status" class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium animate-fade-in-up">
              <span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              {{ t(`activity.status.${activity.validation_status}`) }}
            </span>

            <span v-if="activity?.format" class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium animate-fade-in-up animation-delay-100">
              <div class="flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'globe']" class="w-4 h-4" />
                <span>{{ t(`activity.format.${activity.format}`) }}</span>
              </div>
            </span>

            <button
              v-if="canRegister"
              @click="registerToActivity"
              :disabled="isRegistering"
              class="backdrop-blur-md bg-orange-500/80 border border-orange-400/50 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold animate-fade-in-up animation-delay-300 hover:bg-orange-600/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <font-awesome-icon
                :icon="['fas', isRegistering ? 'spinner' : 'user-plus']"
                class="mr-2"
                :class="{ 'animate-spin': isRegistering }"
              />
              {{ isRegistering ? t('activity.registering') : t('activity.register') }}
            </button>
          </div>

          <!-- Décompteur -->
          <div v-if="timeRemaining && !timeRemaining.isExpired" class="mb-4 sm:mb-6 animate-fade-in-up animation-delay-200">
            <div class="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 inline-block">
              <div class="text-white/80 text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2 uppercase tracking-wider">
                {{ t('activity.countdown.startsIn') }}
              </div>
              <div class="flex gap-1.5 sm:gap-3">
                <!-- Jours -->
                <div class="flex flex-col items-center">
                  <div class="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[45px] sm:min-w-[65px]">
                    <div class="text-xl sm:text-3xl font-bold text-white tabular-nums">
                      {{ formattedTime.days }}
                    </div>
                  </div>
                  <div class="text-white/70 text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
                    {{ t('activity.countdown.days') }}
                  </div>
                </div>

                <div class="text-xl sm:text-3xl font-bold text-white/50 self-center">:</div>

                <!-- Heures -->
                <div class="flex flex-col items-center">
                  <div class="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[45px] sm:min-w-[65px]">
                    <div class="text-xl sm:text-3xl font-bold text-white tabular-nums">
                      {{ formattedTime.hours }}
                    </div>
                  </div>
                  <div class="text-white/70 text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
                    {{ t('activity.countdown.hours') }}
                  </div>
                </div>

                <div class="text-xl sm:text-3xl font-bold text-white/50 self-center">:</div>

                <!-- Minutes -->
                <div class="flex flex-col items-center">
                  <div class="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[45px] sm:min-w-[65px]">
                    <div class="text-xl sm:text-3xl font-bold text-white tabular-nums">
                      {{ formattedTime.minutes }}
                    </div>
                  </div>
                  <div class="text-white/70 text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
                    {{ t('activity.countdown.minutes') }}
                  </div>
                </div>

                <div class="text-xl sm:text-3xl font-bold text-white/50 self-center">:</div>

                <!-- Secondes -->
                <div class="flex flex-col items-center">
                  <div class="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[45px] sm:min-w-[65px]">
                    <div class="text-xl sm:text-3xl font-bold text-white tabular-nums">
                      {{ formattedTime.seconds }}
                    </div>
                  </div>
                  <div class="text-white/70 text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
                    {{ t('activity.countdown.seconds') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message si l'activité a déjà commencé ou est terminée -->
          <div v-else-if="activityStatusMessage" class="mb-4 sm:mb-6 animate-fade-in-up animation-delay-200">
            <div
              :class="[
                'backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-5 inline-block',
                activityStatusMessage.type === 'incident' && activityStatusMessage.severity === 'error' ? 'bg-red-500/20 border border-red-400/30' :
                activityStatusMessage.type === 'incident' && activityStatusMessage.severity === 'warning' ? 'bg-orange-500/20 border border-orange-400/30' :
                activityStatusMessage.type === 'delayed' ? 'bg-yellow-500/20 border border-yellow-400/30' :
                'bg-orange-500/20 border border-orange-400/30'
              ]"
            >
              <div class="flex items-center gap-2 text-white">
                <font-awesome-icon :icon="['fas', activityStatusMessage.icon]" class="text-lg sm:text-xl" />
                <span class="text-xs sm:text-base font-semibold">
                  {{ activityStatusMessage.message }}
                </span>
              </div>
            </div>
          </div>

          <!-- Titre avec animation -->
          <h1 class="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 animate-fade-in-up animation-delay-400 line-clamp-3">
            {{ activity?.title || '' }}
          </h1>

          <!-- Informations rapides -->
          <div class="flex flex-wrap items-center font-semibold sm:font-bold text-sm sm:text-base md:text-lg gap-3 sm:gap-4 md:gap-6 text-white/90 animate-fade-in-up animation-delay-500">
            <div v-if="activityCountry" class="flex items-center gap-1 sm:gap-2">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{{ event?.city }}</span>
            </div>

            <!-- Date avec jour de la semaine -->
            <div v-if="displayStartDate" class="flex items-center gap-1 sm:gap-2">
              <font-awesome-icon :icon="['fas', 'calendar']" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{{ formatDateWithDay(displayStartDate) }}</span>
            </div>

            <!-- Organisation avec logo et pays avec drapeau -->
            <div v-if="organization" class="flex items-center gap-2">
              <!-- Logo de l'organisation si disponible -->
              <div v-if="organization.logo_url" class="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden bg-white shadow-md flex-shrink-0">
                <img :src="organization.logo_url" :alt="organization.name" class="w-full h-full object-cover">
              </div>
              <!-- Icône par défaut si pas de logo -->
              <font-awesome-icon v-else :icon="['fas', 'building']" class="w-4 h-4 sm:w-5 sm:h-5" />

              <div class="flex flex-col">
                <span>{{ organization.name }}</span>
                <!-- Pays de l'organisation avec drapeau -->
                <div v-if="organizationCountry" class="flex items-center gap-1 text-xs sm:text-sm opacity-90">
                  <img
                    v-if="organizationCountry.code"
                    :src="`https://flagcdn.com/w20/${organizationCountry.code.toLowerCase()}.png`"
                    :alt="t('common.locale') === 'fr' ? organizationCountry.name_fr : organizationCountry.name_en"
                    class="h-3 w-5 object-cover border border-white/30"
                  />
                  <span v-else-if="organizationCountry.flag_emoji">{{ organizationCountry.flag_emoji }}</span>
                  <span>{{ t('common.locale') === 'fr' ? organizationCountry.name_fr : organizationCountry.name_en }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative -mt-6 sm:-mt-8 md:-mt-10 mb-10">
      <div class="w-full lg:max-w-3xl bg-white dark:bg-gray-800 rounded-xl h-min pb-10 shadow-xl">
        <!-- Affiche/Poster de l'activité ou Iframe YouTube -->
        <div
          class="h-64 sm:h-80 md:h-96 rounded-xl shadow-md relative overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20"
        >
          <!-- Iframe YouTube si le lien est disponible -->
          <iframe
            v-if="activity?.youtube_link"
            :src="getYoutubeEmbedUrl(activity.youtube_link, { autoplay: 0, mute: 0 })"
            :title="activity?.title || 'YouTube video'"
            class="w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
          ></iframe>
          <!-- Image de couverture si pas de lien YouTube -->
          <img
            v-else
            :src="getActivityPosterUrl()"
            :alt="activity?.title || 'Activity poster'"
            class="w-full h-full object-cover"
            loading="lazy"
          >
        </div>
        <div class="p-4 sm:p-6 md:p-8">

          <!-- Objectifs -->
          <div v-if="activity?.objectives" class="mb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center text-xl uppercase">
              <font-awesome-icon :icon="['fas', 'bullseye']" class="mr-2 text-blue-800" />
              {{ t('activity.objectives') }}
            </h3>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ activity.objectives }}</p>
          </div>

          <!-- Présentation détaillée -->
          <div v-if="activity?.detailed_presentation" class="mb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center  text-xl uppercase">
              <font-awesome-icon :icon="['fas', 'file-alt']" class="mr-2 text-blue-800" />
              {{ t('activity.presentation') }}
            </h3>
            <div>
              <div class="relative">
                <div
                  ref="descriptionContainer"
                  class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                  :class="{
                    'max-h-[300px] overflow-hidden': !isDescriptionExpanded && shouldShowToggleButton,
                    'description-fade': !isDescriptionExpanded && shouldShowToggleButton
                  }"
                  v-html="activity.detailed_presentation"
                ></div>
              </div>
              <!-- Bouton Voir plus/moins si la description est trop longue -->
              <div v-if="shouldShowToggleButton" class="mt-3 relative z-10 cursor-pointer">
                <button
                  @click="toggleDescription"
                  class="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  <font-awesome-icon
                    :icon="['fas', isDescriptionExpanded ? 'chevron-up' : 'chevron-down']"
                    class="mr-2 text-xs"
                  />
                  {{ isDescriptionExpanded ? t('activity.showLess') : t('activity.showMore') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Documents si disponibles -->
          <div v-if="documents && documents.length > 0" class="mt-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <font-awesome-icon :icon="['fas', 'folder-open']" class="mr-2 text-orange-600" />
              {{ t('activity.documents') }}
            </h3>
            <div class="space-y-2">
              <a
                v-for="doc in documents"
                :key="doc.id"
                :href="doc.file_url"
                target="_blank"
                class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'download']" class="text-gray-500" />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ doc.title }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full lg:w-96 h-min bg-white/0 dark:bg-gray-800/10 backdrop-blur-xl shadow-xl rounded-b-xl overflow-hidden">
        <div class="w-full h-2 bg-gradient-to-r from-blue-700 to-blue-800"></div>
          <div class="p-4 sm:p-6">
            <!-- Horaires -->
            <div v-if="displayStartDate && event?.timezone" class="mb-6">
              <h2 class="text-base sm:text-lg font-semibold text-center mb-3 text-gray-900 dark:text-white flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'clock']" class="mr-2 text-blue-700" />
                {{ t('activity.schedule') }}
              </h2>

              <!-- Date -->
              <!-- <div class="mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <font-awesome-icon :icon="['fas', 'calendar-alt']" class="text-blue-700 dark:text-blue-400" />
                  <span class="font-medium">{{ formatDateWithDay(displayStartDate) }}</span>
                </div>
              </div> -->

              <!-- Heure de l'événement -->
              <div class="mb-3 relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-teal-900/20">
                <!-- Bordure animée -->
                <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 opacity-20 animate-border-pulse"></div>
                <div class="absolute inset-[2px] rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-teal-900/20"></div>

                <!-- Contenu -->
                <div class="relative p-4">
                  <div class="flex items-start gap-3">
                    <!-- Icône animée -->
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 flex items-center justify-center shadow-lg">
                      <font-awesome-icon :icon="['fas', 'clock']" class="text-white text-lg" />
                    </div>

                    <!-- Informations horaires -->
                    <div class="flex-1 space-y-2">
                      <!-- Heures -->
                      <div class="text-base font-bold text-green-900 dark:text-green-100">
                        {{ formatDateWithTimezone(displayStartDate, event.timezone).eventTime }}
                        <span v-if="displayEndDate" class="mx-1">-</span>
                        <span v-if="displayEndDate">
                          {{ formatDateWithTimezone(displayEndDate, event.timezone).eventTime }}
                        </span>
                      </div>

                      <!-- Ville et GMT -->
                      <div class="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="text-green-600 dark:text-green-400" />
                        <span class="font-medium">{{ event.city || getCityFromTimezone(event.timezone) }}</span>
                        <span class="px-2 py-0.5 bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 rounded-full font-mono text-[10px]">
                          {{ getGMTOffset(event.timezone) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Heure locale (si différente) -->
              <div
                v-if="formatDateWithTimezone(displayStartDate, event.timezone).showUserTime"
                class="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/40"
              >
                <!-- Bordure subtile -->
                <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-500 dark:to-purple-500 opacity-10"></div>
                <div class="absolute inset-[1.5px] rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/40"></div>

                <!-- Contenu -->
                <div class="relative p-4">
                  <div class="flex items-start gap-3">
                    <!-- Icône -->
                    <div class="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center border border-blue-200 dark:border-blue-700">
                      <font-awesome-icon :icon="['fas', 'user-clock']" class="text-blue-600 dark:text-blue-400 text-sm" />
                    </div>

                    <!-- Informations horaires -->
                    <div class="flex-1 space-y-1.5">
                      <!-- Heures -->
                      <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {{ formatDateWithTimezone(displayStartDate, event.timezone).userTime }}
                        <span v-if="displayEndDate" class="mx-1">-</span>
                        <span v-if="displayEndDate">
                          {{ formatDateWithTimezone(displayEndDate, event.timezone).userTime }}
                        </span>
                      </div>

                      <!-- Ville locale -->
                      <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <font-awesome-icon :icon="['fas', 'globe']" class="text-blue-500 dark:text-blue-400 text-[10px]" />
                        <span class="italic">{{ t('activity.yourLocalTime', { city: getCityFromTimezone(formatDateWithTimezone(displayStartDate, event.timezone).userTimezone) }) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Thèmes -->
            <h2 class="text-base sm:text-lg font-semibold text-center mb-3 text-gray-900 dark:text-white flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'tags']" class="mr-2 text-blue-700" />
              {{ t('activity.themes') }}
            </h2>
            <div class="flex flex-wrap justify-center gap-2 mb-6">
              <div
                v-for="theme in activity?.main_themes || []"
                :key="theme"
                class="border border-green-700 dark:border-green-500 px-3 py-1 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                {{ t(`activity.theme.${theme}`) }}
              </div>
              <div v-if="!activity?.main_themes || activity.main_themes.length === 0" class="text-gray-500 dark:text-gray-400 text-sm italic">
                {{ t('common.noData') }}
              </div>
            </div>

            <!-- Catégories -->
            <h2 class="text-base sm:text-lg font-semibold text-center mb-3 text-gray-900 dark:text-white flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'layer-group']" class="mr-2 text-blue-700" />
              {{ t('activity.categories') }}
            </h2>
            <div class="flex flex-wrap justify-center gap-2 mb-6">
              <div
                v-for="category in activity?.categories || []"
                :key="category"
                class="border border-blue-700 dark:border-blue-500 px-3 py-1 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                {{ t(`activity.category.${category}`) }}
              </div>
              <div v-if="!activity?.categories || activity.categories.length === 0" class="text-gray-500 dark:text-gray-400 text-sm italic">
                {{ t('common.noData') }}
              </div>
            </div>

            <!-- Panélistes/Intervenants -->
            <h2 class="text-base sm:text-lg font-semibold mt-4 text-center text-gray-900 dark:text-white flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'users']" class="mr-2 text-blue-700" />
              {{ t('activity.speakers') }}
            </h2>
            <div class="flex flex-wrap gap-3 justify-center mt-4">
              <div
                v-for="speaker in speakers"
                :key="speaker.id"
                class="flex flex-col justify-center items-center group cursor-pointer"
              >
                <div class="h-12 w-12 sm:h-14 sm:w-14 shadow-md rounded-full flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                  <img
                    v-if="speaker.photo_thumbnail_url || speaker.photo_url"
                    :src="speaker.photo_thumbnail_url || speaker.photo_url"
                    :alt="`${speaker.first_name} ${speaker.last_name}`"
                    class="w-full h-full object-cover"
                  >
                  <div
                    v-else
                    class="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-gray-700 font-bold text-lg"
                  >
                    {{ getInitials(speaker) }}
                  </div>
                </div>
                <div class="text-xs sm:text-sm w-32 sm:w-40 text-center mt-2">
                  <div class="font-bold text-gray-900 dark:text-white line-clamp-2">
                    {{ speaker.civility }} {{ speaker.first_name }} {{ speaker.last_name }}
                  </div>
                  <div class="text-xs italic font-normal text-gray-600 dark:text-gray-400 mt-1">{{ speaker.position }}</div>
                  <div v-if="speaker.organization" class="text-xs text-gray-500 dark:text-gray-500">{{ speaker.organization }}</div>
                </div>
              </div>

              <div v-if="!speakers || speakers.length === 0" class="text-gray-500 dark:text-gray-400 text-sm italic w-full text-center py-4">
                {{ t('activity.noSpeakers') }}
              </div>
            </div>

            <!-- Bouton pour les questions -->
            <button
              v-if="speakers && speakers.length > 0 && canViewQuestions"
              @click="openQuestionsPanel"
              class="mt-6 w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white py-2 px-4 rounded-full shadow-md transition-all duration-300 text-sm sm:text-base cursor-pointer"
            >
              <div class="flex items-center justify-center gap-2">
                <font-awesome-icon :icon="['fas', 'question-circle']" />
                <span v-if="!currentUserIsSpeaker">{{ t('activity.askQuestion') }}</span>
                <span v-else>{{ t('activity.viewQuestions') }}</span>
              </div>
              <!-- Compteurs pour les speakers -->
              <div v-if="currentUserIsSpeaker && (totalQuestionsCount > 0 || questionsForMeCount > 0)" class="flex items-center justify-center gap-3 mt-1 text-xs">
                <span>{{ t('activity.totalQuestions') }}: {{ totalQuestionsCount }}</span>
                <span class="font-bold">{{ t('activity.questionsForMe') }}: {{ questionsForMeCount }}</span>
              </div>
            </button>
          </div>
      </div>
    </div>

  </div>

  <!-- Modal d'erreur d'accès -->
  <div v-if="showErrorModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
      <div class="p-6 text-center">
        <!-- Icône d'erreur -->
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <!-- Titre -->
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ t(errorModal.title) }}
        </h3>

        <!-- Message -->
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          {{ t(errorModal.message) }}
        </p>

        <!-- Boutons -->
        <div class="flex gap-3 justify-center">
          <button
            @click="goBack"
            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            {{ t('common.goBack') }}
          </button>
          <button
            @click="goHome"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            {{ t('common.goHome') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal d'inscription (succès/erreur/déjà inscrit) -->
  <div v-if="showRegistrationModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
      <div class="p-6">
        <!-- Succès -->
        <div v-if="registrationModal.type === 'success'" class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ registrationModal.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {{ registrationModal.message }}
          </p>
          <div v-if="registrationModal.zoomJoinUrl" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {{ t('activity.registration.success.linkInfo') }}
            </p>
            <a
              :href="registrationModal.zoomJoinUrl"
              target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'video']" />
              {{ t('activity.registration.success.joinZoom') }}
            </a>
          </div>
          <button
            @click="closeRegistrationModal"
            class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            {{ t('common.close') }}
          </button>
        </div>

        <!-- Déjà inscrit -->
        <div v-else-if="registrationModal.type === 'already_registered'" class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'info-circle']" class="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ registrationModal.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            {{ registrationModal.message }}
          </p>
          <button
            @click="closeRegistrationModal"
            class="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            {{ t('common.close') }}
          </button>
        </div>

        <!-- Erreur -->
        <div v-else-if="registrationModal.type === 'error'" class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ registrationModal.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            {{ registrationModal.message }}
          </p>
          <button
            @click="closeRegistrationModal"
            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal d'inscription Guest -->
  <div v-if="showGuestRegistrationModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('activity.guestRegistration.title') }}
          </h3>
          <button
            @click="closeGuestRegistrationModal"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <!-- Info -->
        <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="flex items-start gap-3">
            <font-awesome-icon :icon="['fas', 'info-circle']" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <p class="text-sm text-blue-800 dark:text-blue-200">
                {{ t('activity.guestRegistration.info') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="registerAsGuest" class="space-y-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('activity.guestRegistration.email') }} *
            </label>
            <input
              v-model="guestRegistrationForm.email"
              type="email"
              required
              :class="[
                'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                guestFormErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              ]"
              :placeholder="t('activity.guestRegistration.emailPlaceholder')"
            />
            <p v-if="guestFormErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ guestFormErrors.email }}
            </p>
          </div>

          <!-- Prénom -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('activity.guestRegistration.firstName') }} *
            </label>
            <input
              v-model="guestRegistrationForm.firstName"
              type="text"
              required
              :class="[
                'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                guestFormErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              ]"
              :placeholder="t('activity.guestRegistration.firstNamePlaceholder')"
            />
            <p v-if="guestFormErrors.firstName" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ guestFormErrors.firstName }}
            </p>
          </div>

          <!-- Nom -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('activity.guestRegistration.lastName') }} *
            </label>
            <input
              v-model="guestRegistrationForm.lastName"
              type="text"
              required
              :class="[
                'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                guestFormErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              ]"
              :placeholder="t('activity.guestRegistration.lastNamePlaceholder')"
            />
            <p v-if="guestFormErrors.lastName" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ guestFormErrors.lastName }}
            </p>
          </div>

          <!-- Organisation (optionnel) -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('activity.guestRegistration.organization') }}
            </label>
            <input
              v-model="guestRegistrationForm.organization"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              :placeholder="t('activity.guestRegistration.organizationPlaceholder')"
            />
          </div>

          <!-- Pays (optionnel) -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('activity.guestRegistration.country') }}
            </label>
            <select
              v-model="guestRegistrationForm.countryId"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option :value="null">{{ t('activity.guestRegistration.selectCountry') }}</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ t('common.locale') === 'fr' ? country.name_fr : country.name_en }}
              </option>
            </select>
          </div>

          <!-- Boutons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeGuestRegistrationModal"
              class="flex-1 px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer"
              :disabled="isRegistering"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="isRegistering"
            >
              <font-awesome-icon
                v-if="isRegistering"
                :icon="['fas', 'spinner']"
                class="animate-spin"
              />
              <span>{{ isRegistering ? t('activity.registering') : t('activity.guestRegistration.submit') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Panneau Questions & Réponses (glisse depuis la gauche) -->
  <Transition name="modal-backdrop">
    <div
      v-if="showQuestionsPanel"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      @click="closeQuestionsPanel"
    ></div>
  </Transition>

  <Transition name="slide-from-left">
    <div
      v-if="showQuestionsPanel"
      class="fixed left-0 top-0 bottom-0 w-full sm:w-[600px] md:w-[700px] bg-white dark:bg-gray-800 shadow-2xl z-[60] flex flex-col"
      @click="closeQuestionMenu"
    >
      <!-- Header du panneau -->
      <div class="bg-gradient-to-r from-blue-700 to-blue-800 text-white p-4 sm:p-6 shadow-md">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'comments']" />
            {{ t('activity.questionsPanel.title') }}
          </h2>
          <button
            @click="closeQuestionsPanel"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
          </button>
        </div>
        <p class="text-sm text-blue-100">{{ t('activity.questionsPanel.subtitle') }}</p>
      </div>

      <!-- Filtres -->
      <div class="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in ['all', 'answered', 'pending', 'myQuestions']"
            :key="filter"
            @click="currentFilter = filter"
            :class="[
              'px-3 py-1.5 text-sm rounded-full transition-all cursor-pointer',
              currentFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ t(`activity.questionsPanel.filters.${filter}`) }}
          </button>
        </div>
      </div>

      <!-- Message pour les visiteurs non authentifiés -->
      <div v-if="!authStore.user" class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
        <div class="flex items-start gap-3">
          <font-awesome-icon :icon="['fas', 'info-circle']" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div class="flex-1">
            <p class="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
              {{ t('activity.questionsPanel.loginRequired.title') }}
            </p>
            <p class="text-xs text-blue-700 dark:text-blue-300">
              {{ t('activity.questionsPanel.loginRequired.message') }}
            </p>
            <button
              @click="$router.push({ path: '/login', query: { redirect: $route.fullPath } })"
              class="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <font-awesome-icon :icon="['fas', 'sign-in-alt']" />
              {{ t('activity.questionsPanel.loginRequired.button') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Bouton Poser une question (seulement pour les non-speakers) -->
      <div v-if="canAskQuestions" class="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <button
          @click="toggleQuestionForm"
          class="w-full py-3 px-4 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <font-awesome-icon :icon="['fas', showQuestionForm ? 'times' : 'plus']" />
          {{ showQuestionForm ? t('activity.questionsPanel.questionForm.cancel') : t('activity.questionsPanel.askNewQuestion') }}
        </button>
      </div>

      <!-- Formulaire de nouvelle question (affiché/masqué) -->
      <Transition name="slide-down">
        <div v-if="showQuestionForm" class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-900/30">
          <!-- Message de succès -->
          <div
            v-if="questionSuccess"
            class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg flex items-start gap-3"
          >
            <font-awesome-icon :icon="['fas', 'check-circle']" class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <p class="text-sm text-green-700 dark:text-green-300">{{ t('activity.questionsPanel.questionForm.success') }}</p>
          </div>

          <!-- Message d'erreur -->
          <div
            v-if="questionError"
            class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-lg flex items-start gap-3"
          >
            <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <p class="text-sm text-red-700 dark:text-red-300">{{ questionError }}</p>
          </div>

          <form @submit.prevent="submitQuestion" class="space-y-4">
            <!-- Champ question -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {{ t('activity.questionsPanel.questionForm.questionLabel') }}
              </label>
              <textarea
                v-model="questionForm.question"
                :placeholder="t('activity.questionsPanel.questionForm.questionPlaceholder')"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                :disabled="isSubmittingQuestion || questionSuccess"
              ></textarea>
            </div>

            <!-- Sélection des intervenants -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {{ t('activity.questionsPanel.questionForm.selectSpeakers') }}
              </label>

              <!-- Option "Tous les intervenants" -->
              <div class="mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="selectAllSpeakers"
                    @change="toggleAllSpeakers"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    :disabled="isSubmittingQuestion || questionSuccess"
                  >
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('activity.questionsPanel.questionForm.allSpeakers') }}
                  </span>
                </label>
              </div>

              <!-- Liste des intervenants -->
              <div class="space-y-1 max-h-48 overflow-y-auto pr-2">
                <div
                  v-for="speaker in speakers.filter(s => s.is_available_for_questions)"
                  :key="speaker.id"
                  class="p-2 bg-gray-50 dark:bg-gray-700/50 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      :value="speaker.id"
                      :checked="questionForm.selectedSpeakers.includes(speaker.id)"
                      @change="toggleSpeaker(speaker.id)"
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      :disabled="isSubmittingQuestion || questionSuccess"
                    >
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <div class="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          v-if="speaker.photo_thumbnail_url || speaker.photo_url"
                          :src="speaker.photo_thumbnail_url || speaker.photo_url"
                          :alt="`${speaker.first_name} ${speaker.last_name}`"
                          class="w-full h-full object-cover"
                        >
                        <div
                          v-else
                          class="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-gray-700 font-bold text-xs"
                        >
                          {{ getInitials(speaker) }}
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {{ speaker.civility }} {{ speaker.first_name }} {{ speaker.last_name }}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Bouton d'envoi -->
            <button
              type="submit"
              class="w-full py-2.5 px-4 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="isSubmittingQuestion || questionSuccess"
            >
              <font-awesome-icon
                v-if="isSubmittingQuestion"
                :icon="['fas', 'spinner']"
                class="animate-spin"
              />
              <span class="text-sm">{{ isSubmittingQuestion ? t('activity.questionsPanel.questionForm.submitting') : t('activity.questionsPanel.questionForm.submit') }}</span>
            </button>
          </form>
        </div>
      </Transition>

      <!-- Liste des questions -->
      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <!-- Loading -->
        <div v-if="loadingQuestions" class="flex items-center justify-center py-12">
          <font-awesome-icon :icon="['fas', 'spinner']" class="w-8 h-8 text-blue-600 animate-spin" />
        </div>

        <!-- Aucune question -->
        <div v-else-if="filteredQuestions.length === 0" class="text-center py-12">
          <font-awesome-icon :icon="['fas', 'comments']" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p class="text-gray-500 dark:text-gray-400 font-medium">{{ t('activity.questionsPanel.noQuestions') }}</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">{{ t('activity.questionsPanel.beTheFirst') }}</p>
        </div>

        <!-- Liste des questions -->
        <div v-else class="space-y-4">
          <div
            v-for="question in filteredQuestions"
            :key="question.id"
            class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <!-- En-tête de la question -->
            <div class="flex items-start gap-3 mb-3">
              <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                {{ (question.users?.first_name?.[0] || '?').toUpperCase() }}{{ (question.users?.last_name?.[0] || '').toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ question.user_id === authStore.user?.id ? t('activity.questionsPanel.questionItem.you') : `${question.users?.first_name || ''} ${question.users?.last_name || ''}`.trim() }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatQuestionDate(question.created_at) }}
                  </span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ t('activity.questionsPanel.questionItem.askedTo') }}: {{ getTargetSpeakersNames(question.target_speakers) }}
                </div>
              </div>
            </div>

            <!-- Question en mode édition -->
            <div v-if="editingQuestionId === question.id" class="mb-3 pl-13 space-y-3">
              <div>
                <textarea
                  v-model="editQuestionText"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                ></textarea>
              </div>

              <!-- Sélection des intervenants pour l'édition -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activity.questionsPanel.questionForm.selectSpeakers') }}
                </label>
                <div class="space-y-1 max-h-32 overflow-y-auto">
                  <div
                    v-for="speaker in speakers.filter(s => s.is_available_for_questions)"
                    :key="speaker.id"
                    class="p-2 bg-gray-50 dark:bg-gray-700/50 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        :checked="editQuestionSpeakers.includes(speaker.id)"
                        @change="toggleEditSpeaker(speaker.id)"
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                      >
                      <span class="text-sm text-gray-900 dark:text-white truncate">
                        {{ speaker.civility }} {{ speaker.first_name }} {{ speaker.last_name }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Boutons d'action pour l'édition -->
              <div class="flex gap-2">
                <button
                  @click="saveEditQuestion(question.id)"
                  class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <font-awesome-icon :icon="['fas', 'check']" class="w-3 h-3" />
                  {{ t('activity.questionsPanel.questionItem.save') }}
                </button>
                <button
                  @click="cancelEditQuestion"
                  class="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <font-awesome-icon :icon="['fas', 'times']" class="w-3 h-3" />
                  {{ t('activity.questionsPanel.questionItem.cancel') }}
                </button>
              </div>
            </div>

            <!-- Question en mode lecture -->
            <div v-else class="mb-3 pl-13">
              <div class="flex items-start justify-between gap-2">
                <p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap flex-1">{{ question.question }}</p>

                <!-- Menu trois points pour modifier/supprimer (seulement pour l'auteur et si pas encore répondu) -->
                <div
                  v-if="question.user_id === authStore.user?.id && (!question.answers || question.answers.length === 0)"
                  class="relative"
                >
                  <button
                    @click.stop="toggleQuestionMenu(question.id)"
                    class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
                  >
                    <font-awesome-icon :icon="['fas', 'ellipsis-v']" class="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </button>

                  <!-- Dropdown menu -->
                  <Transition name="dropdown">
                    <div
                      v-if="openMenuQuestionId === question.id"
                      class="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10"
                      @click.stop
                    >
                      <button
                        @click="startEditQuestion(question); openMenuQuestionId = null"
                        class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 rounded-t-lg cursor-pointer"
                      >
                        <font-awesome-icon :icon="['fas', 'edit']" class="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        {{ t('activity.questionsPanel.questionItem.edit') }}
                      </button>
                      <button
                        @click="deleteQuestion(question.id); openMenuQuestionId = null"
                        :disabled="deletingQuestionId === question.id"
                        class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 rounded-b-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <font-awesome-icon
                          :icon="['fas', deletingQuestionId === question.id ? 'spinner' : 'trash']"
                          :class="{ 'animate-spin': deletingQuestionId === question.id }"
                          class="w-3 h-3"
                        />
                        {{ t('activity.questionsPanel.questionItem.delete') }}
                      </button>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <!-- Réponses -->
            <div v-if="question.answers && question.answers.length > 0" class="pl-13 space-y-3">
              <div
                v-for="answer in question.answers"
                :key="answer.id"
                class="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-green-500"
              >
                <div class="flex items-center gap-2 mb-2">
                  <font-awesome-icon :icon="['fas', 'reply']" class="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span class="text-sm font-medium text-green-700 dark:text-green-400">
                    {{ answer.activity_speakers?.civility }} {{ answer.activity_speakers?.first_name }} {{ answer.activity_speakers?.last_name }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatQuestionDate(answer.created_at) }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ answer.answer }}</p>
              </div>
            </div>

            <!-- Pas de réponse -->
            <div v-else class="pl-13">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full">
                <font-awesome-icon :icon="['fas', 'clock']" class="w-3 h-3 text-orange-600 dark:text-orange-400" />
                <span class="text-xs text-orange-700 dark:text-orange-400">{{ t('activity.questionsPanel.questionItem.noAnswer') }}</span>
              </div>
            </div>

            <!-- Section réponse pour les speakers (tous les speakers peuvent répondre à toutes les questions) -->
            <div v-if="canAnswerQuestions" class="pl-13 mt-3">
              <!-- Formulaire de réponse -->
              <div v-if="answeringQuestionId === question.id" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {{ t('activity.questionsPanel.answerForm.label') }}
                </label>
                <textarea
                  v-model="answerText"
                  :placeholder="t('activity.questionsPanel.answerForm.placeholder')"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-sm"
                  :disabled="isSubmittingAnswer"
                ></textarea>
                <div class="flex gap-2 mt-3">
                  <button
                    @click="submitAnswer(question.id)"
                    :disabled="isSubmittingAnswer"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <font-awesome-icon
                      v-if="isSubmittingAnswer"
                      :icon="['fas', 'spinner']"
                      class="animate-spin"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'paper-plane']" />
                    {{ t('activity.questionsPanel.answerForm.submit') }}
                  </button>
                  <button
                    @click="cancelAnswer"
                    :disabled="isSubmittingAnswer"
                    class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ t('activity.questionsPanel.answerForm.cancel') }}
                  </button>
                </div>
              </div>

              <!-- Bouton Répondre -->
              <button
                v-else
                @click="startAnswering(question.id)"
                class="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm rounded-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <font-awesome-icon :icon="['fas', 'reply']" />
                {{ t('activity.questionsPanel.answerForm.reply') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@vueuse/head'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'
import { useCountdown } from '@/composables/useCountdown'
import CommentFloatingButtonUser from '@/components/CommentFloatingButtonUser.vue'
import { getYoutubeEmbedUrl } from '@/utils/youtube'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const supabase = useSupabase()
const authStore = useAuthStore()

// État
const activity = ref(null)
const event = ref(null)
const organization = ref(null)
const organizationCountry = ref(null)
const speakers = ref([])
const documents = ref([])
const activityCountry = ref(null)
const isRegistered = ref(false)
const loading = ref(true)
const isDescriptionExpanded = ref(false)
const descriptionContainer = ref(null)
const shouldShowToggleButton = ref(false)
const incidentMessages = ref([])

// États pour le modal d'erreur
const showErrorModal = ref(false)
const errorModal = ref({
  title: '',
  message: ''
})

// États pour l'inscription
const isRegistering = ref(false)
const showRegistrationModal = ref(false)
const registrationModal = ref({
  type: '', // 'success', 'error', 'already_registered'
  title: '',
  message: '',
  zoomJoinUrl: ''
})

// États pour l'inscription guest
const showGuestRegistrationModal = ref(false)
const guestRegistrationForm = ref({
  email: '',
  firstName: '',
  lastName: '',
  organization: '',
  countryId: null
})
const guestFormErrors = ref({})
const countries = ref([])

// États pour le panneau de questions
const showQuestionsPanel = ref(false)
const questions = ref([])
const loadingQuestions = ref(false)
const showQuestionForm = ref(false)
const currentFilter = ref('all') // all, answered, pending, myQuestions

const questionForm = ref({
  question: '',
  selectedSpeakers: []
})
const selectAllSpeakers = ref(false)
const isSubmittingQuestion = ref(false)
const questionSuccess = ref(false)
const questionError = ref('')

// États pour l'édition et la suppression de questions
const editingQuestionId = ref(null)
const editQuestionText = ref('')
const editQuestionSpeakers = ref([])
const deletingQuestionId = ref(null)
const openMenuQuestionId = ref(null) // Pour gérer le menu dropdown

// État pour identifier si l'utilisateur est un speaker
const currentUserIsSpeaker = ref(false)
const currentUserSpeakerId = ref(null)

// États pour répondre aux questions (pour les speakers)
const answeringQuestionId = ref(null)
const answerText = ref('')
const isSubmittingAnswer = ref(false)

// Compteurs de questions pour les speakers
const totalQuestionsCount = ref(0)
const questionsForMeCount = ref(0)

// Computed
// Dates à afficher (finales si disponibles, sinon proposées)
const displayStartDate = computed(() => {
  if (!activity.value) return null
  return activity.value.final_start_date || activity.value.proposed_start_date
})

const displayEndDate = computed(() => {
  if (!activity.value) return null
  return activity.value.final_end_date || activity.value.proposed_end_date
})

// Décompteur jusqu'au début de l'activité (uniquement final_start_date)
const { timeRemaining, formattedTime } = useCountdown(() => activity.value?.final_start_date)

const canRegister = computed(() => {
  // Permettre l'inscription même pour les utilisateurs non connectés (mode guest)
  if (isRegistered.value) return false
  if (!activity.value) return false

  // Vérifier si l'activité n'est pas passée
  const now = new Date()
  const endDate = displayEndDate.value
  if (endDate && new Date(endDate) < now) return false

  return activity.value.validation_status === 'approved'
})

const canAskQuestions = computed(() => {
  if (!authStore.user) return false
  if (!activity.value) return false
  if (!speakers.value || speakers.value.length === 0) return false

  // Si l'utilisateur est un speaker, il ne peut PAS poser de questions
  if (currentUserIsSpeaker.value) return false

  // Vérifier si au moins un intervenant accepte les questions
  return speakers.value.some(s => s.is_available_for_questions)
})

const canAnswerQuestions = computed(() => {
  if (!authStore.user) return false
  if (!activity.value) return false

  // Seuls les speakers peuvent répondre
  return currentUserIsSpeaker.value
})

const canViewQuestions = computed(() => {
  if (!activity.value) return false
  if (!speakers.value || speakers.value.length === 0) return false

  // Les visiteurs non authentifiés peuvent voir les questions
  // Les speakers peuvent toujours voir les questions
  // Les autres utilisateurs peuvent voir si au moins un speaker accepte les questions
  if (!authStore.user) {
    return speakers.value.some(s => s.is_available_for_questions)
  }

  if (currentUserIsSpeaker.value) return true

  return speakers.value.some(s => s.is_available_for_questions)
})

// Filtrage des questions
const filteredQuestions = computed(() => {
  if (!questions.value || questions.value.length === 0) return []

  let filtered = [...questions.value]

  // Appliquer les filtres
  switch (currentFilter.value) {
    case 'answered':
      filtered = filtered.filter(q => q.is_answered)
      break
    case 'pending':
      filtered = filtered.filter(q => !q.is_answered)
      break
    case 'myQuestions':
      filtered = filtered.filter(q => q.user_id === authStore.user?.id)
      break
    // 'all' ne nécessite pas de filtre
  }

  // Trier par date de création (plus récentes en premier)
  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// Messages d'incidents
const hasIncident = computed(() => {
  return incidentMessages.value && incidentMessages.value.length > 0
})

const incidentMessage = computed(() => {
  if (!hasIncident.value) return null
  // Retourner le message dans la langue actuelle
  const message = incidentMessages.value[0]
  return locale.value === 'fr' ? message.message_fr : message.message_en
})

const incidentSeverity = computed(() => {
  if (!hasIncident.value) return null
  return incidentMessages.value[0].severity
})

// Logique pour déterminer le message à afficher quand l'activité est "expirée"
const activityStatusMessage = computed(() => {
  if (!timeRemaining.value || !timeRemaining.value.isExpired) {
    return null
  }

  // Si un incident technique est déclaré ET qu'il n'y a pas de lien YouTube
  if (hasIncident.value && !activity.value?.youtube_link) {
    return {
      type: 'incident',
      message: incidentMessage.value,
      severity: incidentSeverity.value,
      icon: 'exclamation-triangle'
    }
  }

  // Si pas d'incident ET pas de lien YouTube ET l'heure est dépassée
  if (!hasIncident.value && !activity.value?.youtube_link) {
    return {
      type: 'delayed',
      message: t('activity.delayed'),
      severity: 'warning',
      icon: 'clock'
    }
  }

  // Sinon, message normal "L'activité a commencé"
  return {
    type: 'started',
    message: t('activity.countdown.started'),
    severity: 'info',
    icon: 'play-circle'
  }
})

// Fonction pour vérifier si le contenu dépasse 300px de hauteur
const checkContentHeight = async () => {
  if (!descriptionContainer.value || !activity.value?.detailed_presentation) {
    shouldShowToggleButton.value = false
    return
  }

  await nextTick()

  // Créer un élément temporaire pour mesurer la hauteur complète
  const tempElement = document.createElement('div')
  tempElement.innerHTML = activity.value.detailed_presentation
  tempElement.style.cssText = `
    position: absolute;
    visibility: hidden;
    width: ${descriptionContainer.value.offsetWidth}px;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    white-space: pre-wrap;
  `

  document.body.appendChild(tempElement)
  const fullHeight = tempElement.offsetHeight
  document.body.removeChild(tempElement)

  shouldShowToggleButton.value = fullHeight > 300
}

// Fonction pour basculer l'affichage de la description
const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value
}

// Méthodes
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(t('common.locale'), {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Fonction pour formater une date avec le jour de la semaine
const formatDateWithDay = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(t('common.locale'), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Fonction pour obtenir la ville principale d'un fuseau horaire
const getCityFromTimezone = (timezone) => {
  if (!timezone) return ''
  // Extraire la ville du fuseau horaire (ex: "America/Belem" -> "Bélem")
  const parts = timezone.split('/')
  const city = parts[parts.length - 1].replace(/_/g, ' ')
  return city
}

// Fonction pour obtenir le décalage GMT d'un fuseau horaire
const getGMTOffset = (timezone) => {
  if (!timezone) return ''

  try {
    const date = new Date()

    // Obtenir le décalage en minutes
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60)
    const offsetHours = offsetMinutes / 60

    // Formatage simple : "GMT+3" ou "GMT-3"
    if (offsetHours === 0) {
      return 'GMT'
    }

    // Si c'est un nombre entier d'heures
    if (Number.isInteger(offsetHours)) {
      return `GMT${offsetHours > 0 ? '+' : ''}${offsetHours}`
    }

    // Si il y a des minutes (ex: GMT+5:30 pour l'Inde)
    const hours = Math.floor(Math.abs(offsetHours))
    const minutes = Math.abs(offsetMinutes) % 60
    const sign = offsetHours > 0 ? '+' : '-'
    return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`
  } catch (error) {
    console.error('Error calculating GMT offset:', error)
    return 'GMT'
  }
}

// Fonction pour formater une date avec les deux fuseaux horaires
const formatDateWithTimezone = (dateString, eventTimezone) => {
  if (!dateString || !eventTimezone) return { eventTime: '', userTime: '', showUserTime: false }

  const date = new Date(dateString)
  const locale = t('common.locale')

  // Format pour l'événement
  const eventTimeStr = new Intl.DateTimeFormat(locale, {
    timeZone: eventTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)

  // Fuseau horaire de l'utilisateur
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Format pour l'utilisateur
  const userTimeStr = new Intl.DateTimeFormat(locale, {
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

// Fonction pour obtenir le nom court du fuseau horaire
const getTimezoneAbbreviation = (timezone) => {
  if (!timezone) return ''

  // Obtenir l'abréviation du fuseau horaire
  const date = new Date()
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'short'
  })

  const parts = formatter.formatToParts(date)
  const tzPart = parts.find(part => part.type === 'timeZoneName')
  return tzPart ? tzPart.value : timezone
}

const getInitials = (speaker) => {
  if (!speaker) return '?'
  const firstInitial = speaker.first_name ? speaker.first_name[0].toUpperCase() : ''
  const lastInitial = speaker.last_name ? speaker.last_name[0].toUpperCase() : ''
  return firstInitial + lastInitial || '?'
}

const getBannerUrl = () => {
  // Priorité : bannière de l'événement parent
  if (event.value?.banner_high_quality_32_9_url) return event.value.banner_high_quality_32_9_url
  if (event.value?.banner_low_quality_32_9_url) return event.value.banner_low_quality_32_9_url

  // Sinon bannière de l'activité
  if (activity.value?.banner_url) return activity.value.banner_url

  // Par défaut (version réduite plus légère)
  return '/images/example/event_banniere_par_defaut_16_9_reduit.jpg'
}

const getActivityPosterUrl = () => {
  // Priorité : poster de l'activité (basse qualité d'abord pour les meta tags - plus légère)
  if (activity.value?.cover_image_low_url) return activity.value.cover_image_low_url
  if (activity.value?.cover_image_high_url) return activity.value.cover_image_high_url

  // Image par défaut réduite (plus légère)
  return '/images/example/event_banniere_par_defaut_16_9_reduit.jpg'
}

const loadActivity = async () => {
  try {
    loading.value = true

    // D'abord vérifier si l'activité existe
    const { data: activityCheck, error: checkError } = await supabase
      .from('activities')
      .select('id, validation_status')
      .eq('id', route.params.id)
      .single()

    if (checkError) {
      // L'activité n'existe pas
      showError('activity.error.notFound.title', 'activity.error.notFound.message')
      return
    }

    // Vérifier si l'activité est approuvée
    if (activityCheck.validation_status !== 'approved') {
      let errorKey = 'activity.error.notApproved'
      if (activityCheck.validation_status === 'pending') {
        errorKey = 'activity.error.pending'
      } else if (activityCheck.validation_status === 'rejected') {
        errorKey = 'activity.error.rejected'
      }
      showError(`${errorKey}.title`, `${errorKey}.message`)
      return
    }

    // Charger l'activité avec toutes les relations (seulement si approuvée)
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select(`
        *,
        events!inner (
          id,
          title,
          year,
          city,
          country_id,
          logo_url,
          banner_high_quality_32_9_url,
          banner_low_quality_32_9_url,
          timezone
        ),
        organizations!inner (
          id,
          name,
          logo_url,
          country_id
        ),
        countries (
          id,
          name_fr,
          name_en
        )
      `)
      .eq('id', route.params.id)
      .eq('validation_status', 'approved')
      .single()

    if (activityError) throw activityError

    activity.value = activityData

    // Extraire les relations
    if (activityData.events) {
      event.value = activityData.events
    }

    if (activityData.organizations) {
      organization.value = activityData.organizations

      // Charger le pays de l'organisation avec son drapeau
      if (activityData.organizations.country_id) {
        const { data: orgCountryData } = await supabase
          .from('countries')
          .select('id, name_fr, name_en, flag_emoji, flag_svg_url, code')
          .eq('id', activityData.organizations.country_id)
          .single()

        if (orgCountryData) {
          organizationCountry.value = orgCountryData
        }
      }
    }

    if (activityData.countries) {
      activityCountry.value = activityData.countries
    }

    // Charger les intervenants
    const { data: speakersData, error: speakersError } = await supabase
      .from('activity_speakers')
      .select('*')
      .eq('activity_id', route.params.id)
      .order('created_at')

    if (!speakersError && speakersData) {
      // Pour TOUS les speakers, chercher un utilisateur avec le même email
      const enrichedSpeakers = await Promise.all(
        speakersData.map(async (speaker) => {
          // Si le speaker a un email, chercher un utilisateur correspondant
          if (speaker.email) {
            // Chercher un utilisateur avec le même email et qui a confirmé son inscription
            const { data: userData } = await supabase
              .from('users')
              .select('id, email, first_name, last_name, profile_photo_url, profile_photo_thumbnail_url, email_confirmed')
              .eq('email', speaker.email)
              .eq('email_confirmed', true)
              .single()

            // Si un utilisateur est trouvé, enrichir les données du speaker
            if (userData) {
              return {
                ...speaker,
                user_data: userData,
                // Utiliser la photo de l'utilisateur si la photo du speaker n'est pas renseignée
                photo_url: speaker.photo_url || userData.profile_photo_url,
                photo_thumbnail_url: speaker.photo_thumbnail_url || userData.profile_photo_thumbnail_url
              }
            }
          }

          return speaker
        })
      )

      speakers.value = enrichedSpeakers

      // Vérifier si l'utilisateur connecté est un speaker
      if (authStore.user) {
        const userSpeaker = enrichedSpeakers.find(s =>
          s.user_data?.id === authStore.user.id ||
          (s.email && s.email.toLowerCase() === authStore.user.email?.toLowerCase())
        )
        if (userSpeaker) {
          currentUserIsSpeaker.value = true
          currentUserSpeakerId.value = userSpeaker.id

          // Charger les compteurs de questions pour les speakers
          await loadQuestionsCounts()
        }
      }
    }

    // Charger les documents
    const { data: docsData, error: docsError } = await supabase
      .from('activity_documents')
      .select('*')
      .eq('activity_id', route.params.id)
      .order('uploaded_at')

    if (!docsError && docsData) {
      documents.value = docsData
    }

    // Vérifier si l'utilisateur est inscrit
    if (authStore.user) {
      const { data: regData } = await supabase
        .from('activity_registrations')
        .select('id')
        .eq('activity_id', route.params.id)
        .eq('user_id', authStore.user.id)
        .single()

      isRegistered.value = !!regData
    }

    // Vérifier la hauteur du contenu après le chargement
    await checkContentHeight()

    // Incrémenter le compteur de vues
    await incrementViewCount()

    // Charger les messages d'incidents
    await loadIncidentMessages()

  } catch (error) {
    console.error('Error loading activity:', error)
    // Erreur générique de chargement
    showError('activity.error.generic.title', 'activity.error.generic.message')
  } finally {
    loading.value = false
  }
}

// Fonction pour incrémenter le compteur de vues
const incrementViewCount = async () => {
  try {
    if (!activity.value?.id) return

    // Utiliser la fonction RPC pour une incrémentation atomique
    const { error } = await supabase
      .rpc('increment_activity_view_count', {
        activity_uuid: activity.value.id
      })

    if (error) {
      console.error('Error incrementing view count:', error)
    }
  } catch (error) {
    console.error('Error in incrementViewCount:', error)
    // Ne pas bloquer l'affichage si l'incrémentation échoue
  }
}

const registerToActivity = async () => {
  if (!activity.value) return

  // Si l'utilisateur n'est pas authentifié, afficher le modal d'inscription guest
  if (!authStore.user) {
    showGuestRegistrationModal.value = true
    return
  }

  try {
    isRegistering.value = true

    // Préparer les données pour l'inscription
    // Utiliser authStore.profile pour les données du profil utilisateur
    const registrationData = {
      activity_id: activity.value.id,
      guest_email: authStore.user.email,
      guest_first_name: authStore.profile?.first_name || '',
      guest_last_name: authStore.profile?.last_name || '',
      guest_organization: authStore.profile?.organization || '',
      guest_country_id: authStore.profile?.country_id || null
    }

    console.log('📝 Inscription à l\'activité:', registrationData)

    // Appeler la fonction edge pour l'inscription Zoom + Supabase
    const { data, error } = await supabase.functions.invoke('register-to-zoom-meeting', {
      body: registrationData
    })

    console.log('📩 Réponse de la fonction edge:', { data, error })

    // Gérer les erreurs HTTP
    if (error) {
      console.error('❌ Erreur lors de l\'inscription:', error)

      // Cas spécifique : déjà inscrit (code 409)
      if (error.message?.includes('Already registered') || error.message?.includes('409')) {
        registrationModal.value = {
          type: 'already_registered',
          title: t('activity.registration.alreadyRegistered.title'),
          message: t('activity.registration.alreadyRegistered.message'),
          zoomJoinUrl: data?.data?.zoom_join_url || ''
        }
        showRegistrationModal.value = true
        return
      }

      // Autres erreurs
      registrationModal.value = {
        type: 'error',
        title: t('activity.registration.error.title'),
        message: error.message || t('activity.registration.error.message'),
        zoomJoinUrl: ''
      }
      showRegistrationModal.value = true
      return
    }

    // Succès
    if (data?.success) {
      console.log('✅ Inscription réussie:', data.data)

      isRegistered.value = true

      registrationModal.value = {
        type: 'success',
        title: t('activity.registration.success.title'),
        message: t('activity.registration.success.message'),
        zoomJoinUrl: data.data?.zoom_join_url || ''
      }
      showRegistrationModal.value = true
    } else {
      // Réponse inattendue
      throw new Error('Réponse inattendue de la fonction edge')
    }

  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'inscription:', error)
    registrationModal.value = {
      type: 'error',
      title: t('activity.registration.error.title'),
      message: t('activity.registration.error.message'),
      zoomJoinUrl: ''
    }
    showRegistrationModal.value = true
  } finally {
    isRegistering.value = false
  }
}

const closeRegistrationModal = () => {
  showRegistrationModal.value = false
}

// Fonctions pour l'inscription guest
const registerAsGuest = async () => {
  // Validation
  guestFormErrors.value = {}

  if (!guestRegistrationForm.value.email) {
    guestFormErrors.value.email = t('activity.guestRegistration.errors.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestRegistrationForm.value.email)) {
    guestFormErrors.value.email = t('activity.guestRegistration.errors.emailInvalid')
  }

  if (!guestRegistrationForm.value.firstName || guestRegistrationForm.value.firstName.length < 2) {
    guestFormErrors.value.firstName = t('activity.guestRegistration.errors.firstNameRequired')
  }

  if (!guestRegistrationForm.value.lastName || guestRegistrationForm.value.lastName.length < 2) {
    guestFormErrors.value.lastName = t('activity.guestRegistration.errors.lastNameRequired')
  }

  if (Object.keys(guestFormErrors.value).length > 0) {
    return
  }

  try {
    isRegistering.value = true

    // Préparer les données pour l'inscription guest
    const registrationData = {
      activity_id: activity.value.id,
      guest_email: guestRegistrationForm.value.email,
      guest_first_name: guestRegistrationForm.value.firstName,
      guest_last_name: guestRegistrationForm.value.lastName,
      guest_organization: guestRegistrationForm.value.organization || '',
      guest_country_id: guestRegistrationForm.value.countryId || null
    }

    console.log('📝 Inscription guest à l\'activité:', registrationData)

    // Appeler la fonction edge pour l'inscription Zoom + Supabase
    const { data, error } = await supabase.functions.invoke('register-to-zoom-meeting', {
      body: registrationData
    })

    console.log('📩 Réponse de la fonction edge:', { data, error })

    // Fermer le modal guest
    showGuestRegistrationModal.value = false

    // Gérer les erreurs HTTP
    if (error) {
      console.error('❌ Erreur lors de l\'inscription:', error)

      // Cas spécifique : déjà inscrit (code 409)
      if (error.message?.includes('Already registered') || error.message?.includes('409')) {
        registrationModal.value = {
          type: 'already_registered',
          title: t('activity.registration.alreadyRegistered.title'),
          message: t('activity.registration.alreadyRegistered.message'),
          zoomJoinUrl: data?.data?.zoom_join_url || ''
        }
        showRegistrationModal.value = true
        return
      }

      // Autres erreurs
      registrationModal.value = {
        type: 'error',
        title: t('activity.registration.error.title'),
        message: error.message || t('activity.registration.error.message'),
        zoomJoinUrl: ''
      }
      showRegistrationModal.value = true
      return
    }

    // Succès
    if (data?.success) {
      console.log('✅ Inscription guest réussie:', data.data)

      registrationModal.value = {
        type: 'success',
        title: t('activity.registration.success.title'),
        message: t('activity.registration.success.message'),
        zoomJoinUrl: data.data?.zoom_join_url || ''
      }
      showRegistrationModal.value = true

      // Réinitialiser le formulaire
      guestRegistrationForm.value = {
        email: '',
        firstName: '',
        lastName: '',
        organization: '',
        countryId: null
      }
    } else {
      // Réponse inattendue
      throw new Error('Réponse inattendue de la fonction edge')
    }

  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'inscription:', error)
    registrationModal.value = {
      type: 'error',
      title: t('activity.registration.error.title'),
      message: t('activity.registration.error.message'),
      zoomJoinUrl: ''
    }
    showRegistrationModal.value = true
  } finally {
    isRegistering.value = false
  }
}

const closeGuestRegistrationModal = () => {
  showGuestRegistrationModal.value = false
  guestFormErrors.value = {}
}

// Charger les messages d'incidents pour cette activité
const loadIncidentMessages = async () => {
  if (!activity.value || !event.value) return

  try {
    const activityStartDate = activity.value.final_start_date || activity.value.proposed_start_date
    const activityDay = activityStartDate ? activityStartDate.split('T')[0] : null

    const { data, error } = await supabase
      .from('incident_messages')
      .select(`
        *,
        organization:organizations(id, name, acronym)
      `)
      .eq('event_id', event.value.id)
      .eq('is_active', true)
      .or(`organization_id.eq.${organization.value?.id},organization_id.is.null`)
      .or(`day_date.eq.${activityDay},day_date.is.null`)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Filtrer les messages pertinents côté client
    const relevantMessages = (data || []).filter(msg => {
      // Message général (pas d'org ni de date)
      if (!msg.organization_id && !msg.day_date) return true

      // Message pour cette organisation spécifique
      if (msg.organization_id === organization.value?.id && !msg.day_date) return true

      // Message pour ce jour spécifique
      if (!msg.organization_id && msg.day_date === activityDay) return true

      // Message pour cette organisation ET ce jour
      if (msg.organization_id === organization.value?.id && msg.day_date === activityDay) return true

      return false
    })

    incidentMessages.value = relevantMessages
  } catch (error) {
    console.error('Error loading incident messages:', error)
    incidentMessages.value = []
  }
}

const loadCountries = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name_fr, name_en')
      .order('name_fr')

    if (!error && data) {
      countries.value = data
    }
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

// Fonction pour charger uniquement les compteurs de questions (pour les speakers)
const loadQuestionsCounts = async () => {
  if (!activity.value || !currentUserIsSpeaker.value || !currentUserSpeakerId.value) return

  try {
    // Charger uniquement le nombre total de questions
    const { count: totalCount, error: totalError } = await supabase
      .from('activity_questions')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', activity.value.id)
      .eq('is_visible', true)
      .eq('is_disabled', false)

    if (!totalError && totalCount !== null) {
      totalQuestionsCount.value = totalCount
    }

    // Charger le nombre de questions qui me sont adressées
    const { data: myQuestionsData, error: myQuestionsError } = await supabase
      .from('activity_questions')
      .select('target_speakers')
      .eq('activity_id', activity.value.id)
      .eq('is_visible', true)
      .eq('is_disabled', false)

    if (!myQuestionsError && myQuestionsData) {
      questionsForMeCount.value = myQuestionsData.filter(q =>
        q.target_speakers && q.target_speakers.includes(currentUserSpeakerId.value)
      ).length
    }
  } catch (error) {
    console.error('Error loading questions counts:', error)
  }
}

// Fonctions pour le panneau de questions
const openQuestionsPanel = async () => {
  showQuestionsPanel.value = true
  await loadQuestions()
}

const closeQuestionsPanel = () => {
  showQuestionsPanel.value = false
  showQuestionForm.value = false
}

const loadQuestions = async () => {
  if (!activity.value) return

  try {
    loadingQuestions.value = true

    // Charger les questions avec les informations sur les utilisateurs
    const { data: questionsData, error: questionsError } = await supabase
      .from('activity_questions')
      .select(`
        *,
        users!activity_questions_user_id_fkey (
          id,
          first_name,
          last_name,
          profile_photo_thumbnail_url,
          profile_photo_url
        )
      `)
      .eq('activity_id', activity.value.id)
      .eq('is_visible', true)
      .eq('is_disabled', false)
      .order('created_at', { ascending: false })

    if (questionsError) throw questionsError

    // Pour chaque question, charger les réponses
    if (questionsData && questionsData.length > 0) {
      const questionsWithAnswers = await Promise.all(
        questionsData.map(async (question) => {
          const { data: answersData } = await supabase
            .from('activity_question_answers')
            .select(`
              *,
              activity_speakers (
                id,
                first_name,
                last_name,
                civility,
                position,
                photo_thumbnail_url,
                photo_url
              )
            `)
            .eq('question_id', question.id)
            .order('created_at', { ascending: true })

          return {
            ...question,
            answers: answersData || []
          }
        })
      )

      questions.value = questionsWithAnswers

      // Calculer les compteurs pour les speakers
      if (currentUserIsSpeaker.value && currentUserSpeakerId.value) {
        totalQuestionsCount.value = questionsWithAnswers.length
        questionsForMeCount.value = questionsWithAnswers.filter(q =>
          q.target_speakers && q.target_speakers.includes(currentUserSpeakerId.value)
        ).length
      }
    } else {
      questions.value = []
      totalQuestionsCount.value = 0
      questionsForMeCount.value = 0
    }

  } catch (error) {
    console.error('Error loading questions:', error)
  } finally {
    loadingQuestions.value = false
  }
}

const toggleQuestionForm = () => {
  showQuestionForm.value = !showQuestionForm.value
  if (showQuestionForm.value) {
    // Réinitialiser le formulaire
    questionForm.value = {
      question: '',
      selectedSpeakers: []
    }
    selectAllSpeakers.value = false
    questionSuccess.value = false
    questionError.value = ''
  }
}

const toggleAllSpeakers = () => {
  if (selectAllSpeakers.value) {
    questionForm.value.selectedSpeakers = speakers.value
      .filter(s => s.is_available_for_questions)
      .map(s => s.id)
  } else {
    questionForm.value.selectedSpeakers = []
  }
}

const toggleSpeaker = (speakerId) => {
  const index = questionForm.value.selectedSpeakers.indexOf(speakerId)
  if (index > -1) {
    questionForm.value.selectedSpeakers.splice(index, 1)
  } else {
    questionForm.value.selectedSpeakers.push(speakerId)
  }

  // Mettre à jour selectAllSpeakers
  const availableSpeakers = speakers.value.filter(s => s.is_available_for_questions)
  selectAllSpeakers.value = questionForm.value.selectedSpeakers.length === availableSpeakers.length
}

const submitQuestion = async () => {
  // Validation
  questionError.value = ''

  if (!questionForm.value.question.trim()) {
    questionError.value = t('activity.questionsPanel.questionForm.questionRequired')
    return
  }

  if (questionForm.value.selectedSpeakers.length === 0) {
    questionError.value = t('activity.questionsPanel.questionForm.speakersRequired')
    return
  }

  try {
    isSubmittingQuestion.value = true

    const { error } = await supabase
      .from('activity_questions')
      .insert({
        activity_id: activity.value.id,
        user_id: authStore.user.id,
        question: questionForm.value.question.trim(),
        target_speakers: questionForm.value.selectedSpeakers
      })

    if (error) throw error

    // Succès
    questionSuccess.value = true

    // Recharger les questions et fermer le formulaire après 1.5 secondes
    setTimeout(async () => {
      await loadQuestions()
      showQuestionForm.value = false
      questionSuccess.value = false
      questionForm.value = {
        question: '',
        selectedSpeakers: []
      }
    }, 1500)

  } catch (error) {
    console.error('Error submitting question:', error)
    questionError.value = t('activity.questionsPanel.questionForm.error')
  } finally {
    isSubmittingQuestion.value = false
  }
}

// Fonction utilitaire pour formater la date des questions/réponses
const formatQuestionDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(t('common.locale'), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fonction pour obtenir les noms des intervenants ciblés
const getTargetSpeakersNames = (targetSpeakersIds) => {
  if (!targetSpeakersIds || targetSpeakersIds.length === 0) return ''

  const targetSpeakers = speakers.value.filter(s => targetSpeakersIds.includes(s.id))
  return targetSpeakers.map(s => `${s.civility || ''} ${s.first_name} ${s.last_name}`.trim()).join(', ')
}

// Fonctions pour modifier/supprimer les questions
const startEditQuestion = (question) => {
  editingQuestionId.value = question.id
  editQuestionText.value = question.question
  editQuestionSpeakers.value = [...question.target_speakers]
}

const cancelEditQuestion = () => {
  editingQuestionId.value = null
  editQuestionText.value = ''
  editQuestionSpeakers.value = []
}

const saveEditQuestion = async (questionId) => {
  if (!editQuestionText.value.trim()) {
    questionError.value = t('activity.questionsPanel.questionForm.questionRequired')
    return
  }

  if (editQuestionSpeakers.value.length === 0) {
    questionError.value = t('activity.questionsPanel.questionForm.speakersRequired')
    return
  }

  try {
    const { error } = await supabase
      .from('activity_questions')
      .update({
        question: editQuestionText.value.trim(),
        target_speakers: editQuestionSpeakers.value,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)

    if (error) throw error

    // Recharger les questions
    await loadQuestions()

    // Réinitialiser l'édition
    cancelEditQuestion()

  } catch (error) {
    console.error('Error updating question:', error)
    questionError.value = t('activity.questionsPanel.questionItem.updateError')
  }
}

const deleteQuestion = async (questionId) => {
  if (!confirm(t('activity.questionsPanel.questionItem.confirmDelete'))) {
    return
  }

  try {
    deletingQuestionId.value = questionId

    const { error } = await supabase
      .from('activity_questions')
      .delete()
      .eq('id', questionId)

    if (error) throw error

    // Recharger les questions
    await loadQuestions()

  } catch (error) {
    console.error('Error deleting question:', error)
    questionError.value = t('activity.questionsPanel.questionItem.deleteError')
  } finally {
    deletingQuestionId.value = null
  }
}

const toggleEditSpeaker = (speakerId) => {
  const index = editQuestionSpeakers.value.indexOf(speakerId)
  if (index > -1) {
    editQuestionSpeakers.value.splice(index, 1)
  } else {
    editQuestionSpeakers.value.push(speakerId)
  }
}

// Fonction pour gérer le menu dropdown des questions
const toggleQuestionMenu = (questionId) => {
  if (openMenuQuestionId.value === questionId) {
    openMenuQuestionId.value = null
  } else {
    openMenuQuestionId.value = questionId
  }
}

// Fermer le menu si on clique ailleurs
const closeQuestionMenu = () => {
  openMenuQuestionId.value = null
}

// Fonctions pour répondre aux questions (pour les speakers)
const startAnswering = (questionId) => {
  answeringQuestionId.value = questionId
  answerText.value = ''
}

const cancelAnswer = () => {
  answeringQuestionId.value = null
  answerText.value = ''
}

const submitAnswer = async (questionId) => {
  if (!answerText.value.trim()) {
    questionError.value = t('activity.questionsPanel.answerForm.answerRequired')
    return
  }

  if (!currentUserSpeakerId.value) {
    questionError.value = 'Erreur: Identifiant du speaker non trouvé'
    return
  }

  try {
    isSubmittingAnswer.value = true
    questionError.value = ''

    // Insérer la réponse
    const { error: insertError } = await supabase
      .from('activity_question_answers')
      .insert({
        question_id: questionId,
        speaker_id: currentUserSpeakerId.value,
        answer: answerText.value.trim()
      })

    if (insertError) throw insertError

    // Marquer la question comme répondue
    const { error: updateError } = await supabase
      .from('activity_questions')
      .update({
        is_answered: true,
        answered_at: new Date().toISOString()
      })
      .eq('id', questionId)

    if (updateError) throw updateError

    // Recharger les questions
    await loadQuestions()

    // Réinitialiser le formulaire
    cancelAnswer()

  } catch (error) {
    console.error('Error submitting answer:', error)
    questionError.value = t('activity.questionsPanel.answerForm.error')
  } finally {
    isSubmittingAnswer.value = false
  }
}

// Fonctions pour gérer le modal d'erreur
const showError = (titleKey, messageKey) => {
  errorModal.value = {
    title: titleKey,
    message: messageKey
  }
  showErrorModal.value = true
}

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/')
}

// Helper function pour extraire du texte depuis HTML
const stripHtml = (html) => {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Meta tags dynamiques pour le SEO
const siteUrl = computed(() => window.location.origin)
const pageUrl = computed(() => `${siteUrl.value}${route.fullPath}`)

const metaDescription = computed(() => {
  if (!activity.value) return t('activity.metaDescription')
  const desc = stripHtml(activity.value.description || activity.value.detailed_presentation || '')
  return desc.substring(0, 160) + (desc.length > 160 ? '...' : '')
})

const metaTitle = computed(() => {
  if (!activity.value) return t('activity.title')
  return `${activity.value.title} - ${event.value?.title || ''} ${event.value?.year || ''}`
})

const activityImageUrl = computed(() => {
  const posterUrl = getActivityPosterUrl()

  // Si l'URL est déjà absolue (commence par http:// ou https://), la retourner telle quelle
  if (posterUrl.startsWith('http://') || posterUrl.startsWith('https://')) {
    return posterUrl
  }

  // Sinon, construire une URL absolue
  return `${siteUrl.value}${posterUrl.startsWith('/') ? '' : '/'}${posterUrl}`
})

// Données structurées JSON-LD pour le SEO
const structuredData = computed(() => {
  if (!activity.value) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: activity.value.title,
    description: metaDescription.value,
    startDate: displayStartDate.value,
    endDate: displayEndDate.value,
    eventStatus: activity.value.validation_status === 'approved'
      ? 'https://schema.org/EventScheduled'
      : 'https://schema.org/EventPostponed',
    eventAttendanceMode: activity.value.format === 'in_person'
      ? 'https://schema.org/OfflineEventAttendanceMode'
      : activity.value.format === 'online'
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/MixedEventAttendanceMode',
    location: activity.value.format === 'online' || activity.value.format === 'hybrid'
      ? {
          '@type': 'VirtualLocation',
          url: activity.value.online_location_url || pageUrl.value
        }
      : {
          '@type': 'Place',
          name: activity.value.room || event.value?.city || '',
          address: {
            '@type': 'PostalAddress',
            addressLocality: event.value?.city || '',
            addressCountry: activityCountry.value?.name_en || event.value?.country || ''
          }
        },
    image: activityImageUrl.value,
    organizer: organization.value ? {
      '@type': 'Organization',
      name: organization.value.name,
      url: siteUrl.value
    } : {
      '@type': 'Organization',
      name: 'IFDD - Institut de la Francophonie pour le développement durable',
      url: 'https://www.ifdd.francophonie.org'
    },
    performer: speakers.value.map(speaker => ({
      '@type': 'Person',
      name: `${speaker.civility || ''} ${speaker.first_name} ${speaker.last_name}`.trim(),
      jobTitle: speaker.position,
      worksFor: {
        '@type': 'Organization',
        name: speaker.organization
      }
    })),
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'USD',
      availability: canRegister.value ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: pageUrl.value
    },
    inLanguage: activity.value.language || locale.value
  }
})

// Configuration des meta tags avec useHead
useHead({
  title: metaTitle,
  meta: [
    { name: 'description', content: metaDescription },
    { name: 'keywords', content: computed(() => {
      const tags = activity.value?.tags?.join(', ') || ''
      return `${activity.value?.title || ''}, ${organization.value?.name || ''}, ${event.value?.title || ''}, ${tags ? tags + ', ' : ''}climat, développement durable, francophonie, IFDD, Cdp`
    }) },

    // Open Graph
    { property: 'og:title', content: metaTitle },
    { property: 'og:description', content: metaDescription },
    { property: 'og:type', content: 'event' },
    { property: 'og:url', content: pageUrl },
    { property: 'og:image', content: activityImageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '675' },
    { property: 'og:site_name', content: 'e-Pavillon Climatique de la Francophonie' },
    { property: 'og:locale', content: computed(() => locale.value === 'fr' ? 'fr_FR' : 'en_US') },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: metaTitle },
    { name: 'twitter:description', content: metaDescription },
    { name: 'twitter:image', content: activityImageUrl },

    // Event-specific meta tags
    { property: 'event:start_date', content: computed(() => displayStartDate.value || '') },
    { property: 'event:end_date', content: computed(() => displayEndDate.value || '') },
    { property: 'event:location', content: computed(() => activity.value?.room || event.value?.city || '') },

    // Additional SEO
    { name: 'robots', content: 'index, follow' },
    { name: 'author', content: computed(() => organization.value?.name || 'IFDD') }
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

// Watcher pour mettre à jour les meta tags quand les données changent
watch([activity, event, organization, speakers, locale], () => {
  // Les meta tags seront automatiquement mis à jour grâce aux computed properties
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await loadActivity()
  await loadCountries() // Charger les pays pour le formulaire guest
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

/* Animations pour les bordures des cartes d'horaires */
@keyframes border-pulse {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.02);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
}

.animate-border-pulse {
  animation: border-pulse 3s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

/* Style pour l'effet de fade sur la description tronquée */
.description-fade::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, transparent, rgb(255 255 255 / 1));
  pointer-events: none;
}

.dark .description-fade::after {
  background: linear-gradient(to bottom, transparent, rgb(31 41 55 / 1));
}

/* Animations pour le modal backdrop */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

/* Animations pour le slide depuis la gauche */
.slide-from-left-enter-active,
.slide-from-left-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-from-left-enter-from {
  transform: translateX(-100%);
}

.slide-from-left-leave-to {
  transform: translateX(-100%);
}

/* Animations pour le slide down du formulaire */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 1000px;
  opacity: 1;
}

/* Animations pour le dropdown menu */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
