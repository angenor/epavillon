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
              <font-awesome-icon :icon="['fab', 'twitter']" class="w-6 h-6" />
            </a>
            <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
              <font-awesome-icon :icon="['fab', 'facebook']" class="w-6 h-6" />
            </a>
            <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
              <font-awesome-icon :icon="['fab', 'linkedin']" class="w-6 h-6" />
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