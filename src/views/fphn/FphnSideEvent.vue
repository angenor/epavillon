<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-900">
    <div class="py-6 px-4 sm:px-6 lg:py-8 lg:px-8">
      <div class="w-full max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-start">
          <!-- ==================== Colonne gauche : présentation ==================== -->
          <div class="lg:col-span-3 order-2 lg:order-1 text-white space-y-6">
            <!-- Direct YouTube (pendant l'évènement, remplace la bannière) -->
            <section v-if="countdownState === 'live'">
              <div class="flex items-center gap-2.5 mb-3">
                <span class="inline-flex items-center gap-2 rounded-full bg-red-500/20 border border-red-400/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-red-300">
                  <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  {{ t('fphn.live.badge') }}
                </span>
                <font-awesome-icon :icon="['fab', 'youtube']" class="text-red-500 text-xl" />
              </div>
              <div v-if="YOUTUBE_LIVE_ID" class="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/30 bg-black">
                <iframe
                  :src="`https://www.youtube-nocookie.com/embed/${YOUTUBE_LIVE_ID}?autoplay=1`"
                  class="w-full h-full"
                  frameborder="0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowfullscreen
                  :title="t('fphn.live.noticeTitle')"
                ></iframe>
              </div>
              <div v-else class="aspect-video rounded-2xl border border-white/10 bg-black/40 flex flex-col items-center justify-center gap-3">
                <font-awesome-icon :icon="['fab', 'youtube']" class="text-red-500 text-4xl animate-pulse" />
                <p class="text-sm text-white/60">{{ t('fphn.live.waiting') }}</p>
              </div>
            </section>

            <!-- Bannière (visuel officiel, hors direct) -->
            <div v-else class="w-full rounded-2xl overflow-hidden">
              <img
                :src="COVER_IMAGE"
                :alt="t('fphn.hero.title')"
                class="w-full aspect-video object-cover"
              />
            </div>

            <!-- Annonce du futur direct (avant l'évènement) -->
            <section
              v-if="countdownState === 'upcoming'"
              class="flex items-center gap-4 bg-gradient-to-r from-red-500/10 via-white/5 to-white/5 border border-red-400/25 rounded-2xl p-4"
            >
              <div class="relative shrink-0 w-12 h-12 rounded-xl bg-red-500/15 border border-red-400/30 flex items-center justify-center">
                <font-awesome-icon :icon="['fab', 'youtube']" class="text-red-400 text-2xl" />
                <span class="absolute -top-1 -right-1 flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <div>
                <p class="text-sm font-bold text-white">{{ t('fphn.live.noticeTitle') }}</p>
                <p class="text-xs text-white/60 leading-relaxed mt-0.5">{{ t('fphn.live.noticeText') }}</p>
              </div>
            </section>

            <!-- Badge + titre -->
            <div>
              <p class="text-xs sm:text-sm font-semibold uppercase tracking-widest text-green-400 mb-1">
                {{ t('fphn.hero.badge') }}
              </p>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
                {{ t('fphn.hero.title') }}
              </h1>
              <p class="text-base sm:text-lg text-white/80 mt-1 font-light italic">
                {{ t('fphn.hero.titleAccent') }}
              </p>
              <p class="text-sm text-green-300/90 mt-2 font-medium">
                {{ t('fphn.hero.subtitle') }}
              </p>
            </div>

            <!-- Question d'accroche -->
            <p class="text-lg sm:text-xl font-semibold text-white leading-snug border-l-4 border-green-400 bg-green-500/5 rounded-r-xl pl-4 pr-3 py-3">
              {{ t('fphn.hero.hook') }}
            </p>

            <!-- Badges d'infos -->
            <div class="flex flex-wrap gap-2 items-center">
              <div class="flex items-center gap-2 bg-gradient-to-r from-green-500/30 to-emerald-500/20 border border-green-400/50 rounded-full px-4 py-2 text-sm sm:text-base shadow-lg shadow-green-500/10">
                <font-awesome-icon :icon="['fas', 'calendar-days']" class="text-green-300 text-sm" />
                <span class="text-white font-bold tracking-wide">{{ t('fphn.hero.date') }}</span>
              </div>
              <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs sm:text-sm">
                <font-awesome-icon :icon="['fas', 'clock']" class="text-green-400 text-xs" />
                <span class="text-white/90">{{ t('fphn.hero.time') }}</span>
              </div>
              <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs sm:text-sm">
                <font-awesome-icon :icon="['fas', 'globe']" class="text-green-400 text-xs" />
                <span class="text-green-300">{{ localTimeLabel }} ({{ localTimeZoneLabel }})</span>
              </div>
              <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs sm:text-sm">
                <font-awesome-icon :icon="['fas', 'location-dot']" class="text-green-400 text-xs" />
                <span class="text-white/90">{{ t('fphn.hero.location') }}</span>
              </div>
              <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs sm:text-sm">
                <font-awesome-icon :icon="['fas', 'language']" class="text-green-400 text-xs" />
                <span class="text-white/90">{{ t('fphn.hero.interpretation') }}</span>
              </div>
            </div>

            <!-- Contexte -->
            <section class="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-2">
                <font-awesome-icon :icon="['fas', 'circle-info']" class="mr-1.5" />
                {{ t('fphn.about.title') }}
              </h2>
              <p class="text-sm sm:text-[15px] text-white/90 font-medium leading-relaxed mb-3">
                {{ t('fphn.about.lead') }}
              </p>
              <div class="space-y-3 text-sm text-white/70 leading-relaxed">
                <p>{{ t('fphn.about.p1') }}</p>
                <p>{{ t('fphn.about.p2') }}</p>
                <p>{{ t('fphn.about.p3') }}</p>
              </div>
              <div class="mt-4 bg-green-500/10 border-l-4 border-green-400 rounded-r-xl px-4 py-2.5 text-sm text-white/80">
                <font-awesome-icon :icon="['fas', 'map-location-dot']" class="text-green-400 mr-1.5" />
                {{ t('fphn.about.caseStudies') }}
              </div>
            </section>

            <!-- Objectifs -->
            <section class="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
                <font-awesome-icon :icon="['fas', 'bullseye']" class="mr-1.5" />
                {{ t('fphn.objectives.title') }}
              </h2>
              <ul class="space-y-3">
                <li v-for="n in 4" :key="n" class="flex items-start gap-2.5 text-sm text-white/70">
                  <font-awesome-icon :icon="['fas', 'check']" class="text-green-400 text-xs mt-1 shrink-0" />
                  <span>
                    <span class="font-semibold text-white">{{ t(`fphn.objectives.item${n}.title`) }} —</span>
                    {{ t(`fphn.objectives.item${n}.text`) }}
                  </span>
                </li>
              </ul>
            </section>

            <!-- Programme -->
            <section>
              <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
                <font-awesome-icon :icon="['fas', 'list-check']" class="mr-1.5" />
                {{ t('fphn.programme.title') }}
              </h2>
              <p class="text-xs text-white/50 mb-3">{{ t('fphn.programme.subtitle') }}</p>
              <div class="space-y-2">
                <div
                  v-for="(item, index) in programme"
                  :key="index"
                  class="bg-white/5 border border-white/10 rounded-xl p-3.5"
                >
                  <div class="flex items-center flex-wrap gap-2.5">
                    <span class="shrink-0 rounded-full bg-green-500/15 border border-green-400/30 text-green-300 text-[11px] font-bold px-2.5 py-0.5 tabular-nums">
                      {{ item.duration }} {{ t('fphn.programme.minutes') }}
                    </span>
                    <p class="text-sm font-medium text-white">{{ t(`fphn.programme.item${index + 1}.title`) }}</p>
                  </div>
                  <p class="text-xs text-white/50 leading-relaxed mt-1.5">{{ t(`fphn.programme.item${index + 1}.text`) }}</p>
                </div>
              </div>
            </section>

            <!-- Public ciblé -->
            <section>
              <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
                <font-awesome-icon :icon="['fas', 'users']" class="mr-1.5" />
                {{ t('fphn.audience.title') }}
              </h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs text-white/70"
                >
                  {{ t(`fphn.audience.item${n}`) }}
                </span>
              </div>
            </section>

            <!-- Intervenants -->
            <section>
              <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
                <font-awesome-icon :icon="['fas', 'microphone']" class="mr-1.5" />
                {{ t('fphn.speakers.title') }}
              </h2>
              <p class="text-sm text-white/60 leading-relaxed mb-3">
                <font-awesome-icon :icon="['fas', 'earth-africa']" class="text-green-400 mr-1.5" />
                {{ t('fphn.speakers.lead') }}
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="speaker in speakers"
                  :key="speaker.photo"
                  class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3"
                >
                  <!-- Photo ou placeholder (déposer l'image dans public/images/fphn2026/speakers/) -->
                  <div v-if="!missingPhotos.has(speaker.photo)" class="w-16 h-16 rounded-full overflow-hidden shrink-0">
                    <img
                      :src="speaker.photo"
                      :alt="speakerName(speaker)"
                      class="w-full h-full object-cover object-top"
                      @error="missingPhotos.add(speaker.photo)"
                    />
                  </div>
                  <div
                    v-else
                    class="w-16 h-16 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0"
                    :title="t('fphn.speakers.photoPlaceholder')"
                  >
                    <span class="text-sm font-extrabold text-green-300">{{ speaker.initials }}</span>
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center flex-wrap gap-1.5">
                      <p class="text-sm font-semibold text-white">{{ speakerName(speaker) }}</p>
                      <span
                        v-if="speaker.tbc"
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-400/30 text-amber-300"
                      >
                        {{ t('fphn.speakers.tbc') }}
                      </span>
                    </div>
                    <p v-if="speaker.org" class="text-xs text-green-400">{{ speaker.org }}</p>
                    <p class="text-xs text-white/50 line-clamp-2" :title="t(speaker.roleKey)">{{ t(speaker.roleKey) }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Logos partenaires -->
            <section>
              <p class="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">
                {{ t('fphn.partners.title') }}
              </p>
              <div class="flex justify-center items-stretch gap-3">
                <div
                  v-for="partner in partners"
                  :key="partner.acronym"
                  class="h-16 flex items-center justify-center bg-white rounded-xl px-5"
                  :class="partner.wide ? 'flex-[1.6]' : 'flex-1'"
                >
                  <img :src="partner.logo" :alt="partner.name" class="max-h-11 max-w-full object-contain" />
                </div>
              </div>
            </section>

            <!-- Hashtags de la campagne -->
            <div class="flex flex-wrap justify-center gap-2 pt-1">
              <span
                v-for="tag in HASHTAGS"
                :key="tag"
                class="text-xs font-medium text-green-300/70 bg-green-500/5 border border-green-400/15 rounded-full px-3 py-1"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- ==================== Colonne droite : panneau inscription (sticky) ==================== -->
          <div class="lg:col-span-2 lg:sticky lg:top-24 order-1 lg:order-2">
            <div class="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">
              <!-- Horaires -->
              <div class="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1 mb-5">
                <div class="flex items-center justify-center gap-2 text-sm text-white/80">
                  <font-awesome-icon :icon="['fas', 'calendar-days']" class="text-green-400 text-xs" />
                  <span>{{ t('fphn.hero.date') }}</span>
                </div>
                <div class="flex items-center justify-center gap-2 text-sm text-white/80">
                  <font-awesome-icon :icon="['fas', 'clock']" class="text-green-400 text-xs" />
                  <span>{{ t('fphn.hero.time') }}</span>
                </div>
                <div class="flex items-center justify-center gap-2 text-sm text-green-400 font-medium">
                  <font-awesome-icon :icon="['fas', 'globe']" class="text-xs" />
                  <span>{{ localTimeLabel }} ({{ localTimeZoneLabel }})</span>
                </div>
              </div>

              <!-- Décompteur -->
              <div v-if="countdownState === 'upcoming'" class="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
                <p class="text-xs text-white/50 uppercase tracking-wide mb-2 text-center">{{ t('fphn.countdown.title') }}</p>
                <div class="flex items-center justify-center gap-3">
                  <div class="text-center">
                    <span class="text-2xl font-bold text-white tabular-nums">{{ formattedTime?.days ?? '00' }}</span>
                    <span class="block text-xs text-white/40">{{ t('fphn.countdown.days') }}</span>
                  </div>
                  <span class="text-xl text-white/30 font-light">:</span>
                  <div class="text-center">
                    <span class="text-2xl font-bold text-white tabular-nums">{{ formattedTime?.hours ?? '00' }}</span>
                    <span class="block text-xs text-white/40">{{ t('fphn.countdown.hours') }}</span>
                  </div>
                  <span class="text-xl text-white/30 font-light">:</span>
                  <div class="text-center">
                    <span class="text-2xl font-bold text-white tabular-nums">{{ formattedTime?.minutes ?? '00' }}</span>
                    <span class="block text-xs text-white/40">{{ t('fphn.countdown.minutes') }}</span>
                  </div>
                  <span class="text-xl text-white/30 font-light">:</span>
                  <div class="text-center">
                    <span class="text-2xl font-bold text-white tabular-nums">{{ formattedTime?.seconds ?? '00' }}</span>
                    <span class="block text-xs text-white/40">{{ t('fphn.countdown.seconds') }}</span>
                  </div>
                </div>
              </div>

              <!-- En cours / terminé -->
              <div v-else-if="countdownState === 'live'" class="flex items-center justify-center gap-3 bg-red-500/15 border border-red-400/30 rounded-xl p-3 mb-5">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span class="text-sm font-semibold text-red-300">{{ t('fphn.countdown.live') }}</span>
              </div>
              <div v-else class="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 mb-5">
                <font-awesome-icon :icon="['fas', 'circle-check']" class="text-green-400" />
                <span class="text-sm font-medium text-white/70">{{ t('fphn.countdown.ended') }}</span>
              </div>

              <!-- Inscription -->
              <h2 class="text-xl font-bold text-white text-center mb-2">{{ t('fphn.cta.title') }}</h2>
              <p class="text-sm text-white/60 text-center mb-5">{{ t('fphn.cta.text') }}</p>
              <a
                :href="REGISTRATION_URL"
                target="_blank"
                rel="noopener"
                class="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold px-6 py-3.5 shadow-lg shadow-green-500/25 hover:shadow-xl transition-all cursor-pointer"
              >
                <font-awesome-icon :icon="['fas', 'user-plus']" />
                {{ t('fphn.hero.register') }}
              </a>
              <p class="text-xs text-white/40 text-center mt-3">{{ t('fphn.hero.note') }}</p>
              <p class="text-xs text-white/40 text-center mt-1">
                <font-awesome-icon :icon="['fas', 'language']" class="mr-1" />
                {{ t('fphn.hero.interpretation') }}
              </p>
              <p class="text-xs text-red-300/90 text-center mt-3 flex items-center justify-center gap-1.5">
                <font-awesome-icon :icon="['fab', 'youtube']" class="text-red-400" />
                {{ t('fphn.live.panelNote') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSEO } from '@/composables/useSEO'
import { useCountdown } from '@/composables/useCountdown'

const { t } = useI18n()

// 14 juillet 2026, 13h15 – 14h45, heure de New York (EDT)
const EVENT_START = '2026-07-14T13:15:00-04:00'
const EVENT_END = '2026-07-14T14:45:00-04:00'
const REGISTRATION_URL = 'https://meetoecd1.zoom.us/meeting/register/yu8YbosuRBC7BOnclai_dA'

// ID de la vidéo YouTube du direct — à renseigner le jour J (ex. 'dQw4w9WgXcQ').
// Tant qu'il est vide, un message d'attente s'affiche pendant l'évènement.
const YOUTUBE_LIVE_ID = ''

// Visuel officiel de diffusion (16:9) utilisé comme bannière
const COVER_IMAGE = '/images/Visuel-Diffusion-14-juillet.jpg'

const HASHTAGS = [
  '#HLPF2026', '#FinanceClimat', '#Biodiversité', '#ODD',
  '#DéveloppementDurable', '#Francophonie', '#IFDD', '#OIF', '#OCDE',
]

const partners = [
  { acronym: 'OCDE', name: 'OCDE', logo: '/images/logo_ocde-2.png' },
  { acronym: 'IFDD · OIF', name: 'IFDD — Organisation internationale de la Francophonie', logo: '/images/OIF-ifdd-logo.png', wide: true },
]

// Photos : public/images/fphn2026/speakers/<fichier>
// (le placeholder à initiales disparaît dès que le fichier existe)
const speakers = [
  { name: 'S.E. M. Michel Xavier Biang', roleKey: 'fphn.speakers.roles.biang', org: 'OIF', photo: '/images/fphn2026/speakers/Photo_SEM_Michel_Xavier_Biang.jpg', initials: 'MB' },
  { name: 'S.E. M. Thomas Schnöll', roleKey: 'fphn.speakers.roles.schnoell', org: 'OCDE', photo: '/images/fphn2026/speakers/schnoell.jpg', initials: 'TS' },
  { name: 'M. Frantisek Ruzicka', roleKey: 'fphn.speakers.roles.ruzicka', org: 'OCDE', photo: '/images/fphn2026/speakers/ruzicka.jpg', initials: 'FR' },
  { name: 'S.E. Mme Louise Pierrette Mvono', roleKey: 'fphn.speakers.roles.gabon', org: 'Gabon', photo: '/images/fphn2026/speakers/Photo_SEMme_Louise_Pierrette_Mvono.jpg', initials: 'LM', tbc: true },
  { name: 'S.E. M. Paruyr Hovhannisyan', roleKey: 'fphn.speakers.roles.armenia', org: 'Arménie', photo: '/images/fphn2026/speakers/Photo_Paruyr_Hovhannisyan.jpg', initials: 'PH' },
  { nameKey: 'fphn.speakers.names.france', roleKey: 'fphn.speakers.roles.france', org: 'France', photo: '/images/fphn2026/speakers/france.jpg', initials: 'FR', tbc: true },
  { name: 'M. Robert Krech', roleKey: 'fphn.speakers.roles.adaptationFund', org: 'Fonds d\'adaptation', photo: '/images/fphn2026/speakers/Photo_Robert_Krech.jpg', initials: 'RK' },
  { name: 'M. Tounao Kiri', roleKey: 'fphn.speakers.roles.kiri', org: 'IFDD-OIF', photo: '/images/fphn2026/speakers/kiri.jpg', initials: 'TK' },
]

const missingPhotos = reactive(new Set())

function speakerName(speaker) {
  return speaker.name || t(speaker.nameKey)
}

const programme = [
  { duration: 5 },
  { duration: 15 },
  { duration: 40 },
  { duration: 25 },
  { duration: 5 },
]

// Heure locale de l'utilisateur (convertie par le navigateur depuis l'heure de New York)
const localTimeLabel = computed(() => {
  const opts = { hour: '2-digit', minute: '2-digit' }
  const start = new Date(EVENT_START).toLocaleTimeString(undefined, opts)
  const end = new Date(EVENT_END).toLocaleTimeString(undefined, opts)
  return `${start} – ${end}`
})

// Ville du fuseau horaire de l'utilisateur (ex. "Europe/Paris" → "Paris")
const localCity = (() => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  const city = tz.split('/').pop()?.replace(/_/g, ' ')
  return city && city !== tz ? city : null
})()

const localTimeZoneLabel = computed(() => {
  if (!localCity) return t('fphn.hero.localTimeFallback')
  // Élision française : « heure de Abidjan » → « heure d'Abidjan »
  return t('fphn.hero.localTime', { city: localCity })
    .replace(/\bde ([AEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜ])/u, "d'$1")
})

// Décompteur
const { timeRemaining, formattedTime } = useCountdown(() => EVENT_START)
const countdownState = computed(() => {
  if (!timeRemaining.value?.isExpired) return 'upcoming'
  return Date.now() < new Date(EVENT_END).getTime() ? 'live' : 'ended'
})

// SEO — meta tags pour le partage sur les réseaux sociaux
useSEO({
  title: 'Accès aux financements climat et biodiversité — Évènement parallèle FPHN 2026',
  description: 'Lancement du rapport OCDE–OIF/IFDD « Accès aux financements climat et biodiversité : des engagements mondiaux à l\'action pays ». 14 juillet 2026, 13h15–14h45 (New York).',
  image: 'https://epavillonclimatique.francophonie.org/images/Visuel-Diffusion-14-juillet.jpg',
  url: 'https://epavillonclimatique.francophonie.org/fphn2026',
  type: 'website',
  og: { type: 'website' },
  twitter: { card: 'summary_large_image' },
})
</script>
