import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'

export const ORGANIZATION_TYPES = [
  'public_national_institution',
  'international_organization',
  'regional_organization',
  'ngo_association',
  'private_sector'
]

const MAX_LOGO_SIZE = 500 * 1024
const STORAGE_BUCKET = 'epavillonp'
const UNIQUE_VIOLATION = '23505'

const EDITABLE_FIELDS = [
  'name',
  'acronym',
  'email',
  'organization_type',
  'country_id',
  'website',
  'description'
]

/**
 * Formulaire de création / modification d'une organisation.
 * Le logo est obligatoire : un nouveau fichier en création, ou le logo existant en modification.
 *
 * @param {Object|null} organization - Organisation à modifier (null pour une création)
 */
export function useOrganizationForm(organization = null) {
  const { t } = useI18n()
  const { supabase } = useSupabase()
  const authStore = useAuthStore()

  const isEdit = computed(() => !!organization?.id)

  const form = reactive(
    Object.fromEntries(EDITABLE_FIELDS.map(field => [field, organization?.[field] || '']))
  )

  const logoFile = ref(null)
  const logoPreview = ref(organization?.logo_url || '')
  const errors = ref({})
  const submitError = ref('')
  const submitting = ref(false)

  const selectLogo = (file) => {
    if (!file) return

    if (file.size > MAX_LOGO_SIZE) {
      errors.value.logo = t('organization.errors.logoTooLarge')
      return
    }

    delete errors.value.logo
    logoFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }

  const formatWebsite = () => {
    const url = form.website.trim().replace(/^(https?:\/\/)?/, '')
    form.website = url ? `https://${url}` : ''
  }

  const validate = () => {
    errors.value = {}

    if (!form.name.trim()) errors.value.name = t('organization.errors.nameRequired')
    if (!form.email.trim()) errors.value.email = t('organization.errors.emailRequired')
    if (!form.organization_type) errors.value.type = t('organization.errors.typeRequired')
    if (!form.country_id) errors.value.country = t('organization.errors.countryRequired')
    if (!logoFile.value && !organization?.logo_url) errors.value.logo = t('organization.errors.logoRequired')

    return Object.keys(errors.value).length === 0
  }

  // Nom horodaté : évite le cache navigateur/CDN quand le logo est remplacé
  const uploadLogo = async (organizationId) => {
    const fileExt = logoFile.value.name.split('.').pop()
    const fileName = `logo/${organizationId}_logo_${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, logoFile.value, { upsert: true })

    if (error) {
      console.error('Error uploading logo:', error)
      throw new Error(t('organization.errors.logoUploadFailed'))
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    return publicUrl
  }

  const buildPayload = () => Object.fromEntries(
    EDITABLE_FIELDS.map(field => [field, form[field]?.trim?.() || null])
  )

  const toErrorMessage = (error) => {
    if (error?.code === UNIQUE_VIOLATION) return t('organization.errors.emailTaken')
    return error?.message || t('organization.errors.saveFailed')
  }

  /**
   * Valide puis enregistre l'organisation.
   * Le logo est envoyé avant l'écriture en base : une organisation n'est jamais créée sans logo.
   * @returns {Promise<Object|null>} L'organisation enregistrée, ou null si invalide / en erreur
   */
  const save = async () => {
    if (submitting.value) return null
    submitError.value = ''
    if (form.website) formatWebsite()
    if (!validate()) return null

    submitting.value = true
    try {
      const organizationId = organization?.id || crypto.randomUUID()
      const payload = buildPayload()

      if (logoFile.value) {
        payload.logo_url = await uploadLogo(organizationId)
      }

      const query = isEdit.value
        ? supabase.from('organizations').update(payload).eq('id', organizationId)
        : supabase.from('organizations').insert({ ...payload, id: organizationId, created_by: authStore.user.id })

      const { data, error } = await query.select().single()
      if (error) throw error

      return data
    } catch (error) {
      console.error('Error saving organization:', error)
      submitError.value = toErrorMessage(error)
      return null
    } finally {
      submitting.value = false
    }
  }

  return {
    form,
    isEdit,
    logoPreview,
    errors,
    submitError,
    submitting,
    selectLogo,
    formatWebsite,
    save
  }
}
