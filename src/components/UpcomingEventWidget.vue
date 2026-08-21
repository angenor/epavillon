<template>
  <div
    v-if="event"
    @click="goToEvent"
    class="upcoming-event-card group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:scale-[1.02]"
  >
    <!-- Image de fond (bannière de l'événement) -->
    <div class="absolute inset-0 z-0">
      <template v-if="bannerUrl">
        <img
          :src="bannerUrl"
          :alt="event.title"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-br from-orange-950/90 via-orange-900/75 to-amber-950/90"></div>
      </template>
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-orange-900 via-orange-950 to-amber-950 flex items-center justify-center"
      >
        <font-awesome-icon
          :icon="['fas', 'calendar-alt']"
          class="text-orange-300/25 text-7xl transition-transform duration-700 group-hover:scale-110"
        />
      </div>
    </div>

    <!-- Effet shimmer animé -->
    <div class="absolute inset-0 z-10 opacity-30 upcoming-event-shimmer pointer-events-none"></div>

    <!-- Contenu -->
    <div class="relative z-20 p-4">
      <!-- Badge supérieur -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2 bg-orange-400/20 backdrop-blur-md border border-orange-300/40 px-2.5 py-1 rounded-full">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-300"></span>
          </span>
          <span class="text-orange-100 text-[10px] font-bold uppercase tracking-widest">
            {{ t('event.status.upcoming') }}
          </span>
        </div>
        <span class="text-[10px] font-semibold text-white/70 uppercase tracking-wider">
          {{ event.acronym || event.year }}
        </span>
      </div>

      <!-- Logo de l'événement -->
      <div v-if="event.logo_url" class="mb-3">
        <div class="inline-flex items-center px-2 py-1.5 rounded-md bg-white/90 backdrop-blur-sm border border-white/20">
          <img :src="event.logo_url" :alt="event.acronym || event.title" class="h-7 w-auto max-w-[120px] object-contain">
        </div>
      </div>

      <!-- Titre principal -->
      <h3 class="text-white font-bold text-base leading-tight mb-1 line-clamp-2 font-maverick">
        {{ event.title }}
      </h3>
      <p v-if="location" class="text-orange-100/90 text-xs italic mb-3 line-clamp-1">
        {{ location }}
      </p>

      <!-- Infos clés -->
      <div class="space-y-1.5 mb-3">
        <div v-if="dateLabel" class="flex items-center gap-2 text-white/90 text-xs">
          <div class="w-6 h-6 rounded-md bg-orange-400/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <svg class="w-3 h-3 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <span class="font-medium">{{ dateLabel }}</span>
        </div>
        <div v-if="remainingDays !== null" class="flex items-center gap-2 text-white/90 text-xs">
          <div class="w-6 h-6 rounded-md bg-orange-400/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <svg class="w-3 h-3 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="font-medium">
            {{ t('event.submissionDeadline') }} : {{ remainingDays }} {{ t('event.daysRemaining') }}
          </span>
        </div>
      </div>

      <!-- CTA -->
      <div class="flex items-center justify-between pt-3 border-t border-white/15">
        <span class="text-orange-200 text-xs font-semibold">
          {{ isSubmissionOpen ? t('event.submitActivity') : t('common.learnMore') }}
        </span>
        <div class="w-7 h-7 rounded-full bg-orange-400/30 backdrop-blur-md flex items-center justify-center group-hover:bg-orange-400/50 group-hover:translate-x-1 transition-all duration-300">
          <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { PACO_EVENT_ID } from '@/composables/paco/constants'
import { eventDetailPath } from '@/utils/eventSlug'
import { getEventBanner } from '@/utils/eventBanner'

const { t, locale } = useI18n()
const router = useRouter()
const { supabase } = useSupabase()

const event = ref(null)

// Date de début effective, en présentiel ou en ligne
const startDate = (e) => e?.in_person_start_date || e?.online_start_datetime || null

const loadUpcomingEvent = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id, title, acronym, year, logo_url, city,
        event_status, submission_status, submission_deadline,
        online_start_datetime, in_person_start_date, in_person_end_date,
        banner_high_quality_16_9_url, banner_low_quality_16_9_url,
        banner_high_quality_32_9_url, banner_low_quality_32_9_url,
        country:countries(name_fr, name_en)
      `)
      .eq('event_status', 'upcoming')
      .neq('id', PACO_EVENT_ID)

    if (error) throw error

    // L'événement à venir le plus proche (les dates vivent dans deux colonnes,
    // le tri se fait donc côté client)
    event.value = (data || [])
      .slice()
      .sort((a, b) => {
        const dateA = startDate(a)
        const dateB = startDate(b)
        if (!dateA) return 1
        if (!dateB) return -1
        return new Date(dateA) - new Date(dateB)
      })[0] || null
  } catch (err) {
    console.error('Erreur lors du chargement de l\'événement à venir:', err)
  }
}

const bannerUrl = computed(() => getEventBanner(event.value, '16_9'))

const location = computed(() => {
  const e = event.value
  if (!e) return ''
  const country = locale.value === 'fr' ? e.country?.name_fr : e.country?.name_en
  return [e.city, country].filter(Boolean).join(', ')
})

const dateLabel = computed(() => {
  const e = event.value
  if (!e) return ''

  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  const format = (value) => new Date(value)
    .toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-GB', options)

  if (e.in_person_start_date) {
    return e.in_person_end_date && e.in_person_end_date !== e.in_person_start_date
      ? `${format(e.in_person_start_date)} - ${format(e.in_person_end_date)}`
      : format(e.in_person_start_date)
  }

  return e.online_start_datetime ? format(e.online_start_datetime) : ''
})

const isSubmissionOpen = computed(() => event.value?.submission_status === 'open')

// Jours restants avant la date limite de soumission (uniquement si elle est ouverte)
const remainingDays = computed(() => {
  const deadline = event.value?.submission_deadline
  if (!deadline || !isSubmissionOpen.value) return null

  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  return days > 0 ? days : null
})

const goToEvent = () => {
  if (event.value) router.push(eventDetailPath(event.value))
}

onMounted(loadUpcomingEvent)
</script>

<style scoped>
/* Shimmer, dans la continuité des cartes PACO et FPHN */
@keyframes upcoming-event-shimmer-anim {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.upcoming-event-shimmer {
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(253, 186, 116, 0.25) 50%,
    transparent 70%
  );
  animation: upcoming-event-shimmer-anim 3.5s ease-in-out infinite;
}

.upcoming-event-card {
  box-shadow:
    0 0 0 1px rgba(253, 186, 116, 0.2),
    0 10px 30px -10px rgba(234, 88, 12, 0.4);
}

.upcoming-event-card:hover {
  box-shadow:
    0 0 0 1px rgba(253, 186, 116, 0.4),
    0 20px 40px -10px rgba(234, 88, 12, 0.6);
}
</style>
