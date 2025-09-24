<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      <!-- Main Content -->
      <div v-else-if="activity">
        <!-- Header -->
        <ActivityHeader
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

        <!-- Timeline de validation -->
        <ActivityValidationTimeline
          v-if="activity"
          :current-status="activity.validation_status"
          class="mb-8"
        />

        <!-- Sections -->
        <div class="space-y-8">
          <!-- Bannières Section -->
          <ActivityBannerSection
            :activity="activity"
            :editingBanner="editingBanner"
            @toggle-editing="editingBanner = !editingBanner"
            @banner-processed="onBannerImageProcessed"
          />

          <!-- Informations générales Section -->
          <ActivityGeneralInfoSection
            :activity="activity"
            :eventData="eventData"
            :eventTimezone="eventTimezone"
            :activityDates="activityDates"
            :editingField="activityEditing.editingField.value"
            :tempValue="activityEditing.tempValue.value"
            :hasUnsavedChanges="activityEditing.hasUnsavedChanges.value"
            :savingField="activityEditing.savingField.value"
            @start-edit="startEditActivity"
            @cancel-edit="cancelEditActivity"
            @field-change="onActivityFieldChange"
            @save-field="saveActivityField"
            @save-dates="activityDates.saveDates"
            @cancel-dates="activityDates.cancelDateChanges"
          />

          <!-- Intervenants Section -->
          <ActivitySpeakersSection
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
            @add-new-speaker="speakerManagement.addNewSpeaker"
            @remove-speaker="handleRemoveSpeaker"
            @upload-speaker-photo="handleUploadSpeakerPhoto"
            @show-speaker-photo-modal="speakerManagement.showSpeakerPhotoModal"
            @send-confirmation-email="handleSendConfirmationEmail"
          />

          <!-- Documents Section -->
          <ActivityDocumentsSection
            :documents="documentManagement.documents.value"
            :getDocumentIcon="documentManagement.getDocumentIcon"
            :getDocumentIconColor="documentManagement.getDocumentIconColor"
            :isActivityApproved="isActivityApproved"
            @add-new-document="documentManagement.addNewDocument"
            @remove-document="handleRemoveDocument"
          />

          <!-- Tags Section -->
          <ActivityTagsSection
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

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">{{ t('events.activityNotFound') }}</p>
      </div>
    </div>

    <!-- Modals -->
    <AddSpeakerModal
      :show="speakerManagement.showAddSpeakerModal.value"
      :form="speakerManagement.newSpeakerForm"
      :saving="speakerManagement.savingNewSpeaker.value"
      @submit="handleSubmitNewSpeaker"
      @cancel="speakerManagement.cancelAddSpeaker"
      @update:form="updateSpeakerForm"
    />

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useTimezone } from '@/composables/useTimezone'
import { useSupabase } from '@/composables/useSupabase'

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
import ActivityBannerSection from '@/components/activity/ActivityBannerSection.vue'
import ActivityGeneralInfoSection from '@/components/activity/ActivityGeneralInfoSection.vue'
import ActivitySpeakersSection from '@/components/activity/ActivitySpeakersSection.vue'
import ActivityDocumentsSection from '@/components/activity/ActivityDocumentsSection.vue'
import ActivityTagsSection from '@/components/activity/ActivityTagsSection.vue'
import AddSpeakerModal from '@/components/activity/AddSpeakerModal.vue'
import AddDocumentModal from '@/components/activity/AddDocumentModal.vue'
import SpeakerPhotoModal from '@/components/activity/SpeakerPhotoModal.vue'


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

const handleSubmitNewSpeaker = async () => {
  try {
    await speakerManagement.submitNewSpeaker()
  } catch (error) {
    alert(error.message)
  }
}

const updateSpeakerForm = (newForm) => {
  Object.assign(speakerManagement.newSpeakerForm, newForm)
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

onMounted(() => {
  loadActivity()
})
</script>