<template>
  <transition name="sidebar">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex">
      <!-- Overlay -->
      <div @click="closeSidebar" class="fixed inset-0 bg-black bg-opacity-50"></div>
      
      <!-- Sidebar -->
      <div class="relative flex flex-col w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 dark:border-gray-800/50">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-800/50">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <img
              src="/logos/logo-ifdd-court.svg"
              alt="Logo IFDD"
              class="h-8 w-auto dark:hidden"
            >
            <img
              src="/logos/logo-ifdd-blanc.png"
              alt="Logo IFDD"
              class="h-8 w-auto hidden dark:block"
            >
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Menu</h2>
          </div>
          <button @click="closeSidebar" class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200">
            <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
          </button>
        </div>

        <!-- Navigation principale -->
        <nav class="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
          
          <!-- Section Programmations -->
          <div class="space-y-2">
            <h3 class="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ t('nav.programmings') }}</h3>
            <router-link to="/programmations" @click="closeSidebar" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
              <font-awesome-icon :icon="['fas', 'calendar-alt']" class="w-5 h-5 text-gray-400 group-hover:text-ifdd-bleu transition-colors" />
              <span class="group-hover:text-ifdd-bleu transition-colors">{{ t('nav.programmings') }}</span>
            </router-link>
            <!-- Années récentes -->
            <div class="ml-8 space-y-1">
              <router-link
                v-for="year in availableYears.slice(0, 3)"
                :key="year"
                :to="`/programmations?year=${year}`"
                @click="closeSidebar"
                class="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-ifdd-bleu dark:hover:text-ifdd-bleu-clair rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200"
              >
                {{ year }}
              </router-link>
            </div>
          </div>

          <!-- Section Réseautage -->
          <div class="space-y-2">
            <h3 class="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ t('nav.networking') }}</h3>
            <router-link to="/community" @click="closeSidebar" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
              <font-awesome-icon :icon="['fas', 'users']" class="w-5 h-5 text-gray-400 group-hover:text-ifdd-bleu transition-colors" />
              <span class="group-hover:text-ifdd-bleu transition-colors">{{ t('nav.community') }}</span>
            </router-link>
            <router-link to="/directory" @click="closeSidebar" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
              <font-awesome-icon :icon="['fas', 'search']" class="w-5 h-5 text-gray-400 group-hover:text-ifdd-bleu transition-colors" />
              <span class="group-hover:text-ifdd-bleu transition-colors">{{ t('nav.directory') }}</span>
            </router-link>
            <router-link to="/organizations" @click="closeSidebar" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
              <font-awesome-icon :icon="['fas', 'building']" class="w-5 h-5 text-gray-400 group-hover:text-ifdd-bleu transition-colors" />
              <span class="group-hover:text-ifdd-bleu transition-colors">{{ t('nav.organizations') }}</span>
            </router-link>
          </div>

          <!-- Section Négociations -->
          <div class="space-y-2">
            <h3 class="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ t('nav.negotiations') }}</h3>
            <router-link to="/nego" @click="closeSidebar" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
              <font-awesome-icon :icon="['fas', 'handshake']" class="w-5 h-5 text-gray-400 group-hover:text-ifdd-bleu transition-colors" />
              <span class="group-hover:text-ifdd-bleu transition-colors">{{ t('nav.negotiations') }}</span>
            </router-link>
            <!-- Sous-catégories -->
            <div class="ml-8 space-y-1">
              <router-link to="/nego/climat" @click="closeSidebar" class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{{ t('nav.climate') }}</span>
              </router-link>
              <router-link to="/nego/biodiversite" @click="closeSidebar" class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{{ t('nav.biodiversity') }}</span>
              </router-link>
              <router-link to="/nego/desertification" @click="closeSidebar" class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{{ t('nav.desertification') }}</span>
              </router-link>
              <router-link to="/nego/climate_finance" @click="closeSidebar" class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200">
                <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>{{ t('nav.climate_finance') }}</span>
              </router-link>
            </div>
          </div>

          <!-- Section Profil -->
          <div class="space-y-2">
            <h3 class="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ t('sidebar.userMenu') }}</h3>
            <router-link v-if="authStore.isAuthenticated" to="/messages" @click="closeSidebar" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
              <font-awesome-icon :icon="['fas', 'envelope']" class="w-5 h-5 text-gray-400 group-hover:text-ifdd-bleu transition-colors" />
              <span class="group-hover:text-ifdd-bleu transition-colors">{{ t('common.messages') }}</span>
              <span class="ml-auto bg-ifdd-bleu text-white text-xs px-2 py-0.5 rounded-full">3</span>
            </router-link>
            <router-link v-if="authStore.isAuthenticated" to="/appointments" @click="closeSidebar" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
              <font-awesome-icon :icon="['fas', 'calendar']" class="w-5 h-5 text-gray-400 group-hover:text-ifdd-bleu transition-colors" />
              <span class="group-hover:text-ifdd-bleu transition-colors">{{ t('common.appointments') }}</span>
            </router-link>
            <router-link v-if="authStore.isAuthenticated" to="/profile" @click="closeSidebar" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
              <font-awesome-icon :icon="['fas', 'user']" class="w-5 h-5 text-gray-400 group-hover:text-ifdd-bleu transition-colors" />
              <span class="group-hover:text-ifdd-bleu transition-colors">{{ t('common.profile') }}</span>
            </router-link>
          </div>

        </nav>

        <!-- Footer avec actions utilisateur -->
        <div class="p-4 border-t border-gray-200/50 dark:border-gray-800/50 space-y-3">
          <!-- Changement de langue -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('common.language') }}</span>
            <div class="flex items-center space-x-2">
              <button
                @click="changeLanguage('fr')"
                class="px-2 py-1 text-xs rounded"
                :class="locale === 'fr' ? 'bg-ifdd-bleu text-white' : 'text-gray-500 hover:text-ifdd-bleu'"
              >
                FR
              </button>
              <button
                @click="changeLanguage('en')"
                class="px-2 py-1 text-xs rounded"
                :class="locale === 'en' ? 'bg-ifdd-bleu text-white' : 'text-gray-500 hover:text-ifdd-bleu'"
              >
                EN
              </button>
            </div>
          </div>
          
          <!-- Changement de thème -->
          <button
            @click="toggleTheme"
            class="flex items-center justify-between w-full px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
          >
            <span class="flex items-center space-x-3">
              <font-awesome-icon v-if="theme === 'light'" :icon="['fas', 'moon']" class="w-5 h-5 text-gray-400 group-hover:text-ifdd-bleu transition-colors" />
              <font-awesome-icon v-else :icon="['fas', 'sun']" class="w-5 h-5 text-gray-400 group-hover:text-ifdd-bleu transition-colors" />
              <span class="group-hover:text-ifdd-bleu transition-colors">
                {{ theme === 'light' ? t('common.darkMode') : t('common.lightMode') }}
              </span>
            </span>
          </button>

          <!-- Connexion/Déconnexion -->
          <div v-if="authStore.isAuthenticated">
            <button @click="handleLogout" class="flex items-center space-x-3 w-full px-4 py-3 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200">
              <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="w-5 h-5" />
              <span>{{ t('common.logout') }}</span>
            </button>
          </div>
          <div v-else class="space-y-2">
            <router-link to="/login" @click="closeSidebar" class="block w-full px-4 py-3 text-center text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
              {{ t('auth.login.title') }}
            </router-link>
            <router-link to="/register" @click="closeSidebar" class="block w-full px-4 py-3 text-center text-white bg-ifdd-bleu hover:bg-ifdd-bleu-fonce rounded-lg transition-all duration-200">
              {{ t('common.register') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { ref, onMounted } from 'vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Émissions
const emit = defineEmits(['close'])

// Composables
const { t, locale } = useI18n()
const { theme, toggleTheme } = useTheme()
const authStore = useAuthStore()
const router = useRouter()
const { supabase } = useSupabase()

// Refs
const availableYears = ref([])

// Méthodes
const closeSidebar = () => {
  emit('close')
}

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

const handleLogout = async () => {
  try {
    await authStore.signOut()
    closeSidebar()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
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

// Lifecycle
onMounted(() => {
  loadAvailableYears()
})
</script>

<style scoped>
.sidebar-enter-active, .sidebar-leave-active {
  transition: opacity 0.3s ease;
}

.sidebar-enter-active .relative, .sidebar-leave-active .relative {
  transition: transform 0.3s ease;
}

.sidebar-enter-from, .sidebar-leave-to {
  opacity: 0;
}

.sidebar-enter-from .relative, .sidebar-leave-to .relative {
  transform: translateX(100%);
}
</style>