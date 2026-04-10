<script setup>
import { RouterView, useRoute } from 'vue-router'
import AppNavBar from './components/AppNavBar.vue'
import SideBar from './components/SideBar.vue'
import FooterSection from './components/FooterSection.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import MaintenanceModal from './components/MaintenanceModal.vue'
import EmailManagerModal from './components/email/EmailManagerModal.vue'
import CommentNotificationPopup from './components/admin/CommentNotificationPopup.vue'

// import MessagingSystem from './components/messaging/MessagingSystem.vue'
import { ref, computed } from 'vue'
import { useVersionCheck } from './composables/useVersionCheck'

const { showUpdateModal, acceptUpdate, dismissUpdate } = useVersionCheck()

const sidebarOpen = ref(false)
const route = useRoute()

const isHomePage = computed(() => route.path === '/')

const handleToggleSidebar = () => {
  sidebarOpen.value = true
}

const handleCloseSidebar = () => {
  sidebarOpen.value = false
}
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
    <AppNavBar @toggle-sidebar="handleToggleSidebar" />
    <main :class="{ 'pt-16': !isHomePage }" class="flex-grow">
      <RouterView :sidebar-open="sidebarOpen" @update:sidebar-open="sidebarOpen = $event" />
    </main>
    <FooterSection />
    <SideBar :is-open="sidebarOpen" @close="handleCloseSidebar" />
    <ToastContainer />
    <EmailManagerModal />
    <CommentNotificationPopup />
    <!-- <MaintenanceModal /> -->
    <!-- <MessagingSystem /> -->

    <!-- Modal mise à jour disponible -->
    <Teleport to="body">
      <div v-if="showUpdateModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="dismissUpdate"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
          <div class="w-14 h-14 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <font-awesome-icon :icon="['fas', 'arrow-rotate-right']" class="text-green-600 dark:text-green-400 text-xl" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Mise à jour disponible
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Une nouvelle version de la plateforme est disponible avec des corrections et améliorations. Nous vous recommandons de mettre à jour maintenant.
          </p>
          <div class="flex gap-3">
            <button
              @click="dismissUpdate"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition cursor-pointer"
            >
              Plus tard
            </button>
            <button
              @click="acceptUpdate"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-xl transition cursor-pointer shadow-lg shadow-green-600/20"
            >
              Mettre à jour
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
#app {
  font-family: var(--font-family-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
