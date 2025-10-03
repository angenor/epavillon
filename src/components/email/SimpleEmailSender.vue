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

    <!-- Recipients Section -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('email.recipients') }}
      </label>

      <!-- To Recipients -->
      <div class="mb-3">
        <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          {{ t('email.to') }} ({{ t('email.to_description') }})
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
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('email.select_activity') }}
        </label>
        <select
          v-model="emailData.activity_id"
          :disabled="!emailData.event_id || activities.length === 0"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <option value="">{{ t('email.no_activity') }}</option>
          <option v-for="activity in activities" :key="activity.id" :value="activity.id">
            {{ activity.name }}
          </option>
        </select>
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
import { ref, computed, watch, onMounted } from 'vue'
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
  faSpinner
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
  faSpinner
)

export default {
  name: 'SimpleEmailSender',
  components: {
    FontAwesomeIcon,
    EmailAutocompleteInput
  },
  setup() {
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
      subject: '',
      content: '',
      event_id: '',
      activity_id: ''
    })

    const recipients = ref({
      to: [],
      cc: [],
      bcc: []
    })

    // Events and Activities state
    const events = ref([])
    const activities = ref([])

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
          name: activity.title + (activity.activity_type ? ` (${activity.activity_type})` : '')
        }))

        console.log('Activités formatées:', activities.value)
      } catch (err) {
        console.error('Erreur lors du chargement des activités:', err)
        activities.value = []
      }
    }

    const onEventChange = () => {
      emailData.value.activity_id = ''
      fetchActivities(emailData.value.event_id)
    }

    const loadTemplate = (template) => {
      emailData.value.subject = template.subject
      emailData.value.content = template.content
      showTemplates.value = false
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
      reset()
      showPreview.value = false
      showTemplates.value = false
      showVariables.value = false
    }

    // Load events on mount
    onMounted(() => {
      fetchEvents()
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

      // Computed
      canSend,
      previewContent,
      previewSubject,

      // Données
      availableVariables,
      emailTemplates,

      // Méthodes
      loadTemplate,
      insertVariable,
      sendEmail,
      resetForm,
      onEventChange,

      // i18n
      t
    }
  }
}
</script>