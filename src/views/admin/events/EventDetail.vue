<template>
  <div class="admin-event-detail">
    <div v-if="isLoadingRoles || isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Chargement...</p>
      </div>
    </div>
    
    <div v-else-if="event" class="space-y-6">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ event.title }}
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              {{ event.acronym }} - {{ event.year }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Dropdown statut événement -->
            <div class="relative">
              <select v-model="event.event_status" 
                      @focus="previousEventStatusValue = event.event_status"
                      @change="handleEventStatusChange"
                      :disabled="isUpdatingEventStatus"
                      :class="[
                        'appearance-none rounded-full px-4 py-2 text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                        getStatusClass(event.event_status)
                      ]">
                <option value="upcoming">À venir</option>
                <option value="ongoing">En cours</option>
                <option value="completed">Terminé</option>
                <option value="suspended">Suspendu</option>
              </select>
              <!-- Icône dropdown -->
              <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            <!-- Dropdown statut soumissions -->
            <div class="relative">
              <select v-model="event.submission_status" 
                      @focus="previousSubmissionStatusValue = event.submission_status"
                      @change="handleSubmissionStatusChange"
                      :disabled="isUpdatingSubmissionStatus"
                      :class="[
                        'appearance-none rounded-full px-4 py-2 text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                        getSubmissionClass(event.submission_status)
                      ]">
                <option value="open">Soumissions ouvertes</option>
                <option value="closed">Soumissions fermées</option>
              </select>
              <!-- Icône dropdown -->
              <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            <!-- Indicateurs de chargement -->
            <div v-if="isUpdatingEventStatus || isUpdatingSubmissionStatus" class="flex items-center text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
              <span class="text-sm">Mise à jour...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations de l'événement -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Description</h2>
            <div class="prose dark:prose-invert max-w-none">
              {{ event.description }}
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Détails</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Mode</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ event.participation_mode }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline soumissions</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ formatDateTime(event.submission_deadline) }}
                </dd>
              </div>
              <div v-if="event.city">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Lieu</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ event.city }}, {{ event.country?.name_fr }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Créé le</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ formatDate(event.created_at) }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Médias -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Médias</h3>

            <div v-if="mediaError" class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {{ mediaError }}
            </div>
            <div v-if="mediaSuccess" class="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
              {{ mediaSuccess }}
            </div>

            <!-- Bannière -->
            <div class="mb-6">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Bannière (32:9)</p>

              <img v-if="event.banner_high_quality_32_9_url"
                   :src="event.banner_high_quality_32_9_url"
                   alt="Bannière de l'événement"
                   class="w-full aspect-[32/9] object-cover rounded-lg mb-3">
              <p v-else class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Aucune bannière : l'image par défaut est affichée sur le site.
              </p>

              <input ref="bannerFileInput"
                     type="file"
                     accept="image/*"
                     class="hidden"
                     @change="onBannerSelected">
              <button type="button"
                      @click="$refs.bannerFileInput.click()"
                      :disabled="isUploading || isSavingMedia"
                      class="cursor-pointer w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                {{ isUploading || isSavingMedia ? 'Envoi en cours...' : (event.banner_high_quality_32_9_url ? 'Remplacer la bannière' : 'Ajouter une bannière') }}
              </button>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Format recommandé : 32:9 (ex. 1920x540px). PNG, JPG ou WebP, 10 Mo max.
              </p>
            </div>

            <!-- Logo -->
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Logo</p>

              <img v-if="event.logo_url"
                   :src="event.logo_url"
                   alt="Logo de l'événement"
                   class="w-24 h-24 object-contain rounded-lg bg-white mb-3">
              <p v-else class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Aucun logo.
              </p>

              <input ref="logoFileInput"
                     type="file"
                     accept="image/*"
                     class="hidden"
                     @change="onLogoSelected">
              <button type="button"
                      @click="$refs.logoFileInput.click()"
                      :disabled="isUploading || isSavingMedia"
                      class="cursor-pointer w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                {{ isUploading || isSavingMedia ? 'Envoi en cours...' : (event.logo_url ? 'Remplacer le logo' : 'Ajouter un logo') }}
              </button>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, SVG ou WebP, 5 Mo max.
              </p>
            </div>
          </div>

        </div>
      </div>
      
      <!-- Message d'erreur pour le changement de statut -->
      <div v-if="statusError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ statusError }}
        <button @click="statusError = null" class="ml-2 text-red-900 hover:text-red-700">
          <svg class="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Événement non trouvé</p>
    </div>

    <!-- Modal de confirmation pour statut événement -->
    <div v-if="showEventStatusConfirmModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeEventStatusConfirmModal"></div>

        <div class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-md w-full mx-4 z-10">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Confirmer le changement de statut d'événement
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-300">
                    {{ getEventStatusChangeMessage() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="confirmEventStatusChange"
                    :disabled="isUpdatingEventStatus"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <div v-if="isUpdatingEventStatus" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ isUpdatingEventStatus ? 'En cours...' : 'Confirmer' }}
            </button>
            <button @click="closeEventStatusConfirmModal"
                    :disabled="isUpdatingEventStatus"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation pour statut soumissions -->
    <div v-if="showSubmissionStatusConfirmModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeSubmissionStatusConfirmModal"></div>

        <div class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-md w-full mx-4 z-10">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Confirmer le changement de statut des soumissions
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-300">
                    {{ getSubmissionStatusChangeMessage() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="confirmSubmissionStatusChange"
                    :disabled="isUpdatingSubmissionStatus"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <div v-if="isUpdatingSubmissionStatus" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ isUpdatingSubmissionStatus ? 'En cours...' : 'Confirmer' }}
            </button>
            <button @click="closeSubmissionStatusConfirmModal"
                    :disabled="isUpdatingSubmissionStatus"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import { useEventMediaUpload } from '@/composables/useEventMediaUpload'

const route = useRoute()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()
const { isUploading, uploadError, uploadBanner, uploadLogo } = useEventMediaUpload()

const isLoading = ref(true)
const event = ref(null)
const isUpdatingEventStatus = ref(false)
const isUpdatingSubmissionStatus = ref(false)
const previousEventStatusValue = ref(null)
const previousSubmissionStatusValue = ref(null)
const showEventStatusConfirmModal = ref(false)
const showSubmissionStatusConfirmModal = ref(false)
const pendingEventStatusChange = ref(null)
const pendingSubmissionStatusChange = ref(null)
const statusError = ref(null)
const isSavingMedia = ref(false)
const mediaSuccess = ref(null)

const checkAccess = async () => {
  await loadUserRoles()
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

const loadEvent = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        country:countries(id, name_fr)
      `)
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    event.value = data
  } catch (error) {
    console.error('Erreur lors du chargement de l\'événement:', error)
  } finally {
    isLoading.value = false
  }
}

// Gestion des médias (bannière et logo)
const saveMediaError = ref(null)
const mediaError = computed(() => uploadError.value || saveMediaError.value)

const saveMediaField = async (field, url) => {
  isSavingMedia.value = true
  saveMediaError.value = null
  mediaSuccess.value = null

  try {
    const { error } = await supabase
      .from('events')
      .update({ [field]: url, updated_at: new Date().toISOString() })
      .eq('id', event.value.id)

    if (error) throw error

    event.value[field] = url
    mediaSuccess.value = 'Image enregistrée.'
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du média:', error)
    saveMediaError.value = `Erreur lors de l'enregistrement : ${error.message}`
  } finally {
    isSavingMedia.value = false
  }
}

const onBannerSelected = async (fileEvent) => {
  const file = fileEvent.target.files[0]
  fileEvent.target.value = ''
  mediaSuccess.value = null
  saveMediaError.value = null

  const url = await uploadBanner(file, event.value?.id)
  if (url) await saveMediaField('banner_high_quality_32_9_url', url)
}

const onLogoSelected = async (fileEvent) => {
  const file = fileEvent.target.files[0]
  fileEvent.target.value = ''
  mediaSuccess.value = null
  saveMediaError.value = null

  const url = await uploadLogo(file, event.value?.id)
  if (url) await saveMediaField('logo_url', url)
}

const getStatusClass = (status) => {
  const classes = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  }
  return classes[status] || classes.upcoming
}

const getSubmissionClass = (status) => {
  return status === 'open' 
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('fr-FR')
}

// Gestion du changement de statut d'événement
const handleEventStatusChange = async (changeEvent) => {
  const newStatus = changeEvent.target.value
  const previousStatus = previousEventStatusValue.value
  
  if (newStatus === previousStatus) return
  
  pendingEventStatusChange.value = { newStatus, previousStatus }
  event.value.event_status = previousStatus
  showEventStatusConfirmModal.value = true
}

// Gestion du changement de statut de soumission
const handleSubmissionStatusChange = async (changeEvent) => {
  const newStatus = changeEvent.target.value
  const previousStatus = previousSubmissionStatusValue.value
  
  if (newStatus === previousStatus) return
  
  pendingSubmissionStatusChange.value = { newStatus, previousStatus }
  event.value.submission_status = previousStatus
  showSubmissionStatusConfirmModal.value = true
}

// Mise à jour du statut d'événement
const updateEventStatus = async (newStatus, previousStatus) => {
  isUpdatingEventStatus.value = true
  statusError.value = null
  
  try {
    const { error } = await supabase
      .from('events')
      .update({ event_status: newStatus })
      .eq('id', event.value.id)

    if (error) throw error
    event.value.event_status = newStatus
    console.log(`Statut événement mis à jour vers: ${newStatus}`)
  } catch (error) {
    event.value.event_status = previousStatus
    statusError.value = error.message || 'Erreur lors de la mise à jour du statut'
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    isUpdatingEventStatus.value = false
  }
}

// Mise à jour du statut de soumission
const updateSubmissionStatus = async (newStatus, previousStatus) => {
  isUpdatingSubmissionStatus.value = true
  statusError.value = null
  
  try {
    const { error } = await supabase
      .from('events')
      .update({ submission_status: newStatus })
      .eq('id', event.value.id)

    if (error) throw error
    event.value.submission_status = newStatus
    console.log(`Statut soumission mis à jour vers: ${newStatus}`)
  } catch (error) {
    event.value.submission_status = previousStatus
    statusError.value = error.message || 'Erreur lors de la mise à jour du statut'
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    isUpdatingSubmissionStatus.value = false
  }
}

// Fonctions de confirmation pour statut événement
const confirmEventStatusChange = async () => {
  if (!pendingEventStatusChange.value) return
  
  const { newStatus, previousStatus } = pendingEventStatusChange.value
  await updateEventStatus(newStatus, previousStatus)
  closeEventStatusConfirmModal()
}

const closeEventStatusConfirmModal = () => {
  showEventStatusConfirmModal.value = false
  pendingEventStatusChange.value = null
}

// Fonctions de confirmation pour statut soumission
const confirmSubmissionStatusChange = async () => {
  if (!pendingSubmissionStatusChange.value) return
  
  const { newStatus, previousStatus } = pendingSubmissionStatusChange.value
  await updateSubmissionStatus(newStatus, previousStatus)
  closeSubmissionStatusConfirmModal()
}

const closeSubmissionStatusConfirmModal = () => {
  showSubmissionStatusConfirmModal.value = false
  pendingSubmissionStatusChange.value = null
}

// Messages de confirmation
const getEventStatusChangeMessage = () => {
  if (!pendingEventStatusChange.value) return ''
  
  const { newStatus, previousStatus } = pendingEventStatusChange.value
  const statusTexts = {
    upcoming: 'À venir',
    ongoing: 'En cours',
    completed: 'Terminé',
    suspended: 'Suspendu'
  }
  
  return `Êtes-vous sûr de vouloir changer le statut de l'événement de "${statusTexts[previousStatus]}" vers "${statusTexts[newStatus]}" ?`
}

const getSubmissionStatusChangeMessage = () => {
  if (!pendingSubmissionStatusChange.value) return ''
  
  const { newStatus, previousStatus } = pendingSubmissionStatusChange.value
  const statusTexts = {
    open: 'Soumissions ouvertes',
    closed: 'Soumissions fermées'
  }
  
  return `Êtes-vous sûr de vouloir changer le statut des soumissions de "${statusTexts[previousStatus]}" vers "${statusTexts[newStatus]}" ?`
}

onMounted(async () => {
  try {
    await checkAccess()
    await loadEvent()
  } catch (error) {
    if (error.message === 'Accès non autorisé') {
      throw error
    }
    console.error('Erreur lors de l\'initialisation:', error)
  }
})
</script>