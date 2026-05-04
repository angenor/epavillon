<template>
  <div class="text-white space-y-6">
    <!-- Banner -->
    <PacoBanner :banner-url="bannerUrl" :edition="edition" />

    <!-- Status badge + Title -->
    <div>
      <div class="flex items-center gap-3 mb-2">
        <PacoStatusBadge :status="status" :color="statusColor" :label="statusLabel" />
        <span class="text-xs text-white/40 uppercase tracking-wider">
          {{ t('paco.presentation.seriesLabel') }} #{{ edition }}
        </span>
      </div>
      <p class="text-xs sm:text-sm font-semibold uppercase tracking-widest text-green-400 mb-1">
        {{ t(`${i18nPrefix}.editionLabel`) }}
      </p>
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
        {{ t(`${i18nPrefix}.title`) }}
      </h1>
      <p class="text-base sm:text-lg text-white/80 mt-1 font-light">
        {{ t(`${i18nPrefix}.subtitle`) }}
      </p>
    </div>

    <!-- Info badges -->
    <div class="flex flex-wrap gap-2 items-center">
      <div class="flex items-center gap-2 bg-gradient-to-r from-green-500/30 to-emerald-500/20 border border-green-400/50 rounded-full px-4 py-2 text-sm sm:text-base shadow-lg shadow-green-500/10">
        <font-awesome-icon :icon="['fas', 'calendar-days']" class="text-green-300 text-sm" />
        <span class="text-white font-bold tracking-wide">{{ t(`${i18nPrefix}.dateLabel`) }}</span>
      </div>
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs sm:text-sm">
        <font-awesome-icon :icon="['fas', 'clock']" class="text-green-400 text-xs" />
        <span class="text-white/90">{{ t(`${i18nPrefix}.timeLabel`) }}</span>
      </div>
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs sm:text-sm">
        <font-awesome-icon :icon="['fas', 'video']" class="text-green-400 text-xs" />
        <span class="text-white/90">{{ t('paco.presentation.formatLabel') }}</span>
      </div>
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs sm:text-sm">
        <font-awesome-icon :icon="['fas', 'language']" class="text-green-400 text-xs" />
        <span class="text-white/90">{{ t('paco.presentation.languageLabel') }}</span>
      </div>
    </div>

    <!-- Context -->
    <section class="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-2">
        <font-awesome-icon :icon="['fas', 'circle-info']" class="mr-1.5" />
        {{ t('paco.presentation.contextTitle') }}
      </h2>
      <p class="text-sm text-white/70 leading-relaxed whitespace-pre-line">
        {{ t(`${i18nPrefix}.context`) }}
      </p>
    </section>

    <!-- Objectives -->
    <section class="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
        <font-awesome-icon :icon="['fas', 'bullseye']" class="mr-1.5" />
        {{ t('paco.presentation.objectivesTitle') }}
      </h2>

      <!-- Objectif général mis en évidence -->
      <div class="bg-green-500/10 border-l-4 border-green-400 rounded-r-xl px-4 py-3 mb-4">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-green-400 mb-1">
          {{ t('paco.presentation.objectiveGeneralLabel') }}
        </p>
        <p class="text-sm sm:text-base text-white font-medium leading-relaxed">
          {{ t(`${i18nPrefix}.objectiveGeneral`) }}
        </p>
      </div>

      <!-- Objectifs spécifiques -->
      <p class="text-[11px] font-semibold uppercase tracking-wider text-green-400/80 mb-2">
        {{ t('paco.presentation.specificObjectivesLabel') }}
      </p>
      <ul class="space-y-2">
        <li
          v-for="(obj, idx) in objectivesList"
          :key="idx"
          class="flex items-start gap-2 text-sm text-white/70"
        >
          <font-awesome-icon :icon="['fas', 'check']" class="text-green-400 text-xs mt-1 shrink-0" />
          <span>{{ obj }}</span>
        </li>
      </ul>
    </section>

    <!-- Content themes -->
    <section>
      <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
        <font-awesome-icon :icon="['fas', 'layer-group']" class="mr-1.5" />
        {{ t('paco.presentation.contentTitle') }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div
          v-for="(item, idx) in contentList"
          :key="idx"
          class="bg-white/5 border border-white/10 rounded-xl p-3"
        >
          <p class="text-sm font-medium text-white mb-0.5">
            {{ item.title }}
          </p>
          <p class="text-xs text-white/50 leading-relaxed">
            {{ item.desc }}
          </p>
        </div>
      </div>
    </section>

    <!-- Target audience -->
    <section>
      <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
        <font-awesome-icon :icon="['fas', 'users']" class="mr-1.5" />
        {{ t('paco.presentation.targetTitle') }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(target, idx) in targetsList"
          :key="idx"
          class="bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs text-white/70"
        >
          {{ target }}
        </span>
      </div>
    </section>

    <!-- Panelists -->
    <section>
      <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
        <font-awesome-icon :icon="['fas', 'microphone']" class="mr-1.5" />
        {{ t('paco.presentation.panelistsTitle') }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <PacoPanelistCard
          v-for="panelist in panelists"
          :key="panelist.id"
          :panelist="panelist"
          :i18n-prefix="i18nPrefix"
        />
      </div>
    </section>

    <!-- Partner logos -->
    <PacoPartnerLogos :partners="partners" />

    <!-- Share button -->
    <PacoShareButton />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePacoWebinarData } from '@/composables/paco/usePacoWebinarData'
import PacoBanner from './PacoBanner.vue'
import PacoStatusBadge from './PacoStatusBadge.vue'
import PacoPanelistCard from './PacoPanelistCard.vue'
import PacoPartnerLogos from './PacoPartnerLogos.vue'
import PacoShareButton from './PacoShareButton.vue'

const props = defineProps({
  sessionData: { type: Object, default: null }
})

const { t, te } = useI18n()
const { currentSession, getSessionStatus, getStatusLabel, getStatusColor } = usePacoWebinarData()

// Source de données: prop sessionData OU session courante (rétrocompatibilité)
const session = computed(() => props.sessionData || currentSession.value)

const i18nPrefix = computed(() => session.value?.i18nPrefix || 'paco.presentation')
const edition = computed(() => session.value?.edition ?? 2)
const bannerUrl = computed(() => session.value?.bannerUrl || session.value?.coverImage || null)
const panelists = computed(() => session.value?.panelists || [])
const partners = computed(() => session.value?.partners || [])

const status = computed(() => getSessionStatus(session.value))
const statusLabel = computed(() => getStatusLabel(status.value))
const statusColor = computed(() => getStatusColor(status.value))

// Listes dynamiques basées sur les clés i18n disponibles (supporte un nombre variable d'items par session)
const objectivesList = computed(() => {
  const list = []
  let i = 0
  while (te(`${i18nPrefix.value}.objectives.${i}`)) {
    list.push(t(`${i18nPrefix.value}.objectives.${i}`))
    i++
  }
  return list
})

const contentList = computed(() => {
  const list = []
  let i = 0
  while (te(`${i18nPrefix.value}.content.${i}.title`)) {
    list.push({
      title: t(`${i18nPrefix.value}.content.${i}.title`),
      desc: t(`${i18nPrefix.value}.content.${i}.desc`)
    })
    i++
  }
  return list
})

const targetsList = computed(() => {
  // Priorité aux publics cibles spécifiques à la session, sinon liste globale
  const prefix = te(`${i18nPrefix.value}.targets.0`)
    ? `${i18nPrefix.value}.targets`
    : 'paco.presentation.targets'
  const list = []
  let i = 0
  while (te(`${prefix}.${i}`)) {
    list.push(t(`${prefix}.${i}`))
    i++
  }
  return list
})
</script>
