<script setup>
import { RouterView, useRoute } from 'vue-router'
import AppNavBar from './components/AppNavBar.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { ref, computed } from 'vue'

const sidebarOpen = ref(false)
const route = useRoute()

const isHomePage = computed(() => route.path === '/')

const handleToggleSidebar = () => {
  sidebarOpen.value = true
}
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <AppNavBar @toggle-sidebar="handleToggleSidebar" />
    <main :class="{ 'pt-16': !isHomePage }">
      <RouterView :sidebar-open="sidebarOpen" @update:sidebar-open="sidebarOpen = $event" />
    </main>
    <ToastContainer />
  </div>
</template>

<style scoped>
#app {
  font-family: var(--font-family-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
