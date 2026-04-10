<template>
  <div>
    <!-- Top Pagination -->
    <div v-if="!loading && !error && filteredRegistrants.length && (totalPages > 1 || isSearching)" class="flex items-center justify-between mb-3">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <template v-if="isSearching">
          {{ displayedTotal }} {{ t('paco.admin.searchResults') }}
        </template>
        <template v-else>
          {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, total) }}
          {{ t('paco.admin.paginationOf') }} {{ total }}
        </template>
      </p>
      <div v-if="totalPages > 1 && !isSearching" class="flex gap-1">
        <button
          @click="$emit('page-change', page - 1)"
          :disabled="page <= 1"
          class="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </button>
        <template v-for="p in totalPages" :key="'top-' + p">
          <button
            v-if="p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)"
            @click="$emit('page-change', p)"
            class="cursor-pointer px-3 py-1.5 text-sm rounded-lg transition"
            :class="p === page
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            {{ p }}
          </button>
          <span
            v-else-if="p === 2 && page > 3 || p === totalPages - 1 && page < totalPages - 2"
            class="px-2 py-1.5 text-sm text-gray-400"
          >…</span>
        </template>
        <button
          @click="$emit('page-change', page + 1)"
          :disabled="page >= totalPages"
          class="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div class="p-6 space-y-4 animate-pulse">
        <div v-for="i in 5" :key="i" class="flex gap-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!registrants.length" class="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
      <p class="text-gray-500 dark:text-gray-400">{{ t('paco.admin.noRegistrants') }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
      <table class="min-w-[900px] w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[14%]">{{ t('paco.admin.name') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[14%]">{{ t('paco.admin.email') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[7%]">{{ t('paco.admin.session') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[9%]">{{ t('paco.admin.filter.type.label') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">{{ t('paco.admin.gender') }} / {{ t('paco.admin.ageProfile') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[12%]">{{ t('paco.admin.location') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[11%]">{{ t('paco.admin.professionalStatus') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">{{ t('paco.admin.organization') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[9%]">{{ t('paco.admin.registrationDate') }}</th>
            <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[4%]"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="r in filteredRegistrants"
            :key="r.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            :class="r.isFallback && !r.recoveredAt ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''"
          >
            <td class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100">
              <div class="truncate font-medium">{{ resolvedFirstName(r) || notSpecified }} {{ resolvedLastName(r) || '' }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="truncate">{{ r.email }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <span
                v-if="r.sessionEdition != null"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="r.sessionEdition === 1
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'"
              >
                {{ t('paco.admin.filterSession', { n: r.sessionEdition }) }}
              </span>
              <span v-else class="text-xs text-gray-400">{{ notSpecified }}</span>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <PacoStatusBadge
                v-if="r.isFallback"
                variant="fallback"
                :recovered="!!r.recoveredAt"
              />
              <span v-else class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('paco.admin.filter.type.standard') }}
              </span>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="truncate">{{ genderLabel(resolvedGender(r)) }}</div>
              <div class="truncate text-xs text-gray-400 dark:text-gray-500">{{ ageLabel(resolvedAgeProfile(r)) }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="truncate">{{ resolvedCity(r) || notSpecified }}</div>
              <div class="truncate text-xs text-gray-400 dark:text-gray-500">{{ countryName(r) }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="truncate">{{ statusLabel(resolvedProfessionalStatus(r)) }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="truncate">{{ resolvedOrganization(r) || notSpecified }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="truncate">{{ formatDate(r.registrationDate) }}</div>
              <div class="truncate text-xs text-gray-400 dark:text-gray-500">{{ formatTime(r.registrationDate) }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  v-if="r.isFallback"
                  @click="openFallbackDetails(r)"
                  class="cursor-pointer text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                  :title="t('paco.admin.fallback.detailsTitle')"
                >
                  <font-awesome-icon :icon="['fas', 'circle-info']" />
                </button>
                <button
                  @click="$emit('delete', r)"
                  :disabled="deleting === r.id"
                  class="cursor-pointer text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  :title="t('paco.admin.deleteRegistrant')"
                >
                  <font-awesome-icon :icon="['fas', 'trash-alt']" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Bottom Pagination -->
      <div v-if="totalPages > 1 || isSearching" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <template v-if="isSearching">
            {{ displayedTotal }} {{ t('paco.admin.searchResults') }}
          </template>
          <template v-else>
            {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, total) }}
            {{ t('paco.admin.paginationOf') }} {{ total }}
          </template>
        </p>
        <div class="flex gap-1">
          <button
            @click="$emit('page-change', page - 1)"
            :disabled="page <= 1"
            class="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" />
          </button>
          <template v-for="p in totalPages" :key="p">
            <button
              v-if="p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)"
              @click="$emit('page-change', p)"
              class="cursor-pointer px-3 py-1.5 text-sm rounded-lg transition"
              :class="p === page
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              {{ p }}
            </button>
            <span
              v-else-if="p === 2 && page > 3 || p === totalPages - 1 && page < totalPages - 2"
              class="px-2 py-1.5 text-sm text-gray-400"
            >…</span>
          </template>
          <button
            @click="$emit('page-change', page + 1)"
            :disabled="page >= totalPages"
            class="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modale : détails d'une inscription de secours (feature 005) -->
    <div
      v-if="fallbackDetailsRegistrant"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="closeFallbackDetails"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'circle-info']" class="text-amber-500" />
            {{ t('paco.admin.fallback.detailsTitle') }}
          </h3>
          <button
            @click="closeFallbackDetails"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            :title="t('common.close')"
          >
            <font-awesome-icon :icon="['fas', 'xmark']" class="text-xl" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-4 space-y-4">
          <!-- Identifiant & statut -->
          <div class="flex flex-wrap items-center gap-2">
            <PacoStatusBadge variant="fallback" :recovered="!!fallbackDetailsRegistrant.recoveredAt" />
            <span class="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
              {{ fallbackDetailsRegistrant.id }}
            </span>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                {{ t('paco.admin.registrationDate') }}
              </p>
              <p class="text-gray-900 dark:text-gray-100">
                {{ formatDate(fallbackDetailsRegistrant.registrationDate) }} — {{ formatTime(fallbackDetailsRegistrant.registrationDate) }}
              </p>
            </div>
            <div v-if="fallbackDetailsRegistrant.recoveredAt">
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                {{ t('paco.admin.fallback.recoveredAt') }}
              </p>
              <p class="text-gray-900 dark:text-gray-100">
                {{ formatDate(fallbackDetailsRegistrant.recoveredAt) }} — {{ formatTime(fallbackDetailsRegistrant.recoveredAt) }}
              </p>
            </div>
          </div>

          <!-- Erreur technique -->
          <div v-if="fallbackDetailsRegistrant.fallbackError">
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              {{ t('paco.admin.fallback.errorLabel') }}
            </p>
            <pre class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap break-all">{{ fallbackDetailsRegistrant.fallbackError }}</pre>
          </div>

          <!-- Payload JSON -->
          <div v-if="fallbackDetailsRegistrant.fallbackPayload">
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              {{ t('paco.admin.fallback.payloadLabel') }}
            </p>
            <pre class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-all max-h-64">{{ formattedPayload }}</pre>
          </div>

          <!-- Erreur mark-recovered -->
          <div v-if="markRecoveredError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p class="text-sm text-red-700 dark:text-red-300">{{ markRecoveredError }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="closeFallbackDetails"
            class="cursor-pointer px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {{ t('common.close') }}
          </button>
          <button
            v-if="!fallbackDetailsRegistrant.recoveredAt"
            @click="handleMarkRecovered"
            :disabled="markingRecovered"
            class="cursor-pointer px-4 py-2 text-sm rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <font-awesome-icon :icon="['fas', markingRecovered ? 'spinner' : 'check']" :class="markingRecovered ? 'animate-spin' : ''" class="mr-1" />
            {{ t('paco.admin.fallback.markRecovered') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PacoStatusBadge from './PacoStatusBadge.vue'
import { markRegistrationRecovered } from '@/composables/paco/usePacoRegistration'

const { t, locale } = useI18n()

const props = defineProps({
  registrants: { type: Array, required: true },
  filteredRegistrants: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  perPage: { type: Number, default: 20 },
  isSearching: { type: Boolean, default: false },
  deleting: { type: [String, Number, null], default: null }
})

const emit = defineEmits(['page-change', 'delete', 'recovered'])

// --- Modale détails inscription de secours (feature 005) ---
const fallbackDetailsRegistrant = ref(null)
const markingRecovered = ref(false)
const markRecoveredError = ref('')

const openFallbackDetails = (registrant) => {
  fallbackDetailsRegistrant.value = registrant
  markRecoveredError.value = ''
}

const closeFallbackDetails = () => {
  fallbackDetailsRegistrant.value = null
  markRecoveredError.value = ''
}

const formattedPayload = computed(() => {
  if (!fallbackDetailsRegistrant.value?.fallbackPayload) return ''
  try {
    return JSON.stringify(fallbackDetailsRegistrant.value.fallbackPayload, null, 2)
  } catch {
    return String(fallbackDetailsRegistrant.value.fallbackPayload)
  }
})

const handleMarkRecovered = async () => {
  if (!fallbackDetailsRegistrant.value) return
  markingRecovered.value = true
  markRecoveredError.value = ''
  const { success, error: err } = await markRegistrationRecovered(fallbackDetailsRegistrant.value.id)
  markingRecovered.value = false
  if (!success) {
    markRecoveredError.value = err
      ? t('paco.admin.fallback.markRecoveredError', { error: err })
      : t('paco.admin.fallback.markRecoveredError', { error: 'unknown' })
    return
  }
  emit('recovered', fallbackDetailsRegistrant.value.id)
  closeFallbackDetails()
}

// --- Helpers de résolution des champs démographiques ---
// Pour une inscription de secours (fallback_payload IS NOT NULL) qui n'a
// pas encore été promue, les champs démographiques viennent du payload
// JSON brut et non de paco_demographic_data. Ces helpers centralisent
// la logique de fallback.
const resolvedFirstName = (r) => r.firstName || r.fallbackPayload?.firstName || ''
const resolvedLastName = (r) => r.lastName || r.fallbackPayload?.lastName || ''
const resolvedGender = (r) => r.gender || r.fallbackPayload?.demographic?.gender || null
const resolvedAgeProfile = (r) => r.ageProfile || r.fallbackPayload?.demographic?.ageProfile || null
const resolvedCity = (r) => r.city || r.fallbackPayload?.demographic?.city || null
const resolvedProfessionalStatus = (r) =>
  r.professionalStatus || r.fallbackPayload?.demographic?.professionalStatus || null
const resolvedOrganization = (r) =>
  r.organization || r.fallbackPayload?.demographic?.organization || r.fallbackPayload?.organization || null

const notSpecified = computed(() => t('paco.admin.notSpecified'))

const totalPages = computed(() =>
  props.isSearching ? 1 : Math.ceil(props.total / props.perPage)
)
const displayedTotal = computed(() =>
  props.isSearching ? props.filteredRegistrants.length : props.total
)

const genderLabel = (value) => {
  if (!value) return notSpecified.value
  return value === 'male' ? t('paco.demographic.male') : t('paco.demographic.female')
}

const ageLabel = (value) => {
  if (!value) return notSpecified.value
  return value === 'over_35' ? t('paco.demographic.over35') : t('paco.demographic.under35')
}

const statusLabel = (value) => {
  if (!value) return notSpecified.value
  const map = {
    employed: t('paco.admin.percentEmployed'),
    student: t('paco.admin.percentStudent'),
    entrepreneur: t('paco.admin.percentEntrepreneur'),
    unemployed: t('paco.admin.percentUnemployed')
  }
  return map[value] || notSpecified.value
}

const countryName = (r) => {
  if (!r.countryFr && !r.countryEn) return notSpecified.value
  return locale.value === 'fr' ? (r.countryFr || r.countryEn) : (r.countryEn || r.countryFr)
}

const formatDate = (dateStr) => {
  if (!dateStr) return notSpecified.value
  const loc = locale.value === 'fr' ? 'fr-FR' : 'en-US'
  return new Date(dateStr).toLocaleDateString(loc, { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const loc = locale.value === 'fr' ? 'fr-FR' : 'en-US'
  return new Date(dateStr).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
}
</script>
