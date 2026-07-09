<template>
  <div class="bg-white dark:bg-gray-900">
    <!-- ==================== Héro compact ==================== -->
    <section class="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950">
      <!-- Décor -->
      <div class="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-emerald-200/40 dark:bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -left-24 w-[380px] h-[380px] rounded-full bg-sky-200/40 dark:bg-sky-500/10 blur-3xl pointer-events-none"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div class="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <div>
            <span class="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-3.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <font-awesome-icon :icon="['fas', 'globe']" />
              {{ t('fphn.hero.badge') }}
            </span>

            <h1 class="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
              {{ t('fphn.hero.title') }}
              <span class="block mt-1.5 text-xl sm:text-2xl font-semibold italic text-emerald-600 dark:text-emerald-400">
                {{ t('fphn.hero.titleAccent') }}
              </span>
            </h1>

            <p class="mt-3.5 flex items-center gap-3 font-medium text-gray-600 dark:text-gray-300">
              <span class="w-8 h-0.5 bg-amber-400 shrink-0"></span>
              {{ t('fphn.hero.subtitle') }}
            </p>

            <!-- Infos clés -->
            <div class="mt-5 flex flex-wrap gap-2">
              <span
                v-for="chip in chips"
                :key="chip.icon"
                class="inline-flex items-center gap-2 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-200"
              >
                <font-awesome-icon :icon="['fas', chip.icon]" class="text-emerald-600 dark:text-emerald-400 text-xs" />
                {{ t(chip.key) }}
              </span>
            </div>

            <!-- Décompteur + inscription -->
            <div class="mt-6 flex flex-wrap items-end gap-x-8 gap-y-5">
              <FphnCountdown :start-date="EVENT_START" :end-date="EVENT_END" />
              <div class="flex flex-col gap-1.5">
                <a
                  :href="REGISTRATION_URL"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-7 py-3.5 shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <font-awesome-icon :icon="['fas', 'user-plus']" />
                  {{ t('fphn.hero.register') }}
                </a>
                <span class="text-xs text-gray-500 dark:text-gray-400 text-center">{{ t('fphn.hero.note') }}</span>
              </div>
            </div>
          </div>

          <!-- Couverture + partenaires -->
          <div class="flex flex-col gap-4 max-w-xl mx-auto w-full lg:max-w-none">
            <!-- Image de couverture (déposer cover.jpg dans public/images/fphn2026/) -->
            <div class="relative rounded-2xl overflow-hidden shadow-xl shadow-sky-900/10 border border-gray-200 dark:border-gray-700 aspect-video">
              <img
                v-if="!coverMissing"
                :src="COVER_IMAGE"
                :alt="t('fphn.hero.title')"
                class="w-full h-full object-cover"
                @error="coverMissing = true"
              />
              <div
                v-else
                class="absolute inset-0 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-sky-300 dark:border-sky-700 rounded-2xl bg-gradient-to-br from-sky-100 via-white to-emerald-100 dark:from-sky-950 dark:via-gray-900 dark:to-emerald-950"
              >
                <font-awesome-icon :icon="['fas', 'image']" class="text-3xl text-sky-300 dark:text-sky-700" />
                <span class="text-[10px] uppercase tracking-widest text-sky-500/80 dark:text-sky-400/60">
                  {{ t('fphn.hero.coverPlaceholder') }}
                </span>
              </div>
            </div>

            <!-- Logos partenaires -->
            <div>
              <p class="text-center text-[9px] font-bold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500 mb-2">
                {{ t('fphn.partners.title') }}
              </p>
              <div class="flex justify-center items-stretch gap-3">
                <div
                  v-for="partner in partners"
                  :key="partner.acronym"
                  class="relative h-16 flex items-center justify-center bg-white dark:bg-white/95 rounded-xl border border-gray-100 dark:border-gray-700 px-4"
                  :class="partner.wide ? 'flex-[1.6]' : 'flex-1'"
                >
                  <img
                    v-if="!partner.missing.value"
                    :src="partner.logo"
                    :alt="partner.name"
                    class="max-h-11 max-w-full object-contain"
                    @error="partner.missing.value = true"
                  />
                  <div
                    v-else
                    class="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
                    :title="t('fphn.partners.logoPlaceholder')"
                  >
                    <span class="text-sm font-extrabold tracking-wide text-gray-400 dark:text-gray-500">{{ partner.acronym }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Onglets ==================== -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <!-- Barre d'onglets -->
      <div class="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="cursor-pointer inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-colors border-b-2 -mb-px"
          :class="activeTab === tab.id
            ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-500/10'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'"
        >
          <font-awesome-icon :icon="['fas', tab.icon]" class="text-xs" />
          {{ t(`fphn.tabs.${tab.id}`) }}
        </button>
      </div>

      <!-- Panneau : À propos -->
      <div v-show="activeTab === 'about'" class="pt-7">
        <div class="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div class="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300 text-justify">
            <p>{{ t('fphn.about.p1') }}</p>
            <p>{{ t('fphn.about.p2') }}</p>
          </div>
          <div class="space-y-5">
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300 text-justify">{{ t('fphn.about.p3') }}</p>
            <div class="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-emerald-500 dark:border-l-emerald-500 px-5 py-3.5 text-sm font-medium text-gray-600 dark:text-gray-300">
              <font-awesome-icon :icon="['fas', 'map-location-dot']" class="text-emerald-600 dark:text-emerald-400 mr-2" />
              {{ t('fphn.about.caseStudies') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Panneau : Objectifs & public -->
      <div v-show="activeTab === 'objectives'" class="pt-7 space-y-8">
        <div class="grid sm:grid-cols-2 gap-4">
          <div
            v-for="(objective, index) in objectives"
            :key="objective.icon"
            class="flex items-start gap-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 hover:border-teal-200 dark:hover:border-teal-700 hover:shadow-md transition-all"
          >
            <div class="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', objective.icon]" class="text-teal-700 dark:text-teal-300 text-sm" />
            </div>
            <div>
              <h3 class="font-bold text-sm text-gray-900 dark:text-white">{{ t(`fphn.objectives.item${index + 1}.title`) }}</h3>
              <p class="mt-1.5 text-[13px] leading-relaxed text-gray-600 dark:text-gray-400">{{ t(`fphn.objectives.item${index + 1}.text`) }}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-4">
            {{ t('fphn.audience.title') }}
          </h3>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="n in 5"
              :key="n"
              class="flex items-start gap-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 text-[13px] text-gray-600 dark:text-gray-300 shadow-sm"
            >
              <font-awesome-icon :icon="['fas', 'circle-check']" class="text-emerald-500 mt-0.5 shrink-0 text-xs" />
              {{ t(`fphn.audience.item${n}`) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Panneau : Intervenants -->
      <div v-show="activeTab === 'speakers'" class="pt-7">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">{{ t('fphn.speakers.subtitle') }}</p>
        <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <FphnSpeakerCard v-for="speaker in speakers" :key="speaker.photo" :speaker="speaker" />
        </div>
      </div>

      <!-- Panneau : Programme -->
      <div v-show="activeTab === 'programme'" class="pt-7">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ t('fphn.programme.subtitle') }}</p>
        <div class="relative pl-8 max-w-4xl">
          <!-- Ligne verticale -->
          <div class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-500/10 dark:from-emerald-400 dark:to-emerald-400/10"></div>

          <div v-for="(item, index) in programme" :key="index" class="relative pb-5 last:pb-0">
            <!-- Point -->
            <span class="absolute -left-[29px] top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-gray-900 border-[3px] border-emerald-500 dark:border-emerald-400 ring-4 ring-emerald-500/10"></span>

            <div class="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors px-5 py-4">
              <div class="flex items-center flex-wrap gap-2.5">
                <span class="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 tabular-nums">
                  {{ item.duration }} {{ t('fphn.programme.minutes') }}
                </span>
                <h3 class="font-bold text-sm text-gray-900 dark:text-white">{{ t(`fphn.programme.item${index + 1}.title`) }}</h3>
              </div>
              <p class="mt-2 text-[13px] leading-relaxed text-gray-600 dark:text-gray-400">{{ t(`fphn.programme.item${index + 1}.text`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Bandeau CTA ==================== -->
    <section class="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div class="text-center sm:text-left">
          <h2 class="text-xl font-extrabold text-white">{{ t('fphn.cta.title') }}</h2>
          <p class="mt-1 text-sm text-emerald-50/85">{{ t('fphn.cta.note') }}</p>
        </div>
        <a
          :href="REGISTRATION_URL"
          target="_blank"
          rel="noopener"
          class="shrink-0 inline-flex items-center gap-2.5 rounded-full bg-white text-emerald-700 hover:text-emerald-600 font-bold px-8 py-3.5 shadow-lg shadow-emerald-900/25 hover:-translate-y-0.5 hover:shadow-xl transition-all cursor-pointer"
        >
          <font-awesome-icon :icon="['fas', 'user-plus']" />
          {{ t('fphn.cta.button') }}
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSEO } from '@/composables/useSEO'
import FphnCountdown from '@/components/fphn/FphnCountdown.vue'
import FphnSpeakerCard from '@/components/fphn/FphnSpeakerCard.vue'

const { t } = useI18n()

// 14 juillet 2026, 13h15 – 14h45, heure de New York (EDT)
const EVENT_START = '2026-07-14T13:15:00-04:00'
const EVENT_END = '2026-07-14T14:45:00-04:00'
const REGISTRATION_URL = 'https://meetoecd1.zoom.us/meeting/register/yu8YbosuRBC7BOnclai_dA'

// Visuel officiel de diffusion (16:9) utilisé comme couverture
const COVER_IMAGE = '/images/Visuel-Diffusion-14-juillet.jpg'
const coverMissing = ref(false)

const partners = [
  { acronym: 'OCDE', name: 'OCDE', logo: '/images/logo_ocde-2.png.webp', missing: ref(false) },
  { acronym: 'IFDD · OIF', name: 'IFDD — Organisation internationale de la Francophonie', logo: '/images/OIF-ifdd-logo.png', wide: true, missing: ref(false) },
]

const chips = [
  { icon: 'calendar-days', key: 'fphn.hero.date' },
  { icon: 'clock', key: 'fphn.hero.time' },
  { icon: 'location-dot', key: 'fphn.hero.location' },
  { icon: 'language', key: 'fphn.hero.interpretation' },
]

const tabs = [
  { id: 'about', icon: 'circle-info' },
  { id: 'objectives', icon: 'bullseye' },
  { id: 'speakers', icon: 'users' },
  { id: 'programme', icon: 'list-check' },
]
const activeTab = ref('about')

const objectives = [
  { icon: 'book-open' },
  { icon: 'users' },
  { icon: 'earth-africa' },
  { icon: 'comments' },
]

// Photos : public/images/fphn2026/speakers/<fichier>
const speakers = [
  { name: 'M. Michel Xavier Biang', roleKey: 'fphn.speakers.roles.biang', org: 'OIF', photo: '/images/fphn2026/speakers/biang.jpg', initials: 'MB' },
  { name: 'M. Thomas Schnoell', roleKey: 'fphn.speakers.roles.schnoell', org: 'OCDE', photo: '/images/fphn2026/speakers/schnoell.jpg', initials: 'TS' },
  { name: 'M. Frantisek Ruzicka', roleKey: 'fphn.speakers.roles.ruzicka', org: 'OCDE', photo: '/images/fphn2026/speakers/ruzicka.jpg', initials: 'FR' },
  { name: 'M. Juan Casado-Asensio', roleKey: 'fphn.speakers.roles.casado', org: 'OCDE', photo: '/images/fphn2026/speakers/casado.jpg', initials: 'JC' },
  { name: 'M. Tounao Kiri', roleKey: 'fphn.speakers.roles.kiri', org: 'IFDD-OIF', photo: '/images/fphn2026/speakers/kiri.jpg', initials: 'TK' },
  { nameKey: 'fphn.speakers.names.armenia', roleKey: 'fphn.speakers.roles.armenia', photo: '/images/fphn2026/speakers/armenie.jpg', initials: 'AM', tbc: true },
  { nameKey: 'fphn.speakers.names.france', roleKey: 'fphn.speakers.roles.france', photo: '/images/fphn2026/speakers/france.jpg', initials: 'FR', tbc: true },
  { nameKey: 'fphn.speakers.names.madagascar', roleKey: 'fphn.speakers.roles.madagascar', photo: '/images/fphn2026/speakers/madagascar.jpg', initials: 'MG', tbc: true },
  { nameKey: 'fphn.speakers.names.adaptationFund', roleKey: 'fphn.speakers.roles.adaptationFund', photo: '/images/fphn2026/speakers/fonds-adaptation.jpg', initials: 'FA', tbc: true },
]

const programme = [
  { duration: 5 },
  { duration: 15 },
  { duration: 40 },
  { duration: 25 },
  { duration: 5 },
]

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
