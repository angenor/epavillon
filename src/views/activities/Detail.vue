<template>
  <div class="min-h-screen relative transition-colors duration-200">
    <!-- Image de fond avec repeat -->
    <div 
      class="absolute inset-0 z-0 dark:opacity-20"
      :style="{
        backgroundImage: 'url(/images/people-bg/people-bg-2.jpg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left'
      }"
    >
    </div>
    
    <!-- Overlay pour la lisibilité -->
    <div class="absolute inset-0 z-10 bg-white/80 dark:bg-gray-900/85"></div>
    
    <!-- Contenu principal -->
    <div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-96">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div class="flex">
          <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              {{ t('activities.detail.error.title') }}
            </h3>
            <p class="mt-2 text-sm text-red-700 dark:text-red-300">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Activity content -->
      <div v-else-if="activity" class="space-y-8">
        <!-- Header -->
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <!-- Banner image -->
          <div v-if="activity.cover_image_high_url" class="h-64 md:h-80 bg-gray-300 dark:bg-gray-700">
            <img 
              :src="activity.cover_image_high_url" 
              :alt="activity.title"
              class="w-full h-full object-cover"
            />
          </div>
          
          <!-- Header content -->
          <div class="p-6 md:p-8">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between">
              <div class="flex-1">
                <!-- Status badge -->
                <div class="mb-4">
                  <span 
                    :class="[
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      getStatusBadgeClass(activity.validation_status)
                    ]"
                  >
                    {{ t(`activities.status.${activity.validation_status}`) }}
                  </span>
                </div>

                <!-- Title -->
                <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {{ activity.title }}
                </h1>

                <!-- Meta information -->
                <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <div class="flex items-center">
                    <font-awesome-icon icon="calendar" class="mr-2" />
                    {{ formatDate(activity.proposed_start_date) }}
                  </div>
                  <div class="flex items-center">
                    <font-awesome-icon icon="clock" class="mr-2" />
                    {{ formatTime(activity.proposed_start_date) }} - {{ formatTime(activity.proposed_end_date) }}
                  </div>
                  <div class="flex items-center">
                    <font-awesome-icon :icon="getFormatIcon(activity.format)" class="mr-2" />
                    {{ t(`activity.formats.${activity.format}`) }}
                  </div>
                  <div v-if="activity.country" class="flex items-center">
                    <font-awesome-icon icon="map-marker-alt" class="mr-2" />
                    {{ activity.country.name_fr }}
                  </div>
                </div>

                <!-- Organization -->
                <div class="flex items-center mb-6">
                  <div class="flex-shrink-0 w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                    <font-awesome-icon icon="building" class="text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('activities.detail.organizedBy') }}</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ activity.organization?.name }}</p>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-col sm:flex-row gap-3 mt-6 md:mt-0 md:ml-8">
                <!-- Edit button (only for owner or admin) -->
                <router-link
                  v-if="canEdit"
                  :to="`/activities/${activity.id}/edit`"
                  class="inline-flex items-center px-6 py-3 border border-orange-600 text-base font-medium rounded-lg text-orange-600 hover:text-white bg-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  <font-awesome-icon icon="edit" class="mr-2" />
                  {{ t('activities.detail.edit') }}
                </router-link>

                <button
                  v-if="canRegister"
                  @click="handleRegistration"
                  :disabled="isRegistering"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <font-awesome-icon 
                    :icon="isRegistering ? 'spinner' : 'user-plus'" 
                    :class="['mr-2', { 'animate-spin': isRegistering }]"
                  />
                  {{ isRegistering ? t('activities.detail.registering') : t('activities.detail.register') }}
                </button>

                <button
                  v-else-if="userRegistration"
                  @click="handleUnregistration" 
                  :disabled="isRegistering"
                  class="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <font-awesome-icon 
                    :icon="isRegistering ? 'spinner' : 'user-minus'" 
                    :class="['mr-2', { 'animate-spin': isRegistering }]"
                  />
                  {{ isRegistering ? t('activities.detail.unregistering') : t('activities.detail.unregister') }}
                </button>

                <button
                  @click="shareActivity"
                  class="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <font-awesome-icon icon="share" class="mr-2" />
                  {{ t('activities.detail.share') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Description -->
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('activities.detail.sections.objectives') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none" v-html="activity.objectives"></div>
            </div>

            <!-- Detailed presentation -->
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('activities.detail.sections.detailedPresentation') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none" v-html="activity.detailed_presentation"></div>
            </div>

            <!-- Speakers -->
            <div v-if="speakers.length > 0" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {{ t('activities.detail.sections.speakers') }}
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  v-for="speaker in speakers"
                  :key="speaker.id"
                  class="flex items-start space-x-4"
                >
                  <div class="flex-shrink-0 w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <font-awesome-icon icon="user" class="text-gray-600 dark:text-gray-400" />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      {{ speaker.civility }} {{ speaker.first_name }} {{ speaker.last_name }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ speaker.position }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ speaker.organization }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ speaker.email }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Documents -->
            <div v-if="documents.length > 0" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {{ t('activities.detail.sections.documents') }}
              </h2>
              <div class="space-y-3">
                <a
                  v-for="document in documents"
                  :key="document.id"
                  :href="document.file_url"
                  target="_blank"
                  class="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <font-awesome-icon icon="file-alt" class="text-gray-400 mr-3" />
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">{{ document.title }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ document.file_type }}</p>
                  </div>
                  <font-awesome-icon icon="external-link-alt" class="text-gray-400 ml-2" />
                </a>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Activity info card -->
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('activities.detail.sections.information') }}
              </h3>
              
              <div class="space-y-4">
                <!-- Activity type -->
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {{ t('activities.detail.activityType') }}
                  </p>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ t(`activities.types.${activity.activity_type}`) }}
                  </p>
                </div>

                <!-- Main themes -->
                <div v-if="activity.main_themes?.length > 0">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {{ t('activities.detail.mainThemes') }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="theme in activity.main_themes"
                      :key="theme"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {{ t(`activities.themes.${theme}`) }}
                    </span>
                  </div>
                </div>

                <!-- Categories -->
                <div v-if="activity.categories?.length > 0">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {{ t('activities.detail.categories') }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="category in activity.categories"
                      :key="category"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {{ t(`activities.categories.${category}`) }}
                    </span>
                  </div>
                </div>

                <!-- Tags -->
                <div v-if="activity.tags?.length > 0">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {{ t('activities.detail.tags') }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in activity.tags"
                      :key="tag"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <!-- Registration count -->
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {{ t('activities.detail.registrations') }}
                  </p>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ registrations.length }} {{ t('activities.detail.participants') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Event info -->
            <div v-if="event" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('activities.detail.sections.event') }}
              </h3>
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {{ t('activities.detail.eventTitle') }}
                  </p>
                  <p class="text-sm text-gray-900 dark:text-white">{{ event.title }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {{ t('activities.detail.eventYear') }}
                  </p>
                  <p class="text-sm text-gray-900 dark:text-white">{{ event.year }}</p>
                </div>
                <router-link
                  :to="`/events/${event.id}`"
                  class="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {{ t('activities.detail.viewEvent') }}
                  <font-awesome-icon icon="arrow-right" class="ml-1" />
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const route = useRoute()
const { supabase } = useSupabase()
const authStore = useAuthStore()

// Reactive data
const isLoading = ref(true)
const error = ref(null)
const activity = ref(null)
const event = ref(null)
const speakers = ref([])
const documents = ref([])
const registrations = ref([])
const userRegistration = ref(null)
const isRegistering = ref(false)

// Computed properties
const canRegister = computed(() => {
  return authStore.isAuthenticated && 
         activity.value?.validation_status === 'approved' && 
         !userRegistration.value
})

const canEdit = computed(() => {
  if (!activity.value || !authStore.user) return false
  
  // User can edit their own activity or if they are admin
  return activity.value.submitted_by === authStore.user.id || 
         authStore.profile?.user_roles?.some(role => 
           ['admin', 'super_admin'].includes(role.role) && role.is_active
         )
})

// Methods
const loadActivity = async () => {
  try {
    isLoading.value = true
    error.value = null

    const activityId = route.params.id
    
    // Load activity with related data
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select(`
        *,
        organization:organizations(*),
        country:countries(*),
        event:events(*)
      `)
      .eq('id', activityId)
      .single()

    if (activityError) throw activityError

    activity.value = activityData
    event.value = activityData.event

    // Load speakers
    const { data: speakersData } = await supabase
      .from('activity_speakers')
      .select('*')
      .eq('activity_id', activityId)

    speakers.value = speakersData || []

    // Load documents
    const { data: documentsData } = await supabase
      .from('activity_documents')
      .select('*')
      .eq('activity_id', activityId)

    documents.value = documentsData || []

    // Load registrations
    const { data: registrationsData } = await supabase
      .from('activity_registrations')
      .select('*')
      .eq('activity_id', activityId)

    registrations.value = registrationsData || []

    // Check if current user is registered
    if (authStore.user) {
      const { data: userRegData } = await supabase
        .from('activity_registrations')
        .select('*')
        .eq('activity_id', activityId)
        .eq('user_id', authStore.user.id)
        .maybeSingle()

      userRegistration.value = userRegData
    }

  } catch (err) {
    console.error('Error loading activity:', err)
    error.value = t('activities.detail.error.loadFailed')
  } finally {
    isLoading.value = false
  }
}

const handleRegistration = async () => {
  if (!authStore.user || isRegistering.value) return

  try {
    isRegistering.value = true

    const { error: regError } = await supabase
      .from('activity_registrations')
      .insert({
        activity_id: activity.value.id,
        user_id: authStore.user.id
      })

    if (regError) throw regError

    // Reload registrations
    await loadActivity()

  } catch (err) {
    console.error('Error registering:', err)
    error.value = t('activities.detail.error.registrationFailed')
  } finally {
    isRegistering.value = false
  }
}

const handleUnregistration = async () => {
  if (!authStore.user || isRegistering.value) return

  try {
    isRegistering.value = true

    const { error: unregError } = await supabase
      .from('activity_registrations')
      .delete()
      .eq('activity_id', activity.value.id)
      .eq('user_id', authStore.user.id)

    if (unregError) throw unregError

    // Reload registrations
    await loadActivity()

  } catch (err) {
    console.error('Error unregistering:', err)
    error.value = t('activities.detail.error.unregistrationFailed')
  } finally {
    isRegistering.value = false
  }
}

const shareActivity = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: activity.value.title,
        text: activity.value.objectives.substring(0, 100) + '...',
        url: window.location.href
      })
    } catch (err) {
      console.log('Error sharing:', err)
    }
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
  }
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'submitted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'under_review': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return classes[status] || classes.draft
}

const getFormatIcon = (format) => {
  const icons = {
    'online': 'video',
    'in_person': 'map-marker-alt',
    'hybrid': 'globe'
  }
  return icons[format] || 'calendar'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadActivity()
})
</script>