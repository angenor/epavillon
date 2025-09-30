<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <font-awesome-icon :icon="['fas', 'microphone']" class="mr-3 text-ifdd-bleu" />
        {{ t('events.tabs.speakers') }}
      </h2>
    </div>

    <div class="p-6 space-y-4">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          {{ t('events.speakers') }}
        </h3>
        <button
          @click="$emit('add-speaker')"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-ifdd-bleu hover:bg-ifdd-bleu-fonce focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifdd-bleu cursor-pointer"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
          {{ t('events.addSpeaker') }}
        </button>
      </div>

      <!-- Avertissement pour photos manquantes -->
      <div v-if="speakers.some(s => !s.photo_url)" class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <div class="flex items-start">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5" />
          <div class="ml-3">
            <h4 class="text-sm font-medium text-yellow-900 dark:text-yellow-200">
              {{ t('events.speakerPhotoWarning.title') }}
            </h4>
            <p class="mt-1 text-sm text-yellow-800 dark:text-yellow-300">
              {{ t('events.speakerPhotoWarning.message') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Message si aucun intervenant -->
      <div
        v-if="speakers.length === 0"
        class="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg"
      >
        <font-awesome-icon :icon="['fas', 'users']" class="text-4xl text-gray-400 mb-4" />
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ t('events.noSpeakers') }}</p>
        <button
          @click="$emit('add-speaker')"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-ifdd-bleu hover:bg-ifdd-bleu-fonce focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifdd-bleu cursor-pointer"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
          {{ t('events.addFirstSpeaker') }}
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="speaker in speakers"
          :key="speaker.id"
          class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
        >
          <div class="flex items-start space-x-4">
            <!-- Photo de l'intervenant -->
            <div class="flex-shrink-0 relative">
              <img
                v-if="speaker.photo_thumbnail_url || speaker.photo_url"
                :src="speaker.photo_thumbnail_url || speaker.photo_url"
                :alt="`${speaker.first_name} ${speaker.last_name}`"
                class="w-16 h-16 rounded-full object-cover cursor-pointer"
                @click="showSpeakerPhotoModal(speaker)"
                :title="t('events.viewFullSize')"
              >
              <div
                v-else
                class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-yellow-300 dark:border-yellow-600"
              >
                <font-awesome-icon :icon="['fas', 'user']" class="text-gray-400 text-xl" />
              </div>

              <!-- Upload photo button -->
              <label
                class="absolute -bottom-1 -right-1 w-8 h-8 bg-ifdd-bleu text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-ifdd-bleu-fonce transition-colors shadow-lg border-2 border-white"
                :class="{ 'opacity-50 cursor-not-allowed': uploadingPhoto[speaker.id] }"
                :title="uploadingPhoto[speaker.id] ? t('events.uploading') : (speaker.photo_url ? t('events.changePhoto') : t('events.addPhoto'))"
              >
                <font-awesome-icon
                  v-if="uploadingPhoto[speaker.id]"
                  :icon="['fas', 'spinner']"
                  class="text-sm animate-spin"
                />
                <font-awesome-icon
                  v-else-if="speaker.photo_url"
                  :icon="['fas', 'edit']"
                  class="text-sm"
                />
                <font-awesome-icon
                  v-else
                  :icon="['fas', 'plus']"
                  class="text-sm"
                />
                <input
                  type="file"
                  @change="uploadSpeakerPhotoHandler(speaker.id, $event)"
                  class="hidden"
                  accept="image/*"
                  :disabled="uploadingPhoto[speaker.id]"
                >
              </label>

              <!-- Progress bar overlay -->
              <div
                v-if="uploadingPhoto[speaker.id]"
                class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
              >
                <div class="w-12 h-12 relative">
                  <!-- Circular progress bar -->
                  <svg class="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      class="text-gray-300"
                      stroke="currentColor"
                      stroke-width="3"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      class="text-ifdd-bleu"
                      stroke="currentColor"
                      stroke-width="3"
                      fill="transparent"
                      stroke-linecap="round"
                      :stroke-dasharray="`${uploadProgress[speaker.id] || 0}, 100`"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-xs text-white font-medium">{{ Math.round(uploadProgress[speaker.id] || 0) }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Informations de l'intervenant -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Nom complet -->
                  <SpeakerField
                    :speaker="speaker"
                    field="name"
                    :editing="editingField[`speaker_${speaker.id}_name`]"
                    :temp-value="tempSpeakerValue[speaker.id]"
                    :has-changes="hasUnsavedSpeakerChanges[speaker.id]?.name"
                    :saving="savingSpeakerField[speaker.id]?.name"
                    @start-edit="startEditSpeaker"
                    @cancel-edit="cancelEditSpeaker"
                    @field-change="onSpeakerFieldChange"
                    @save="saveSpeakerField"
                  />

                  <!-- Poste -->
                  <SpeakerField
                    :speaker="speaker"
                    field="position"
                    :editing="editingField[`speaker_${speaker.id}_position`]"
                    :temp-value="tempSpeakerValue[speaker.id]"
                    :has-changes="hasUnsavedSpeakerChanges[speaker.id]?.position"
                    :saving="savingSpeakerField[speaker.id]?.position"
                    @start-edit="startEditSpeaker"
                    @cancel-edit="cancelEditSpeaker"
                    @field-change="onSpeakerFieldChange"
                    @save="saveSpeakerField"
                  />

                  <!-- Organisation -->
                  <SpeakerField
                    :speaker="speaker"
                    field="organization"
                    :editing="editingField[`speaker_${speaker.id}_organization`]"
                    :temp-value="tempSpeakerValue[speaker.id]"
                    :has-changes="hasUnsavedSpeakerChanges[speaker.id]?.organization"
                    :saving="savingSpeakerField[speaker.id]?.organization"
                    @start-edit="startEditSpeaker"
                    @cancel-edit="cancelEditSpeaker"
                    @field-change="onSpeakerFieldChange"
                    @save="saveSpeakerField"
                  />

                  <!-- Email -->
                  <SpeakerField
                    :speaker="speaker"
                    field="email"
                    type="email"
                    :editing="editingField[`speaker_${speaker.id}_email`]"
                    :temp-value="tempSpeakerValue[speaker.id]"
                    :has-changes="hasUnsavedSpeakerChanges[speaker.id]?.email"
                    :saving="savingSpeakerField[speaker.id]?.email"
                    @start-edit="startEditSpeaker"
                    @cancel-edit="cancelEditSpeaker"
                    @field-change="onSpeakerFieldChange"
                    @save="saveSpeakerField"
                  />

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
                    class="text-ifdd-bleu hover:text-ifdd-bleu-fonce cursor-pointer"
                    :title="t('events.sendConfirmationEmail')"
                  >
                    <font-awesome-icon :icon="['fas', 'envelope']" />
                  </button>
                  <button
                    @click="removeSpeaker(speaker.id)"
                    class="text-red-600 hover:text-red-800 cursor-pointer"
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
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import SpeakerField from '@/components/activity/SpeakerField.vue'

const { t } = useI18n()

defineProps({
  speakers: {
    type: Array,
    required: true
  },
  editingField: {
    type: Object,
    required: true
  },
  tempSpeakerValue: {
    type: Object,
    required: true
  },
  hasUnsavedSpeakerChanges: {
    type: Object,
    required: true
  },
  savingSpeakerField: {
    type: Object,
    required: true
  },
  uploadingPhoto: {
    type: Object,
    required: true
  },
  uploadProgress: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'start-edit-speaker',
  'cancel-edit-speaker',
  'speaker-field-change',
  'save-speaker-field',
  'remove-speaker',
  'upload-speaker-photo',
  'show-speaker-photo-modal',
  'send-confirmation-email',
  'add-speaker'
])

// Proxy methods to emit events
const startEditSpeaker = (speakerId, field) => {
  emit('start-edit-speaker', speakerId, field)
}

const cancelEditSpeaker = (speakerId, field) => {
  emit('cancel-edit-speaker', speakerId, field)
}

const onSpeakerFieldChange = (speakerId, field) => {
  emit('speaker-field-change', speakerId, field)
}

const saveSpeakerField = (speakerId, field) => {
  emit('save-speaker-field', speakerId, field)
}

const removeSpeaker = (speakerId) => {
  emit('remove-speaker', speakerId)
}

const uploadSpeakerPhotoHandler = (speakerId, event) => {
  emit('upload-speaker-photo', speakerId, event)
}

const showSpeakerPhotoModal = (speaker) => {
  emit('show-speaker-photo-modal', speaker)
}

const sendConfirmationEmailHandler = (speakerId) => {
  emit('send-confirmation-email', speakerId)
}
</script>