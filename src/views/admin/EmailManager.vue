<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Simple Email Tab -->
      <div v-if="activeTab === 'simple'">
        <SimpleEmailSender :initialFilter="filterType" />
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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
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
    const route = useRoute()
    const activeTab = ref('simple')

    // Récupérer le paramètre de filtre depuis la route
    const filterType = computed(() => route.query.filter || null)

    return {
      activeTab,
      filterType,
      t
    }
  }
}
</script>
