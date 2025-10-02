<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ t('email.email_manager') }}
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ t('email.email_manager_description') }}
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="activeTab = 'simple'"
              :class="[
                'px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors',
                activeTab === 'simple'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ t('email.simple_email') }}
            </button>
            <button
              @click="activeTab = 'event'"
              :class="[
                'px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors',
                activeTab === 'event'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
              disabled
              title="Disponible prochainement"
            >
              {{ t('email.event_email') }}
              <span class="ml-1 text-xs">(Bientôt)</span>
            </button>
            <button
              @click="activeTab = 'history'"
              :class="[
                'px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors',
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
              disabled
              title="Disponible prochainement"
            >
              {{ t('email.email_history') }}
              <span class="ml-1 text-xs">(Bientôt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Simple Email Tab -->
      <div v-if="activeTab === 'simple'">
        <SimpleEmailSender />
      </div>

      <!-- Event Email Tab (Future) -->
      <div v-if="activeTab === 'event'" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div class="text-center">
          <font-awesome-icon
            icon="calendar-alt"
            class="text-6xl text-gray-400 dark:text-gray-600 mb-4"
          />
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ t('email.event_email_coming_soon') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('email.event_email_coming_soon_description') }}
          </p>
        </div>
      </div>

      <!-- History Tab (Future) -->
      <div v-if="activeTab === 'history'" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div class="text-center">
          <font-awesome-icon
            icon="history"
            class="text-6xl text-gray-400 dark:text-gray-600 mb-4"
          />
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ t('email.history_coming_soon') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('email.history_coming_soon_description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SimpleEmailSender from '@/components/email/SimpleEmailSender.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCalendarAlt, faHistory } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Ajouter les icônes
library.add(faCalendarAlt, faHistory)

export default {
  name: 'EmailManager',
  components: {
    SimpleEmailSender,
    FontAwesomeIcon
  },
  setup() {
    const { t } = useI18n()
    const activeTab = ref('simple')

    return {
      activeTab,
      t
    }
  }
}
</script>