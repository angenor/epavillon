import { ref, computed } from 'vue'
import { useAuth } from './useAuth'
import { useSupabase } from './useSupabase'

const { currentUser } = useAuth()
const { supabase } = useSupabase()

// État global pour les permissions admin
const userRoles = ref([])
const isLoadingRoles = ref(true)

export const useAdmin = () => {
  // Computed pour vérifier les rôles
  const hasAdminRole = computed(() => {
    return userRoles.value.some(role =>
      ['admin', 'super_admin'].includes(role.role) && role.is_active
    )
  })

  const hasSuperAdminRole = computed(() => {
    return userRoles.value.some(role =>
      role.role === 'super_admin' && role.is_active
    )
  })

  const hasReviewerRole = computed(() => {
    return userRoles.value.some(role =>
      role.role === 'revisionniste' && role.is_active
    )
  })

  const hasReviewerOrAdminRole = computed(() => {
    return userRoles.value.some(role =>
      ['admin', 'super_admin', 'revisionniste'].includes(role.role) && role.is_active
    )
  })

  const hasRole = (roleName) => {
    return userRoles.value.some(role =>
      role.role === roleName && role.is_active
    )
  }

  const getUserRole = (user) => {
    if (!user?.user_roles) return 'Utilisateur'
    
    const activeRoles = user.user_roles.filter(role => role.is_active)
    
    if (activeRoles.some(role => role.role === 'super_admin')) {
      return 'Super Administrateur'
    }
    if (activeRoles.some(role => role.role === 'admin')) {
      return 'Administrateur'
    }
    if (activeRoles.some(role => role.role === 'negotiator')) {
      return 'Négociateur'
    }
    if (activeRoles.some(role => role.role === 'unfccc_focal_point')) {
      return 'Point Focal UNFCCC'
    }
    if (activeRoles.some(role => role.role === 'trainer')) {
      return 'Formateur'
    }
    
    return 'Utilisateur'
  }

  // Charger les rôles de l'utilisateur actuel
  const loadUserRoles = async () => {
    if (!currentUser.value?.id) {
      userRoles.value = []
      isLoadingRoles.value = false
      return
    }

    try {
      // Utiliser la fonction RPC simple temporairement
      const { data, error } = await supabase
        .rpc('get_user_roles_simple', { target_user_id: currentUser.value.id })

      if (error) throw error

      userRoles.value = data || []
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error)
      userRoles.value = []
    } finally {
      isLoadingRoles.value = false
    }
  }

  // Attribuer un rôle à un utilisateur
  const assignRole = async (userId, role, assignedBy, validUntil = null) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
          valid_until: validUntil,
          is_active: true
        })
        .select()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Erreur lors de l\'attribution du rôle:', error)
      return { success: false, error }
    }
  }

  // Retirer un rôle à un utilisateur
  const revokeRole = async (userId, role) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('role', role)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la révocation du rôle:', error)
      return { success: false, error }
    }
  }

  // Bloquer un utilisateur
  const blockUser = async (userId, reason, blockedBy) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_blocked: true,
          blocked_by: blockedBy,
          blocked_at: new Date().toISOString(),
          blocked_reason: reason
        })
        .eq('id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Erreur lors du blocage de l\'utilisateur:', error)
      return { success: false, error }
    }
  }

  // Débloquer un utilisateur
  const unblockUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_blocked: false,
          blocked_by: null,
          blocked_at: null,
          blocked_reason: null
        })
        .eq('id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Erreur lors du déblocage de l\'utilisateur:', error)
      return { success: false, error }
    }
  }

  // Suspendre un utilisateur
  const suspendUser = async (userId, suspendedUntil, reason, suspendedBy) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_suspended: true,
          suspended_by: suspendedBy,
          suspended_at: new Date().toISOString(),
          suspended_until: suspendedUntil,
          suspension_reason: reason
        })
        .eq('id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suspension de l\'utilisateur:', error)
      return { success: false, error }
    }
  }

  // Lever la suspension d'un utilisateur
  const unsuspendUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_suspended: false,
          suspended_by: null,
          suspended_at: null,
          suspended_until: null,
          suspension_reason: null
        })
        .eq('id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la levée de suspension:', error)
      return { success: false, error }
    }
  }

  // Valider une activité
  const validateActivity = async (activityId, status, validatedBy, rejectionReason = null) => {
    try {
      const updateData = {
        validation_status: status,
        updated_at: new Date().toISOString()
      }

      // IMPORTANT: NE PAS copier les dates proposées vers les dates finales lors de l'approbation
      // Les final_start_date/final_end_date se modifient UNIQUEMENT via le bouton "Modifier"
      // Cette logique garantit que les dates finales ne sont jamais écrasées automatiquement
      console.log('📅 Approbation: NOT modifying final dates - they are set via "Modifier" button only')

      const { error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', activityId)

      if (error) throw error

      // Enregistrer dans l'historique des modifications
      await recordActivityModification(activityId, 'validation_status', status, validatedBy)

      // TODO: Envoyer notification à l'organisateur
      // TODO: Si approuvé, créer automatiquement la réunion Zoom

      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la validation de l\'activité:', error)
      return { success: false, error }
    }
  }

  // Enregistrer une modification d'activité dans l'historique
  const recordActivityModification = async (activityId, fieldName, newValue, modifiedBy, oldValue = null) => {
    try {
      const { error } = await supabase
        .from('activity_modifications')
        .insert({
          activity_id: activityId,
          field_name: fieldName,
          old_value: oldValue,
          new_value: newValue,
          old_value_type: typeof oldValue,
          new_value_type: typeof newValue,
          modified_by: modifiedBy,
          modified_at: new Date().toISOString()
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la modification:', error)
      return { success: false, error }
    }
  }

  // Statistiques d'administration
  const getAdminStats = async () => {
    try {
      const stats = {}

      // Utilisateurs totaux
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      stats.totalUsers = totalUsers || 0

      // Utilisateurs actifs (non bloqués/suspendus)
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_blocked', false)
        .eq('is_suspended', false)
      stats.activeUsers = activeUsers || 0

      // Activités par statut
      const { data: activitiesStats } = await supabase
        .from('activities')
        .select('validation_status')
        .not('validation_status', 'is', null)

      stats.activities = {
        pending: activitiesStats?.filter(a => ['submitted', 'under_review'].includes(a.validation_status)).length || 0,
        approved: activitiesStats?.filter(a => a.validation_status === 'approved').length || 0,
        rejected: activitiesStats?.filter(a => a.validation_status === 'rejected').length || 0,
        total: activitiesStats?.length || 0
      }

      // Organisations
      const { count: totalOrgs } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      stats.totalOrganizations = totalOrgs || 0

      const { count: verifiedOrgs } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_verified', true)
      stats.verifiedOrganizations = verifiedOrgs || 0

      const { count: duplicateOrgs } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('is_duplicate', true)
      stats.duplicateOrganizations = duplicateOrgs || 0

      return { success: true, data: stats }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      return { success: false, error }
    }
  }

  // Vérifier si l'utilisateur peut accéder à l'admin
  const canAccessAdmin = computed(() => {
    return hasAdminRole.value && !isLoadingRoles.value
  })

  // Initialiser les rôles au chargement
  if (currentUser.value) {
    loadUserRoles()
  }

  return {
    // État
    userRoles,
    isLoadingRoles,

    // Computed
    hasAdminRole,
    hasSuperAdminRole,
    hasReviewerRole,
    hasReviewerOrAdminRole,
    canAccessAdmin,

    // Méthodes de vérification
    hasRole,
    getUserRole,

    // Méthodes de gestion des rôles
    loadUserRoles,
    assignRole,
    revokeRole,

    // Méthodes de modération
    blockUser,
    unblockUser,
    suspendUser,
    unsuspendUser,

    // Méthodes de validation
    validateActivity,
    recordActivityModification,

    // Statistiques
    getAdminStats
  }
}