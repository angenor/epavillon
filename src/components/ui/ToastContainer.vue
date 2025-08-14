<template>
  <Teleport to="body">
    <div class="fixed top-0 right-0 z-50 p-4 space-y-4 max-w-sm w-full">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-4"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-center p-4 rounded-lg shadow-lg border',
            getToastClasses(toast.type)
          ]"
          role="alert"
        >
          <!-- Icône -->
          <div class="flex-shrink-0 mr-3">
            <font-awesome-icon
              :icon="getToastIcon(toast.type)"
              class="w-5 h-5"
              :class="getIconClasses(toast.type)"
            />
          </div>
          
          <!-- Message -->
          <div class="flex-1 text-sm font-medium">
            {{ toast.message }}
          </div>
          
          <!-- Bouton de fermeture -->
          <button
            @click="removeToast(toast.id)"
            type="button"
            class="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="getCloseButtonClasses(toast.type)"
          >
            <span class="sr-only">Fermer</span>
            <font-awesome-icon
              icon="times"
              class="w-4 h-4"
            />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const getToastClasses = (type) => {
  const classes = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
  }
  return classes[type] || classes.info
}

const getToastIcon = (type) => {
  const icons = {
    success: 'check-circle',
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle'
  }
  return icons[type] || icons.info
}

const getIconClasses = (type) => {
  const classes = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  }
  return classes[type] || classes.info
}

const getCloseButtonClasses = (type) => {
  const classes = {
    success: 'text-green-600 hover:bg-green-600 focus:ring-green-500 dark:text-green-400',
    error: 'text-red-600 hover:bg-red-600 focus:ring-red-500 dark:text-red-400',
    warning: 'text-yellow-600 hover:bg-yellow-600 focus:ring-yellow-500 dark:text-yellow-400',
    info: 'text-blue-600 hover:bg-blue-600 focus:ring-blue-500 dark:text-blue-400'
  }
  return classes[type] || classes.info
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>