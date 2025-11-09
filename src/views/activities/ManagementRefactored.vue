<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
    <!-- Browser Recommendation -->
    <BrowserRecommendation />
    <div class="max-w-[1400px] mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      <!-- Main Content with Sidebar -->
      <div v-else-if="activity" class="flex gap-8">
        <!-- Sidebar Navigation -->
        <aside class="hidden lg:block w-64 flex-shrink-0">
          <ActivityManagementSidebar
            :activity="activity"
            :speakers-count="speakerManagement.speakers.value.length"
            :documents-count="documentManagement.documents.value.length"
            :tags-count="tagManagement.tags.value.length"
            :validation-status="activity.validation_status"
            :can-edit="!isActivityApproved"
            @scroll-to="handleScrollTo"
            @preview="handlePreview"
            @submit-validation="handleSubmitValidation"
          />
        </aside>

        <!-- Main Content Area -->
        <div class="flex-1 min-w-0">
          <!-- Header -->
          <ActivityHeader
            :activity="activity"
          />

          <!-- Timeline de validation -->
          <ActivityValidationTimeline
            v-if="activity"
            :current-status="activity.validation_status"
            class="mb-8"
          />

          <!-- Information de publication (uniquement pour les activités approuvées) -->
          <ActivityPublicationInfo
            v-if="isActivityApproved"
            :activity-id="activity.id"
            :activity-title="activity.title"
            :activity-description="activity.objectives || activity.detailed_presentation"
            :activity-image="activity.cover_image_high_url || activity.cover_image_low_url"
            :activity-date="formatActivityDate(activity)"
            class="mb-8"
          />

          <!-- Sections -->
          <div class="space-y-8">
            <!-- Bannières Section -->
            <ActivityBannerSection
              id="banner"
              :activity="activity"
              :editingBanner="editingBanner"
              @toggle-editing="editingBanner = !editingBanner"
              @banner-processed="onBannerImageProcessed"
            />

            <!-- Informations générales Section -->
            <ActivityGeneralInfoSection
              id="general-info"
              :activity="activity"
              :editingField="activityEditing.editingField.value"
              :tempValue="activityEditing.tempValue.value"
              :hasUnsavedChanges="activityEditing.hasUnsavedChanges.value"
              :savingField="activityEditing.savingField.value"
              @start-edit="startEditActivity"
              @cancel-edit="cancelEditActivity"
              @field-change="onActivityFieldChange"
              @save-field="saveActivityField"
            />

            <!-- Section Dates -->
            <ActivityDatesSection
              id="dates"
              :activity="activity"
              :eventData="eventData"
              :eventTimezone="eventTimezone"
              :activityDates="activityDates"
              :editingField="activityEditing.editingField.value"
              :tempValue="activityEditing.tempValue.value"
              :hasUnsavedChanges="activityEditing.hasUnsavedChanges.value"
              :savingField="activityEditing.savingField.value"
              :canEdit="canEditDates"
              @start-edit="startEditActivity"
              @cancel-edit="cancelEditActivity"
              @field-change="onActivityFieldChange"
              @save-field="saveActivityField"
              @save-dates="activityDates.saveDates"
              @cancel-dates="activityDates.cancelDateChanges"
            />

            <!-- Intervenants Section -->
            <ActivitySpeakersSection
              id="speakers"
              :speakers="speakerManagement.speakers.value"
              :editingField="speakerManagement.editingField.value"
              :tempSpeakerValue="speakerManagement.tempSpeakerValue.value"
              :hasUnsavedSpeakerChanges="speakerManagement.hasUnsavedSpeakerChanges.value"
              :savingSpeakerField="speakerManagement.savingSpeakerField.value"
              :uploadingPhoto="speakerManagement.uploadingPhoto.value"
              :uploadProgress="speakerManagement.uploadProgress.value"
              @start-edit-speaker="speakerManagement.startEditSpeaker"
              @cancel-edit-speaker="speakerManagement.cancelEditSpeaker"
              @speaker-field-change="speakerManagement.onSpeakerFieldChange"
              @save-speaker-field="handleSaveSpeakerField"
              @remove-speaker="handleRemoveSpeaker"
              @upload-speaker-photo="handleUploadSpeakerPhoto"
              @show-speaker-photo-modal="speakerManagement.showSpeakerPhotoModal"
              @send-confirmation-email="handleSendConfirmationEmail"
              @add-speaker="speakerManagement.openAddSpeakerModal"
            />

            <!-- Documents Section -->
            <ActivityDocumentsSection
              id="documents"
              :documents="documentManagement.documents.value"
              :getDocumentIcon="documentManagement.getDocumentIcon"
              :getDocumentIconColor="documentManagement.getDocumentIconColor"
              :isActivityApproved="isActivityApproved"
              @add-new-document="documentManagement.addNewDocument"
              @remove-document="handleRemoveDocument"
            />

            <!-- Tags Section -->
            <ActivityTagsSection
              id="tags"
              :tags="tagManagement.tags.value"
              :newTag="tagManagement.newTag.value"
              :canAddMoreTags="tagManagement.canAddMoreTags.value"
              :remainingTags="tagManagement.remainingTags.value"
              :maxTags="tagManagement.maxTags"
              :isActivityApproved="isActivityApproved"
              @add-tag="handleAddTag"
              @remove-tag="handleRemoveTag"
              @update:newTag="tagManagement.newTag.value = $event"
              @key-press="handleTagKeyPress"
            />
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">{{ t('events.activityNotFound') }}</p>
      </div>
    </div>

    <!-- Modals -->
    <AddDocumentModal
      :show="documentManagement.showAddDocumentModal.value"
      :form="documentManagement.newDocumentForm"
      :selected-file="documentManagement.selectedDocumentFile.value"
      :saving="documentManagement.savingNewDocument.value"
      @submit="handleSubmitNewDocument"
      @cancel="documentManagement.cancelAddDocument"
      @update:form="updateDocumentForm"
      @file-selected="documentManagement.onDocumentFileSelected"
    />

    <!-- Speaker Photo Modal -->
    <SpeakerPhotoModal
      :show="speakerManagement.showPhotoModal.value"
      :selected-photo="speakerManagement.selectedSpeakerPhoto.value"
      @close="speakerManagement.closePhotoModal"
    />

    <!-- Add Speaker Modal -->
    <AddSpeakerModal
      :isOpen="speakerManagement.showAddSpeakerModal.value"
      :activityId="route.params.id"
      @close="speakerManagement.closeAddSpeakerModal"
      @save="handleAddNewSpeaker"
    />

    <!-- Comment Floating Button for Submitters -->
    <CommentFloatingButtonUser
      v-if="activity"
      :activityId="activity.id"
      :submitterId="activity.submitted_by"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useTimezone } from '@/composables/useTimezone'
import { useSupabase } from '@/composables/useSupabase'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

// Business logic composables
import { useInlineEditing } from '@/composables/useInlineEditing'
import { useSpeakerManagement } from '@/composables/useSpeakerManagement'
import { useDocumentManagement } from '@/composables/useDocumentManagement'
import { useActivityDates } from '@/composables/useActivityDates'
import { useTagManagement } from '@/composables/useTagManagement'
import useUserActivities from '@/composables/useUserActivities'

// UI Components
import ActivityValidationTimeline from '@/components/ActivityValidationTimeline.vue'
import ActivityHeader from '@/components/activity/ActivityHeader.vue'
import ActivityPublicationInfo from '@/components/activity/ActivityPublicationInfo.vue'
import ActivityBannerSection from '@/components/activity/ActivityBannerSection.vue'
import ActivityGeneralInfoSection from '@/components/activity/ActivityGeneralInfoSection.vue'
import ActivityDatesSection from '@/components/activity/ActivityDatesSection.vue'
import ActivitySpeakersSection from '@/components/activity/ActivitySpeakersSection.vue'
import ActivityDocumentsSection from '@/components/activity/ActivityDocumentsSection.vue'
import ActivityTagsSection from '@/components/activity/ActivityTagsSection.vue'
import AddDocumentModal from '@/components/activity/AddDocumentModal.vue'
import SpeakerPhotoModal from '@/components/activity/SpeakerPhotoModal.vue'
import AddSpeakerModal from '@/components/activity/AddSpeakerModal.vue'
import ActivityManagementSidebar from '@/components/activity/ActivityManagementSidebar.vue'
import BrowserRecommendation from '@/components/BrowserRecommendation.vue'
import CommentFloatingButtonUser from '@/components/CommentFloatingButtonUser.vue'


const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { supabase } = useSupabase()
const { getTimezoneLabel } = useTimezone()
const {
  getActivityById,
  updateActivity,
  uploadBanner
} = useUserActivities()

// Core data
const loading = ref(true)
const activity = ref(null)
const eventData = ref(null)
const editingBanner = ref(false)

// Initialize composables
const activityId = computed(() => route.params.id)

// Activity editing
const activityEditing = useInlineEditing(async (field, value) => {
  await updateActivity(activity.value.id, { [field]: value })
  activity.value[field] = value
  return value
})

// Speaker management
const speakerManagement = useSpeakerManagement(activityId.value)

// Document management
const documentManagement = useDocumentManagement(activityId.value)

// Tag management
const tagManagement = useTagManagement(activityId.value)

// Activity dates
const activityDates = useActivityDates(activity, computed(() => eventData.value?.timezone))

// Computed properties
const eventTimezone = computed(() => {
  if (!eventData.value?.timezone) return ''
  return getTimezoneLabel(eventData.value.timezone, locale.value)
})

const isActivityApproved = computed(() => {
  const approvedStatuses = ['approved', 'live', 'completed']
  return activity.value && approvedStatuses.includes(activity.value.validation_status)
})

const canEditDates = computed(() => {
  const editableStatuses = ['draft', 'submitted']
  return activity.value && editableStatuses.includes(activity.value.validation_status)
})

// Format activity date for sharing
const formatActivityDate = (activity) => {
  if (!activity) return ''

  const dateLocale = locale.value === 'fr' ? fr : enUS
  const startDate = activity.final_start_date || activity.proposed_start_date
  const endDate = activity.final_end_date || activity.proposed_end_date

  if (!startDate) return ''

  try {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : null

    if (end && start.toDateString() !== end.toDateString()) {
      // Dates différentes
      return `${format(start, 'PPP', { locale: dateLocale })} - ${format(end, 'PPP', { locale: dateLocale })}`
    } else {
      // Même jour
      return format(start, 'PPP', { locale: dateLocale })
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

// Activity editing methods
const startEditActivity = (field) => {
  activityEditing.startEdit(field, activity.value[field])
}

const cancelEditActivity = (field) => {
  activityEditing.cancelEdit(field)
}

const onActivityFieldChange = (field) => {
  activityEditing.onFieldChange(field, activity.value[field])
}

const saveActivityField = async (field) => {
  try {
    await activityEditing.saveField(field, activity.value[field])
  } catch (error) {
    console.error('Error saving activity field:', error)
    alert(`Erreur lors de la sauvegarde: ${error.message}`)
  }
}

// Speaker management handlers
const handleSaveSpeakerField = async (speakerId, field) => {
  try {
    await speakerManagement.saveSpeakerField(speakerId, field)
  } catch (error) {
    alert(error.message)
  }
}

const handleRemoveSpeaker = async (speakerId) => {
  try {
    await speakerManagement.removeSpeaker(speakerId)
  } catch (error) {
    alert(`Erreur lors de la suppression: ${error.message}`)
  }
}

const handleUploadSpeakerPhoto = async (speakerId, event) => {
  try {
    await speakerManagement.uploadSpeakerPhotoHandler(speakerId, event)
  } catch (error) {
    alert(`Erreur lors de l'upload: ${error.message}`)
  }
}

const handleSendConfirmationEmail = async (speakerId) => {
  try {
    await speakerManagement.sendConfirmationEmailHandler(speakerId)
  } catch (error) {
    alert(`Erreur lors de l'envoi de l'email: ${error.message}`)
  }
}

const handleAddNewSpeaker = async (speakerData) => {
  try {
    await speakerManagement.addNewSpeaker(speakerData)
  } catch (error) {
    alert(`Erreur lors de l'ajout de l'intervenant: ${error.message}`)
  }
}

// Document management handlers
const handleRemoveDocument = async (docId) => {
  try {
    await documentManagement.removeDocument(docId)
  } catch (error) {
    alert(`Erreur lors de la suppression: ${error.message}`)
  }
}

const handleSubmitNewDocument = async () => {
  try {
    await documentManagement.submitNewDocument()
  } catch (error) {
    alert(error.message)
  }
}

const updateDocumentForm = (newForm) => {
  Object.assign(documentManagement.newDocumentForm, newForm)
}

// Tag management handlers
const handleAddTag = async () => {
  try {
    await tagManagement.addTag()
  } catch (error) {
    alert(`Erreur lors de l'ajout du tag: ${error.message}`)
  }
}

const handleRemoveTag = async (index) => {
  try {
    await tagManagement.removeTag(index)
  } catch (error) {
    alert(`Erreur lors de la suppression du tag: ${error.message}`)
  }
}

const handleTagKeyPress = (event) => {
  tagManagement.handleKeyPress(event)
}

// Banner management
const onBannerImageProcessed = async (fileOrBlob) => {
  try {
    let file
    if (fileOrBlob instanceof File) {
      file = fileOrBlob
    } else {
      file = new File([fileOrBlob], 'banner-16x9.jpg', { type: 'image/jpeg' })
    }

    const updatedActivity = await uploadBanner(activity.value.id, file, 'cover')
    activity.value.cover_image_high_url = updatedActivity.cover_image_high_url
    activity.value.cover_image_low_url = updatedActivity.cover_image_low_url
    editingBanner.value = false
  } catch (error) {
    console.error('Error uploading banner:', error)
    alert('Erreur lors de l\'upload de la bannière')
  }
}

// Load activity data
const loadActivity = async () => {
  try {
    loading.value = true

    const data = await getActivityById(route.params.id)
    if (!data || data.submitted_by !== authStore.user?.id) {
      router.push('/events/dashboard')
      return
    }

    // Track view
    await trackActivityView()

    // Set data
    activity.value = data
    eventData.value = data.events
    speakerManagement.speakers.value = data.activity_speakers || []
    documentManagement.documents.value = data.activity_documents || []

    // Initialize tags
    tagManagement.initializeTags(data.tags)

    // Initialize dates
    activityDates.initializeDates()
  } catch (error) {
    console.error('Error loading activity:', error)
    router.push('/events/dashboard')
  } finally {
    loading.value = false
  }
}

const trackActivityView = async () => {
  try {
    const { data: currentActivity, error: fetchError } = await supabase
      .from('activities')
      .select('activites_dashboard_view_count')
      .eq('id', route.params.id)
      .single()

    if (!fetchError && currentActivity) {
      const newCount = (currentActivity.activites_dashboard_view_count || 0) + 1
      await supabase
        .from('activities')
        .update({
          activites_dashboard_view_count: newCount,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', route.params.id)
        .eq('submitted_by', authStore.user?.id)
    }
  } catch (error) {
    console.error('Error tracking activity view:', error)
  }
}

// Sidebar handlers
const handleScrollTo = (sectionId) => {
  // Géré directement par le composant sidebar
}

const handlePreview = () => {
  // Ouvrir la page de prévisualisation dans un nouvel onglet: `/activities/preview/${activity.id}`
  window.open(`/activities/preview/${route.params.id}`, '_blank')
}

const handleSubmitValidation = async () => {
  try {
    // Soumettre l'activité pour validation
    await updateActivity(activity.value.id, { validation_status: 'pending' })
    activity.value.validation_status = 'pending'
    alert(t('activities.submittedForValidation'))
  } catch (error) {
    console.error('Error submitting for validation:', error)
    alert(t('activities.errorSubmittingValidation'))
  }
}

onMounted(() => {
  loadActivity()
})
</script>
