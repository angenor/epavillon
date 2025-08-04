import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

export const useAuthStore = defineStore('auth', () => {
  const { auth, from } = useSupabase()
  
  // State
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)
  
  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userInitials = computed(() => {
    if (!profile.value) return ''
    const firstName = profile.value.first_name || ''
    const lastName = profile.value.last_name || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  })
  
  // Actions
  const fetchUser = async () => {
    try {
      loading.value = true
      const { data: { session } } = await auth.getSession()
      
      if (session?.user) {
        user.value = session.user
        await fetchProfile(session.user.id)
      } else {
        user.value = null
        profile.value = null
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      loading.value = false
    }
  }
  
  const fetchProfile = async (userId) => {
    try {
      // Récupérer le profil utilisateur
      const { data: userData, error: userError } = await from('users')
        .select(`
          *, 
          country:countries(*)
        `)
        .eq('id', userId)
        .single()
      
      if (userError) throw userError
      
      // Récupérer les rôles utilisateur séparément
      const { data: rolesData, error: rolesError } = await from('user_roles')
        .select('role, is_active, valid_until')
        .eq('user_id', userId)
        .eq('is_active', true)
      
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError)
        // Continue même si les rôles ne peuvent pas être récupérés
        profile.value = userData
      } else {
        // Combiner les données
        profile.value = {
          ...userData,
          user_roles: rolesData || []
        }
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }
  
  const signOut = async () => {
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      
      user.value = null
      profile.value = null
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }
  
  // Initialize
  fetchUser()
  
  // Listen to auth changes
  auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      user.value = session.user
      fetchProfile(session.user.id)
    } else if (event === 'SIGNED_OUT') {
      user.value = null
      profile.value = null
    }
  })
  
  return {
    // State
    user,
    profile,
    loading,
    // Getters
    isAuthenticated,
    userInitials,
    // Actions
    fetchUser,
    signOut
  }
})