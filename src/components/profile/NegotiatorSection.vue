<template>
  <div class="space-y-8">
    <!-- Historique des désignations -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="gavel"
              class="w-5 h-5 text-purple-600 dark:text-purple-400"
            />
          </div>
          {{ t('profile.negotiator.designationHistory.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-4">
          <font-awesome-icon icon="spinner" class="animate-spin text-gray-400" />
        </div>
        <div v-else-if="designations.length === 0" class="text-center py-8">
          <font-awesome-icon
            icon="info-circle"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400">
            {{ t('profile.negotiator.designationHistory.noDesignations') }}
          </p>
        </div>
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {{ designations.length }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ t('profile.negotiator.designationHistory.totalDesignations') }}
              </div>
            </div>
            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ currentYear }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ t('profile.negotiator.designationHistory.currentYear') }}
              </div>
            </div>
            <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ latestDesignation?.designation_year || '-' }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ t('profile.negotiator.designationHistory.latestDesignation') }}
              </div>
            </div>
          </div>

          <!-- Liste des désignations -->
          <div class="space-y-3">
            <h4 class="font-medium text-gray-900 dark:text-white">
              {{ t('profile.negotiator.designationHistory.designationsList') }}
            </h4>
            <div
              v-for="designation in designations"
              :key="designation.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span class="text-purple-600 dark:text-purple-400 font-semibold">
                    {{ designation.designation_year }}
                  </span>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ t('profile.negotiator.designationHistory.designationFor') }} {{ designation.designation_year }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ t('profile.negotiator.designationHistory.designatedBy') }}: 
                    {{ designation.designated_by_name || t('profile.negotiator.designationHistory.system') }}
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
    </div>

    <!-- Expertise et participations -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="lightbulb"
              class="w-5 h-5 text-green-600 dark:text-green-400"
            />
          </div>
          {{ t('profile.negotiator.expertise.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Thématiques de spécialisation -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">
              {{ t('profile.negotiator.expertise.specializationThemes') }}
            </h4>
            <div v-if="latestDesignation?.specialization_themes?.length" class="flex flex-wrap gap-2">
              <span
                v-for="theme in latestDesignation.specialization_themes"
                :key="theme"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              >
                {{ theme }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400 text-sm">
              {{ t('profile.negotiator.expertise.noThemes') }}
            </p>
          </div>

          <!-- COP participées -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">
              {{ t('profile.negotiator.expertise.copParticipations') }}
            </h4>
            <div v-if="latestDesignation?.cop_participations?.length" class="flex flex-wrap gap-2">
              <span
                v-for="cop in latestDesignation.cop_participations"
                :key="cop"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {{ cop }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400 text-sm">
              {{ t('profile.negotiator.expertise.noCops') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Historique des concertations -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="handshake"
              class="w-5 h-5 text-orange-600 dark:text-orange-400"
            />
          </div>
          {{ t('profile.negotiator.consultations.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div v-if="consultations.length === 0" class="text-center py-8">
          <font-awesome-icon
            icon="calendar-times"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400">
            {{ t('profile.negotiator.consultations.noConsultations') }}
          </p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="consultation in consultations"
            :key="consultation.id"
            class="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {{ consultation.title }}
                </h4>
                <div class="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex items-center">
                    <font-awesome-icon icon="calendar" class="mr-2" />
                    {{ formatDateRange(consultation.start_date, consultation.end_date) }}
                  </div>
                  <div class="flex items-center">
                    <font-awesome-icon icon="map-marker-alt" class="mr-2" />
                    {{ consultation.city }}, {{ consultation.country_name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Accès rapide -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="rocket"
              class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
            />
          </div>
          {{ t('profile.negotiator.quickAccess.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button class="flex items-center p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-4">
              <font-awesome-icon
                icon="users"
                class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ t('profile.negotiator.quickAccess.negotiationSpace') }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('profile.negotiator.quickAccess.negotiationSpaceDesc') }}
              </div>
            </div>
          </button>
          <button class="flex items-center p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
              <font-awesome-icon
                icon="graduation-cap"
                class="w-5 h-5 text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ t('profile.negotiator.quickAccess.specializedTraining') }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('profile.negotiator.quickAccess.specializedTrainingDesc') }}
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

const loading = ref(false)
const designations = ref([])
const consultations = ref([])

// Computed
const latestDesignation = computed(() => {
  return designations.value.length > 0 
    ? designations.value.reduce((latest, current) => 
        current.designation_year > latest.designation_year ? current : latest
      )
    : null
})

const currentYear = computed(() => new Date().getFullYear())

// Méthodes
const loadNegotiatorData = async () => {
  if (!props.userId) return
  
  loading.value = true
  try {
    const { supabase } = await import('@/composables/useSupabase')
    
    // Charger les désignations
    const { data: designationsData, error: designationsError } = await supabase
      .from('negotiators')
      .select(`
        *,
        designated_by_user:users!designated_by(first_name, last_name)
      `)
      .eq('user_id', props.userId)
      .order('designation_year', { ascending: false })

    if (designationsError) {
      console.error('Error loading designations:', designationsError)
    } else {
      designations.value = (designationsData || []).map(d => ({
        ...d,
        designated_by_name: d.designated_by_user 
          ? `${d.designated_by_user.first_name} ${d.designated_by_user.last_name}`
          : null
      }))
    }

    // Charger les concertations
    if (designations.value.length > 0) {
      const negotiatorIds = designations.value.map(d => d.id)
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('negotiator_consultations')
        .select(`
          *,
          countries(name_fr, name_en)
        `)
        .in('negotiator_id', negotiatorIds)
        .order('start_date', { ascending: false })

      if (consultationsError) {
        console.error('Error loading consultations:', consultationsError)
      } else {
        consultations.value = (consultationsData || []).map(c => ({
          ...c,
          country_name: c.countries?.name_fr || c.countries?.name_en || ''
        }))
      }
    }

  } catch (error) {
    console.error('Error loading negotiator data:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  const end = new Date(endDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  return `${start} - ${end}`
}

// Lifecycle
onMounted(() => {
  loadNegotiatorData()
})
</script>