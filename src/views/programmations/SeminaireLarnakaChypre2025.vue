<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section - Design Glass Moderne -->
    <div class="relative overflow-hidden min-h-[85vh] flex items-center">
      <!-- Image de fond avec parallax -->
      <div class="absolute inset-0">
        <img src="/images/example/banner-chypre.jpg" alt="Chypre" class="absolute inset-0 w-full h-full object-cover scale-105">
        <!-- Overlay gradient moderne -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-700/70 to-blue-900/85 dark:from-blue-900/90 dark:via-blue-950/85 dark:to-gray-900/90"></div>
        <!-- Effet de vignette -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]"></div>
      </div>

      <!-- Particules flottantes décoratives -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div class="absolute top-40 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div class="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 py-20 md:py-28 w-full">
        <div class="max-w-5xl mx-auto">
          <!-- Badge avec effet glass moderne -->
          <div class="flex justify-center mb-8 animate-fade-in-down">
            <div class="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full shadow-2xl shadow-black/20 hover:bg-white/15 transition-all duration-300">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-400 shadow-lg shadow-green-400/50"></span>
              </span>
              <span class="text-white font-semibold text-sm md:text-base tracking-wide">1-3 décembre 2025</span>
              <div class="h-4 w-px bg-white/30"></div>
              <span class="text-white/90 text-sm md:text-base">Larnaka, Chypre</span>
            </div>
          </div>

          <!-- Carte principale avec effet glass -->
          <div class="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl shadow-black/30 p-8 md:p-12 mb-8 animate-fade-in-up">
            <!-- Reflet supérieur -->
            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

            <!-- Titre principal avec gradient -->
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-center mb-8 leading-tight">
              <span class="bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent drop-shadow-lg">
                Financement durable pour le climat, la biodiversité et l'eau
              </span>
            </h1>

            <p class="text-xl md:text-2xl text-center text-white/95 font-medium leading-relaxed mb-10 max-w-3xl mx-auto">
              Mobiliser les compétences et les innovations francophones
            </p>

            <!-- Informations clés dans des cartes glass -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <!-- Dates -->
              <div class="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 hover:bg-white/15 hover:scale-105 transition-all duration-300 shadow-lg">
                <div class="flex items-center gap-3 mb-2">
                  <div class="p-2 bg-white/20 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="text-left">
                    <p class="text-white/70 text-xs font-medium uppercase tracking-wide">Dates</p>
                    <p class="text-white font-bold text-lg">1-3 Déc 2025</p>
                  </div>
                </div>
              </div>

              <!-- Lieu -->
              <div class="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 hover:bg-white/15 hover:scale-105 transition-all duration-300 shadow-lg">
                <div class="flex items-center gap-3 mb-2">
                  <div class="p-2 bg-white/20 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div class="text-left">
                    <p class="text-white/70 text-xs font-medium uppercase tracking-wide">Lieu</p>
                    <p class="text-white font-bold text-lg">Larnaka & Nicosie</p>
                  </div>
                </div>
              </div>

              <!-- Participants -->
              <div class="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 hover:bg-white/15 hover:scale-105 transition-all duration-300 shadow-lg">
                <div class="flex items-center gap-3 mb-2">
                  <div class="p-2 bg-white/20 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div class="text-left">
                    <p class="text-white/70 text-xs font-medium uppercase tracking-wide">Participants</p>
                    <p class="text-white font-bold text-lg">40 participants</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bouton d'inscription avec effet glass -->
            <div class="flex justify-center">
              <a
                href="https://us06web.zoom.us/meeting/register/kF1ZvrOeRcuVIaGkBwc0jw"
                target="_blank"
                rel="noopener noreferrer"
                class="group relative inline-flex items-center gap-3 bg-white/95 backdrop-blur-xl border-2 border-white/40 text-blue-600 font-bold px-10 py-5 rounded-2xl cursor-pointer shadow-2xl shadow-black/30 hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <!-- Effet de brillance au survol -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <svg class="w-7 h-7 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 10H5V7h14v10zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-2v6l-2.5-2.5L13 14v-6l2.5 2.5L18 8z"/>
                </svg>
                <span class="relative z-10 text-lg">S'inscrire au direct Zoom</span>
                <svg class="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>

          <!-- Organisateurs avec effet glass -->
          <div class="flex justify-center items-center gap-6 flex-wrap animate-fade-in">
            <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 shadow-xl">
              <p class="text-white/80 text-sm font-medium">Une initiative de</p>
            </div>
            <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-xl hover:bg-white/15 transition-all duration-300">
              <p class="text-white font-bold text-lg">République de Chypre</p>
            </div>
            <div class="text-white/60 text-2xl">×</div>
            <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-xl hover:bg-white/15 transition-all duration-300">
              <p class="text-white font-bold text-lg">IFDD-OIF</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <nav class="flex items-center space-x-2 text-sm">
          <RouterLink to="/" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Accueil
          </RouterLink>
          <span class="text-gray-400 dark:text-gray-500">/</span>
          <RouterLink to="/programmations" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Programmations
          </RouterLink>
          <span class="text-gray-400 dark:text-gray-500">/</span>
          <span class="text-gray-900 dark:text-white font-medium">Séminaire Larnaka 2025</span>
        </nav>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <!-- Sélecteur de jours avec vidéos YouTube -->
      <section class="mb-16">
        <div class="text-center mb-8">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Direct - Jour {{ selectedDay }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Suivez le séminaire en direct sur YouTube
          </p>
        </div>

        <!-- Tabs pour les 3 jours -->
        <div class="flex flex-wrap justify-center gap-3 mb-8">
          <button
            @click="selectedDay = 1"
            :class="[
              'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer',
              selectedDay === 1
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            ]"
          >
            Jour 1 - Inspirer et connecter
          </button>
          <button
            @click="selectedDay = 2"
            :class="[
              'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer',
              selectedDay === 2
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            ]"
          >
            Jour 2 - Découvrir, outiller et co-créer
          </button>
          <button
            @click="selectedDay = 3"
            :class="[
              'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer',
              selectedDay === 3
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            ]"
          >
            Jour 3 - Ancrer et projeter
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

          <!-- Décompte compact avec animations -->
          <div v-if="!isLiveNow" class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-blue-900 dark:via-purple-900 dark:to-gray-900 p-8">
            <!-- Particules animées en arrière-plan -->
            <div class="absolute inset-0 overflow-hidden">
              <!-- Cercles flottants -->
              <div class="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-float"></div>
              <div class="absolute top-20 right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl animate-float-delayed"></div>
              <div class="absolute bottom-10 left-1/4 w-36 h-36 bg-blue-400/10 rounded-full blur-xl animate-float-slow"></div>
              <div class="absolute bottom-20 right-1/3 w-28 h-28 bg-white/5 rounded-full blur-2xl animate-float"></div>

              <!-- Grille animée -->
              <div class="absolute inset-0 opacity-10">
                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
              </div>
            </div>

            <div class="relative text-center z-10">
              <!-- Titre avec effet pulsant -->
              <div class="relative inline-block mb-8">
                <div class="absolute inset-0 bg-white/20 blur-xl animate-pulse"></div>
                <h3 class="relative text-xl md:text-2xl font-bold text-white flex items-center gap-3 justify-center">
                  <svg class="w-6 h-6 md:w-8 md:h-8 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Le direct commence dans
                </h3>
              </div>

              <!-- Compteur horizontal avec animations flip -->
              <div class="flex items-center justify-center gap-3 md:gap-6 mb-6">
                <div v-for="(unit, key) in timeRemaining" :key="key" class="flex flex-col items-center">
                  <!-- Carte flip animée -->
                  <div class="relative perspective-1000">
                    <div class="countdown-card bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-xl px-4 py-3 min-w-[60px] md:min-w-[80px] border-2 border-white/30 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                      <div class="text-3xl md:text-4xl font-black text-white tabular-nums drop-shadow-lg countdown-number">
                        {{ String(unit.value).padStart(2, '0') }}
                      </div>
                      <!-- Reflet -->
                      <div class="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-xl pointer-events-none"></div>
                    </div>
                  </div>
                  <div class="text-white/90 text-xs md:text-sm mt-2 uppercase tracking-wider font-bold">{{ unit.label }}</div>
                </div>
              </div>

              <!-- Message avec icône -->
              <div class="flex items-center justify-center gap-2 text-white/70 text-sm">
                <svg class="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <p>La diffusion commencera automatiquement</p>
              </div>
            </div>
          </div>

          <!-- Container responsive pour l'iframe YouTube (16:9) -->
          <div v-else class="relative w-full bg-black" style="padding-bottom: 56.25%;">
            <iframe
              :key="selectedDay"
              class="absolute top-0 left-0 w-full h-full"
              :src="getYoutubeEmbedUrl(selectedDay)"
              :title="`Direct YouTube - Jour ${selectedDay}`"
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
            Contexte et Justification
          </h2>
        </div>
        <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow border border-gray-200/50 dark:border-gray-700/50">
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
              Dans la dynamique de son adhésion en tant que membre de plein droit de l'Organisation internationale de la Francophonie (OIF) lors du XIXe Sommet de la Francophonie à Paris (France) en 2024, la République de Chypre souhaite impulser une dynamique d’échanges et de coopération francophone sur les défis planétaires de notre époque tels que le développement durable, le changement climatique, la préservation de la biodiversité ou la gestion durable des ressources en eau. En prélude de sa présidence tournante de l’Union européenne en 2026, le gouvernement de Chypre, en partenariat avec l’Institut de la Francophonie pour le développement durable (IFDD), organe subsidiaire de l’Organisation internationale de la Francophonie (OIF) organise un séminaire stratégique et formatif du 01 au 03 décembre 2025 à Larnaka et à Nicosie (Chypre), qui vise à valoriser les modèles novateurs de financement durable, à renforcer les compétences techniques, à décloisonner les dialogues entre institutions, territoires et communautés financières et à catalyser l’action francophone sur les mécanismes innovants de financement durable.
            </p>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              Dans un contexte climatique critique où les États doivent concrétiser leurs engagements de neutralité carbone et de protection des ressources naturelles, notamment l’eau et où les fenêtres de financement internationaux se rarifient, l’enjeu est double : faire le point sur les progrès réalisés à mi-parcours de la programmation 2024–2027 sur la finance durable et identifier les leviers de transformation financière pour l’environnement, le climat et l’eau.
            </p>
          </div>
        </div>
      </section>

      <!-- Objectifs -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Objectifs du Séminaire
          </h2>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span class="text-white font-bold text-lg">1</span>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Partager des retours d'expérience
                </h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Partager des retours d'expérience sur les mécanismes internationaux de financement vert (FVC, GEF, Fonds d'adaptation).
                </p>
              </div>
            </div>
          </div>
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span class="text-white font-bold text-lg">2</span>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Favoriser l'émergence de modèles hybrides
                </h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Favoriser l'émergence de modèles hybrides de financement (fonds fiduciaires, financement philanthropique, budget vert, RSE, etc.).
                </p>
              </div>
            </div>
          </div>
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span class="text-white font-bold text-lg">3</span>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Stimuler une approche innovante
                </h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Stimuler une approche innovante de la finance climatique, en particulier dans les milieux insulaires.
                </p>
              </div>
            </div>
          </div>
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span class="text-white font-bold text-lg">4</span>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Renforcer le réseau francophone
                </h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Renforcer le réseau francophone d'expertise et de coopération sur les financements liés au climat, à la biodiversité, à la désertification et à l'eau.
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
            Programme Détaillé
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Modération : <span class="font-semibold text-gray-900 dark:text-white">Adel BEN YOUSSEF</span>
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
                <div class="mb-6 md:mb-0 md:pr-12">
                  <!-- Version Mobile : Badge horizontal compact -->
                  <div class="md:hidden bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-4 mb-6">
                    <div class="flex items-center justify-between text-white">
                      <div class="flex items-center gap-4">
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center min-w-[70px]">
                          <div class="text-3xl font-black">01</div>
                          <div class="text-xs font-semibold uppercase">Déc</div>
                        </div>
                        <div>
                          <div class="text-xs font-semibold uppercase tracking-wide opacity-90">Jour 1</div>
                          <div class="text-lg font-bold">Inspirer et connecter</div>
                          <div class="text-xs opacity-75">2025</div>
                        </div>
                      </div>
                      <div class="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Version Desktop : Badge vertical -->
                  <div class="hidden md:block md:text-right">
                    <div class="relative inline-block">
                      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-orange-500 transform hover:scale-105 transition-all duration-300">
                        <div class="text-center">
                          <div class="text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider mb-2">Jour 1</div>
                          <div class="text-4xl font-black text-gray-900 dark:text-white mb-1">01</div>
                          <div class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Décembre</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">2025</div>
                          <div class="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                            <div class="text-xs font-medium text-orange-600 dark:text-orange-400">Inspirer et connecter</div>
                          </div>
                        </div>
                      </div>
                      <!-- Petit triangle pointer vers les sessions -->
                      <div class="absolute -right-3 top-1/2 transform -translate-y-1/2">
                        <div class="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-orange-500"></div>
                      </div>
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
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">Matinée</h4>
                    </div>
                    <div class="space-y-3">
                      <div class="bg-orange-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">Discours d'ouverture</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs">Gouvernement chypriote, OIF-IFDD</p>
                      </div>
                      <div class="bg-orange-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">Panel inaugural sur les tendances mondiales de la finance durable et les priorités francophones</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-orange-600 dark:text-orange-400">Intervenants :</span> Mohamed Adil Youssfi, POTONGO Emmanu KIMPUKI et Mathieu BIAOU</p>
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
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">Après-midi</h4>
                    </div>
                    <div class="space-y-3">
                      <div class="bg-orange-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">Session thématique : Panorama des mécanismes internationaux de financement (FVC, FA, GBFF du FEM, etc.)</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-orange-600 dark:text-orange-400">Intervenant :</span> Alioune SEYDI</p>
                      </div>
                      <div class="bg-orange-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">Échange interactif : Défis d'accès aux financements pour les petits États et territoires insulaires et perspectives francophones</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-orange-600 dark:text-orange-400">Intervenants :</span> Bryan CHUNG-KAI-TO, Manuel ROSÁRIO et Lucie Nmara NAUKA</p>
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
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">Soirée</h4>
                    </div>
                    <div class="bg-orange-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-800/30">
                      <p class="text-gray-600 dark:text-gray-400 text-sm">Cocktail de réseautage</p>
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
                <!-- En-tête (mobile en premier, desktop à droite) -->
                <div class="order-first md:order-2 mb-6 md:mb-0 md:pl-12">
                  <!-- Version Mobile : Badge horizontal compact -->
                  <div class="md:hidden bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-4 mb-6">
                    <div class="flex items-center justify-between text-white">
                      <div class="flex items-center gap-4">
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center min-w-[70px]">
                          <div class="text-3xl font-black">02</div>
                          <div class="text-xs font-semibold uppercase">Déc</div>
                        </div>
                        <div>
                          <div class="text-xs font-semibold uppercase tracking-wide opacity-90">Jour 2</div>
                          <div class="text-lg font-bold">Découvrir, outiller et co-créer</div>
                          <div class="text-xs opacity-75">2025</div>
                        </div>
                      </div>
                      <div class="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Version Desktop : Badge vertical -->
                  <div class="hidden md:block">
                    <div class="relative inline-block">
                      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-green-500 transform hover:scale-105 transition-all duration-300">
                        <div class="text-center">
                          <div class="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider mb-2">Jour 2</div>
                          <div class="text-4xl font-black text-gray-900 dark:text-white mb-1">02</div>
                          <div class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Décembre</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">2025</div>
                          <div class="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                            <div class="text-xs font-medium text-green-600 dark:text-green-400">Découvrir, outiller et co-créer</div>
                          </div>
                        </div>
                      </div>
                      <!-- Petit triangle pointer vers les sessions (à gauche pour jour 2) -->
                      <div class="absolute -left-3 top-1/2 transform -translate-y-1/2">
                        <div class="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-green-500"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sessions (à gauche sur desktop, après date sur mobile) -->
                <div class="md:order-1 md:pr-12 space-y-4">
                  <!-- Matinée culturelle -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-l-4 md:border-l-0 md:border-r-4 border-green-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">Matinée culturelle</h4>
                    </div>
                    <div class="bg-green-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
                      <p class="text-gray-600 dark:text-gray-400 text-sm">• Visite guidée et activité culturelle</p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">• Moment d'échanges informels entre participants (réseautage interculturel)</p>
                    </div>
                  </div>

                  <!-- Après-midi -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-l-4 md:border-l-0 md:border-r-4 border-green-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">Après-midi</h4>
                    </div>
                    <div class="space-y-3">
                      <div class="bg-green-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">Clinique technique : accréditation, priorisation des projets et formulation de notes conceptuelles</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-green-600 dark:text-green-400">Intervenants :</span> Hubert RUZIBIZA et Gerard Aimé MISTOUL, expérience du Gabon</p>
                      </div>
                      <div class="bg-green-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">Lancement d'un hackathon climatique. L'intelligence artificielle au service de la finance durable, de l'environnement, du climat et de l'eau</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-green-600 dark:text-green-400">Intervenants :</span> Mohammed Amine ZAROUK et Chaimae El KOUFI</p>
                      </div>
                    </div>
                  </div>

                  <!-- Soirée -->
                  <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl border-l-4 md:border-l-0 md:border-r-4 border-green-500 transition-all duration-300 hover:scale-[1.02]">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">Soirée</h4>
                    </div>
                    <div class="space-y-3">
                      <div class="bg-green-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">Rencontre inversée "pitch à rebours" sur le Fonds pour les Changements Climatiques en Afrique de la Banque africaine de développement</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-green-600 dark:text-green-400">Intervenant :</span> Bela Emile KOUAKOU</p>
                      </div>
                      <div class="bg-green-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">Témoignage inspirant d'une bonne pratique en Francophonie : le cas de la Budgétisation verte</p>
                        <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-green-600 dark:text-green-400">Intervenante :</span> Sédjidé Akouvi KOUHOUE</p>
                      </div>
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
                <div class="mb-6 md:mb-0 md:pr-12">
                  <!-- Version Mobile : Badge horizontal compact -->
                  <div class="md:hidden bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-4 mb-6">
                    <div class="flex items-center justify-between text-white">
                      <div class="flex items-center gap-4">
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center min-w-[70px]">
                          <div class="text-3xl font-black">03</div>
                          <div class="text-xs font-semibold uppercase">Déc</div>
                        </div>
                        <div>
                          <div class="text-xs font-semibold uppercase tracking-wide opacity-90">Jour 3</div>
                          <div class="text-lg font-bold">Ancrer et projeter</div>
                          <div class="text-xs opacity-75">2025</div>
                        </div>
                      </div>
                      <div class="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Version Desktop : Badge vertical -->
                  <div class="hidden md:block md:text-right">
                    <div class="relative inline-block">
                      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-blue-500 transform hover:scale-105 transition-all duration-300">
                        <div class="text-center">
                          <div class="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider mb-2">Jour 3</div>
                          <div class="text-4xl font-black text-gray-900 dark:text-white mb-1">03</div>
                          <div class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Décembre</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">2025</div>
                          <div class="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                            <div class="text-xs font-medium text-blue-600 dark:text-blue-400">Ancrer et projeter</div>
                          </div>
                        </div>
                      </div>
                      <!-- Petit triangle pointer vers les sessions -->
                      <div class="absolute -right-3 top-1/2 transform -translate-y-1/2">
                        <div class="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-blue-500"></div>
                      </div>
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
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">Matin</h4>
                    </div>
                    <div class="bg-blue-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-blue-200/30 dark:border-blue-800/30">
                      <p class="font-semibold text-gray-900 dark:text-white text-sm mb-1">Carrefour des solutions de financement innovant</p>
                      <p class="text-gray-600 dark:text-gray-400 text-xs"><span class="font-medium text-blue-600 dark:text-blue-400">Intervenants :</span> Alain Sandy Liva RAHARIJAONA et Abdoulaye SOUAIBOU IDRISSOU</p>
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
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">Après-midi</h4>
                    </div>
                    <div class="bg-blue-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-blue-200/30 dark:border-blue-800/30">
                      <p class="text-gray-600 dark:text-gray-400 text-sm">• Restitution des travaux + Recommandations stratégiques</p>
                      <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">• Présentation du plan d'action post-séminaire et des engagements symboliques des participants (communiqué prospectif)</p>
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
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white">Clôture</h4>
                    </div>
                    <div class="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
                      <p class="text-gray-800 dark:text-gray-200 text-sm font-medium">Cérémonie de clôture officielle et remise des certificats</p>
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
            Public Cible
          </h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
            <div class="flex flex-col items-center text-center gap-4">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="text-gray-900 dark:text-white font-medium leading-relaxed">Représentants des institutions gouvernementales bénéficiaires d'assistance technique</p>
            </div>
          </div>
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
            <div class="flex flex-col items-center text-center gap-4">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="text-gray-900 dark:text-white font-medium leading-relaxed">Experts en environnement et en finance durable</p>
            </div>
          </div>
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
            <div class="flex flex-col items-center text-center gap-4">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="text-gray-900 dark:text-white font-medium leading-relaxed">Représentants de bailleurs de fonds</p>
            </div>
          </div>
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
            <div class="flex flex-col items-center text-center gap-4">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="text-gray-900 dark:text-white font-medium leading-relaxed">Acteurs francophones dynamiques dans la finance climatique</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Résultats attendus -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Résultats Attendus
          </h2>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed">Organisation d'une session de partage d'expériences sur l'accréditation, la priorisation de projets et la formulation de notes conceptuelles</p>
            </div>
          </div>
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed">Soutenir une rencontre inversée "pitchs à rebours" pour donner l'occasion aux bailleurs de présenter leurs attentes en matière de priorités de financement durable – inversant ainsi le rôle traditionnel bénéficiaire/donateur</p>
            </div>
          </div>
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed">Présentation d'un parcours immersif territorial en intégrant une simulation interactive de cas concrets de financements durables autour des défis climatiques ou de biodiversité pour ancrer les apprentissages dans le réel en termes de vision, besoins et solutions</p>
            </div>
          </div>
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed">Lancement d'un hackathon climatique francophone sur l'IA appliquée à la finance durable et l'emploi des jeunes</p>
            </div>
          </div>
          <div class="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed">Soutien au co-apprentissage numérique : prolonger le séminaire via une série de micro-vidéos post-séminaire sur la contribution de Chypre à la coopération francophone en matière d'environnement, de climat et de finance durable dans l'espace francophone</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Partenaires -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Partenaires
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
            <div class="flex items-center gap-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium">République de Chypre</span>
            </div>
            <div class="flex items-center gap-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium">Cyprus Aid - Agence chypriote de développement</span>
            </div>
            <div class="flex items-center gap-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium">Organisation internationale de la Francophonie (OIF)</span>
            </div>
            <div class="flex items-center gap-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium">Institut de la Francophonie pour le développement durable (IFDD)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Personnes ressources -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Personnes Ressources
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
                Madame Marina Christofi
              </h3>
            </div>
            <div class="space-y-3">
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Fonction</p>
                <p class="font-semibold text-gray-900 dark:text-white">
                  Correspondante nationale, Chargée de mission pour les affaires francophones
                </p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Organisation</p>
                <p class="text-gray-700 dark:text-gray-300">
                  Ministère des Affaires Etrangères, République de Chypre
                </p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Adresse</p>
                <p class="text-gray-700 dark:text-gray-300">
                  Avenue Proedrikou Megarou, 1447 Nicosie
                </p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <a href="mailto:machristofi@mfa.gov.cy" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  machristofi@mfa.gov.cy
                </a>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Téléphone</p>
                <p class="text-gray-700 dark:text-gray-300 font-medium">+357 22 651135</p>
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
                Madame E. Lionelle Ngo-Samnick
              </h3>
            </div>
            <div class="space-y-3">
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Fonction</p>
                <p class="font-semibold text-gray-900 dark:text-white">
                  Coordonnatrice de projet
                </p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Organisation</p>
                <p class="text-gray-700 dark:text-gray-300">
                  Institut de la Francophonie pour le développement durable (IFDD), Organisation internationale de la Francophonie
                </p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Adresse</p>
                <p class="text-gray-700 dark:text-gray-300">
                  200, Chemin Ste-Foy, bureau 1.40, Québec, QC, Canada, G1R 1T3
                </p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <a href="mailto:lionelle.ngo-samnick@francophonie.org" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  lionelle.ngo-samnick@francophonie.org
                </a>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Téléphone</p>
                <p class="text-gray-700 dark:text-gray-300 font-medium">+1 418 692-5727 Poste 8242</p>
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
              Rejoignez-nous !
            </h2>
            <p class="text-white/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Participez à cet événement majeur de la Francophonie sur le climat et contribuez à façonner l'avenir de notre planète.
            </p>
            <RouterLink to="/programmations"
                        class="group inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-white transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105">
              <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Retour aux programmations</span>
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHead } from '@vueuse/head'

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
  title: 'Financement durable pour le climat, la biodiversité et l’eau : mobiliser les compétences et les innovations francophones 2025',
  meta: [
    {
      name: 'description',
      content: 'Séminaire francophone sur le climat et le développement durable du 1er au 3 décembre 2025 à Larnaka et Nicosie, Chypre. Renforcement des capacités et échange de bonnes pratiques.'
    },
    {
      property: 'og:title',
      content: 'Financement durable pour le climat, la biodiversité et l’eau : mobiliser les compétences et les innovations francophones 2025'
    },
    {
      property: 'og:description',
      content: 'Séminaire francophone sur le climat et le développement durable du 1er au 3 décembre 2025 à Larnaka et Nicosie, Chypre. Renforcement des capacités et échange de bonnes pratiques.'
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

/* Animations pour les particules flottantes */
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
  }
  25% {
    transform: translateY(-20px) translateX(10px) scale(1.05);
  }
  50% {
    transform: translateY(-40px) translateX(-10px) scale(1.1);
  }
  75% {
    transform: translateY(-20px) translateX(10px) scale(1.05);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
  }
  25% {
    transform: translateY(20px) translateX(-15px) scale(0.95);
  }
  50% {
    transform: translateY(40px) translateX(15px) scale(0.9);
  }
  75% {
    transform: translateY(20px) translateX(-15px) scale(0.95);
  }
}

@keyframes float-slow {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) translateX(20px) rotate(5deg);
  }
  66% {
    transform: translateY(30px) translateX(-20px) rotate(-5deg);
  }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 10s ease-in-out infinite;
}

.animate-float-slow {
  animation: float-slow 12s ease-in-out infinite;
}

/* Animation de rotation lente pour l'horloge */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

/* Perspective pour l'effet 3D */
.perspective-1000 {
  perspective: 1000px;
}

/* Animation flip pour les chiffres qui changent */
@keyframes flip {
  0% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0deg);
  }
}

.countdown-card {
  transform-style: preserve-3d;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.countdown-card:hover {
  transform: scale(1.1) rotateY(5deg);
}

/* Animation pour les chiffres */
.countdown-number {
  transition: all 0.3s ease;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Animation bounce subtile */
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.countdown-card {
  animation: bounce-subtle 2s ease-in-out infinite;
}

.countdown-card:nth-child(1) {
  animation-delay: 0s;
}

.countdown-card:nth-child(2) {
  animation-delay: 0.2s;
}

.countdown-card:nth-child(3) {
  animation-delay: 0.4s;
}

.countdown-card:nth-child(4) {
  animation-delay: 0.6s;
}

/* Animations pour le Hero Section Glass Design */
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.8s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out 0.2s both;
}

.animate-fade-in {
  animation: fade-in 1s ease-out 0.4s both;
}

/* Animation pour les particules flottantes */
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(-20px) translateX(10px);
  }
  66% {
    transform: translateY(-10px) translateX(-10px);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(-15px) translateX(-15px);
  }
  66% {
    transform: translateY(-25px) translateX(5px);
  }
}

@keyframes float-slow {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-30px) translateX(15px);
  }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 10s ease-in-out infinite;
}

.animate-float-slow {
  animation: float-slow 12s ease-in-out infinite;
}

/* Perspective pour les effets 3D */
.perspective-1000 {
  perspective: 1000px;
}
</style>
