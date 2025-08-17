import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function usePublicProfiles() {
  const profiles = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalResults = ref(0)
  const totalPages = ref(0)

  /**
   * Recherche des profils publics avec filtres
   */
  const searchProfiles = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const {
        search = '',
        organization = '',
        country = '',
        expertise = [],
        page = 1,
        perPage = 20
      } = filters

      // Construction de la requête de base pour les profils publics
      // Note: On spécifie explicitement toutes les relations
      let query = supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          biography,
          profile_photo_url,
          profile_photo_thumbnail_url,
          address,
          networking_visibility,
          created_at,
          country_id,
          organization_id,
          countries!country_id(
            id,
            name_fr,
            name_en
          ),
          organizations!organization_id(
            id,
            name,
            is_verified
          ),
          user_roles!user_roles_user_id_fkey(
            role,
            is_active
          )
        `)
        .eq('is_blocked', false)
        .eq('is_suspended', false)

      // Filtres de recherche
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
      }

      if (organization) {
        query = query.eq('organization_id', organization)
      }

      if (country) {
        query = query.eq('country_id', country)
      }

      // Ordre et pagination
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      const { data: profilesData, error: queryError, count } = await query

      if (queryError) {
        throw queryError
      }

      // Traitement des données pour ajouter les rôles et stats
      const processedProfiles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          // Récupération des statistiques d'activités
          const { data: activitiesData } = await supabase
            .from('activities')
            .select('id', { count: 'exact', head: true })
            .eq('submitted_by', profile.id)
            .eq('validation_status', 'approved')
            .eq('is_deleted', false)

          // Filtrage par expertise si spécifié
          const roles = profile.user_roles?.filter(ur => ur.is_active).map(ur => ur.role) || []
          
          // Vérification du filtre d'expertise
          if (expertise.length > 0) {
            const hasMatchingExpertise = expertise.some(exp => {
              if (exp === 'negotiator') return roles.includes('negotiator')
              if (exp === 'trainer') return roles.includes('trainer')
              if (exp === 'sustainable_development') return roles.includes('standard')
              return false
            })
            
            if (!hasMatchingExpertise) {
              return null // Ce profil sera filtré
            }
          }

          return {
            ...profile,
            country: profile.countries || null,
            organization: profile.organizations || null,
            roles,
            stats: {
              member_since: new Date(profile.created_at).getFullYear(),
              activities_count: activitiesData?.length || 0
            }
          }
        })
      )

      // Filtrer les profils null (qui ne correspondent pas au filtre d'expertise)
      const filteredProfiles = processedProfiles.filter(profile => profile !== null)

      profiles.value = filteredProfiles
      totalResults.value = count || filteredProfiles.length
      totalPages.value = Math.ceil((count || filteredProfiles.length) / perPage)

    } catch (err) {
      console.error('Erreur lors de la recherche des profils:', err)
      error.value = err.message
      profiles.value = []
      totalResults.value = 0
      totalPages.value = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère un profil public par ID
   */
  const getPublicProfile = async (userId) => {
    loading.value = true
    error.value = null

    try {
      // Version simplifiée pour commencer
      const { data, error: queryError } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          biography,
          profile_photo_url,
          profile_photo_thumbnail_url,
          address,
          networking_visibility,
          created_at,
          country_id,
          organization_id
        `)
        .eq('id', userId)
        .eq('is_blocked', false)
        .eq('is_suspended', false)
        .single()

      if (queryError) {
        throw queryError
      }

      if (!data) {
        throw new Error('Profil non trouvé ou non public')
      }

      // Récupération du pays si country_id existe
      let country = null
      if (data.country_id) {
        try {
          const { data: countryData } = await supabase
            .from('countries')
            .select('id, name_fr, name_en')
            .eq('id', data.country_id)
            .single()
          country = countryData
        } catch (countryErr) {
          console.warn('Erreur lors de la récupération du pays:', countryErr)
        }
      }

      // Récupération de l'organisation si organization_id existe
      let organization = null
      if (data.organization_id) {
        try {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('id, name, is_verified, website, description')
            .eq('id', data.organization_id)
            .single()
          organization = orgData
        } catch (orgErr) {
          console.warn('Erreur lors de la récupération de l\'organisation:', orgErr)
        }
      }

      // Récupération des rôles
      let roles = []
      try {
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role, is_active')
          .eq('user_id', userId)
          .eq('is_active', true)
        
        roles = rolesData?.map(r => r.role) || []
      } catch (roleErr) {
        console.warn('Erreur lors de la récupération des rôles:', roleErr)
      }

      return {
        ...data,
        country,
        organization,
        roles,
        stats: {
          member_since: new Date(data.created_at).getFullYear(),
          activities_count: 0, // Pour l'instant
          trainings_count: 0
        },
        activities: [],
        trainings: []
      }

    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère les statistiques globales de la communauté
   */
  const getCommunityStats = async () => {
    try {
      // Nombre total de professionnels visibles (tous les utilisateurs non bloqués)
      const { count: totalUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_blocked', false)
        .eq('is_suspended', false)

      // Nombre de pays représentés parmi les profils publics
      const { data: countriesData } = await supabase
        .from('users')
        .select('country_id')
        .eq('is_blocked', false)
        .eq('is_suspended', false)
        .not('country_id', 'is', null)

      const uniqueCountries = new Set(countriesData?.map(u => u.country_id))

      // Nombre d'organisations actives représentées
      const { data: organizationsData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('is_blocked', false)
        .eq('is_suspended', false)
        .not('organization_id', 'is', null)

      const uniqueOrganizations = new Set(organizationsData?.map(u => u.organization_id))

      // Nombre d'activités approuvées et publiques
      const { count: totalActivities } = await supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('validation_status', 'approved')
        .eq('is_deleted', false)

      return {
        totalUsers: totalUsers || 0,
        countriesCount: uniqueCountries.size || 0,
        organizationsCount: uniqueOrganizations.size || 0,
        activitiesCount: totalActivities || 0
      }

    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err)
      return {
        totalUsers: 0,
        countriesCount: 0,
        organizationsCount: 0,
        activitiesCount: 0
      }
    }
  }

  /**
   * Envoie une demande de connexion
   */
  const sendConnectionRequest = async (recipientId, message = '') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Vérifier s'il n'y a pas déjà une demande
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('id, status')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .single()

      if (existingConnection) {
        throw new Error('Une demande de connexion existe déjà')
      }

      // Créer la demande de connexion
      const { data, error: insertError } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Créer une notification
      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          notification_type: 'connection_request',
          title: 'Nouvelle demande de connexion',
          content: message || 'Quelqu\'un souhaite se connecter avec vous',
          related_entity_id: data.id
        })

      return data

    } catch (err) {
      console.error('Erreur lors de l\'envoi de la demande de connexion:', err)
      throw err
    }
  }

  return {
    profiles: computed(() => profiles.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    totalResults: computed(() => totalResults.value),
    totalPages: computed(() => totalPages.value),
    searchProfiles,
    getPublicProfile,
    getCommunityStats,
    sendConnectionRequest
  }
}