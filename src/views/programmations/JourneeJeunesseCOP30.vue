<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header avec image de bannière -->
    <div class="relative h-64 md:h-80 lg:h-96 overflow-hidden">
      <img
        src="/images/example/event_banniere_par_defaut_32_9_v3.jpg"
        :alt="t('youthClimateDay.title')"
        class="absolute inset-0 w-full h-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      <!-- Contenu du header -->
      <div class="absolute bottom-0 left-0 right-0 p-4 pb-6 md:p-12">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-xl sm:text-2xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
            {{ t('youthClimateDay.title') }}
          </h1>
          <div class="flex flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
            <span class="bg-white/90 px-4 py-2 rounded-lg text-sm font-bold text-gray-900">
              {{ t('youthClimateDay.cop30') }}
            </span>
            <span class="bg-orange-500/90 px-4 py-2 rounded-lg text-sm font-bold text-white">
              12 {{ t('youthClimateDay.november') }} 2025
            </span>
            <span class="bg-green-500/90 px-4 py-2 rounded-lg text-sm font-bold text-white">
              {{ t('youthClimateDay.belém') }}
            </span>
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
          <span class="text-gray-900 dark:text-white font-medium">{{ t('youthClimateDay.shortTitle') }}</span>
        </nav>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <!-- Bouton d'inscription Zoom -->
      <section class="mb-12">
        <div class="flex-shrink-0">
              <a
                href="https://us06web.zoom.us/meeting/register/8b4PtGDsS2uLhvgEyiMtNw"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-3 bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 cursor-pointer shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 10H5V7h14v10zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-2v6l-2.5-2.5L13 14v-6l2.5 2.5L18 8z"/>
                </svg>
                <span>{{ t('youthClimateDay.registerButton') }}</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
      </section>

      <!-- Informations générales -->
      <section class="mb-12">
        <div class="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 md:p-8 shadow-lg border border-orange-200 dark:border-gray-600">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ t('youthClimateDay.generalInfo') }}
          </h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('youthClimateDay.fullTitle') }}
                </h3>
                <p class="text-lg text-gray-900 dark:text-white font-medium">
                  {{ t('youthClimateDay.subtitle') }}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('youthClimateDay.dateLabel') }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300">{{ t('youthClimateDay.date') }}</p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('youthClimateDay.scheduleLabel') }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300">{{ t('youthClimateDay.schedule') }}</p>
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('youthClimateDay.locationLabel') }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300">{{ t('youthClimateDay.location') }}</p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  {{ t('youthClimateDay.organizerLabel') }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ t('youthClimateDay.organizer') }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contexte -->
      <section class="mb-12">
        <div class="prose prose-lg dark:prose-invert max-w-none">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('youthClimateDay.contextTitle') }}
          </h2>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ t('youthClimateDay.context') }}
          </p>
        </div>
      </section>

      <!-- Objectifs -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('youthClimateDay.objectivesTitle') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div v-for="(objective, index) in objectives" :key="index"
               class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span class="text-orange-600 dark:text-orange-400 font-bold">{{ index + 1 }}</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {{ t(`youthClimateDay.objectives.${index}.title`) }}
                </h3>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ t(`youthClimateDay.objectives.${index}.description`) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Programme détaillé -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('youthClimateDay.programTitle') }}
        </h2>

        <!-- Modération générale -->
        <div class="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-700">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {{ t('youthClimateDay.moderation') }}
          </h3>
          <p class="text-gray-700 dark:text-gray-300">
            {{ t('youthClimateDay.moderator') }}
          </p>
        </div>

        <!-- Parties du programme -->
        <div class="space-y-8">
          <!-- Partie 1: Accueil et Ouverture -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-4 mb-6">
              <div class="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                8h00 - 9h00
              </div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ t('youthClimateDay.part1.title') }}
              </h3>
            </div>
            <div class="space-y-4">
              <div class="pl-6 border-l-4 border-orange-200 dark:border-orange-700">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">8h00 - 8h45</h4>
                <p class="text-gray-700 dark:text-gray-300">{{ t('youthClimateDay.part1.welcome') }}</p>
              </div>
              <div class="pl-6 border-l-4 border-orange-200 dark:border-orange-700">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">8h45 - 9h00: {{ t('youthClimateDay.part1.openingTitle') }}</h4>
                <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• <strong>{{ t('youthClimateDay.part1.welcomeOIF') }}</strong> {{ t('youthClimateDay.part1.speaker1') }}</li>
                  <li>• <strong>{{ t('youthClimateDay.part1.journalistImpressions') }}</strong></li>
                  <li class="ml-6">- {{ t('youthClimateDay.part1.journalist1') }}</li>
                  <li class="ml-6">- {{ t('youthClimateDay.part1.journalist2') }}</li>
                  <li>• <strong>{{ t('youthClimateDay.part1.officialOpening') }}</strong> {{ t('youthClimateDay.part1.speaker2') }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Partie 2: Engagement et Innovation -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-4 mb-6">
              <div class="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                9h00 - 10h10
              </div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ t('youthClimateDay.part2.title') }}
              </h3>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <p class="text-sm text-blue-900 dark:text-blue-300">
                <strong>{{ t('youthClimateDay.moderationLabel') }}</strong> {{ t('youthClimateDay.part2.moderator') }}
              </p>
            </div>
            <div class="space-y-6">
              <!-- Pitchs Inspirants -->
              <div class="pl-6 border-l-4 border-green-200 dark:border-green-700">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-3">9h00 - 9h15: {{ t('youthClimateDay.part2.pitchesTitle') }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ t('youthClimateDay.part2.pitchesFormat') }}</p>
                <div class="grid md:grid-cols-2 gap-3">
                  <div v-for="speaker in part2Speakers" :key="speaker" class="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <p class="text-sm text-gray-800 dark:text-gray-200">{{ t(`youthClimateDay.part2.speakers.${speaker}`) }}</p>
                  </div>
                </div>
              </div>

              <!-- Ateliers Plaidoyer -->
              <div class="pl-6 border-l-4 border-green-200 dark:border-green-700">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">9h15 - 9h30: {{ t('youthClimateDay.part2.workshop1Title') }}</h4>
                <p class="text-gray-700 dark:text-gray-300 mb-1"><strong>{{ t('youthClimateDay.themeLabel') }}</strong> {{ t('youthClimateDay.part2.workshop1Theme') }}</p>
                <p class="text-gray-700 dark:text-gray-300"><strong>{{ t('youthClimateDay.organizedByLabel') }}</strong> {{ t('youthClimateDay.part2.workshop1Organizer') }}</p>
              </div>

              <div class="pl-6 border-l-4 border-green-200 dark:border-green-700">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">9h30 - 9h45: {{ t('youthClimateDay.part2.workshop2Title') }}</h4>
                <p class="text-gray-700 dark:text-gray-300 mb-1"><strong>{{ t('youthClimateDay.themeLabel') }}</strong> {{ t('youthClimateDay.part2.workshop2Theme') }}</p>
                <p class="text-gray-700 dark:text-gray-300"><strong>{{ t('youthClimateDay.organizedByLabel') }}</strong> {{ t('youthClimateDay.part2.workshop2Organizer') }}</p>
              </div>

              <!-- Concours et Quiz -->
              <div class="pl-6 border-l-4 border-green-200 dark:border-green-700">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">9h45 - 10h10: {{ t('youthClimateDay.part2.quizTitle') }}</h4>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>{{ t('youthClimateDay.animationLabel') }}</strong>
                  {{ t('youthClimateDay.part2.quizAnimators') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Partie 3: Solutions et Partenariats -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-4 mb-6">
              <div class="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                10h11 - 16h00
              </div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ t('youthClimateDay.part3.title') }}
              </h3>
            </div>
            <div class="space-y-4">
              <div v-for="session in part3Sessions" :key="session.time" class="pl-6 border-l-4 border-blue-200 dark:border-blue-700">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ session.time }}</h4>
                <p class="text-gray-700 dark:text-gray-300 mb-1">
                  <strong>{{ t('youthClimateDay.themeLabel') }}</strong> {{ t(`youthClimateDay.part3.${session.key}.theme`) }}
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>{{ t('youthClimateDay.speakerLabel') }}</strong> {{ t(`youthClimateDay.part3.${session.key}.speaker`) }}
                </p>
                <div v-if="session.hasWorkshops" class="mt-3 ml-4 space-y-2">
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ t('youthClimateDay.parallelSessions') }}</p>
                  <div class="space-y-2">
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p class="text-sm text-gray-900 dark:text-white font-medium mb-1">1. {{ t('youthClimateDay.part3.workshop1.title') }}</p>
                      <p class="text-xs text-gray-600 dark:text-gray-400">{{ t('youthClimateDay.part3.workshop1.description') }}</p>
                      <p class="text-xs text-gray-600 dark:text-gray-400 mt-1"><strong>{{ t('youthClimateDay.organizedByLabel') }}</strong> {{ t('youthClimateDay.part3.workshop1.organizer') }}</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p class="text-sm text-gray-900 dark:text-white font-medium mb-1">2. {{ t('youthClimateDay.part3.workshop2.title') }}</p>
                      <p class="text-xs text-gray-600 dark:text-gray-400">{{ t('youthClimateDay.part3.workshop2.description') }}</p>
                      <p class="text-xs text-gray-600 dark:text-gray-400 mt-1"><strong>{{ t('youthClimateDay.organizedByLabel') }}</strong> {{ t('youthClimateDay.part3.workshop2.organizer') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Partie 4: Réseautage et Clôture -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-4 mb-6">
              <div class="bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                16h00 - 17h00
              </div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ t('youthClimateDay.part4.title') }}
              </h3>
            </div>
            <div class="space-y-4">
              <div class="pl-6 border-l-4 border-purple-200 dark:border-purple-700">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">16h00 - 17h00: {{ t('youthClimateDay.part4.networkingTitle') }}</h4>
                <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• {{ t('youthClimateDay.part4.networking1') }}</li>
                  <li>• {{ t('youthClimateDay.part4.networking2') }}</li>
                  <li>• <strong>{{ t('youthClimateDay.animationLabel') }}</strong> {{ t('youthClimateDay.part4.animators') }}</li>
                </ul>
              </div>
              <div class="pl-6 border-l-4 border-purple-200 dark:border-purple-700">
                <h4 class="font-semibold text-gray-900 dark:text-white">17h00: {{ t('youthClimateDay.part4.closing') }}</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Public cible -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('youthClimateDay.targetAudienceTitle') }}
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="audience in targetAudiences" :key="audience"
               class="bg-gradient-to-br from-orange-50 to-orange-100/30 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 border border-orange-200 dark:border-gray-600">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-gray-900 dark:text-white font-medium text-sm">{{ t(`youthClimateDay.audiences.${audience}`) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Partenaires -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('youthClimateDay.partnersTitle') }}
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="mb-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {{ t('youthClimateDay.institutionalPartners') }}
            </h3>
            <ul class="grid md:grid-cols-2 gap-3">
              <li v-for="partner in institutionalPartners" :key="partner"
                  class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t(`youthClimateDay.partners.${partner}`) }}
              </li>
            </ul>
          </div>
          <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {{ t('youthClimateDay.financialSupport') }}
            </h3>
            <p class="text-gray-700 dark:text-gray-300">{{ t('youthClimateDay.financialSupportText') }}</p>
          </div>
        </div>
      </section>

      <!-- Résultats attendus -->
      <section class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {{ t('youthClimateDay.expectedResultsTitle') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div v-for="(result, index) in expectedResults" :key="index"
               class="bg-gradient-to-br from-green-50 to-green-100/30 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-700">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-gray-900 dark:text-white">{{ t(`youthClimateDay.results.${result}`) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="mb-12">
        <div class="bg-gradient-to-r from-blue-800 to-blue-900 dark:from-blue-800 dark:to-blue-900 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">
            {{ t('youthClimateDay.ctaTitle') }}
          </h2>
          <p class="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
            {{ t('youthClimateDay.ctaDescription') }}
          </p>
          <RouterLink to="/programmations"
                      class="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ t('youthClimateDay.backToProgrammations') }}
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useHead } from '@vueuse/head'

const { t } = useI18n()

// Meta tags pour le SEO
useHead({
  title: () => t('youthClimateDay.title'),
  meta: [
    {
      name: 'description',
      content: () => t('youthClimateDay.metaDescription')
    },
    {
      property: 'og:title',
      content: () => t('youthClimateDay.title')
    },
    {
      property: 'og:description',
      content: () => t('youthClimateDay.metaDescription')
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
})

// Données statiques
const objectives = [0, 1, 2, 3]
const part2Speakers = ['speaker1', 'speaker2', 'speaker3', 'speaker4', 'speaker5', 'speaker6']
const part3Sessions = [
  { time: '10h11 - 11h00', key: 'session1', hasWorkshops: false },
  { time: '11h00 - 12h00', key: 'session2', hasWorkshops: false },
  { time: '13h00 - 13h45', key: 'session3', hasWorkshops: true },
  { time: '13h45 - 14h15', key: 'session4', hasWorkshops: false },
  { time: '14h15 - 14h45', key: 'session5', hasWorkshops: false },
  { time: '15h00 - 16h00', key: 'session6', hasWorkshops: false }
]
const targetAudiences = ['audience1', 'audience2', 'audience3', 'audience4']
const institutionalPartners = ['oif', 'quebec', 'benin', 'lojiq']
const expectedResults = ['result1', 'result2', 'result3', 'result4']
</script>

<style scoped>
.prose {
  @apply text-gray-700 dark:text-gray-300;
}
</style>
