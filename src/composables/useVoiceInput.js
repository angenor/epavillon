/**
 * Composable pour la reconnaissance vocale
 * Utilise @vueuse/core - useSpeechRecognition
 */

import { ref, computed } from 'vue'
import { useSpeechRecognition } from '@vueuse/core'

export function useVoiceInput(options = {}) {
  const {
    lang = 'fr-FR', // Langue par défaut : français
    continuous = false, // Ne pas continuer après une phrase
    interimResults = true // Afficher les résultats intermédiaires
  } = options

  // Utiliser useSpeechRecognition de @vueuse/core
  const speech = useSpeechRecognition({
    lang,
    continuous,
    interimResults
  })

  const {
    isListening,
    isSupported,
    result,
    start,
    stop,
    error: speechError
  } = speech

  // État d'erreur personnalisé
  const error = ref(null)

  /**
   * Démarre l'écoute vocale
   */
  const startListening = async () => {
    try {
      error.value = null

      if (!isSupported.value) {
        error.value = 'La reconnaissance vocale n\'est pas supportée par votre navigateur'
        return false
      }

      start()
      return true
    } catch (err) {
      console.error('Error starting voice recognition:', err)
      error.value = err.message || 'Erreur lors du démarrage de la reconnaissance vocale'
      return false
    }
  }

  /**
   * Arrête l'écoute vocale
   */
  const stopListening = () => {
    try {
      stop()
      return true
    } catch (err) {
      console.error('Error stopping voice recognition:', err)
      error.value = err.message || 'Erreur lors de l\'arrêt de la reconnaissance vocale'
      return false
    }
  }

  /**
   * Bascule entre l'écoute et l'arrêt
   */
  const toggleListening = async () => {
    if (isListening.value) {
      return stopListening()
    } else {
      return await startListening()
    }
  }

  // Message d'erreur formaté
  const errorMessage = computed(() => {
    if (error.value) return error.value
    if (speechError.value) return speechError.value
    return null
  })

  return {
    // État
    isSupported,
    isListening,
    result,
    error: errorMessage,

    // Méthodes
    startListening,
    stopListening,
    toggleListening
  }
}
