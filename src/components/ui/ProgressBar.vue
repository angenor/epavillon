<template>
  <div class="w-full mb-8">
    <div class="flex items-center justify-between mb-4">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="flex flex-col items-center flex-1"
      >
        <div class="flex items-center w-full">
          <!-- Circle pour l'étape -->
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              index < currentStep
                ? 'bg-green-600 text-white'
                : index === currentStep
                ? 'bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-900'
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            ]"
          >
            <template v-if="index < currentStep">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </template>
            <template v-else>
              {{ index + 1 }}
            </template>
          </div>
          
          <!-- Ligne de connexion -->
          <div
            v-if="index < steps.length - 1"
            :class="[
              'flex-1 h-0.5 mx-2 transition-colors',
              index < currentStep
                ? 'bg-green-600'
                : 'bg-gray-200 dark:bg-gray-700'
            ]"
          />
        </div>
        
        <!-- Label de l'étape -->
        <div class="mt-2 text-center">
          <div
            :class="[
              'text-sm font-medium transition-colors',
              index <= currentStep
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
            ]"
          >
            {{ step.title }}
          </div>
          <div
            v-if="step.subtitle"
            class="text-xs text-gray-400 dark:text-gray-500 mt-1"
          >
            {{ step.subtitle }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Barre de progression -->
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        class="bg-green-600 h-2 rounded-full transition-all duration-300 ease-in-out"
        :style="{ width: `${progressPercentage}%` }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  steps: {
    type: Array,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  }
})

const progressPercentage = computed(() => {
  return Math.round((props.currentStep / (props.steps.length - 1)) * 100)
})
</script>