<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-session-detail">
    <!-- Header avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div class="flex items-center space-x-4">
        <!-- Bouton retour -->
        <router-link to="/admin/negotiations" 
                     class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          {{ t('admin.negotiations.backToList') }}
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('admin.negotiations.sessionDetails') }}
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-300">
            {{ t('admin.negotiations.sessionDetailsSubtitle') }}
          </p>
        </div>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <button @click="editSession" 
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          <svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          {{ t('admin.negotiations.editSession') }}
        </button>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    </div>

    <!-- Contenu principal -->
    <div v-else-if="session" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Détails de la session -->
      <div class="lg:col-span-2">
        <!-- Informations générales -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ t('admin.negotiations.generalInfo') }}
            </h2>
          </div>
          <div class="p-6">
            <!-- Titre -->
            <div class="mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {{ session.title }}
              </h3>
              <div class="flex items-center space-x-4">
                <span :class="getCategoryClass(session.category)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ t(`admin.negotiations.categories.${session.category}`) }}
                </span>
                <span :class="getMeetingTypeClass(session.meeting_type)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ t(`admin.negotiations.meetingTypes.${session.meeting_type}`) }}
                </span>
                <span v-if="session.is_ifdd_organized" 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                  {{ t('admin.negotiations.ifddOrganized') }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div v-if="session.description" class="mb-6">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {{ t('admin.negotiations.description') }}
              </h4>
              <p class="text-gray-600 dark:text-gray-400">{{ session.description }}</p>
            </div>

            <!-- Informations de base -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Date et heure -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {{ t('admin.negotiations.dateTime') }}
                </h4>
                <div class="space-y-1">
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ t('admin.negotiations.startDateTime') }}: {{ formatDateTime(session.start_datetime) }}
                  </div>
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ t('admin.negotiations.endDateTime') }}: {{ formatDateTime(session.end_datetime) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ t('admin.negotiations.duration') }}: {{ getDuration() }}
                  </div>
                </div>
              </div>

              <!-- Lieu -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {{ t('admin.negotiations.location') }}
                </h4>
                <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {{ session.location || t('admin.negotiations.online') }}
                </div>
              </div>
            </div>

            <!-- Liens externes -->
            <div v-if="session.external_link" class="mt-6">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {{ t('admin.negotiations.externalLink') }}
              </h4>
              <a :href="session.external_link" 
                 target="_blank" 
                 class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                {{ session.external_link }}
              </a>
            </div>

            <!-- Métadonnées -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {{ t('admin.negotiations.metadata') }}
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <strong>{{ t('admin.negotiations.createdBy') }}:</strong>
                  {{ session.creator?.first_name }} {{ session.creator?.last_name }}
                </div>
                <div>
                  <strong>{{ t('admin.negotiations.createdAt') }}:</strong>
                  {{ formatDate(session.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statut de la session -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ t('admin.negotiations.sessionStatus') }}
            </h2>
          </div>
          <div class="p-6">
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div :class="getStatusIndicatorClass()" class="w-3 h-3 rounded-full mr-2"></div>
                <span class="text-sm font-medium" :class="getStatusTextClass()">
                  {{ getSessionStatus() }}
                </span>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ getTimeUntilSession() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar : Inscriptions et actions -->
      <div class="lg:col-span-1">
        <!-- Statistiques des inscriptions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ t('admin.negotiations.registrations') }}
            </h2>
          </div>
          <div class="p-6">
            <div class="text-center mb-4">
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {{ registrations.length }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('admin.negotiations.totalRegistrations') }}
              </div>
            </div>
            
            <!-- Actions rapides -->
            <div class="space-y-2">
              <button @click="exportRegistrations" 
                      class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                <svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                {{ t('admin.negotiations.exportRegistrations') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des inscrits -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ t('admin.negotiations.registeredUsers') }}
            </h2>
          </div>
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <div v-if="isLoadingRegistrations" class="p-6 text-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {{ t('admin.negotiations.loadingRegistrations') }}
              </p>
            </div>
            
            <div v-else-if="registrations.length === 0" class="p-6 text-center">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              <p class="text-gray-500 dark:text-gray-400">{{ t('admin.negotiations.noRegistrations') }}</p>
            </div>

            <div v-else class="max-h-96 overflow-y-auto">
              <div v-for="registration in registrations" 
                   :key="registration.id" 
                   class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div class="flex items-center space-x-3">
                  <img :src="registration.user.profile_photo_thumbnail_url || '/images/default-avatar.png'"
                       :alt="registration.user.first_name"
                       class="h-8 w-8 rounded-full">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ registration.user.first_name }} {{ registration.user.last_name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ registration.user.email }}
                    </div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">
                      {{ t('admin.negotiations.registeredOn') }} {{ formatDate(registration.registered_at) }}
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <!-- Badges de rôles -->
                    <div v-if="registration.user.user_roles?.length" class="flex space-x-1">
                      <span v-for="role in registration.user.user_roles" 
                            :key="role.id"
                            :class="getRoleClass(role.role)"
                            class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium">
                        {{ t(`admin.roles.types.${role.role}`) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Session non trouvée -->
    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('admin.negotiations.sessionNotFound') }}
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        {{ t('admin.negotiations.sessionNotFoundDesc') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()

// État
const isLoading = ref(true)
const isLoadingRegistrations = ref(true)
const session = ref(null)
const registrations = ref([])

// Vérification des permissions
const checkAccess = async () => {
  await loadUserRoles()
  
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

// Charger la session
const loadSession = async () => {
  try {
    isLoading.value = true

    const { data, error } = await supabase
      .from('negotiation_sessions')
      .select(`
        *,
        creator:created_by (
          id,
          first_name,
          last_name
        )
      `)
      .eq('id', route.params.id)
      .single()

    if (error) throw error

    session.value = data
  } catch (error) {
    console.error('Erreur lors du chargement de la session:', error)
    session.value = null
  } finally {
    isLoading.value = false
  }
}

// Charger les inscriptions
const loadRegistrations = async () => {
  try {
    isLoadingRegistrations.value = true

    const { data, error } = await supabase
      .from('session_registrations')
      .select(`
        id,
        registered_at,
        user:user_id (
          id,
          first_name,
          last_name,
          email,
          profile_photo_thumbnail_url,
          user_roles!inner (
            id,
            role,
            is_active
          )
        )
      `)
      .eq('session_id', route.params.id)
      .order('registered_at', { ascending: false })

    if (error) throw error

    registrations.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des inscriptions:', error)
  } finally {
    isLoadingRegistrations.value = false
  }
}

// Méthodes utilitaires
const getCategoryClass = (category) => {
  const classes = {
    climate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    biodiversity: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    desertification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }
  return classes[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const getMeetingTypeClass = (type) => {
  const classes = {
    Preparatory_Workshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    Francophone_Consultation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    Innovation: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    Field_Training_Workshop: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  }
  return classes[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const getRoleClass = (role) => {
  const classes = {
    standard: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    negotiator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    unfccc_focal_point: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    trainer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    super_admin: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200'
  }
  return classes[role] || classes.standard
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getDuration = () => {
  if (!session.value) return ''
  
  const start = new Date(session.value.start_datetime)
  const end = new Date(session.value.end_datetime)
  const diffMs = end - start
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}min`
  }
  return `${diffMinutes}min`
}

const getSessionStatus = () => {
  if (!session.value) return ''
  
  const now = new Date()
  const start = new Date(session.value.start_datetime)
  const end = new Date(session.value.end_datetime)
  
  if (start > now) {
    return t('admin.negotiations.status.upcoming')
  } else if (start <= now && end >= now) {
    return t('admin.negotiations.status.ongoing')
  } else {
    return t('admin.negotiations.status.completed')
  }
}

const getStatusIndicatorClass = () => {
  if (!session.value) return 'bg-gray-400'
  
  const now = new Date()
  const start = new Date(session.value.start_datetime)
  const end = new Date(session.value.end_datetime)
  
  if (start > now) {
    return 'bg-blue-400'
  } else if (start <= now && end >= now) {
    return 'bg-green-400'
  } else {
    return 'bg-gray-400'
  }
}

const getStatusTextClass = () => {
  if (!session.value) return 'text-gray-600'
  
  const now = new Date()
  const start = new Date(session.value.start_datetime)
  const end = new Date(session.value.end_datetime)
  
  if (start > now) {
    return 'text-blue-600 dark:text-blue-400'
  } else if (start <= now && end >= now) {
    return 'text-green-600 dark:text-green-400'
  } else {
    return 'text-gray-600 dark:text-gray-400'
  }
}

const getTimeUntilSession = () => {
  if (!session.value) return ''
  
  const now = new Date()
  const start = new Date(session.value.start_datetime)
  const end = new Date(session.value.end_datetime)
  
  if (start > now) {
    const diffMs = start - now
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (diffDays > 0) {
      return t('admin.negotiations.startsInDays', { days: diffDays })
    } else if (diffHours > 0) {
      return t('admin.negotiations.startsInHours', { hours: diffHours })
    } else {
      return t('admin.negotiations.startsSoon')
    }
  } else if (start <= now && end >= now) {
    const diffMs = end - now
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return t('admin.negotiations.endsInHours', { hours: diffHours })
    } else {
      return t('admin.negotiations.endsInMinutes', { minutes: diffMinutes })
    }
  } else {
    const diffMs = now - end
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return t('admin.negotiations.endedToday')
    } else {
      return t('admin.negotiations.endedDaysAgo', { days: diffDays })
    }
  }
}

// Actions
const editSession = () => {
  // TODO: Implémenter l'édition
  console.log('Éditer session:', session.value?.id)
}

const exportRegistrations = () => {
  if (registrations.value.length === 0) return

  // Créer un CSV des inscriptions
  const csvContent = [
    ['Nom', 'Prénom', 'Email', 'Date d\'inscription', 'Rôles'].join(','),
    ...registrations.value.map(reg => [
      reg.user.last_name,
      reg.user.first_name,
      reg.user.email,
      formatDate(reg.registered_at),
      reg.user.user_roles?.map(r => r.role).join(';') || ''
    ].map(field => `"${field}"`).join(','))
  ].join('\n')

  // Télécharger le fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `inscriptions-${session.value?.title || 'session'}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Cycle de vie
onMounted(async () => {
  try {
    await checkAccess()
    await Promise.all([loadSession(), loadRegistrations()])
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    if (error.message === 'Accès non autorisé') {
      router.push('/403')
    }
  }
})
</script>