/**
 * Composable pour la reconnaissance vocale
 * Utilise @vueuse/core - useSpeechRecognition
 * Détecte automatiquement "à toi" pour envoyer le message
 */

import { ref, computed, watch } from 'vue'
import { useSpeechRecognition } from '@vueuse/core'

export function useVoiceInput(options = {}) {
  const {
    lang = 'fr-FR', // Langue par défaut : français
    continuous = true, // Mode continu pour rester en écoute
    interimResults = true, // Afficher les résultats intermédiaires
    onSendTriggered = null // Callback quand "à toi" est détecté
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

  // Texte nettoyé (sans "à toi")
  const cleanedResult = ref('')

  /**
   * Nettoie le texte en retirant "à toi" et ses variantes
   * @param {string} text - Texte à nettoyer
   * @returns {string} Texte nettoyé
   */
  function removeAToi(text) {
    if (!text) return ''

    // Patterns pour détecter "à toi" et ses variantes
    const patterns = [
      /\s*à\s*toi\s*$/i,     // "à toi" à la fin
      /\s*a\s*toi\s*$/i,     // "a toi" à la fin
      /\s*atoi\s*$/i,        // "atoi" à la fin
      /\s*à\s*toit\s*$/i,    // "à toit" (erreur courante)
      /\s*a\s*toit\s*$/i     // "a toit" (erreur courante)
    ]

    let cleaned = text
    for (const pattern of patterns) {
      cleaned = cleaned.replace(pattern, '')
    }

    return cleaned.trim()
  }

  /**
   * Vérifie si le texte contient "à toi" à la fin
   * @param {string} text - Texte à vérifier
   * @returns {boolean}
   */
  function containsAToi(text) {
    if (!text) return false

    const lowerText = text.toLowerCase().trim()
    return (
      lowerText.endsWith('à toi') ||
      lowerText.endsWith('a toi') ||
      lowerText.endsWith('atoi') ||
      lowerText.endsWith('à toit') ||
      lowerText.endsWith('a toit')
    )
  }

  /**
   * Démarre l'écoute vocale
   */
  const startListening = async () => {
    try {
      error.value = null
      cleanedResult.value = ''

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

  // Watcher pour détecter "à toi" dans le résultat
  watch(result, (newResult) => {
    if (!newResult) {
      cleanedResult.value = ''
      return
    }

    // Vérifier si "à toi" est détecté
    if (containsAToi(newResult)) {
      console.log('[Voice] "à toi" détecté - envoi du message')

      // Nettoyer le texte
      const cleaned = removeAToi(newResult)
      cleanedResult.value = cleaned

      // Déclencher l'envoi
      if (onSendTriggered && cleaned.trim()) {
        onSendTriggered(cleaned)
      }

      // Réinitialiser pour la prochaine saisie
      setTimeout(() => {
        cleanedResult.value = ''
      }, 100)
    } else {
      // Mettre à jour le résultat nettoyé (sans "à toi" partiel)
      cleanedResult.value = newResult
    }
  })

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
    result: cleanedResult, // Retourner le résultat nettoyé
    error: errorMessage,

    // Méthodes
    startListening,
    stopListening,
    toggleListening
  }
}
