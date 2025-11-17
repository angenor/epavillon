/**
 * Composable pour gérer le rapport de fin d'activité
 * Gère : compte rendu, témoignages, photos et validation
 */

import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'
import { useAuthStore } from '@/stores/auth'

export function useActivityCompletion(activityId) {
  const { supabase } = useSupabase()
  const authStore = useAuthStore()

  // État
  const loading = ref(false)
  const error = ref(null)
  const validationResult = ref(null)

  // Données du rapport
  const completionReport = ref('')
  const testimonials = ref([])
  const photos = ref([])

  // Modal state
  const showCompletionModal = ref(false)
  const hasCheckedCompletion = ref(false)

  // Formulaire de témoignage
  const testimonialForm = ref({
    userId: null,
    userName: '',
    userEmail: '',
    text: '',
    photoUrl: '',
    themes: []
  })

  // Computed
  const isReportComplete = computed(() => {
    return validationResult.value?.is_valid === true
  })

  const missingElements = computed(() => {
    return validationResult.value?.missing_elements || []
  })

  const hasReport = computed(() => {
    return completionReport.value && completionReport.value.trim() !== ''
  })

  const hasEnoughTestimonials = computed(() => {
    return testimonials.value.length >= 2
  })

  const hasPhotos = computed(() => {
    return photos.value.length > 0
  })

  /**
   * Valider si le rapport de fin d'activité est complet
   */
  async function validateCompletion() {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .rpc('validate_activity_completion', { activity_id: activityId })

      if (err) throw err

      validationResult.value = data?.[0] || { is_valid: false, missing_elements: [] }
      return validationResult.value.is_valid
    } catch (err) {
      console.error('Error validating completion:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les données du rapport de fin d'activité
   */
  async function loadCompletionData() {
    loading.value = true
    error.value = null

    try {
      // 1. Récupérer le compte rendu
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .select('completion_report')
        .eq('id', activityId)
        .single()

      if (activityError) throw activityError
      completionReport.value = activity.completion_report || ''

      // 2. Récupérer les témoignages
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from('user_testimonials')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .contains('context_type', ['activity'])
        .eq('context_id', activityId)
        .order('created_at', { ascending: false })

      if (testimonialsError) throw testimonialsError
      testimonials.value = testimonialsData || []

      // 3. Récupérer les photos
      const { data: photosData, error: photosError } = await supabase
        .from('media_gallery')
        .select('*')
        .eq('context_type', 'activity')
        .eq('context_id', activityId)
        .eq('media_type', 'photo')
        .order('created_at', { ascending: false })

      if (photosError) throw photosError
      photos.value = photosData || []

      // 4. Valider le statut de complétion
      await validateCompletion()

      return {
        report: completionReport.value,
        testimonials: testimonials.value,
        photos: photos.value
      }
    } catch (err) {
      console.error('Error loading completion data:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Sauvegarder le compte rendu
   */
  async function saveReport(reportText) {
    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('activities')
        .update({ completion_report: reportText })
        .eq('id', activityId)

      if (updateError) throw updateError

      completionReport.value = reportText
      await validateCompletion()

      return true
    } catch (err) {
      console.error('Error saving report:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Ajouter un témoignage
   */
  async function addTestimonial(testimonialData) {
    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('user_testimonials')
        .insert({
          user_id: testimonialData.userId || authStore.user?.id,
          testimonial_text: testimonialData.text,
          context_type: ['activity'],
          context_id: activityId,
          thematique_type: testimonialData.themes || [],
          photo_url: testimonialData.photoUrl || null,
          featured: false
        })
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .single()

      if (insertError) throw insertError

      testimonials.value.unshift(data)
      await validateCompletion()

      return data
    } catch (err) {
      console.error('Error adding testimonial:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprimer un témoignage
   */
  async function removeTestimonial(testimonialId) {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('user_testimonials')
        .delete()
        .eq('id', testimonialId)

      if (deleteError) throw deleteError

      testimonials.value = testimonials.value.filter(t => t.id !== testimonialId)
      await validateCompletion()

      return true
    } catch (err) {
      console.error('Error removing testimonial:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Upload une photo pour le témoignage
   */
  async function uploadTestimonialPhoto(file, userId) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `testimonials/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('activity-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('activity-media')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Error uploading testimonial photo:', err)
      throw err
    }
  }

  /**
   * Vérifier si le modal doit être affiché automatiquement
   */
  async function checkAndShowModal(activityStatus) {
    // Ne montrer le modal qu'une fois par session
    if (hasCheckedCompletion.value) return

    // Ne montrer que si l'activité est completed
    if (activityStatus !== 'completed') return

    hasCheckedCompletion.value = true

    // Charger les données
    await loadCompletionData()

    // Afficher le modal si le rapport n'est pas complet
    if (!validationResult.value?.is_valid) {
      showCompletionModal.value = true
    }
  }

  /**
   * Fermer le modal
   */
  function closeModal() {
    showCompletionModal.value = false
  }

  /**
   * Réinitialiser le formulaire de témoignage
   */
  function resetTestimonialForm() {
    testimonialForm.value = {
      userId: null,
      userName: '',
      userEmail: '',
      text: '',
      photoUrl: '',
      themes: []
    }
  }

  return {
    // État
    loading,
    error,
    validationResult,
    showCompletionModal,
    hasCheckedCompletion,

    // Données
    completionReport,
    testimonials,
    photos,
    testimonialForm,

    // Computed
    isReportComplete,
    missingElements,
    hasReport,
    hasEnoughTestimonials,
    hasPhotos,

    // Méthodes
    validateCompletion,
    loadCompletionData,
    saveReport,
    addTestimonial,
    removeTestimonial,
    uploadTestimonialPhoto,
    checkAndShowModal,
    closeModal,
    resetTestimonialForm
  }
}
