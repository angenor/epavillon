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

          <!-- Container responsive pour l'iframe YouTube ou décompte (16:9) -->
          <div class="relative w-full bg-gradient-to-br from-gray-900 to-blue-900" style="padding-bottom: 56.25%;">
            <!-- Décompte -->
            <div v-if="!isLiveNow" class="absolute inset-0 flex flex-col items-center justify-center p-8">
              <!-- Fond animé -->
              <div class="absolute inset-0 opacity-20">
                <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
                <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-500 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
              </div>

              <div class="relative text-center">
                <h3 class="text-2xl md:text-3xl font-bold text-white mb-8">Le direct commence dans</h3>

                <!-- Compteur -->
                <div class="grid grid-cols-4 gap-4 md:gap-6 mb-8">
                  <div v-for="(unit, key) in timeRemaining" :key="key" class="flex flex-col items-center">
                    <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 min-w-[70px] md:min-w-[100px] border border-white/20">
                      <div class="text-3xl md:text-5xl font-bold text-white tabular-nums">{{ String(unit.value).padStart(2, '0') }}</div>
                    </div>
                    <div class="text-white/80 text-xs md:text-sm mt-2 uppercase tracking-wide">{{ unit.label }}</div>
                  </div>
                </div>

                <p class="text-white/60 text-sm md:text-base">La diffusion commencera automatiquement</p>
              </div>
            </div>

            <!-- Iframe YouTube -->
            <iframe
              v-else
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

        <!-- Timeline des 3 jours -->
        <div class="space-y-10">
          <!-- Jour 1 -->
          <div class="relative">
            <!-- Badge du jour -->
            <div class="flex flex-wrap items-center gap-4 mb-6">
              <div class="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl shadow-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="font-bold text-lg">{{ t('cyprusSeminar.day1.date') }}</span>
              </div>
              <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {{ t('cyprusSeminar.day1.title') }}
              </h3>
            </div>

            <!-- Card du jour -->
            <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow border-l-4 border-orange-500 overflow-hidden">
              <div class="p-6 md:p-8 space-y-8">
                <!-- Matinée -->
                <div>
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ t('cyprusSeminar.day1.morning.title') }}
                    </h4>
                  </div>
                  <div class="space-y-4 pl-5">
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('cyprusSeminar.day1.morning.opening.title') }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        {{ t('cyprusSeminar.day1.morning.opening.organizers') }}
                      </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('cyprusSeminar.day1.morning.panel.title') }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        <span class="font-medium text-orange-600 dark:text-orange-400">{{ t('cyprusSeminar.speakersLabel') }}:</span> {{ t('cyprusSeminar.day1.morning.panel.speakers') }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Après-midi -->
                <div>
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ t('cyprusSeminar.day1.afternoon.title') }}
                    </h4>
                  </div>
                  <div class="space-y-4 pl-5">
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('cyprusSeminar.day1.afternoon.session1.title') }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        <span class="font-medium text-orange-600 dark:text-orange-400">{{ t('cyprusSeminar.speakerLabel') }}:</span> {{ t('cyprusSeminar.day1.afternoon.session1.speaker') }}
                      </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('cyprusSeminar.day1.afternoon.session2.title') }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        <span class="font-medium text-orange-600 dark:text-orange-400">{{ t('cyprusSeminar.speakersLabel') }}:</span> {{ t('cyprusSeminar.day1.afternoon.session2.speakers') }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Soirée -->
                <div>
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ t('cyprusSeminar.day1.evening.title') }}
                    </h4>
                  </div>
                  <div class="pl-5">
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        {{ t('cyprusSeminar.day1.evening.networking') }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Jour 2 -->
          <div class="relative">
            <!-- Badge du jour -->
            <div class="flex flex-wrap items-center gap-4 mb-6">
              <div class="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="font-bold text-lg">{{ t('cyprusSeminar.day2.date') }}</span>
              </div>
              <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {{ t('cyprusSeminar.day2.title') }}
              </h3>
            </div>

            <!-- Card du jour -->
            <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow border-l-4 border-green-500 overflow-hidden">
              <div class="p-6 md:p-8 space-y-8">
                <!-- Matinée culturelle -->
                <div>
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ t('cyprusSeminar.day2.morning.title') }}
                    </h4>
                  </div>
                  <div class="space-y-4 pl-5">
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="text-gray-600 dark:text-gray-400 text-sm">• {{ t('cyprusSeminar.day2.morning.visit') }}</p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">• {{ t('cyprusSeminar.day2.morning.networking') }}</p>
                    </div>
                  </div>
                </div>

                <!-- Après-midi -->
                <div>
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ t('cyprusSeminar.day2.afternoon.title') }}
                    </h4>
                  </div>
                  <div class="space-y-4 pl-5">
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('cyprusSeminar.day2.afternoon.clinic.title') }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        <span class="font-medium text-green-600 dark:text-green-400">{{ t('cyprusSeminar.speakersLabel') }}:</span> {{ t('cyprusSeminar.day2.afternoon.clinic.speakers') }}
                      </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('cyprusSeminar.day2.afternoon.hackathon.title') }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        <span class="font-medium text-green-600 dark:text-green-400">{{ t('cyprusSeminar.speakersLabel') }}:</span> {{ t('cyprusSeminar.day2.afternoon.hackathon.speakers') }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Soirée -->
                <div>
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ t('cyprusSeminar.day2.evening.title') }}
                    </h4>
                  </div>
                  <div class="space-y-4 pl-5">
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('cyprusSeminar.day2.evening.pitchSession.title') }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        <span class="font-medium text-green-600 dark:text-green-400">{{ t('cyprusSeminar.speakerLabel') }}:</span> {{ t('cyprusSeminar.day2.evening.pitchSession.speaker') }}
                      </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('cyprusSeminar.day2.evening.testimony.title') }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        <span class="font-medium text-green-600 dark:text-green-400">{{ t('cyprusSeminar.speakerLabel') }}:</span> {{ t('cyprusSeminar.day2.evening.testimony.speaker') }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Jour 3 -->
          <div class="relative">
            <!-- Badge du jour -->
            <div class="flex flex-wrap items-center gap-4 mb-6">
              <div class="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="font-bold text-lg">{{ t('cyprusSeminar.day3.date') }}</span>
              </div>
              <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {{ t('cyprusSeminar.day3.title') }}
              </h3>
            </div>

            <!-- Card du jour -->
            <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow border-l-4 border-blue-500 overflow-hidden">
              <div class="p-6 md:p-8 space-y-8">
                <!-- Matin -->
                <div>
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ t('cyprusSeminar.day3.morning.title') }}
                    </h4>
                  </div>
                  <div class="space-y-4 pl-5">
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('cyprusSeminar.day3.morning.session.title') }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        <span class="font-medium text-blue-600 dark:text-blue-400">{{ t('cyprusSeminar.speakersLabel') }}:</span> {{ t('cyprusSeminar.day3.morning.session.speakers') }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Après-midi -->
                <div>
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ t('cyprusSeminar.day3.afternoon.title') }}
                    </h4>
                  </div>
                  <div class="space-y-4 pl-5">
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p class="text-gray-600 dark:text-gray-400 text-sm">• {{ t('cyprusSeminar.day3.afternoon.restitution') }}</p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">• {{ t('cyprusSeminar.day3.afternoon.action') }}</p>
                    </div>
                  </div>
                </div>

                <!-- Clôture -->
                <div>
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ t('cyprusSeminar.day3.closing.title') }}
                    </h4>
                  </div>
                  <div class="pl-5">
                    <div class="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <p class="text-gray-700 dark:text-gray-300 text-sm font-medium">
                        {{ t('cyprusSeminar.day3.closing.ceremony') }}
                      </p>
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
