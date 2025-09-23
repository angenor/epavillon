import { ref } from 'vue'

export function useInlineEditing(updateCallback) {
  const editingField = ref({})
  const tempValue = ref({})
  const hasUnsavedChanges = ref({})
  const savingField = ref({})

  const startEdit = (field, currentValue) => {
    editingField.value[field] = true
    tempValue.value[field] = currentValue
    hasUnsavedChanges.value[field] = false
  }

  const cancelEdit = (field) => {
    delete editingField.value[field]
    delete tempValue.value[field]
    delete hasUnsavedChanges.value[field]
  }

  const onFieldChange = (field, originalValue) => {
    hasUnsavedChanges.value[field] = tempValue.value[field] !== originalValue
  }

  const saveField = async (field, originalValue, additionalData = {}) => {
    const value = tempValue.value[field]
    if (value === originalValue) {
      cancelEdit(field)
      return originalValue
    }

    savingField.value[field] = true
    try {
      const result = await updateCallback(field, value, additionalData)
      cancelEdit(field)
      return result
    } catch (error) {
      console.error('Error updating field:', error)
      throw error
    } finally {
      delete savingField.value[field]
    }
  }

  return {
    editingField,
    tempValue,
    hasUnsavedChanges,
    savingField,
    startEdit,
    cancelEdit,
    onFieldChange,
    saveField
  }
}