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
              <div v-if="!editingField.title" class="relative">
                <h1 @click="startEdit('title')"
                    class="text-3xl font-bold text-gray-900 dark:text-white mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 -ml-2 rounded">
                  {{ activity.title }}
                  <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-lg text-gray-400" />
                </h1>
              </div>
              <div v-else class="relative">
                <input v-model="tempValue.title"
                       @input="onFieldChange('title')"
                       @keyup.enter="saveField('title')"
                       @keyup.escape="cancelEdit('title')"
                       class="text-3xl font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full pr-24"
                       ref="titleInput">
                <div class="absolute right-0 top-1/2 -translate-y-1/2 flex space-x-2">
                  <button v-if="hasUnsavedChanges.title"
                          @click="saveField('title')"
                          :disabled="savingField.title"
                          class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                    <font-awesome-icon v-if="savingField.title" :icon="['fas', 'spinner']" class="animate-spin" />
                    <font-awesome-icon v-else :icon="['fas', 'save']" />
                  </button>
                  <button @click="cancelEdit('title')"
                          class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                    <font-awesome-icon :icon="['fas', 'times']" />
                  </button>
                </div>
              </div>

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

        <!-- Timeline de validation -->
        <ActivityValidationTimeline
          v-if="activity"
          :current-status="activity.validation_status"
          class="mb-8"
        />

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

        <!-- Sections -->
        <div class="space-y-8">
        <!-- Bannières Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <font-awesome-icon :icon="['fas', 'image']" class="mr-3 text-ifdd-bleu" />
              {{ t('events.tabs.banners') }}
            </h2>
          </div>
          <div class="p-6 space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {{ t('events.coverImage') }}
              </h3>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <!-- Bannière actuelle si elle existe -->
                <div v-if="activity.cover_image_high_url && !editingBanner" class="relative mb-4">
                  <img
                    :src="activity.cover_image_high_url"
                    alt="Cover"
                    class="w-full aspect-video object-cover rounded-lg"
                  >
                  <button
                    @click="editingBanner = true"
                    class="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </button>
                </div>

                <!-- Image par défaut si pas de bannière -->
                <div v-else-if="!activity.cover_image_high_url && !editingBanner" class="relative mb-4">
                  <img
                    src="/images/example/event_banniere_par_defaut_16_9.jpg"
                    alt="Cover par défaut"
                    class="w-full aspect-video object-cover rounded-lg opacity-60"
                  >
                  <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                    <span class="text-white text-lg font-medium">{{ t('events.defaultBanner') }}</span>
                  </div>
                </div>

                <!-- Éditeur d'image 16:9 -->
                <ImageCropper16x9
                  v-if="editingBanner || !activity.cover_image_high_url"
                  :initial-image="activity.cover_image_high_url"
                  @image-selected="onBannerImageSelected"
                  @image-processed="onBannerImageProcessed"
                />

                <!-- Bouton d'upload si pas en mode édition -->
                <div v-if="!editingBanner && activity.cover_image_high_url" class="text-center">
                  <button
                    @click="editingBanner = true"
                    class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce transition-colors"
                  >
                    <font-awesome-icon :icon="['fas', 'image']" class="mr-2" />
                    {{ t('events.changeBanner') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations générales Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-3 text-ifdd-bleu" />
              {{ t('events.tabs.general') }}
            </h2>
          </div>
          <div class="p-6 space-y-6">
              <!-- Objectives -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('events.objectives') }}
                </label>
                <div v-if="!editingField.objectives" class="relative">
                  <div @click="startEdit('objectives')"
                       class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                    {{ activity.objectives }}
                    <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-gray-400" />
                  </div>
                </div>
                <div v-else class="relative">
                  <textarea v-model="tempValue.objectives"
                            @input="onFieldChange('objectives')"
                            @keyup.escape="cancelEdit('objectives')"
                            rows="4"
                            class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 pr-24"
                            ref="objectivesInput"></textarea>
                  <div class="absolute bottom-2 right-2 flex space-x-2">
                    <button v-if="hasUnsavedChanges.objectives"
                            @click="saveField('objectives')"
                            :disabled="savingField.objectives"
                            class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                      <font-awesome-icon v-if="savingField.objectives" :icon="['fas', 'spinner']" class="animate-spin" />
                      <font-awesome-icon v-else :icon="['fas', 'save']" />
                    </button>
                    <button @click="cancelEdit('objectives')"
                            class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                      <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Detailed Presentation -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('events.detailedPresentation') }}
                </label>
                <div v-if="!editingField.detailed_presentation" class="relative">
                  <div @click="startEdit('detailed_presentation')"
                       class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-h-[120px]">
                    <div v-html="activity.detailed_presentation" class="prose dark:prose-invert max-w-none"></div>
                    <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-gray-400 float-right" />
                  </div>
                </div>
                <div v-else class="relative">
                  <RichTextEditor
                    v-model="tempValue.detailed_presentation"
                    @input="onFieldChange('detailed_presentation')"
                    :placeholder="t('activity.submit.placeholders.detailedPresentation')"
                    :show-character-count="true"
                    :max-length="5000"
                  />
                  <div class="mt-2 flex justify-end space-x-2">
                    <button v-if="hasUnsavedChanges.detailed_presentation"
                            @click="saveField('detailed_presentation')"
                            :disabled="savingField.detailed_presentation"
                            class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                      <font-awesome-icon v-if="savingField.detailed_presentation" :icon="['fas', 'spinner']" class="animate-spin" />
                      <font-awesome-icon v-else :icon="['fas', 'save']" />
                    </button>
                    <button @click="cancelEdit('detailed_presentation')"
                            class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                      <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Dates et heures -->
              <div class="space-y-4">
                <!-- Timezone Info -->
                <div v-if="eventData?.timezone" class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div class="flex items-start">
                    <font-awesome-icon :icon="['fas', 'clock']" class="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                    <div class="ml-3">
                      <h4 class="text-sm font-medium text-blue-900 dark:text-blue-200">
                        {{ t('events.timezoneInfo') }}
                      </h4>
                      <p class="mt-1 text-sm text-blue-800 dark:text-blue-300">
                        {{ eventTimezone }}
                      </p>
                      <p class="mt-2 text-xs text-blue-700 dark:text-blue-400">
                        {{ t('events.timezoneDescription') }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Date de l'activité -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('events.activityDate') }}
                  </label>
                  <input
                    type="date"
                    v-model="activityDate"
                    :min="eventData?.start_date?.split('T')[0]"
                    :max="eventData?.end_date?.split('T')[0]"
                    class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                  >
                  <p v-if="eventData" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ t('events.eventPeriod') }}: {{ formatEventPeriod() }}
                  </p>
                </div>

                <!-- Heures de début et fin -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t('events.startTime') }}
                    </label>
                    <input
                      type="time"
                      v-model="startTime"
                      class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t('events.endTime') }}
                    </label>
                    <input
                      type="time"
                      v-model="endTime"
                      class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                    >
                  </div>
                </div>

                <!-- Boutons d'enregistrement pour les dates -->
                <div v-if="hasPendingDateChanges" class="mt-4 flex justify-end space-x-2">
                  <button @click="cancelDateChanges"
                          class="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors">
                    <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
                    {{ t('common.cancel') }}
                  </button>
                  <button @click="saveDates"
                          :disabled="savingField.dates"
                          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                    <font-awesome-icon v-if="savingField.dates" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
                    <font-awesome-icon v-else :icon="['fas', 'save']" class="mr-2" />
                    {{ t('common.save') }}
                  </button>
                </div>
              </div>
          </div>
        </div>

        <!-- Intervenants Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <font-awesome-icon :icon="['fas', 'microphone']" class="mr-3 text-ifdd-bleu" />
              {{ t('events.tabs.speakers') }}
            </h2>
          </div>
          <div class="p-6 space-y-4">
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
                        class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
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
                          <div v-if="!editingField[`speaker_${speaker.id}_name`]" class="mb-2">
                            <h4 @click="startEditSpeaker(speaker.id, 'name')"
                                class="font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 -ml-2 rounded">
                              {{ speaker.civility }} {{ speaker.first_name }} {{ speaker.last_name }}
                              <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-sm text-gray-400" />
                            </h4>
                          </div>
                          <div v-else class="mb-2 space-y-2">
                            <div class="grid grid-cols-3 gap-2">
                              <input v-model="tempSpeakerValue[speaker.id].civility"
                                     @input="onSpeakerFieldChange(speaker.id, 'name')"
                                     placeholder="Civilité"
                                     class="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
                              <input v-model="tempSpeakerValue[speaker.id].first_name"
                                     @input="onSpeakerFieldChange(speaker.id, 'name')"
                                     placeholder="Prénom"
                                     class="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
                              <input v-model="tempSpeakerValue[speaker.id].last_name"
                                     @input="onSpeakerFieldChange(speaker.id, 'name')"
                                     placeholder="Nom"
                                     class="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
                            </div>
                            <div class="flex space-x-2">
                              <button v-if="hasUnsavedSpeakerChanges[speaker.id]?.name"
                                      @click="saveSpeakerField(speaker.id, 'name')"
                                      :disabled="savingSpeakerField[speaker.id]?.name"
                                      class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                                <font-awesome-icon v-if="savingSpeakerField[speaker.id]?.name" :icon="['fas', 'spinner']" class="animate-spin" />
                                <font-awesome-icon v-else :icon="['fas', 'save']" />
                              </button>
                              <button @click="cancelEditSpeaker(speaker.id, 'name')"
                                      class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                                <font-awesome-icon :icon="['fas', 'times']" />
                              </button>
                            </div>
                          </div>

                          <!-- Poste -->
                          <div v-if="!editingField[`speaker_${speaker.id}_position`]" class="mb-1">
                            <p @click="startEditSpeaker(speaker.id, 'position')"
                               class="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 -ml-2 rounded">
                              {{ speaker.position }}
                              <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-xs text-gray-400" />
                            </p>
                          </div>
                          <div v-else class="mb-1">
                            <div class="flex items-center space-x-2">
                              <input v-model="tempSpeakerValue[speaker.id].position"
                                     @input="onSpeakerFieldChange(speaker.id, 'position')"
                                     placeholder="Poste"
                                     class="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 flex-1">
                              <button v-if="hasUnsavedSpeakerChanges[speaker.id]?.position"
                                      @click="saveSpeakerField(speaker.id, 'position')"
                                      :disabled="savingSpeakerField[speaker.id]?.position"
                                      class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                                <font-awesome-icon v-if="savingSpeakerField[speaker.id]?.position" :icon="['fas', 'spinner']" class="animate-spin" />
                                <font-awesome-icon v-else :icon="['fas', 'save']" />
                              </button>
                              <button @click="cancelEditSpeaker(speaker.id, 'position')"
                                      class="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                                <font-awesome-icon :icon="['fas', 'times']" />
                              </button>
                            </div>
                          </div>

                          <!-- Organisation -->
                          <div v-if="!editingField[`speaker_${speaker.id}_organization`]" class="mb-1">
                            <p @click="startEditSpeaker(speaker.id, 'organization')"
                               class="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 -ml-2 rounded">
                              {{ speaker.organization }}
                              <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-xs text-gray-400" />
                            </p>
                          </div>
                          <div v-else class="mb-1">
                            <div class="flex items-center space-x-2">
                              <input v-model="tempSpeakerValue[speaker.id].organization"
                                     @input="onSpeakerFieldChange(speaker.id, 'organization')"
                                     placeholder="Organisation"
                                     class="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 flex-1">
                              <button v-if="hasUnsavedSpeakerChanges[speaker.id]?.organization"
                                      @click="saveSpeakerField(speaker.id, 'organization')"
                                      :disabled="savingSpeakerField[speaker.id]?.organization"
                                      class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                                <font-awesome-icon v-if="savingSpeakerField[speaker.id]?.organization" :icon="['fas', 'spinner']" class="animate-spin" />
                                <font-awesome-icon v-else :icon="['fas', 'save']" />
                              </button>
                              <button @click="cancelEditSpeaker(speaker.id, 'organization')"
                                      class="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                                <font-awesome-icon :icon="['fas', 'times']" />
                              </button>
                            </div>
                          </div>

                          <!-- Email -->
                          <div v-if="!editingField[`speaker_${speaker.id}_email`]" class="mb-2">
                            <p @click="startEditSpeaker(speaker.id, 'email')"
                               class="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 -ml-2 rounded">
                              {{ speaker.email }}
                              <font-awesome-icon :icon="['fas', 'edit']" class="ml-2 text-xs text-gray-400" />
                            </p>
                          </div>
                          <div v-else class="mb-2">
                            <div class="flex items-center space-x-2">
                              <input v-model="tempSpeakerValue[speaker.id].email"
                                     @input="onSpeakerFieldChange(speaker.id, 'email')"
                                     type="email"
                                     placeholder="Email"
                                     class="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 flex-1">
                              <button v-if="hasUnsavedSpeakerChanges[speaker.id]?.email"
                                      @click="saveSpeakerField(speaker.id, 'email')"
                                      :disabled="savingSpeakerField[speaker.id]?.email"
                                      class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                                <font-awesome-icon v-if="savingSpeakerField[speaker.id]?.email" :icon="['fas', 'spinner']" class="animate-spin" />
                                <font-awesome-icon v-else :icon="['fas', 'save']" />
                              </button>
                              <button @click="cancelEditSpeaker(speaker.id, 'email')"
                                      class="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                                <font-awesome-icon :icon="['fas', 'times']" />
                              </button>
                            </div>
                          </div>

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
        </div>

        <!-- Documents Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <font-awesome-icon :icon="['fas', 'file-alt']" class="mr-3 text-ifdd-bleu" />
              {{ t('events.tabs.documents') }}
            </h2>
          </div>
          <div class="p-6 space-y-4">
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
        </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">{{ t('events.activityNotFound') }}</p>
      </div>
    </div>

    <!-- Add Speaker Modal -->
    <div v-if="showAddSpeakerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ t('events.addNewSpeaker') }}
            </h3>
            <button @click="cancelAddSpeaker" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>

          <form @submit.prevent="submitNewSpeaker" class="space-y-4">
            <!-- Civilité -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('events.civility') }}
              </label>
              <select v-model="newSpeakerForm.civility"
                      class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2">
                <option value="M.">M.</option>
                <option value="Mme">Mme</option>
                <option value="Dr">Dr</option>
                <option value="Pr">Pr</option>
              </select>
            </div>

            <!-- Prénom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('events.firstName') }} *
              </label>
              <input v-model="newSpeakerForm.first_name"
                     type="text"
                     required
                     class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                     :placeholder="t('events.firstNamePlaceholder')">
            </div>

            <!-- Nom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('events.lastName') }} *
              </label>
              <input v-model="newSpeakerForm.last_name"
                     type="text"
                     required
                     class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                     :placeholder="t('events.lastNamePlaceholder')">
            </div>

            <!-- Poste -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('events.position') }} *
              </label>
              <input v-model="newSpeakerForm.position"
                     type="text"
                     required
                     class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                     :placeholder="t('events.positionPlaceholder')">
            </div>

            <!-- Organisation -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('events.organization') }} *
              </label>
              <input v-model="newSpeakerForm.organization"
                     type="text"
                     required
                     class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                     :placeholder="t('events.organizationPlaceholder')">
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('events.email') }} *
              </label>
              <input v-model="newSpeakerForm.email"
                     type="email"
                     required
                     class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                     :placeholder="t('events.emailPlaceholder')">
            </div>

            <!-- Buttons -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button"
                      @click="cancelAddSpeaker"
                      class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                {{ t('common.cancel') }}
              </button>
              <button type="submit"
                      :disabled="savingNewSpeaker"
                      class="px-4 py-2 bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce disabled:opacity-50 transition-colors">
                <font-awesome-icon v-if="savingNewSpeaker" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
                {{ t('events.addSpeaker') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Speaker Photo Modal -->
    <div v-if="showPhotoModal && selectedSpeakerPhoto" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" @click="closePhotoModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl max-h-[90vh] overflow-hidden" @click.stop>
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ selectedSpeakerPhoto.name }}
            </h3>
            <button @click="closePhotoModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <font-awesome-icon :icon="['fas', 'times']" class="text-xl" />
            </button>
          </div>
          <div class="flex justify-center">
            <img
              :src="selectedSpeakerPhoto.url"
              :alt="selectedSpeakerPhoto.name"
              class="max-w-full max-h-[70vh] object-contain rounded-lg"
            >
          </div>
        </div>
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
import { useTimezone } from '@/composables/useTimezone'
import ActivityValidationTimeline from '@/components/ActivityValidationTimeline.vue'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import ImageCropper16x9 from '@/components/ui/ImageCropper16x9.vue'

const { t, locale } = useI18n()
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
const { getTimezoneLabel } = useTimezone()

const loading = ref(true)
const activity = ref(null)
const eventData = ref(null)
const speakers = ref([])
const documents = ref([])
const editingField = ref({})
const tempValue = ref({})
const activityDate = ref('')
const startTime = ref('')
const endTime = ref('')
const hasUnsavedChanges = ref({})
const savingField = ref({})
const tempSpeakerValue = ref({})
const hasUnsavedSpeakerChanges = ref({})
const savingSpeakerField = ref({})
const showAddSpeakerModal = ref(false)
const newSpeakerForm = ref({
  civility: 'M.',
  first_name: '',
  last_name: '',
  position: '',
  organization: '',
  email: ''
})
const savingNewSpeaker = ref(false)
const showPhotoModal = ref(false)
const selectedSpeakerPhoto = ref(null)
const uploadingPhoto = ref({})
const uploadProgress = ref({})
const editingBanner = ref(false)


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

const eventTimezone = computed(() => {
  if (!eventData.value?.timezone) return ''
  return getTimezoneLabel(eventData.value.timezone, locale.value)
})

const formatEventPeriod = () => {
  if (!eventData.value) return ''
  const start = new Date(eventData.value.start_date)
  const end = new Date(eventData.value.end_date)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: eventData.value.timezone || 'UTC'
  }
  return `${start.toLocaleDateString(locale.value, options)} - ${end.toLocaleDateString(locale.value, options)}`
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
  hasUnsavedChanges.value[field] = false
}

const cancelEdit = (field) => {
  delete editingField.value[field]
  delete tempValue.value[field]
  delete hasUnsavedChanges.value[field]
}

const onFieldChange = (field) => {
  hasUnsavedChanges.value[field] = tempValue.value[field] !== activity.value[field]
}

const saveField = async (field) => {
  const value = tempValue.value[field]
  if (value === activity.value[field]) {
    cancelEdit(field)
    return
  }

  savingField.value[field] = true
  try {
    await updateActivity(activity.value.id, { [field]: value })
    activity.value[field] = value
    cancelEdit(field)
  } catch (error) {
    console.error('Error updating field:', error)
  } finally {
    delete savingField.value[field]
  }
}

// Speaker editing functions
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
      if (!updateData.first_name.trim() || !updateData.last_name.trim()) {
        alert(t('events.speakerNameRequired'))
        return
      }

      // Check if values are the same
      if (updateData.civility === speaker.civility &&
          updateData.first_name === speaker.first_name &&
          updateData.last_name === speaker.last_name) {
        cancelEditSpeaker(speakerId, field)
        return
      }
    } else {
      const value = tempSpeakerValue.value[speakerId][field]

      // Validate required fields
      if (!value.trim()) {
        if (field === 'position') {
          alert(t('events.speakerPositionRequired'))
        } else if (field === 'organization') {
          alert(t('events.speakerOrganizationRequired'))
        } else if (field === 'email') {
          alert(t('events.speakerEmailRequired'))
        }
        return
      }

      // Validate email format
      if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value.trim())) {
          alert(t('events.invalidEmailFormat'))
          return
        }
      }

      if (value === speaker[field]) {
        cancelEditSpeaker(speakerId, field)
        return
      }
      updateData[field] = value
    }

    // Use updateSpeaker function from composable
    await updateSpeaker(speakerId, updateData)

    // Update local speaker data
    Object.assign(speaker, updateData)

    cancelEditSpeaker(speakerId, field)
  } catch (error) {
    console.error('Error updating speaker:', error)
  } finally {
    if (savingSpeakerField.value[speakerId]) {
      delete savingSpeakerField.value[speakerId][field]
    }
  }
}

const hasPendingDateChanges = computed(() => {
  if (!activity.value) return false

  const currentStartDate = activity.value.proposed_start_date ? new Date(activity.value.proposed_start_date) : null
  const currentEndDate = activity.value.proposed_end_date ? new Date(activity.value.proposed_end_date) : null

  if (currentStartDate) {
    const savedDate = currentStartDate.toISOString().split('T')[0]
    const savedStartTime = currentStartDate.toTimeString().slice(0, 5)
    const savedEndTime = currentEndDate ? currentEndDate.toTimeString().slice(0, 5) : ''

    return savedDate !== activityDate.value || savedStartTime !== startTime.value || savedEndTime !== endTime.value
  }

  return false
})

const saveDates = async () => {
  if (!activityDate.value || !startTime.value || !endTime.value) return

  savingField.value['dates'] = true
  try {
    // Create start datetime
    const startDateTime = new Date(activityDate.value)
    const [startHours, startMinutes] = startTime.value.split(':')
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)

    // Create end datetime
    const endDateTime = new Date(activityDate.value)
    const [endHours, endMinutes] = endTime.value.split(':')
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)

    await updateActivity(activity.value.id, {
      proposed_start_date: startDateTime.toISOString(),
      proposed_end_date: endDateTime.toISOString()
    })

    activity.value.proposed_start_date = startDateTime.toISOString()
    activity.value.proposed_end_date = endDateTime.toISOString()
  } catch (error) {
    console.error('Error updating dates:', error)
  } finally {
    delete savingField.value['dates']
  }
}

const cancelDateChanges = () => {
  if (activity.value.proposed_start_date) {
    const startDate = new Date(activity.value.proposed_start_date)
    activityDate.value = startDate.toISOString().split('T')[0]
    startTime.value = startDate.toTimeString().slice(0, 5)
  }
  if (activity.value.proposed_end_date) {
    const endDate = new Date(activity.value.proposed_end_date)
    endTime.value = endDate.toTimeString().slice(0, 5)
  }
}

// La fonction updateActivityTime est remplacée par saveDates

const addNewSpeaker = () => {
  // Reset form
  newSpeakerForm.value = {
    civility: 'M.',
    first_name: '',
    last_name: '',
    position: '',
    organization: '',
    email: ''
  }
  showAddSpeakerModal.value = true
}

const submitNewSpeaker = async () => {
  // Validate required fields
  if (!newSpeakerForm.value.first_name.trim() || !newSpeakerForm.value.last_name.trim()) {
    alert(t('events.speakerNameRequired'))
    return
  }

  if (!newSpeakerForm.value.email.trim()) {
    alert(t('events.speakerEmailRequired'))
    return
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newSpeakerForm.value.email.trim())) {
    alert(t('events.invalidEmailFormat'))
    return
  }

  if (!newSpeakerForm.value.position.trim()) {
    alert(t('events.speakerPositionRequired'))
    return
  }

  if (!newSpeakerForm.value.organization.trim()) {
    alert(t('events.speakerOrganizationRequired'))
    return
  }

  savingNewSpeaker.value = true
  try {
    const speakerData = {
      ...newSpeakerForm.value,
      has_confirmed_by_email: false
    }

    const newSpeaker = await addSpeaker(activity.value.id, speakerData)
    speakers.value.push(newSpeaker)

    showAddSpeakerModal.value = false
  } catch (error) {
    console.error('Error adding speaker:', error)
    alert(t('events.errorAddingSpeaker'))
  } finally {
    savingNewSpeaker.value = false
  }
}

const cancelAddSpeaker = () => {
  showAddSpeakerModal.value = false
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

const onBannerImageSelected = (file) => {
  // L'image a été sélectionnée, le composant gère l'édition
  console.log('Image selected for banner:', file.name)
}

const onBannerImageProcessed = async (blob) => {
  try {
    // Créer un fichier à partir du blob
    const file = new File([blob], 'banner-16x9.jpg', { type: 'image/jpeg' })

    // Uploader la bannière
    const updatedActivity = await uploadBanner(activity.value.id, file, 'cover')
    activity.value.cover_image_high_url = updatedActivity.cover_image_high_url

    // Sortir du mode édition
    editingBanner.value = false
  } catch (error) {
    console.error('Error uploading processed banner:', error)
    alert('Erreur lors de l\'upload de la bannière')
  }
}

const uploadSpeakerPhotoHandler = async (speakerId, event) => {
  const file = event.target.files[0]
  if (!file) return

  // Éviter les uploads multiples
  if (uploadingPhoto.value[speakerId]) return

  try {
    // Initialiser l'état de progression
    uploadingPhoto.value[speakerId] = true
    uploadProgress.value[speakerId] = 0

    // Définir le callback de progression
    const onProgress = ({ stage, progress }) => {
      uploadProgress.value[speakerId] = progress

      // Optionnel: Log pour debug
      console.log(`Upload ${speakerId}: ${stage} - ${progress}%`)
    }

    const updatedSpeaker = await uploadSpeakerPhoto(speakerId, file, onProgress)
    const speakerIndex = speakers.value.findIndex(s => s.id === speakerId)
    if (speakerIndex !== -1) {
      speakers.value[speakerIndex].photo_url = updatedSpeaker.photo_url
      // Mettre à jour la miniature si elle existe
      if (updatedSpeaker.photo_thumbnail_url) {
        speakers.value[speakerIndex].photo_thumbnail_url = updatedSpeaker.photo_thumbnail_url
      }
    }

    // Reset du champ de fichier
    event.target.value = ''
  } catch (error) {
    console.error('Error uploading speaker photo:', error)
    alert(`Erreur lors de l'upload de la photo: ${error.message}`)
    // Reset du champ de fichier même en cas d'erreur
    event.target.value = ''
  } finally {
    // Nettoyer l'état de progression
    setTimeout(() => {
      delete uploadingPhoto.value[speakerId]
      delete uploadProgress.value[speakerId]
    }, 1000) // Laisser voir le 100% pendant 1 seconde
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

const loadActivity = async () => {
  try {
    loading.value = true

    const data = await getActivityById(route.params.id)

    if (!data || data.submitted_by !== authStore.user?.id) {
      router.push('/events/dashboard')
      return
    }

    activity.value = data
    eventData.value = data.events
    speakers.value = data.activity_speakers || []
    documents.value = data.activity_documents || []

    // Initialize date and time fields
    if (data.proposed_start_date) {
      const startDate = new Date(data.proposed_start_date)
      activityDate.value = startDate.toISOString().split('T')[0]
      startTime.value = startDate.toTimeString().slice(0, 5)
    }

    if (data.proposed_end_date) {
      const endDate = new Date(data.proposed_end_date)
      endTime.value = endDate.toTimeString().slice(0, 5)
    }
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
