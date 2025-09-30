<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Overlay -->
      <div
        class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        @click="close"
      ></div>

      <!-- Modal container -->
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <!-- Modal panel -->
        <div class="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-ifdd-bleu/10 sm:mx-0 sm:h-10 sm:w-10">
              <font-awesome-icon :icon="['fas', 'user-plus']" class="h-6 w-6 text-ifdd-bleu" />
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                {{ t('events.addSpeaker') }}
              </h3>
              <div class="mt-4 space-y-4">
                <!-- Civilité -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('events.civility') }}
                  </label>
                  <select
                    v-model="formData.civility"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ifdd-bleu dark:bg-gray-700 dark:text-white cursor-pointer"
                  >
                    <option value="">{{ t('common.select') }}</option>
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                    <option value="Dr">Dr</option>
                    <option value="Pr">Pr</option>
                  </select>
                </div>

                <!-- Prénom -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('events.firstName') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.first_name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ifdd-bleu dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.first_name }"
                    :placeholder="t('events.firstName')"
                  >
                  <p v-if="errors.first_name" class="mt-1 text-sm text-red-600">{{ errors.first_name }}</p>
                </div>

                <!-- Nom -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('events.lastName') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.last_name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ifdd-bleu dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.last_name }"
                    :placeholder="t('events.lastName')"
                  >
                  <p v-if="errors.last_name" class="mt-1 text-sm text-red-600">{{ errors.last_name }}</p>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('events.email') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ifdd-bleu dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.email }"
                    :placeholder="t('events.emailPlaceholder')"
                  >
                  <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                </div>

                <!-- Poste -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('events.position') }}
                  </label>
                  <input
                    v-model="formData.position"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ifdd-bleu dark:bg-gray-700 dark:text-white"
                    :placeholder="t('events.positionPlaceholder')"
                  >
                </div>

                <!-- Organisation -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ t('events.organization') }}
                  </label>
                  <input
                    v-model="formData.organization"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ifdd-bleu dark:bg-gray-700 dark:text-white"
                    :placeholder="t('events.organizationPlaceholder')"
                  >
                </div>

                <!-- Disponible pour les questions -->
                <div>
                  <label class="flex items-center">
                    <input
                      v-model="formData.is_available_for_questions"
                      type="checkbox"
                      class="rounded border-gray-300 text-ifdd-bleu focus:ring-ifdd-bleu dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                    >
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {{ t('events.availableForQuestions') }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="save"
            :disabled="saving"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-ifdd-bleu text-base font-medium text-white hover:bg-ifdd-bleu-fonce focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifdd-bleu sm:ml-3 sm:w-auto sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <font-awesome-icon v-if="saving" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
            {{ saving ? t('common.saving') : t('common.save') }}
          </button>
          <button
            type="button"
            @click="close"
            :disabled="saving"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  activityId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const formData = reactive({
  civility: '',
  first_name: '',
  last_name: '',
  email: '',
  position: '',
  organization: '',
  is_available_for_questions: true
})

const errors = reactive({
  first_name: '',
  last_name: '',
  email: ''
})

const saving = ref(false)

const resetForm = () => {
  formData.civility = ''
  formData.first_name = ''
  formData.last_name = ''
  formData.email = ''
  formData.position = ''
  formData.organization = ''
  formData.is_available_for_questions = true

  errors.first_name = ''
  errors.last_name = ''
  errors.email = ''
}

const validateForm = () => {
  let isValid = true

  // Reset errors
  errors.first_name = ''
  errors.last_name = ''
  errors.email = ''

  // Validate first name
  if (!formData.first_name?.trim()) {
    errors.first_name = t('events.firstNameRequired')
    isValid = false
  }

  // Validate last name
  if (!formData.last_name?.trim()) {
    errors.last_name = t('events.lastNameRequired')
    isValid = false
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email?.trim()) {
    errors.email = t('events.emailRequired')
    isValid = false
  } else if (!emailRegex.test(formData.email.trim())) {
    errors.email = t('events.invalidEmailFormat')
    isValid = false
  }

  return isValid
}

const save = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true

  try {
    await emit('save', {
      civility: formData.civility || null,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      position: formData.position?.trim() || null,
      organization: formData.organization?.trim() || null,
      is_available_for_questions: formData.is_available_for_questions
    })

    resetForm()
  } finally {
    saving.value = false
  }
}

const close = () => {
  if (!saving.value) {
    emit('close')
    resetForm()
  }
}

// Reset form when modal opens/closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>