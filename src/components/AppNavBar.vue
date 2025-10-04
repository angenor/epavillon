<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo et bouton sidebar -->
        <div class="flex items-center space-x-3">
          <!-- Bouton menu sidebar (toujours visible) -->
          <button @click="toggleSidebar" class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
            <font-awesome-icon :icon="['fas', 'bars']" class="w-6 h-6" />
          </button>

          <router-link to="/" class="flex-shrink-0 bg-white dark:bg-gray-300 rounded-md group cursor-pointer">
            <!-- Logo pour le mode clair -->
            <img
              src="/logos/logo-epavillon.png"
              alt="Logo IFDD"
              class="h-10 w-auto dark:hidden transition-transform duration-300 group-hover:scale-105"
            >
            <!-- Logo pour le mode sombre -->
            <img
              src="/logos/logo-epavillon.png"
              alt="Logo IFDD"
              class="h-10 w-auto hidden dark:block transition-transform duration-300 group-hover:scale-105"
            >
          </router-link>
        </div>

        <!-- Navigation principale -->
        <div class="hidden md:flex items-center space-x-1">
          <!-- Menu Programmation -->
          <div class="relative group">
            <router-link to="/programmations" class="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-ifdd-bleu dark:hover:text-ifdd-bleu-clair font-medium flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
              <span>{{ t('nav.programmings') }}</span>
              <font-awesome-icon :icon="['fas', 'chevron-down']" class="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </router-link>
            <div class="absolute left-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top-left">
              <div class="p-2">
                <router-link
                  v-for="year in availableYears"
                  :key="year"
                  :to="`/programmations?year=${year}`"
                  class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1"
                >
                  {{ year }}
                </router-link>
              </div>
            </div>
          </div>

          <!-- Menu Réseautage -->
          <div class="relative group">
            <button class="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-ifdd-bleu dark:hover:text-ifdd-bleu-clair font-medium flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
              <span>{{ t('nav.networking') }}</span>
              <font-awesome-icon :icon="['fas', 'chevron-down']" class="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </button>
            <div class="absolute left-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top-left">
              <div class="p-2">
                <router-link to="/community" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.community') }}</router-link>
                <router-link to="/directory" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.directory') }}</router-link>
                <router-link to="/organizations" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.organizations') }}</router-link>
              </div>
            </div>
          </div>

          <!-- Menu Négociations -->
          <div class="relative group">
            <router-link to="/nego" class="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-ifdd-bleu dark:hover:text-ifdd-bleu-clair font-medium flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
              <span>{{ t('nav.negotiations') }}</span>
              <font-awesome-icon :icon="['fas', 'chevron-down']" class="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </router-link>
            <div class="absolute left-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top-left">
              <div class="p-2">
                <router-link to="/nego/climat" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.climate') }}</router-link>
                <router-link to="/nego/biodiversite" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.biodiversity') }}</router-link>
                <router-link to="/nego/desertification" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.desertification') }}</router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu utilisateur -->
        <div class="flex items-center space-x-2">
          <!-- Language Selector -->
          <div class="relative" data-language-menu>
            <button
              @click="showLanguageMenu = !showLanguageMenu"
              class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 flex items-center space-x-1"
              :title="t('common.language')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span class="text-xs font-medium">{{ locale.toUpperCase() }}</span>
            </button>
            <div
              v-if="showLanguageMenu"
              @click="showLanguageMenu = false"
              class="absolute right-0 mt-2 w-32 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1"
            >
              <button
                @click="changeLanguage('fr')"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                :class="{ 'bg-gray-100 dark:bg-gray-700': locale === 'fr' }"
              >
                Français
              </button>
              <button
                @click="changeLanguage('en')"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                :class="{ 'bg-gray-100 dark:bg-gray-700': locale === 'en' }"
              >
                English
              </button>
            </div>
          </div>

          <!-- Email Modal Test (Super Admin Only) -->
          <button
            v-if="authStore.isAuthenticated && canSendEmails"
            @click="openEmailModal()"
            class="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
            :title="t('email.send_email') || 'Envoyer un email'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </button>

          <!-- Messagerie -->
          <!-- <router-link
            v-if="authStore.isAuthenticated"
            to="/messages"
            class="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            :title="t('messaging.title')"
          >
            <font-awesome-icon icon="comments" class="w-5 h-5" />

            <span
              v-if="false"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
            >
              3
            </span>
          </router-link> -->

          <!-- Notifications -->
          <NotificationDropdown v-if="authStore.isAuthenticated" />

          <!-- Bouton de changement de thème -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            :title="theme === 'light' ? t('common.darkMode') : t('common.lightMode')"
          >
            <font-awesome-icon v-if="theme === 'light'" :icon="['fas', 'moon']" class="w-5 h-5 transition-transform duration-300 hover:rotate-45" />
            <font-awesome-icon v-else :icon="['fas', 'sun']" class="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
          </button>

          <!-- Menu utilisateur dropdown -->
          <div v-if="authStore.isAuthenticated" class="relative" data-profile-menu>
            <button
              @click="showProfileDropdown = !showProfileDropdown"
              class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <div class="w-8 h-8 bg-ifdd-bleu rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                <!-- Photo de profil si disponible -->
                <img
                  v-if="authStore.profile?.profile_photo_thumbnail_url || authStore.profile?.profile_photo_url"
                  :src="authStore.profile?.profile_photo_thumbnail_url || authStore.profile?.profile_photo_url"
                  :alt="`${authStore.profile?.first_name} ${authStore.profile?.last_name}`"
                  class="w-full h-full object-cover"
                  @error="handlePhotoError"
                />
                <!-- Initiales si pas de photo -->
                <div
                  v-else
                  class="w-full h-full bg-gradient-to-br from-ifdd-bleu to-ifdd-bleu-clair flex items-center justify-center text-white font-medium"
                >
                  {{ authStore.userInitials || 'U' }}
                </div>
              </div>
              <font-awesome-icon
                :icon="['fas', 'chevron-down']"
                class="w-4 h-4 text-gray-500 transition-transform duration-300"
                :class="{ 'rotate-180': showProfileDropdown }"
              />
            </button>
            <div
              v-if="showProfileDropdown"
              class="absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-100 visible transform scale-100 transition-all duration-300 origin-top-right z-50"
            >
              <div class="p-2">
                <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <!-- Photo de profil grande -->
                      <img
                        v-if="authStore.profile?.profile_photo_url || authStore.profile?.profile_photo_thumbnail_url"
                        :src="authStore.profile?.profile_photo_url || authStore.profile?.profile_photo_thumbnail_url"
                        :alt="`${authStore.profile?.first_name} ${authStore.profile?.last_name}`"
                        class="w-full h-full object-cover"
                        @error="handlePhotoError"
                      />
                      <!-- Initiales si pas de photo -->
                      <div
                        v-else
                        class="w-full h-full bg-gradient-to-br from-ifdd-bleu to-ifdd-bleu-clair flex items-center justify-center text-white font-medium text-lg"
                      >
                        {{ authStore.userInitials || 'U' }}
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ authStore.profile?.first_name }} {{ authStore.profile?.last_name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ authStore.user?.email }}</p>
                    </div>
                  </div>
                </div>
                <!-- <router-link to="/messages" class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group/item">
                  <font-awesome-icon :icon="['fas', 'envelope']" class="w-4 h-4 mr-3 text-gray-400 group-hover/item:text-ifdd-bleu transition-colors" />
                  {{ t('common.messages') }}
                  <span class="ml-auto bg-ifdd-bleu text-white text-xs px-2 py-0.5 rounded-full">3</span>
                </router-link> -->
                <router-link to="/appointments" class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group/item">
                  <font-awesome-icon :icon="['fas', 'calendar']" class="w-4 h-4 mr-3 text-gray-400 group-hover/item:text-ifdd-bleu transition-colors" />
                  {{ t('common.appointments') }}
                </router-link>
                <router-link to="/events/dashboard" class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group/item">
                  <font-awesome-icon :icon="['fas', 'th-list']" class="w-4 h-4 mr-3 text-gray-400 group-hover/item:text-ifdd-bleu transition-colors" />
                  {{ t('events.myActivities') }}
                </router-link>
                <router-link v-if="authStore.isSuperAdmin" to="/admin" class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group/item">
                  <font-awesome-icon :icon="['fas', 'cogs']" class="w-4 h-4 mr-3 text-gray-400 group-hover/item:text-ifdd-bleu transition-colors" />
                  {{ t('common.administration') }}
                </router-link>
                <router-link to="/profile" class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group/item">
                  <font-awesome-icon :icon="['fas', 'user']" class="w-4 h-4 mr-3 text-gray-400 group-hover/item:text-ifdd-bleu transition-colors" />
                  {{ t('common.profile') }}
                </router-link>
                <div class="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                <button @click="handleLogout" class="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group/item">
                  <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="w-4 h-4 mr-3" />
                  {{ t('common.logout') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Bouton connexion si non connecté -->
          <div v-else>
            <router-link
              to="/login"
              class="px-4 py-2 text-sm font-medium text-white bg-ifdd-bleu hover:bg-ifdd-bleu-fonce rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {{ t('auth.login.submit') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import { useI18n } from 'vue-i18n'
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useEmailModal } from '@/composables/useEmailModal'
import NotificationDropdown from '@/components/notifications/NotificationDropdown.vue'

// Émission d'événements
const emit = defineEmits(['toggle-sidebar'])

// Composables
const { theme, toggleTheme } = useTheme()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const { supabase } = useSupabase()
const { openEmailModal, canSendEmails } = useEmailModal()

// Debug - vérifier le statut super_admin (à supprimer en production)
console.log('AuthStore isSuperAdmin:', authStore.isSuperAdmin)
console.log('AuthStore profile:', authStore.profile)
console.log('Can send emails:', canSendEmails.value)

// Refs
const showLanguageMenu = ref(false)
const showProfileDropdown = ref(false)
const availableYears = ref([])

// Méthodes
const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
  showLanguageMenu.value = false
}

const handleLogout = async () => {
  try {
    showProfileDropdown.value = false
    await authStore.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const handlePhotoError = (event) => {
  // Masquer l'image en cas d'erreur de chargement
  event.target.style.display = 'none'
}

const loadAvailableYears = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('year')
      .order('year', { ascending: false })

    if (!error && data) {
      const years = [...new Set(data.map(event => event.year))].sort((a, b) => b - a)
      availableYears.value = years.slice(0, 5) // Limiter à 5 années les plus récentes
    }
  } catch (error) {
    console.error('Error loading years:', error)
  }
}

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

// Gérer les clics en dehors du dropdown pour le fermer
const handleClickOutside = (event) => {
  // Fermer le dropdown de langue si ouvert
  const languageButton = event.target.closest('[data-language-menu]')
  if (!languageButton && showLanguageMenu.value) {
    showLanguageMenu.value = false
  }

  // Fermer le dropdown de profil si ouvert
  const profileButton = event.target.closest('[data-profile-menu]')
  if (!profileButton && showProfileDropdown.value) {
    showProfileDropdown.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadAvailableYears()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
