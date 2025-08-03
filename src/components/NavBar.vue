<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex-shrink-0 group cursor-pointer">
          <!-- Logo pour le mode clair -->
          <img 
            src="/logos/logo-ifdd-court.svg" 
            alt="Logo IFDD" 
            class="h-10 w-auto dark:hidden transition-transform duration-300 group-hover:scale-105"
          >
          <!-- Logo pour le mode sombre -->
          <img 
            src="/logos/logo-ifdd-blanc.png" 
            alt="Logo IFDD" 
            class="h-10 w-auto hidden dark:block transition-transform duration-300 group-hover:scale-105"
          >
        </div>

        <!-- Navigation principale -->
        <div class="hidden md:flex items-center space-x-1">
          <!-- Menu Programmation -->
          <div class="relative group">
            <button class="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-ifdd-bleu dark:hover:text-ifdd-bleu-clair font-medium flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
              <span>{{ t('nav.programming') }}</span>
              <svg class="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="absolute left-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top-left">
              <div class="p-2">
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">2024</a>
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">2023</a>
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">2022</a>
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">2021</a>
              </div>
            </div>
          </div>

          <!-- Menu Réseautage -->
          <div class="relative group">
            <button class="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-ifdd-bleu dark:hover:text-ifdd-bleu-clair font-medium flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
              <span>{{ t('nav.networking') }}</span>
              <svg class="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="absolute left-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top-left">
              <div class="p-2">
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.community') }}</a>
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.organizations') }}</a>
              </div>
            </div>
          </div>

          <!-- Menu Négociations -->
          <div class="relative group">
            <button class="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-ifdd-bleu dark:hover:text-ifdd-bleu-clair font-medium flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
              <span>{{ t('nav.negotiations') }}</span>
              <svg class="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="absolute left-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top-left">
              <div class="p-2">
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.climate') }}</a>
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.biodiversity') }}</a>
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:translate-x-1">{{ t('nav.desertification') }}</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu utilisateur -->
        <div class="flex items-center space-x-2">
          <!-- Language Selector -->
          <div class="relative">
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

          <!-- Notifications -->
          <button class="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          <!-- Bouton de changement de thème -->
          <button 
            @click="toggleTheme" 
            class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            :title="theme === 'light' ? t('common.darkMode') : t('common.lightMode')"
          >
            <svg v-if="theme === 'light'" class="w-5 h-5 transition-transform duration-300 hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-5 h-5 transition-transform duration-300 hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          <!-- Menu utilisateur dropdown -->
          <div class="relative group">
            <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
              <div class="w-8 h-8 bg-gradient-to-br from-ifdd-bleu to-ifdd-bleu-clair rounded-full flex items-center justify-center text-white font-medium shadow-md group-hover:shadow-lg transition-all duration-300">
                U
              </div>
              <svg class="w-4 h-4 text-gray-500 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top-right">
              <div class="p-2">
                <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('user.username') }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('user.email') }}</p>
                </div>
                <a href="#" class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group/item">
                  <svg class="w-4 h-4 mr-3 text-gray-400 group-hover/item:text-ifdd-bleu transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ t('common.messages') }}
                  <span class="ml-auto bg-ifdd-bleu text-white text-xs px-2 py-0.5 rounded-full">3</span>
                </a>
                <a href="#" class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group/item">
                  <svg class="w-4 h-4 mr-3 text-gray-400 group-hover/item:text-ifdd-bleu transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ t('common.appointments') }}
                </a>
                <a href="#" class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group/item">
                  <svg class="w-4 h-4 mr-3 text-gray-400 group-hover/item:text-ifdd-bleu transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ t('common.profile') }}
                </a>
                <a href="#" class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group/item">
                  <svg class="w-4 h-4 mr-3 text-gray-400 group-hover/item:text-ifdd-bleu transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ t('common.settings') }}
                </a>
                <div class="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                <a href="#" class="flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group/item">
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {{ t('common.logout') }}
                </a>
              </div>
            </div>
          </div>

          <!-- Bouton menu mobile -->
          <button @click="toggleSidebar" class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useTheme } from '@/composables/useTheme'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

export default {
  name: 'NavBar',
  setup() {
    const { theme, toggleTheme } = useTheme()
    const { t, locale } = useI18n()
    const showLanguageMenu = ref(false)
    
    const changeLanguage = (lang) => {
      locale.value = lang
      localStorage.setItem('locale', lang)
      showLanguageMenu.value = false
    }
    
    return {
      theme,
      toggleTheme,
      t,
      locale,
      showLanguageMenu,
      changeLanguage
    }
  },
  methods: {
    toggleSidebar() {
      this.$emit('toggle-sidebar')
    }
  }
}
</script>