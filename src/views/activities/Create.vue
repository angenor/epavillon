<template>
  <div class="min-h-screen relative transition-colors duration-200">
    <!-- Image de fond avec repeat -->
    <div
      class="absolute inset-0 z-0 "
      :style="{
        backgroundImage: 'url(/images/people-bg/people-bg-2.jpg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left'
      }"
    >
      <!-- Overlay pour améliorer la lisibilité -->
      <div class="absolute inset-0  dark:bg-gray-900/80"></div>
    </div>
    <div class="relative z-10 max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Draft Alert with improved design -->
      <div v-if="hasDraft" class="mb-6 p-4 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-gray-800 dark:text-gray-200 font-medium">
              {{ t('activity.draft.found') }}
            </span>
          </div>
          <div class="flex space-x-2">
            <button
              @click="loadDraft"
              class="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              {{ t('activity.draft.load') }}
            </button>
            <button
              @click="deleteDraft"
              class="px-4 py-2 text-sm border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            >
              {{ t('activity.draft.delete') }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <!-- Modern Header -->
        <div class="bg-green-600 dark:bg-green-700 text-white px-6 py-8">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h1 class="text-3xl font-bold mb-2">
                {{ t('activity.submit.title') }}
              </h1>
              <p class="text-green-100 dark:text-green-200 text-lg mb-4">
                {{ t('activity.submit.subtitle') }}
              </p>

              <!-- Informations de l'événement -->
              <div v-if="eventData" class="mt-4 p-4 bg-green-700 dark:bg-green-800 rounded-xl bg-opacity-50">
                <h2 class="text-xl font-semibold mb-2">{{ eventData.title }}</h2>
                <div class="flex flex-wrap items-center gap-3 text-sm">
                  <!-- Date de début -->
                  <div class="flex items-center text-green-100">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ formatEventDate(eventData) }}</span>
                  </div>

                  <!-- Statut de soumission -->
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    eventData.submission_status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]">
                    <svg class="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    {{ t(`event.submissionStatus.${eventData.submission_status}`) }}
                  </span>

                  <!-- Date limite -->
                  <div v-if="eventData.submission_deadline" class="flex items-center text-green-100">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ t('event.submissionDeadline') }}: {{ formatDate(eventData.submission_deadline) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Logo de l'événement -->
            <div v-if="eventData?.logo_url" class="hidden sm:block ml-6 flex-shrink-0">
              <div class="bg-white dark:bg-gray-100 p-2 rounded-xl shadow-lg">
                <img
                  :src="eventData.logo_url"
                  :alt="eventData.title"
                  class="h-20 w-20 object-contain"
                >
              </div>
            </div>
            <!-- Icône par défaut si pas de logo -->
            <div v-else class="hidden sm:block">
              <svg class="w-16 h-16 text-green-400 dark:text-green-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="px-6 py-6">
          <!-- Enhanced Progress Bar -->
          <div class="mb-8">
            <ProgressBar
              :steps="steps"
              :current-step="currentStep"
            />
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Step 1: Basic Information -->
            <div v-show="currentStep === 0" class="space-y-6">
              <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {{ t('activity.submit.sections.basicInfo') }}
                </h2>

                <div class="space-y-5">
                  <div class="group">
                    <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                      {{ t('activity.submit.fields.title') }} *
                    </label>
                    <div class="relative">
                      <input
                        id="title"
                        v-model="form.title"
                        type="text"
                        required
                        class="w-full px-4 py-3 pl-11 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                        :placeholder="t('activity.submit.placeholders.title')"
                      />
                      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="group">
                    <label for="organization" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t('activity.submit.fields.organization') }} *
                    </label>
                    <div class="relative">
                      <input
                        id="organization"
                        :value="organizationName"
                        type="text"
                        disabled
                        class="w-full px-4 py-3 pl-11 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      />
                      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ t('activity.submit.helpers.organizationInfo') }}
                    </p>
                  </div>

                  <div class="group">
                    <label for="activity_type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                      {{ t('activity.submit.fields.activityType') }} *
                    </label>
                    <div class="relative">
                      <select
                        id="activity_type"
                        v-model="form.activity_type"
                        required
                        class="w-full px-4 py-3 pl-11 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 appearance-none cursor-pointer"
                      >
                        <option value="">{{ t('activity.submit.placeholders.selectType') }}</option>
                        <option value="side_event">{{ t('activity.submit.types.side_event') + ' (1 H 00 max)'}}</option>
                        <option value="country_day">{{ t('activity.submit.types.country_day') + ' (2 H 30 max)' }}</option>
                        <!-- <option value="other">{{ t('activity.submit.types.other') }}</option> -->
                      </select>
                      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="group">
                    <label for="objectives" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                      {{ t('activity.submit.fields.objectives') }} *
                    </label>
                    <div class="relative">
                      <textarea
                        id="objectives"
                        v-model="form.objectives"
                        rows="3"
                        required
                        class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 resize-none"
                        :placeholder="t('activity.submit.placeholders.objectives')"
                      ></textarea>
                    </div>
                  </div>

                  <div class="group">
                    <label for="detailed_presentation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                      {{ t('activity.submit.fields.detailedPresentation') }} *
                    </label>
                    <RichTextEditor
                      v-model="form.detailed_presentation"
                      :placeholder="t('activity.submit.placeholders.detailedPresentation')"
                      :show-character-count="true"
                      :max-length="5000"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Format and Themes -->
            <div v-show="currentStep === 1" class="space-y-6">
              <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  {{ t('activity.submit.sections.formatAndThemes') }}
                </h2>

                <div class="space-y-5">
                  <div class="group">
                    <label for="format" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                      {{ t('activity.submit.fields.format') }} *
                    </label>
                    <div class="relative">
                      <select
                        id="format"
                        v-model="form.format"
                        required
                        class="w-full px-4 py-3 pl-11 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 appearance-none cursor-pointer"
                      >
                        <option value="">{{ t('activity.submit.placeholders.selectFormat') }}</option>
                        <option disabled value="online">{{ t('activity.submit.formats.online') }}</option>
                        <option disabled value="in_person">{{ t('activity.submit.formats.in_person') }}</option>
                        <option value="hybrid">{{ t('activity.submit.formats.hybrid') }}</option>
                      </select>
                      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {{ t('activity.submit.fields.themes') }} *
                    </label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label
                        v-for="theme in availableThemes"
                        :key="theme"
                        class="flex items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          :value="theme"
                          v-model="form.main_themes"
                          class="rounded border-gray-300 dark:border-gray-600 text-green-600 dark:text-green-400 focus:ring-green-500 dark:focus:ring-green-400 dark:bg-gray-700"
                        />
                        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {{ t(`activity.submit.themes.${theme}`) }}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {{ t('activity.submit.fields.categories') }} *
                    </label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label
                        v-for="category in availableCategories"
                        :key="category"
                        class="flex items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          :value="category"
                          v-model="form.categories"
                          class="rounded border-gray-300 dark:border-gray-600 text-green-600 dark:text-green-400 focus:ring-green-500 dark:focus:ring-green-400 dark:bg-gray-700"
                        />
                        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {{ t(`activity.submit.categories.${category}`) }}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Schedule and Location -->
            <div v-show="currentStep === 2" class="space-y-6">
              <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {{ t('activity.submit.sections.schedule') }}
                </h2>

                <div class="space-y-5">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="group">
                      <label for="proposed_start_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                        {{ t('activity.submit.fields.proposedStartDate') }} *
                      </label>
                      <div class="relative">
                        <input
                          id="proposed_start_date"
                          v-model="form.proposed_start_date"
                          type="datetime-local"
                          required
                          class="w-full px-4 py-3 pl-11 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                        />
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div class="group">
                      <label for="proposed_end_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                        {{ t('activity.submit.fields.proposedEndDate') }} *
                      </label>
                      <div class="relative">
                        <input
                          id="proposed_end_date"
                          v-model="form.proposed_end_date"
                          type="datetime-local"
                          required
                          class="w-full px-4 py-3 pl-11 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                        />
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ t('activity.submit.sections.location') }}
                    </h3>
                    <div class="group">
                      <label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                        {{ t('activity.submit.fields.country') }}
                      </label>
                      <div class="relative">
                        <select
                          id="country"
                          v-model="form.country_id"
                          class="w-full px-4 py-3 pl-11 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 appearance-none cursor-pointer"
                        >
                          <option value="">{{ t('activity.submit.placeholders.selectCountry') }}</option>
                          <option v-for="country in countries" :key="country.id" :value="country.id">
                            {{ locale === 'fr' ? country.name_fr : country.name_en }}
                          </option>
                        </select>
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Speakers -->
            <div v-show="currentStep === 3" class="space-y-6">
              <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  {{ t('activity.submit.sections.speakers') }}
                </h2>

                <div class="space-y-4">
                  <div v-for="(speaker, index) in form.speakers" :key="index" class="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div class="flex justify-between items-start mb-4">
                      <h3 class="text-base font-medium text-gray-900 dark:text-white flex items-center">
                        <span class="flex items-center justify-center w-7 h-7 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold mr-2">
                          {{ index + 1 }}
                        </span>
                        {{ t('activity.submit.fields.speaker') }}
                      </h3>
                      <button
                        v-if="form.speakers.length > 1"
                        @click="removeSpeaker(index)"
                        type="button"
                        class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="group">
                        <label :for="`civility-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {{ t('activity.submit.fields.civility') }}
                        </label>
                        <select
                          :id="`civility-${index}`"
                          v-model="speaker.civility"
                          class="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 appearance-none cursor-pointer"
                        >
                        <option value="">{{ t('activity.submit.placeholders.selectCivility') }}</option>
                        <option value="mr">{{ t('activity.submit.civilities.mr') }}</option>
                        <option value="mrs">{{ t('activity.submit.civilities.mrs') }}</option>
                        <option value="ms">{{ t('activity.submit.civilities.ms') }}</option>
                        <option value="dr">{{ t('activity.submit.civilities.dr') }}</option>
                        <option value="prof">{{ t('activity.submit.civilities.prof') }}</option>
                        </select>
                      </div>

                      <div class="group">
                        <label :for="`firstName-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {{ t('activity.submit.fields.firstName') }} *
                        </label>
                        <input
                          :id="`firstName-${index}`"
                          v-model="speaker.first_name"
                          type="text"
                          required
                          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                          :placeholder="t('activity.submit.placeholders.speakerFirstName')"
                        />
                      </div>

                      <div class="group">
                        <label :for="`lastName-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {{ t('activity.submit.fields.lastName') }} *
                        </label>
                        <input
                          :id="`lastName-${index}`"
                          v-model="speaker.last_name"
                          type="text"
                          required
                          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                          :placeholder="t('activity.submit.placeholders.speakerLastName')"
                        />
                      </div>

                      <div class="group">
                        <label :for="`email-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {{ t('activity.submit.fields.email') }} *
                        </label>
                        <input
                          :id="`email-${index}`"
                          v-model="speaker.email"
                          type="email"
                          required
                          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                          :placeholder="t('activity.submit.placeholders.speakerEmail')"
                        />
                      </div>

                      <div class="group">
                        <label :for="`position-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {{ t('activity.submit.fields.position') }}
                        </label>
                        <input
                          :id="`position-${index}`"
                          v-model="speaker.position"
                          type="text"
                          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                          :placeholder="t('activity.submit.placeholders.position')"
                        />
                      </div>

                      <div class="group">
                        <label :for="`speakerOrganization-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {{ t('activity.submit.fields.speakerOrganization') }}
                        </label>
                        <input
                          :id="`speakerOrganization-${index}`"
                          v-model="speaker.organization"
                          type="text"
                          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                          :placeholder="t('activity.submit.placeholders.speakerOrganization')"
                        />
                      </div>
                    </div>

                    <div class="mt-4">
                      <label class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                        <input
                          v-model="speaker.is_available_for_questions"
                          type="checkbox"
                          class="rounded border-gray-300 dark:border-gray-600 text-green-600 dark:text-green-400 focus:ring-green-500 dark:focus:ring-green-400 dark:bg-gray-700"
                        />
                        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {{ t('activity.submit.fields.availableForQuestions') }}
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    @click="addSpeaker"
                    type="button"
                    class="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-green-400 dark:hover:border-green-600 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all duration-200"
                  >
                    <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {{ t('activity.submit.addSpeaker') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 5: Summary -->
            <div v-show="currentStep === 4" class="space-y-6">
              <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {{ t('activity.submit.sections.summary') }}
                </h2>

                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-600">
                  <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 class="font-medium text-gray-900 dark:text-white mb-1">{{ t('activity.submit.fields.title') }}</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{ form.title || '-' }}</p>
                  </div>
                  <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 class="font-medium text-gray-900 dark:text-white mb-1">{{ t('activity.submit.fields.activityType') }}</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{ form.activity_type ? t(`activity.submit.types.${form.activity_type}`) : '-' }}</p>
                  </div>
                  <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 class="font-medium text-gray-900 dark:text-white mb-1">{{ t('activity.submit.fields.format') }}</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{ form.format ? t(`activity.submit.formats.${form.format}`) : '-' }}</p>
                  </div>
                  <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 class="font-medium text-gray-900 dark:text-white mb-1">{{ t('activity.submit.fields.themes') }}</h3>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <span v-for="theme in form.main_themes" :key="theme" class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                        {{ t(`activity.submit.themes.${theme}`) }}
                      </span>
                    </div>
                  </div>
                  <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 class="font-medium text-gray-900 dark:text-white mb-1">{{ t('activity.submit.fields.speakers') }}</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{ form.speakers.length }} {{ form.speakers.length === 1 ? t('activity.submit.speaker') : t('activity.submit.speakers') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  v-if="currentStep > 0"
                  type="button"
                  @click="previousStep"
                  class="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200 flex items-center justify-center"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  {{ t('common.previous') }}
                </button>
                <button
                  type="button"
                  @click="router.back()"
                  class="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200"
                >
                  {{ t('common.cancel') }}
                </button>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  @click="saveDraft"
                  :disabled="isSavingDraft"
                  class="px-5 py-2.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  <svg v-if="isSavingDraft" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                  </svg>
                  {{ isSavingDraft ? t('activity.draft.saving') : t('activity.draft.save') }}
                </button>

                <button
                  v-if="currentStep < steps.length - 1"
                  type="button"
                  @click="nextStep"
                  :disabled="!canProceedToNextStep"
                  class="px-6 py-2.5 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-xl hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  {{ t('common.next') }}
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  v-else
                  type="submit"
                  :disabled="isSubmitting || !canSubmit"
                  class="px-6 py-2.5 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-xl hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  <svg v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ isSubmitting ? t('activity.submit.submitting') : t('activity.submit.submit') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useCountries } from '@/composables/useCountries'
import { useSupabase } from '@/composables/useSupabase'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const { countries, fetchCountries } = useCountries()

const eventId = route.params.eventId

// État pour les données de l'événement
const eventData = ref(null)
const loadingEvent = ref(true)

const form = ref({
  title: '',
  activity_type: '',
  objectives: '',
  detailed_presentation: '',
  format: '',
  main_themes: [],
  categories: [],
  proposed_start_date: '',
  proposed_end_date: '',
  country_id: '',
  speakers: [{
    civility: '',
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    organization: '',
    is_available_for_questions: true
  }]
})

const isSubmitting = ref(false)
const isSavingDraft = ref(false)
const currentStep = ref(0)
const hasDraft = ref(false)

const steps = [
  { title: t('activity.submit.steps.basicInfo'), subtitle: t('activity.submit.steps.basicInfoDesc') },
  { title: t('activity.submit.steps.formatThemes'), subtitle: t('activity.submit.steps.formatThemesDesc') },
  { title: t('activity.submit.steps.schedule'), subtitle: t('activity.submit.steps.scheduleDesc') },
  { title: t('activity.submit.steps.speakers'), subtitle: t('activity.submit.steps.speakersDesc') },
  { title: t('activity.submit.steps.summary'), subtitle: t('activity.submit.steps.summaryDesc') }
]

const availableThemes = [
  'mitigation',
  'adaptation',
  'climate_resilience',
  'loss_and_damage',
  'clean_tech_innovations',
  'renewable_energy_land',
  'health_solidarity',
  'industry_transition',
  'transport_urbanization',
  'nature_oceans',
  'agriculture_food',
  'sustainable_livestock',
  'gender',
  'youth',
  'technology',
  'finance',
  'other'
]

const availableCategories = [
  'capacity_building',
  'results_sharing',
  'technological_innovation',
  'field_project',
  'best_practices',
  'awareness',
  'consultation'
]

const canSubmit = computed(() => {
  return authStore.profile?.organization_id &&
    form.value.title &&
    form.value.activity_type &&
    form.value.objectives &&
    form.value.detailed_presentation &&
    form.value.format &&
    form.value.main_themes.length > 0 &&
    form.value.categories.length > 0 &&
    form.value.proposed_start_date &&
    form.value.proposed_end_date &&
    form.value.speakers.length > 0 &&
    form.value.speakers.every(s => s.first_name && s.last_name && s.email)
})

const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 0: // Basic Info
      return form.value.title && form.value.activity_type && form.value.objectives && form.value.detailed_presentation
    case 1: // Format and Themes
      return form.value.format && form.value.main_themes.length > 0 && form.value.categories.length > 0
    case 2: // Schedule and Location
      return form.value.proposed_start_date && form.value.proposed_end_date
    case 3: // Speakers
      return form.value.speakers.length > 0 && form.value.speakers.every(s => s.first_name && s.last_name && s.email)
    default:
      return true
  }
})


const organizationName = computed(() => {
  // Utiliser directement les données du profil utilisateur
  if (authStore.profile?.organization_id) {
    // Essayer d'abord avec les données chargées
    if (organizationData.value?.name) {
      return organizationData.value.name
    }
    // Sinon, utiliser un nom temporaire basé sur l'ID
    return `Organisation (${authStore.profile.organization_id.slice(0, 8)}...)`
  }
  return t('activity.submit.loadingOrganization')
})

const organizationData = ref(null)

const addSpeaker = () => {
  form.value.speakers.push({
    civility: '',
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    organization: '',
    is_available_for_questions: true
  })
}

const removeSpeaker = (index) => {
  if (form.value.speakers.length > 1) {
    form.value.speakers.splice(index, 1)
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const getDraftKey = () => {
  return `activity_draft_${eventId}_${authStore.user?.id}`
}

const saveDraft = async () => {
  isSavingDraft.value = true
  try {
    const draftData = {
      ...form.value,
      currentStep: currentStep.value,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(getDraftKey(), JSON.stringify(draftData))
    // Show success message
    console.log('Draft saved successfully')
  } catch (error) {
    console.error('Error saving draft:', error)
  } finally {
    isSavingDraft.value = false
  }
}

const loadDraft = () => {
  try {
    const draftData = localStorage.getItem(getDraftKey())
    if (draftData) {
      const parsed = JSON.parse(draftData)
      form.value = { ...parsed }
      currentStep.value = parsed.currentStep || 0
      hasDraft.value = false
    }
  } catch (error) {
    console.error('Error loading draft:', error)
  }
}

const deleteDraft = () => {
  try {
    localStorage.removeItem(getDraftKey())
    hasDraft.value = false
  } catch (error) {
    console.error('Error deleting draft:', error)
  }
}

const checkForDraft = () => {
  try {
    const draftData = localStorage.getItem(getDraftKey())
    hasDraft.value = !!draftData
  } catch (error) {
    console.error('Error checking for draft:', error)
    hasDraft.value = false
  }
}


const handleSubmit = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  try {
    const { supabase } = useSupabase()

    // Créer l'activité
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .insert({
        event_id: eventId,
        organization_id: authStore.profile.organization_id,
        submitted_by: authStore.user.id,
        title: form.value.title,
        activity_type: form.value.activity_type,
        objectives: form.value.objectives,
        detailed_presentation: form.value.detailed_presentation,
        format: form.value.format,
        main_themes: form.value.main_themes,
        categories: form.value.categories,
        proposed_start_date: form.value.proposed_start_date,
        proposed_end_date: form.value.proposed_end_date,
        country_id: form.value.country_id || null,
        validation_status: 'submitted'
      })
      .select()
      .single()

    if (activityError) throw activityError

    // Ajouter les intervenants
    const speakersToInsert = form.value.speakers.map(speaker => ({
      activity_id: activityData.id,
      civility: speaker.civility || null,
      first_name: speaker.first_name,
      last_name: speaker.last_name,
      email: speaker.email,
      position: speaker.position || null,
      organization: speaker.organization || null,
      is_available_for_questions: speaker.is_available_for_questions
    }))

    const { error: speakersError } = await supabase
      .from('activity_speakers')
      .insert(speakersToInsert)

    if (speakersError) throw speakersError

    // Clear draft after successful submission
    deleteDraft()

    router.push(`/activities/${activityData.id}`)
  } catch (error) {
    console.error('Error submitting activity:', error)
    alert(t('activity.submit.errors.submitFailed'))
  } finally {
    isSubmitting.value = false
  }
}

// Rediriger vers Setup si pas d'organisation
watch(() => authStore.profile, (profile) => {
  if (profile && !profile.organization_id) {
    const currentPath = route.fullPath
    router.push(`/organization/setup?redirect=${encodeURIComponent(currentPath)}`)
  }
}, { immediate: true })

// Charger les données de l'organisation
const loadOrganizationData = async () => {
  if (authStore.profile?.organization_id) {
    try {
      const { supabase } = useSupabase()
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, email, organization_type')
        .eq('id', authStore.profile.organization_id)
        .single()

      if (error) {
        console.error('Erreur lors du chargement de l\'organisation:', error)
        // En cas d'erreur, utiliser un nom par défaut
        organizationData.value = {
          name: `Organisation ID: ${authStore.profile.organization_id.slice(0, 8)}...`
        }
        return
      }

      organizationData.value = data
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'organisation:', error)
      // En cas d'erreur, utiliser un nom par défaut
      organizationData.value = {
        name: `Organisation ID: ${authStore.profile.organization_id.slice(0, 8)}...`
      }
    }
  }
}

// Charger les données de l'événement
const loadEventData = async () => {
  try {
    const { supabase } = useSupabase()
    const { data, error } = await supabase
      .from('events')
      .select('id, title, logo_url, submission_status, submission_deadline, online_start_datetime, in_person_start_date, participation_mode')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Erreur lors du chargement de l\'événement:', error)
      return
    }

    eventData.value = data
  } catch (error) {
    console.error('Erreur lors du chargement de l\'événement:', error)
  } finally {
    loadingEvent.value = false
  }
}

// Formater la date de l'événement
const formatEventDate = (event) => {
  if (!event) return ''

  // Priorité aux dates en ligne puis en présentiel
  const dateString = event.online_start_datetime || event.in_person_start_date
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Formater une date simple
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  // Charger les données de l'événement
  await loadEventData()

  // Charger les pays une seule fois
  await fetchCountries()

  // Charger l'organisation si disponible
  if (authStore.profile?.organization_id && !organizationData.value) {
    await loadOrganizationData()
  }

  // Vérifier s'il y a un brouillon
  checkForDraft()
})

// Watcher pour charger l'organisation quand le profil est disponible
watch(() => authStore.profile?.organization_id, async (organizationId, oldOrganizationId) => {
  // Éviter de recharger si c'est la même organisation ou si on a déjà les données
  if (organizationId && organizationId !== oldOrganizationId && !organizationData.value) {
    await loadOrganizationData()
  }
})
</script>

<style scoped>
/* Custom focus styles for enhanced form interactions */
.group:focus-within label {
  color: #16a34a;
}

.dark .group:focus-within label {
  color: #4ade80;
}

/* Custom scrollbar for textareas */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background-color: #f3f4f6;
  border-radius: 9999px;
}

.dark textarea::-webkit-scrollbar-track {
  background-color: #374151;
}

textarea::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 9999px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

.dark textarea::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

.dark textarea::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}

/* Custom select styling to remove default arrow */
select {
  background-image: none;
}

/* Smooth transitions for all interactive elements */
input, select, textarea, button {
  transition: all 0.2s ease-in-out;
}

/* Enhanced hover effects for cards */
.bg-gray-50:hover {
  background-color: #f9fafb;
}

.dark .bg-gray-50:hover {
  background-color: rgba(75, 85, 99, 0.5);
}

/* Improved focus ring visibility */
input:focus, select:focus, textarea:focus {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* Animation for step transitions */
.step-transition {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

/* Loading animation enhancement */
@keyframes pulse-green {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse-green {
  animation: pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
