<template>
  <div>
    <!-- Bouton flottant -->
    <button
      v-if="!isOpen"
      @click="toggleWidget"
      class="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 cursor-pointer group"
      :title="hasRating ? `Note: ${currentRating}/20` : 'Noter cette activité'"
    >
      <svg
        v-if="!hasRating"
        class="w-7 h-7 group-hover:scale-110 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
      <span v-else class="font-bold text-lg">{{ currentRating }}</span>
    </button>

    <!-- Widget de notation -->
    <div
      v-if="isOpen"
      class="fixed bottom-24 right-6 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-300 transform origin-bottom-right"
      :class="isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3 flex items-center justify-between">
        <h3 class="text-white font-semibold flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
          Noter l'activité
        </h3>
        <button
          @click="toggleWidget"
          class="text-white hover:bg-white/20 rounded-lg p-1 transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-4">
        <!-- Note actuelle ou nouveau -->
        <div class="mb-4">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {{ hasRating ? 'Votre note actuelle' : 'Attribuer une note' }}
          </p>
          <div class="flex items-center justify-center py-2">
            <span class="text-4xl font-bold text-orange-500">{{ rating || '?' }}</span>
            <span class="text-2xl text-gray-500 dark:text-gray-400 ml-1">/20</span>
          </div>
        </div>

        <!-- Slider de notation -->
        <div class="mb-4">
          <input
            v-model="rating"
            type="range"
            min="0"
            max="20"
            step="0.5"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            :disabled="isSaving"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
          </div>
        </div>

        <!-- Commentaire optionnel -->
        <div class="mb-4">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Commentaire (optionnel)
          </label>
          <textarea
            v-model="comment"
            placeholder="Ajoutez un commentaire sur votre note..."
            rows="3"
            :disabled="isSaving"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex space-x-2">
          <button
            @click="saveRating"
            :disabled="!rating || isSaving"
            class="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span v-if="isSaving" class="flex items-center justify-center">
              <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Enregistrement...
            </span>
            <span v-else>{{ hasRating ? 'Mettre à jour' : 'Enregistrer' }}</span>
          </button>
          <button
            @click="toggleWidget"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Annuler
          </button>
        </div>

        <!-- Message de succès -->
        <div v-if="successMessage" class="mt-3 p-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm">
          {{ successMessage }}
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="mt-3 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({
  activityId: {
    type: String,
    required: true
  }
})

const { supabase } = useSupabase()
const { currentUser } = useAuth()

const isOpen = ref(false)
const rating = ref(null)
const comment = ref('')
const currentRating = ref(null)
const hasRating = ref(false)
const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const toggleWidget = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && hasRating.value) {
    // Charger la note existante dans le formulaire
    rating.value = currentRating.value
  }
}

const loadExistingRating = async () => {
  if (!currentUser.value) return

  try {
    const { data, error } = await supabase
      .from('activity_ratings')
      .select('rating, comment')
      .eq('activity_id', props.activityId)
      .eq('revisionniste_id', currentUser.value.id)
      .single()

    if (data && !error) {
      currentRating.value = data.rating
      rating.value = data.rating
      comment.value = data.comment || ''
      hasRating.value = true
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la note:', error)
  }
}

const saveRating = async () => {
  if (!currentUser.value || !rating.value) return

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const ratingData = {
      activity_id: props.activityId,
      revisionniste_id: currentUser.value.id,
      rating: parseFloat(rating.value),
      comment: comment.value || null
    }

    if (hasRating.value) {
      // Mettre à jour la note existante
      const { error } = await supabase
        .from('activity_ratings')
        .update({
          rating: ratingData.rating,
          comment: ratingData.comment,
          updated_at: new Date().toISOString()
        })
        .eq('activity_id', props.activityId)
        .eq('revisionniste_id', currentUser.value.id)

      if (error) throw error
      successMessage.value = 'Note mise à jour avec succès'
    } else {
      // Créer une nouvelle note
      const { error } = await supabase
        .from('activity_ratings')
        .insert([ratingData])

      if (error) throw error
      successMessage.value = 'Note enregistrée avec succès'
      hasRating.value = true
    }

    currentRating.value = rating.value

    // Fermer le widget après 2 secondes
    setTimeout(() => {
      isOpen.value = false
      successMessage.value = ''
    }, 2000)
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la note:', error)
    errorMessage.value = error.message || 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

// Watch for activity changes
watch(() => props.activityId, (newId, oldId) => {
  if (newId !== oldId) {
    // Reset state when activity changes
    rating.value = null
    comment.value = ''
    currentRating.value = null
    hasRating.value = false
    successMessage.value = ''
    errorMessage.value = ''

    // Close widget if open
    if (isOpen.value) {
      isOpen.value = false
    }

    // Load rating for new activity
    loadExistingRating()
  }
})

onMounted(() => {
  loadExistingRating()
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>