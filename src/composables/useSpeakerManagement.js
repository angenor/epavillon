import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import useUserActivities from '@/composables/useUserActivities'

export function useSpeakerManagement(activityId) {
  const { t } = useI18n()
  const {
    addSpeaker,
    updateSpeaker,
    deleteSpeaker,
    uploadSpeakerPhoto,
    sendConfirmationEmail
  } = useUserActivities()

  const speakers = ref([])
  const uploadingPhoto = ref({})
  const uploadProgress = ref({})
  const showPhotoModal = ref(false)
  const selectedSpeakerPhoto = ref(null)
  const showAddSpeakerModal = ref(false)

  // Form states
  const editingField = ref({})
  const tempSpeakerValue = ref({})
  const hasUnsavedSpeakerChanges = ref({})
  const savingSpeakerField = ref({})

  // Speaker field editing
  const startEditSpeaker = (speakerId, field) => {
    const fieldKey = `speaker_${speakerId}_${field}`
    editingField.value[fieldKey] = true

    if (!tempSpeakerValue.value[speakerId]) {
      tempSpeakerValue.value[speakerId] = {}
    }

    const speaker = speakers.value.find(s => s.id === speakerId)
    if (speaker) {
      if (field === 'name') {
        tempSpeakerValue.value[speakerId] = {
          civility: speaker.civility,
          first_name: speaker.first_name,
          last_name: speaker.last_name
        }
      } else {
        tempSpeakerValue.value[speakerId][field] = speaker[field]
      }
    }

    if (!hasUnsavedSpeakerChanges.value[speakerId]) {
      hasUnsavedSpeakerChanges.value[speakerId] = {}
    }
    hasUnsavedSpeakerChanges.value[speakerId][field] = false
  }

  const cancelEditSpeaker = (speakerId, field) => {
    const fieldKey = `speaker_${speakerId}_${field}`
    delete editingField.value[fieldKey]

    if (hasUnsavedSpeakerChanges.value[speakerId]) {
      delete hasUnsavedSpeakerChanges.value[speakerId][field]
    }
  }

  const onSpeakerFieldChange = (speakerId, field) => {
    const speaker = speakers.value.find(s => s.id === speakerId)
    if (!speaker) return

    if (!hasUnsavedSpeakerChanges.value[speakerId]) {
      hasUnsavedSpeakerChanges.value[speakerId] = {}
    }

    if (field === 'name') {
      const hasChanges =
        tempSpeakerValue.value[speakerId].civility !== speaker.civility ||
        tempSpeakerValue.value[speakerId].first_name !== speaker.first_name ||
        tempSpeakerValue.value[speakerId].last_name !== speaker.last_name
      hasUnsavedSpeakerChanges.value[speakerId][field] = hasChanges
    } else {
      hasUnsavedSpeakerChanges.value[speakerId][field] =
        tempSpeakerValue.value[speakerId][field] !== speaker[field]
    }
  }

  const validateSpeakerField = (field, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    switch (field) {
      case 'first_name':
      case 'last_name':
        if (!value?.trim()) {
          throw new Error(t('events.speakerNameRequired'))
        }
        break
      case 'position':
        if (!value?.trim()) {
          throw new Error(t('events.speakerPositionRequired'))
        }
        break
      case 'organization':
        if (!value?.trim()) {
          throw new Error(t('events.speakerOrganizationRequired'))
        }
        break
      case 'email':
        if (!value?.trim()) {
          throw new Error(t('events.speakerEmailRequired'))
        }
        if (!emailRegex.test(value.trim())) {
          throw new Error(t('events.invalidEmailFormat'))
        }
        break
    }
  }

  const saveSpeakerField = async (speakerId, field) => {
    const speaker = speakers.value.find(s => s.id === speakerId)
    if (!speaker) return

    if (!savingSpeakerField.value[speakerId]) {
      savingSpeakerField.value[speakerId] = {}
    }

    savingSpeakerField.value[speakerId][field] = true

    try {
      let updateData = {}

      if (field === 'name') {
        updateData = {
          civility: tempSpeakerValue.value[speakerId].civility,
          first_name: tempSpeakerValue.value[speakerId].first_name,
          last_name: tempSpeakerValue.value[speakerId].last_name
        }

        // Validate required fields
        validateSpeakerField('first_name', updateData.first_name)
        validateSpeakerField('last_name', updateData.last_name)

        // Check if values are the same
        if (updateData.civility === speaker.civility &&
            updateData.first_name === speaker.first_name &&
            updateData.last_name === speaker.last_name) {
          cancelEditSpeaker(speakerId, field)
          return
        }
      } else {
        const value = tempSpeakerValue.value[speakerId][field]

        // Validate field
        validateSpeakerField(field, value)

        if (value === speaker[field]) {
          cancelEditSpeaker(speakerId, field)
          return
        }
        updateData[field] = value
      }

      await updateSpeaker(speakerId, updateData)
      Object.assign(speaker, updateData)
      cancelEditSpeaker(speakerId, field)
    } catch (error) {
      console.error('Error updating speaker:', error)
      throw error
    } finally {
      if (savingSpeakerField.value[speakerId]) {
        delete savingSpeakerField.value[speakerId][field]
      }
    }
  }

  // Speaker operations
  const removeSpeaker = async (speakerId) => {
    if (!confirm(t('events.confirmDeleteSpeaker'))) return

    try {
      await deleteSpeaker(speakerId)
      speakers.value = speakers.value.filter(s => s.id !== speakerId)
    } catch (error) {
      console.error('Error deleting speaker:', error)
      throw error
    }
  }

  // Photo management
  const uploadSpeakerPhotoHandler = async (speakerId, event) => {
    const file = event.target.files[0]
    if (!file) return

    if (uploadingPhoto.value[speakerId]) return

    try {
      uploadingPhoto.value[speakerId] = true
      uploadProgress.value[speakerId] = 0

      const onProgress = ({ stage, progress }) => {
        uploadProgress.value[speakerId] = progress
      }

      const updatedSpeaker = await uploadSpeakerPhoto(speakerId, file, onProgress)
      const speakerIndex = speakers.value.findIndex(s => s.id === speakerId)
      if (speakerIndex !== -1) {
        speakers.value[speakerIndex].photo_url = updatedSpeaker.photo_url
        if (updatedSpeaker.photo_thumbnail_url) {
          speakers.value[speakerIndex].photo_thumbnail_url = updatedSpeaker.photo_thumbnail_url
        }
      }

      event.target.value = ''
    } catch (error) {
      console.error('Error uploading speaker photo:', error)
      event.target.value = ''
      throw error
    } finally {
      setTimeout(() => {
        delete uploadingPhoto.value[speakerId]
        delete uploadProgress.value[speakerId]
      }, 1000)
    }
  }

  const showSpeakerPhotoModal = (speaker) => {
    if (speaker.photo_url) {
      selectedSpeakerPhoto.value = {
        url: speaker.photo_url,
        name: `${speaker.first_name} ${speaker.last_name}`
      }
      showPhotoModal.value = true
    }
  }

  const closePhotoModal = () => {
    showPhotoModal.value = false
    selectedSpeakerPhoto.value = null
  }

  const sendConfirmationEmailHandler = async (speakerId) => {
    try {
      const updatedSpeaker = await sendConfirmationEmail(speakerId)
      const speakerIndex = speakers.value.findIndex(s => s.id === speakerId)
      if (speakerIndex !== -1) {
        speakers.value[speakerIndex].confirmation_email_sent_at = updatedSpeaker.confirmation_email_sent_at
        speakers.value[speakerIndex].has_confirmed_by_email = updatedSpeaker.has_confirmed_by_email
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error)
      throw error
    }
  }

  // Add new speaker
  const addNewSpeaker = async (speakerData) => {
    try {
      const newSpeaker = await addSpeaker(activityId, speakerData)
      speakers.value.push(newSpeaker)
      showAddSpeakerModal.value = false
      return newSpeaker
    } catch (error) {
      console.error('Error adding new speaker:', error)
      throw error
    }
  }

  const openAddSpeakerModal = () => {
    showAddSpeakerModal.value = true
  }

  const closeAddSpeakerModal = () => {
    showAddSpeakerModal.value = false
  }

  return {
    // Data
    speakers,
    uploadingPhoto,
    uploadProgress,
    showPhotoModal,
    selectedSpeakerPhoto,
    showAddSpeakerModal,
    editingField,
    tempSpeakerValue,
    hasUnsavedSpeakerChanges,
    savingSpeakerField,

    // Methods
    startEditSpeaker,
    cancelEditSpeaker,
    onSpeakerFieldChange,
    saveSpeakerField,
    removeSpeaker,
    uploadSpeakerPhotoHandler,
    showSpeakerPhotoModal,
    closePhotoModal,
    sendConfirmationEmailHandler,
    addNewSpeaker,
    openAddSpeakerModal,
    closeAddSpeakerModal
  }
}