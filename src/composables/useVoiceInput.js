/**
 * Composable pour la reconnaissance vocale
 * Utilise @vueuse/core - useSpeechRecognition
 * Détecte automatiquement "à toi" pour envoyer le message
 */

import { ref, computed, watch } from 'vue'
import { useSpeechRecognition } from '@vueuse/core'
import { useAudioAnalyzer } from './useAudioAnalyzer'

export function useVoiceInput(options = {}) {
  const {
    lang = 'fr-FR', // Langue par défaut : français
    continuous = true, // Mode continu pour rester en écoute
    interimResults = true, // Afficher les résultats intermédiaires
    onSendTriggered = null // Callback quand "à toi" est détecté
  } = options

  // Analyseur audio pour l'animation
  const { audioData, startAnalysis, stopAnalysis } = useAudioAnalyzer()
  const mediaStream = ref(null)

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

  // Texte accumulé (persiste pendant les pauses)
  const accumulatedText = ref('')

  // Dernier résultat traité (pour éviter les doublons)
  const lastProcessedResult = ref('')

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
      /\s*a\s*toit\s*$/i,    // "a toit" (erreur courante)
      /\s*pas\s*toi\s*$/i    // "pas toi" (erreur courante)
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
      lowerText.endsWith('a toit') ||
      lowerText.endsWith('pas toi')
    )
  }

  /**
   * Démarre l'écoute vocale
   */
  const startListening = async () => {
    try {
      error.value = null
      accumulatedText.value = ''
      lastProcessedResult.value = ''

      if (!isSupported.value) {
        error.value = 'La reconnaissance vocale n\'est pas supportée par votre navigateur'
        return false
      }

      // Demander l'accès au microphone pour l'analyse audio
      try {
        mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })

        // Démarrer l'analyse audio pour l'animation
        await startAnalysis(mediaStream.value, 5) // 5 barres
      } catch (micError) {
        console.warn('Could not access microphone for audio analysis:', micError)
        // Continuer même si l'analyse audio échoue
      }

      // Démarrer la reconnaissance vocale
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
      // Arrêter la reconnaissance vocale
      stop()

      // Arrêter l'analyse audio
      stopAnalysis()

      // Fermer le MediaStream
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop())
        mediaStream.value = null
      }

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

  // Computed pour combiner le texte accumulé avec le résultat actuel
  const fullText = computed(() => {
    if (!result.value) {
      return accumulatedText.value
    }

    if (accumulatedText.value) {
      return accumulatedText.value + ' ' + result.value
    }

    return result.value
  })

  // Watcher pour détecter les pauses et accumuler les segments
  watch(result, (newResult, oldResult) => {
    if (!isListening.value) {
      return
    }

    // Quand result devient vide après avoir contenu du texte,
    // cela signifie qu'un segment est terminé (pause)
    if (!newResult && oldResult && oldResult.trim()) {
      // Ajouter le segment terminé à accumulatedText
      if (accumulatedText.value) {
        accumulatedText.value += ' ' + oldResult
      } else {
        accumulatedText.value = oldResult
      }
      console.log('[Voice] Segment sauvegardé:', oldResult)
      console.log('[Voice] Texte accumulé:', accumulatedText.value)
    }

    // Vérifier "à toi" dans le texte complet (accumulé + actuel)
    if (containsAToi(fullText.value)) {
      console.log('[Voice] "à toi" détecté - envoi du message')
      const cleaned = removeAToi(fullText.value)

      if (onSendTriggered && cleaned.trim()) {
        onSendTriggered(cleaned)
      }

      // Réinitialiser
      accumulatedText.value = ''
      lastProcessedResult.value = ''
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
    result: fullText, // Retourner le texte complet (accumulé + actuel)
    error: errorMessage,
    audioData, // Données audio pour l'animation

    // Méthodes
    startListening,
    stopListening,
    toggleListening
  }
}
