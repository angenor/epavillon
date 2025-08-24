<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-negotiations">
    <!-- Header avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.negotiations.title') }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          {{ t('admin.negotiations.subtitle') }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <button @click="showCreateSessionModal = true" 
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          <svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          {{ t('admin.negotiations.createSession') }}
        </button>
        <button @click="showCreateDocumentModal = true" 
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
          <svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          {{ t('admin.negotiations.createDocument') }}
        </button>
      </div>
    </div>

    <!-- Onglets pour Sessions et Documents -->
    <div class="mb-8">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button @click="activeTab = 'sessions'"
                :class="[
                  'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'sessions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                ]">
          {{ t('admin.negotiations.sessions') }}
          <span class="ml-2 py-0.5 px-2 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
            {{ sessions.length }}
          </span>
        </button>
        <button @click="activeTab = 'documents'"
                :class="[
                  'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'documents'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                ]">
          {{ t('admin.negotiations.documents') }}
          <span class="ml-2 py-0.5 px-2 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
            {{ documents.length }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Filtres -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Recherche -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.search') }}
            </label>
            <input v-model="filters.search"
                   type="text"
                   :placeholder="t('admin.negotiations.searchPlaceholder')"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Filtre par catégorie -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.category') }}
            </label>
            <select v-model="filters.category"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.negotiations.allCategories') }}</option>
              <option value="climate">{{ t('admin.negotiations.categories.climate') }}</option>
              <option value="biodiversity">{{ t('admin.negotiations.categories.biodiversity') }}</option>
              <option value="desertification">{{ t('admin.negotiations.categories.desertification') }}</option>
            </select>
          </div>

          <!-- Bouton de réinitialisation -->
          <div class="flex items-end">
            <button @click="resetFilters"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
              {{ t('admin.negotiations.resetFilters') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu des onglets -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <!-- Sessions de négociation -->
      <div v-if="activeTab === 'sessions'">
        <div v-if="isLoading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-500 dark:text-gray-400">{{ t('admin.negotiations.loadingSessions') }}</p>
        </div>

        <div v-else-if="filteredSessions.length === 0" class="p-8 text-center">
          <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l6-6m0 6l-6-6"/>
          </svg>
          <p class="text-gray-500 dark:text-gray-400">{{ t('admin.negotiations.noSessions') }}</p>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.session') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.category') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.datetime') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.location') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.registrations') }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="session in paginatedSessions" :key="session.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <!-- Session -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="max-w-xs">
                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ session.title }}
                    </div>
                    <div v-if="session.description" class="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {{ session.description }}
                    </div>
                  </div>
                </td>

                <!-- Catégorie -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getCategoryClass(session.category)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ t(`admin.negotiations.categories.${session.category}`) }}
                  </span>
                </td>

                <!-- Date et heure -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div>{{ formatDateTime(session.start_datetime) }}</div>
                  <div class="text-xs text-gray-400">{{ t('admin.negotiations.to') }} {{ formatDateTime(session.end_datetime) }}</div>
                </td>

                <!-- Lieu -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ session.location || t('admin.negotiations.online') }}
                </td>

                <!-- Inscriptions -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ session.registration_count || 0 }}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button @click="viewSessionDetails(session.id)"
                            class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                      {{ t('admin.negotiations.viewDetails') }}
                    </button>
                    <button @click="editSession(session)"
                            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      {{ t('admin.negotiations.edit') }}
                    </button>
                    <button @click="deleteSession(session)"
                            class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      {{ t('admin.negotiations.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Documents de négociation -->
      <div v-else-if="activeTab === 'documents'">
        <div v-if="isLoading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p class="mt-4 text-gray-500 dark:text-gray-400">{{ t('admin.negotiations.loadingDocuments') }}</p>
        </div>

        <div v-else-if="filteredDocuments.length === 0" class="p-8 text-center">
          <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-gray-500 dark:text-gray-400">{{ t('admin.negotiations.noDocuments') }}</p>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.document') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.type') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.category') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.uploadedBy') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.createdAt') }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.negotiations.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="document in paginatedDocuments" :key="document.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <!-- Document -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img v-if="document.cover_image_url" 
                         :src="document.cover_image_url"
                         :alt="document.title"
                         class="h-10 w-10 rounded object-cover">
                    <div class="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center" v-else>
                      <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div class="ml-4 max-w-xs">
                      <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ document.title }}
                      </div>
                      <div v-if="document.description" class="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {{ document.description }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Type -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getDocumentTypeClass(document.document_type)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ t(`admin.negotiations.documentTypes.${document.document_type}`) }}
                  </span>
                </td>

                <!-- Catégorie -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getCategoryClass(document.category)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ t(`admin.negotiations.categories.${document.category}`) }}
                  </span>
                </td>

                <!-- Téléchargé par -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ document.uploader?.first_name }} {{ document.uploader?.last_name }}
                </td>

                <!-- Date de création -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(document.created_at) }}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <a :href="document.file_url" 
                       target="_blank"
                       class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                      {{ t('admin.negotiations.download') }}
                    </a>
                    <button @click="editDocument(document)"
                            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      {{ t('admin.negotiations.edit') }}
                    </button>
                    <button @click="deleteDocument(document)"
                            class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      {{ t('admin.negotiations.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="(activeTab === 'sessions' ? filteredSessions.length : filteredDocuments.length) > pageSize" 
           class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="previousPage" 
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50">
            {{ t('admin.negotiations.previous') }}
          </button>
          <button @click="nextPage" 
                  :disabled="currentPage === totalPages"
                  class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50">
            {{ t('admin.negotiations.next') }}
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              {{ t('admin.negotiations.showing') }}
              <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
              {{ t('admin.negotiations.to') }}
              <span class="font-medium">{{ Math.min(currentPage * pageSize, (activeTab === 'sessions' ? filteredSessions.length : filteredDocuments.length)) }}</span>
              {{ t('admin.negotiations.of') }}
              <span class="font-medium">{{ activeTab === 'sessions' ? filteredSessions.length : filteredDocuments.length }}</span>
              {{ t('admin.negotiations.results') }}
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="previousPage" 
                      :disabled="currentPage === 1"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 disabled:opacity-50">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button v-for="page in visiblePages" :key="page"
                      @click="goToPage(page)"
                      :class="[
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
                      ]">
                {{ page }}
              </button>
              <button @click="nextPage" 
                      :disabled="currentPage === totalPages"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 disabled:opacity-50">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création de session -->
    <div v-if="showCreateSessionModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ t('admin.negotiations.createSession') }}
          </h3>
          <button @click="showCreateSessionModal = false" 
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="createSession" class="space-y-4">
          <!-- Titre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.sessionTitle') }}
            </label>
            <input v-model="newSession.title"
                   type="text"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.description') }}
            </label>
            <textarea v-model="newSession.description"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
          </div>

          <!-- Catégorie -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.category') }}
            </label>
            <select v-model="newSession.category"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.negotiations.selectCategory') }}</option>
              <option value="climate">{{ t('admin.negotiations.categories.climate') }}</option>
              <option value="biodiversity">{{ t('admin.negotiations.categories.biodiversity') }}</option>
              <option value="desertification">{{ t('admin.negotiations.categories.desertification') }}</option>
            </select>
          </div>

          <!-- Type de réunion -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.meetingType') }}
            </label>
            <select v-model="newSession.meeting_type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.negotiations.selectMeetingType') }}</option>
              <option v-for="type in meetingTypes" :key="type.value" :value="type.value">
                {{ t(`admin.negotiations.meetingTypes.${type.value}`) }}
              </option>
            </select>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('admin.negotiations.startDateTime') }}
              </label>
              <input v-model="newSession.start_datetime"
                     type="datetime-local"
                     required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('admin.negotiations.endDateTime') }}
              </label>
              <input v-model="newSession.end_datetime"
                     type="datetime-local"
                     required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
          </div>

          <!-- Lieu -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.location') }} ({{ t('admin.negotiations.optional') }})
            </label>
            <input v-model="newSession.location"
                   type="text"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Lien externe -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.externalLink') }} ({{ t('admin.negotiations.optional') }})
            </label>
            <input v-model="newSession.external_link"
                   type="url"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Boutons -->
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button type="button" 
                    @click="showCreateSessionModal = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
              {{ t('admin.negotiations.cancel') }}
            </button>
            <button type="submit"
                    :disabled="isCreating"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
              {{ isCreating ? t('admin.negotiations.creating') : t('admin.negotiations.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de création de document -->
    <div v-if="showCreateDocumentModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ t('admin.negotiations.createDocument') }}
          </h3>
          <button @click="showCreateDocumentModal = false" 
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="createDocument" class="space-y-4">
          <!-- Titre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.documentTitle') }}
            </label>
            <input v-model="newDocument.title"
                   type="text"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.description') }}
            </label>
            <textarea v-model="newDocument.description"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
          </div>

          <!-- Type de document -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.documentType') }}
            </label>
            <select v-model="newDocument.document_type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.negotiations.selectDocumentType') }}</option>
              <option value="negotiation_guide">{{ t('admin.negotiations.documentTypes.negotiation_guide') }}</option>
              <option value="technical_note">{{ t('admin.negotiations.documentTypes.technical_note') }}</option>
              <option value="relevant_document">{{ t('admin.negotiations.documentTypes.relevant_document') }}</option>
              <option value="other">{{ t('admin.negotiations.documentTypes.other') }}</option>
            </select>
          </div>

          <!-- Catégorie -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.category') }}
            </label>
            <select v-model="newDocument.category"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ t('admin.negotiations.selectCategory') }}</option>
              <option value="climate">{{ t('admin.negotiations.categories.climate') }}</option>
              <option value="biodiversity">{{ t('admin.negotiations.categories.biodiversity') }}</option>
              <option value="desertification">{{ t('admin.negotiations.categories.desertification') }}</option>
            </select>
          </div>

          <!-- URL du fichier -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.fileUrl') }}
            </label>
            <input v-model="newDocument.file_url"
                   type="url"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Image de couverture -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('admin.negotiations.coverImage') }} ({{ t('admin.negotiations.optional') }})
            </label>
            <input v-model="newDocument.cover_image_url"
                   type="url"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <!-- Boutons -->
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button type="button" 
                    @click="showCreateDocumentModal = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
              {{ t('admin.negotiations.cancel') }}
            </button>
            <button type="submit"
                    :disabled="isCreating"
                    class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600">
              {{ isCreating ? t('admin.negotiations.creating') : t('admin.negotiations.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import { useNegotiations } from '@/composables/useNegotiations'

const { t } = useI18n()
const router = useRouter()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()
const { createSession: createSessionAPI, createDocument: createDocumentAPI, meetingTypes } = useNegotiations()

// État
const isLoading = ref(true)
const activeTab = ref('sessions')
const sessions = ref([])
const documents = ref([])
const currentPage = ref(1)
const pageSize = ref(20)

const filters = ref({
  search: '',
  category: ''
})

// Modals
const showCreateSessionModal = ref(false)
const showCreateDocumentModal = ref(false)
const isCreating = ref(false)

// Nouveaux objets
const newSession = ref({
  title: '',
  description: '',
  category: '',
  meeting_type: '',
  start_datetime: '',
  end_datetime: '',
  location: '',
  external_link: ''
})

const newDocument = ref({
  title: '',
  description: '',
  document_type: '',
  category: '',
  file_url: '',
  cover_image_url: ''
})

// Vérification des permissions
const checkAccess = async () => {
  await loadUserRoles()
  
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

// Computed
const filteredSessions = computed(() => {
  let filtered = sessions.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(session => 
      session.title?.toLowerCase().includes(search) ||
      session.description?.toLowerCase().includes(search) ||
      session.location?.toLowerCase().includes(search)
    )
  }

  if (filters.value.category) {
    filtered = filtered.filter(session => session.category === filters.value.category)
  }

  return filtered
})

const filteredDocuments = computed(() => {
  let filtered = documents.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(document => 
      document.title?.toLowerCase().includes(search) ||
      document.description?.toLowerCase().includes(search)
    )
  }

  if (filters.value.category) {
    filtered = filtered.filter(document => document.category === filters.value.category)
  }

  return filtered
})

const totalPages = computed(() => {
  const items = activeTab.value === 'sessions' ? filteredSessions.value : filteredDocuments.value
  return Math.ceil(items.length / pageSize.value)
})

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSessions.value.slice(start, end)
})

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDocuments.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Méthodes
const loadSessions = async () => {
  try {
    const { data, error } = await supabase
      .from('negotiation_sessions')
      .select(`
        id,
        title,
        description,
        start_datetime,
        end_datetime,
        location,
        category,
        is_ifdd_organized,
        external_link,
        created_at,
        created_by,
        creator:created_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('start_datetime', { ascending: false })

    if (error) throw error

    // Compter les inscriptions pour chaque session
    const sessionsWithRegistrations = await Promise.all(
      (data || []).map(async (session) => {
        const { count } = await supabase
          .from('session_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)
        
        return {
          ...session,
          registration_count: count || 0
        }
      })
    )

    sessions.value = sessionsWithRegistrations
  } catch (error) {
    console.error('Erreur lors du chargement des sessions:', error)
  }
}

const loadDocuments = async () => {
  try {
    const { data, error } = await supabase
      .from('negotiation_documents')
      .select(`
        id,
        title,
        document_type,
        category,
        description,
        cover_image_url,
        file_url,
        created_at,
        uploaded_by,
        uploader:uploaded_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    documents.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des documents:', error)
  }
}

const loadData = async () => {
  isLoading.value = true
  try {
    await Promise.all([loadSessions(), loadDocuments()])
  } finally {
    isLoading.value = false
  }
}

const getCategoryClass = (category) => {
  const classes = {
    climate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    biodiversity: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    desertification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }
  return classes[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const getDocumentTypeClass = (type) => {
  const classes = {
    negotiation_guide: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    technical_note: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    relevant_document: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[type] || classes.other
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const resetFilters = () => {
  filters.value = {
    search: '',
    category: ''
  }
  currentPage.value = 1
}

const viewSessionDetails = (sessionId) => {
  router.push({ name: 'admin-session-detail', params: { id: sessionId } })
}

const editSession = (session) => {
  // TODO: Implémenter l'édition de session
  console.log('Éditer session:', session.id)
}

const deleteSession = async (session) => {
  if (!confirm(t('admin.negotiations.confirmDeleteSession'))) {
    return
  }

  try {
    const { error } = await supabase
      .from('negotiation_sessions')
      .delete()
      .eq('id', session.id)

    if (error) throw error

    await loadSessions()
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error)
  }
}

const editDocument = (document) => {
  // TODO: Implémenter l'édition de document
  console.log('Éditer document:', document.id)
}

const deleteDocument = async (document) => {
  if (!confirm(t('admin.negotiations.confirmDeleteDocument'))) {
    return
  }

  try {
    const { error } = await supabase
      .from('negotiation_documents')
      .delete()
      .eq('id', document.id)

    if (error) throw error

    await loadDocuments()
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error)
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const createSession = async () => {
  if (!newSession.value.title || !newSession.value.category || !newSession.value.meeting_type || !newSession.value.start_datetime || !newSession.value.end_datetime) {
    return
  }

  try {
    isCreating.value = true

    await createSessionAPI({
      title: newSession.value.title,
      description: newSession.value.description,
      category: newSession.value.category,
      meeting_type: newSession.value.meeting_type,
      start_datetime: newSession.value.start_datetime,
      end_datetime: newSession.value.end_datetime,
      location: newSession.value.location,
      external_link: newSession.value.external_link
    })

    // Recharger les sessions
    await loadSessions()

    // Réinitialiser le formulaire et fermer la modal
    newSession.value = {
      title: '',
      description: '',
      category: '',
      meeting_type: '',
      start_datetime: '',
      end_datetime: '',
      location: '',
      external_link: ''
    }
    showCreateSessionModal.value = false

  } catch (error) {
    console.error('Erreur lors de la création de la session:', error)
  } finally {
    isCreating.value = false
  }
}

const createDocument = async () => {
  if (!newDocument.value.title || !newDocument.value.document_type || !newDocument.value.category || !newDocument.value.file_url) {
    return
  }

  try {
    isCreating.value = true

    await createDocumentAPI({
      title: newDocument.value.title,
      description: newDocument.value.description,
      document_type: newDocument.value.document_type,
      category: newDocument.value.category,
      file_url: newDocument.value.file_url,
      cover_image_url: newDocument.value.cover_image_url
    })

    // Recharger les documents
    await loadDocuments()

    // Réinitialiser le formulaire et fermer la modal
    newDocument.value = {
      title: '',
      description: '',
      document_type: '',
      category: '',
      file_url: '',
      cover_image_url: ''
    }
    showCreateDocumentModal.value = false

  } catch (error) {
    console.error('Erreur lors de la création du document:', error)
  } finally {
    isCreating.value = false
  }
}

// Watchers
watch(() => filters.value, () => {
  currentPage.value = 1
}, { deep: true })

watch(activeTab, () => {
  currentPage.value = 1
})

// Cycle de vie
onMounted(async () => {
  try {
    await checkAccess()
    await loadData()
  } catch (error) {
    console.error('Erreur lors du chargement de la page des négociations:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>