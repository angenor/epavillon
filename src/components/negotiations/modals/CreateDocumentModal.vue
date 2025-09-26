<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ $t('admin.createDocument') }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
        >
          <font-awesome-icon icon="times" class="w-6 h-6" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('common.title') }} *
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('admin.documentTitlePlaceholder')"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('common.description') }}
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('admin.documentDescriptionPlaceholder')"
          ></textarea>
        </div>

        <!-- Document Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.documentType') }} *
          </label>
          <select
            v-model="form.document_type"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
          >
            <option value="">{{ $t('admin.selectDocumentType') }}</option>
            <option value="guide">{{ $t('admin.documentTypes.guide') }}</option>
            <option value="template">{{ $t('admin.documentTypes.template') }}</option>
            <option value="best_practices">{{ $t('admin.documentTypes.bestPractices') }}</option>
            <option value="case_study">{{ $t('admin.documentTypes.caseStudy') }}</option>
            <option value="research">{{ $t('admin.documentTypes.research') }}</option>
            <option value="policy">{{ $t('admin.documentTypes.policy') }}</option>
          </select>
        </div>

        <!-- File Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.documentFile') }}
          </label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <font-awesome-icon
                icon="cloud-upload-alt"
                class="mx-auto h-12 w-12 text-gray-400"
              />
              <div class="flex text-sm text-gray-600 dark:text-gray-400">
                <label class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>{{ $t('admin.uploadFile') }}</span>
                  <input
                    @change="handleFileChange"
                    type="file"
                    class="sr-only"
                    accept=".pdf,.doc,.docx,.txt,.md"
                  />
                </label>
                <p class="pl-1">{{ $t('admin.orDragAndDrop') }}</p>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ $t('admin.supportedFormats') }}
              </p>
              <div v-if="selectedFile" class="mt-2 text-sm text-green-600">
                <font-awesome-icon icon="check" class="mr-1" />
                {{ selectedFile.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- URL (alternative to file) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('admin.documentUrl') }}
          </label>
          <input
            v-model="form.url"
            type="url"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('admin.documentUrlPlaceholder')"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ $t('admin.documentUrlHelper') }}
          </p>
        </div>


        <!-- Actions -->
        <div class="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 cursor-pointer"
          >
            <font-awesome-icon v-if="loading" icon="spinner" spin class="mr-2" />
            {{ loading ? $t('common.creating') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'

// Props
const props = defineProps({
  category: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'created'])

// Composables
const { from, storage } = useSupabase()
const authStore = useAuthStore()

// State
const loading = ref(false)
const selectedFile = ref(null)
const form = reactive({
  title: '',
  description: '',
  document_type: '',
  url: ''
})

// Methods
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const uploadFile = async (file) => {
  // Clean filename: remove special characters, spaces, and normalize
  const cleanName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores

  const fileName = `doc_nego/${Date.now()}_${cleanName}`
  const { data, error } = await storage
    .from('epavillonp')
    .upload(fileName, file)

  if (error) throw error

  // Get public URL
  const { data: urlData } = storage
    .from('epavillonp')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

const handleSubmit = async () => {
  try {
    loading.value = true

    let fileUrl = form.url

    // Upload file if selected
    if (selectedFile.value) {
      fileUrl = await uploadFile(selectedFile.value)
    }

    // Validate that we have a file URL
    if (!fileUrl) {
      throw new Error('Veuillez fournir un fichier ou une URL de document')
    }

    // Map category from props to database enum values
    const categoryMapping = {
      'climat': 'climate',
      'biodiversite': 'biodiversity',
      'desertification': 'desertification'
    }

    // Map document type to database enum values
    const documentTypeMapping = {
      'guide': 'negotiation_guide',
      'template': 'relevant_document',
      'bestPractices': 'relevant_document',
      'caseStudy': 'relevant_document',
      'research': 'technical_note',
      'policy': 'relevant_document'
    }

    const documentData = {
      title: form.title,
      description: form.description || null,
      category: categoryMapping[props.category] || 'climate',
      document_type: documentTypeMapping[form.document_type] || 'other',
      file_url: fileUrl,
      uploaded_by: authStore.user?.id || null
    }

    console.log('Attempting to create document with data:', documentData)

    const { data, error } = await from('negotiation_documents').insert(documentData).select().single()

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }

    console.log('Document created successfully:', data)
    emit('created', data)
  } catch (error) {
    console.error('Error creating document:', error)
    console.error('Error type:', typeof error)
    console.error('Error keys:', Object.keys(error))

    // More detailed error logging
    if (error.message) {
      console.error('Error message:', error.message)
    }
    if (error.details) {
      console.error('Error details:', error.details)
    }
    if (error.hint) {
      console.error('Error hint:', error.hint)
    }

    // TODO: Show error notification to user
    alert('Erreur lors de la création du document. Consultez la console pour plus de détails.')
  } finally {
    loading.value = false
  }
}
</script>