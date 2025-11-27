<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Image de fond -->
      <img src="/images/example/banner-chypre.jpg" alt="Chypre" class="absolute inset-0 w-full h-full object-cover">

      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/85 to-blue-900/90 dark:from-blue-900/95 dark:via-blue-950/90 dark:to-gray-900/95"></div>

      <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div class="text-center max-w-4xl mx-auto">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span class="text-white/90 text-sm font-medium">{{ t('cyprusSeminar.dates') }}</span>
          </div>

          <!-- Titre principal -->
          <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {{ t('cyprusSeminar.title') }}
          </h1>

          <!-- Sous-titre -->
          <p class="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            {{ t('cyprusSeminar.subtitle') }}
          </p>

          <!-- Informations clés -->
          <div class="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10">
            <div class="flex items-center gap-2 text-white/90">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm md:text-base font-medium">{{ t('cyprusSeminar.date') }}</span>
            </div>
            <div class="flex items-center gap-2 text-white/90">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-sm md:text-base font-medium">{{ t('cyprusSeminar.location') }}</span>
            </div>
            <div class="flex items-center gap-2 text-white/90">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="text-sm md:text-base font-medium">{{ t('cyprusSeminar.participants') }}</span>
            </div>
          </div>

          <!-- Bouton d'inscription -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://us06web.zoom.us/meeting/register/kF1ZvrOeRcuVIaGkBwc0jw"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-white cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 10H5V7h14v10zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-2v6l-2.5-2.5L13 14v-6l2.5 2.5L18 8z"/>
              </svg>
              <span>{{ t('cyprusSeminar.registerButton') }}</span>
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <nav class="flex items-center space-x-2 text-sm">
          <RouterLink to="/" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {{ t('common.home') }}
          </RouterLink>
          <span class="text-gray-400 dark:text-gray-500">/</span>
          <RouterLink to="/programmations" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {{ t('programmations.title') }}
          </RouterLink>
          <span class="text-gray-400 dark:text-gray-500">/</span>
          <span class="text-gray-900 dark:text-white font-medium">{{ t('cyprusSeminar.shortTitle') }}</span>
        </nav>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <!-- Sélecteur de jours avec vidéos YouTube -->
      <section class="mb-16">
        <div class="text-center mb-8">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {{ t('cyprusSeminar.liveStreamDay', { day: selectedDay }) }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('cyprusSeminar.liveStreamInfo') }}
          </p>
        </div>

        <!-- Tabs pour les 3 jours -->
        <div class="flex flex-wrap justify-center gap-3 mb-8">
          <button
            v-for="day in [1, 2, 3]"
            :key="day"
            @click="selectedDay = day"
            :class="[
              'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer',
              selectedDay === day
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            ]"
          >
            {{ t(`cyprusSeminar.day${day}.title`) }}
          </button>
        </div>

        <!-- Vidéo YouTube ou Décompte -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl overflow-hidden shadow border border-gray-200/50 dark:border-gray-700/50">
          <div class="flex items-center gap-3 px-6 py-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span class="text-gray-900 dark:text-white font-semibold">{{ isLiveNow ? 'En direct' : 'Bientôt en direct' }}</span>
          </div>

          <!-- Décompte compact -->
          <div v-if="!isLiveNow" class="relative bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-gray-900 p-8">
            <div class="text-center">
              <h3 class="text-xl md:text-2xl font-bold text-white mb-6">Le direct commence dans</h3>

              <!-- Compteur horizontal compact -->
              <div class="flex items-center justify-center gap-3 md:gap-6 mb-4">
                <div v-for="(unit, key) in timeRemaining" :key="key" class="flex flex-col items-center">
                  <div class="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 min-w-[60px] md:min-w-[80px] border border-white/20">
                    <div class="text-2xl md:text-3xl font-bold text-white tabular-nums">{{ String(unit.value).padStart(2, '0') }}</div>
                  </div>
                  <div class="text-white/70 text-xs mt-1.5 uppercase tracking-wide">{{ unit.label }}</div>
                </div>
              </div>

              <p class="text-white/60 text-sm">La diffusion commencera automatiquement</p>
            </div>
          </div>

          <!-- Container responsive pour l'iframe YouTube (16:9) -->
          <div v-else class="relative w-full bg-black" style="padding-bottom: 56.25%;">
            <iframe
              :key="selectedDay"
              class="absolute top-0 left-0 w-full h-full"
              :src="getYoutubeEmbedUrl(selectedDay)"
              :title="`Direct YouTube - ${t('cyprusSeminar.day' + selectedDay + '.title')}`"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </section>

      <!-- Contexte et justification -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('cyprusSeminar.contextTitle') }}
          </h2>
        </div>
        <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow border border-gray-200/50 dark:border-gray-700/50">
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
              {{ t('cyprusSeminar.context') }}
            </p>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {{ t('cyprusSeminar.context2') }}
            </p>
          </div>
        </div>
      </section>

      <!-- Objectifs -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('cyprusSeminar.objectivesTitle') }}
          </h2>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="index in [0, 1, 2, 3]" :key="index"
               class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span class="text-white font-bold text-lg">{{ index + 1 }}</span>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {{ t(`cyprusSeminar.objectives.${index}.title`) }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {{ t(`cyprusSeminar.objectives.${index}.description`) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Programme détaillé -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('cyprusSeminar.programTitle') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {{ t('cyprusSeminar.moderation') }} : <span class="font-semibold text-gray-900 dark:text-white">{{ t('cyprusSeminar.moderator') }}</span>
          </p>
        </div>

        <!-- Timeline verticale moderne -->
        <div class="relative">
          <!-- Ligne de temps verticale (cachée sur mobile) -->
          <div class="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-orange-500 via-green-500 to-blue-500 h-full rounded-full opacity-30"></div>

          <div class="space-y-16">
            <!-- JOUR 1 -->
            <div class="relative">
              <!-- Marqueur central -->
              <div class="hidden md:flex absolute left-1/2 transform -translate-x-1/2 -translate-y-3 items-center justify-center z-10">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-900">
                  <span class="text-white font-bold text-xl">1</span>
                </div>
              </div>

              <!-- Contenu du jour 1 -->
              <div class="md:grid md:grid-cols-2 md:gap-8 items-start">
                <!-- En-tête (mobile) / Gauche (desktop) -->
                <div class="md:text-right mb-6 md:mb-0 md:pr-12">
                  <div class="inline-flex md:flex md:flex-col items-center md:items-end gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div class="font-bold text-xl">{{ t('cyprusSeminar.day1.date') }}</div>
                      <div class="text-orange-100 text-sm">{{ t('cyprusSeminar.day1.title') }}</div>
                    </div>
                  </div>
                </div>

                <!-- Sessions (mobile et desktop à droite) -->
                <div class="md:pl-12 space-y-4">
                  <!-- Matinée -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-l-4 border-orange-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('cyprusSeminar.day1.morning.title') }}</h4>
                    </div>
                    <div class="space-y-3">
                      <div class="bg-orange-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ t('cyprusSeminar.day1.morning.opening.title') }}</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs">{{ t('cyprusSeminar.day1.morning.opening.organizers') }}</p>
                      </div>
                      <div class="bg-orange-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ t('cyprusSeminar.day1.morning.panel.title') }}</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-orange-600 dark:text-orange-400">{{ t('cyprusSeminar.speakersLabel') }}:</span> {{ t('cyprusSeminar.day1.morning.panel.speakers') }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Après-midi -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-l-4 border-orange-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('cyprusSeminar.day1.afternoon.title') }}</h4>
                    </div>
                    <div class="space-y-3">
                      <div class="bg-orange-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ t('cyprusSeminar.day1.afternoon.session1.title') }}</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-orange-600 dark:text-orange-400">{{ t('cyprusSeminar.speakerLabel') }}:</span> {{ t('cyprusSeminar.day1.afternoon.session1.speaker') }}</p>
                      </div>
                      <div class="bg-orange-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ t('cyprusSeminar.day1.afternoon.session2.title') }}</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-orange-600 dark:text-orange-400">{{ t('cyprusSeminar.speakersLabel') }}:</span> {{ t('cyprusSeminar.day1.afternoon.session2.speakers') }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Soirée -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-l-4 border-orange-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('cyprusSeminar.day1.evening.title') }}</h4>
                    </div>
                    <div class="bg-orange-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-800/30">
                      <p class="text-gray-600 dark:text-gray-400 text-sm">{{ t('cyprusSeminar.day1.evening.networking') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- JOUR 2 -->
            <div class="relative">
              <!-- Marqueur central -->
              <div class="hidden md:flex absolute left-1/2 transform -translate-x-1/2 -translate-y-3 items-center justify-center z-10">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-900">
                  <span class="text-white font-bold text-xl">2</span>
                </div>
              </div>

              <!-- Contenu du jour 2 (inversé sur desktop) -->
              <div class="md:grid md:grid-cols-2 md:gap-8 items-start">
                <!-- Sessions (à gauche sur desktop) -->
                <div class="md:order-1 md:pr-12 space-y-4 mb-6 md:mb-0">
                  <!-- Matinée culturelle -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-r-4 md:border-r-4 md:border-l-0 border-l-4 border-green-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('cyprusSeminar.day2.morning.title') }}</h4>
                    </div>
                    <div class="bg-green-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
                      <p class="text-gray-600 dark:text-gray-400 text-sm">• {{ t('cyprusSeminar.day2.morning.visit') }}</p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">• {{ t('cyprusSeminar.day2.morning.networking') }}</p>
                    </div>
                  </div>

                  <!-- Après-midi -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-r-4 md:border-r-4 md:border-l-0 border-l-4 border-green-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('cyprusSeminar.day2.afternoon.title') }}</h4>
                    </div>
                    <div class="space-y-3">
                      <div class="bg-green-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ t('cyprusSeminar.day2.afternoon.clinic.title') }}</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-green-600 dark:text-green-400">{{ t('cyprusSeminar.speakersLabel') }}:</span> {{ t('cyprusSeminar.day2.afternoon.clinic.speakers') }}</p>
                      </div>
                      <div class="bg-green-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ t('cyprusSeminar.day2.afternoon.hackathon.title') }}</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-green-600 dark:text-green-400">{{ t('cyprusSeminar.speakersLabel') }}:</span> {{ t('cyprusSeminar.day2.afternoon.hackathon.speakers') }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Soirée -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-r-4 md:border-r-4 md:border-l-0 border-l-4 border-green-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('cyprusSeminar.day2.evening.title') }}</h4>
                    </div>
                    <div class="space-y-3">
                      <div class="bg-green-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ t('cyprusSeminar.day2.evening.pitchSession.title') }}</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-green-600 dark:text-green-400">{{ t('cyprusSeminar.speakerLabel') }}:</span> {{ t('cyprusSeminar.day2.evening.pitchSession.speaker') }}</p>
                      </div>
                      <div class="bg-green-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ t('cyprusSeminar.day2.evening.testimony.title') }}</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-green-600 dark:text-green-400">{{ t('cyprusSeminar.speakerLabel') }}:</span> {{ t('cyprusSeminar.day2.evening.testimony.speaker') }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- En-tête (mobile en haut) / Droite (desktop) -->
                <div class="md:order-2 md:pl-12 mb-6 md:mb-0">
                  <div class="inline-flex md:flex md:flex-col items-center md:items-start gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div class="font-bold text-xl">{{ t('cyprusSeminar.day2.date') }}</div>
                      <div class="text-green-100 text-sm">{{ t('cyprusSeminar.day2.title') }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- JOUR 3 -->
            <div class="relative">
              <!-- Marqueur central -->
              <div class="hidden md:flex absolute left-1/2 transform -translate-x-1/2 -translate-y-3 items-center justify-center z-10">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-900">
                  <span class="text-white font-bold text-xl">3</span>
                </div>
              </div>

              <!-- Contenu du jour 3 -->
              <div class="md:grid md:grid-cols-2 md:gap-8 items-start">
                <!-- En-tête (mobile) / Gauche (desktop) -->
                <div class="md:text-right mb-6 md:mb-0 md:pr-12">
                  <div class="inline-flex md:flex md:flex-col items-center md:items-end gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div class="font-bold text-xl">{{ t('cyprusSeminar.day3.date') }}</div>
                      <div class="text-blue-100 text-sm">{{ t('cyprusSeminar.day3.title') }}</div>
                    </div>
                  </div>
                </div>

                <!-- Sessions (mobile et desktop à droite) -->
                <div class="md:pl-12 space-y-4">
                  <!-- Matin -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-l-4 border-blue-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('cyprusSeminar.day3.morning.title') }}</h4>
                    </div>
                    <div class="bg-blue-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-blue-200/30 dark:border-blue-800/30">
                      <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ t('cyprusSeminar.day3.morning.session.title') }}</p>
                      <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-blue-600 dark:text-blue-400">{{ t('cyprusSeminar.speakersLabel') }}:</span> {{ t('cyprusSeminar.day3.morning.session.speakers') }}</p>
                    </div>
                  </div>

                  <!-- Après-midi -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-l-4 border-blue-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('cyprusSeminar.day3.afternoon.title') }}</h4>
                    </div>
                    <div class="bg-blue-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-blue-200/30 dark:border-blue-800/30">
                      <p class="text-gray-600 dark:text-gray-400 text-sm">• {{ t('cyprusSeminar.day3.afternoon.restitution') }}</p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">• {{ t('cyprusSeminar.day3.afternoon.action') }}</p>
                    </div>
                  </div>

                  <!-- Clôture -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-l-4 border-blue-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('cyprusSeminar.day3.closing.title') }}</h4>
                    </div>
                    <div class="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
                      <p class="text-gray-800 dark:text-gray-200 text-sm font-medium">{{ t('cyprusSeminar.day3.closing.ceremony') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Public cible -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('cyprusSeminar.targetAudienceTitle') }}
          </h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="audience in ['audience1', 'audience2', 'audience3', 'audience4']" :key="audience"
               class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
            <div class="flex flex-col items-center text-center gap-4">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="text-gray-900 dark:text-white font-medium leading-relaxed">{{ t(`cyprusSeminar.audiences.${audience}`) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Résultats attendus -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('cyprusSeminar.expectedResultsTitle') }}
          </h2>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="result in ['result1', 'result2', 'result3', 'result4', 'result5']" :key="result"
               class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed">{{ t(`cyprusSeminar.results.${result}`) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Partenaires -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('cyprusSeminar.partnersTitle') }}
          </h2>
        </div>
        <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow border border-gray-200/50 dark:border-gray-700/50">
          <!-- Logos des partenaires -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 items-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <img src="/logos/republic-of-cyprus-government_e03e18_opk.jpeg" alt="République de Chypre" class="max-h-20 w-auto object-contain">
            </div>
            <div class="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <img src="/logos/cyprusaid.jpg" alt="Cyprus Aid" class="max-h-20 w-auto object-contain">
            </div>
            <div class="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl md:col-span-2">
              <img src="/logos/Logos_OIF-IFDD-SuperposesFlipBook.jpg" alt="OIF-IFDD" class="max-h-20 w-auto object-contain">
            </div>
          </div>

          <!-- Liste des partenaires -->
          <div class="grid md:grid-cols-2 gap-4">
            <div v-for="partner in ['cyprus', 'cyprusAid', 'oif', 'ifdd']" :key="partner"
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium">{{ t(`cyprusSeminar.partners.${partner}`) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Personnes ressources -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('cyprusSeminar.contactsTitle') }}
          </h2>
        </div>
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Contact Chypre -->
          <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 shadow border border-blue-200/50 dark:border-gray-700/50">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ t('cyprusSeminar.contacts.cyprus.name') }}
              </h3>
            </div>
            <div class="space-y-3">
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Fonction</p>
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ t('cyprusSeminar.contacts.cyprus.role') }}
                </p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Organisation</p>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ t('cyprusSeminar.contacts.cyprus.organization') }}
                </p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <a :href="`mailto:${t('cyprusSeminar.contacts.cyprus.email')}`" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  {{ t('cyprusSeminar.contacts.cyprus.email') }}
                </a>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Téléphone</p>
                <p class="text-gray-700 dark:text-gray-300 font-medium">{{ t('cyprusSeminar.contacts.cyprus.phone') }}</p>
              </div>
            </div>
          </div>

          <!-- Contact IFDD -->
          <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 shadow border border-green-200/50 dark:border-gray-700/50">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ t('cyprusSeminar.contacts.ifdd.name') }}
              </h3>
            </div>
            <div class="space-y-3">
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Fonction</p>
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ t('cyprusSeminar.contacts.ifdd.role') }}
                </p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Organisation</p>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ t('cyprusSeminar.contacts.ifdd.organization') }}
                </p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <a :href="`mailto:${t('cyprusSeminar.contacts.ifdd.email')}`" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  {{ t('cyprusSeminar.contacts.ifdd.email') }}
                </a>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Téléphone</p>
                <p class="text-gray-700 dark:text-gray-300 font-medium">{{ t('cyprusSeminar.contacts.ifdd.phone') }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="mb-16">
        <div class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 dark:from-blue-800 dark:via-blue-900 dark:to-gray-900 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
          <!-- Motif de fond -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>

          <div class="relative">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
              {{ t('cyprusSeminar.ctaTitle') }}
            </h2>
            <p class="text-white/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              {{ t('cyprusSeminar.ctaDescription') }}
            </p>
            <RouterLink to="/programmations"
                        class="group inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-white transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105">
              <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{{ t('cyprusSeminar.backToProgrammations') }}</span>
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@vueuse/head'

const { t } = useI18n()

// État pour le jour sélectionné
const selectedDay = ref(1)

// IDs YouTube pour chaque jour
const youtubeIds = {
  1: '314lUbLOlK4',
  2: 'DOIHJvXb_hc',
  3: 'RxUFNUT5sRw'
}

// Dates/heures de début pour chaque jour (en heure de Chypre - UTC+2)
const liveStartTimes = {
  1: new Date('2025-12-01T09:00:00+02:00'), // Jour 1 : 01 décembre 2025 à 9h
  2: new Date('2025-12-02T09:00:00+02:00'), // Jour 2 : 02 décembre 2025 à 9h
  3: new Date('2025-12-03T09:00:00+02:00')  // Jour 3 : 03 décembre 2025 à 9h
}

// Temps restant jusqu'au direct
const timeRemaining = ref({
  days: { value: 0, label: 'Jours' },
  hours: { value: 0, label: 'Heures' },
  minutes: { value: 0, label: 'Minutes' },
  seconds: { value: 0, label: 'Secondes' }
})

// Vérifier si le direct est en cours (10 minutes avant le début)
const isLiveNow = computed(() => {
  const now = new Date()
  const liveStart = liveStartTimes[selectedDay.value]
  const tenMinutesBefore = new Date(liveStart.getTime() - 10 * 60 * 1000)
  return now >= tenMinutesBefore
})

// Calculer le temps restant
const updateCountdown = () => {
  const now = new Date()
  const liveStart = liveStartTimes[selectedDay.value]
  const diff = liveStart - now

  if (diff <= 0) {
    timeRemaining.value = {
      days: { value: 0, label: 'Jours' },
      hours: { value: 0, label: 'Heures' },
      minutes: { value: 0, label: 'Minutes' },
      seconds: { value: 0, label: 'Secondes' }
    }
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  timeRemaining.value = {
    days: { value: days, label: 'Jours' },
    hours: { value: hours, label: 'Heures' },
    minutes: { value: minutes, label: 'Minutes' },
    seconds: { value: seconds, label: 'Secondes' }
  }
}

// Interval pour mettre à jour le décompte
let countdownInterval = null

onMounted(() => {
  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

// Fonction pour générer l'URL embed YouTube
const getYoutubeEmbedUrl = (day) => {
  const videoId = youtubeIds[day]
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`
}

// Meta tags pour le SEO
useHead({
  title: () => t('cyprusSeminar.title'),
  meta: [
    {
      name: 'description',
      content: () => t('cyprusSeminar.metaDescription')
    },
    {
      property: 'og:title',
      content: () => t('cyprusSeminar.title')
    },
    {
      property: 'og:description',
      content: () => t('cyprusSeminar.metaDescription')
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
})
</script>

<style scoped>
.prose {
  @apply text-gray-700 dark:text-gray-300;
}
</style>
