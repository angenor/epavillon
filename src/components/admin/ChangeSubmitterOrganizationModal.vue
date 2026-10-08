<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
      <div class="fixed inset-0 bg-gray-500/75 transition-opacity" @click="close"></div>

      <div class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-2xl w-full mx-4 z-10">
        <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {{ t('admin.activities.changeOrganization.title') }}
            </h3>
            <button @click="close" class="cursor-pointer text-gray-400 hover:text-gray-500">
              <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" />
            </button>
          </div>

          <div v-if="error" class="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 rounded">
            {{ error }}
          </div>

          <!-- Organisation actuelle du soumissionnaire -->
          <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {{ t('admin.activities.changeOrganization.current') }}
            </p>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ currentOrganization?.name || t('admin.activities.changeOrganization.none') }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ submitter?.first_name }} {{ submitter?.last_name }} · {{ submitter?.email }}
            </p>
          </div>

          <!-- Recherche d'organisation -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.activities.changeOrganization.search') }}
            </label>
            <div class="relative">
              <input v-model="searchQuery"
                     @input="searchOrganizations"
                     type="text"
                     :placeholder="t('admin.activities.changeOrganization.searchPlaceholder')"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <div v-if="isSearching" class="absolute right-3 top-3">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            </div>
          </div>

          <div v-if="searchResults.length > 0" class="mb-4 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            <div v-for="org in searchResults"
                 :key="org.id"
                 @click="selectOrganization(org)"
                 class="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0">
              <img v-if="org.logo_url" :src="org.logo_url" :alt="org.name" class="h-10 w-10 rounded object-contain bg-white p-0.5">
              <div v-else class="h-10 w-10 rounded bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                {{ org.name?.[0]?.toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 dark:text-white truncate">
                  {{ org.name }}<span v-if="org.acronym" class="text-gray-500 dark:text-gray-400"> ({{ org.acronym }})</span>
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ org.country?.name_fr }}<span v-if="org.country && org.email"> · </span>{{ org.email }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="searchQuery.length >= 2 && !isSearching" class="text-center py-4 text-gray-500 dark:text-gray-400">
            {{ t('admin.activities.changeOrganization.noResults') }}
          </div>

          <!-- Organisation sélectionnée -->
          <div v-if="selectedOrganization" class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg">
            <p class="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
              {{ t('admin.activities.changeOrganization.selected') }}
            </p>
            <div class="flex items-center justify-between">
              <p class="font-medium text-gray-900 dark:text-white">{{ selectedOrganization.name }}</p>
              <button @click="selectedOrganization = null" class="cursor-pointer text-red-600 hover:text-red-800">
                <font-awesome-icon :icon="['fas', 'xmark']" class="h-4 w-4" />
              </button>
            </div>
            <label class="flex items-center gap-2 mt-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input v-model="applyToActivity" type="checkbox" class="rounded text-orange-600 focus:ring-orange-500">
              {{ t('admin.activities.changeOrganization.applyToActivity') }}
            </label>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="confirmChange"
                  :disabled="!selectedOrganization || isUpdating"
                  class="w-full inline-flex justify-center items-center rounded-md px-4 py-2 bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <div v-if="isUpdating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ isUpdating ? t('admin.activities.changeOrganization.updating') : t('admin.activities.changeOrganization.confirm') }}
          </button>
          <button @click="close"
                  :disabled="isUpdating"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 disabled:opacity-50 cursor-pointer">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const ORGANIZATION_FIELDS = 'id, name, acronym, logo_url, email, website, organization_type, country:countries(id, name_fr, name_en, code)'

const props = defineProps({
  show: { type: Boolean, default: false },
  submitter: { type: Object, default: null },
  activityId: { type: String, default: null }
})

const emit = defineEmits(['close', 'update'])

const { t } = useI18n()
const { supabase } = useSupabase()

const currentOrganization = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const selectedOrganization = ref(null)
const applyToActivity = ref(true)
const isUpdating = ref(false)
const error = ref(null)

let searchTimeout = null

const loadCurrentOrganization = async () => {
  currentOrganization.value = null
  if (!props.submitter?.id) return

  const { data: user } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', props.submitter.id)
    .single()

  if (!user?.organization_id) return

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', user.organization_id)
    .single()

  currentOrganization.value = org
}

const searchOrganizations = () => {
  clearTimeout(searchTimeout)
  // Retirer les caractères qui casseraient le filtre PostgREST .or()
  const query = searchQuery.value.replace(/[,()%]/g, ' ').trim()
  if (query.length < 2) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    const { data, error: searchError } = await supabase
      .from('organizations')
      .select(ORGANIZATION_FIELDS)
      .or(`name.ilike.%${query}%,acronym.ilike.%${query}%`)
      .eq('is_active', true)
      .order('name')
      .limit(15)

    if (searchError) console.error('Erreur lors de la recherche d\'organisations:', searchError)
    searchResults.value = data || []
    isSearching.value = false
  }, 300)
}

const selectOrganization = (org) => {
  selectedOrganization.value = org
  searchResults.value = []
  searchQuery.value = ''
}

const confirmChange = async () => {
  if (!selectedOrganization.value || !props.submitter?.id) return

  isUpdating.value = true
  error.value = null
  try {
    const organizationId = selectedOrganization.value.id

    const { error: userError } = await supabase
      .from('users')
      .update({ organization_id: organizationId })
      .eq('id', props.submitter.id)
    if (userError) throw userError

    if (applyToActivity.value && props.activityId) {
      const { error: activityError } = await supabase
        .from('activities')
        .update({ organization_id: organizationId })
        .eq('id', props.activityId)
      if (activityError) throw activityError
    }

    emit('update', { organization: selectedOrganization.value, appliedToActivity: applyToActivity.value })
    close()
  } catch (err) {
    console.error('Erreur lors du changement d\'organisation:', err)
    error.value = t('admin.activities.changeOrganization.error')
  } finally {
    isUpdating.value = false
  }
}

const close = () => {
  if (isUpdating.value) return
  emit('close')
}

watch(() => props.show, (isShown) => {
  if (!isShown) return
  searchQuery.value = ''
  searchResults.value = []
  selectedOrganization.value = null
  applyToActivity.value = true
  error.value = null
  loadCurrentOrganization()
})
</script>
