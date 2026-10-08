<template>
  <div>
    <div v-if="!isEditing" class="flex items-center gap-2">
      <p class="font-semibold text-gray-900 dark:text-white">{{ organization.name }}</p>
      <button v-if="editable"
              type="button"
              @click="startEditing"
              class="cursor-pointer text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              :title="t('admin.activities.editOrganizationName')">
        <font-awesome-icon :icon="['fas', 'pen']" class="h-3.5 w-3.5" />
      </button>
    </div>

    <form v-else @submit.prevent="save" class="flex flex-wrap items-center gap-2">
      <input ref="inputRef"
             v-model="name"
             type="text"
             @keydown.esc="cancel"
             class="flex-1 min-w-48 px-2 py-1 text-sm font-semibold rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
      <button type="submit"
              :disabled="isSaving"
              class="cursor-pointer px-3 py-1 text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed">
        {{ isSaving ? t('common.loading') : t('common.save') }}
      </button>
      <button type="button"
              @click="cancel"
              :disabled="isSaving"
              class="cursor-pointer px-3 py-1 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
        {{ t('common.cancel') }}
      </button>
      <p v-if="error" class="w-full text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const props = defineProps({
  organization: { type: Object, required: true },
  editable: { type: Boolean, default: false }
})

const emit = defineEmits(['updated'])

const { t } = useI18n()
const { supabase } = useSupabase()

const isEditing = ref(false)
const isSaving = ref(false)
const name = ref('')
const error = ref(null)
const inputRef = ref(null)

const startEditing = async () => {
  name.value = props.organization.name
  error.value = null
  isEditing.value = true
  await nextTick()
  inputRef.value?.focus()
}

const cancel = () => {
  isEditing.value = false
  error.value = null
}

const save = async () => {
  const newName = name.value.trim()
  if (!newName) {
    error.value = t('admin.activities.organizationNameRequired')
    return
  }
  if (newName === props.organization.name) {
    cancel()
    return
  }

  isSaving.value = true
  error.value = null
  try {
    const { data, error: updateError } = await supabase
      .from('organizations')
      .update({ name: newName })
      .eq('id', props.organization.id)
      .select('name')
      .single()

    if (updateError) throw updateError

    emit('updated', data.name)
    isEditing.value = false
  } catch (err) {
    console.error('Erreur lors de la mise à jour du nom de l\'organisation:', err)
    error.value = t('admin.activities.organizationNameError')
  } finally {
    isSaving.value = false
  }
}
</script>
