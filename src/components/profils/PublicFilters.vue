<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
    <div class="flex items-center space-x-3 mb-6">
      <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-ifdd-vert-light/20 to-ifdd-vert/20 dark:from-ifdd-vert-dark/20 dark:to-ifdd-violet-dark/20 rounded-lg">
        <svg class="w-4 h-4 text-ifdd-vert dark:text-ifdd-vert-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"/>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('directory.filters.title') }}
      </h3>
    </div>

    <!-- Recherche par nom -->
    <div class="mb-6">
      <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ $t('directory.filters.search_name') }}
      </label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="search"
          v-model="localFilters.search"
          type="text"
          :placeholder="$t('directory.filters.search_placeholder')"
          class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ifdd-vert focus:border-ifdd-vert transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 sm:text-sm"
          @input="debouncedEmit"
        />
      </div>
    </div>

    <!-- Filtre par organisation -->
    <div class="mb-6">
      <label for="organization" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ $t('directory.filters.organization') }}
      </label>
      <select
        id="organization"
        v-model="localFilters.organization"
        class="block w-full py-3 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ifdd-vert focus:border-ifdd-vert transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 sm:text-sm appearance-none cursor-pointer"
        @change="emitChange"
      >
        <option value="">{{ $t('directory.filters.all_organizations') }}</option>
        <option
          v-for="org in organizations"
          :key="org.id"
          :value="org.id"
        >
          {{ org.name }}
          <span v-if="org.is_verified">✓</span>
        </option>
      </select>
    </div>

    <!-- Filtre par pays -->
    <div class="mb-6">
      <label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ $t('directory.filters.country') }}
      </label>
      <select
        id="country"
        v-model="localFilters.country"
        class="block w-full py-3 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ifdd-vert focus:border-ifdd-vert transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 sm:text-sm appearance-none cursor-pointer"
        @change="emitChange"
      >
        <option value="">{{ $t('directory.filters.all_countries') }}</option>
        <option
          v-for="country in countries"
          :key="country.id"
          :value="country.id"
        >
          {{ $i18n.locale === 'fr' ? country.name_fr : country.name_en }}
        </option>
      </select>
    </div>

    <!-- Filtre par domaine d'expertise -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ $t('directory.filters.expertise') }}
      </label>
      <div class="space-y-3">
        <div
          v-for="expertise in expertiseOptionsWithTranslation"
          :key="expertise.value"
          class="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-ifdd-vert-light hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer group"
        >
          <input
            :id="`expertise-${expertise.value}`"
            v-model="localFilters.expertise"
            :value="expertise.value"
            type="checkbox"
            class="h-5 w-5 text-ifdd-vert focus:ring-ifdd-vert border-gray-300 dark:border-gray-600 rounded-md transition-colors duration-200"
            @change="emitChange"
          />
          <label
            :for="`expertise-${expertise.value}`"
            class="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white cursor-pointer flex-1 font-medium"
          >
            {{ expertise.label }}
          </label>
        </div>
      </div>
    </div>

    <!-- Bouton de réinitialisation premium -->
    <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="resetFilters"
        class="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-gray-300 text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 group"
      >
        <svg class="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        <span>{{ $t('directory.filters.reset') }}</span>
      </button>
    </div>

    <!-- Compteur de profils visibles premium -->
    <div class="mt-6 p-4 bg-gradient-to-r from-ifdd-vert-light/10 to-ifdd-vert/10 dark:from-ifdd-vert-dark/20 dark:to-ifdd-violet-dark/20 rounded-lg border border-ifdd-vert-light dark:border-ifdd-vert-dark">
      <div class="flex items-center text-sm text-ifdd-vert-dark dark:text-ifdd-vert-light">
        <div class="flex items-center justify-center w-6 h-6 bg-ifdd-vert-light/30 dark:bg-ifdd-vert-dark/30 rounded-full mr-3">
          <svg class="w-3 h-3 text-ifdd-vert dark:text-ifdd-vert-light" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span class="font-medium">{{ $t('directory.filters.visible_profiles') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePublicFilters } from '@/composables/usePublicFilters'
import { debounce } from '@/utils/helpers'

const { t, locale } = useI18n()

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  organization: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  expertise: {
    type: [String, Array],
    default: () => []
  }
})

const emit = defineEmits(['update:search', 'update:organization', 'update:country', 'update:expertise', 'filter-change'])

// État local
const localFilters = ref({
  search: props.search,
  organization: props.organization,
  country: props.country,
  expertise: Array.isArray(props.expertise) ? props.expertise : []
})

// Composables
const { organizations, countries, expertiseOptions, loadFiltersData } = usePublicFilters()

// Options d'expertise avec traduction
const expertiseOptionsWithTranslation = computed(() => 
  expertiseOptions.value.map(option => ({
    value: option.value,
    label: locale.value === 'fr' ? option.label_fr : option.label_en
  }))
)

// Méthodes
const emitChange = () => {
  emit('update:search', localFilters.value.search)
  emit('update:organization', localFilters.value.organization)
  emit('update:country', localFilters.value.country)
  emit('update:expertise', localFilters.value.expertise)
  emit('filter-change')
}

const debouncedEmit = debounce(() => {
  emitChange()
}, 300)

const resetFilters = () => {
  localFilters.value = {
    search: '',
    organization: '',
    country: '',
    expertise: []
  }
  emitChange()
}

// Watchers pour synchroniser avec les props
watch(() => props.search, (newValue) => {
  localFilters.value.search = newValue
})

watch(() => props.organization, (newValue) => {
  localFilters.value.organization = newValue
})

watch(() => props.country, (newValue) => {
  localFilters.value.country = newValue
})

watch(() => props.expertise, (newValue) => {
  localFilters.value.expertise = Array.isArray(newValue) ? newValue : []
})

// Lifecycle
onMounted(async () => {
  await loadFiltersData()
})
</script>