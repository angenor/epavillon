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
              {{ t('events.edit.error.title') }}
            </h3>
            <p class="mt-2 text-sm text-red-700 dark:text-red-300">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- No permission state -->
      <div v-else-if="event && !canEdit" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div class="flex">
          <svg class="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {{ t('events.edit.noPermission.title') }}
            </h3>
            <p class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              {{ t('events.edit.noPermission.description') }}
            </p>
          </div>
        </div>
      </div>

      <div v-else-if="event" class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <!-- Modern Header -->
        <div class="bg-orange-600 dark:bg-orange-800 text-white px-6 py-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold mb-2">
                {{ t('events.edit.title') }}
              </h1>
              <p class="text-orange-100 dark:text-orange-200 text-sm md:text-base">
                {{ t('events.edit.subtitle') }}
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
                {{ t('events.edit.sections.basicInfo') }}
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    {{ t('events.create.fields.title') }}
                    <span class="text-red-500">*</span>
                  </span>
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  :placeholder="t('events.create.placeholders.title')"
                />
              </div>
              
              <!-- Acronym -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                    </svg>
                    {{ t('events.edit.fields.acronym') }}
                  </span>
                </label>
                <input
                  v-model="formData.acronym"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  :placeholder="t('events.edit.placeholders.acronym')"
                />
              </div>

              <!-- Year -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ t('events.create.fields.year') }}
                  </span>
                </label>
                <input
                  v-model.number="formData.year"
                  type="number"
                  required
                  min="2024"
                  max="2030"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>

              <!-- Participation Mode -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
                    </svg>
                    {{ t('events.create.fields.participationMode') }}
                  </span>
                </label>
                <select
                  v-model="formData.participation_mode"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="">{{ t('events.create.placeholders.selectMode') }}</option>
                  <option value="online">{{ t('events.create.modes.online') }}</option>
                  <option value="in_person">{{ t('events.create.modes.in_person') }}</option>
                  <option value="hybrid">{{ t('events.create.modes.hybrid') }}</option>
                </select>
              </div>

              <!-- Country -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {{ t('events.create.fields.country') }}
                    <span class="text-red-500">*</span>
                  </span>
                </label>
                <select
                  v-model="formData.country_id"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="">{{ t('events.create.placeholders.selectCountry') }}</option>
                  <option v-for="country in countries" :key="country.id" :value="country.id">
                    {{ country.name_fr }}
                  </option>
                </select>
              </div>

              <!-- City -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    {{ t('events.create.fields.city') }}
                    <span class="text-red-500">*</span>
                  </span>
                </label>
                <input
                  v-model="formData.city"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  :placeholder="formData.participation_mode === 'online' ? t('events.edit.placeholders.cityOnline') : t('events.edit.placeholders.city')"
                />
              </div>

              <!-- Address -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                    {{ t('events.create.fields.address') }}
                    <span class="text-red-500">*</span>
                  </span>
                </label>
                <input
                  v-model="formData.address"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  :placeholder="formData.participation_mode === 'online' ? t('events.edit.placeholders.addressOnline') : t('events.edit.placeholders.address')"
                />
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    {{ t('events.create.fields.description') }}
                  </span>
                </label>
                <textarea
                  v-model="formData.description"
                  rows="4"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                  :placeholder="t('events.create.placeholders.description')"
                />
              </div>
            </div>
          </div>

          <!-- Images et Logo -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('events.edit.sections.media') }}
              </h2>
            </div>

            <!-- Bannière principale -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ t('events.edit.fields.banner') }}
                </span>
              </label>
              
              <!-- Bannière preview -->
              <div v-if="formData.banner_high_quality_32_9_url" class="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3">
                <img :src="formData.banner_high_quality_32_9_url" alt="Bannière" class="w-32 h-20 object-cover rounded-lg">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Bannière actuelle</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ formData.banner_high_quality_32_9_url }}</p>
                </div>
                <button
                  type="button"
                  @click="formData.banner_high_quality_32_9_url = ''"
                  class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
              
              <!-- Banner upload input -->
              <div class="flex flex-col space-y-2">
                <input
                  ref="bannerFileInput"
                  type="file"
                  @change="handleBannerFileChange"
                  accept="image/*"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="$refs.bannerFileInput.click()"
                  :disabled="isUploading"
                  class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  {{ isUploading ? 'Téléchargement...' : 'Télécharger une bannière (32:9)' }}
                </button>
                <p class="text-xs text-gray-500 dark:text-gray-400">Format recommandé : 32:9 (ex: 1920x540px). PNG, JPG jusqu'à 10MB</p>
              </div>
              
              <!-- URL input option -->
              <div class="relative my-4">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                  <span class="bg-gray-50 dark:bg-gray-900/50 px-2 text-gray-500">ou</span>
                </div>
              </div>
              <input
                v-model="formData.banner_high_quality_32_9_url"
                type="url"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                :placeholder="t('events.edit.placeholders.bannerUrl')"
              />
            </div>
            
            <!-- Logo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  {{ t('events.edit.fields.logo') }}
                </span>
              </label>
              <!-- Logo upload/preview area -->
              <div class="space-y-4">
                <!-- Current logo preview -->
                <div v-if="formData.logo_url" class="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <img :src="formData.logo_url" alt="Logo actuel" class="w-20 h-20 object-contain rounded-lg bg-white dark:bg-gray-900">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Logo actuel</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ formData.logo_url }}</p>
                  </div>
                  <button
                    type="button"
                    @click="formData.logo_url = ''"
                    class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>

                <!-- File upload input -->
                <div class="flex flex-col space-y-2">
                  <input
                    ref="logoFileInput"
                    type="file"
                    @change="handleLogoFileChange"
                    accept="image/*"
                    class="hidden"
                  />
                  <div class="flex space-x-2">
                    <button
                      type="button"
                      @click="$refs.logoFileInput.click()"
                      :disabled="isUploading"
                      class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                      {{ isUploading ? 'Téléchargement...' : 'Télécharger un logo' }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, SVG jusqu'à 5MB</p>
                </div>

                <!-- URL input option -->
                <div class="relative">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div class="relative flex justify-center text-xs uppercase">
                    <span class="bg-white dark:bg-gray-800 px-2 text-gray-500">ou</span>
                  </div>
                </div>
                <input
                  v-model="formData.logo_url"
                  type="url"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  :placeholder="t('events.edit.placeholders.logo')"
                />
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
                {{ t('events.edit.sections.schedule') }}
              </h2>
            </div>

            <div class="space-y-6">
              <!-- Dates en ligne (si online ou hybrid) -->
              <div v-if="formData.participation_mode === 'online' || formData.participation_mode === 'hybrid'" class="space-y-4">
                <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                  </svg>
                  {{ t('events.edit.fields.onlineDates') }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t('events.create.fields.startDate') }}
                    </label>
                    <input
                      v-model="formData.online_start_datetime"
                      type="datetime-local"
                      :required="formData.participation_mode === 'online' || formData.participation_mode === 'hybrid'"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t('events.create.fields.endDate') }}
                    </label>
                    <input
                      v-model="formData.online_end_datetime"
                      type="datetime-local"
                      :required="formData.participation_mode === 'online' || formData.participation_mode === 'hybrid'"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Dates en présentiel (si in_person ou hybrid) -->
              <div v-if="formData.participation_mode === 'in_person' || formData.participation_mode === 'hybrid'" class="space-y-4">
                <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  {{ t('events.edit.fields.inPersonDates') }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t('events.create.fields.startDate') }}
                    </label>
                    <input
                      v-model="formData.in_person_start_date"
                      type="date"
                      :required="formData.participation_mode === 'in_person' || formData.participation_mode === 'hybrid'"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t('events.create.fields.endDate') }}
                    </label>
                    <input
                      v-model="formData.in_person_end_date"
                      type="date"
                      :required="formData.participation_mode === 'in_person' || formData.participation_mode === 'hybrid'"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <!-- Submission Deadline -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('events.create.fields.submissionDeadline') }}
                </label>
                <input
                  v-model="formData.submission_deadline"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div class="flex items-center mb-6">
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {{ t('events.edit.sections.status') }}
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Event Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('events.edit.fields.eventStatus') }}
                </label>
                <select
                  v-model="formData.event_status"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="upcoming">{{ t('events.status.upcoming') }}</option>
                  <option value="ongoing">{{ t('events.status.ongoing') }}</option>
                  <option value="completed">{{ t('events.status.completed') }}</option>
                  <option value="suspended">{{ t('events.status.suspended') }}</option>
                </select>
              </div>

              <!-- Submission Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('events.edit.fields.submissionStatus') }}
                </label>
                <select
                  v-model="formData.submission_status"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="open">{{ t('events.submission.open') }}</option>
                  <option value="closed">{{ t('events.submission.closed') }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Action Buttons - TOUJOURS VISIBLE -->
          <div class="flex justify-between items-center pt-8 mt-8 border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl">
            <button
              type="button"
              @click="goBack"
              class="px-8 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium text-lg"
            >
              {{ t('common.cancel') }}
            </button>

            <button
              type="submit"
              :disabled="isSubmitting || !canEdit"
              class="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-lg shadow-lg"
            >
              <span v-if="isSubmitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 012h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ t('events.edit.updating') }}
              </span>
              <span v-else>🔥 {{ t('events.edit.update') }} 🔥</span>
            </button>
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

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()
const authStore = useAuthStore()

// Reactive data
const isLoading = ref(true)
const isSubmitting = ref(false)
const isUploading = ref(false)
const error = ref(null)
const event = ref(null)
const countries = ref([])

// Form data
const formData = ref({
  title: '',
  acronym: '',
  description: '',
  year: new Date().getFullYear(),
  participation_mode: '',
  country_id: '',
  city: '',
  address: '',
  logo_url: '',
  // Bannières
  banner_high_quality_32_9_url: '',
  banner_high_quality_16_9_url: '',
  banner_high_quality_1_1_url: '',
  banner_low_quality_32_9_url: '',
  banner_low_quality_16_9_url: '',
  banner_low_quality_1_1_url: '',
  // Dates en ligne
  online_start_datetime: '',
  online_end_datetime: '',
  // Dates en présentiel
  in_person_start_date: '',
  in_person_end_date: '',
  // Statuts et deadline
  submission_deadline: '',
  event_status: 'upcoming',
  submission_status: 'open'
})

// Computed properties
const canEdit = computed(() => {
  if (!event.value || !authStore.user) return false
  
  // TEMPORAIRE: Permettre à tous les utilisateurs connectés de modifier les événements
  return true
  
  // ORIGINAL: Only admin and super_admin can edit events
  // return authStore.profile?.user_roles?.some(role => 
  //   ['admin', 'super_admin'].includes(role.role) && role.is_active
  // )
})

// Methods
const loadEvent = async () => {
  try {
    isLoading.value = true
    error.value = null

    const eventId = route.params.id
    
    // Load event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) throw eventError

    event.value = eventData
    
    // Populate form data
    formData.value = {
      title: eventData.title || '',
      acronym: eventData.acronym || '',
      description: eventData.description || '',
      year: eventData.year || new Date().getFullYear(),
      participation_mode: eventData.participation_mode || '',
      country_id: eventData.country_id || '',
      city: eventData.city || '',
      address: eventData.address || '',
      logo_url: eventData.logo_url || '',
      // Bannières
      banner_high_quality_32_9_url: eventData.banner_high_quality_32_9_url || '',
      banner_high_quality_16_9_url: eventData.banner_high_quality_16_9_url || '',
      banner_high_quality_1_1_url: eventData.banner_high_quality_1_1_url || '',
      banner_low_quality_32_9_url: eventData.banner_low_quality_32_9_url || '',
      banner_low_quality_16_9_url: eventData.banner_low_quality_16_9_url || '',
      banner_low_quality_1_1_url: eventData.banner_low_quality_1_1_url || '',
      // Dates en ligne
      online_start_datetime: eventData.online_start_datetime ? 
        new Date(eventData.online_start_datetime).toISOString().slice(0, 16) : '',
      online_end_datetime: eventData.online_end_datetime ? 
        new Date(eventData.online_end_datetime).toISOString().slice(0, 16) : '',
      // Dates en présentiel
      in_person_start_date: eventData.in_person_start_date ? 
        new Date(eventData.in_person_start_date).toISOString().slice(0, 10) : '',
      in_person_end_date: eventData.in_person_end_date ? 
        new Date(eventData.in_person_end_date).toISOString().slice(0, 10) : '',
      // Statuts et deadline
      submission_deadline: eventData.submission_deadline ? 
        new Date(eventData.submission_deadline).toISOString().slice(0, 16) : '',
      event_status: eventData.event_status || 'upcoming',
      submission_status: eventData.submission_status || 'open'
    }

  } catch (err) {
    console.error('Error loading event:', err)
    error.value = t('events.edit.error.loadFailed')
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

  try {
    isSubmitting.value = true
    error.value = null

    // Préparer les données selon le mode de participation
    const updateData = {
      title: formData.value.title,
      acronym: formData.value.acronym || null,
      description: formData.value.description,
      year: formData.value.year,
      participation_mode: formData.value.participation_mode,
      logo_url: formData.value.logo_url || null,
      // Bannières
      banner_high_quality_32_9_url: formData.value.banner_high_quality_32_9_url || null,
      banner_high_quality_16_9_url: formData.value.banner_high_quality_16_9_url || null,
      banner_high_quality_1_1_url: formData.value.banner_high_quality_1_1_url || null,
      banner_low_quality_32_9_url: formData.value.banner_low_quality_32_9_url || null,
      banner_low_quality_16_9_url: formData.value.banner_low_quality_16_9_url || null,
      banner_low_quality_1_1_url: formData.value.banner_low_quality_1_1_url || null,
      // Statuts
      event_status: formData.value.event_status,
      submission_status: formData.value.submission_status,
      submission_deadline: formData.value.submission_deadline ? 
        new Date(formData.value.submission_deadline).toISOString() : null,
      updated_at: new Date().toISOString()
    }
    
    // Gérer les données de localisation
    // Tous les champs de localisation sont requis selon le schéma de la BD
    updateData.country_id = formData.value.country_id // Obligatoire
    updateData.city = formData.value.city // Obligatoire
    updateData.address = formData.value.address // Obligatoire
    
    // Gérer les dates en présentiel selon le mode de participation
    if (formData.value.participation_mode === 'in_person' || formData.value.participation_mode === 'hybrid') {
      updateData.in_person_start_date = formData.value.in_person_start_date || null
      updateData.in_person_end_date = formData.value.in_person_end_date || null
    } else {
      // Pour les événements en ligne uniquement, pas de dates physiques
      updateData.in_person_start_date = null
      updateData.in_person_end_date = null
    }
    
    // Gérer les dates en ligne
    if (formData.value.participation_mode === 'online' || formData.value.participation_mode === 'hybrid') {
      updateData.online_start_datetime = formData.value.online_start_datetime ? 
        new Date(formData.value.online_start_datetime).toISOString() : null
      updateData.online_end_datetime = formData.value.online_end_datetime ? 
        new Date(formData.value.online_end_datetime).toISOString() : null
    } else {
      // Pour les événements en présentiel uniquement, mettre à null les dates en ligne
      updateData.online_start_datetime = null
      updateData.online_end_datetime = null
    }

    const { data: updateResult, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', event.value.id)
      .select()

    if (updateError) throw updateError

    // Update local event data
    event.value = { ...event.value, ...updateResult[0] }

    // Redirect to event detail page
    setTimeout(() => {
      router.push(`/events/${event.value.id}`)
    }, 500)

  } catch (err) {
    console.error('Error updating event:', err)
    error.value = t('events.edit.error.updateFailed') + ': ' + err.message
  } finally {
    isSubmitting.value = false
  }
}

const handleBannerFileChange = async (fileEvent) => {
  const file = fileEvent.target.files[0]
  if (!file) return

  // Check authentication
  if (!authStore.isAuthenticated) {
    error.value = 'Vous devez être connecté pour télécharger une bannière'
    return
  }

  // Validation du fichier
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    error.value = 'Le fichier est trop volumineux. Taille maximum : 10MB'
    return
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error.value = 'Type de fichier non supporté. Utilisez PNG, JPG ou WebP'
    return
  }

  try {
    isUploading.value = true
    error.value = null

    const eventId = route.params.id || event.value?.id || 'temp'
    // Generate unique filename for banner
    const fileExtension = file.name.split('.').pop().toLowerCase()
    const fileName = `banner/event-${eventId}-${Date.now()}.${fileExtension}`
    
    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('epavillonp')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('epavillonp')
      .getPublicUrl(fileName)

    if (!publicUrl) {
      throw new Error('Failed to get public URL')
    }

    // Update form data with main banner
    formData.value.banner_high_quality_32_9_url = publicUrl

  } catch (err) {
    console.error('Error uploading banner:', err)
    error.value = 'Erreur lors du téléchargement de la bannière : ' + err.message
  } finally {
    isUploading.value = false
    fileEvent.target.value = ''
  }
}

const handleLogoFileChange = async (fileEvent) => {
  const file = fileEvent.target.files[0]
  if (!file) return

  // Check authentication
  if (!authStore.isAuthenticated) {
    error.value = 'Vous devez être connecté pour télécharger un logo'
    return
  }

  // Validation du fichier
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    error.value = 'Le fichier est trop volumineux. Taille maximum : 5MB'
    return
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error.value = 'Type de fichier non supporté. Utilisez PNG, JPG, SVG ou WebP'
    return
  }

  try {
    isUploading.value = true
    error.value = null

    // Use route ID or event ID if available
    const eventId = route.params.id || event.value?.id || 'temp'
    const userId = authStore.user?.id || 'anonymous'
    
    // Generate unique filename with logo folder and user context
    const fileExtension = file.name.split('.').pop().toLowerCase()
    const fileName = `logo/event-${eventId}-${userId}-${Date.now()}.${fileExtension}`
    
    console.log('Uploading file:', fileName, 'User:', userId)
    
    // Upload to Supabase storage with explicit options
    const { error: uploadError } = await supabase.storage
      .from('epavillonp')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error details:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message || uploadError.error || 'Unknown error'}`)
    }

    console.log('Upload successful')

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('epavillonp')
      .getPublicUrl(fileName)

    if (!publicUrl) {
      throw new Error('Failed to get public URL')
    }

    console.log('Public URL:', publicUrl)

    // Update form data
    formData.value.logo_url = publicUrl

  } catch (err) {
    console.error('Error uploading logo:', err)
    if (err.message.includes('row-level security')) {
      error.value = 'Permissions insuffisantes pour télécharger le logo. Contactez un administrateur.'
    } else {
      error.value = 'Erreur lors du téléchargement du logo : ' + err.message
    }
  } finally {
    isUploading.value = false
    // Clear file input
    fileEvent.target.value = ''
  }
}

const goBack = () => {
  router.back()
}

// Lifecycle
onMounted(() => {
  loadEvent()
  loadCountries()
})
</script>