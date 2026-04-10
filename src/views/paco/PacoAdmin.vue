<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">

      <!-- Header -->
      <div class="mb-8 flex items-baseline justify-between">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('paco.admin.title') }}
        </h1>
        <div v-if="pageViewCount > 0" class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500" :title="t('paco.admin.viewCountSince')">
          <font-awesome-icon :icon="['fas', 'eye']" class="text-[10px]" />
          <span>{{ pageViewCount }}</span>
          <span class="text-gray-300 dark:text-gray-600">·</span>
          <span>{{ t('paco.admin.viewCountSince') }}</span>
        </div>
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

      <!-- Stats Cards + Table -->
      <div v-else-if="stats" class="space-y-8">
        <PacoStatsCards :stats="stats" />

        <!-- Registration Chart -->
        <PacoRegistrationChart :data="allRegistrationDates" />

        <!-- Registrant List Section -->
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ t('paco.admin.registrantList') }}
            </h2>
            <div class="flex flex-wrap items-center gap-3">
              <!-- Session filter buttons -->
              <div class="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  @click="applySessionFilter(null)"
                  class="cursor-pointer px-3 py-2 text-xs font-medium transition"
                  :class="sessionFilter === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
                >
                  {{ t('paco.admin.filterAllSessions') }}
                </button>
                <button
                  @click="applySessionFilter(1)"
                  class="cursor-pointer px-3 py-2 text-xs font-medium border-l border-gray-300 dark:border-gray-600 transition"
                  :class="sessionFilter === 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
                >
                  {{ t('paco.admin.filterSession', { n: 1 }) }}
                </button>
                <button
                  @click="applySessionFilter(2)"
                  class="cursor-pointer px-3 py-2 text-xs font-medium border-l border-gray-300 dark:border-gray-600 transition"
                  :class="sessionFilter === 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
                >
                  {{ t('paco.admin.filterSession', { n: 2 }) }}
                </button>
              </div>
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

          <PacoRegistrantTable
            :registrants="registrants"
            :filtered-registrants="filteredRegistrants"
            :loading="registrantsLoading"
            :error="registrantsError"
            :total="registrantsTotal"
            :page="registrantsPage"
            :per-page="registrantsPerPage"
            :is-searching="isSearching"
            :deleting="deleting"
            @page-change="goToPage"
            @delete="confirmDelete"
          />
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

    <!-- Realtime Toast Notification -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-if="toastCount > 0"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg cursor-pointer"
        @click="dismissToast"
      >
        <font-awesome-icon :icon="['fas', 'user-plus']" />
        <div>
          <p class="text-sm font-semibold">
            <template v-if="toastCount === 1">{{ t('paco.admin.newRegistration') }}</template>
            <template v-else>{{ toastCount }} {{ t('paco.admin.newRegistrations') }}</template>
          </p>
        </div>
        <button class="cursor-pointer ml-2 text-white/70 hover:text-white" @click.stop="dismissToast">
          <font-awesome-icon :icon="['fas', 'times']" class="text-sm" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePacoStats } from '@/composables/paco/usePacoStats'
import { usePacoCsvExport } from '@/composables/paco/usePacoCsvExport'
import PacoRegistrationChart from '@/components/paco/PacoRegistrationChart.vue'
import PacoStatsCards from '@/components/paco/PacoStatsCards.vue'
import PacoRegistrantTable from '@/components/paco/PacoRegistrantTable.vue'

const { t } = useI18n()
const {
  stats, loading, error, fetchPacoStats,
  registrants, registrantsLoading, registrantsError,
  registrantsTotal, registrantsPage, registrantsPerPage,
  fetchPacoRegistrants, fetchAllRegistrantsForExport, deleteRegistrant,
  allRegistrationDates, fetchAllRegistrationDates,
  pageViewCount, fetchPageViewCount,
  subscribeToPacoChanges, unsubscribePacoChanges,
  sessionFilter, setSessionFilter
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
    fetchPacoRegistrants(1, isSearching.value)
  }, 300)
})

const applySessionFilter = (edition) => {
  setSessionFilter(edition)
  fetchPacoRegistrants(1, isSearching.value)
  fetchPacoStats()
  fetchAllRegistrationDates()
}

const goToPage = (page) => {
  const totalPages = isSearching.value ? 1 : Math.ceil(registrantsTotal.value / registrantsPerPage)
  if (page < 1 || page > totalPages) return
  fetchPacoRegistrants(page)
}

const { exportToCsv } = usePacoCsvExport()

const toastCount = ref(0)
let toastTimer = null

const showToast = () => {
  toastCount.value++
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastCount.value = 0
  }, 5000)
}

const dismissToast = () => {
  toastCount.value = 0
  clearTimeout(toastTimer)
}

const refreshAll = ({ silent = false } = {}) => {
  fetchPacoStats({ silent })
  fetchPacoRegistrants(registrantsPage.value, isSearching.value, { silent })
  fetchAllRegistrationDates()
  fetchPageViewCount()
}

let initialLoadDone = false

onMounted(() => {
  refreshAll()
  subscribeToPacoChanges((payload) => {
    refreshAll({ silent: true })
    if (initialLoadDone && payload?.eventType === 'INSERT') {
      showToast()
    }
  })
  setTimeout(() => { initialLoadDone = true }, 2000)
})

onUnmounted(() => {
  unsubscribePacoChanges()
})

const handleExport = async () => {
  try {
    const allRegistrants = await fetchAllRegistrantsForExport()
    exportToCsv(allRegistrants)
  } catch (err) {
    console.error('Error exporting registrants:', err)
  }
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
