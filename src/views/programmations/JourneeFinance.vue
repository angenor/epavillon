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

    <!-- Hero Section -->
    <div class="relative h-[50vh] min-h-[400px] overflow-hidden">
      <!-- Image de couverture -->
      <div class="absolute inset-0">
        <img
          src="/images/example/event_banniere_par_defaut_16_9_reduit.jpg"
          alt="Journée Finance Durable"
          class="w-full h-full object-cover scale-105"
          loading="eager"
          @error="handleImageError"
        >
        <!-- Overlay avec gradient -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-green-900/20 to-transparent"></div>
      </div>

      <!-- Contenu Hero -->
      <div class="relative h-full flex flex-col justify-end">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <!-- Badges -->
          <div class="flex flex-wrap gap-3 mb-4">
            <span class="backdrop-blur-md bg-green-500/90 border border-green-400/50 text-white px-4 py-2 rounded-full text-sm font-bold">
              💰 {{ t('sustainableFinance.badge') }}
            </span>
            <span class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
              📅 {{ t('sustainableFinance.date') }}
            </span>
            <span class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
              📍 {{ t('sustainableFinance.location') }}
            </span>
          </div>

          <!-- Titre -->
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg font-maverick">
            {{ t('sustainableFinance.title') }}
          </h1>

          <!-- Sous-titre -->
          <p class="text-lg sm:text-xl text-white/90 max-w-4xl drop-shadow-md">
            {{ t('sustainableFinance.subtitle') }}
          </p>

          <!-- Horaires -->
          <div class="flex items-center gap-2 mt-4 text-white/90">
            <font-awesome-icon :icon="['fas', 'clock']" class="w-5 h-5" />
            <span class="text-lg font-semibold">{{ t('sustainableFinance.hours') }}</span>
          </div>

          <!-- Bouton d'inscription -->
          <div class="mt-6">
            <a
              href="https://us06web.zoom.us/meeting/register/v2itCTkbRlSER-SemtdwSg"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <font-awesome-icon :icon="['fas', 'user-plus']" class="w-5 h-5" />
              <span>{{ t('sustainableFinance.registerButton') }}</span>
              <font-awesome-icon :icon="['fas', 'external-link-alt']" class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu Principal -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Section Contexte et Objectifs -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Contexte -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.context.title') }}</h2>
          </div>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ t('sustainableFinance.context.description') }}
          </p>
          <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p class="text-sm text-gray-700 dark:text-gray-300 italic">
              {{ t('sustainableFinance.context.project') }}
            </p>
          </div>
        </div>

        <!-- Objectifs -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'bullseye']" class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.objectives.title') }}</h2>
          </div>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <span class="text-gray-600 dark:text-gray-300">{{ t('sustainableFinance.objectives.obj1') }}</span>
            </li>
            <li class="flex items-start gap-3">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <span class="text-gray-600 dark:text-gray-300">{{ t('sustainableFinance.objectives.obj2') }}</span>
            </li>
            <li class="flex items-start gap-3">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <span class="text-gray-600 dark:text-gray-300">{{ t('sustainableFinance.objectives.obj3') }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Annonce Importante -->
      <div class="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-lg p-6 mb-12 border-l-4 border-orange-500">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'bullhorn']" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {{ t('sustainableFinance.announcement.title') }}
            </h3>
            <p class="text-gray-700 dark:text-gray-300">
              {{ t('sustainableFinance.announcement.description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Programme Détaillé -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-12">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'calendar-alt']" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.title') }}</h2>
        </div>

        <!-- Partie 1 -->
        <div class="mb-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
              1
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('sustainableFinance.program.part1.title') }}
            </h3>
            <span class="text-sm font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
              8h00 - 10h00
            </span>
          </div>

          <div class="space-y-6 ml-6 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
            <!-- Accueil -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part1.welcome.title') }}</h4>
                  <span class="text-sm font-semibold text-orange-600 dark:text-orange-400">8h00 - 8h45</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('sustainableFinance.program.part1.welcome.description') }}
                </p>
              </div>
            </div>

            <!-- Ouverture officielle -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part1.opening.title') }}</h4>
                  <span class="text-sm font-semibold text-orange-600 dark:text-orange-400">8h45 - 9h00</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ t('sustainableFinance.program.part1.opening.speaker') }}
                </p>
                <div class="bg-orange-50 dark:bg-orange-900/20 rounded p-3 mt-2">
                  <p class="text-sm font-semibold text-orange-800 dark:text-orange-300">
                    🎉 {{ t('sustainableFinance.program.part1.opening.announcement') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Panel Partenaires -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part1.panel1.title') }}</h4>
                  <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">9h00 - 9h40</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>{{ t('sustainableFinance.program.part1.panel1.theme') }}</strong>
                </p>
                <div class="bg-white/50 dark:bg-gray-800/50 rounded p-3">
                  <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('sustainableFinance.program.part1.panel1.speakers') }}
                  </p>
                  <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• OIF</li>
                    <li>• BAD</li>
                    <li>• CIF Banque mondiale</li>
                    <li>• BOAD</li>
                    <li>• BDEAC</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Panel Acteurs -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part1.panel2.title') }}</h4>
                  <span class="text-sm font-semibold text-green-600 dark:text-green-400">9h40 - 10h00</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>{{ t('sustainableFinance.program.part1.panel2.theme') }}</strong>
                </p>
                <div class="bg-white/50 dark:bg-gray-800/50 rounded p-3">
                  <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('sustainableFinance.program.part1.panel2.speakers') }}
                  </p>
                  <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Desjardins International</li>
                    <li>• Investissement Québec</li>
                    <li>• Irroko</li>
                    <li>• Ecolotrip</li>
                    <li>• HEC Montréal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Partie 2 -->
        <div class="mb-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              2
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('sustainableFinance.program.part2.title') }}
            </h3>
            <span class="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              10h15 - 14h00
            </span>
          </div>

          <div class="space-y-6 ml-6 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
            <!-- Session 1 -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part2.session1.theme') }}</h4>
                  <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">10h15 - 11h15</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>{{ t('sustainableFinance.program.part2.session1.focus') }}</strong>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  {{ t('sustainableFinance.program.part2.session1.speaker') }}
                </p>
              </div>
            </div>

            <!-- Session 2 -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part2.session2.theme') }}</h4>
                  <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">11h30 - 12h30</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>{{ t('sustainableFinance.program.part2.session2.focus') }}</strong>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  {{ t('sustainableFinance.program.part2.session2.speaker') }}
                </p>
              </div>
            </div>

            <!-- Session 3 -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part2.session3.theme') }}</h4>
                  <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">13h00 - 14h00</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>{{ t('sustainableFinance.program.part2.session3.focus') }}</strong>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  {{ t('sustainableFinance.program.part2.session3.speaker') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Partie 3 -->
        <div>
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              3
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('sustainableFinance.program.part3.title') }}
            </h3>
            <span class="text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
              14h15 - 17h45
            </span>
          </div>

          <div class="space-y-6 ml-6 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
            <!-- Session 1 -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-purple-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part3.session1.theme') }}</h4>
                  <span class="text-sm font-semibold text-purple-600 dark:text-purple-400">14h15 - 15h15</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>{{ t('sustainableFinance.program.part3.session1.focus') }}</strong>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  {{ t('sustainableFinance.program.part3.session1.speaker') }}
                </p>
              </div>
            </div>

            <!-- Session 2 -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-purple-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part3.session2.theme') }}</h4>
                  <span class="text-sm font-semibold text-purple-600 dark:text-purple-400">15h30 - 16h30</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>{{ t('sustainableFinance.program.part3.session2.focus') }}</strong>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  {{ t('sustainableFinance.program.part3.session2.speaker') }}
                </p>
              </div>
            </div>

            <!-- Table ronde -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-purple-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part3.roundtable.theme') }}</h4>
                  <span class="text-sm font-semibold text-purple-600 dark:text-purple-400">16h45 - 17h45</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>{{ t('sustainableFinance.program.part3.roundtable.animator') }}</strong>
                </p>
              </div>
            </div>

            <!-- Clôture -->
            <div class="relative">
              <div class="absolute -left-[29px] top-2 w-4 h-4 bg-gray-400 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div class="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.program.part3.closing') }}</h4>
                  <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">17h45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Public Cible et Partenaires -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Public Cible -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'users']" class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.audience.title') }}</h2>
          </div>
          <ul class="space-y-2">
            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3 h-3 text-indigo-600" />
              <span>{{ t('sustainableFinance.audience.target1') }}</span>
            </li>
            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3 h-3 text-indigo-600" />
              <span>{{ t('sustainableFinance.audience.target2') }}</span>
            </li>
            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3 h-3 text-indigo-600" />
              <span>{{ t('sustainableFinance.audience.target3') }}</span>
            </li>
            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3 h-3 text-indigo-600" />
              <span>{{ t('sustainableFinance.audience.target4') }}</span>
            </li>
            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3 h-3 text-indigo-600" />
              <span>{{ t('sustainableFinance.audience.target5') }}</span>
            </li>
          </ul>
        </div>

        <!-- Partenaires -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'handshake']" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('sustainableFinance.partners.title') }}</h2>
          </div>
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
                {{ t('sustainableFinance.partners.financial') }}
              </h4>
              <div class="flex flex-wrap gap-2">
                <span class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full">BAD</span>
                <span class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full">BOAD</span>
                <span class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full">BDEAC</span>
                <span class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full">GCF</span>
                <span class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full">Desjardins</span>
              </div>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
                {{ t('sustainableFinance.partners.organizations') }}
              </h4>
              <div class="flex flex-wrap gap-2">
                <span class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">OIF</span>
                <span class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">GIZ</span>
                <span class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">Finance Montréal</span>
                <span class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">France Assureurs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Retour -->
      <div class="flex justify-center">
        <button
          @click="goBack"
          class="px-6 py-3 bg-ifdd-vert hover:bg-ifdd-vert/90 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          {{ t('common.back') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'

const { t } = useI18n()
const router = useRouter()

// Meta tags pour SEO
useHead({
  title: () => t('sustainableFinance.meta.title'),
  meta: [
    {
      name: 'description',
      content: () => t('sustainableFinance.meta.description')
    },
    {
      property: 'og:title',
      content: () => t('sustainableFinance.meta.title')
    },
    {
      property: 'og:description',
      content: () => t('sustainableFinance.meta.description')
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
})

const goBack = () => {
  router.go(-1)
}

const handleImageError = (event) => {
  // Fallback image si l'image n'existe pas
  event.target.src = '/images/events/default-event.jpg'
}
</script>

<style scoped>
/* Animations personnalisées peuvent être ajoutées ici si nécessaire */
</style>
