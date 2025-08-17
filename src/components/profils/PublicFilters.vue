<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
      {{ $t('directory.filters.title') }}
    </h3>

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
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-ifdd-green-500 focus:border-ifdd-green-500 sm:text-sm"
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
        class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-ifdd-green-500 focus:border-ifdd-green-500 sm:text-sm"
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
        class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-ifdd-green-500 focus:border-ifdd-green-500 sm:text-sm"
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
      <div class="space-y-2">
        <div
          v-for="expertise in expertiseOptionsWithTranslation"
          :key="expertise.value"
          class="flex items-center"
        >
          <input
            :id="`expertise-${expertise.value}`"
            v-model="localFilters.expertise"
            :value="expertise.value"
            type="checkbox"
            class="h-4 w-4 text-ifdd-green-600 focus:ring-ifdd-green-500 border-gray-300 dark:border-gray-600 rounded"
            @change="emitChange"
          />
          <label
            :for="`expertise-${expertise.value}`"
            class="ml-2 text-sm text-gray-700 dark:text-gray-300"
          >
            {{ expertise.label }}
          </label>
        </div>
      </div>
    </div>

    <!-- Bouton de réinitialisation -->
    <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="resetFilters"
        class="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200"
      >
        {{ $t('directory.filters.reset') }}
      </button>
    </div>

    <!-- Compteur de profils visibles -->
    <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
      <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ $t('directory.filters.visible_profiles') }}
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