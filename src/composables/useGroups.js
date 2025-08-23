import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function useGroups() {
  const groups = ref([])
  const currentGroup = ref(null)
  const groupMembers = ref([])
  const groupMessages = ref([])
  const loading = ref(false)
  const error = ref(null)
  const sendingMessage = ref(false)

  /**
   * Récupère tous les groupes de l'utilisateur connecté
   */
  const getUserGroups = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: queryError } = await supabase
        .from('group_members')
        .select(`
          id,
          is_admin,
          joined_at,
          message_groups!inner(
            id,
            name,
            description,
            created_at,
            created_by,
            creator:created_by(
              id,
              first_name,
              last_name,
              profile_photo_thumbnail_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })

      if (queryError) {
        throw queryError
      }

      // Récupérer le dernier message et le nombre de membres pour chaque groupe
      const groupsWithDetails = await Promise.all((data || []).map(async (membership) => {
        const group = membership.message_groups
        
        // Dernier message
        const { data: lastMessage } = await supabase
          .from('group_messages')
          .select(`
            id,
            content,
            created_at,
            sender:sender_id(
              id,
              first_name,
              last_name
            )
          `)
          .eq('group_id', group.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Nombre de membres
        const { count: memberCount } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id)

        return {
          id: group.id,
          name: group.name,
          description: group.description,
          created_at: group.created_at,
          creator: group.creator,
          is_admin: membership.is_admin,
          joined_at: membership.joined_at,
          member_count: memberCount || 0,
          last_message: lastMessage
        }
      }))

      groups.value = groupsWithDetails
    } catch (err) {
      console.error('Erreur lors de la récupération des groupes:', err)
      error.value = err.message
      groups.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée un nouveau groupe
   */
  const createGroup = async (name, description) => {
    if (!name?.trim()) {
      return { success: false, error: 'Le nom du groupe est requis' }
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Créer le groupe
      const { data: groupData, error: groupError } = await supabase
        .from('message_groups')
        .insert({
          name: name.trim(),
          description: description?.trim(),
          created_by: user.id
        })
        .select()
        .single()

      if (groupError) {
        throw groupError
      }

      // Ajouter le créateur comme administrateur
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          is_admin: true
        })

      if (memberError) {
        throw memberError
      }

      // Mettre à jour la liste locale
      await getUserGroups()

      return { success: true, group: groupData }
    } catch (err) {
      console.error('Erreur lors de la création du groupe:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Récupère les membres d'un groupe
   */
  const getGroupMembers = async (groupId) => {
    try {
      const { data, error: queryError } = await supabase
        .from('group_members')
        .select(`
          id,
          is_admin,
          joined_at,
          user:user_id(
            id,
            first_name,
            last_name,
            email,
            profile_photo_thumbnail_url,
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
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true })

      if (queryError) {
        throw queryError
      }

      groupMembers.value = data || []
      return data || []
    } catch (err) {
      console.error('Erreur lors de la récupération des membres:', err)
      error.value = err.message
      return []
    }
  }

  /**
   * Ajoute un membre au groupe
   */
  const addMemberToGroup = async (groupId, userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Vérifier que l'utilisateur actuel est admin du groupe
      const { data: adminCheck } = await supabase
        .from('group_members')
        .select('is_admin')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (!adminCheck?.is_admin) {
        throw new Error('Seuls les administrateurs peuvent ajouter des membres')
      }

      // Vérifier que l'utilisateur à ajouter a une connexion acceptée
      const { data: connectionData } = await supabase
        .from('connections')
        .select('status')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle()

      if (!connectionData) {
        throw new Error('Vous devez être connecté avec cet utilisateur pour l\'ajouter au groupe')
      }

      const { error: insertError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          is_admin: false
        })

      if (insertError) {
        throw insertError
      }

      // Mettre à jour la liste des membres
      await getGroupMembers(groupId)

      return { success: true }
    } catch (err) {
      console.error('Erreur lors de l\'ajout du membre:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Retire un membre du groupe
   */
  const removeMemberFromGroup = async (groupId, userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Vérifier que l'utilisateur actuel est admin du groupe (sauf s'il se retire lui-même)
      if (userId !== user.id) {
        const { data: adminCheck } = await supabase
          .from('group_members')
          .select('is_admin')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .single()

        if (!adminCheck?.is_admin) {
          throw new Error('Seuls les administrateurs peuvent retirer des membres')
        }
      }

      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)

      if (deleteError) {
        throw deleteError
      }

      // Mettre à jour la liste des membres
      await getGroupMembers(groupId)

      return { success: true }
    } catch (err) {
      console.error('Erreur lors du retrait du membre:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Récupère les messages d'un groupe
   */
  const getGroupMessages = async (groupId, limit = 50) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('group_messages')
        .select(`
          id,
          group_id,
          sender_id,
          content,
          created_at,
          sender:sender_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (queryError) {
        throw queryError
      }

      // Inverser l'ordre pour avoir les messages dans l'ordre chronologique
      groupMessages.value = (data || []).reverse()

    } catch (err) {
      console.error('Erreur lors de la récupération des messages du groupe:', err)
      error.value = err.message
      groupMessages.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Envoie un message dans un groupe
   */
  const sendGroupMessage = async (groupId, content) => {
    if (!content?.trim()) {
      return { success: false, error: 'Le message ne peut pas être vide' }
    }

    sendingMessage.value = true

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Vérifier que l'utilisateur est membre du groupe
      const { data: memberCheck } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (!memberCheck) {
        throw new Error('Vous devez être membre du groupe pour envoyer un message')
      }

      const { data, error: insertError } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          sender_id: user.id,
          content: content.trim()
        })
        .select(`
          id,
          group_id,
          sender_id,
          content,
          created_at,
          sender:sender_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url
          )
        `)
        .single()

      if (insertError) {
        throw insertError
      }

      // Ajouter le message à la liste locale si on est dans le bon groupe
      if (currentGroup.value?.id === groupId) {
        groupMessages.value.push(data)
      }

      return { success: true, message: data }
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message de groupe:', err)
      return { success: false, error: err.message }
    } finally {
      sendingMessage.value = false
    }
  }

  /**
   * Met à jour les informations d'un groupe
   */
  const updateGroup = async (groupId, name, description) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Vérifier que l'utilisateur est admin du groupe
      const { data: adminCheck } = await supabase
        .from('group_members')
        .select('is_admin')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (!adminCheck?.is_admin) {
        throw new Error('Seuls les administrateurs peuvent modifier le groupe')
      }

      const { error: updateError } = await supabase
        .from('message_groups')
        .update({
          name: name?.trim(),
          description: description?.trim()
        })
        .eq('id', groupId)

      if (updateError) {
        throw updateError
      }

      // Mettre à jour la liste locale
      await getUserGroups()

      return { success: true }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du groupe:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Supprime un groupe
   */
  const deleteGroup = async (groupId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Vérifier que l'utilisateur est admin du groupe
      const { data: adminCheck } = await supabase
        .from('group_members')
        .select('is_admin')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (!adminCheck?.is_admin) {
        throw new Error('Seuls les administrateurs peuvent supprimer le groupe')
      }

      const { error: deleteError } = await supabase
        .from('message_groups')
        .delete()
        .eq('id', groupId)

      if (deleteError) {
        throw deleteError
      }

      // Mettre à jour la liste locale
      await getUserGroups()

      return { success: true }
    } catch (err) {
      console.error('Erreur lors de la suppression du groupe:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Définit le groupe courant
   */
  const setCurrentGroup = (group) => {
    currentGroup.value = group
  }

  return {
    groups: computed(() => groups.value),
    currentGroup: computed(() => currentGroup.value),
    groupMembers: computed(() => groupMembers.value),
    groupMessages: computed(() => groupMessages.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    sendingMessage: computed(() => sendingMessage.value),
    getUserGroups,
    createGroup,
    getGroupMembers,
    addMemberToGroup,
    removeMemberFromGroup,
    getGroupMessages,
    sendGroupMessage,
    updateGroup,
    deleteGroup,
    setCurrentGroup
  }
}