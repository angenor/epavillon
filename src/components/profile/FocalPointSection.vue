<template>
  <div class="space-y-8">
    <!-- Gestion des négociateurs -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
              <font-awesome-icon
                icon="user-tie"
                class="w-5 h-5 text-blue-600 dark:text-blue-400"
              />
            </div>
            {{ t('profile.focalPoint.negotiators.title') }}
          </h3>
          <button
            @click="$emit('designate-negotiator')"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <font-awesome-icon icon="plus" class="mr-2" />
            {{ t('profile.focalPoint.negotiators.designateNew') }}
          </button>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-4">
          <font-awesome-icon icon="spinner" class="animate-spin text-gray-400" />
        </div>
        <div v-else-if="designatedNegotiators.length === 0" class="text-center py-8">
          <font-awesome-icon
            icon="users"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400">
            {{ t('profile.focalPoint.negotiators.noNegotiators') }}
          </p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {{ t('profile.focalPoint.negotiators.designateDesc') }}
          </p>
        </div>
        <div v-else>
          <!-- Statistiques -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ designatedNegotiators.length }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ t('profile.focalPoint.negotiators.totalDesignated') }}
              </div>
            </div>
            <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ activeNegotiators.length }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ t('profile.focalPoint.negotiators.currentlyActive') }}
              </div>
            </div>
            <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {{ currentYear }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ t('profile.focalPoint.negotiators.currentYear') }}
              </div>
            </div>
          </div>

          <!-- Liste des négociateurs -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 dark:text-white">
              {{ t('profile.focalPoint.negotiators.negotiatorsList') }}
            </h4>
            <div
              v-for="negotiator in designatedNegotiators"
              :key="negotiator.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    v-if="negotiator.user.profile_photo_thumbnail_url"
                    :src="negotiator.user.profile_photo_thumbnail_url"
                    :alt="`${negotiator.user.first_name} ${negotiator.user.last_name}`"
                    class="w-full h-full object-cover"
                  >
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500"
                  >
                    <span class="text-white font-bold text-sm">
                      {{ getInitials(negotiator.user.first_name, negotiator.user.last_name) }}
                    </span>
                  </div>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ negotiator.user.first_name }} {{ negotiator.user.last_name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ t('profile.focalPoint.negotiators.designatedFor') }} {{ negotiator.designation_year }}
                    <span v-if="negotiator.total_designations > 1" class="ml-2 text-green-600 dark:text-green-400">
                      ({{ negotiator.total_designations }} {{ t('profile.focalPoint.negotiators.designations') }})
                    </span>
                  </div>
                  <div v-if="negotiator.specialization_themes?.length" class="mt-1">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="theme in negotiator.specialization_themes.slice(0, 3)"
                        :key="theme"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {{ theme }}
                      </span>
                      <span
                        v-if="negotiator.specialization_themes.length > 3"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        +{{ negotiator.specialization_themes.length - 3 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    negotiator.designation_year === currentYear
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  ]"
                >
                  {{ negotiator.designation_year === currentYear 
                    ? t('profile.focalPoint.negotiators.active') 
                    : t('profile.focalPoint.negotiators.inactive') 
                  }}
                </span>
                <button
                  @click="viewNegotiatorDetails(negotiator)"
                  class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <font-awesome-icon icon="eye" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Historique des désignations effectuées -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="history"
              class="w-5 h-5 text-green-600 dark:text-green-400"
            />
          </div>
          {{ t('profile.focalPoint.history.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div v-if="designationHistory.length === 0" class="text-center py-8">
          <font-awesome-icon
            icon="calendar-alt"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400">
            {{ t('profile.focalPoint.history.noHistory') }}
          </p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="designation in designationHistory"
            :key="designation.id"
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <font-awesome-icon
                  icon="check"
                  class="w-4 h-4 text-green-600 dark:text-green-400"
                />
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ designation.negotiator_name }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t('profile.focalPoint.history.designatedFor') }} {{ designation.designation_year }}
                </div>
              </div>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(designation.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="bolt"
              class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
            />
          </div>
          {{ t('profile.focalPoint.quickActions.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            @click="$emit('manage-negotiators')"
            class="flex items-center p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
              <font-awesome-icon
                icon="users-cog"
                class="w-5 h-5 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ t('profile.focalPoint.quickActions.manageNegotiators') }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('profile.focalPoint.quickActions.manageNegotiatorsDesc') }}
              </div>
            </div>
          </button>
          <button
            @click="$emit('view-reports')"
            class="flex items-center p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
              <font-awesome-icon
                icon="chart-bar"
                class="w-5 h-5 text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ t('profile.focalPoint.quickActions.viewReports') }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('profile.focalPoint.quickActions.viewReportsDesc') }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['designate-negotiator', 'manage-negotiators', 'view-reports'])

const loading = ref(false)
const designatedNegotiators = ref([])
const designationHistory = ref([])

// Computed
const activeNegotiators = computed(() => {
  return designatedNegotiators.value.filter(n => n.designation_year === currentYear.value)
})

const currentYear = computed(() => new Date().getFullYear())

// Méthodes
const loadFocalPointData = async () => {
  if (!props.userId) return
  
  loading.value = true
  try {
    const { supabase } = await import('@/composables/useSupabase')
    
    // Charger les négociateurs désignés par ce point focal
    const { data: negotiatorsData, error: negotiatorsError } = await supabase
      .from('negotiators')
      .select(`
        *,
        user:users!user_id(
          id,
          first_name,
          last_name,
          profile_photo_thumbnail_url
        )
      `)
      .eq('designated_by', props.userId)
      .order('designation_year', { ascending: false })

    if (negotiatorsError) {
      console.error('Error loading designated negotiators:', negotiatorsError)
    } else {
      designatedNegotiators.value = negotiatorsData || []
      
      // Créer l'historique des désignations
      designationHistory.value = (negotiatorsData || []).map(n => ({
        id: n.id,
        negotiator_name: `${n.user.first_name} ${n.user.last_name}`,
        designation_year: n.designation_year,
        created_at: n.created_at
      }))
    }

  } catch (error) {
    console.error('Error loading focal point data:', error)
  } finally {
    loading.value = false
  }
}

const getInitials = (firstName, lastName) => {
  if (!firstName || !lastName) return 'N'
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const viewNegotiatorDetails = (negotiator) => {
  // TODO: Ouvrir une modal avec les détails du négociateur
  console.log('View negotiator details:', negotiator)
}

// Lifecycle
onMounted(() => {
  loadFocalPointData()
})
</script>