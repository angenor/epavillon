export const clickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      // Vérifier si le clic est en dehors de l'élément
      if (!(el === event.target || el.contains(event.target))) {
        // Appeler la méthode fournie
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}