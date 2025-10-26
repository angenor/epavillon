/**
 * Composable pour l'analyse audio en temps réel
 * Utilise la Web Audio API pour obtenir les amplitudes audio
 */

import { ref, onUnmounted } from 'vue'

export function useAudioAnalyzer() {
  const audioContext = ref(null)
  const analyser = ref(null)
  const mediaStream = ref(null)
  const audioData = ref([]) // Tableau d'amplitudes pour chaque barre
  const animationFrame = ref(null)
  const isAnalyzing = ref(false)

  /**
   * Démarre l'analyse audio
   * @param {MediaStream} stream - Le flux média du microphone
   * @param {number} barCount - Nombre de barres à analyser (par défaut 5)
   */
  const startAnalysis = async (stream, barCount = 5) => {
    try {
      // Créer le contexte audio
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()

      // Créer l'analyseur
      analyser.value = audioContext.value.createAnalyser()
      analyser.value.fftSize = 256 // Taille de la FFT (Fast Fourier Transform)

      // Créer la source audio à partir du flux
      const source = audioContext.value.createMediaStreamSource(stream)
      source.connect(analyser.value)

      mediaStream.value = stream

      // Buffer pour stocker les données de fréquence
      const bufferLength = analyser.value.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Initialiser le tableau des amplitudes
      audioData.value = new Array(barCount).fill(0)

      isAnalyzing.value = true

      // Fonction d'analyse récursive
      const analyze = () => {
        if (!isAnalyzing.value) return

        // Obtenir les données de fréquence
        analyser.value.getByteFrequencyData(dataArray)

        // Diviser les fréquences en barCount sections
        const segmentSize = Math.floor(bufferLength / barCount)
        const newAudioData = []

        for (let i = 0; i < barCount; i++) {
          const start = i * segmentSize
          const end = start + segmentSize

          // Calculer la moyenne pour ce segment
          let sum = 0
          for (let j = start; j < end; j++) {
            sum += dataArray[j]
          }
          const average = sum / segmentSize

          // Normaliser entre 0 et 1
          newAudioData.push(average / 255)
        }

        audioData.value = newAudioData

        // Continuer l'analyse
        animationFrame.value = requestAnimationFrame(analyze)
      }

      // Démarrer l'analyse
      analyze()

      return true
    } catch (error) {
      console.error('Error starting audio analysis:', error)
      return false
    }
  }

  /**
   * Arrête l'analyse audio
   */
  const stopAnalysis = () => {
    isAnalyzing.value = false

    // Annuler l'animation frame
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value)
      animationFrame.value = null
    }

    // Fermer le contexte audio
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }

    // Réinitialiser les données
    audioData.value = []
    analyser.value = null
    mediaStream.value = null
  }

  // Nettoyer lors de la destruction du composant
  onUnmounted(() => {
    stopAnalysis()
  })

  return {
    audioData,      // Tableau des amplitudes (0-1) pour chaque barre
    isAnalyzing,    // Indique si l'analyse est en cours
    startAnalysis,  // Démarre l'analyse avec un MediaStream
    stopAnalysis    // Arrête l'analyse
  }
}
