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

  // Fonction utilitaire pour nettoyer les noms de fichiers
  const sanitizeFileName = (fileName) => {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Remplacer les caractères spéciaux par des underscores
      .replace(/_{2,}/g, '_') // Remplacer les underscores multiples par un seul
      .toLowerCase()
  }

  const fetchUserActivities = async (options = {}) => {
    const {
      page = 1,
      limit = 100,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filterStatus = null,
      searchTerm = '',
      eventId = null
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

      if (eventId) {
        query = query.eq('event_id', eventId)
      }

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

  const uploadDocument = async (activityId, file, title, types = null) => {
    try {
      const cleanFileName = sanitizeFileName(file.name)
      const fileName = `activities_document/${activityId}/${Date.now()}_${cleanFileName}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('epavillonv')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('epavillonv')
        .getPublicUrl(fileName)

      const insertData = {
        activity_id: activityId,
        title: title || file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        uploaded_by: authStore.user.id
      }

      // Add types if provided
      if (types && Array.isArray(types) && types.length > 0) {
        insertData.types = types
      }

      const { data, error: insertError } = await supabase
        .from('activity_documents')
        .insert(insertData)
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
        // Extract path from URL for epavillonv bucket
        const urlParts = doc.file_url.split('/object/public/epavillonv/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          await supabase.storage
            .from('epavillonv')
            .remove([filePath])
        }
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
      // Importer la fonction de traitement d'image
      const { processBannerImage, validateImageFile } = await import('@/utils/imageProcessor')

      // Récupérer les URLs actuelles pour suppression
      const { data: currentActivity } = await supabase
        .from('activities')
        .select('cover_image_high_url, cover_image_low_url')
        .eq('id', activityId)
        .eq('submitted_by', authStore.user.id)
        .single()

      // Valider le fichier
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'))
      }

      // Traiter l'image pour générer les deux versions
      const { highQuality, lowQuality } = await processBannerImage(file)

      const timestamp = Date.now()
      const cleanFileName = sanitizeFileName(file.name)

      // Upload de la version haute qualité
      const highQualityFileName = `activities_banner/${activityId}_${type}_hq_${timestamp}_${cleanFileName}`
      const { error: hqUploadError } = await supabase.storage
        .from('epavillonp')
        .upload(highQualityFileName, highQuality.file)

      if (hqUploadError) {
        console.error('High quality upload error:', hqUploadError)
        throw hqUploadError
      }

      // Upload de la version basse qualité
      const lowQualityFileName = `activities_banner/${activityId}_${type}_lq_${timestamp}_${cleanFileName}`
      const { error: lqUploadError } = await supabase.storage
        .from('epavillonp')
        .upload(lowQualityFileName, lowQuality.file)

      if (lqUploadError) {
        console.error('Low quality upload error:', lqUploadError)
        throw lqUploadError
      }

      // Obtenir les URLs publiques
      const { data: hqUrlData } = supabase.storage
        .from('epavillonp')
        .getPublicUrl(highQualityFileName)

      const { data: lqUrlData } = supabase.storage
        .from('epavillonp')
        .getPublicUrl(lowQualityFileName)

      // Mettre à jour la base de données avec les deux URLs
      const { data, error: updateError } = await supabase
        .from('activities')
        .update({
          cover_image_high_url: hqUrlData.publicUrl,
          cover_image_low_url: lqUrlData.publicUrl
        })
        .eq('id', activityId)
        .eq('submitted_by', authStore.user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Supprimer les anciennes bannières si elles existent
      if (currentActivity?.cover_image_high_url) {
        try {
          const urlParts = currentActivity.cover_image_high_url.split('/object/public/epavillonp/')
          if (urlParts.length > 1) {
            const oldBannerPath = urlParts[1]
            if (oldBannerPath.startsWith('activities_banner/')) {
              await supabase.storage
                .from('epavillonp')
                .remove([oldBannerPath])
            }
          }
        } catch (deleteErr) {
          console.warn('Could not delete old high quality banner:', deleteErr)
        }
      }

      if (currentActivity?.cover_image_low_url) {
        try {
          const urlParts = currentActivity.cover_image_low_url.split('/object/public/epavillonp/')
          if (urlParts.length > 1) {
            const oldBannerPath = urlParts[1]
            if (oldBannerPath.startsWith('activities_banner/')) {
              await supabase.storage
                .from('epavillonp')
                .remove([oldBannerPath])
            }
          }
        } catch (deleteErr) {
          console.warn('Could not delete old low quality banner:', deleteErr)
        }
      }

      return data
    } catch (err) {
      console.error('Error uploading banner:', err)
      throw err
    }
  }

  const uploadSpeakerPhoto = async (speakerId, file, onProgress = null) => {
    try {
      // Importer la fonction de traitement d'image
      const { processSpeakerPhoto, validateImageFile } = await import('@/utils/imageProcessor')

      // Notifier le début du processus
      if (onProgress) onProgress({ stage: 'validation', progress: 10 })

      // Récupérer les URLs actuelles pour suppression
      const { data: currentSpeaker } = await supabase
        .from('activity_speakers')
        .select('photo_url, photo_thumbnail_url')
        .eq('id', speakerId)
        .single()

      // Valider le fichier
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'))
      }

      // Notifier le début du traitement
      if (onProgress) onProgress({ stage: 'processing', progress: 20 })

      // Traiter l'image pour générer les deux versions
      const { highQuality, thumbnail } = await processSpeakerPhoto(file)

      const timestamp = Date.now()

      // Nettoyer le nom de fichier pour éviter les caractères spéciaux
      const cleanFileName = sanitizeFileName(file.name)

      // Notifier le début de l'upload
      if (onProgress) onProgress({ stage: 'uploading_hq', progress: 40 })

      // Upload de la version haute qualité
      const highQualityFileName = `intervenants/${speakerId}_hq_${timestamp}_${cleanFileName}`
      const { error: hqUploadError } = await supabase.storage
        .from('epavillonp')
        .upload(highQualityFileName, highQuality.file)

      if (hqUploadError) {
        console.error('High quality upload error:', hqUploadError)
        throw hqUploadError
      }

      // Notifier l'upload de la miniature
      if (onProgress) onProgress({ stage: 'uploading_thumb', progress: 60 })

      // Upload de la miniature
      const thumbnailFileName = `intervenants/${speakerId}_thumb_${timestamp}_${cleanFileName}`
      const { error: thumbUploadError } = await supabase.storage
        .from('epavillonp')
        .upload(thumbnailFileName, thumbnail.file)

      if (thumbUploadError) {
        console.error('Thumbnail upload error:', thumbUploadError)
        throw thumbUploadError
      }

      // Notifier l'obtention des URLs
      if (onProgress) onProgress({ stage: 'getting_urls', progress: 80 })

      // Obtenir les URLs publiques
      const { data: hqUrlData } = supabase.storage
        .from('epavillonp')
        .getPublicUrl(highQualityFileName)

      const { data: thumbUrlData } = supabase.storage
        .from('epavillonp')
        .getPublicUrl(thumbnailFileName)

      // Notifier la mise à jour de la base de données
      if (onProgress) onProgress({ stage: 'updating_db', progress: 90 })

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

        // Supprimer les anciennes images si elles existent
        if (currentSpeaker?.photo_url) {
          try {
            // Extraire le chemin à partir de l'URL publique
            const urlParts = currentSpeaker.photo_url.split('/object/public/epavillonp/')
            if (urlParts.length > 1) {
              const oldPhotoPath = urlParts[1]
              if (oldPhotoPath.startsWith('intervenants/')) {
                await supabase.storage
                  .from('epavillonp')
                  .remove([oldPhotoPath])
              }
            }
          } catch (deleteErr) {
            console.warn('Could not delete old photo:', deleteErr)
          }
        }

        if (currentSpeaker?.photo_thumbnail_url) {
          try {
            // Extraire le chemin à partir de l'URL publique
            const urlParts = currentSpeaker.photo_thumbnail_url.split('/object/public/epavillonp/')
            if (urlParts.length > 1) {
              const oldThumbnailPath = urlParts[1]
              if (oldThumbnailPath.startsWith('intervenants/')) {
                await supabase.storage
                  .from('epavillonp')
                  .remove([oldThumbnailPath])
              }
            }
          } catch (deleteErr) {
            console.warn('Could not delete old thumbnail:', deleteErr)
          }
        }

        // Notifier la fin du processus
        if (onProgress) onProgress({ stage: 'completed', progress: 100 })
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

        // Supprimer les anciennes images en cas de fallback aussi
        if (currentSpeaker?.photo_url) {
          try {
            // Extraire le chemin à partir de l'URL publique
            const urlParts = currentSpeaker.photo_url.split('/object/public/epavillonp/')
            if (urlParts.length > 1) {
              const oldPhotoPath = urlParts[1]
              if (oldPhotoPath.startsWith('intervenants/')) {
                await supabase.storage
                  .from('epavillonp')
                  .remove([oldPhotoPath])
              }
            }
          } catch (deleteErr) {
            console.warn('Could not delete old photo in fallback:', deleteErr)
          }
        }

        // Notifier la fin du processus
        if (onProgress) onProgress({ stage: 'completed', progress: 100 })
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
