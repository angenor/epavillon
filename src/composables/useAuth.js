import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

export function useAuth() {
  const authStore = useAuthStore()
  
  // État réactif
  const { user, profile, loading, isAuthenticated, userInitials } = storeToRefs(authStore)
  
  // Alias pour compatibilité
  const currentUser = user
  
  return {
    // État
    user,
    currentUser,
    profile,
    loading,
    isAuthenticated,
    userInitials,
    
    // Actions
    fetchUser: authStore.fetchUser,
    fetchProfile: authStore.fetchProfile,
    signUp: authStore.signUp,
    signIn: authStore.signIn,
    signOut: authStore.signOut,
    updateProfile: authStore.updateProfile,
    changePassword: authStore.changePassword,
    resetPassword: authStore.resetPassword,
    verifyOtp: authStore.verifyOtp,
    resendVerification: authStore.resendVerification
  }
}