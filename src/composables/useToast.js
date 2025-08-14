import { ref, reactive } from 'vue'

// Store global pour les toasts
const toasts = ref([])
let toastId = 0

export function useToast() {
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = ++toastId
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      visible: true
    }
    
    toasts.value.push(toast)
    
    // Auto-suppression après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  const success = (message, duration = 4000) => {
    return addToast(message, 'success', duration)
  }
  
  const error = (message, duration = 6000) => {
    return addToast(message, 'error', duration)
  }
  
  const warning = (message, duration = 5000) => {
    return addToast(message, 'warning', duration)
  }
  
  const info = (message, duration = 4000) => {
    return addToast(message, 'info', duration)
  }
  
  const clear = () => {
    toasts.value = []
  }
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clear
  }
}