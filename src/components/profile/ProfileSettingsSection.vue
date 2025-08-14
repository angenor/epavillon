<template>
  <div class="space-y-8">
    <!-- Section Préférences d'Affichage -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="palette"
              class="w-5 h-5 text-blue-600 dark:text-blue-400"
            />
          </div>
          {{ t('profile.settings.displayPreferences.title') }}
        </h3>
      </div>
      <div class="p-6">
        <!-- Mode d'affichage -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {{ t('profile.settings.displayPreferences.displayMode') }}
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Mode Clair -->
              <label
                class="relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none"
                :class="[
                  displayMode === 'light'
                    ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                ]"
              >
                <input
                  v-model="displayMode"
                  type="radio"
                  value="light"
                  class="sr-only"
                  @change="updateDisplayMode"
                />
                <div class="flex flex-col items-center text-center">
                  <div class="w-8 h-8 rounded-full bg-yellow-400 mb-2 flex items-center justify-center">
                    <font-awesome-icon
                      icon="sun"
                      class="w-4 h-4 text-yellow-900"
                    />
                  </div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('profile.settings.displayPreferences.light') }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ t('profile.settings.displayPreferences.lightDesc') }}
                  </div>
                </div>
                <div
                  v-if="displayMode === 'light'"
                  class="absolute -inset-px rounded-lg border-2 border-blue-500 pointer-events-none"
                />
              </label>

              <!-- Mode Sombre -->
              <label
                class="relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none"
                :class="[
                  displayMode === 'dark'
                    ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                ]"
              >
                <input
                  v-model="displayMode"
                  type="radio"
                  value="dark"
                  class="sr-only"
                  @change="updateDisplayMode"
                />
                <div class="flex flex-col items-center text-center">
                  <div class="w-8 h-8 rounded-full bg-gray-800 mb-2 flex items-center justify-center">
                    <font-awesome-icon
                      icon="moon"
                      class="w-4 h-4 text-gray-300"
                    />
                  </div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('profile.settings.displayPreferences.dark') }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ t('profile.settings.displayPreferences.darkDesc') }}
                  </div>
                </div>
                <div
                  v-if="displayMode === 'dark'"
                  class="absolute -inset-px rounded-lg border-2 border-blue-500 pointer-events-none"
                />
              </label>

              <!-- Mode Auto -->
              <!-- <label
                class="relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none"
                :class="[
                  displayMode === 'auto'
                    ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                ]"
              >
                <input
                  v-model="displayMode"
                  type="radio"
                  value="auto"
                  class="sr-only"
                  @change="updateDisplayMode"
                />
                <div class="flex flex-col items-center text-center">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-gray-800 mb-2 flex items-center justify-center">
                    <font-awesome-icon
                      icon="circle-half-stroke"
                      class="w-4 h-4 text-white"
                    />
                  </div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('profile.settings.displayPreferences.auto') }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ t('profile.settings.displayPreferences.autoDesc') }}
                  </div>
                </div>
                <div
                  v-if="displayMode === 'auto'"
                  class="absolute -inset-px rounded-lg border-2 border-blue-500 pointer-events-none"
                />
              </label> -->
            </div>
          </div>

          <!-- Prévisualisation -->
          <div class="mt-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div class="flex items-center mb-2">
              <font-awesome-icon
                icon="eye"
                class="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2"
              />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('profile.settings.displayPreferences.preview') }}
              </span>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('profile.settings.displayPreferences.previewDesc') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Préférences de Notifications -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="bell"
              class="w-5 h-5 text-green-600 dark:text-green-400"
            />
          </div>
          {{ t('profile.settings.notifications.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div class="space-y-6">
          <!-- Configuration générale -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
              {{ t('profile.settings.notifications.generalConfig') }}
            </h4>
            <div class="space-y-4">
              <!-- Notifications par email -->
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('profile.settings.notifications.email') }}
                  </label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('profile.settings.notifications.emailDesc') }}
                  </p>
                </div>
                <button
                  @click="toggleNotification('email')"
                  type="button"
                  :class="[
                    notificationPreferences.email
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  ]"
                >
                  <span class="sr-only">{{ t('profile.settings.notifications.email') }}</span>
                  <span
                    :class="[
                      notificationPreferences.email ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    ]"
                  />
                </button>
              </div>

              <!-- Notifications push -->
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('profile.settings.notifications.push') }}
                  </label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('profile.settings.notifications.pushDesc') }}
                  </p>
                </div>
                <button
                  @click="toggleNotification('push')"
                  type="button"
                  :class="[
                    notificationPreferences.push
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  ]"
                >
                  <span class="sr-only">{{ t('profile.settings.notifications.push') }}</span>
                  <span
                    :class="[
                      notificationPreferences.push ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    ]"
                  />
                </button>
              </div>

              <!-- Alertes événements en direct -->
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('profile.settings.notifications.liveEvents') }}
                  </label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('profile.settings.notifications.liveEventsDesc') }}
                  </p>
                </div>
                <button
                  @click="toggleNotification('live_events')"
                  type="button"
                  :class="[
                    notificationPreferences.live_events
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  ]"
                >
                  <span class="sr-only">{{ t('profile.settings.notifications.liveEvents') }}</span>
                  <span
                    :class="[
                      notificationPreferences.live_events ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    ]"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Types de notifications -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
              {{ t('profile.settings.notifications.types') }}
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="notificationType in notificationTypes"
                :key="notificationType.key"
                class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div class="flex items-center">
                  <div class="p-2 rounded-lg mr-3" :class="notificationType.iconBg">
                    <font-awesome-icon
                      :icon="notificationType.icon"
                      class="w-4 h-4"
                      :class="notificationType.iconColor"
                    />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t(`profile.settings.notifications.${notificationType.key}`) }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ t(`profile.settings.notifications.${notificationType.key}Desc`) }}
                    </div>
                  </div>
                </div>
                <button
                  @click="toggleNotificationType(notificationType.key)"
                  type="button"
                  :class="[
                    notificationPreferences[notificationType.key]
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700',
                    'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  ]"
                >
                  <span class="sr-only">{{ t(`profile.settings.notifications.${notificationType.key}`) }}</span>
                  <span
                    :class="[
                      notificationPreferences[notificationType.key] ? 'translate-x-4' : 'translate-x-0',
                      'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    ]"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Confidentialité -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
            <font-awesome-icon
              icon="shield-alt"
              class="w-5 h-5 text-purple-600 dark:text-purple-400"
            />
          </div>
          {{ t('profile.settings.privacy.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div class="space-y-6">
          <!-- Visibilité du profil -->
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('profile.settings.privacy.profileVisibility') }}
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('profile.settings.privacy.profileVisibilityDesc') }}
              </p>
            </div>
            <button
              @click="togglePrivacySetting('networking_visibility')"
              type="button"
              :class="[
                privacySettings.networking_visibility
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700',
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              ]"
            >
              <span class="sr-only">{{ t('profile.settings.privacy.profileVisibility') }}</span>
              <span
                :class="[
                  privacySettings.networking_visibility ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                ]"
              />
            </button>
          </div>

          <!-- Bouton pour gérer les utilisateurs bloqués -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              @click="$emit('manage-blocked-users')"
              type="button"
              class="flex items-center justify-between w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="flex items-center">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                  <font-awesome-icon
                    icon="user-slash"
                    class="w-4 h-4 text-red-600 dark:text-red-400"
                  />
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('profile.settings.privacy.blockedUsers') }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('profile.settings.privacy.blockedUsersDesc') }}
                  </div>
                </div>
              </div>
              <font-awesome-icon
                icon="chevron-right"
                class="w-4 h-4 text-gray-400"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bouton de sauvegarde -->
    <div class="flex justify-end">
      <button
        @click="saveSettings"
        :disabled="saving"
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <font-awesome-icon
          v-if="saving"
          icon="spinner"
          class="animate-spin mr-2"
        />
        {{ saving ? t('common.saving') : t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const { theme, applyTheme } = useTheme()
const { success, error } = useToast()
const authStore = useAuthStore()
const userStore = useUserStore()

const emit = defineEmits(['manage-blocked-users'])

const saving = ref(false)
const displayMode = ref('light')

// Préférences de notifications (basé sur la structure de la base)
const notificationPreferences = reactive({
  email: true,
  push: true,
  live_events: true,
  activity_validation: true,
  connection_requests: true,
  messages_received: true,
  appointment_requests: true,
  training_reminders: true,
  event_reminders: true,
  system_announcements: true,
  newsletters: true
})

// Paramètres de confidentialité
const privacySettings = reactive({
  networking_visibility: true
})

// Types de notifications avec leurs icônes
const notificationTypes = [
  {
    key: 'activity_validation',
    icon: 'check-circle',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    key: 'connection_requests',
    icon: 'user-plus',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    key: 'messages_received',
    icon: 'envelope',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    key: 'appointment_requests',
    icon: 'calendar',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  {
    key: 'training_reminders',
    icon: 'graduation-cap',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    key: 'event_reminders',
    icon: 'bell',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    key: 'system_announcements',
    icon: 'bullhorn',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  {
    key: 'newsletters',
    icon: 'newspaper',
    iconBg: 'bg-gray-100 dark:bg-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400'
  }
]

// Méthodes
const updateDisplayMode = () => {
  applyTheme(displayMode.value)
}

const toggleNotification = (key) => {
  notificationPreferences[key] = !notificationPreferences[key]
}

const toggleNotificationType = (key) => {
  notificationPreferences[key] = !notificationPreferences[key]
}

const togglePrivacySetting = (key) => {
  privacySettings[key] = !privacySettings[key]
}

const saveSettings = async () => {
  saving.value = true
  try {
    // Construire les données à sauvegarder
    const updateData = {
      id: authStore.user?.id,
      display_mode: displayMode.value,
      notification_preferences: JSON.parse(JSON.stringify(notificationPreferences)), // Copie profonde pour JSONB
      networking_visibility: privacySettings.networking_visibility
    }

    console.log('Saving settings:', updateData) // Debug

    await userStore.updateProfile(updateData)
    
    // Recharger le profil pour refléter les changements
    await authStore.fetchProfile(authStore.user?.id)
    
    // Afficher le message de succès
    success(t('common.saveSuccess'))
    console.log('Settings saved successfully')
  } catch (err) {
    console.error('Error saving settings:', err)
    // Afficher le message d'erreur
    error(t('common.saveError'))
  } finally {
    saving.value = false
  }
}

// Initialiser les données depuis le profil utilisateur
const initializeSettings = () => {
  if (authStore.profile) {
    displayMode.value = authStore.profile.display_mode || 'light'
    
    // Initialiser les préférences de notifications avec les valeurs par défaut
    const defaultNotifications = {
      email: true,
      push: true,
      live_events: true,
      activity_validation: true,
      connection_requests: true,
      messages_received: true,
      appointment_requests: true,
      training_reminders: true,
      event_reminders: true,
      system_announcements: true,
      newsletters: true
    }
    
    // Fusionner les préférences existantes avec les valeurs par défaut
    if (authStore.profile.notification_preferences) {
      Object.assign(notificationPreferences, defaultNotifications, authStore.profile.notification_preferences)
    } else {
      Object.assign(notificationPreferences, defaultNotifications)
    }
    
    // Initialiser les paramètres de confidentialité
    privacySettings.networking_visibility = authStore.profile.networking_visibility ?? true
    
    console.log('Settings initialized:', {
      displayMode: displayMode.value,
      notifications: notificationPreferences,
      privacy: privacySettings
    }) // Debug
  }
}

// Watcher pour surveiller les changements du profil
watch(() => authStore.profile, () => {
  initializeSettings()
}, { immediate: true })

// Synchroniser avec le thème actuel
watch(() => theme.value, (newTheme) => {
  displayMode.value = newTheme
})

onMounted(() => {
  initializeSettings()
  displayMode.value = theme.value
})
</script>