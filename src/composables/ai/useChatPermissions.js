/**
 * Composable pour gérer les permissions d'accès au chatbot IA
 * Seuls les utilisateurs avec les rôles 'negotiator', 'admin' ou 'super_admin' peuvent accéder
 */

import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'
import { useUserRoles } from '@/composables/useUserRoles'

// Rôles autorisés à utiliser le chatbot
const ALLOWED_ROLES = ['negotiator', 'admin', 'super_admin']

export function useChatPermissions() {
  const { supabase } = useSupabase()
  const { user, isAuthenticated } = useAuth()
  const { getUserRoles } = useUserRoles()

  const isLoading = ref(false)
  const error = ref(null)
  const userRoles = ref([])
  const hasAccess = ref(false)

  /**
   * Vérifie si l'utilisateur a accès au chatbot
   * @returns {Promise<boolean>}
   */
  const checkChatbotAccess = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Vérifier si l'utilisateur est authentifié
      if (!isAuthenticated.value || !user.value) {
        hasAccess.value = false
        return false
      }

      // Récupérer les rôles de l'utilisateur via RPC
      const { data, error: rpcError } = await supabase
        .rpc('has_chatbot_access')

      if (rpcError) {
        console.error('Error checking chatbot access:', rpcError)
        error.value = rpcError.message
        hasAccess.value = false
        return false
      }

      hasAccess.value = Boolean(data)
      return hasAccess.value
    } catch (err) {
      console.error('Error in checkChatbotAccess:', err)
      error.value = err.message
      hasAccess.value = false
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère les rôles de l'utilisateur courant
   * @returns {Promise<Array<string>>}
   */
  const fetchUserRoles = async () => {
    try {
      if (!user.value) {
        userRoles.value = []
        return []
      }

      const roles = await getUserRoles(user.value.id)

      // Extraire uniquement les types de rôles actifs
      userRoles.value = roles
        .filter(role => role.is_active && !isRoleExpired(role.valid_until))
        .map(role => role.role_type)

      return userRoles.value
    } catch (err) {
      console.error('Error fetching user roles:', err)
      return []
    }
  }

  /**
   * Vérifie si un rôle est expiré
   * @param {string} validUntil - Date d'expiration
   * @returns {boolean}
   */
  const isRoleExpired = (validUntil) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * @param {string} roleType - Type de rôle à vérifier
   * @returns {boolean}
   */
  const hasRole = (roleType) => {
    return userRoles.value.includes(roleType)
  }

  /**
   * Vérifie si l'utilisateur a au moins un des rôles autorisés
   * @returns {boolean}
   */
  const hasAnyAllowedRole = computed(() => {
    return ALLOWED_ROLES.some(role => userRoles.value.includes(role))
  })

  /**
   * Obtient le message d'erreur d'accès en fonction du contexte
   * @returns {string}
   */
  const getAccessDeniedMessage = () => {
    if (!isAuthenticated.value) {
      return 'Vous devez être connecté pour accéder au chatbot IA.'
    }

    if (!hasAccess.value) {
      return 'Vous n\'avez pas les permissions nécessaires pour accéder au chatbot IA. Seuls les négociateurs, administrateurs et super administrateurs peuvent y accéder.'
    }

    return 'Accès refusé.'
  }

  /**
   * Obtient la liste des rôles requis (pour affichage)
   * @returns {Array<string>}
   */
  const getRequiredRoles = () => {
    return ALLOWED_ROLES
  }

  /**
   * Vérifie si l'utilisateur est administrateur
   * @returns {boolean}
   */
  const isAdmin = computed(() => {
    return userRoles.value.includes('admin') || userRoles.value.includes('super_admin')
  })

  /**
   * Vérifie si l'utilisateur est négociateur
   * @returns {boolean}
   */
  const isNegotiator = computed(() => {
    return userRoles.value.includes('negotiator')
  })

  /**
   * Initialise les permissions (vérifie l'accès et récupère les rôles)
   * @returns {Promise<boolean>}
   */
  const initializePermissions = async () => {
    try {
      await fetchUserRoles()
      return await checkChatbotAccess()
    } catch (err) {
      console.error('Error initializing permissions:', err)
      return false
    }
  }

  return {
    // État
    isLoading,
    error,
    userRoles,
    hasAccess,
    hasAnyAllowedRole,
    isAdmin,
    isNegotiator,

    // Méthodes
    checkChatbotAccess,
    fetchUserRoles,
    hasRole,
    getAccessDeniedMessage,
    getRequiredRoles,
    initializePermissions
  }
}
