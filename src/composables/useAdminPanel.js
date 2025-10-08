import { ref, computed } from 'vue'

// État global du panel admin partagé entre les composants
const isCollapsed = ref(localStorage.getItem('adminSidebarCollapsed') === 'true')
const isActivityReviewMode = ref(false)
const activeActivityId = ref(null)
const isReviewSidebarOpen = ref(false)

export function useAdminPanel() {
  // Fonction pour basculer l'état du panel
  const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('adminSidebarCollapsed', isCollapsed.value.toString())
  }

  // Fonction pour forcer la rétraction du panel
  const collapsePanel = () => {
    isCollapsed.value = true
    localStorage.setItem('adminSidebarCollapsed', 'true')
  }

  // Fonction pour forcer l'expansion du panel
  const expandPanel = () => {
    isCollapsed.value = false
    localStorage.setItem('adminSidebarCollapsed', 'false')
  }

  // Fonction pour activer le mode révision d'activités
  const enableActivityReviewMode = (activityId = null) => {
    isActivityReviewMode.value = true
    activeActivityId.value = activityId
    isReviewSidebarOpen.value = true
    collapsePanel()
  }

  // Fonction pour désactiver le mode révision d'activités
  const disableActivityReviewMode = () => {
    isActivityReviewMode.value = false
    activeActivityId.value = null
    isReviewSidebarOpen.value = false
    expandPanel()
  }

  // Fonction pour toggler la sidebar de révision
  const toggleReviewSidebar = () => {
    isReviewSidebarOpen.value = !isReviewSidebarOpen.value
  }

  // Fonction pour ouvrir la sidebar de révision
  const openReviewSidebar = () => {
    isReviewSidebarOpen.value = true
  }

  // Fonction pour fermer la sidebar de révision
  const closeReviewSidebar = () => {
    isReviewSidebarOpen.value = false
  }

  // Largeur du panel selon son état
  const panelWidth = computed(() => {
    if (isActivityReviewMode.value) return 'w-20'
    return isCollapsed.value ? 'w-20' : 'w-64'
  })

  // Marge pour le contenu principal
  const mainMargin = computed(() => {
    if (isActivityReviewMode.value) return 'ml-20'
    return isCollapsed.value ? 'ml-20' : 'ml-64'
  })

  return {
    isCollapsed,
    isActivityReviewMode,
    activeActivityId,
    isReviewSidebarOpen,
    toggleCollapsed,
    collapsePanel,
    expandPanel,
    enableActivityReviewMode,
    disableActivityReviewMode,
    toggleReviewSidebar,
    openReviewSidebar,
    closeReviewSidebar,
    panelWidth,
    mainMargin
  }
}