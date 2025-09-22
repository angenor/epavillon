<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      <!-- Main Content -->
      <div v-else-if="activity">
        <!-- Header -->
        <div class="mb-8">
          <router-link
            :to="'/events/dashboard'"
            class="text-ifdd-bleu hover:underline mb-4 inline-block"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
            {{ t('common.back') }}
          </router-link>

          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 v-if="!editingField.title"
                  @click="startEdit('title')"
                  class="text-3xl font-bold text-gray-900 dark:text-white mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 -ml-2 rounded">
                {{ activity.title }}
                <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-lg text-gray-400" />
              </h1>
              <input v-else
                     v-model="tempValue.title"
                     @blur="saveField('title')"
                     @keyup.enter="saveField('title')"
                     @keyup.escape="cancelEdit('title')"
                     class="text-3xl font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full"
                     ref="titleInput">

              <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(activity.validation_status)"
                >
                  {{ t(`events.status.${activity.validation_status}`) }}
                </span>
                <span>{{ t('events.createdOn') }}: {{ formatDate(activity.created_at) }}</span>
              </div>
            </div>

            <router-link
              :to="`/activities/${activity.id}`"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'eye']" class="mr-2" />
              {{ t('events.viewPublic') }}
            </router-link>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('events.stats.registrations') }}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalRegistrations }}</p>
              </div>
              <font-awesome-icon :icon="['fas', 'users']" class="w-8 h-8 text-ifdd-bleu" />
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('events.stats.speakers') }}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalSpeakers }}</p>
              </div>
              <font-awesome-icon :icon="['fas', 'microphone']" class="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('events.stats.documents') }}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalDocuments }}</p>
              </div>
              <font-awesome-icon :icon="['fas', 'file-alt']" class="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('events.stats.questions') }}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalQuestions }}</p>
              </div>
              <font-awesome-icon :icon="['fas', 'question-circle']" class="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="flex space-x-8 px-6" aria-label="Tabs">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                :class="activeTab === tab.key
                  ? 'border-ifdd-bleu text-ifdd-bleu'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- General Info Tab -->
            <div v-if="activeTab === 'general'" class="space-y-6">
              <!-- Objectives -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('events.objectives') }}
                </label>
                <div v-if="!editingField.objectives"
                     @click="startEdit('objectives')"
                     class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                  {{ activity.objectives }}
                  <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-gray-400" />
                </div>
                <textarea v-else
                          v-model="tempValue.objectives"
                          @blur="saveField('objectives')"
                          @keyup.escape="cancelEdit('objectives')"
                          rows="4"
                          class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                ></textarea>
              </div>

              <!-- Detailed Presentation -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('events.detailedPresentation') }}
                </label>
                <div v-if="!editingField.detailed_presentation"
                     @click="startEdit('detailed_presentation')"
                     class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                  {{ activity.detailed_presentation }}
                  <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-gray-400" />
                </div>
                <textarea v-else
                          v-model="tempValue.detailed_presentation"
                          @blur="saveField('detailed_presentation')"
                          @keyup.escape="cancelEdit('detailed_presentation')"
                          rows="6"
                          class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                ></textarea>
              </div>

              <!-- Dates -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('events.startDate') }}
                  </label>
                  <input
                    type="datetime-local"
                    :value="formatDateTimeLocal(activity.proposed_start_date)"
                    @change="updateDate('proposed_start_date', $event.target.value)"
                    class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('events.endDate') }}
                  </label>
                  <input
                    type="datetime-local"
                    :value="formatDateTimeLocal(activity.proposed_end_date)"
                    @change="updateDate('proposed_end_date', $event.target.value)"
                    class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                  >
                </div>
              </div>
            </div>

            <!-- Speakers Tab -->
            <div v-if="activeTab === 'speakers'" class="space-y-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ t('events.speakers') }}
                </h3>
                <button
                  @click="addNewSpeaker"
                  class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce transition-colors"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
                  {{ t('events.addSpeaker') }}
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="speaker in speakers"
                  :key="speaker.id"
                  class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                >
                  <div class="flex items-start space-x-4">
                    <!-- Photo de l'intervenant -->
                    <div class="flex-shrink-0 relative">
                      <img
                        v-if="speaker.photo_url"
                        :src="speaker.photo_url"
                        :alt="`${speaker.first_name} ${speaker.last_name}`"
                        class="w-16 h-16 rounded-full object-cover"
                      >
                      <div
                        v-else
                        class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center"
                      >
                        <font-awesome-icon :icon="['fas', 'user']" class="text-gray-400 text-xl" />
                      </div>

                      <!-- Upload photo button -->
                      <label
                        class="absolute -bottom-1 -right-1 w-6 h-6 bg-ifdd-bleu text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-ifdd-bleu-fonce transition-colors"
                        :title="t('events.uploadSpeakerPhoto')"
                      >
                        <font-awesome-icon :icon="['fas', 'camera']" class="text-xs" />
                        <input
                          type="file"
                          @change="uploadSpeakerPhotoHandler(speaker.id, $event)"
                          class="hidden"
                          accept="image/*"
                        >
                      </label>
                    </div>

                    <!-- Informations de l'intervenant -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h4 class="font-medium text-gray-900 dark:text-white">
                            {{ speaker.civility }} {{ speaker.first_name }} {{ speaker.last_name }}
                          </h4>
                          <p class="text-sm text-gray-600 dark:text-gray-400">{{ speaker.position }}</p>
                          <p class="text-sm text-gray-600 dark:text-gray-400">{{ speaker.organization }}</p>
                          <p class="text-sm text-gray-600 dark:text-gray-400">{{ speaker.email }}</p>

                          <!-- Statut de confirmation par email -->
                          <div class="flex items-center space-x-2 mt-2">
                            <span
                              v-if="speaker.has_confirmed_by_email"
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            >
                              <font-awesome-icon :icon="['fas', 'check-circle']" class="mr-1" />
                              {{ t('events.confirmed') }}
                            </span>
                            <span
                              v-else-if="speaker.confirmation_email_sent_at"
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            >
                              <font-awesome-icon :icon="['fas', 'clock']" class="mr-1" />
                              {{ t('events.pendingConfirmation') }}
                            </span>
                            <span
                              v-else
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            >
                              <font-awesome-icon :icon="['fas', 'envelope']" class="mr-1" />
                              {{ t('events.notInvited') }}
                            </span>
                          </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center space-x-2 ml-4">
                          <button
                            v-if="!speaker.has_confirmed_by_email"
                            @click="sendConfirmationEmailHandler(speaker.id)"
                            class="text-ifdd-bleu hover:text-ifdd-bleu-fonce"
                            :title="t('events.sendConfirmationEmail')"
                          >
                            <font-awesome-icon :icon="['fas', 'envelope']" />
                          </button>
                          <button
                            @click="removeSpeaker(speaker.id)"
                            class="text-red-600 hover:text-red-800"
                            :title="t('events.removeSpeaker')"
                          >
                            <font-awesome-icon :icon="['fas', 'trash']" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Documents Tab -->
            <div v-if="activeTab === 'documents'" class="space-y-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ t('events.documents') }}
                </h3>
                <label class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce transition-colors cursor-pointer">
                  <font-awesome-icon :icon="['fas', 'upload']" class="mr-2" />
                  {{ t('events.uploadDocument') }}
                  <input
                    type="file"
                    @change="uploadNewDocument"
                    class="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                  >
                </label>
              </div>

              <div class="space-y-2">
                <div
                  v-for="doc in documents"
                  :key="doc.id"
                  class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <font-awesome-icon :icon="['fas', 'file-pdf']" class="text-red-600" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ doc.title }}</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ formatDate(doc.uploaded_at) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <a
                      :href="doc.file_url"
                      target="_blank"
                      class="text-ifdd-bleu hover:text-ifdd-bleu-fonce"
                    >
                      <font-awesome-icon :icon="['fas', 'download']" />
                    </a>
                    <button
                      @click="removeDocument(doc.id)"
                      class="text-red-600 hover:text-red-800"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Banners Tab -->
            <div v-if="activeTab === 'banners'" class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {{ t('events.coverImage') }}
                </h3>
                <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <img
                    v-if="activity.cover_image_high_url"
                    :src="activity.cover_image_high_url"
                    alt="Cover"
                    class="w-full h-64 object-cover rounded-lg mb-4"
                  >
                  <label class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce transition-colors cursor-pointer inline-block">
                    <font-awesome-icon :icon="['fas', 'upload']" class="mr-2" />
                    {{ t('events.uploadCover') }}
                    <input
                      type="file"
                      @change="uploadCover"
                      class="hidden"
                      accept="image/*"
                    >
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">{{ t('events.activityNotFound') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import useUserActivities from '@/composables/useUserActivities'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const {
  getActivityById,
  updateActivity,
  addSpeaker,
  updateSpeaker,
  deleteSpeaker,
  uploadDocument,
  deleteDocument,
  uploadBanner,
  uploadSpeakerPhoto,
  sendConfirmationEmail
} = useUserActivities()

const loading = ref(true)
const activity = ref(null)
const speakers = ref([])
const documents = ref([])
const editingField = ref({})
const tempValue = ref({})
const activeTab = ref('general')

const tabs = [
  { key: 'general', label: t('events.tabs.general') },
  { key: 'speakers', label: t('events.tabs.speakers') },
  { key: 'documents', label: t('events.tabs.documents') },
  { key: 'banners', label: t('events.tabs.banners') }
]

const stats = computed(() => ({
  totalRegistrations: activity.value?.activity_registrations?.[0]?.count || 0,
  totalSpeakers: speakers.value.length,
  totalDocuments: documents.value.length,
  totalQuestions: activity.value?.activity_questions?.[0]?.count || 0
}))

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTimeLocal = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    submitted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    under_review: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    live: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  }
  return classes[status] || classes.draft
}

const startEdit = (field) => {
  editingField.value[field] = true
  tempValue.value[field] = activity.value[field]
}

const cancelEdit = (field) => {
  delete editingField.value[field]
  delete tempValue.value[field]
}

const saveField = async (field) => {
  const value = tempValue.value[field]
  if (value === activity.value[field]) {
    cancelEdit(field)
    return
  }

  try {
    await updateActivity(activity.value.id, { [field]: value })
    activity.value[field] = value
    cancelEdit(field)
  } catch (error) {
    console.error('Error updating field:', error)
  }
}

const updateDate = async (field, value) => {
  try {
    await updateActivity(activity.value.id, { [field]: new Date(value).toISOString() })
    activity.value[field] = new Date(value).toISOString()
  } catch (error) {
    console.error('Error updating date:', error)
  }
}

const addNewSpeaker = () => {
  // TODO: Open modal to add speaker
  console.log('Add speaker modal')
}

const removeSpeaker = async (speakerId) => {
  if (!confirm(t('events.confirmDeleteSpeaker'))) return
  
  try {
    await deleteSpeaker(speakerId)
    speakers.value = speakers.value.filter(s => s.id !== speakerId)
  } catch (error) {
    console.error('Error deleting speaker:', error)
  }
}

const uploadNewDocument = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const doc = await uploadDocument(activity.value.id, file, file.name)
    documents.value.push(doc)
  } catch (error) {
    console.error('Error uploading document:', error)
  }
}

const removeDocument = async (docId) => {
  if (!confirm(t('events.confirmDeleteDocument'))) return

  try {
    await deleteDocument(docId)
    documents.value = documents.value.filter(d => d.id !== docId)
  } catch (error) {
    console.error('Error deleting document:', error)
  }
}

const uploadCover = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const updatedActivity = await uploadBanner(activity.value.id, file, 'cover')
    activity.value.cover_image_high_url = updatedActivity.cover_image_high_url
  } catch (error) {
    console.error('Error uploading cover:', error)
  }
}

const uploadSpeakerPhotoHandler = async (speakerId, event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const updatedSpeaker = await uploadSpeakerPhoto(speakerId, file)
    const speakerIndex = speakers.value.findIndex(s => s.id === speakerId)
    if (speakerIndex !== -1) {
      speakers.value[speakerIndex].photo_url = updatedSpeaker.photo_url
    }
  } catch (error) {
    console.error('Error uploading speaker photo:', error)
  }
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
  }
}

const loadActivity = async () => {
  try {
    loading.value = true
    
    const data = await getActivityById(route.params.id)
    
    if (!data || data.submitted_by !== authStore.user?.id) {
      router.push('/events/dashboard')
      return
    }
    
    activity.value = data
    speakers.value = data.activity_speakers || []
    documents.value = data.activity_documents || []
  } catch (error) {
    console.error('Error loading activity:', error)
    router.push('/events/dashboard')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadActivity()
})
</script>