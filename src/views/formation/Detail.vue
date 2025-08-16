<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          {{ t('formations.detail.error.title') }}
        </h3>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          {{ t('formations.detail.error.notFound') }}
        </p>
        <div class="mt-6">
          <router-link
            to="/formations"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            {{ t('common.back') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="formation">
      <!-- Header avec bannière -->
      <div class="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <img 
          src="/images/example/event_banniere_par_defaut_16_9.jpeg"
          :alt="formation.title"
          class="w-full h-full object-cover"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        <!-- Breadcrumb -->
        <div class="absolute top-4 left-4 md:left-8">
          <nav class="flex items-center space-x-2 text-white/80 text-sm">
            <router-link to="/" class="hover:text-white">{{ t('common.home') }}</router-link>
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <router-link to="/formations" class="hover:text-white">{{ t('formations.title') }}</router-link>
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <span class="text-white">{{ formation.title }}</span>
          </nav>
        </div>
        
        <!-- Contenu du header -->
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div class="max-w-7xl mx-auto">
            <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <!-- Badges -->
                <div class="flex flex-wrap gap-2 mb-4">
                  <span :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    getCategoryBadgeClass(formation.category)
                  ]">
                    {{ t(`formations.categories.${formation.category}`) }}
                  </span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                    <svg v-if="formation.format === 'online'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                    </svg>
                    <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"/>
                    </svg>
                    {{ t(`formations.formats.${formation.format}`) }}
                  </span>
                  <span :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    getStatusBadgeClass()
                  ]">
                    {{ getStatusLabel() }}
                  </span>
                </div>
                
                <!-- Titre -->
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">
                  {{ formation.title }}
                </h1>
                
                <!-- Métadonnées -->
                <div class="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ formatDateRange(formation.start_date, formation.end_date) }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ calculateDuration(formation.start_date, formation.end_date) }}
                  </div>
                  <div v-if="formation.estimated_price" class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ formatPrice(formation.estimated_price) }}
                  </div>
                  <div v-else class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ t('formations.free') }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                    </svg>
                    {{ participantsCount }} {{ t('formations.participants') }}
                  </div>
                </div>
              </div>
              
              <!-- Actions principales -->
              <div class="flex flex-wrap gap-3">
                <!-- Actions pour non-inscrits -->
                <button
                  v-if="!isUserEnrolled && !canEditFormation"
                  @click="enrollInFormation"
                  class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  {{ t('formations.detail.enrollButton') }}
                </button>
                
                <!-- Actions pour participants -->
                <button
                  v-if="isUserEnrolled"
                  @click="continueFormation"
                  class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ t('formations.detail.continueButton') }}
                </button>
                
                <button
                  v-if="isUserEnrolled && userProgress?.percentage === 100"
                  @click="viewCertificate"
                  class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-yellow-600 rounded-lg shadow-lg hover:bg-yellow-700 hover:shadow-xl transition-all duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ t('formations.detail.viewCertificate') }}
                </button>
                
                <!-- Actions pour formateurs/admins -->
                <router-link
                  v-if="canEditFormation"
                  :to="`/formations/${formation.id}/edit`"
                  class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-orange-600 rounded-lg shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  {{ t('formations.detail.editButton') }}
                </router-link>
                
                <button
                  v-if="canEditFormation"
                  @click="manageParticipants"
                  class="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                  {{ t('formations.detail.manageParticipants') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Corps de la page -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Contenu principal (2/3) -->
          <div class="lg:col-span-2">
            <!-- Onglets -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div class="border-b border-gray-200 dark:border-gray-700">
                <nav class="flex -mb-px">
                  <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="[
                      'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    ]"
                  >
                    {{ tab.label }}
                  </button>
                </nav>
              </div>

              <!-- Contenu des onglets -->
              <div class="p-6">
                <!-- Onglet Vue d'ensemble -->
                <div v-if="activeTab === 'overview'" class="space-y-6">
                  <!-- Description -->
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {{ t('formations.detail.description') }}
                    </h3>
                    <div class="prose prose-green dark:prose-invert max-w-none" v-html="formation.description"></div>
                  </div>

                  <!-- Objectifs pédagogiques -->
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {{ t('formations.detail.objectives') }}
                    </h3>
                    <ul class="space-y-2">
                      <li v-for="(objective, index) in formation.objectives" :key="index" class="flex items-start">
                        <svg class="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-gray-700 dark:text-gray-300">{{ objective }}</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Public cible -->
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {{ t('formations.detail.targetAudience') }}
                    </h3>
                    <p class="text-gray-700 dark:text-gray-300">{{ formation.target_audience }}</p>
                  </div>

                  <!-- Méthodologie -->
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {{ t('formations.detail.methodology') }}
                    </h3>
                    <p class="text-gray-700 dark:text-gray-300">{{ formation.methodology }}</p>
                  </div>

                  <!-- Prérequis (si applicable) -->
                  <div v-if="formation.prerequisites">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {{ t('formations.detail.prerequisites') }}
                    </h3>
                    <p class="text-gray-700 dark:text-gray-300">{{ formation.prerequisites }}</p>
                  </div>
                </div>

                <!-- Onglet Programme -->
                <div v-if="activeTab === 'program'" class="space-y-4">
                  <div v-if="chapters.length === 0" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p class="mt-2 text-gray-500 dark:text-gray-400">
                      {{ t('formations.detail.noChapters') }}
                    </p>
                  </div>

                  <!-- Liste des chapitres -->
                  <div v-else class="space-y-4">
                    <div
                      v-for="chapter in chapters"
                      :key="chapter.id"
                      class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <button
                        @click="toggleChapter(chapter.id)"
                        class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
                      >
                        <div class="flex items-center space-x-3">
                          <span class="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-semibold">
                            {{ chapter.order }}
                          </span>
                          <div class="text-left">
                            <h4 class="font-medium text-gray-900 dark:text-white">{{ chapter.title }}</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                              {{ chapter.lessons?.length || 0 }} {{ t('formations.detail.lessons') }}
                            </p>
                          </div>
                        </div>
                        <svg
                          :class="[
                            'w-5 h-5 text-gray-400 transition-transform',
                            expandedChapters.includes(chapter.id) ? 'rotate-180' : ''
                          ]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                      </button>

                      <!-- Contenu du chapitre -->
                      <div v-if="expandedChapters.includes(chapter.id)" class="p-4 space-y-3">
                        <p v-if="chapter.description" class="text-gray-600 dark:text-gray-400 mb-4">
                          {{ chapter.description }}
                        </p>

                        <!-- Liste des leçons -->
                        <div v-if="chapter.lessons?.length" class="space-y-2">
                          <div
                            v-for="lesson in chapter.lessons"
                            :key="lesson.id"
                            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div class="flex items-center space-x-3">
                              <div v-if="isUserEnrolled" class="flex-shrink-0">
                                <input
                                  type="checkbox"
                                  :checked="lesson.completed"
                                  @change="toggleLessonCompletion(lesson.id)"
                                  class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                >
                              </div>
                              <svg v-if="lesson.type === 'video'" class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                              </svg>
                              <svg v-else class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                              </svg>
                              <span class="text-gray-900 dark:text-white">{{ lesson.title }}</span>
                            </div>
                            <span v-if="lesson.duration" class="text-sm text-gray-500 dark:text-gray-400">
                              {{ lesson.duration }} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Onglet Participants (si admin ou inscrit) -->
                <div v-if="activeTab === 'participants' && (canEditFormation || isUserEnrolled)" class="space-y-6">
                  <!-- Statistiques -->
                  <div class="grid grid-cols-3 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ participantsCount }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('formations.detail.totalParticipants') }}</div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ averageProgress }}%</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('formations.detail.averageProgress') }}</div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ completionRate }}%</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('formations.detail.completionRate') }}</div>
                    </div>
                  </div>

                  <!-- Liste des participants (admin seulement) -->
                  <div v-if="canEditFormation && participants.length > 0">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {{ t('formations.detail.participantsList') }}
                    </h3>
                    <div class="space-y-3">
                      <div
                        v-for="participant in participants"
                        :key="participant.id"
                        class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div class="flex items-center space-x-4">
                          <img
                            :src="participant.user.profile_photo_url || '/images/default-avatar.png'"
                            :alt="participant.user.first_name"
                            class="w-10 h-10 rounded-full"
                          >
                          <div>
                            <div class="font-medium text-gray-900 dark:text-white">
                              {{ participant.user.first_name }} {{ participant.user.last_name }}
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                              {{ t('formations.detail.enrolledOn') }} {{ formatDate(participant.enrolled_at) }}
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center space-x-4">
                          <div class="text-right">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">
                              {{ participant.progress }}%
                            </div>
                            <div class="w-20 bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                class="bg-green-600 h-2 rounded-full"
                                :style="{ width: `${participant.progress}%` }"
                              ></div>
                            </div>
                          </div>
                          <span
                            v-if="participant.certificate_obtained"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            {{ t('formations.detail.certified') }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Onglet Ressources -->
                <div v-if="activeTab === 'resources'" class="space-y-4">
                  <div v-if="resources.length === 0" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    <p class="mt-2 text-gray-500 dark:text-gray-400">
                      {{ t('formations.detail.noResources') }}
                    </p>
                  </div>

                  <div v-else class="space-y-3">
                    <div
                      v-for="resource in resources"
                      :key="resource.id"
                      class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div class="flex items-center space-x-3">
                        <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                        </svg>
                        <div>
                          <div class="font-medium text-gray-900 dark:text-white">{{ resource.title }}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">
                            {{ resource.type }} • {{ formatFileSize(resource.size) }}
                          </div>
                        </div>
                      </div>
                      <button
                        @click="downloadResource(resource)"
                        class="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                        </svg>
                        {{ t('formations.detail.download') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar (1/3) -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Widget de progression (pour participants) -->
            <div v-if="isUserEnrolled" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('formations.detail.yourProgress') }}
              </h3>
              
              <!-- Cercle de progression -->
              <div class="flex justify-center mb-6">
                <div class="relative">
                  <svg class="w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      stroke-width="8"
                      fill="none"
                      class="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      stroke-width="8"
                      fill="none"
                      :stroke-dasharray="`${2 * Math.PI * 56}`"
                      :stroke-dashoffset="`${2 * Math.PI * 56 * (1 - (userProgress?.percentage || 0) / 100)}`"
                      class="text-green-600 transform -rotate-90 origin-center transition-all duration-500"
                    />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ userProgress?.percentage || 0 }}%
                    </span>
                  </div>
                </div>
              </div>

              <!-- Statistiques -->
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('formations.detail.chaptersCompleted') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ userProgress?.chapters_completed || 0 }} / {{ chapters.length }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('formations.detail.totalTime') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ formatDuration(userProgress?.total_time || 0) }}
                  </span>
                </div>
                <div v-if="userProgress?.next_lesson" class="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ t('formations.detail.nextLesson') }}</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ userProgress.next_lesson }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Widget d'information -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('formations.detail.instructor') }}
              </h3>
              
              <div v-if="instructor" class="space-y-4">
                <div class="flex items-center space-x-4">
                  <img
                    :src="instructor.profile_photo_url || '/images/default-avatar.png'"
                    :alt="instructor.first_name"
                    class="w-16 h-16 rounded-full"
                  >
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ instructor.first_name }} {{ instructor.last_name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ t('formations.detail.trainer') }}
                    </div>
                  </div>
                </div>
                
                <p v-if="instructor.biography" class="text-sm text-gray-600 dark:text-gray-400">
                  {{ instructor.biography }}
                </p>
              </div>

              <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div class="flex items-center text-sm">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-gray-600 dark:text-gray-400">
                    {{ t('formations.detail.createdOn') }} {{ formatDate(formation.created_at) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions rapides -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('formations.detail.quickActions') }}
              </h3>
              
              <div class="space-y-3">
                <button
                  @click="downloadProgram"
                  class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  {{ t('formations.detail.downloadProgram') }}
                </button>
                
                <button
                  @click="shareFormation"
                  class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326"/>
                  </svg>
                  {{ t('formations.detail.share') }}
                </button>
                
                <button
                  @click="reportIssue"
                  class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ t('formations.detail.reportIssue') }}
                </button>
              </div>
            </div>
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
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { supabase } = useSupabase()

// État
const loading = ref(true)
const error = ref(false)
const formation = ref(null)
const chapters = ref([])
const participants = ref([])
const resources = ref([])
const instructor = ref(null)
const activeTab = ref('overview')
const expandedChapters = ref([])
const userProgress = ref(null)
const isUserEnrolled = ref(false)
const participantsCount = ref(0)
const averageProgress = ref(0)
const completionRate = ref(0)

// Onglets disponibles
const tabs = computed(() => {
  const baseTabs = [
    { id: 'overview', label: t('formations.detail.tabs.overview') },
    { id: 'program', label: t('formations.detail.tabs.program') }
  ]
  
  if (canEditFormation.value || isUserEnrolled.value) {
    baseTabs.push({ id: 'participants', label: t('formations.detail.tabs.participants') })
  }
  
  baseTabs.push({ id: 'resources', label: t('formations.detail.tabs.resources') })
  
  return baseTabs
})

// Permissions
const canEditFormation = computed(() => {
  if (!authStore.user || !formation.value) return false
  
  const profile = authStore.profile
  const isCreator = formation.value.created_by === authStore.user.id
  const isAdmin = profile?.user_roles?.some(r => ['admin', 'super_admin'].includes(r.role))
  
  return isCreator || isAdmin
})

// Méthodes
const loadFormation = async () => {
  try {
    loading.value = true
    const formationId = route.params.id
    
    // Charger la formation
    const { data: formationData, error: formationError } = await supabase
      .from('trainings')
      .select(`
        *,
        created_by_profile:users!created_by(
          id,
          first_name,
          last_name,
          profile_photo_url,
          biography
        )
      `)
      .eq('id', formationId)
      .single()
    
    if (formationError) throw formationError
    
    formation.value = formationData
    instructor.value = formationData.created_by_profile
    
    // Charger les chapitres (simulation)
    // TODO: Remplacer par une vraie requête quand la table sera créée
    chapters.value = [
      {
        id: '1',
        order: 1,
        title: 'Introduction aux concepts fondamentaux',
        description: 'Découvrez les bases essentielles pour bien démarrer',
        lessons: [
          { id: '1-1', title: 'Présentation générale', type: 'video', duration: 15, completed: false },
          { id: '1-2', title: 'Les objectifs de la formation', type: 'document', completed: false },
          { id: '1-3', title: 'Méthodologie de travail', type: 'video', duration: 20, completed: false }
        ]
      },
      {
        id: '2',
        order: 2,
        title: 'Approfondissement des concepts',
        description: 'Explorez les concepts avancés et leurs applications',
        lessons: [
          { id: '2-1', title: 'Analyse détaillée', type: 'document', completed: false },
          { id: '2-2', title: 'Études de cas pratiques', type: 'video', duration: 30, completed: false }
        ]
      }
    ]
    
    // Vérifier si l'utilisateur est inscrit
    if (authStore.user) {
      const { data: enrollment } = await supabase
        .from('training_participants')
        .select('*')
        .eq('training_id', formationId)
        .eq('user_id', authStore.user.id)
        .single()
      
      if (enrollment) {
        isUserEnrolled.value = true
        userProgress.value = {
          percentage: enrollment.progress_percentage || 0,
          chapters_completed: enrollment.chapters_completed || 0,
          total_time: enrollment.total_time_spent || 0,
          next_lesson: 'Chapitre 2 - Leçon 1'
        }
      }
    }
    
    // Charger les statistiques
    const { count } = await supabase
      .from('training_participants')
      .select('*', { count: 'exact', head: true })
      .eq('training_id', formationId)
    
    participantsCount.value = count || 0
    averageProgress.value = 65 // TODO: Calculer la vraie moyenne
    completionRate.value = 45 // TODO: Calculer le vrai taux
    
  } catch (err) {
    console.error('Erreur lors du chargement de la formation:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const toggleChapter = (chapterId) => {
  const index = expandedChapters.value.indexOf(chapterId)
  if (index > -1) {
    expandedChapters.value.splice(index, 1)
  } else {
    expandedChapters.value.push(chapterId)
  }
}

const enrollInFormation = async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }
  
  try {
    const { error } = await supabase
      .from('training_participants')
      .insert({
        training_id: formation.value.id,
        user_id: authStore.user.id
      })
    
    if (error) throw error
    
    isUserEnrolled.value = true
    participantsCount.value++
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err)
  }
}

const continueFormation = () => {
  // TODO: Naviguer vers la page de continuation
  console.log('Continuer la formation')
}

const viewCertificate = () => {
  // TODO: Afficher le certificat
  console.log('Voir le certificat')
}

const manageParticipants = () => {
  // TODO: Naviguer vers la gestion des participants
  console.log('Gérer les participants')
}

const toggleLessonCompletion = (lessonId) => {
  // TODO: Marquer la leçon comme complétée
  console.log('Toggle lesson:', lessonId)
}

const downloadResource = (resource) => {
  // TODO: Télécharger la ressource
  console.log('Download resource:', resource)
}

const downloadProgram = () => {
  // TODO: Télécharger le programme en PDF
  console.log('Download program')
}

const shareFormation = () => {
  // TODO: Partager la formation
  if (navigator.share) {
    navigator.share({
      title: formation.value.title,
      text: formation.value.description,
      url: window.location.href
    })
  }
}

const reportIssue = () => {
  // TODO: Signaler un problème
  console.log('Report issue')
}

// Utilitaires
const getCategoryBadgeClass = (category) => {
  const classes = {
    climate: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    biodiversity: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    desertification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    other: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
  }
  return classes[category] || classes.other
}

const getStatusBadgeClass = () => {
  const now = new Date()
  const startDate = new Date(formation.value.start_date)
  const endDate = new Date(formation.value.end_date)
  
  if (startDate > now) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
  } else if (endDate < now) {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
  } else {
    return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
  }
}

const getStatusLabel = () => {
  const now = new Date()
  const startDate = new Date(formation.value.start_date)
  const endDate = new Date(formation.value.end_date)
  
  if (startDate > now) {
    return t('formations.status.upcoming')
  } else if (endDate < now) {
    return t('formations.status.completed')
  } else {
    return t('formations.status.ongoing')
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return `${formatDate(start)} - ${formatDate(end)}`
}

const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return t('formations.duration.oneDay')
  if (diffDays < 7) return t('formations.duration.days', { count: diffDays })
  if (diffDays < 30) return t('formations.duration.weeks', { count: Math.ceil(diffDays / 7) })
  return t('formations.duration.months', { count: Math.ceil(diffDays / 30) })
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${mins}min`
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Lifecycle
onMounted(() => {
  loadFormation()
})
</script>