import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function useConnections() {
  const connectionRequests = ref([])
  const sentRequests = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Récupère les demandes de connexion reçues
   */
  const getConnectionRequests = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: queryError } = await supabase
        .from('connections')
        .select(`
          id,
          requester_id,
          status,
          created_at,
          users!connections_requester_id_fkey(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email,
            address,
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
            )
          )
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (queryError) {
        throw queryError
      }

      connectionRequests.value = data || []
    } catch (err) {
      console.error('Erreur lors de la récupération des demandes de connexion:', err)
      error.value = err.message
      connectionRequests.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Accepte une demande de connexion
   */
  const acceptConnectionRequest = async (connectionId) => {
    try {
      const { error: updateError } = await supabase
        .from('connections')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)

      if (updateError) {
        throw updateError
      }

      // Supprimer de la liste locale
      connectionRequests.value = connectionRequests.value.filter(
        request => request.id !== connectionId
      )

      return { success: true }
    } catch (err) {
      console.error('Erreur lors de l\'acceptation de la demande:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Rejette une demande de connexion
   */
  const rejectConnectionRequest = async (connectionId) => {
    try {
      const { error: updateError } = await supabase
        .from('connections')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)

      if (updateError) {
        throw updateError
      }

      // Supprimer de la liste locale
      connectionRequests.value = connectionRequests.value.filter(
        request => request.id !== connectionId
      )

      return { success: true }
    } catch (err) {
      console.error('Erreur lors du rejet de la demande:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Bloque un utilisateur (rejette la demande et bloque)
   */
  const blockUser = async (connectionId, userId) => {
    try {
      // D'abord rejeter la demande
      await rejectConnectionRequest(connectionId)

      // Ensuite bloquer l'utilisateur
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: blockError } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: userId,
          reason: 'Bloqué depuis les demandes de connexion'
        })

      if (blockError && blockError.code !== '23505') { // Ignore duplicate key error
        throw blockError
      }

      return { success: true }
    } catch (err) {
      console.error('Erreur lors du blocage:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Vérifie le statut de connexion avec un utilisateur spécifique
   */
  const getConnectionStatus = async (userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { status: null, error: 'Utilisateur non connecté' }
      }

      // Vérifier s'il y a une connexion existante dans les deux sens
      const { data, error: queryError } = await supabase
        .from('connections')
        .select('id, status, requester_id, recipient_id')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`)
        .single()

      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw queryError
      }

      if (!data || ['cancelled', 'rejected'].includes(data.status)) {
        return { status: null, connectionId: null } // Aucune connexion active
      }

      return { 
        status: data.status, 
        connectionId: data.id,
        isSentByCurrentUser: data.requester_id === user.id
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du statut de connexion:', err)
      return { status: null, error: err.message }
    }
  }

  /**
   * Annule une demande de connexion (met le statut à 'cancelled')
   */
  const cancelConnectionRequest = async (connectionId) => {
    try {
      const { error: updateError } = await supabase
        .from('connections')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)

      if (updateError) {
        throw updateError
      }

      // Supprimer de la liste locale des demandes envoyées
      sentRequests.value = sentRequests.value.filter(
        request => request.id !== connectionId
      )

      return { success: true }
    } catch (err) {
      console.error('Erreur lors de l\'annulation de la demande:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Récupère les demandes de connexion envoyées
   */
  const getSentConnectionRequests = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: queryError } = await supabase
        .from('connections')
        .select(`
          id,
          recipient_id,
          status,
          created_at,
          updated_at,
          users!connections_recipient_id_fkey(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email,
            address,
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
            )
          )
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })

      if (queryError) {
        throw queryError
      }

      sentRequests.value = data || []
    } catch (err) {
      console.error('Erreur lors de la récupération des demandes envoyées:', err)
      error.value = err.message
      sentRequests.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    connectionRequests: computed(() => connectionRequests.value),
    sentRequests: computed(() => sentRequests.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getConnectionRequests,
    getSentConnectionRequests,
    getConnectionStatus,
    acceptConnectionRequest,
    rejectConnectionRequest,
    blockUser,
    cancelConnectionRequest
  }
}