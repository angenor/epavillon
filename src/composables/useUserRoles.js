import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

export function useUserRoles() {
  const { supabase } = useSupabase()
  
  const isLoading = ref(false)
  const error = ref(null)

  // Liste des rôles disponibles selon le modèle de données
  const availableRoles = [
    { value: 'standard', label: 'Standard' },
    { value: 'unfccc_focal_point', label: 'Point focal CCNUCC' },
    { value: 'negotiator', label: 'Négociateur' },
    { value: 'trainer', label: 'Formateur' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'super_admin', label: 'Super Administrateur' }
  ]

  /**
   * Récupère les rôles d'un utilisateur
   */
  const getUserRoles = async (userId) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .rpc('get_user_roles_simple', { target_user_id: userId })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la récupération des rôles:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Ajoute un rôle à un utilisateur
   */
  const addUserRole = async (userId, roleType, validUntil = null) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('add_role_simple', { 
          target_user_id: userId,
          role_type: roleType,
          valid_until: validUntil
        })

      if (rpcError) throw rpcError

      return { id: data }
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de l\'ajout du rôle:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Supprime un rôle d'un utilisateur (désactive le rôle)
   */
  const removeUserRole = async (roleId) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('deactivate_role_simple', { role_id: roleId })

      if (rpcError) throw rpcError

      return { success: data }
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la suppression du rôle:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Réactive un rôle d'un utilisateur
   */
  const activateUserRole = async (roleId) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('reactivate_role_simple', { role_id: roleId })

      if (rpcError) throw rpcError

      return { success: data }
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de l\'activation du rôle:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Met à jour la date d'expiration d'un rôle
   */
  const updateRoleExpiry = async (roleId, validUntil) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('update_role_expiry_simple', { 
          role_id: roleId,
          new_valid_until: validUntil
        })

      if (rpcError) throw rpcError

      return { success: data }
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la mise à jour de l\'expiration:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtient les classes CSS pour un rôle donné
   */
  const getRoleClass = (role) => {
    const classes = {
      standard: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      negotiator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      unfccc_focal_point: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      trainer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      super_admin: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200'
    }
    return classes[role] || classes.standard
  }

  /**
   * Vérifie si un rôle est expiré
   */
  const isRoleExpired = (validUntil) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  return {
    // État
    isLoading,
    error,
    availableRoles,
    
    // Méthodes
    getUserRoles,
    addUserRole,
    removeUserRole,
    activateUserRole,
    updateRoleExpiry,
    getRoleClass,
    isRoleExpired
  }
}