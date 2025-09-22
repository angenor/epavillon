import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'

export default function useUserActivities() {
  const { supabase } = useSupabase()
  const authStore = useAuthStore()

  const activities = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalCount = ref(0)

  const fetchUserActivities = async (options = {}) => {
    const {
      page = 1,
      limit = 100,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filterStatus = null,
      searchTerm = ''
    } = options

    loading.value = true
    error.value = null

    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      let query = supabase
        .from('activities')
        .select(`
          *,
          events(*),
          organizations(*),
          activity_speakers(count),
          activity_registrations(count),
          activity_documents(count)
        `, { count: 'exact' })
        .eq('submitted_by', authStore.user.id)
        .eq('is_deleted', false)

      if (filterStatus) {
        query = query.eq('validation_status', filterStatus)
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,detailed_presentation.ilike.%${searchTerm}%`)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      activities.value = data || []
      totalCount.value = count || 0

      return { data, count }
    } catch (err) {
      console.error('Error fetching user activities:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getActivityById = async (activityId) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('activities')
        .select(`
          *,
          events(*),
          organizations(*),
          activity_speakers(*),
          activity_registrations(*),
          activity_documents(*),
          activity_questions(*)
        `)
        .eq('id', activityId)
        .eq('submitted_by', authStore.user.id)
        .single()

      if (fetchError) throw fetchError

      return data
    } catch (err) {
      console.error('Error fetching activity details:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateActivity = async (activityId, updates) => {
    loading.value = true
    error.value = null

    try {
      const { data: oldData } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .eq('submitted_by', authStore.user.id)
        .single()

      if (!oldData) {
        throw new Error('Activity not found or unauthorized')
      }

      const { data, error: updateError } = await supabase
        .from('activities')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId)
        .eq('submitted_by', authStore.user.id)
        .select()
        .single()

      if (updateError) throw updateError

      const changedFields = Object.keys(updates).filter(
        key => oldData[key] !== updates[key]
      )

      for (const field of changedFields) {
        await supabase
          .from('activity_modifications')
          .insert({
            activity_id: activityId,
            field_name: field,
            old_value: { value: oldData[field] },
            new_value: { value: updates[field] },
            old_value_type: typeof oldData[field],
            new_value_type: typeof updates[field],
            modified_by: authStore.user.id
          })
      }

      return data
    } catch (err) {
      console.error('Error updating activity:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteActivity = async (activityId) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('activities')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: authStore.user.id,
          deleted_reason: 'User deleted'
        })
        .eq('id', activityId)
        .eq('submitted_by', authStore.user.id)

      if (deleteError) throw deleteError

      activities.value = activities.value.filter(a => a.id !== activityId)

      return true
    } catch (err) {
      console.error('Error deleting activity:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addSpeaker = async (activityId, speakerData) => {
    try {
      const { data, error: insertError } = await supabase
        .from('activity_speakers')
        .insert({
          activity_id: activityId,
          ...speakerData
        })
        .select()
        .single()

      if (insertError) throw insertError

      return data
    } catch (err) {
      console.error('Error adding speaker:', err)
      throw err
    }
  }

  const updateSpeaker = async (speakerId, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('activity_speakers')
        .update(updates)
        .eq('id', speakerId)
        .select()
        .single()

      if (updateError) throw updateError

      return data
    } catch (err) {
      console.error('Error updating speaker:', err)
      throw err
    }
  }

  const deleteSpeaker = async (speakerId) => {
    try {
      const { error: deleteError } = await supabase
        .from('activity_speakers')
        .delete()
        .eq('id', speakerId)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error deleting speaker:', err)
      throw err
    }
  }

  const uploadDocument = async (activityId, file, title) => {
    try {
      const fileName = `${activityId}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('activity-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('activity-documents')
        .getPublicUrl(fileName)

      const { data, error: insertError } = await supabase
        .from('activity_documents')
        .insert({
          activity_id: activityId,
          title: title || file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          uploaded_by: authStore.user.id
        })
        .select()
        .single()

      if (insertError) throw insertError

      return data
    } catch (err) {
      console.error('Error uploading document:', err)
      throw err
    }
  }

  const deleteDocument = async (documentId) => {
    try {
      const { data: doc } = await supabase
        .from('activity_documents')
        .select('file_url')
        .eq('id', documentId)
        .single()

      if (doc?.file_url) {
        const path = doc.file_url.split('/').slice(-2).join('/')
        await supabase.storage
          .from('activity-documents')
          .remove([path])
      }

      const { error: deleteError } = await supabase
        .from('activity_documents')
        .delete()
        .eq('id', documentId)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error deleting document:', err)
      throw err
    }
  }

  const uploadBanner = async (activityId, file, type = 'cover') => {
    try {
      const fileName = `${activityId}/${type}_${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('activity-banners')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('activity-banners')
        .getPublicUrl(fileName)

      const updateField = type === 'cover'
        ? 'cover_image_high_url'
        : 'banner_url'

      const { data, error: updateError } = await supabase
        .from('activities')
        .update({ [updateField]: urlData.publicUrl })
        .eq('id', activityId)
        .eq('submitted_by', authStore.user.id)
        .select()
        .single()

      if (updateError) throw updateError

      return data
    } catch (err) {
      console.error('Error uploading banner:', err)
      throw err
    }
  }

  const uploadSpeakerPhoto = async (speakerId, file) => {
    try {
      // Importer la fonction de traitement d'image
      const { processSpeakerPhoto, validateImageFile } = await import('@/utils/imageProcessor')

      // Valider le fichier
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'))
      }

      // Traiter l'image pour générer les deux versions
      const { highQuality, thumbnail } = await processSpeakerPhoto(file)

      const timestamp = Date.now()

      // Upload de la version haute qualité
      const highQualityFileName = `intervenants/${speakerId}_hq_${timestamp}_${file.name}`
      const { error: hqUploadError } = await supabase.storage
        .from('epavillonp')
        .upload(highQualityFileName, highQuality.file)

      if (hqUploadError) {
        console.error('High quality upload error:', hqUploadError)
        throw hqUploadError
      }

      // Upload de la miniature
      const thumbnailFileName = `intervenants/${speakerId}_thumb_${timestamp}_${file.name}`
      const { error: thumbUploadError } = await supabase.storage
        .from('epavillonp')
        .upload(thumbnailFileName, thumbnail.file)

      if (thumbUploadError) {
        console.error('Thumbnail upload error:', thumbUploadError)
        throw thumbUploadError
      }

      // Obtenir les URLs publiques
      const { data: hqUrlData } = supabase.storage
        .from('epavillonp')
        .getPublicUrl(highQualityFileName)

      const { data: thumbUrlData } = supabase.storage
        .from('epavillonp')
        .getPublicUrl(thumbnailFileName)

      // Vérifier d'abord si l'intervenant existe
      const { error: fetchError } = await supabase
        .from('activity_speakers')
        .select('id')
        .eq('id', speakerId)
        .single()

      if (fetchError) {
        console.error('Fetch speaker error:', fetchError)
        throw fetchError
      }

      // Essayer d'ajouter le champ thumbnail s'il existe
      try {
        const { data: testUpdate, error: testError } = await supabase
          .from('activity_speakers')
          .update({
            photo_url: hqUrlData.publicUrl,
            photo_thumbnail_url: thumbUrlData.publicUrl
          })
          .eq('id', speakerId)
          .select()
          .single()

        if (testError) {
          // Si erreur avec thumbnail, utiliser seulement photo_url
          console.warn('Thumbnail field not available, using only photo_url:', testError)
          const { data, error: updateError } = await supabase
            .from('activity_speakers')
            .update({ photo_url: hqUrlData.publicUrl })
            .eq('id', speakerId)
            .select()
            .single()

          if (updateError) throw updateError
          return { ...data, photo_thumbnail_url: thumbUrlData.publicUrl }
        }

        return testUpdate
      } catch (updateErr) {
        console.error('Update error, trying fallback:', updateErr)
        // Fallback: mettre à jour seulement photo_url
        const { data, error: updateError } = await supabase
          .from('activity_speakers')
          .update({ photo_url: hqUrlData.publicUrl })
          .eq('id', speakerId)
          .select()
          .single()

        if (updateError) throw updateError
        return { ...data, photo_thumbnail_url: thumbUrlData.publicUrl }
      }
    } catch (err) {
      console.error('Error uploading speaker photo:', err)
      throw err
    }
  }

  const sendConfirmationEmail = async (speakerId) => {
    try {
      const { data, error: updateError } = await supabase
        .from('activity_speakers')
        .update({
          confirmation_email_sent_at: new Date().toISOString(),
          has_confirmed_by_email: false
        })
        .eq('id', speakerId)
        .select()
        .single()

      if (updateError) throw updateError

      return data
    } catch (err) {
      console.error('Error sending confirmation email:', err)
      throw err
    }
  }

  const getActivityStatistics = computed(() => {
    return {
      total: activities.value.length,
      draft: activities.value.filter(a => a.validation_status === 'draft').length,
      submitted: activities.value.filter(a => a.validation_status === 'submitted').length,
      underReview: activities.value.filter(a => a.validation_status === 'under_review').length,
      approved: activities.value.filter(a => a.validation_status === 'approved').length,
      rejected: activities.value.filter(a => a.validation_status === 'rejected').length,
      cancelled: activities.value.filter(a => a.validation_status === 'cancelled').length,
      live: activities.value.filter(a => a.validation_status === 'live').length,
      completed: activities.value.filter(a => a.validation_status === 'completed').length
    }
  })

  return {
    activities,
    loading,
    error,
    totalCount,
    fetchUserActivities,
    getActivityById,
    updateActivity,
    deleteActivity,
    addSpeaker,
    updateSpeaker,
    deleteSpeaker,
    uploadDocument,
    deleteDocument,
    uploadBanner,
    uploadSpeakerPhoto,
    sendConfirmationEmail,
    getActivityStatistics
  }
}
