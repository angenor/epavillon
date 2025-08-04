<script setup>
import { RouterView } from 'vue-router'
import AppNavBar from './components/AppNavBar.vue'
import { ref } from 'vue'

const sidebarOpen = ref(false)

const handleToggleSidebar = () => {
  sidebarOpen.value = true
}
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <AppNavBar @toggle-sidebar="handleToggleSidebar" />
    <main class="pt-16">
      <RouterView :sidebar-open="sidebarOpen" @update:sidebar-open="sidebarOpen = $event" />
    </main>
  </div>
</template>

<style scoped>
#app {
  font-family: var(--font-family-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
