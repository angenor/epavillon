<template>
  <svg :class="className" fill="currentColor" viewBox="0 0 20 20">
    <!-- Institution publique nationale -->
    <path v-if="type === 'public_national_institution'" d="M10 2L3 7v10c0 .55.45 1 1 1h3v-6h6v6h3c.55 0 1-.45 1-1V7l-7-5z"/>
    
    <!-- Organisation internationale -->
    <path v-else-if="type === 'international_organization'" d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm5 11h-2v2h-2v-2H9v2H7v-2H5v-2h2V9H5V7h2V5h2v2h2V5h2v2h2v2h-2v2z"/>
    
    <!-- Organisation régionale -->
    <path v-else-if="type === 'regional_organization'" d="M15 4H5C3.34 4 2 5.34 2 7v6c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3zm0 9H5V7h10v6z"/>
    
    <!-- ONG/Association -->
    <path v-else-if="type === 'ngo_association'" d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm6 0c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 4.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM6 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm4 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
    
    <!-- Secteur privé -->
    <path v-else d="M14 6V4h-4v2H6v4h4v10h4V10h4V6h-4z"/>
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