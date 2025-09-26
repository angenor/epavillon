<script setup>
import { RouterView, useRoute } from 'vue-router'
import AppNavBar from './components/AppNavBar.vue'
import SideBar from './components/SideBar.vue'
import FooterSection from './components/FooterSection.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import MaintenanceModal from './components/MaintenanceModal.vue'
// import MessagingSystem from './components/messaging/MessagingSystem.vue'
import { ref, computed } from 'vue'

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
    <MaintenanceModal />
    <!-- <MessagingSystem /> -->
  </div>
</template>

<style scoped>
#app {
  font-family: var(--font-family-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
