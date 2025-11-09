import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Composable pour gérer un décompteur jusqu'à une date cible
 * @param {Function} getTargetDate - Fonction qui retourne la date cible
 * @returns {Object} - Objet contenant les données du décompteur
 */
export function useCountdown(getTargetDate) {
  const now = ref(Date.now())
  let intervalId = null

  // Mettre à jour l'heure actuelle chaque seconde
  const startCountdown = () => {
    intervalId = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }

  const stopCountdown = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Calculer le temps restant
  const timeRemaining = computed(() => {
    const targetDate = getTargetDate()
    if (!targetDate) return null

    const target = new Date(targetDate).getTime()
    const current = now.value
    const diff = target - current

    // Si la date est passée
    if (diff <= 0) {
      return {
        total: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      }
    }

    // Calculer les jours, heures, minutes, secondes
    const seconds = Math.floor((diff / 1000) % 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    return {
      total: diff,
      days,
      hours,
      minutes,
      seconds,
      isExpired: false
    }
  })

  // Formater le temps restant pour l'affichage
  const formattedTime = computed(() => {
    const time = timeRemaining.value
    if (!time) return null

    return {
      days: String(time.days).padStart(2, '0'),
      hours: String(time.hours).padStart(2, '0'),
      minutes: String(time.minutes).padStart(2, '0'),
      seconds: String(time.seconds).padStart(2, '0')
    }
  })

  onMounted(() => {
    startCountdown()
  })

  onUnmounted(() => {
    stopCountdown()
  })

  return {
    timeRemaining,
    formattedTime,
    startCountdown,
    stopCountdown
  }
}
