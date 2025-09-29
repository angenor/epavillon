import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export const useUserStore = defineStore('user', () => {
  // State
  const userRoles = ref([])
  const userCountry = ref(null)
  const userOrganization = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const hasRole = computed(() => (role) => {
    return userRoles.value.some(r => r.role === role && r.is_active)
  })

  const isAdmin = computed(() => {
    return hasRole.value('admin') || hasRole.value('super_admin')
  })

  const isNegotiator = computed(() => {
    return hasRole.value('negotiator')
  })

  const isFocalPoint = computed(() => {
    return hasRole.value('unfccc_focal_point')
  })

  const isTrainer = computed(() => {
    return hasRole.value('trainer')
  })

  // Actions
  const loadUserData = async (userId) => {
    if (!userId) return

    loading.value = true
    error.value = null

    try {
      // Vérifier si les rôles sont déjà dans authStore
      const authStore = await import('./auth').then(m => m.useAuthStore())
      if (authStore.profile?.user_roles) {
        userRoles.value = authStore.profile.user_roles
      } else {
        // Charger les rôles utilisateur depuis la base de données
        const { data: roles } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)

        userRoles.value = roles || []
      }

      // Charger les données utilisateur avec relations
      const { data: userData } = await supabase
        .from('users')
        .select(`
          *,
          countries(*),
          organizations(*)
        `)
        .eq('id', userId)
        .single()

      if (userData) {
        userCountry.value = userData.countries
        userOrganization.value = userData.organizations
      }

    } catch (err) {
      console.error('Error loading user data:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updateData) => {
    loading.value = true
    error.value = null

    try {
      const { profilePhoto, ...userData } = updateData

      // Nettoyer les données avant l'envoi - convertir les chaînes vides en null pour les UUIDs
      const cleanedData = {}
      for (const [key, value] of Object.entries(userData)) {
        if (key.endsWith('_id') && value === '') {
          cleanedData[key] = null
        } else if (value === '') {
          cleanedData[key] = null
        } else {
          cleanedData[key] = value
        }
      }


      // Mettre à jour les données utilisateur
      const { data, error: updateError } = await supabase
        .from('users')
        .update(cleanedData)
        .eq('id', cleanedData.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Gérer l'upload de la photo si nécessaire
      if (profilePhoto) {
        await uploadProfilePhoto(cleanedData.id, profilePhoto)
      } else {
      }

      // Recharger les données
      await loadUserData(cleanedData.id)

      return data
    } catch (err) {
      console.error('Error updating profile:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadProfilePhoto = async (userId, photoData) => {
    try {
      
      // Upload de la photo principale dans le bucket 'epavillonp' dossier 'profil'
      const photoFileName = `profil/${userId}/profile.jpg`
      
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('epavillonp')
        .upload(photoFileName, photoData.processed, {
          upsert: true,
          contentType: photoData.processed?.type || 'image/jpeg'
        })

      
      if (uploadError) {
        console.error('Erreur détaillée lors de l\'upload de la photo principale:', uploadError)
        throw uploadError
      }

      // Upload de la vignette
      const thumbnailFileName = `profil/${userId}/thumbnail.jpg`
      
      const { data: thumbnailData, error: thumbnailError } = await supabase.storage
        .from('epavillonp')
        .upload(thumbnailFileName, photoData.thumbnail, {
          upsert: true,
          contentType: photoData.thumbnail?.type || 'image/jpeg'
        })

      
      if (thumbnailError) {
        console.error('Erreur détaillée lors de l\'upload de la vignette:', thumbnailError)
        throw thumbnailError
      }

      // Mettre à jour les URLs dans la base de données
      const { data: photoUrl } = supabase.storage
        .from('epavillonp')
        .getPublicUrl(photoFileName)

      const { data: thumbnailUrl } = supabase.storage
        .from('epavillonp')
        .getPublicUrl(thumbnailFileName)


      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({
          profile_photo_url: photoUrl.publicUrl,
          profile_photo_thumbnail_url: thumbnailUrl.publicUrl
        })
        .eq('id', userId)
        .select()
        .single()


      if (updateError) {
        console.error('Erreur détaillée lors de la mise à jour de la DB:', updateError)
        throw updateError
      }
      

    } catch (err) {
      console.error('Error uploading profile photo:', err)
      throw err
    }
  }

  const loadCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name_fr')

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error loading countries:', err)
      return []
    }
  }

  const searchOrganizations = async (query) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(10)

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error searching organizations:', err)
      return []
    }
  }

  const requestNewOrganization = async (orgData) => {
    try {
      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      
      // Créer une demande d'organisation
      const { data, error } = await supabase
        .from('organization_requests')
        .insert({
          ...orgData,
          status: 'pending',
          requested_by: user?.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error requesting new organization:', err)
      throw err
    }
  }

  // Setter pour l'organisation (pour pouvoir l'assigner depuis le composant Profile)
  const setUserOrganization = (organization) => {
    userOrganization.value = organization
  }

  // Setter pour les rôles (pour synchroniser avec authStore)
  const setUserRoles = (roles) => {
    userRoles.value = roles || []
  }

  // Reset store
  const resetUserStore = () => {
    userRoles.value = []
    userCountry.value = null
    userOrganization.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    userRoles,
    userCountry,
    userOrganization,
    loading,
    error,

    // Getters
    hasRole,
    isAdmin,
    isNegotiator,
    isFocalPoint,
    isTrainer,

    // Actions
    loadUserData,
    updateProfile,
    loadCountries,
    searchOrganizations,
    requestNewOrganization,
    setUserOrganization,
    setUserRoles,
    resetUserStore
  }
})