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
    <div class="flex flex-wrap gap-2">
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs sm:text-sm">
        <font-awesome-icon :icon="['fas', 'calendar-days']" class="text-green-400 text-xs" />
        <span class="text-white/90">{{ t(`${i18nPrefix}.dateLabel`) }}</span>
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
      <p class="text-sm text-white/70 leading-relaxed">
        {{ t(`${i18nPrefix}.context`) }}
      </p>
    </section>

    <!-- Objectives -->
    <section class="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
        <font-awesome-icon :icon="['fas', 'bullseye']" class="mr-1.5" />
        {{ t('paco.presentation.objectivesTitle') }}
      </h2>
      <p class="text-xs text-white/50 mb-3 italic">
        {{ t(`${i18nPrefix}.objectiveGeneral`) }}
      </p>
      <ul class="space-y-2">
        <li
          v-for="i in 4"
          :key="i"
          class="flex items-start gap-2 text-sm text-white/70"
        >
          <font-awesome-icon :icon="['fas', 'check']" class="text-green-400 text-xs mt-1 shrink-0" />
          <span>{{ t(`${i18nPrefix}.objectives.${i - 1}`) }}</span>
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
          v-for="i in 4"
          :key="i"
          class="bg-white/5 border border-white/10 rounded-xl p-3"
        >
          <p class="text-sm font-medium text-white mb-0.5">
            {{ t(`${i18nPrefix}.content.${i - 1}.title`) }}
          </p>
          <p class="text-xs text-white/50 leading-relaxed">
            {{ t(`${i18nPrefix}.content.${i - 1}.desc`) }}
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
          v-for="i in 7"
          :key="i"
          class="bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs text-white/70"
        >
          {{ t(`paco.presentation.targets.${i - 1}`) }}
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

const { t } = useI18n()
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
</script>
