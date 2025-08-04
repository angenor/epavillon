import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSupabase } from '@/composables/useSupabase'

export function useOrganizationCheck() {
  const authStore = useAuthStore()
  const { supabase } = useSupabase()

  // Check if user has required admin role
  const hasAdminRole = computed(() => {
    if (!authStore.profile?.user_roles) return false
    
    return authStore.profile.user_roles.some(role => 
      ['admin', 'super_admin'].includes(role.role) && 
      role.is_active && 
      (role.valid_until === null || new Date(role.valid_until) > new Date())
    )
  })

  // Check if user has organization set
  const hasOrganization = computed(() => {
    return !!authStore.profile?.organization_id
  })

  // Check if user can create events (authenticated + admin + has organization)
  const canCreateEvents = computed(() => {
    return authStore.isAuthenticated && hasAdminRole.value && hasOrganization.value
  })

  // Get user roles
  const checkUserRoles = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
      
      if (error) throw error
      return data?.map(r => r.role) || []
    } catch (error) {
      console.error('Error checking user roles:', error)
      return []
    }
  }

  // Get requirements status for UI
  const getRequirementsStatus = () => {
    return {
      isAuthenticated: {
        met: authStore.isAuthenticated,
        label: 'organization.requirements.authenticated',
        icon: authStore.isAuthenticated ? 'check' : 'x'
      },
      hasAdminRole: {
        met: hasAdminRole.value,
        label: 'organization.requirements.adminRole',
        icon: hasAdminRole.value ? 'check' : 'x'
      },
      hasOrganization: {
        met: hasOrganization.value,
        label: 'organization.requirements.organization',
        icon: hasOrganization.value ? 'check' : 'x'
      }
    }
  }

  return {
    hasAdminRole,
    hasOrganization,
    canCreateEvents,
    checkUserRoles,
    getRequirementsStatus
  }
}