import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'
import { compressImage, isImageFile } from '@/utils/imageCompression'

/**
 * Composable pour gérer la galerie de médias d'une activité
 * @param {string} activityId - ID de l'activité
 */
export function useMediaGallery(activityId) {
  const { supabase } = useSupabase()
  const authStore = useAuthStore()

  // État
  const medias = ref([])
  const showAddMediaModal = ref(false)
  const uploadingMedia = ref(false)
  const uploadProgress = ref(0)
  const selectedMediaFile = ref(null)
  const showMediaViewerModal = ref(false)
  const selectedMedia = ref(null)

  // Formulaire pour nouveau média
  const newMediaForm = ref({
    title: '',
    description: '',
    author: ''
  })

  // Chargement des médias
  const loadMedias = async () => {
    try {
      const { data, error } = await supabase
        .from('media_gallery')
        .select('*')
        .eq('context_type', 'activity')
        .eq('context_id', activityId)
        .order('created_at', { ascending: false })

      if (error) throw error
      medias.value = data || []
    } catch (error) {
      console.error('Error loading medias:', error)
      throw error
    }
  }

  // Ouvrir/fermer le modal d'ajout
  const openAddMediaModal = () => {
    showAddMediaModal.value = true
  }

  const closeAddMediaModal = () => {
    showAddMediaModal.value = false
    resetMediaForm()
  }

  // Réinitialiser le formulaire
  const resetMediaForm = () => {
    newMediaForm.value = {
      title: '',
      description: '',
      author: ''
    }
    selectedMediaFile.value = null
    uploadProgress.value = 0
  }

  // Sélection de fichier
  const onMediaFileSelected = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      selectedMediaFile.value = file
    } else {
      alert('Veuillez sélectionner une image valide')
      event.target.value = ''
    }
  }

  // Uploader une image vers Supabase Storage
  const uploadMediaFile = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${activityId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `activity-media/${fileName}`

    // Upload du fichier original (haute résolution)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('activity-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('activity-media')
      .getPublicUrl(filePath)

    // Créer une miniature (optionnel - pour l'instant on utilise la même URL)
    const thumbnailUrl = urlData.publicUrl

    return {
      mediaUrl: urlData.publicUrl,
      thumbnailUrl
    }
  }

  // Soumettre un nouveau média
  const submitNewMedia = async () => {
    if (!selectedMediaFile.value) {
      throw new Error('Veuillez sélectionner une image')
    }

    if (!newMediaForm.value.title.trim()) {
      throw new Error('Veuillez saisir un titre')
    }

    if (!isImageFile(selectedMediaFile.value)) {
      throw new Error('Le fichier doit être une image')
    }

    try {
      uploadingMedia.value = true
      uploadProgress.value = 0

      // Étape 1 : Compression de l'image (0-30%)
      uploadProgress.value = 5
      const compressedBlob = await compressImage(selectedMediaFile.value, (progress) => {
        // La compression représente 30% de la progression totale
        uploadProgress.value = Math.round((progress * 30) / 100)
      })

      // Créer un fichier à partir du blob compressé
      const fileExt = selectedMediaFile.value.name.split('.').pop()
      const compressedFile = new File([compressedBlob], selectedMediaFile.value.name, {
        type: compressedBlob.type || 'image/jpeg'
      })

      console.log(`Image compressée: ${Math.round(selectedMediaFile.value.size / 1024)}KB → ${Math.round(compressedFile.size / 1024)}KB`)

      // Étape 2 : Upload du fichier (30-60%)
      uploadProgress.value = 30
      const { mediaUrl, thumbnailUrl } = await uploadMediaFile(compressedFile)

      uploadProgress.value = 60

      // Étape 3 : Créer l'entrée dans la base de données (60-100%)
      const { data, error } = await supabase
        .from('media_gallery')
        .insert({
          media_type: 'photo',
          media_url: mediaUrl,
          thumbnail_url: thumbnailUrl,
          title: newMediaForm.value.title.trim(),
          description: newMediaForm.value.description?.trim() || null,
          author: newMediaForm.value.author?.trim() || null,
          context_type: 'activity',
          context_id: activityId,
          uploaded_by: authStore.user?.id
        })
        .select()
        .single()

      if (error) throw error

      uploadProgress.value = 100

      // Ajouter à la liste
      medias.value.unshift(data)

      // Fermer le modal
      closeAddMediaModal()
    } catch (error) {
      console.error('Error submitting media:', error)
      throw error
    } finally {
      uploadingMedia.value = false
      uploadProgress.value = 0
    }
  }

  // Supprimer un média
  const removeMedia = async (mediaId) => {
    const confirmed = confirm('Voulez-vous vraiment supprimer cette photo ?')
    if (!confirmed) return

    try {
      const media = medias.value.find(m => m.id === mediaId)
      if (!media) return

      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from('media_gallery')
        .delete()
        .eq('id', mediaId)

      if (deleteError) throw deleteError

      // Supprimer le fichier du storage
      if (media.media_url) {
        try {
          const urlParts = media.media_url.split('/activity-media/')
          if (urlParts.length > 1) {
            const filePath = urlParts[1]
            await supabase.storage
              .from('activity-media')
              .remove([filePath])
          }
        } catch (storageError) {
          console.error('Error deleting file from storage:', storageError)
          // Continue même si la suppression du fichier échoue
        }
      }

      // Retirer de la liste
      medias.value = medias.value.filter(m => m.id !== mediaId)
    } catch (error) {
      console.error('Error removing media:', error)
      throw error
    }
  }

  // Afficher un média en grand
  const viewMedia = (media) => {
    selectedMedia.value = media
    showMediaViewerModal.value = true
  }

  const closeMediaViewer = () => {
    selectedMedia.value = null
    showMediaViewerModal.value = false
  }

  return {
    // État
    medias,
    showAddMediaModal,
    uploadingMedia,
    uploadProgress,
    selectedMediaFile,
    newMediaForm,
    showMediaViewerModal,
    selectedMedia,

    // Méthodes
    loadMedias,
    openAddMediaModal,
    closeAddMediaModal,
    onMediaFileSelected,
    submitNewMedia,
    removeMedia,
    viewMedia,
    closeMediaViewer
  }
}
