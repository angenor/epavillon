<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors">
    <!-- Navigation -->
    <NavBar @toggle-sidebar="sidebarOpen = true" />
    
    <!-- Sidebar -->
    <SideBar :is-open="sidebarOpen" @close="sidebarOpen = false" />
    
    <!-- Main content -->
    <main>
      <!-- Hero Section -->
      <HeroSection />
      
      <!-- Events Section -->
      <EventsSection />
      
      <!-- Formations Section -->
      <FormationsSection />
    </main>
    
    <!-- Footer -->
    <FooterSection />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import SideBar from '../components/SideBar.vue'
import HeroSection from '../components/HeroSection.vue'
import EventsSection from '../components/EventsSection.vue'
import FormationsSection from '../components/FormationsSection.vue'
import FooterSection from '../components/FooterSection.vue'

export default {
  name: 'HomeView',
  components: {
    NavBar,
    SideBar,
    HeroSection,
    EventsSection,
    FormationsSection,
    FooterSection
  },
  data() {
    return {
      sidebarOpen: false
    }
  }
}
</script>
