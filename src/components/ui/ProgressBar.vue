<template>
  <div class="w-full mb-8">
    <!-- Étapes avec cercles et lignes -->
    <div class="relative mb-2 mx-10">
      <div class="flex items-center justify-between">
        <!-- Cercles des étapes -->
        <div
          v-for="(_step, index) in steps"
          :key="index"
          class="relative z-10 flex items-center justify-center"
        >
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
              index < currentStep
                ? 'bg-green-600 text-white shadow-lg'
                : index === currentStep
                ? 'bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-900 shadow-lg'
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
        </div>
      </div>
      
      <!-- Ligne de connexion continue -->
      <div class="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700">
        <div
          class="h-full bg-green-600 transition-all duration-300 ease-in-out"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
    </div>
    
    <!-- Labels des étapes -->
    <div class="flex items-start justify-between mx-10">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="flex flex-col items-center text-center"
        :style="{ width: '40px', minWidth: '40px' }"
      >
        <div
          :class="[
            'text-sm font-medium transition-colors mb-1 text-center',
            index <= currentStep
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400'
          ]"
          style="width: 120px; margin-left: -40px; margin-right: -40px;"
        >
          {{ step.title }}
        </div>
        <div
          v-if="step.subtitle"
          class="text-xs text-gray-400 dark:text-gray-500 text-center"
          style="width: 120px; margin-left: -40px; margin-right: -40px;"
        >
          {{ step.subtitle }}
        </div>
      </div>
    </div>
    
    <!-- Barre de progression globale -->
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-6">
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