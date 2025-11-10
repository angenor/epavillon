<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('email.send_email') }}
      </h2>
      <div class="flex space-x-2">
        <button
          v-if="emailTemplates.length > 0"
          @click="showTemplates = !showTemplates"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
        >
          <font-awesome-icon icon="file-alt" class="mr-2" />
          {{ t('email.templates') }}
        </button>
        <button
          @click="showPreview = !showPreview"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
        >
          <font-awesome-icon icon="eye" class="mr-2" />
          {{ t('email.preview') }}
        </button>
      </div>
    </div>

    <!-- Templates Selection -->
    <div v-if="showTemplates" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        {{ t('email.select_template') }}
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          v-for="template in emailTemplates"
          :key="template.id"
          @click="loadTemplate(template)"
          class="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors text-sm"
        >
          {{ template.name }}
        </button>
      </div>
    </div>

    <!-- Quick Add Recipients Buttons -->
    <div v-if="emailData.event_id || emailData.activity_id" class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('email.quick_add_recipients') || 'Ajout rapide de destinataires' }}
      </label>

      <!-- Destination Selection (Radio buttons) -->
      <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('email.select_destination') || 'Sélectionner la destination des emails groupés' }}:
        </p>
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="bulkDestination"
              value="to"
              class="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ t('email.to') }} ({{ t('email.to_description') }})
            </span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="bulkDestination"
              value="cc"
              class="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ t('email.cc') }} ({{ t('email.cc_description') }})
            </span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="bulkDestination"
              value="bcc"
              class="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ t('email.bcc') }} ({{ t('email.bcc_description') }})
            </span>
          </label>
        </div>
      </div>

      <!-- Event Recipients -->
      <div v-if="emailData.event_id" class="mb-3">
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
          {{ t('email.event_coordinators') || 'Tous les coordonnateurs de l\'événement' }}{{ selectedEventTitle ? ` (${selectedEventTitle})` : '' }}:
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            @click="toggleEventParticipants()"
            :disabled="loadingEventParticipants || !bulkDestination"
            :class="[
              'px-3 py-1 text-xs rounded cursor-pointer transition-colors',
              isEventParticipantsAdded
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-blue-500 text-white hover:bg-blue-600',
              'disabled:bg-gray-400 disabled:cursor-not-allowed'
            ]"
            :title="!bulkDestination ? t('email.select_destination_first') || 'Sélectionnez d\'abord une destination' : ''"
          >
            <font-awesome-icon :icon="isEventParticipantsAdded ? 'user-minus' : 'user-plus'" class="mr-1" />
            {{ isEventParticipantsAdded ? t('email.remove_all_event_participants') || 'Retirer tous les participants' : t('email.add_all_event_participants') || 'Ajouter tous les participants' }}
          </button>
        </div>
      </div>

      <!-- Activity Recipients -->
      <div v-if="emailData.activity_id" class="mb-3">
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
          {{ t('email.activity_participants') || 'Participants de l\'activité' }}{{ selectedActivityTitle ? ` (${selectedActivityTitle})` : '' }}:
        </p>
        <div class="flex flex-wrap gap-2">
          <!-- Submitter -->
          <button
            @click="toggleActivitySubmitter()"
            :disabled="loadingActivityData || !bulkDestination"
            :class="[
              'px-3 py-1 text-xs rounded cursor-pointer transition-colors',
              isActivitySubmitterAdded
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-purple-500 text-white hover:bg-purple-600',
              'disabled:bg-gray-400 disabled:cursor-not-allowed'
            ]"
            :title="!bulkDestination ? t('email.select_destination_first') || 'Sélectionnez d\'abord une destination' : t('email.submitter_tooltip') || 'Ajouter/Retirer le soumissionnaire de l\'activité'"
          >
            <font-awesome-icon :icon="isActivitySubmitterAdded ? 'minus' : 'user-tie'" class="mr-1" />
            {{ isActivitySubmitterAdded ? t('email.remove_submitter') || 'Retirer' : t('email.submitter') || 'Soumissionnaire' }}
          </button>

          <!-- Speakers/Panelists -->
          <button
            @click="toggleActivitySpeakers()"
            :disabled="loadingActivityData || !bulkDestination"
            :class="[
              'px-3 py-1 text-xs rounded cursor-pointer transition-colors',
              isActivitySpeakersAdded
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-indigo-500 text-white hover:bg-indigo-600',
              'disabled:bg-gray-400 disabled:cursor-not-allowed'
            ]"
            :title="!bulkDestination ? t('email.select_destination_first') || 'Sélectionnez d\'abord une destination' : t('email.speakers_tooltip') || 'Ajouter/Retirer tous les panélistes/intervenants'"
          >
            <font-awesome-icon :icon="isActivitySpeakersAdded ? 'minus' : 'users'" class="mr-1" />
            {{ isActivitySpeakersAdded ? t('email.remove_speakers') || 'Retirer' : t('email.speakers') || 'Panélistes' }}
          </button>

          <!-- Registered participants -->
          <button
            @click="toggleActivityRegistrants()"
            :disabled="loadingActivityData || !bulkDestination"
            :class="[
              'px-3 py-1 text-xs rounded cursor-pointer transition-colors',
              isActivityRegistrantsAdded
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-teal-500 text-white hover:bg-teal-600',
              'disabled:bg-gray-400 disabled:cursor-not-allowed'
            ]"
            :title="!bulkDestination ? t('email.select_destination_first') || 'Sélectionnez d\'abord une destination' : t('email.registrants_tooltip') || 'Ajouter/Retirer tous les inscrits à l\'activité'"
          >
            <font-awesome-icon :icon="isActivityRegistrantsAdded ? 'minus' : 'user-check'" class="mr-1" />
            {{ isActivityRegistrantsAdded ? t('email.remove_registrants') || 'Retirer' : t('email.registrants') || 'Inscrits' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Recipients Section -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('email.recipients') }}
      </label>

      <!-- To Recipients -->
      <div class="mb-3">
        <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          {{ t('email.to') }} ({{ t('email.to_description') }})
          <span v-if="recipients.to.length > 0" class="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
            {{ recipients.to.length }}
          </span>
        </label>
        <EmailAutocompleteInput
          v-model="recipients.to"
          :placeholder="t('email.add_recipient_placeholder')"
        />
      </div>

      <!-- CC Recipients -->
      <div class="mb-3">
        <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          {{ t('email.cc') }} ({{ t('email.cc_description') }})
          <span v-if="recipients.cc.length > 0" class="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
            {{ recipients.cc.length }}
          </span>
        </label>
        <EmailAutocompleteInput
          v-model="recipients.cc"
          :placeholder="t('email.add_cc_placeholder')"
        />
      </div>

      <!-- BCC Recipients -->
      <div class="mb-3">
        <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          {{ t('email.bcc') }} ({{ t('email.bcc_description') }})
          <span v-if="recipients.bcc.length > 0" class="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
            {{ recipients.bcc.length }}
          </span>
        </label>
        <EmailAutocompleteInput
          v-model="recipients.bcc"
          :placeholder="t('email.add_bcc_placeholder')"
        />
      </div>
    </div>

    <!-- Event and Activity Selection -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Event Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('email.select_event') }}
        </label>
        <select
          v-model="emailData.event_id"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="onEventChange"
        >
          <option value="">{{ t('email.no_event') }}</option>
          <option v-for="event in events" :key="event.id" :value="event.id">
            {{ event.name }}
          </option>
        </select>
      </div>

      <!-- Activity Selection -->
      <div class="relative">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('email.select_activity') }}
        </label>

        <!-- Searchable dropdown -->
        <div class="relative activity-dropdown-container">
          <!-- Input avec icône dropdown -->
          <div class="relative">
            <input
              v-model="activitySearchQuery"
              @input="filterActivities"
              @focus="openActivityDropdown"
              @keydown.down.prevent="navigateDown"
              @keydown.up.prevent="navigateUp"
              @keydown.enter.prevent="selectHighlighted"
              @keydown.escape="closeActivityDropdown"
              :disabled="!emailData.event_id || activities.length === 0"
              :placeholder="selectedActivity ? selectedActivity.name : (t('email.search_activity_placeholder') || 'Rechercher ou sélectionner une activité...')"
              class="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            />

            <!-- Icône dropdown -->
            <button
              type="button"
              @click="toggleActivityDropdown"
              :disabled="!emailData.event_id || activities.length === 0"
              class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer disabled:cursor-not-allowed"
            >
              <font-awesome-icon
                :icon="showActivityDropdown ? 'chevron-up' : 'chevron-down'"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              />
            </button>
          </div>

          <!-- Dropdown des activités -->
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showActivityDropdown && (filteredActivities.length > 0 || !activitySearchQuery)"
              class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <!-- Option "Aucune activité" -->
              <div
                @click="clearActivity"
                class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm border-b border-gray-200 dark:border-gray-600"
                :class="{ 'bg-blue-50 dark:bg-blue-900': !emailData.activity_id }"
              >
                <div class="text-gray-500 dark:text-gray-400 italic">{{ t('email.no_activity') || 'Aucune activité' }}</div>
              </div>

              <!-- Liste des activités -->
              <div
                v-for="(activity, index) in displayedActivities"
                :key="activity.id"
                @click="selectActivity(activity)"
                @mouseenter="highlightedIndex = index"
                class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
                :class="{
                  'bg-blue-50 dark:bg-blue-900': emailData.activity_id === activity.id,
                  'bg-gray-100 dark:bg-gray-600': highlightedIndex === index
                }"
              >
                <div class="text-gray-900 dark:text-white">{{ activity.name }}</div>
                <div v-if="activity.type" class="text-xs text-gray-500 dark:text-gray-400">Type: {{ activity.type }}</div>
              </div>

              <!-- Message si aucun résultat -->
              <div v-if="activitySearchQuery && filteredActivities.length === 0" class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                Aucune activité trouvée
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Subject -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('email.subject') }}
      </label>
      <input
        v-model="emailData.subject"
        type="text"
        :placeholder="t('email.subject_placeholder')"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <!-- Content -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('email.content') }}
        </label>
        <button
          @click="showVariables = !showVariables"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          <font-awesome-icon icon="code" class="mr-1" />
          {{ t('email.show_variables') }}
        </button>
      </div>

      <!-- Variables Help -->
      <div v-if="showVariables" class="mb-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <p class="text-sm text-blue-800 dark:text-blue-200 mb-2">
          {{ t('email.variables_help') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <code
            v-for="variable in availableVariables"
            :key="variable.key"
            @click="insertVariable(variable.key)"
            class="px-2 py-1 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 text-xs"
            :title="variable.description"
          >
            {{ variable.key }}
          </code>
        </div>
      </div>

      <textarea
        v-model="emailData.content"
        :placeholder="t('email.content_placeholder')"
        rows="10"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      ></textarea>
    </div>

    <!-- Preview -->
    <div v-if="showPreview" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        {{ t('email.preview_title') }}
      </h3>
      <div class="bg-white dark:bg-gray-800 p-4 rounded border border-gray-300 dark:border-gray-600">
        <div class="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>{{ t('email.subject') }}:</strong> {{ previewSubject }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>{{ t('email.to') }}:</strong> {{ recipients.to.join(', ') || '-' }}
          </p>
          <p v-if="recipients.cc.length > 0" class="text-sm text-gray-600 dark:text-gray-400">
            <strong>{{ t('email.cc') }}:</strong> {{ recipients.cc.join(', ') }}
          </p>
          <p v-if="recipients.bcc.length > 0" class="text-sm text-gray-600 dark:text-gray-400">
            <strong>{{ t('email.bcc') }}:</strong> {{ recipients.bcc.join(', ') }}
          </p>
        </div>
        <div class="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{{ previewContent }}</div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-red-800 dark:text-red-200">
        <font-awesome-icon icon="exclamation-triangle" class="mr-2" />
        {{ error }}
      </p>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
      <p class="text-green-800 dark:text-green-200">
        <font-awesome-icon icon="check-circle" class="mr-2" />
        {{ t('email.send_success') }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="resetForm"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 cursor-pointer transition-colors"
        >
          <font-awesome-icon icon="redo" class="mr-2" />
          {{ t('email.reset') }}
        </button>
      </div>

      <button
        @click="sendEmail"
        :disabled="loading || !canSend"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <span v-if="loading" class="flex items-center">
          <font-awesome-icon icon="spinner" class="animate-spin mr-2" />
          {{ t('email.sending') }} ({{ sendingProgress }}%)
        </span>
        <span v-else>
          <font-awesome-icon icon="paper-plane" class="mr-2" />
          {{ t('email.send') }}
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmailSender } from '@/composables/useEmailSender'
import { useSupabase } from '@/composables/useSupabase'
import EmailAutocompleteInput from '@/components/EmailAutocompleteInput.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFileAlt,
  faEye,
  faTimes,
  faPlus,
  faCode,
  faExclamationTriangle,
  faCheckCircle,
  faRedo,
  faPaperPlane,
  faSpinner,
  faSearch,
  faList,
  faChevronUp,
  faChevronDown,
  faUserPlus,
  faUserTie,
  faUsers,
  faUserCheck,
  faUserMinus,
  faMinus
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Ajouter les icônes à la bibliothèque
library.add(
  faFileAlt,
  faEye,
  faTimes,
  faPlus,
  faCode,
  faExclamationTriangle,
  faCheckCircle,
  faRedo,
  faPaperPlane,
  faSpinner,
  faSearch,
  faList,
  faChevronUp,
  faChevronDown,
  faUserPlus,
  faUserTie,
  faUsers,
  faUserCheck,
  faUserMinus,
  faMinus
)

export default {
  name: 'SimpleEmailSender',
  components: {
    FontAwesomeIcon,
    EmailAutocompleteInput
  },
  props: {
    initialRecipients: {
      type: Object,
      default: () => ({ to: [], cc: [], bcc: [] })
    },
    initialEvent: {
      type: String,
      default: null
    },
    initialActivity: {
      type: String,
      default: null
    },
    initialFilter: {
      type: String,
      default: null
    },
    initialSubject: {
      type: String,
      default: null
    },
    initialContent: {
      type: String,
      default: null
    }
  },
  emits: ['email-sent'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const { supabase } = useSupabase()
    const {
      loading,
      error,
      success,
      sendingProgress,
      availableVariables,
      emailTemplates,
      validateEmail,
      sendSimpleEmail,
      previewEmail,
      reset
    } = useEmailSender()

    // État local
    const showTemplates = ref(false)
    const showPreview = ref(false)
    const showVariables = ref(false)

    const emailData = ref({
      subject: props.initialSubject || '',
      content: props.initialContent || '',
      event_id: props.initialEvent || '',
      activity_id: props.initialActivity || ''
    })

    const recipients = ref({
      to: props.initialRecipients?.to || [],
      cc: props.initialRecipients?.cc || [],
      bcc: props.initialRecipients?.bcc || []
    })

    // Events and Activities state
    const events = ref([])
    const activities = ref([])

    // Activity search state
    const activitySearchQuery = ref('')
    const showActivityDropdown = ref(false)
    const filteredActivities = ref([])
    const highlightedIndex = ref(-1)

    // Loading states for bulk actions
    const loadingEventParticipants = ref(false)
    const loadingActivityData = ref(false)
    const showActivityMenu = ref(null)
    const bulkDestination = ref('to') // Default to 'to'

    // Track added email groups
    const addedGroups = ref({
      eventParticipants: { to: [], cc: [], bcc: [] },
      activitySubmitter: { to: [], cc: [], bcc: [] },
      activitySpeakers: { to: [], cc: [], bcc: [] },
      activityRegistrants: { to: [], cc: [], bcc: [] }
    })

    // Computed
    const canSend = computed(() => {
      const hasRecipients =
        recipients.value.to.length > 0 ||
        recipients.value.cc.length > 0 ||
        recipients.value.bcc.length > 0

      return hasRecipients && emailData.value.subject && emailData.value.content
    })

    const previewContent = computed(() => {
      return previewEmail(emailData.value.content)
    })

    const previewSubject = computed(() => {
      return previewEmail(emailData.value.subject)
    })

    const selectedActivity = computed(() => {
      if (!emailData.value.activity_id) return null
      return activities.value.find(a => a.id === emailData.value.activity_id)
    })

    const displayedActivities = computed(() => {
      return activitySearchQuery.value ? filteredActivities.value : activities.value
    })

    const selectedEventTitle = computed(() => {
      const event = events.value.find((e) => e.id === emailData.value.event_id)
      if (event && event.name) {
        // Extraire seulement le titre de l'événement (avant l'année et l'acronyme)
        const match = event.name.match(/^(.+?)(\s*\(\d{4}\))?(\s*-\s*.+)?$/)
        return match ? match[1] : event.name
      }
      return ''
    })

    const selectedActivityTitle = computed(() => {
      const activity = selectedActivity.value
      if (activity && activity.name) {
        // Extraire seulement le titre de l'activité (avant le type)
        const match = activity.name.match(/^(.+?)(\s*\(.+?\))?$/)
        return match ? match[1] : activity.name
      }
      return ''
    })

    // Check if groups are already added
    const isEventParticipantsAdded = computed(() => {
      return addedGroups.value.eventParticipants[bulkDestination.value].length > 0
    })

    const isActivitySubmitterAdded = computed(() => {
      return addedGroups.value.activitySubmitter[bulkDestination.value].length > 0
    })

    const isActivitySpeakersAdded = computed(() => {
      return addedGroups.value.activitySpeakers[bulkDestination.value].length > 0
    })

    const isActivityRegistrantsAdded = computed(() => {
      return addedGroups.value.activityRegistrants[bulkDestination.value].length > 0
    })

    // Methods

    const fetchEvents = async () => {
      try {
        console.log('Début du chargement des événements...')
        const { data, error } = await supabase
          .from('events')
          .select('id, title, year, acronym')
          .order('year', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur Supabase:', error)
          throw error
        }

        console.log('Événements chargés:', data)

        // Mapper les données pour avoir un format cohérent
        events.value = (data || []).map(event => ({
          id: event.id,
          name: event.title + (event.year ? ` (${event.year})` : '') + (event.acronym ? ` - ${event.acronym}` : '')
        }))

        console.log('Événements formatés:', events.value)
      } catch (err) {
        console.error('Erreur lors du chargement des événements:', err)
        events.value = []
      }
    }

    const fetchActivities = async (eventId) => {
      if (!eventId) {
        activities.value = []
        return
      }

      try {
        console.log('Chargement des activités pour l\'événement:', eventId)
        const { data, error } = await supabase
          .from('activities')
          .select('id, title, activity_type')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur Supabase activités:', error)
          throw error
        }

        console.log('Activités chargées:', data)

        // Mapper les données pour avoir un format cohérent
        activities.value = (data || []).map(activity => ({
          id: activity.id,
          name: activity.title + (activity.activity_type ? ` (${activity.activity_type})` : ''),
          type: activity.activity_type
        }))

        console.log('Activités formatées:', activities.value)
      } catch (err) {
        console.error('Erreur lors du chargement des activités:', err)
        activities.value = []
      }
    }

    const onEventChange = () => {
      emailData.value.activity_id = ''
      activitySearchQuery.value = ''
      filteredActivities.value = []
      highlightedIndex.value = -1
      fetchActivities(emailData.value.event_id)
    }

    // Méthodes pour la recherche d'activité
    const filterActivities = () => {
      const query = activitySearchQuery.value.toLowerCase().trim()

      if (!query) {
        filteredActivities.value = []
        highlightedIndex.value = -1
        return
      }

      filteredActivities.value = activities.value.filter(activity =>
        activity.name.toLowerCase().includes(query)
      )
      highlightedIndex.value = -1
    }

    const selectActivity = (activity) => {
      emailData.value.activity_id = activity.id
      activitySearchQuery.value = ''
      filteredActivities.value = []
      showActivityDropdown.value = false
      highlightedIndex.value = -1
    }

    const clearActivity = () => {
      emailData.value.activity_id = ''
      activitySearchQuery.value = ''
      filteredActivities.value = []
      showActivityDropdown.value = false
      highlightedIndex.value = -1
    }

    const openActivityDropdown = () => {
      showActivityDropdown.value = true
      if (!activitySearchQuery.value) {
        filteredActivities.value = []
      }
    }

    const closeActivityDropdown = () => {
      setTimeout(() => {
        showActivityDropdown.value = false
        highlightedIndex.value = -1
      }, 200)
    }

    const toggleActivityDropdown = () => {
      if (showActivityDropdown.value) {
        closeActivityDropdown()
      } else {
        openActivityDropdown()
      }
    }

    // Navigation au clavier
    const navigateDown = () => {
      const maxIndex = displayedActivities.value.length - 1
      if (highlightedIndex.value < maxIndex) {
        highlightedIndex.value++
      } else {
        highlightedIndex.value = 0
      }
    }

    const navigateUp = () => {
      const maxIndex = displayedActivities.value.length - 1
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--
      } else {
        highlightedIndex.value = maxIndex
      }
    }

    const selectHighlighted = () => {
      if (highlightedIndex.value >= 0 && highlightedIndex.value < displayedActivities.value.length) {
        selectActivity(displayedActivities.value[highlightedIndex.value])
      }
    }

    // Bulk recipient functions
    const toggleActivityMenu = (menu) => {
      if (showActivityMenu.value === menu) {
        showActivityMenu.value = null
      } else {
        showActivityMenu.value = menu
      }
    }

    const toggleEventParticipants = async () => {
      if (!emailData.value.event_id || !bulkDestination.value) return

      // Si déjà ajouté, retirer
      if (isEventParticipantsAdded.value) {
        removeEventParticipants()
      } else {
        await addEventParticipants()
      }
    }

    const addEventParticipants = async () => {
      if (!emailData.value.event_id || !bulkDestination.value) return

      const targetField = bulkDestination.value
      loadingEventParticipants.value = true
      try {
        // Récupérer tous les utilisateurs liés à l'événement
        // 1. Les soumissionnaires d'activités
        const { data: submitters, error: submittersError } = await supabase
          .from('activities')
          .select('submitted_by, users!submitted_by(email)')
          .eq('event_id', emailData.value.event_id)

        if (submittersError) throw submittersError

        // 2. Les inscrits à toutes les activités de l'événement
        const { data: allActivities, error: activitiesError } = await supabase
          .from('activities')
          .select('id')
          .eq('event_id', emailData.value.event_id)

        if (activitiesError) throw activitiesError

        let registrantEmails = []
        if (allActivities && allActivities.length > 0) {
          const activityIds = allActivities.map(a => a.id)
          const { data: registrants, error: registrantsError } = await supabase
            .from('activity_registrations')
            .select('user_id, users!inner(email)')
            .in('activity_id', activityIds)

          if (!registrantsError && registrants) {
            registrantEmails = registrants.map(r => r.users?.email).filter(Boolean)
          }
        }

        // 3. Les panélistes de toutes les activités
        let speakerEmails = []
        if (allActivities && allActivities.length > 0) {
          const activityIds = allActivities.map(a => a.id)
          const { data: speakers, error: speakersError } = await supabase
            .from('activity_speakers')
            .select('email')
            .in('activity_id', activityIds)

          if (!speakersError && speakers) {
            speakerEmails = speakers.map(s => s.email).filter(Boolean)
          }
        }

        // Combiner tous les emails
        const submitterEmails = submitters?.map(s => s.users?.email).filter(Boolean) || []
        const allEmails = [...submitterEmails, ...registrantEmails, ...speakerEmails]

        // Ajouter les emails uniques au champ cible
        const currentEmails = recipients.value[targetField] || []
        const uniqueEmails = [...new Set([...currentEmails, ...allEmails])]
        recipients.value[targetField] = uniqueEmails

        // Stocker les emails ajoutés pour pouvoir les retirer plus tard
        addedGroups.value.eventParticipants[targetField] = [...new Set(allEmails)]

        console.log(`Added ${uniqueEmails.length - currentEmails.length} event participants to ${targetField}`)
      } catch (err) {
        console.error('Erreur lors du chargement des participants:', err)
        error.value = 'Erreur lors du chargement des participants de l\'événement'
      } finally {
        loadingEventParticipants.value = false
      }
    }

    const removeEventParticipants = () => {
      const targetField = bulkDestination.value
      const emailsToRemove = addedGroups.value.eventParticipants[targetField]

      if (emailsToRemove.length > 0) {
        recipients.value[targetField] = recipients.value[targetField].filter(
          email => !emailsToRemove.includes(email)
        )
        addedGroups.value.eventParticipants[targetField] = []
        console.log(`Removed ${emailsToRemove.length} event participants from ${targetField}`)
      }
    }

    const toggleActivitySubmitter = async () => {
      if (!emailData.value.activity_id || !bulkDestination.value) return

      // Si déjà ajouté, retirer
      if (isActivitySubmitterAdded.value) {
        removeActivitySubmitter()
      } else {
        await addActivitySubmitter()
      }
    }

    const addActivitySubmitter = async () => {
      if (!emailData.value.activity_id || !bulkDestination.value) return

      const targetField = bulkDestination.value
      loadingActivityData.value = true
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('submitted_by, users!submitted_by(email, first_name, last_name)')
          .eq('id', emailData.value.activity_id)
          .single()

        if (error) throw error

        if (data?.users?.email) {
          const currentEmails = recipients.value[targetField] || []
          if (!currentEmails.includes(data.users.email)) {
            recipients.value[targetField] = [...currentEmails, data.users.email]
            // Stocker l'email ajouté
            addedGroups.value.activitySubmitter[targetField] = [data.users.email]
          }
          console.log(`Added submitter to ${targetField}`)
        }
      } catch (err) {
        console.error('Erreur lors du chargement du soumissionnaire:', err)
        error.value = 'Erreur lors du chargement du soumissionnaire'
      } finally {
        loadingActivityData.value = false
      }
    }

    const removeActivitySubmitter = () => {
      const targetField = bulkDestination.value
      const emailsToRemove = addedGroups.value.activitySubmitter[targetField]

      if (emailsToRemove.length > 0) {
        recipients.value[targetField] = recipients.value[targetField].filter(
          email => !emailsToRemove.includes(email)
        )
        addedGroups.value.activitySubmitter[targetField] = []
        console.log(`Removed submitter from ${targetField}`)
      }
    }

    const toggleActivitySpeakers = async () => {
      if (!emailData.value.activity_id || !bulkDestination.value) return

      // Si déjà ajouté, retirer
      if (isActivitySpeakersAdded.value) {
        removeActivitySpeakers()
      } else {
        await addActivitySpeakers()
      }
    }

    const addActivitySpeakers = async () => {
      if (!emailData.value.activity_id || !bulkDestination.value) return

      const targetField = bulkDestination.value
      loadingActivityData.value = true
      try {
        const { data, error } = await supabase
          .from('activity_speakers')
          .select('email')
          .eq('activity_id', emailData.value.activity_id)

        if (error) throw error

        const emails = data?.map(s => s.email).filter(Boolean) || []

        // Ajouter les emails uniques au champ cible
        const currentEmails = recipients.value[targetField] || []
        const uniqueEmails = [...new Set([...currentEmails, ...emails])]
        recipients.value[targetField] = uniqueEmails

        // Stocker les emails ajoutés
        addedGroups.value.activitySpeakers[targetField] = emails

        console.log(`Added ${emails.length} speakers to ${targetField}`)
      } catch (err) {
        console.error('Erreur lors du chargement des panélistes:', err)
        error.value = 'Erreur lors du chargement des panélistes'
      } finally {
        loadingActivityData.value = false
      }
    }

    const removeActivitySpeakers = () => {
      const targetField = bulkDestination.value
      const emailsToRemove = addedGroups.value.activitySpeakers[targetField]

      if (emailsToRemove.length > 0) {
        recipients.value[targetField] = recipients.value[targetField].filter(
          email => !emailsToRemove.includes(email)
        )
        addedGroups.value.activitySpeakers[targetField] = []
        console.log(`Removed ${emailsToRemove.length} speakers from ${targetField}`)
      }
    }

    const toggleActivityRegistrants = async () => {
      if (!emailData.value.activity_id || !bulkDestination.value) return

      // Si déjà ajouté, retirer
      if (isActivityRegistrantsAdded.value) {
        removeActivityRegistrants()
      } else {
        await addActivityRegistrants()
      }
    }

    const addActivityRegistrants = async () => {
      if (!emailData.value.activity_id || !bulkDestination.value) return

      const targetField = bulkDestination.value
      loadingActivityData.value = true
      try {
        const { data, error } = await supabase
          .from('activity_registrations')
          .select('user_id, users!inner(email)')
          .eq('activity_id', emailData.value.activity_id)

        if (error) throw error

        const emails = data?.map(r => r.users.email).filter(Boolean) || []

        // Ajouter les emails uniques au champ cible
        const currentEmails = recipients.value[targetField] || []
        const uniqueEmails = [...new Set([...currentEmails, ...emails])]
        recipients.value[targetField] = uniqueEmails

        // Stocker les emails ajoutés
        addedGroups.value.activityRegistrants[targetField] = emails

        console.log(`Added ${emails.length} registrants to ${targetField}`)
      } catch (err) {
        console.error('Erreur lors du chargement des inscrits:', err)
        error.value = 'Erreur lors du chargement des inscrits'
      } finally {
        loadingActivityData.value = false
      }
    }

    const removeActivityRegistrants = () => {
      const targetField = bulkDestination.value
      const emailsToRemove = addedGroups.value.activityRegistrants[targetField]

      if (emailsToRemove.length > 0) {
        recipients.value[targetField] = recipients.value[targetField].filter(
          email => !emailsToRemove.includes(email)
        )
        addedGroups.value.activityRegistrants[targetField] = []
        console.log(`Removed ${emailsToRemove.length} registrants from ${targetField}`)
      }
    }

    const loadTemplate = async (template) => {
      emailData.value.subject = template.subject
      emailData.value.content = template.content
      showTemplates.value = false

      // Cas spécial pour les templates "youth_day" et "sustainable_finance_day"
      // Remplacer uniquement le nom de l'organisation
      if ((template.id === 'youth_day' || template.id === 'sustainable_finance_day') && emailData.value.activity_id) {
        try {
          const { data: activityData, error: activityError } = await supabase
            .from('activities')
            .select('organization_id, organizations!inner(name)')
            .eq('id', emailData.value.activity_id)
            .single()

          if (!activityError && activityData) {
            let content = emailData.value.content
            const organizationName = activityData.organizations?.name || '….'
            content = content.replace('__ORGANIZATION_NAME__', organizationName)
            emailData.value.content = content
          }
        } catch (err) {
          console.error('Erreur lors du chargement de l\'organisation:', err)
        }
      }

      // Cas spécial pour le template "pavilion_confirmation"
      // Remplacer les placeholders par les vraies valeurs de l'activité si disponibles
      if (template.id === 'pavilion_confirmation' && emailData.value.activity_id && emailData.value.event_id) {
        try {
          // Récupérer le timezone et la ville de l'événement
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('timezone, city')
            .eq('id', emailData.value.event_id)
            .single()

          if (eventError) {
            console.error('Erreur lors de la récupération du timezone de l\'événement:', eventError)
            return
          }

          const eventTimezone = eventData?.timezone || 'UTC'
          const eventCity = eventData?.city || ''

          // Calculer l'offset GMT du timezone
          const getTimezoneOffset = (timezone) => {
            try {
              const now = new Date()
              const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                timeZoneName: 'longOffset'
              })
              const parts = formatter.formatToParts(now)
              const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || ''

              // Extraire l'offset (ex: "GMT-3" ou "GMT+5:30")
              const match = timeZoneName.match(/GMT([+-]\d{1,2}(?::\d{2})?)/)
              if (match) {
                return `(GMT ${match[1]})`
              }
              return '(GMT+0)'
            } catch (err) {
              console.error('Erreur lors du calcul de l\'offset GMT:', err)
              return '(GMT+0)'
            }
          }

          const timezoneOffset = getTimezoneOffset(eventTimezone)

          // Récupérer les dates de l'activité et le nom de l'organisation
          const { data: activityData, error: activityError } = await supabase
            .from('activities')
            .select('final_start_date, final_end_date, organization_id, organizations!inner(name)')
            .eq('id', emailData.value.activity_id)
            .single()

          if (!activityError && activityData) {
            let content = emailData.value.content

            // Remplacer le nom de l'organisation
            const organizationName = activityData.organizations?.name || '….'
            content = content.replace('__ORGANIZATION_NAME__', organizationName)

            // Remplacer la ville et le fuseau horaire
            content = content.replace('__EVENT_CITY__', eventCity)
            content = content.replace('__EVENT_TIMEZONE_OFFSET__', timezoneOffset)

            // Remplacer la date et les heures proposées
            if (activityData.final_start_date) {
              const finalStartDate = new Date(activityData.final_start_date)

              // Formater la date avec le fuseau horaire de l'événement
              const finalDate = finalStartDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: eventTimezone
              })

              // Formater l'heure de début avec le fuseau horaire de l'événement
              const startTime = finalStartDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: eventTimezone
              })

              content = content.replace('__ACTIVITY_FINAL_DATE__', finalDate)
              content = content.replace('__ACTIVITY_FINAL_START_TIME__', startTime)

              // Formater l'heure de fin si disponible
              if (activityData.final_end_date) {
                const finalEndDate = new Date(activityData.final_end_date)
                const endTime = finalEndDate.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: eventTimezone
                })
                content = content.replace('__ACTIVITY_FINAL_END_TIME__', endTime)
              } else {
                content = content.replace('__ACTIVITY_FINAL_END_TIME__', '….')
              }
            } else {
              // Si pas de final_start_date, laisser des points de suspension
              content = content.replace('__ACTIVITY_FINAL_DATE__', '….')
              content = content.replace('__ACTIVITY_FINAL_START_TIME__', '….')
              content = content.replace('__ACTIVITY_FINAL_END_TIME__', '….')
            }

            emailData.value.content = content
          }
        } catch (err) {
          console.error('Erreur lors du chargement des dates de l\'activité:', err)
        }
      }
    }

    const insertVariable = (variable) => {
      const textarea = document.querySelector('textarea')
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = emailData.value.content

      emailData.value.content = text.substring(0, start) + variable + text.substring(end)

      // Repositionner le curseur après la variable
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length
        textarea.focus()
      }, 0)
    }

    const sendEmail = async () => {
      const result = await sendSimpleEmail({
        subject: emailData.value.subject,
        content: emailData.value.content,
        recipients: {
          to: recipients.value.to,
          cc: recipients.value.cc,
          bcc: recipients.value.bcc
        },
        event_id: emailData.value.event_id || null,
        activity_id: emailData.value.activity_id || null
      })

      if (result.success) {
        // Émettre l'événement de succès
        emit('email-sent', {
          subject: emailData.value.subject,
          recipients: recipients.value,
          event_id: emailData.value.event_id,
          activity_id: emailData.value.activity_id
        })

        // Réinitialiser le formulaire après un envoi réussi
        setTimeout(() => {
          resetForm()
        }, 3000)
      }
    }

    const resetForm = () => {
      emailData.value = {
        subject: '',
        content: '',
        event_id: '',
        activity_id: ''
      }
      recipients.value = {
        to: [],
        cc: [],
        bcc: []
      }
      activities.value = []
      activitySearchQuery.value = ''
      filteredActivities.value = []
      showActivityDropdown.value = false
      highlightedIndex.value = -1
      reset()
      showPreview.value = false
      showTemplates.value = false
      showVariables.value = false
    }

    // Fonction pour charger les emails des soumissionnaires avec dates valides
    const loadValidDatesSubmitters = async () => {
      try {
        console.log('Chargement des soumissionnaires avec dates valides...')

        // Récupérer toutes les activités avec final_start_date et final_end_date définis
        const { data, error } = await supabase
          .from('activities')
          .select(`
            id,
            submitted_by,
            final_start_date,
            final_end_date,
            users!submitted_by(email, first_name, last_name)
          `)
          .not('final_start_date', 'is', null)
          .not('final_end_date', 'is', null)
          .eq('is_deleted', false)

        if (error) throw error

        // Extraire les emails uniques des soumissionnaires
        const submitterEmails = [...new Set(
          (data || [])
            .map(activity => activity.users?.email)
            .filter(Boolean)
        )]

        console.log(`${submitterEmails.length} soumissionnaires avec dates valides trouvés`)

        // Ajouter les emails dans le champ BCC
        recipients.value.bcc = submitterEmails

        // Mettre le bulkDestination sur 'bcc' par défaut
        bulkDestination.value = 'bcc'

      } catch (err) {
        console.error('Erreur lors du chargement des soumissionnaires avec dates valides:', err)
        error.value = 'Erreur lors du chargement des soumissionnaires avec dates valides'
      }
    }

    // Fonction pour charger les emails des coordinateurs dont les activités sont approuvées
    const loadApprovedActivitiesSubmitters = async () => {
      try {
        console.log('Chargement des coordinateurs avec activités approuvées...')

        // Récupérer toutes les activités avec validation_status = 'approved'
        const { data, error } = await supabase
          .from('activities')
          .select(`
            id,
            submitted_by,
            validation_status,
            users!submitted_by(email, first_name, last_name)
          `)
          .eq('validation_status', 'approved')
          .eq('is_deleted', false)

        if (error) throw error

        // Extraire les emails uniques des coordinateurs
        const submitterEmails = [...new Set(
          (data || [])
            .map(activity => activity.users?.email)
            .filter(Boolean)
        )]

        console.log(`${submitterEmails.length} coordinateurs avec activités approuvées trouvés`)

        // Ajouter les emails dans le champ BCC
        recipients.value.bcc = submitterEmails

        // Mettre le bulkDestination sur 'bcc' par défaut
        bulkDestination.value = 'bcc'

      } catch (err) {
        console.error('Erreur lors du chargement des coordinateurs avec activités approuvées:', err)
        error.value = 'Erreur lors du chargement des coordinateurs avec activités approuvées'
      }
    }

    // Fonction pour charger les emails des coordinateurs dont les activités sont en attente d'examen
    const loadUnderReviewActivitiesSubmitters = async () => {
      try {
        console.log('Chargement des coordinateurs avec activités en attente d\'examen...')

        // Récupérer toutes les activités avec validation_status = 'under_review'
        const { data, error } = await supabase
          .from('activities')
          .select(`
            id,
            submitted_by,
            validation_status,
            users!submitted_by(email, first_name, last_name)
          `)
          .eq('validation_status', 'under_review')
          .eq('is_deleted', false)

        if (error) throw error

        // Extraire les emails uniques des coordinateurs
        const submitterEmails = [...new Set(
          (data || [])
            .map(activity => activity.users?.email)
            .filter(Boolean)
        )]

        console.log(`${submitterEmails.length} coordinateurs avec activités en attente d'examen trouvés`)

        // Ajouter les emails dans le champ BCC
        recipients.value.bcc = submitterEmails

        // Mettre le bulkDestination sur 'bcc' par défaut
        bulkDestination.value = 'bcc'

      } catch (err) {
        console.error('Erreur lors du chargement des coordinateurs avec activités en attente d\'examen:', err)
        error.value = 'Erreur lors du chargement des coordinateurs avec activités en attente d\'examen'
      }
    }

    // Load events on mount
    onMounted(async () => {
      fetchEvents()

      // Si un événement initial est fourni, charger ses activités
      if (props.initialEvent) {
        fetchActivities(props.initialEvent)
      }

      // Si un filtre initial est fourni, appliquer le filtre
      if (props.initialFilter === 'valid-dates') {
        await loadValidDatesSubmitters()
      } else if (props.initialFilter === 'approved-activities') {
        await loadApprovedActivitiesSubmitters()
      } else if (props.initialFilter === 'under-review-activities') {
        await loadUnderReviewActivitiesSubmitters()
      }

      // Fermer le dropdown en cliquant en dehors
      const handleClickOutside = (event) => {
        const activityDropdown = document.querySelector('.activity-dropdown-container')
        if (activityDropdown && !activityDropdown.contains(event.target)) {
          showActivityDropdown.value = false
        }
      }

      document.addEventListener('click', handleClickOutside)

      // Cleanup
      onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside)
      })
    })

    return {
      // État
      loading,
      error,
      success,
      sendingProgress,
      showTemplates,
      showPreview,
      showVariables,
      emailData,
      recipients,
      events,
      activities,

      // Activity search
      activitySearchQuery,
      showActivityDropdown,
      filteredActivities,
      highlightedIndex,

      // Loading states
      loadingEventParticipants,
      loadingActivityData,
      showActivityMenu,
      bulkDestination,

      // Computed
      canSend,
      previewContent,
      previewSubject,
      selectedActivity,
      selectedEventTitle,
      selectedActivityTitle,
      displayedActivities,
      isEventParticipantsAdded,
      isActivitySubmitterAdded,
      isActivitySpeakersAdded,
      isActivityRegistrantsAdded,

      // Données
      availableVariables,
      emailTemplates,

      // Méthodes
      loadTemplate,
      insertVariable,
      sendEmail,
      resetForm,
      onEventChange,
      filterActivities,
      selectActivity,
      clearActivity,
      openActivityDropdown,
      closeActivityDropdown,
      toggleActivityDropdown,
      navigateDown,
      navigateUp,
      selectHighlighted,

      // Bulk recipient methods
      toggleActivityMenu,
      toggleEventParticipants,
      toggleActivitySubmitter,
      toggleActivitySpeakers,
      toggleActivityRegistrants,

      // i18n
      t
    }
  }
}
</script>