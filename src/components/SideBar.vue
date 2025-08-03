<template>
  <transition name="sidebar">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex">
      <!-- Overlay -->
      <div @click="closeSidebar" class="fixed inset-0 bg-black bg-opacity-50"></div>
      
      <!-- Sidebar -->
      <div class="relative flex flex-col w-80 bg-white dark:bg-gray-900 shadow-xl">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">{{ t('sidebar.userMenu') }}</h2>
          <button @click="closeSidebar" class="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <font-awesome-icon :icon="['fas', 'times']" class="w-6 h-6" />
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-2">
          <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <font-awesome-icon :icon="['fas', 'clipboard-list']" class="w-5 h-5" />
            <span>{{ t('sidebar.myActivities') }}</span>
          </a>

          <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <font-awesome-icon :icon="['fas', 'envelope']" class="w-5 h-5" />
            <span>{{ t('common.messages') }}</span>
          </a>

          <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <font-awesome-icon :icon="['fas', 'calendar']" class="w-5 h-5" />
            <span>{{ t('common.appointments') }}</span>
          </a>

          <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <font-awesome-icon :icon="['fas', 'user']" class="w-5 h-5" />
            <span>{{ t('common.profile') }}</span>
          </a>

          <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <font-awesome-icon :icon="['fas', 'cog']" class="w-5 h-5" />
            <span>{{ t('common.settings') }}</span>
          </a>
        </nav>

        <!-- Déconnexion -->
        <div class="p-4 border-t dark:border-gray-800">
          <button class="flex items-center space-x-3 w-full px-4 py-3 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="w-5 h-5" />
            <span>{{ t('common.logout') }}</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  name: 'SideBar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { t } = useI18n()
    return { t }
  },
  methods: {
    closeSidebar() {
      this.$emit('close')
    }
  }
}
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