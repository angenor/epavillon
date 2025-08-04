<template>
  <div>
    <!-- Sidebar -->
    <SideBar :is-open="sidebarOpen" @close="closeSidebar" />
    
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
import SideBar from '../components/SideBar.vue'
import HeroSection from '../components/HeroSection.vue'
import EventsSection from '../components/EventsSection.vue'
import FormationsSection from '../components/FormationsSection.vue'
import FooterSection from '../components/FooterSection.vue'

export default {
  name: 'HomeView',
  components: {
    SideBar,
    HeroSection,
    EventsSection,
    FormationsSection,
    FooterSection
  },
  props: {
    sidebarOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:sidebar-open'],
  methods: {
    closeSidebar() {
      this.$emit('update:sidebar-open', false)
    }
  }
}
</script>
