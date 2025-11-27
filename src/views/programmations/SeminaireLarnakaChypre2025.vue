<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header avec image de bannière -->
    <div class="relative h-64 md:h-80 lg:h-96 overflow-hidden">
      <img
        src="/images/example/banner-chypre.jpg"
        :alt="t('cyprusSeminar.title')"
        class="absolute inset-0 w-full h-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      <!-- Contenu du header -->
      <div class="absolute bottom-0 left-0 right-0 p-4 pb-6 md:p-12">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-xl sm:text-2xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
            {{ t('cyprusSeminar.title') }}
          </h1>
          <div class="flex flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
            <span class="bg-white/90 px-4 py-2 rounded-lg text-sm font-bold text-gray-900">
              {{ t('cyprusSeminar.dates') }}
            </span>
            <span class="bg-blue-500/90 px-4 py-2 rounded-lg text-sm font-bold text-white">
              {{ t('cyprusSeminar.location') }}
            </span>
          </div>

          <!-- Bouton d'inscription Zoom -->
          <div class="mt-4 md:mt-6">
            <a
              href="https://us06web.zoom.us/meeting/register/kF1ZvrOeRcuVIaGkBwc0jw"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-3 bg-white text-blue-600 font-bold px-6 py-3 md:px-8 md:py-4 rounded-lg hover:bg-blue-50 cursor-pointer shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <svg class="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 10H5V7h14v10zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-2v6l-2.5-2.5L13 14v-6l2.5 2.5L18 8z"/>
              </svg>
              <span class="text-sm md:text-base">{{ t('cyprusSeminar.registerButton') }}</span>
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <nav class="flex items-center space-x-2 text-sm">
          <RouterLink to="/" class="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            {{ t('common.home') }}
          </RouterLink>
          <span class="text-gray-400 dark:text-gray-500">/</span>
          <RouterLink to="/programmations" class="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            {{ t('programmations.title') }}
          </RouterLink>
          <span class="text-gray-400 dark:text-gray-500">/</span>
          <span class="text-gray-900 dark:text-white font-medium">{{ t('cyprusSeminar.shortTitle') }}</span>
        </nav>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <!-- Sélecteur de jours avec vidéos YouTube -->
      <section class="mb-12">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 md:p-8 shadow-lg border border-blue-200 dark:border-gray-600">
          <!-- Tabs pour les 3 jours -->
          <div class="flex flex-wrap gap-2 mb-6">
            <button
              v-for="day in [1, 2, 3]"
              :key="day"
              @click="selectedDay = day"
              :class="[
                'px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer',
                selectedDay === day
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/80 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
              ]"
            >
              {{ t(`cyprusSeminar.day${day}.title`) }}
            </button>
          </div>

          <!-- Vidéo YouTube pour le jour sélectionné -->
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-4">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h2 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ t('cyprusSeminar.liveStreamDay', { day: selectedDay }) }}
              </h2>
            </div>

            <!-- Container responsive pour l'iframe YouTube (16:9) -->
            <div class="relative w-full" style="padding-bottom: 56.25%;">
              <iframe
                :key="selectedDay"
                class="absolute top-0 left-0 w-full h-full rounded-lg shadow-xl"
                :src="getYoutubeEmbedUrl(selectedDay)"
                :title="`Direct YouTube - ${t('cyprusSeminar.day' + selectedDay + '.title')}`"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>

            <p class="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center">
              {{ t('cyprusSeminar.liveStreamInfo') }}
            </p>
          </div>
        </div>
      </section>

      <!-- Informations générales -->
      <section class="mb-12">
        <div class="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 md:p-8 shadow-lg border border-orange-200 dark:border-gray-600">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ t('cyprusSeminar.generalInfo') }}
          </h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('cyprusSeminar.fullTitle') }}
                </h3>
                <p class="text-lg text-gray-900 dark:text-white font-medium">
                  {{ t('cyprusSeminar.subtitle') }}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('cyprusSeminar.dateLabel') }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300">{{ t('cyprusSeminar.date') }}</p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('cyprusSeminar.scheduleLabel') }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300">{{ t('cyprusSeminar.schedule') }}</p>
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('cyprusSeminar.locationLabel') }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300">{{ t('cyprusSeminar.location') }}</p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('cyprusSeminar.organizerLabel') }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ t('cyprusSeminar.organizer') }}</p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('cyprusSeminar.participantsLabel') }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300">{{ t('cyprusSeminar.participants') }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contexte -->
      <section class="mb-12">
        <div class="prose prose-lg dark:prose-invert max-w-none">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('cyprusSeminar.contextTitle') }}
          </h2>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {{ t('cyprusSeminar.context') }}
          </p>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ t('cyprusSeminar.context2') }}
          </p>
        </div>
      </section>

      <!-- Objectifs -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('cyprusSeminar.objectivesTitle') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div v-for="index in [0, 1, 2, 3]" :key="index"
               class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span class="text-orange-600 dark:text-orange-400 font-bold">{{ index + 1 }}</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {{ t(`cyprusSeminar.objectives.${index}.title`) }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ t(`cyprusSeminar.objectives.${index}.description`) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Programme détaillé -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('cyprusSeminar.programTitle') }}
        </h2>

        <!-- Modération générale -->
        <div class="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-700">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {{ t('cyprusSeminar.moderation') }}
          </h3>
          <p class="text-gray-700 dark:text-gray-300">
            {{ t('cyprusSeminar.moderator') }}
          </p>
        </div>

        <!-- Jour 1 -->
        <div class="space-y-8">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-4 mb-6">
              <div class="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                {{ t('cyprusSeminar.day1.date') }}
              </div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ t('cyprusSeminar.day1.title') }}
              </h3>
            </div>

            <!-- Matinée -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('cyprusSeminar.day1.morning.title') }}
              </h4>
              <div class="space-y-4 pl-6 border-l-4 border-orange-200 dark:border-orange-700">
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white mb-2">
                    {{ t('cyprusSeminar.day1.morning.opening.title') }}
                  </p>
                  <p class="text-gray-700 dark:text-gray-300">
                    {{ t('cyprusSeminar.day1.morning.opening.organizers') }}
                  </p>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white mb-2">
                    {{ t('cyprusSeminar.day1.morning.panel.title') }}
                  </p>
                  <p class="text-gray-700 dark:text-gray-300">
                    <strong>{{ t('cyprusSeminar.speakersLabel') }}</strong> {{ t('cyprusSeminar.day1.morning.panel.speakers') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Après-midi -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('cyprusSeminar.day1.afternoon.title') }}
              </h4>
              <div class="space-y-4 pl-6 border-l-4 border-orange-200 dark:border-orange-700">
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white mb-2">
                    {{ t('cyprusSeminar.day1.afternoon.session1.title') }}
                  </p>
                  <p class="text-gray-700 dark:text-gray-300">
                    <strong>{{ t('cyprusSeminar.speakerLabel') }}</strong> {{ t('cyprusSeminar.day1.afternoon.session1.speaker') }}
                  </p>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white mb-2">
                    {{ t('cyprusSeminar.day1.afternoon.session2.title') }}
                  </p>
                  <p class="text-gray-700 dark:text-gray-300">
                    <strong>{{ t('cyprusSeminar.speakersLabel') }}</strong> {{ t('cyprusSeminar.day1.afternoon.session2.speakers') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Soirée -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('cyprusSeminar.day1.evening.title') }}
              </h4>
              <div class="pl-6 border-l-4 border-orange-200 dark:border-orange-700">
                <p class="text-gray-700 dark:text-gray-300">
                  {{ t('cyprusSeminar.day1.evening.networking') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Jour 2 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-4 mb-6">
              <div class="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                {{ t('cyprusSeminar.day2.date') }}
              </div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ t('cyprusSeminar.day2.title') }}
              </h3>
            </div>

            <!-- Matinée culturelle -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('cyprusSeminar.day2.morning.title') }}
              </h4>
              <div class="space-y-2 pl-6 border-l-4 border-green-200 dark:border-green-700">
                <p class="text-gray-700 dark:text-gray-300">• {{ t('cyprusSeminar.day2.morning.visit') }}</p>
                <p class="text-gray-700 dark:text-gray-300">• {{ t('cyprusSeminar.day2.morning.networking') }}</p>
              </div>
            </div>

            <!-- Après-midi -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('cyprusSeminar.day2.afternoon.title') }}
              </h4>
              <div class="space-y-4 pl-6 border-l-4 border-green-200 dark:border-green-700">
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white mb-2">
                    {{ t('cyprusSeminar.day2.afternoon.clinic.title') }}
                  </p>
                  <p class="text-gray-700 dark:text-gray-300">
                    <strong>{{ t('cyprusSeminar.speakersLabel') }}</strong> {{ t('cyprusSeminar.day2.afternoon.clinic.speakers') }}
                  </p>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white mb-2">
                    {{ t('cyprusSeminar.day2.afternoon.hackathon.title') }}
                  </p>
                  <p class="text-gray-700 dark:text-gray-300">
                    <strong>{{ t('cyprusSeminar.speakersLabel') }}</strong> {{ t('cyprusSeminar.day2.afternoon.hackathon.speakers') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Soirée -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('cyprusSeminar.day2.evening.title') }}
              </h4>
              <div class="space-y-4 pl-6 border-l-4 border-green-200 dark:border-green-700">
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white mb-2">
                    {{ t('cyprusSeminar.day2.evening.pitchSession.title') }}
                  </p>
                  <p class="text-gray-700 dark:text-gray-300">
                    <strong>{{ t('cyprusSeminar.speakerLabel') }}</strong> {{ t('cyprusSeminar.day2.evening.pitchSession.speaker') }}
                  </p>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white mb-2">
                    {{ t('cyprusSeminar.day2.evening.testimony.title') }}
                  </p>
                  <p class="text-gray-700 dark:text-gray-300">
                    <strong>{{ t('cyprusSeminar.speakerLabel') }}</strong> {{ t('cyprusSeminar.day2.evening.testimony.speaker') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Jour 3 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-4 mb-6">
              <div class="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                {{ t('cyprusSeminar.day3.date') }}
              </div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ t('cyprusSeminar.day3.title') }}
              </h3>
            </div>

            <!-- Matin -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('cyprusSeminar.day3.morning.title') }}
              </h4>
              <div class="pl-6 border-l-4 border-blue-200 dark:border-blue-700">
                <p class="font-semibold text-gray-900 dark:text-white mb-2">
                  {{ t('cyprusSeminar.day3.morning.session.title') }}
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>{{ t('cyprusSeminar.speakersLabel') }}</strong> {{ t('cyprusSeminar.day3.morning.session.speakers') }}
                </p>
              </div>
            </div>

            <!-- Après-midi -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('cyprusSeminar.day3.afternoon.title') }}
              </h4>
              <div class="space-y-2 pl-6 border-l-4 border-blue-200 dark:border-blue-700">
                <p class="text-gray-700 dark:text-gray-300">• {{ t('cyprusSeminar.day3.afternoon.restitution') }}</p>
                <p class="text-gray-700 dark:text-gray-300">• {{ t('cyprusSeminar.day3.afternoon.action') }}</p>
              </div>
            </div>

            <!-- Clôture -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('cyprusSeminar.day3.closing.title') }}
              </h4>
              <div class="pl-6 border-l-4 border-blue-200 dark:border-blue-700">
                <p class="text-gray-700 dark:text-gray-300">
                  {{ t('cyprusSeminar.day3.closing.ceremony') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Public cible -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('cyprusSeminar.targetAudienceTitle') }}
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="audience in ['audience1', 'audience2', 'audience3', 'audience4']" :key="audience"
               class="bg-gradient-to-br from-orange-50 to-orange-100/30 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 border border-orange-200 dark:border-gray-600">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-gray-900 dark:text-white font-medium text-sm">{{ t(`cyprusSeminar.audiences.${audience}`) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Partenaires -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('cyprusSeminar.partnersTitle') }}
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {{ t('cyprusSeminar.institutionalPartners') }}
          </h3>

          <!-- Logos des partenaires -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 items-center mb-6">
            <div class="flex items-center justify-center p-4">
              <img src="/logos/republic-of-cyprus-government_e03e18_opk.jpeg" alt="République de Chypre" class="max-h-24 w-auto object-contain">
            </div>
            <div class="flex items-center justify-center p-4">
              <img src="/logos/cyprusaid.jpg" alt="Cyprus Aid" class="max-h-24 w-auto object-contain">
            </div>
            <div class="flex items-center justify-center p-4 md:col-span-2">
              <img src="/logos/Logos_OIF-IFDD-SuperposesFlipBook.jpg" alt="OIF-IFDD" class="max-h-24 w-auto object-contain">
            </div>
          </div>

          <!-- Liste des partenaires -->
          <ul class="grid md:grid-cols-2 gap-3">
            <li v-for="partner in ['cyprus', 'cyprusAid', 'oif', 'ifdd']" :key="partner"
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ t(`cyprusSeminar.partners.${partner}`) }}
            </li>
          </ul>
        </div>
      </section>

      <!-- Résultats attendus -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('cyprusSeminar.expectedResultsTitle') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div v-for="result in ['result1', 'result2', 'result3', 'result4', 'result5']" :key="result"
               class="bg-gradient-to-br from-green-50 to-green-100/30 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-700">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-gray-900 dark:text-white">{{ t(`cyprusSeminar.results.${result}`) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Personnes ressources -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('cyprusSeminar.contactsTitle') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Contact Chypre -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {{ t('cyprusSeminar.contacts.cyprus.name') }}
            </h3>
            <div class="space-y-2 text-sm">
              <p class="text-gray-700 dark:text-gray-300">
                <strong>{{ t('cyprusSeminar.contacts.cyprus.role') }}</strong>
              </p>
              <p class="text-gray-700 dark:text-gray-300">
                {{ t('cyprusSeminar.contacts.cyprus.organization') }}
              </p>
              <p class="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong>
                <a :href="`mailto:${t('cyprusSeminar.contacts.cyprus.email')}`" class="text-blue-600 dark:text-blue-400 hover:underline">
                  {{ t('cyprusSeminar.contacts.cyprus.email') }}
                </a>
              </p>
              <p class="text-gray-700 dark:text-gray-300">
                <strong>Tel:</strong> {{ t('cyprusSeminar.contacts.cyprus.phone') }}
              </p>
            </div>
          </div>

          <!-- Contact IFDD -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {{ t('cyprusSeminar.contacts.ifdd.name') }}
            </h3>
            <div class="space-y-2 text-sm">
              <p class="text-gray-700 dark:text-gray-300">
                <strong>{{ t('cyprusSeminar.contacts.ifdd.role') }}</strong>
              </p>
              <p class="text-gray-700 dark:text-gray-300">
                {{ t('cyprusSeminar.contacts.ifdd.organization') }}
              </p>
              <p class="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong>
                <a :href="`mailto:${t('cyprusSeminar.contacts.ifdd.email')}`" class="text-blue-600 dark:text-blue-400 hover:underline">
                  {{ t('cyprusSeminar.contacts.ifdd.email') }}
                </a>
              </p>
              <p class="text-gray-700 dark:text-gray-300">
                <strong>Tel:</strong> {{ t('cyprusSeminar.contacts.ifdd.phone') }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="mb-12">
        <div class="bg-gradient-to-r from-blue-800 to-blue-900 dark:from-blue-800 dark:to-blue-900 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">
            {{ t('cyprusSeminar.ctaTitle') }}
          </h2>
          <p class="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
            {{ t('cyprusSeminar.ctaDescription') }}
          </p>
          <RouterLink to="/programmations"
                      class="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ t('cyprusSeminar.backToProgrammations') }}
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
