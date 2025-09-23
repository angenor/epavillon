import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import useUserActivities from '@/composables/useUserActivities'

export function useTagManagement(activityId) {
  const { t } = useI18n()
  const { updateActivity } = useUserActivities()

  const tags = ref([])
  const newTag = ref('')
  const savingTags = ref(false)
  const maxTags = 20

  const canAddMoreTags = computed(() => tags.value.length < maxTags)

  const remainingTags = computed(() => maxTags - tags.value.length)

  const addTag = () => {
    const tagText = newTag.value.trim()

    if (!tagText) return

    if (tags.value.length >= maxTags) {
      alert(t('activity.tags.maxTagsReached', { max: maxTags }))
      return
    }

    if (tags.value.includes(tagText)) {
      alert(t('activity.tags.tagAlreadyExists'))
      return
    }

    if (tagText.length > 50) {
      alert(t('activity.tags.tagTooLong'))
      return
    }

    tags.value.push(tagText)
    newTag.value = ''
    saveTags()
  }

  const removeTag = (index) => {
    tags.value.splice(index, 1)
    saveTags()
  }

  const saveTags = async () => {
    if (!activityId) return

    try {
      savingTags.value = true
      await updateActivity(activityId, { tags: tags.value })
    } catch (error) {
      console.error('Error saving tags:', error)
      throw error
    } finally {
      savingTags.value = false
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addTag()
    }
  }

  const initializeTags = (activityTags) => {
    tags.value = activityTags || []
  }

  return {
    // Data
    tags,
    newTag,
    savingTags,
    maxTags,

    // Computed
    canAddMoreTags,
    remainingTags,

    // Methods
    addTag,
    removeTag,
    handleKeyPress,
    initializeTags
  }
}