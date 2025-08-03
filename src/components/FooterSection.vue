<template>
  <footer class="bg-gray-900 dark:bg-black text-white transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Logo et description -->
        <div>
          <img 
            src="/logos/logo-ifdd-blanc.png" 
            alt="Logo IFDD" 
            class="h-12 w-auto mb-4"
          >
          <p class="text-gray-400 dark:text-gray-500 text-sm">
            {{ t('footer.description') }}
          </p>
        </div>

        <!-- Liens rapides -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-white">{{ t('footer.quickLinks') }}</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">{{ t('footer.legalNotice') }}</a>
            </li>
            <li>
              <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">{{ t('footer.privacyPolicy') }}</a>
            </li>
            <li>
              <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">{{ t('footer.contact') }}</a>
            </li>
            <li>
              <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">{{ t('footer.technicalSupport') }}</a>
            </li>
          </ul>
        </div>

        <!-- Réseaux sociaux -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-white">{{ t('footer.followUs') }}</h3>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-8 pt-8 border-t border-gray-800 dark:border-gray-900">
        <p class="text-center text-gray-400 dark:text-gray-500 text-sm">
          {{ t('footer.copyright') }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  name: 'FooterSection',
  setup() {
    const { t } = useI18n()
    return { t }
  }
}
</script>