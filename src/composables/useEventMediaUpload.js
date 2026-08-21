import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const BUCKET = 'epavillonp'

// Dossier des images de couverture des activités : le seul dont les politiques
// RLS acceptent l'écriture pour ce type de média. On reprend donc à l'identique
// l'appel utilisé par les bannières d'activités (cf. useUserActivities.js) :
// même bucket, même dossier, même format de nom, aucune option d'upload.
const MEDIA_FOLDER = 'activities_banner'

// Nettoyage des noms de fichiers (identique à useUserActivities.js)
const sanitizeFileName = (fileName) => fileName
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9.-]/g, '_')
  .replace(/_{2,}/g, '_')
  .toLowerCase()

const BANNER_MAX_SIZE = 10 * 1024 * 1024 // 10 Mo
const LOGO_MAX_SIZE = 5 * 1024 * 1024 // 5 Mo

const BANNER_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']

/**
 * Upload des médias d'un événement (bannière et logo) vers le stockage Supabase.
 * Partagé entre le formulaire de création admin et le formulaire d'édition.
 */
export function useEventMediaUpload() {
  const { supabase } = useSupabase()

  const isUploading = ref(false)
  const uploadError = ref(null)

  const uploadFile = async (file, { kind, maxSize, allowedTypes, eventId }) => {
    if (!file) return null

    if (file.size > maxSize) {
      uploadError.value = `Le fichier est trop volumineux. Taille maximum : ${Math.round(maxSize / 1024 / 1024)}MB`
      return null
    }

    if (!allowedTypes.includes(file.type)) {
      uploadError.value = 'Type de fichier non supporté. Utilisez PNG, JPG, WebP' +
        (allowedTypes.includes('image/svg+xml') ? ' ou SVG' : '')
      return null
    }

    isUploading.value = true
    uploadError.value = null

    try {
      const fileName = `${MEDIA_FOLDER}/${eventId || 'temp'}_event_${kind}_${Date.now()}_${sanitizeFileName(file.name)}`

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file)

      if (error) throw error

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)

      if (!data?.publicUrl) {
        throw new Error('URL publique introuvable')
      }

      return data.publicUrl
    } catch (err) {
      console.error('Erreur lors du téléchargement du média:', err)
      uploadError.value = err.message?.includes('row-level security')
        ? `Le stockage refuse ce fichier (politique de sécurité sur le bucket "${BUCKET}", dossier "${MEDIA_FOLDER}"). Détail : ${err.message}`
        : `Erreur lors du téléchargement : ${err.message}`
      return null
    } finally {
      isUploading.value = false
    }
  }

  const uploadBanner = (file, eventId) => uploadFile(file, {
    kind: 'banner',
    maxSize: BANNER_MAX_SIZE,
    allowedTypes: BANNER_TYPES,
    eventId
  })

  const uploadLogo = (file, eventId) => uploadFile(file, {
    kind: 'logo',
    maxSize: LOGO_MAX_SIZE,
    allowedTypes: LOGO_TYPES,
    eventId
  })

  return {
    isUploading,
    uploadError,
    uploadBanner,
    uploadLogo
  }
}

export default useEventMediaUpload
