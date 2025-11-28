import { onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Composable pour gérer les animations au scroll
 * Utilise l'Intersection Observer API pour détecter quand les éléments entrent dans le viewport
 *
 * @param {string} selector - Sélecteur CSS des éléments à animer
 * @param {Object} options - Options pour l'Intersection Observer
 * @returns {void}
 */
export function useScrollAnimations(selector = '[data-animate]', options = {}) {
  let observer = null

  const defaultOptions = {
    threshold: 0.1, // L'élément doit être visible à 10% pour déclencher l'animation
    rootMargin: '0px 0px -50px 0px', // Déclencher un peu avant que l'élément entre dans le viewport
    ...options
  }

  const handleIntersection = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Ajouter la classe 'animate-in' quand l'élément entre dans le viewport
        entry.target.classList.add('animate-in')

        // Optionnel : arrêter d'observer l'élément après l'animation (pour performance)
        // observer.unobserve(entry.target)
      }
    })
  }

  onMounted(async () => {
    // Attendre que Vue ait terminé de rendre le DOM
    await nextTick()

    // Petit délai supplémentaire pour s'assurer que tout est rendu
    setTimeout(() => {
      observer = new IntersectionObserver(handleIntersection, defaultOptions)

      // Observer tous les éléments avec l'attribut data-animate
      const elements = document.querySelectorAll(selector)

      console.log(`[useScrollAnimations] Found ${elements.length} elements to animate`)

      elements.forEach(el => {
        observer.observe(el)
      })
    }, 100)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })
}
