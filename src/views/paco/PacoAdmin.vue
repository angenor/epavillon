<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('paco.admin.title') }}
        </h1>
      </div>

      <!-- Stats Loading Skeleton -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>

      <!-- Stats Error -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Stats Cards -->
      <div v-else-if="stats" class="space-y-8">

        <!-- Total Registrants -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div class="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6"></div>
            <div class="relative">
              <div class="flex items-center gap-2 mb-3">
                <font-awesome-icon :icon="['fas', 'users']" class="text-white/80" />
                <p class="text-sm font-medium text-white/80">{{ t('paco.admin.totalRegistrants') }}</p>
              </div>
              <p class="text-4xl font-extrabold">{{ stats.total }}</p>
              <div class="mt-3 flex items-center gap-1.5 text-xs text-white/70">
                <font-awesome-icon :icon="['fas', 'chart-pie']" class="text-[10px]" />
                <span>{{ t('paco.admin.withDemographics') }}: {{ stats.withDemographics }}</span>
              </div>
            </div>
          </div>

          <!-- Gender Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex items-center gap-2 mb-3">
              <font-awesome-icon :icon="['fas', 'venus-mars']" class="text-pink-500" />
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('paco.admin.genderDistribution') }}</p>
            </div>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-600 dark:text-gray-300">{{ t('paco.admin.percentMale') }}</span>
                  <span class="text-sm font-bold text-gray-900 dark:text-white">{{ stats.gender.male }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" :style="{ width: stats.gender.male + '%' }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-600 dark:text-gray-300">{{ t('paco.admin.percentFemale') }}</span>
                  <span class="text-sm font-bold text-gray-900 dark:text-white">{{ stats.gender.female }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-pink-500 h-2 rounded-full transition-all duration-500" :style="{ width: stats.gender.female + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Age Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex items-center gap-2 mb-3">
              <font-awesome-icon :icon="['fas', 'calendar-alt']" class="text-emerald-500" />
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('paco.admin.ageDistribution') }}</p>
            </div>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-600 dark:text-gray-300">{{ t('paco.admin.percentUnder35') }}</span>
                  <span class="text-sm font-bold text-gray-900 dark:text-white">{{ stats.ageProfile.under35 }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full transition-all duration-500" :style="{ width: stats.ageProfile.under35 + '%' }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-600 dark:text-gray-300">{{ t('paco.admin.percentOver35') }}</span>
                  <span class="text-sm font-bold text-gray-900 dark:text-white">{{ stats.ageProfile.over35 }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-amber-500 h-2 rounded-full transition-all duration-500" :style="{ width: stats.ageProfile.over35 + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Professional Status Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex items-center gap-2 mb-3">
              <font-awesome-icon :icon="['fas', 'briefcase']" class="text-amber-500" />
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('paco.admin.statusDistribution') }}</p>
            </div>
            <div class="space-y-2">
              <div v-for="(value, key) in stats.professionalStatus" :key="key" class="flex items-baseline gap-1">
                <span class="text-sm text-gray-600 dark:text-gray-300 shrink-0">{{ statusLabel(key) }}</span>
                <span class="flex-1 overflow-hidden whitespace-nowrap text-xs text-gray-300 dark:text-gray-600 tracking-widest">{{ '_'.repeat(50) }}</span>
                <span class="text-sm font-bold text-gray-900 dark:text-white shrink-0">{{ value }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration Chart -->
        <PacoRegistrationChart :data="allRegistrationDates" />

        <!-- Registrant List Section -->
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ t('paco.admin.registrantList') }}
            </h2>
            <div class="flex items-center gap-3">
              <div class="relative">
                <font-awesome-icon :icon="['fas', 'search']" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('paco.admin.searchPlaceholder')"
                  class="pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <font-awesome-icon :icon="['fas', 'times']" class="text-sm" />
                </button>
              </div>
              <button
                @click="handleExport"
                :disabled="!registrants.length"
                class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <font-awesome-icon :icon="['fas', 'file-csv']" />
                {{ t('paco.admin.exportCsv') }}
              </button>
            </div>
          </div>

          <!-- Top Pagination -->
          <div v-if="!registrantsLoading && !registrantsError && filteredRegistrants.length && (totalPages > 1 || isSearching)" class="flex items-center justify-between mb-3">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              <template v-if="isSearching">
                {{ displayedTotal }} {{ t('paco.admin.searchResults') }}
              </template>
              <template v-else>
                {{ (registrantsPage - 1) * registrantsPerPage + 1 }}–{{ Math.min(registrantsPage * registrantsPerPage, registrantsTotal) }}
                {{ t('paco.admin.paginationOf') }} {{ registrantsTotal }}
              </template>
            </p>
            <div v-if="totalPages > 1 && !isSearching" class="flex gap-1">
              <button
                @click="goToPage(registrantsPage - 1)"
                :disabled="registrantsPage <= 1"
                class="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <font-awesome-icon :icon="['fas', 'chevron-left']" />
              </button>
              <template v-for="p in totalPages" :key="'top-' + p">
                <button
                  v-if="p === 1 || p === totalPages || (p >= registrantsPage - 1 && p <= registrantsPage + 1)"
                  @click="goToPage(p)"
                  class="cursor-pointer px-3 py-1.5 text-sm rounded-lg transition"
                  :class="p === registrantsPage
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
                >
                  {{ p }}
                </button>
                <span
                  v-else-if="p === 2 && registrantsPage > 3 || p === totalPages - 1 && registrantsPage < totalPages - 2"
                  class="px-2 py-1.5 text-sm text-gray-400"
                >…</span>
              </template>
              <button
                @click="goToPage(registrantsPage + 1)"
                :disabled="registrantsPage >= totalPages"
                class="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
            </div>
          </div>

          <!-- Table Loading Skeleton -->
          <div v-if="registrantsLoading" class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
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

          <!-- Table Error -->
          <div v-else-if="registrantsError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p class="text-red-600 dark:text-red-400">{{ registrantsError }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!registrants.length" class="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
            <p class="text-gray-500 dark:text-gray-400">{{ t('paco.admin.noRegistrants') }}</p>
          </div>

          <!-- Registrant Table -->
          <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
            <table class="min-w-[800px] w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[18%]">{{ t('paco.admin.name') }}</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[18%]">{{ t('paco.admin.email') }}</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">{{ t('paco.admin.gender') }} / {{ t('paco.admin.ageProfile') }}</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[16%]">{{ t('paco.admin.location') }}</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[14%]">{{ t('paco.admin.professionalStatus') }}</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[12%]">{{ t('paco.admin.organization') }}</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">{{ t('paco.admin.registrationDate') }}</th>
                  <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[4%]"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="r in filteredRegistrants" :key="r.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <!-- Name (merged first + last) -->
                  <td class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div class="truncate font-medium">{{ r.firstName || notSpecified }} {{ r.lastName || '' }}</div>
                  </td>
                  <!-- Email -->
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <div class="truncate">{{ r.email }}</div>
                  </td>
                  <!-- Gender / Age -->
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <div class="truncate">{{ genderLabel(r.gender) }}</div>
                    <div class="truncate text-xs text-gray-400 dark:text-gray-500">{{ ageLabel(r.ageProfile) }}</div>
                  </td>
                  <!-- Location (city + country merged) -->
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <div class="truncate">{{ r.city || notSpecified }}</div>
                    <div class="truncate text-xs text-gray-400 dark:text-gray-500">{{ countryName(r) }}</div>
                  </td>
                  <!-- Professional Status -->
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <div class="truncate">{{ statusLabel(r.professionalStatus) }}</div>
                  </td>
                  <!-- Organization -->
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <div class="truncate">{{ r.organization || notSpecified }}</div>
                  </td>
                  <!-- Date -->
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <div class="truncate">{{ formatDate(r.registrationDate) }}</div>
                    <div class="truncate text-xs text-gray-400 dark:text-gray-500">{{ formatTime(r.registrationDate) }}</div>
                  </td>
                  <!-- Actions -->
                  <td class="px-3 py-3 text-sm text-center">
                    <button
                      @click="confirmDelete(r)"
                      :disabled="deleting === r.id"
                      class="cursor-pointer text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                      :title="t('paco.admin.deleteRegistrant')"
                    >
                      <font-awesome-icon :icon="['fas', 'trash-alt']" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="totalPages > 1 || isSearching" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <template v-if="isSearching">
                  {{ displayedTotal }} {{ t('paco.admin.searchResults') }}
                </template>
                <template v-else>
                  {{ (registrantsPage - 1) * registrantsPerPage + 1 }}–{{ Math.min(registrantsPage * registrantsPerPage, registrantsTotal) }}
                  {{ t('paco.admin.paginationOf') }} {{ registrantsTotal }}
                </template>
              </p>
              <div class="flex gap-1">
                <button
                  @click="goToPage(registrantsPage - 1)"
                  :disabled="registrantsPage <= 1"
                  class="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <font-awesome-icon :icon="['fas', 'chevron-left']" />
                </button>
                <template v-for="p in totalPages" :key="p">
                  <button
                    v-if="p === 1 || p === totalPages || (p >= registrantsPage - 1 && p <= registrantsPage + 1)"
                    @click="goToPage(p)"
                    class="cursor-pointer px-3 py-1.5 text-sm rounded-lg transition"
                    :class="p === registrantsPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
                  >
                    {{ p }}
                  </button>
                  <span
                    v-else-if="p === 2 && registrantsPage > 3 || p === totalPages - 1 && registrantsPage < totalPages - 2"
                    class="px-2 py-1.5 text-sm text-gray-400"
                  >…</span>
                </template>
                <button
                  @click="goToPage(registrantsPage + 1)"
                  :disabled="registrantsPage >= totalPages"
                  class="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <font-awesome-icon :icon="['fas', 'chevron-right']" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="registrantToDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="registrantToDelete = null">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ t('paco.admin.deleteConfirmTitle') }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-1">
            {{ t('paco.admin.deleteConfirmMessage') }}
          </p>
          <p class="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {{ registrantToDelete.firstName }} {{ registrantToDelete.lastName }} ({{ registrantToDelete.email }})
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="registrantToDelete = null"
              class="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="handleDelete"
              :disabled="deleting"
              class="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition disabled:opacity-50"
            >
              {{ deleting ? t('paco.admin.deleting') : t('paco.admin.deleteConfirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePacoStats } from '@/composables/paco/usePacoStats'
import { usePacoCsvExport } from '@/composables/paco/usePacoCsvExport'
import PacoRegistrationChart from '@/components/paco/PacoRegistrationChart.vue'

const { t, locale } = useI18n()
const {
  stats, loading, error, fetchPacoStats,
  registrants, registrantsLoading, registrantsError,
  registrantsTotal, registrantsPage, registrantsPerPage,
  fetchPacoRegistrants, deleteRegistrant,
  allRegistrationDates, fetchAllRegistrationDates,
  subscribeToPacoChanges, unsubscribePacoChanges
} = usePacoStats()

const searchQuery = ref('')
let searchDebounce = null

const isSearching = computed(() => searchQuery.value.trim().length > 0)

const filteredRegistrants = computed(() => {
  if (!isSearching.value) return registrants.value
  const q = searchQuery.value.toLowerCase().trim()
  return registrants.value.filter(r =>
    [r.firstName, r.lastName, r.email, r.city, r.countryFr, r.countryEn, r.organization]
      .some(v => v && v.toLowerCase().includes(q))
  )
})

watch(searchQuery, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    if (isSearching.value) {
      fetchPacoRegistrants(1, true)
    } else {
      fetchPacoRegistrants(1)
    }
  }, 300)
})

const displayedTotal = computed(() => isSearching.value ? filteredRegistrants.value.length : registrantsTotal.value)
const totalPages = computed(() => isSearching.value ? 1 : Math.ceil(registrantsTotal.value / registrantsPerPage))

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  fetchPacoRegistrants(page)
}
const { exportToCsv } = usePacoCsvExport()

const notSpecified = computed(() => t('paco.admin.notSpecified'))

const refreshAll = () => {
  fetchPacoStats()
  fetchPacoRegistrants(registrantsPage.value)
  fetchAllRegistrationDates()
}

onMounted(() => {
  refreshAll()
  subscribeToPacoChanges(refreshAll)
})

onUnmounted(() => {
  unsubscribePacoChanges()
})

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
  const time = new Date(dateStr).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
  return time
}

const handleExport = () => {
  exportToCsv(registrants.value)
}

const registrantToDelete = ref(null)
const deleting = ref(null)

const confirmDelete = (registrant) => {
  registrantToDelete.value = registrant
}

const handleDelete = async () => {
  const id = registrantToDelete.value.id
  deleting.value = id
  try {
    await deleteRegistrant(id)
    registrantToDelete.value = null
    fetchPacoStats()
    fetchPacoRegistrants(registrantsPage.value)
    fetchAllRegistrationDates()
  } catch (err) {
    console.error('Error deleting registrant:', err)
  } finally {
    deleting.value = null
  }
}
</script>
