<template>
  <section class="py-16">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('community.stats.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('community.stats.subtitle') }}
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div 
          v-for="stat in mainStats" 
          :key="stat.id"
          class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
        >
          <!-- Icon -->
          <div :class="[
            'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300',
            stat.bgColor
          ]">
            <component :is="stat.icon" class="w-7 h-7 text-white" />
          </div>
          
          <!-- Value -->
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <CountUp 
              :end="stat.value" 
              :duration="2500"
              :delay="stat.delay"
            />
            <span v-if="stat.suffix">{{ stat.suffix }}</span>
          </div>
          
          <!-- Label -->
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ stat.label }}
          </div>
          
          <!-- Trend -->
          <div v-if="stat.trend" class="flex items-center gap-1 mt-3">
            <svg 
              v-if="stat.trend > 0"
              class="w-4 h-4 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <svg 
              v-else
              class="w-4 h-4 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <span :class="[
              'text-xs font-medium',
              stat.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('community.stats.thisMonth') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Geographic Distribution -->
      <div class="bg-gradient-to-br from-ifdd-green-50 to-ifdd-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12">
        <div class="grid lg:grid-cols-2 gap-8 items-center">
          <!-- Left: Map Visualization -->
          <div class="relative">
            <div class="aspect-video bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <!-- Simplified World Map Placeholder -->
              <div class="w-full h-full flex items-center justify-center">
                <svg class="w-full h-full text-gray-200 dark:text-gray-700" viewBox="0 0 1000 500">
                  <!-- Africa -->
                  <ellipse cx="550" cy="280" rx="80" ry="120" class="fill-ifdd-green-200 dark:fill-ifdd-green-800/30" />
                  <!-- Europe -->
                  <ellipse cx="500" cy="150" rx="60" ry="50" class="fill-ifdd-blue-200 dark:fill-ifdd-blue-800/30" />
                  <!-- Americas -->
                  <ellipse cx="250" cy="250" rx="70" ry="150" class="fill-purple-200 dark:fill-purple-800/30" />
                  <!-- Asia -->
                  <ellipse cx="750" cy="200" rx="100" ry="80" class="fill-orange-200 dark:fill-orange-800/30" />
                  
                  <!-- Dots for countries -->
                  <circle cx="550" cy="250" r="4" class="fill-ifdd-green-600 animate-pulse" />
                  <circle cx="520" cy="280" r="3" class="fill-ifdd-green-500" />
                  <circle cx="580" cy="300" r="3" class="fill-ifdd-green-500" />
                  <circle cx="500" cy="160" r="3" class="fill-ifdd-blue-600" />
                  <circle cx="480" cy="140" r="3" class="fill-ifdd-blue-500" />
                  <circle cx="250" cy="200" r="3" class="fill-purple-600" />
                  <circle cx="230" cy="300" r="3" class="fill-purple-500" />
                </svg>
              </div>
            </div>
            
            <!-- Map Legend -->
            <div class="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3">
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('community.stats.activeRegions') }}
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-ifdd-green-500"></div>
                  <span class="text-xs text-gray-600 dark:text-gray-400">Afrique</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-ifdd-blue-500"></div>
                  <span class="text-xs text-gray-600 dark:text-gray-400">Europe</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span class="text-xs text-gray-600 dark:text-gray-400">Amériques</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right: Regional Stats -->
          <div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {{ t('community.stats.globalReach') }}
            </h3>
            <div class="space-y-4">
              <div v-for="region in regionalStats" :key="region.name" class="group">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ region.name }}
                  </span>
                  <span class="text-sm font-bold text-gray-900 dark:text-white">
                    {{ region.count }} {{ t('community.stats.members') }}
                  </span>
                </div>
                <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    :class="[
                      'absolute top-0 left-0 h-full rounded-full transition-all duration-1000',
                      region.color
                    ]"
                    :style="{ width: region.percentage + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- Additional Info -->
            <div class="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-ifdd-green-600 dark:text-ifdd-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('community.stats.growthInfo') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import CountUp from '@/components/ui/CountUp.vue'

const { t } = useI18n()

// Icon components (simplified)
const UsersIcon = {
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' })
    ])
  }
}

const ChatIcon = {
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z' })
    ])
  }
}

const VideoIcon = {
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z' })
    ])
  }
}

const LightbulbIcon = {
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' })
    ])
  }
}

const mainStats = ref([
  {
    id: 'members',
    label: t('community.stats.totalMembers'),
    value: 1247,
    suffix: '',
    icon: UsersIcon,
    bgColor: 'bg-gradient-to-br from-ifdd-green-500 to-ifdd-green-600',
    trend: 12,
    delay: 0
  },
  {
    id: 'testimonials',
    label: t('community.stats.testimonials'),
    value: 342,
    suffix: '',
    icon: ChatIcon,
    bgColor: 'bg-gradient-to-br from-ifdd-blue-500 to-ifdd-blue-600',
    trend: 8,
    delay: 200
  },
  {
    id: 'videos',
    label: t('community.stats.videoTestimonials'),
    value: 89,
    suffix: '',
    icon: VideoIcon,
    bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    trend: 25,
    delay: 400
  },
  {
    id: 'innovations',
    label: t('community.stats.innovations'),
    value: 156,
    suffix: '',
    icon: LightbulbIcon,
    bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
    trend: 15,
    delay: 600
  }
])

const regionalStats = ref([
  {
    name: 'Afrique de l\'Ouest',
    count: 456,
    percentage: 75,
    color: 'bg-gradient-to-r from-ifdd-green-400 to-ifdd-green-600'
  },
  {
    name: 'Afrique Centrale',
    count: 289,
    percentage: 60,
    color: 'bg-gradient-to-r from-ifdd-blue-400 to-ifdd-blue-600'
  },
  {
    name: 'Europe',
    count: 234,
    percentage: 50,
    color: 'bg-gradient-to-r from-purple-400 to-purple-600'
  },
  {
    name: 'Amérique du Nord',
    count: 178,
    percentage: 40,
    color: 'bg-gradient-to-r from-orange-400 to-orange-600'
  },
  {
    name: 'Autres régions',
    count: 90,
    percentage: 20,
    color: 'bg-gradient-to-r from-gray-400 to-gray-600'
  }
])

onMounted(() => {
  // Could fetch real statistics from the store
  // testimonialsStore.loadStatistics()
})
</script>