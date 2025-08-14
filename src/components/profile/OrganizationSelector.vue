<template>
  <div class="space-y-4">
    <!-- Organisation actuelle -->
    <div
      v-if="currentOrganization"
      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
    >
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <img
            v-if="currentOrganization.logo_url"
            :src="currentOrganization.logo_url"
            :alt="currentOrganization.name"
            class="w-8 h-8 rounded object-cover"
          >
          <div
            v-else
            class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center"
          >
            <font-awesome-icon
              icon="building"
              class="text-gray-500 dark:text-gray-400"
            />
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ currentOrganization.name }}
          </p>
          <div class="flex items-center space-x-2">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('profile.organization.current') }}
            </p>
            <span
              v-if="currentOrganization.is_verified"
              class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              <font-awesome-icon
                icon="check-circle"
                class="mr-1"
              />
              {{ t('profile.organization.verified') }}
            </span>
          </div>
        </div>
      </div>
      <button
        @click="showSelector = true"
        class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        {{ t('profile.organization.change') }}
      </button>
    </div>

    <!-- Aucune organisation -->
    <div
      v-else-if="!showSelector"
      class="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md"
    >
      <font-awesome-icon
        icon="building"
        class="text-4xl text-gray-400 dark:text-gray-500 mb-2"
      />
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {{ t('profile.organization.noOrganization') }}
      </p>
      <button
        @click="showSelector = true"
        class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <font-awesome-icon
          icon="plus"
          class="mr-2"
        />
        {{ t('profile.organization.select') }}
      </button>
    </div>

    <!-- Sélecteur d'organisation -->
    <div v-if="showSelector" class="space-y-4">
      <!-- Recherche -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('profile.organization.searchPlaceholder')"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          @input="handleSearch"
        >
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <font-awesome-icon
            icon="search"
            class="text-gray-400"
          />
        </div>
        <div
          v-if="searching"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <font-awesome-icon
            icon="spinner"
            class="animate-spin text-gray-400"
          />
        </div>
      </div>

      <!-- Résultats de recherche -->
      <div
        v-if="searchResults.length > 0"
        class="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md"
      >
        <div class="py-1">
          <button
            v-for="org in searchResults"
            :key="org.id"
            @click="selectOrganization(org)"
            class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
          >
            <div class="flex-shrink-0">
              <img
                v-if="org.logo_url"
                :src="org.logo_url"
                :alt="org.name"
                class="w-8 h-8 rounded object-cover"
              >
              <div
                v-else
                class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center"
              >
                <font-awesome-icon
                  icon="building"
                  class="text-gray-500 dark:text-gray-400"
                />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ org.name }}
              </p>
              <div class="flex items-center space-x-2">
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ org.email }}
                </p>
                <span
                  v-if="org.is_verified"
                  class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  <font-awesome-icon
                    icon="check-circle"
                    class="mr-1"
                  />
                  {{ t('profile.organization.verified') }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Aucun résultat -->
      <div
        v-else-if="searchQuery && !searching"
        class="text-center py-6 border border-gray-200 dark:border-gray-600 rounded-md"
      >
        <font-awesome-icon
          icon="search"
          class="text-2xl text-gray-400 dark:text-gray-500 mb-2"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {{ t('profile.organization.noResults') }}
        </p>
        <button
          @click="requestNewOrganization"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <font-awesome-icon
            icon="plus"
            class="mr-2"
          />
          {{ t('profile.organization.requestNew') }}
        </button>
      </div>

      <!-- Actions -->
      <div class="flex justify-between">
        <button
          @click="showSelector = false"
          class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          v-if="currentOrganization"
          @click="removeOrganization"
          class="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
        >
          {{ t('profile.organization.remove') }}
        </button>
      </div>
    </div>

    <!-- Formulaire de demande de nouvelle organisation -->
    <div
      v-if="showNewOrgForm"
      class="border border-gray-200 dark:border-gray-600 rounded-md p-4 space-y-4"
    >
      <h4 class="text-md font-medium text-gray-900 dark:text-white">
        {{ t('profile.organization.requestNewTitle') }}
      </h4>
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('profile.organization.orgName') }} *
          </label>
          <input
            v-model="newOrgData.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('profile.organization.orgEmail') }} *
          </label>
          <input
            v-model="newOrgData.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('profile.organization.orgType') }} *
          </label>
          <select
            v-model="newOrgData.organization_type"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">{{ t('profile.organization.selectType') }}</option>
            <option value="government">{{ t('profile.organization.types.government') }}</option>
            <option value="ngo">{{ t('profile.organization.types.ngo') }}</option>
            <option value="private">{{ t('profile.organization.types.private') }}</option>
            <option value="academic">{{ t('profile.organization.types.academic') }}</option>
            <option value="international">{{ t('profile.organization.types.international') }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('profile.organization.orgWebsite') }}
          </label>
          <input
            v-model="newOrgData.website"
            type="url"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
        </div>
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelNewOrganization"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          @click="submitNewOrganization"
          :disabled="submittingNewOrg"
          class="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <font-awesome-icon
            v-if="submittingNewOrg"
            icon="spinner"
            class="animate-spin mr-2"
          />
          {{ submittingNewOrg ? t('common.submitting') : t('common.submit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  currentOrganization: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const showSelector = ref(false)
const showNewOrgForm = ref(false)
const searching = ref(false)
const submittingNewOrg = ref(false)
const searchQuery = ref('')
const searchResults = ref([])

const newOrgData = reactive({
  name: '',
  email: '',
  organization_type: '',
  website: ''
})

// Méthodes de recherche
let searchTimeout = null

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.trim().length < 2) {
      searchResults.value = []
      return
    }
    
    searching.value = true
    try {
      const { supabase } = await import('@/composables/useSupabase')
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .or(`name.ilike.%${searchQuery.value}%,email.ilike.%${searchQuery.value}%`)
        .eq('is_active', true)
        .limit(10)

      if (error) throw error
      searchResults.value = data || []
    } catch (error) {
      console.error('Error searching organizations:', error)
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 300)
}

const selectOrganization = (org) => {
  emit('update:modelValue', org.id)
  showSelector.value = false
  searchQuery.value = ''
  searchResults.value = []
}

const removeOrganization = () => {
  emit('update:modelValue', '')
  showSelector.value = false
}

const requestNewOrganization = () => {
  showNewOrgForm.value = true
  showSelector.value = false
  newOrgData.name = searchQuery.value
}

const cancelNewOrganization = () => {
  showNewOrgForm.value = false
  showSelector.value = true
  Object.assign(newOrgData, {
    name: '',
    email: '',
    organization_type: '',
    website: ''
  })
}

const submitNewOrganization = async () => {
  submittingNewOrg.value = true
  try {
    // TODO: Implémenter la création de demande d'organisation avec Supabase
    console.log('Submitting new organization request:', newOrgData)
    
    // Simuler la soumission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showNewOrgForm.value = false
    // Afficher un message de succès
  } catch (error) {
    console.error('Error submitting organization request:', error)
    // Afficher un message d'erreur
  } finally {
    submittingNewOrg.value = false
  }
}
</script>