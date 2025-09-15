import { ref } from 'vue'
import { useRouter } from 'vue-router'

const maintenancePages = ref(new Set([
  '/community'
]))

export function useMaintenanceModal(pagePath = null) {
  const router = useRouter()
  const showMaintenanceModal = ref(false)

  const currentPath = pagePath || router.currentRoute.value.path

  const checkMaintenance = () => {
    showMaintenanceModal.value = maintenancePages.value.has(currentPath)
  }

  const closeMaintenanceModal = () => {
    showMaintenanceModal.value = false
  }

  const goHome = () => {
    router.push('/')
  }

  const addPageToMaintenance = (path) => {
    maintenancePages.value.add(path)
  }

  const removePageFromMaintenance = (path) => {
    maintenancePages.value.delete(path)
  }

  const isPageInMaintenance = (path) => {
    return maintenancePages.value.has(path)
  }

  const getAllMaintenancePages = () => {
    return Array.from(maintenancePages.value)
  }

  checkMaintenance()

  return {
    showMaintenanceModal,
    closeMaintenanceModal,
    goHome,
    addPageToMaintenance,
    removePageFromMaintenance,
    isPageInMaintenance,
    getAllMaintenancePages,
    checkMaintenance
  }
}