import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import useUserActivities from '@/composables/useUserActivities'

export function useDocumentManagement(activityId) {
  const { t } = useI18n()
  const { uploadDocument, deleteDocument } = useUserActivities()

  const documents = ref([])
  const showAddDocumentModal = ref(false)
  const savingNewDocument = ref(false)
  const selectedDocumentFile = ref(null)

  const newDocumentForm = reactive({
    title: '',
    type: '',
    file: null
  })

  const getDocumentIcon = (fileType) => {
    if (!fileType) return ['fas', 'file']

    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return ['fas', 'file-pdf']
    if (type.includes('word') || type.includes('doc')) return ['fas', 'file-word']
    if (type.includes('powerpoint') || type.includes('ppt')) return ['fas', 'file-powerpoint']
    if (type.includes('excel') || type.includes('xls')) return ['fas', 'file-excel']
    if (type.includes('text') || type.includes('txt')) return ['fas', 'file-alt']
    return ['fas', 'file']
  }

  const getDocumentIconColor = (fileType) => {
    if (!fileType) return 'text-gray-600 dark:text-gray-400'

    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return 'text-red-600'
    if (type.includes('word') || type.includes('doc')) return 'text-blue-600'
    if (type.includes('powerpoint') || type.includes('ppt')) return 'text-orange-600'
    if (type.includes('excel') || type.includes('xls')) return 'text-green-600'
    if (type.includes('text') || type.includes('txt')) return 'text-gray-600'
    return 'text-gray-600 dark:text-gray-400'
  }

  const addNewDocument = () => {
    Object.assign(newDocumentForm, {
      title: '',
      type: '',
      file: null
    })
    selectedDocumentFile.value = null
    showAddDocumentModal.value = true
  }

  const onDocumentFileSelected = (event) => {
    const file = event.target.files[0]
    if (file) {
      selectedDocumentFile.value = file
      newDocumentForm.file = file
    }
  }

  const validateNewDocument = () => {
    if (!newDocumentForm.title.trim()) {
      throw new Error(t('events.documentTitleRequired'))
    }

    if (!newDocumentForm.type) {
      throw new Error(t('events.documentTypeRequired'))
    }

    if (!newDocumentForm.file) {
      throw new Error(t('events.documentFileRequired'))
    }
  }

  const submitNewDocument = async () => {
    try {
      validateNewDocument()

      savingNewDocument.value = true
      const documentData = {
        title: newDocumentForm.title.trim(),
        types: [newDocumentForm.type], // Array as per database schema
        file: newDocumentForm.file
      }

      const newDocument = await uploadDocument(
        activityId,
        documentData.file,
        documentData.title,
        documentData.types
      )
      documents.value.push(newDocument)
      showAddDocumentModal.value = false
    } catch (error) {
      console.error('Error adding document:', error)
      throw error
    } finally {
      savingNewDocument.value = false
    }
  }

  const cancelAddDocument = () => {
    showAddDocumentModal.value = false
  }

  const removeDocument = async (docId) => {
    if (!confirm(t('events.confirmDeleteDocument'))) return

    try {
      await deleteDocument(docId)
      documents.value = documents.value.filter(d => d.id !== docId)
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  return {
    // Data
    documents,
    newDocumentForm,
    showAddDocumentModal,
    savingNewDocument,
    selectedDocumentFile,

    // Methods
    getDocumentIcon,
    getDocumentIconColor,
    addNewDocument,
    onDocumentFileSelected,
    submitNewDocument,
    cancelAddDocument,
    removeDocument
  }
}