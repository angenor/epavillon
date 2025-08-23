import { ref } from 'vue'
import { useAdmin } from './useAdmin'

/**
 * Composable pour gérer l'accès aux pages d'administration
 * Gère la vérification asynchrone des permissions
 */
export function useAdminAccess() {
  const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()
  const isCheckingAccess = ref(true)
  const accessError = ref(null)

  /**
   * Vérifie l'accès admin de manière asynchrone
   */
  const checkAdminAccess = async () => {
    try {
      isCheckingAccess.value = true
      accessError.value = null

      // Attendre que les rôles soient chargés
      await loadUserRoles()
      
      if (!hasAdminRole.value) {
        const error = new Error('Accès non autorisé')
        accessError.value = error
        throw error
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions admin:', error)
      accessError.value = error
      throw error
    } finally {
      isCheckingAccess.value = false
    }
  }

  return {
    hasAdminRole,
    isLoadingRoles,
    isCheckingAccess,
    accessError,
    checkAdminAccess
  }
}