<template>
  <footer class="bg-gray-900 dark:bg-black text-white transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Logo et description -->
        <div class="lg:col-span-1">
          <img
            src="/logos/logo-ifdd-blanc.png"
            alt="Logo IFDD"
            class="h-12 w-auto mb-4"
          >
          <p class="text-gray-400 dark:text-gray-500 text-sm mb-4">
            {{ t('footer.description') }}
          </p>
        </div>

        <!-- Informations -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-white">{{ t('footer.informations') }}</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">{{ t('footer.aboutUs') }}</a>
            </li>
            <li>
              <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">{{ t('footer.news') }}</a>
            </li>
            <!-- <li>
              <router-link to="/formations" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">{{ t('footer.trainings') }}</router-link>
            </li> -->
            <li>
              <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">{{ t('footer.faq') }}</a>
            </li>
            <li>
              <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">{{ t('footer.statutes') }}</a>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-white">{{ t('footer.contact') }}</h3>
          <div class="space-y-3 text-sm">
            <div class="text-gray-400 dark:text-gray-500">
              <p>{{ t('footer.phone') }}: +1 418 692 5727</p>
              <p>{{ t('footer.fax') }}: +1 418 692 5644</p>
            </div>
          </div>
        </div>

        <!-- Réseaux sociaux et liens légaux -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-white">{{ t('footer.followUs') }}</h3>
          <div class="flex space-x-4 mb-6">
            <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
              <font-awesome-icon :icon="['fab', 'facebook']" class="w-6 h-6" />
            </a>
            <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
              <font-awesome-icon :icon="['fab', 'linkedin']" class="w-6 h-6" />
            </a>
            <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
              <font-awesome-icon :icon="['fab', 'twitter']" class="w-6 h-6" />
            </a>
            <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
              <font-awesome-icon :icon="['fab', 'youtube']" class="w-6 h-6" />
            </a>
          </div>

          <div class="space-y-2">
            <a href="#" class="block text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">{{ t('footer.termsOfUse') }}</a>
            <a href="#" class="block text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">{{ t('footer.privacyPolicy') }}</a>
          </div>
        </div>
      </div>

      <!-- Copyright et mentions -->
      <div class="mt-8 pt-8 border-t border-gray-800 dark:border-gray-900">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p class="text-gray-400 dark:text-gray-500 text-sm">
            {{ t('footer.copyright') }}
          </p>
          <p class="text-gray-500 dark:text-gray-600 text-xs">
            {{ t('footer.poweredBy') }}
          </p>
        </div>
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
