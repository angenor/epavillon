<template>
  <div>
    <!-- Search Input -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('organization.setup.searchLabel') }}
      </label>
      <div class="relative">
        <input
          v-model="query"
          type="text"
          @input="search"
          :placeholder="t('organization.setup.searchPlaceholder')"
          class="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
        />
        <font-awesome-icon :icon="['fas', 'search']" class="absolute left-3 top-4 h-4 w-4 text-gray-400" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8 text-gray-600 dark:text-gray-400">
      <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin mr-2" />
      {{ t('organization.setup.searching') }}
    </div>

    <!-- Search Results -->
    <div v-else-if="visibleResults.length > 0" class="space-y-3 mb-6">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('organization.setup.resultsTitle') }}
      </h3>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <button
          v-for="org in visibleResults"
          :key="org.organization_id"
          type="button"
          @click="emit('select', org)"
          class="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">{{ org.name }}</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t(`organization.types.${org.organization_type}`) }}
                <span v-if="org.is_verified" class="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <font-awesome-icon :icon="['fas', 'check']" class="w-3 h-3 mr-1" />
                  {{ t('organization.verified') }}
                </span>
              </p>
            </div>
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4 text-gray-400" />
          </div>
        </button>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="hasSearched" class="text-center py-8">
      <font-awesome-icon :icon="['fas', 'building']" class="h-12 w-12 text-gray-400" />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {{ t('organization.setup.noResults') }}
      </p>
      <p class="mt-2 text-xs text-blue-600 dark:text-blue-400">
        {{ t('organization.setup.canCreateAfterSearch') }}
      </p>
    </div>

    <!-- Search Instructions -->
    <div v-else-if="query.length > 0" class="text-center py-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('organization.setup.searchInstructions') }}
      </p>
    </div>

    <!-- Initial State -->
    <div v-else class="text-center py-8">
      <font-awesome-icon :icon="['fas', 'search']" class="h-12 w-12 text-gray-300 dark:text-gray-600" />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {{ t('organization.setup.startSearching') }}
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between pt-6">
      <slot name="secondary-action" />
      <button
        type="button"
        @click="emit('create', query.trim())"
        :disabled="!canCreate"
        :class="[
          'px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
          canCreate
            ? 'cursor-pointer bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
        ]"
      >
        {{ t('organization.setup.createNewAfterSearch') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrganizationSearch } from '@/composables/useOrganizationSearch'

const props = defineProps({
  // Organisation à masquer des résultats (ex : l'organisation actuelle)
  excludeId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'create'])

const { t } = useI18n()
const { query, results, loading, hasSearched, minQueryLength, search } = useOrganizationSearch()

const visibleResults = computed(() =>
  results.value.filter(org => org.organization_id !== props.excludeId)
)

// La création n'est proposée qu'après une recherche, pour limiter les doublons
const canCreate = computed(() => hasSearched.value && query.value.trim().length >= minQueryLength)
</script>
