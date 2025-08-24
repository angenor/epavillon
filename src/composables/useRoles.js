import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useUserRoles } from '@/composables/useUserRoles'
import { useAuth } from '@/composables/useAuth'

export function useRoles() {
  const { supabase } = useSupabase()
  const { addUserRole, removeUserRole } = useUserRoles()
  const { user } = useAuth()
  
  const isLoading = ref(false)
  const error = ref(null)

  // Liste des rôles disponibles selon le modèle de données
  const availableRoles = [
    'standard',
    'unfccc_focal_point', 
    'negotiator',
    'trainer',
    'admin',
    'super_admin'
  ]

  /**
   * Attribue un rôle à un utilisateur
   */
  const assignUserRole = async (userId, roleType, validUntil = null) => {
    try {
      isLoading.value = true
      error.value = null

      // Vérifier si l'utilisateur a déjà ce rôle actif
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id, is_active')
        .eq('user_id', userId)
        .eq('role', roleType)
        .single()

      if (existingRole) {
        if (existingRole.is_active) {
          throw new Error('L\'utilisateur possède déjà ce rôle')
        } else {
          // Réactiver le rôle existant
          const { error: updateError } = await supabase
            .from('user_roles')
            .update({ 
              is_active: true,
              valid_until: validUntil,
              assigned_by: user.value?.id,
              assigned_at: new Date().toISOString()
            })
            .eq('id', existingRole.id)

          if (updateError) throw updateError
          return existingRole.id
        }
      } else {
        // Créer un nouveau rôle
        return await addUserRole(userId, roleType, validUntil)
      }
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de l\'attribution du rôle:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Révoque un rôle d'un utilisateur
   */
  const revokeUserRole = async (userId, roleType) => {
    try {
      isLoading.value = true
      error.value = null

      // Trouver le rôle à révoquer
      const { data: roleToRevoke, error: findError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', roleType)
        .eq('is_active', true)
        .single()

      if (findError) throw findError
      
      if (!roleToRevoke) {
        throw new Error('Rôle non trouvé ou déjà révoqué')
      }

      // Désactiver le rôle
      const { error: revokeError } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', roleToRevoke.id)

      if (revokeError) throw revokeError

      return roleToRevoke.id
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la révocation du rôle:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère tous les utilisateurs avec leurs rôles
   */
  const getAllUsersWithRoles = async () => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          profile_photo_thumbnail_url,
          user_roles!inner (
            id,
            role,
            assigned_at,
            valid_until,
            is_active
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la récupération des utilisateurs avec rôles:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère toutes les attributions de rôles avec détails
   */
  const getAllRoleAssignments = async () => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          assigned_at,
          valid_until,
          is_active,
          user:user_id (
            id,
            first_name,
            last_name,
            email,
            profile_photo_thumbnail_url
          ),
          assigner:assigned_by (
            id,
            first_name,
            last_name
          )
        `)
        .order('assigned_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la récupération des attributions de rôles:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère les statistiques des rôles
   */
  const getRoleStats = async () => {
    try {
      isLoading.value = true
      error.value = null

      const stats = {}

      for (const role of availableRoles) {
        const { count, error: countError } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', role)
          .eq('is_active', true)

        if (countError) throw countError

        stats[role] = count || 0
      }

      return stats
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la récupération des statistiques:', err)
      return {}
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Recherche d'utilisateurs pour attribution de rôle
   */
  const searchUsersForRoleAssignment = async (searchTerm) => {
    try {
      if (searchTerm.length < 2) return []

      const { data, error: searchError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, profile_photo_thumbnail_url')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10)

      if (searchError) throw searchError

      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors de la recherche d\'utilisateurs:', err)
      return []
    }
  }

  /**
   * Vérifie si un utilisateur peut attribuer un rôle spécifique
   */
  const canAssignRole = (currentUserRoles, targetRole) => {
    // Seuls les admin et super_admin peuvent attribuer des rôles
    const hasAdminRole = currentUserRoles.some(role => 
      role.role === 'admin' || role.role === 'super_admin'
    )
    
    if (!hasAdminRole) return false

    // Les super_admin peuvent tout attribuer
    const isSuperAdmin = currentUserRoles.some(role => role.role === 'super_admin')
    if (isSuperAdmin) return true

    // Les admin ne peuvent pas attribuer admin ou super_admin
    if (targetRole === 'admin' || targetRole === 'super_admin') return false

    return true
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
    assignUserRole,
    revokeUserRole,
    getAllUsersWithRoles,
    getAllRoleAssignments,
    getRoleStats,
    searchUsersForRoleAssignment,
    canAssignRole,
    getRoleClass,
    isRoleExpired
  }
}