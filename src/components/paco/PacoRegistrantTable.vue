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
      <table class="min-w-[800px] w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[16%]">{{ t('paco.admin.name') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[16%]">{{ t('paco.admin.email') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[8%]">{{ t('paco.admin.session') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">{{ t('paco.admin.gender') }} / {{ t('paco.admin.ageProfile') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[14%]">{{ t('paco.admin.location') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[12%]">{{ t('paco.admin.professionalStatus') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">{{ t('paco.admin.organization') }}</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">{{ t('paco.admin.registrationDate') }}</th>
            <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[4%]"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="r in filteredRegistrants" :key="r.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100">
              <div class="truncate font-medium">{{ r.firstName || notSpecified }} {{ r.lastName || '' }}</div>
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
              <div class="truncate">{{ genderLabel(r.gender) }}</div>
              <div class="truncate text-xs text-gray-400 dark:text-gray-500">{{ ageLabel(r.ageProfile) }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="truncate">{{ r.city || notSpecified }}</div>
              <div class="truncate text-xs text-gray-400 dark:text-gray-500">{{ countryName(r) }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="truncate">{{ statusLabel(r.professionalStatus) }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="truncate">{{ r.organization || notSpecified }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="truncate">{{ formatDate(r.registrationDate) }}</div>
              <div class="truncate text-xs text-gray-400 dark:text-gray-500">{{ formatTime(r.registrationDate) }}</div>
            </td>
            <td class="px-3 py-3 text-sm text-center">
              <button
                @click="$emit('delete', r)"
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

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

defineEmits(['page-change', 'delete'])

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
