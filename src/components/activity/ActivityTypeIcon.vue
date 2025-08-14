<template>
  <svg :class="className" fill="currentColor" viewBox="0 0 20 20">
    <!-- Side Event -->
    <path v-if="type === 'side_event'" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    
    <!-- Country Day -->
    <path v-else-if="type === 'country_day'" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
    
    <!-- Other -->
    <path v-else d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 8a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
  </svg>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: 'h-5 w-5'
  }
})
</script>