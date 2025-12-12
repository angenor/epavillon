<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section - Design compact pour voir le bouton sans scroll -->
    <div class="relative overflow-hidden min-h-screen flex flex-col">
      <!-- Image de fond -->
      <div class="absolute inset-0">
        <img src="/images/example/event_banniere_par_defaut_32_9_v3.jpg" :alt="t('cop30Workshop.title')" class="absolute inset-0 w-full h-full object-cover scale-105">
        <!-- Overlay gradient moderne -->
        <div class="absolute inset-0 bg-gradient-to-br from-green-600/70 via-green-700/70 to-green-900/70 dark:from-green-900/70 dark:via-green-950/70 dark:to-gray-900/70"></div>
        <!-- Effet de vignette -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]"></div>
      </div>

      <!-- Particules flottantes décoratives -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div class="absolute top-20 right-20 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div class="absolute bottom-20 left-1/3 w-56 h-56 bg-emerald-400/5 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <!-- Contenu principal centré -->
      <div class="relative flex-1 flex items-center justify-center px-4 py-8">
        <div class="max-w-4xl mx-auto w-full">
          <!-- Badge avec effet glass moderne -->
          <div class="flex justify-center mb-4 animate-fade-in-down">
            <div class="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-full shadow-2xl shadow-black/20">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400 shadow-lg shadow-green-400/50"></span>
              </span>
              <span class="text-white font-semibold text-sm tracking-wide">{{ t('cop30Workshop.cop30') }}</span>
              <div class="h-4 w-px bg-white/30"></div>
              <span class="text-white/90 text-sm">{{ t('common.online') }}</span>
            </div>
          </div>

          <!-- Carte principale avec effet glass -->
          <div class="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl shadow-black/30 p-6 md:p-8 animate-fade-in-up">
            <!-- Titre principal -->
            <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-center mb-6 leading-tight">
              <span class="bg-gradient-to-r from-white via-green-50 to-white bg-clip-text text-transparent drop-shadow-lg">
                {{ t('cop30Workshop.title') }}
              </span>
            </h1>

            <!-- Informations clés -->
            <div class="flex flex-wrap justify-center gap-3 mb-6">
              <!-- Horaire -->
              <div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <div class="p-1.5 bg-white/20 rounded-lg">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="text-left">
                  <p class="text-white/70 text-xs font-medium uppercase tracking-wide">{{ t('cop30Workshop.scheduleLabel') }}</p>
                  <p class="text-white font-bold">{{ t('cop30Workshop.schedule') }}</p>
                </div>
              </div>

              <!-- Format -->
              <div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <div class="p-1.5 bg-white/20 rounded-lg">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="text-left">
                  <p class="text-white/70 text-xs font-medium uppercase tracking-wide">{{ t('cop30Workshop.formatLabel') }}</p>
                  <p class="text-white font-bold">{{ t('cop30Workshop.format') }}</p>
                </div>
              </div>
            </div>

            <!-- Bouton d'inscription principal -->
            <div class="flex justify-center mb-6">
              <a
                href="https://us06web.zoom.us/meeting/register/Eyq74XySSFyl_TeSbe9k3g"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex items-center gap-3 bg-white text-green-700 font-bold px-8 py-4 rounded-2xl hover:bg-green-50 cursor-pointer shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 10H5V7h14v10zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-2v6l-2.5-2.5L13 14v-6l2.5 2.5L18 8z"/>
                </svg>
                <span class="text-base md:text-lg">{{ t('cop30Workshop.registerButton') }}</span>
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <!-- Organisateur -->
            <div class="flex justify-center items-center gap-3 text-white/80 text-sm">
              <span>{{ t('cop30Workshop.organizerLabel') }} :</span>
              <span class="font-semibold text-white">IFDD-OIF</span>
            </div>
          </div>

          <!-- Lien retour -->
          <div class="flex justify-center mt-6 animate-fade-in">
            <RouterLink
              to="/programmations"
              class="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {{ t('cop30Workshop.backToProgrammations') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useHead } from '@vueuse/head'

const { t } = useI18n()

// Meta tags pour le SEO
useHead({
  title: () => t('cop30Workshop.title'),
  meta: [
    {
      name: 'description',
      content: () => t('cop30Workshop.metaDescription')
    },
    {
      property: 'og:title',
      content: () => t('cop30Workshop.title')
    },
    {
      property: 'og:description',
      content: () => t('cop30Workshop.metaDescription')
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
})
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

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
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-float-slow {
  animation: float-slow 10s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-fade-in-down {
  animation: fade-in-down 0.8s ease-out forwards;
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  animation-delay: 0.2s;
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
  animation-delay: 0.4s;
}
</style>
