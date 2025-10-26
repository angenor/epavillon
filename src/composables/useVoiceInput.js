/**
 * Composable pour la reconnaissance vocale
 * Utilise l'API native SpeechRecognition pour un contrôle total
 * Accumule les résultats sans réinitialisation
 */

import { ref, computed, onUnmounted } from 'vue'
import { useAudioAnalyzer } from './useAudioAnalyzer'

export function useVoiceInput(options = {}) {
  const {
    lang = 'fr-FR' // Langue par défaut : français
  } = options

  // Analyseur audio pour l'animation
  const { audioData, startAnalysis, stopAnalysis } = useAudioAnalyzer()
  const mediaStream = ref(null)

  // État de la reconnaissance vocale
  const isListening = ref(false)
  const isSupported = ref(false)
  const result = ref('') // Texte accumulé
  const error = ref(null)

  // Objet SpeechRecognition natif
  let recognition = null
  let accumulatedText = '' // Accumulation interne

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
   * Initialise l'objet SpeechRecognition
   */
  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      isSupported.value = false
      return false
    }

    isSupported.value = true
    recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = true // Mode continu
    recognition.interimResults = true // Résultats intermédiaires

    // Événement : résultat de reconnaissance
    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      // Parcourir tous les résultats
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          // Résultat final → ajouter à l'accumulation
          finalTranscript += transcript + ' '
        } else {
          // Résultat intermédiaire
          interimTranscript += transcript
        }
      }

      // Si on a un résultat final, l'accumuler
      if (finalTranscript) {
        accumulatedText += finalTranscript
        console.log('[Voice] Segment final ajouté:', finalTranscript)
        console.log('[Voice] Texte accumulé:', accumulatedText)
      }

      // Afficher le texte accumulé + l'intermédiaire en cours
      result.value = (accumulatedText + interimTranscript).trim()
    }

    // Événement : erreur
    recognition.onerror = (event) => {
      console.error('[Voice] Erreur:', event.error)
      error.value = `Erreur de reconnaissance vocale: ${event.error}`
    }

    // Événement : fin inattendue → redémarrer si on écoute toujours
    recognition.onend = () => {
      console.log('[Voice] Recognition ended')
      if (isListening.value) {
        console.log('[Voice] Redémarrage automatique...')
        try {
          recognition.start()
        } catch (err) {
          console.error('[Voice] Erreur redémarrage:', err)
        }
      }
    }

    return true
  }

  /**
   * Démarre l'écoute vocale
   */
  const startListening = async () => {
    try {
      error.value = null
      accumulatedText = ''
      result.value = ''

      // Initialiser si pas déjà fait
      if (!recognition) {
        if (!initRecognition()) {
          error.value = 'La reconnaissance vocale n\'est pas supportée par votre navigateur'
          return false
        }
      }

      // Demander l'accès au microphone pour l'analyse audio
      try {
        mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
        await startAnalysis(mediaStream.value, 5) // 5 barres
      } catch (micError) {
        console.warn('Could not access microphone for audio analysis:', micError)
      }

      // Démarrer la reconnaissance vocale
      isListening.value = true
      recognition.start()
      console.log('[Voice] Reconnaissance démarrée')
      return true
    } catch (err) {
      console.error('Error starting voice recognition:', err)
      error.value = err.message || 'Erreur lors du démarrage de la reconnaissance vocale'
      isListening.value = false
      return false
    }
  }

  /**
   * Arrête l'écoute vocale
   */
  const stopListening = () => {
    try {
      console.log('[Voice] Arrêt de la reconnaissance')
      isListening.value = false

      // Arrêter la reconnaissance vocale
      if (recognition) {
        recognition.stop()
      }

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

  // Nettoyer lors de la destruction
  onUnmounted(() => {
    stopListening()
    if (recognition) {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition = null
    }
  })

  // Vérifier le support au chargement
  if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    isSupported.value = true
  }

  return {
    // État
    isSupported,
    isListening,
    result, // Texte accumulé (résultats finaux + intermédiaire)
    error,
    audioData, // Données audio pour l'animation

    // Méthodes
    startListening,
    stopListening,
    toggleListening,

    // Fonctions utilitaires pour le parent
    containsAToi,
    removeAToi
  }
}
