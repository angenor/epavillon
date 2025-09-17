<template>
  <div class="min-h-screen relative transition-colors duration-200">
    <!-- Image de fond avec repeat -->
    <div 
      class="absolute inset-0 z-0"
      :style="{
        backgroundImage: 'url(/images/people-bg/people-bg-2.jpg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left'
      }"
    >
      <!-- Overlay pour améliorer la lisibilité -->
      <div class="absolute inset-0 bg-white/80 dark:bg-gray-900/80"></div>
    </div>
    
    <div class="relative z-10 max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
              {{ t('activities.edit.error.title') }}
            </h3>
            <p class="mt-2 text-sm text-red-700 dark:text-red-300">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Edit form -->
      <div v-else-if="activity && !canEdit" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div class="flex">
          <svg class="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {{ t('activities.edit.noPermission.title') }}
            </h3>
            <p class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              {{ t('activities.edit.noPermission.description') }}
            </p>
          </div>
        </div>
      </div>

      <div v-else-if="activity" class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <!-- Modern Header -->
        <div class="bg-orange-600 dark:bg-orange-700 text-white px-6 py-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold mb-2">
                {{ t('activities.edit.title') }}
              </h1>
              <p class="text-orange-100 dark:text-orange-200 text-sm md:text-base">
                {{ t('activities.edit.subtitle') }}
              </p>
            </div>
            <div class="hidden md:block p-3 bg-white/10 rounded-xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-8">
          <!-- Basic Information -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('activities.edit.sections.basicInfo') }}
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Title -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    {{ t('activity.submit.fields.title') }}
                  </span>
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  :placeholder="t('activity.submit.placeholders.title')"
                />
              </div>

              <!-- Activity Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    {{ t('activity.submit.fields.activityType') }}
                  </span>
                </label>
                <select
                  v-model="formData.activity_type"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="">{{ t('activity.submit.placeholders.selectType') }}</option>
                  <option value="side_event">{{ t('activity.submit.types.side_event') }}</option>
                  <option value="country_day">{{ t('activity.submit.types.country_day') }}</option>
                  <option value="other">{{ t('activity.submit.types.other') }}</option>
                </select>
              </div>

              <!-- Format -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
                    </svg>
                    {{ t('activity.submit.fields.format') }}
                  </span>
                </label>
                <select
                  v-model="formData.format"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="">{{ t('activity.submit.placeholders.selectFormat') }}</option>
                  <option value="online">{{ t('activity.submit.formats.online') }}</option>
                  <option value="in_person">{{ t('activity.submit.formats.in_person') }}</option>
                  <option value="hybrid">{{ t('activity.submit.formats.hybrid') }}</option>
                </select>
              </div>

              <!-- Country -->
              <div v-if="formData.format === 'in_person' || formData.format === 'hybrid'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {{ t('activity.submit.fields.country') }}
                  </span>
                </label>
                <select
                  v-model="formData.country_id"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="">{{ t('activity.submit.placeholders.selectCountry') }}</option>
                  <option v-for="country in countries" :key="country.id" :value="country.id">
                    {{ country.name_fr }}
                  </option>
                </select>
              </div>
            </div>
          </div>

              <!-- Objectives -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                    </svg>
                    {{ t('activity.submit.fields.objectives') }}
                  </span>
                </label>
                <textarea
                  v-model="formData.objectives"
                  rows="4"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                  :placeholder="t('activity.submit.placeholders.objectives')"
                />
              </div>

          <!-- Detailed Presentation -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('activity.submit.fields.detailedPresentation') }}
              </h2>
            </div>

            <RichTextEditor
              v-model="formData.detailed_presentation"
              :max-length="5000"
              :placeholder="t('activity.submit.placeholders.detailedPresentation')"
            />
          </div>

          <!-- Themes and Categories -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('activities.edit.sections.themesAndCategories') }}
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Main Themes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {{ t('activity.submit.fields.themes') }}
                </label>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  <label v-for="theme in themes" :key="theme" class="flex items-center">
                    <input
                      v-model="formData.main_themes"
                      type="checkbox"
                      :value="theme"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {{ t(`activity.submit.themes.${theme}`) }}
                    </span>
                  </label>
                </div>
              </div>

              <!-- Categories -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {{ t('activity.submit.fields.categories') }}
                </label>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  <label v-for="category in categories" :key="category" class="flex items-center">
                    <input
                      v-model="formData.categories"
                      type="checkbox"
                      :value="category"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {{ t(`activity.submit.categories.${category}`) }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('activities.edit.sections.schedule') }}
              </h2>
            </div>

            <!-- Timezone Info -->
            <div v-if="event?.timezone" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-blue-900 dark:text-blue-200">
                    {{ t('activities.edit.timezoneInfo.title') || 'Fuseau horaire de l\'événement' }}
                  </h4>
                  <p class="mt-1 text-sm text-blue-800 dark:text-blue-300">
                    {{ getTimezoneLabel(event.timezone, t.locale?.value || 'fr') }}
                  </p>
                  <p class="mt-2 text-xs text-blue-700 dark:text-blue-400">
                    {{ t('activities.edit.timezoneInfo.description') || 'Toutes les dates et heures de cette activité sont affichées dans ce fuseau horaire' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Start Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activity.submit.fields.proposedStartDate') }}
                  <span v-if="event?.timezone" class="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    ({{ event.timezone }})
                  </span>
                </label>
                <input
                  v-model="formData.proposed_start_date"
                  type="datetime-local"
                  required
                  :min="dateRange.minDate"
                  :max="dateRange.maxDate"
                  @change="validateDates"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <p v-if="event" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ t('activities.validation.eventPeriod') }}: {{ formatEventDates() }}
                </p>
              </div>

              <!-- End Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('activity.submit.fields.proposedEndDate') }}
                  <span v-if="event?.timezone" class="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    ({{ event.timezone }})
                  </span>
                </label>
                <input
                  v-model="formData.proposed_end_date"
                  type="datetime-local"
                  required
                  :min="dateRange.minDate"
                  :max="dateRange.maxDate"
                  @change="validateDates"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <p v-if="event" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ t('activities.validation.tolerance') }}
                </p>
              </div>
            </div>

            <!-- Date Validation Errors -->
            <div v-if="dateValidationErrors.length > 0" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                    {{ t('activities.validation.dateError') }}
                  </h3>
                  <ul class="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                    <li v-for="error in dateValidationErrors" :key="error">
                      {{ t(error) }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Management -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('activities.edit.sections.status') }}
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Validation Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ t('activities.edit.fields.validationStatus') }}
                  </span>
                </label>
                <select
                  v-model="formData.validation_status"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  :disabled="!isAdmin"
                >
                  <option value="draft">{{ t('activities.status.validation.draft') }}</option>
                  <option value="submitted">{{ t('activities.status.validation.submitted') }}</option>
                  <option value="under_review">{{ t('activities.status.validation.under_review') }}</option>
                  <option value="approved">{{ t('activities.status.validation.approved') }}</option>
                  <option value="rejected">{{ t('activities.status.validation.rejected') }}</option>
                  <option value="cancelled">{{ t('activities.status.validation.cancelled') }}</option>
                  <option value="live">{{ t('activities.status.validation.live') }}</option>
                  <option value="completed">{{ t('activities.status.validation.completed') }}</option>
                </select>
                <p v-if="!isAdmin" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ t('activities.edit.adminOnly') }}
                </p>
              </div>

              <!-- Activity Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    {{ t('activities.edit.fields.activityStatus') }}
                  </span>
                </label>
                <select
                  v-model="formData.activity_status"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  :disabled="!isAdmin"
                >
                  <option :value="null">{{ t('activities.status.activity.none') }}</option>
                  <option value="live">{{ t('activities.status.activity.live') }}</option>
                  <option value="completed">{{ t('activities.status.activity.completed') }}</option>
                  <option value="postponed">{{ t('activities.status.activity.postponed') }}</option>
                </select>
                <p v-if="!isAdmin" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ t('activities.edit.adminOnly') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              @click="goBack"
              class="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              {{ t('common.cancel') }}
            </button>

            <div class="flex space-x-3">
              <button
                type="button"
                @click="saveDraft"
                :disabled="isSaving"
                class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                <span v-if="isSaving" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t('activity.draft.saving') }}
                </span>
                <span v-else>{{ t('activity.draft.save') }}</span>
              </button>

              <button
                type="submit"
                :disabled="isSubmitting || dateValidationErrors.length > 0"
                class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                <span v-if="isSubmitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t('activities.edit.updating') }}
                </span>
                <span v-else>{{ t('activities.edit.update') }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import { useActivityDateValidation } from '@/composables/useActivityDateValidation'
import { useTimezone } from '@/composables/useTimezone'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()
const authStore = useAuthStore()
const { validateActivityDates, getAcceptableDateRange } = useActivityDateValidation()
const { formatDateTimeWithTimezone, getTimezoneLabel } = useTimezone()

// Reactive data
const isLoading = ref(true)
const isSubmitting = ref(false)
const isSaving = ref(false)
const error = ref(null)
const activity = ref(null)
const event = ref(null)
const countries = ref([])
const dateValidationErrors = ref([])

// Form data
const formData = ref({
  title: '',
  activity_type: '',
  format: '',
  objectives: '',
  detailed_presentation: '',
  main_themes: [],
  categories: [],
  proposed_start_date: '',
  proposed_end_date: '',
  country_id: '',
  validation_status: 'draft',
  activity_status: null
})

// Static options
const themes = [
  'mitigation', 'adaptation', 'climate_resilience', 'loss_and_damage',
  'clean_tech_innovations', 'renewable_energy_land', 'health_solidarity',
  'industry_transition', 'transport_urbanization', 'nature_oceans',
  'agriculture_food', 'sustainable_livestock', 'gender', 'youth',
  'technology', 'finance', 'other'
]

const categories = [
  'capacity_building', 'results_sharing', 'technological_innovation',
  'field_project', 'best_practices', 'awareness', 'consultation'
]

// Computed properties
const canEdit = computed(() => {
  if (!activity.value || !authStore.user) return false

  // User can edit their own activity or if they are admin
  return activity.value.submitted_by === authStore.user.id ||
         authStore.profile?.user_roles?.some(role =>
           ['admin', 'super_admin'].includes(role.role) && role.is_active
         )
})

const isAdmin = computed(() => {
  return authStore.profile?.user_roles?.some(role =>
    ['admin', 'super_admin'].includes(role.role) && role.is_active
  )
})

// Computed pour la plage de dates acceptables
const dateRange = computed(() => {
  if (!event.value) return { minDate: null, maxDate: null }

  const eventStartDate = event.value.online_start_datetime || event.value.in_person_start_date
  const eventEndDate = event.value.online_end_datetime || event.value.in_person_end_date

  return getAcceptableDateRange(eventStartDate, eventEndDate)
})

// Methods
const loadActivity = async () => {
  try {
    isLoading.value = true
    error.value = null

    const activityId = route.params.id
    
    // Load activity with event data
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select(`
        *,
        event:events(*)
      `)
      .eq('id', activityId)
      .single()

    if (activityError) throw activityError

    activity.value = activityData
    event.value = activityData.event
    
    // Populate form data
    // Convert HTML to plain text for objectives if it contains HTML tags
    let plainObjectives = activityData.objectives || ''
    if (plainObjectives.includes('<p>')) {
      // Remove HTML tags from objectives
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = plainObjectives
      plainObjectives = tempDiv.textContent || tempDiv.innerText || ''
    }

    formData.value = {
      title: activityData.title || '',
      activity_type: activityData.activity_type || '',
      format: activityData.format || '',
      objectives: plainObjectives,
      detailed_presentation: activityData.detailed_presentation || '',
      main_themes: activityData.main_themes || [],
      categories: activityData.categories || [],
      proposed_start_date: activityData.proposed_start_date ? 
        new Date(activityData.proposed_start_date).toISOString().slice(0, 16) : '',
      proposed_end_date: activityData.proposed_end_date ? 
        new Date(activityData.proposed_end_date).toISOString().slice(0, 16) : '',
      country_id: activityData.country_id || '',
      validation_status: activityData.validation_status || 'draft',
      activity_status: activityData.activity_status || null
    }

  } catch (err) {
    console.error('Error loading activity:', err)
    error.value = t('activities.edit.error.loadFailed')
  } finally {
    isLoading.value = false
  }
}

const loadCountries = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name_fr')
      .order('name_fr')

    if (error) throw error
    countries.value = data || []
  } catch (err) {
    console.error('Error loading countries:', err)
  }
}

const handleSubmit = async () => {
  if (!canEdit.value || isSubmitting.value) return

  // Valider les dates avant la soumission
  validateDates()
  if (dateValidationErrors.value.length > 0) {
    error.value = t('activities.validation.dateError')
    return
  }

  try {
    isSubmitting.value = true
    error.value = null

    console.log('Starting update for activity:', activity.value.id)
    console.log('Current user:', authStore.user?.id)
    console.log('Activity submitted_by:', activity.value.submitted_by)

    // Ensure datetime values are properly formatted
    const startDate = formData.value.proposed_start_date ? 
      new Date(formData.value.proposed_start_date).toISOString() : null
    const endDate = formData.value.proposed_end_date ? 
      new Date(formData.value.proposed_end_date).toISOString() : null

    // Ensure arrays are properly formatted
    const finalMainThemes = Array.isArray(formData.value.main_themes) && formData.value.main_themes.length > 0 ? 
      formData.value.main_themes : ['other']
    const finalCategories = Array.isArray(formData.value.categories) && formData.value.categories.length > 0 ? 
      formData.value.categories : ['other']

    const updateData = {
      title: formData.value.title,
      activity_type: formData.value.activity_type,
      format: formData.value.format,
      objectives: formData.value.objectives,
      detailed_presentation: formData.value.detailed_presentation,
      main_themes: finalMainThemes,
      categories: finalCategories,
      proposed_start_date: startDate,
      proposed_end_date: endDate,
      country_id: formData.value.country_id || null,
      validation_status: formData.value.validation_status,
      activity_status: formData.value.activity_status,
      updated_at: new Date().toISOString()
    }

    console.log('Update data:', updateData)

    const { data: updateResult, error: updateError } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', activity.value.id)
      .select()

    console.log('Update result:', updateResult)
    console.log('Update error:', updateError)

    if (updateError) {
      console.error('Supabase update error details:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      })
      throw updateError
    }

    if (!updateResult || updateResult.length === 0) {
      throw new Error('Aucune donnée retournée après la mise à jour. Vérifiez les permissions RLS.')
    }

    // Update local activity data
    activity.value = { ...activity.value, ...updateResult[0] }

    console.log('Update successful, redirecting...')

    // Redirect to activity detail page
    setTimeout(() => {
      router.push(`/activities/${activity.value.id}`)
    }, 500)

  } catch (err) {
    console.error('Error updating activity:', err)
    error.value = t('activities.edit.error.updateFailed') + ': ' + err.message
  } finally {
    isSubmitting.value = false
  }
}

const saveDraft = async () => {
  if (!canEdit.value || isSaving.value) return

  try {
    isSaving.value = true
    
    // Ensure datetime values are properly formatted
    const startDate = formData.value.proposed_start_date ? 
      new Date(formData.value.proposed_start_date).toISOString() : null
    const endDate = formData.value.proposed_end_date ? 
      new Date(formData.value.proposed_end_date).toISOString() : null
    
    const draftData = {
      title: formData.value.title,
      activity_type: formData.value.activity_type,
      format: formData.value.format,
      objectives: formData.value.objectives,
      detailed_presentation: formData.value.detailed_presentation,
      main_themes: formData.value.main_themes,
      categories: formData.value.categories,
      proposed_start_date: startDate,
      proposed_end_date: endDate,
      country_id: formData.value.country_id || null,
      validation_status: 'draft',
      activity_status: formData.value.activity_status
    }

    const { error: saveError } = await supabase
      .from('activities')
      .update(draftData)
      .eq('id', activity.value.id)
      .select()

    if (saveError) throw saveError

    // Show success message (optional)
    alert(t('activities.edit.draftSaved'))

  } catch (err) {
    console.error('Error saving draft:', err)
    error.value = t('activities.edit.error.saveFailed') + ': ' + err.message
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.back()
}

// Validation des dates
const validateDates = () => {
  if (!event.value || !formData.value.proposed_start_date || !formData.value.proposed_end_date) {
    dateValidationErrors.value = []
    return
  }

  const eventStartDate = event.value.online_start_datetime || event.value.in_person_start_date
  const eventEndDate = event.value.online_end_datetime || event.value.in_person_end_date

  const validation = validateActivityDates({
    activityStartDate: formData.value.proposed_start_date,
    activityEndDate: formData.value.proposed_end_date,
    eventStartDate: eventStartDate,
    eventEndDate: eventEndDate
  })

  dateValidationErrors.value = validation.errors
}

// Formater les dates de l'événement pour l'affichage
const formatEventDates = () => {
  if (!event.value) return ''

  const startDate = event.value.online_start_datetime || event.value.in_person_start_date
  const endDate = event.value.online_end_datetime || event.value.in_person_end_date

  if (!startDate || !endDate) return ''

  const start = new Date(startDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  const end = new Date(endDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return `${start} - ${end}`
}

// Lifecycle
onMounted(() => {
  loadActivity()
  loadCountries()
})
</script>