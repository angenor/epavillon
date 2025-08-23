import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export function useAppointments() {
  const appointments = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Récupère tous les rendez-vous de l'utilisateur connecté
   */
  const getUserAppointments = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: queryError } = await supabase
        .from('appointments')
        .select(`
          id,
          requester_id,
          recipient_id,
          appointment_type,
          scheduled_at,
          status,
          meeting_link,
          notes,
          created_at,
          requester:requester_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email
          ),
          recipient:recipient_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email
          )
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: true })

      if (queryError) {
        throw queryError
      }

      appointments.value = data || []
    } catch (err) {
      console.error('Erreur lors de la récupération des rendez-vous:', err)
      error.value = err.message
      appointments.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Propose un nouveau rendez-vous
   */
  const requestAppointment = async (recipientId, appointmentType, scheduledAt, notes) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Vérifier que l'utilisateur a une connexion acceptée avec le destinataire
      const { data: connectionData, error: connectionError } = await supabase
        .from('connections')
        .select('status')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle()

      if (connectionError) {
        throw connectionError
      }

      if (!connectionData) {
        throw new Error('Vous devez être connecté avec cet utilisateur pour proposer un rendez-vous')
      }

      // Générer un lien de réunion pour les RDV vidéo/audio
      let meetingLink = null
      if (appointmentType === 'video' || appointmentType === 'audio') {
        // Générer un ID unique pour la réunion
        const meetingId = `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        meetingLink = `https://meet.jit.si/epavilion-${meetingId}`
      }

      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          appointment_type: appointmentType,
          scheduled_at: scheduledAt,
          meeting_link: meetingLink,
          notes: notes?.trim(),
          status: 'pending'
        })
        .select(`
          id,
          requester_id,
          recipient_id,
          appointment_type,
          scheduled_at,
          status,
          meeting_link,
          notes,
          created_at,
          requester:requester_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email
          ),
          recipient:recipient_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email
          )
        `)
        .single()

      if (insertError) {
        throw insertError
      }

      // Ajouter à la liste locale
      appointments.value.push(data)

      // Trier par date
      appointments.value.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))

      return { success: true, appointment: data }
    } catch (err) {
      console.error('Erreur lors de la demande de rendez-vous:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Confirme un rendez-vous
   */
  const confirmAppointment = async (appointmentId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .eq('recipient_id', user.id) // Seul le destinataire peut confirmer
        .select(`
          id,
          requester_id,
          recipient_id,
          appointment_type,
          scheduled_at,
          status,
          meeting_link,
          notes,
          created_at,
          requester:requester_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email
          ),
          recipient:recipient_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email
          )
        `)
        .single()

      if (updateError) {
        throw updateError
      }

      // Mettre à jour localement
      const index = appointments.value.findIndex(apt => apt.id === appointmentId)
      if (index !== -1) {
        appointments.value[index] = data
      }

      return { success: true, appointment: data }
    } catch (err) {
      console.error('Erreur lors de la confirmation du rendez-vous:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Annule un rendez-vous
   */
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`) // Les deux parties peuvent annuler
        .select(`
          id,
          requester_id,
          recipient_id,
          appointment_type,
          scheduled_at,
          status,
          meeting_link,
          notes,
          created_at,
          requester:requester_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email
          ),
          recipient:recipient_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email
          )
        `)
        .single()

      if (updateError) {
        throw updateError
      }

      // Mettre à jour localement
      const index = appointments.value.findIndex(apt => apt.id === appointmentId)
      if (index !== -1) {
        appointments.value[index] = data
      }

      return { success: true, appointment: data }
    } catch (err) {
      console.error('Erreur lors de l\'annulation du rendez-vous:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Marque un rendez-vous comme terminé
   */
  const completeAppointment = async (appointmentId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .select(`
          id,
          requester_id,
          recipient_id,
          appointment_type,
          scheduled_at,
          status,
          meeting_link,
          notes,
          created_at,
          requester:requester_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email
          ),
          recipient:recipient_id(
            id,
            first_name,
            last_name,
            profile_photo_thumbnail_url,
            email
          )
        `)
        .single()

      if (updateError) {
        throw updateError
      }

      // Mettre à jour localement
      const index = appointments.value.findIndex(apt => apt.id === appointmentId)
      if (index !== -1) {
        appointments.value[index] = data
      }

      return { success: true, appointment: data }
    } catch (err) {
      console.error('Erreur lors de la finalisation du rendez-vous:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Supprime un rendez-vous
   */
  const deleteAppointment = async (appointmentId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)

      if (deleteError) {
        throw deleteError
      }

      // Supprimer localement
      appointments.value = appointments.value.filter(apt => apt.id !== appointmentId)

      return { success: true }
    } catch (err) {
      console.error('Erreur lors de la suppression du rendez-vous:', err)
      return { success: false, error: err.message }
    }
  }

  // Computed properties
  const upcomingAppointments = computed(() => {
    const now = new Date()
    return appointments.value.filter(apt => 
      ['pending', 'confirmed'].includes(apt.status) && 
      new Date(apt.scheduled_at) > now
    ).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
  })

  const pastAppointments = computed(() => {
    const now = new Date()
    return appointments.value.filter(apt => 
      new Date(apt.scheduled_at) <= now || 
      ['cancelled', 'completed'].includes(apt.status)
    ).sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
  })

  const pendingAppointments = computed(() => {
    return appointments.value.filter(apt => apt.status === 'pending')
  })

  const confirmedAppointments = computed(() => {
    return appointments.value.filter(apt => apt.status === 'confirmed')
  })

  return {
    appointments: computed(() => appointments.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    upcomingAppointments,
    pastAppointments,
    pendingAppointments,
    confirmedAppointments,
    getUserAppointments,
    requestAppointment,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    deleteAppointment
  }
}