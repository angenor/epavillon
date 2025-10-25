/**
 * Composable pour intégrer les outils Zoom au chatbot
 * Gère la logique spécifique au chat et aux permissions
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getZoomTools, canUseZoomTools } from '@/utils/ai/toolsManager'

export function useZoomToolsChat() {
  const authStore = useAuthStore()

  /**
   * Obtient le rôle de l'utilisateur actuel
   * @returns {string|null}
   */
  const userRole = computed(() => {
    if (!authStore.profile?.user_roles || authStore.profile.user_roles.length === 0) {
      return null
    }

    // Récupérer le rôle actif de l'utilisateur
    const activeRoles = authStore.profile.user_roles.filter(r => r.is_active)

    if (activeRoles.length === 0) {
      return null
    }

    // Prioriser super_admin > admin > autres rôles
    const superAdmin = activeRoles.find(r => r.role === 'super_admin')
    if (superAdmin) return 'super_admin'

    const admin = activeRoles.find(r => r.role === 'admin')
    if (admin) return 'admin'

    // Retourner le premier rôle actif
    return activeRoles[0].role
  })

  /**
   * Vérifie si l'utilisateur peut utiliser les outils Zoom
   */
  const canUseTools = computed(() => {
    if (!userRole.value) return false
    return canUseZoomTools(userRole.value)
  })

  /**
   * Retourne les outils disponibles pour l'utilisateur
   */
  const availableTools = computed(() => {
    if (!canUseTools.value) {
      return []
    }

    return getZoomTools(userRole.value)
  })

  /**
   * Retourne le message d'erreur si l'utilisateur n'a pas les permissions
   */
  const permissionErrorMessage = computed(() => {
    if (canUseTools.value) return null

    return "Désolé, vous n'avez pas les permissions nécessaires pour gérer les réunions Zoom. Cette fonctionnalité est réservée aux administrateurs."
  })

  return {
    // État
    userRole,
    canUseTools,
    availableTools,
    permissionErrorMessage
  }
}
