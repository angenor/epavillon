import { ref, onMounted } from 'vue'

const THEME_KEY = 'epavillon-theme'

// Variable globale pour le thème
const theme = ref('light')

// Fonction pour initialiser le thème (appelée une seule fois)
const initTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme) {
    theme.value = savedTheme
  } else {
    // Détecter la préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
  }
  applyTheme(theme.value)
}

// Appliquer le thème
const applyTheme = (newTheme) => {
  theme.value = newTheme
  localStorage.setItem(THEME_KEY, newTheme)
  
  // Mettre à jour la classe sur l'élément HTML
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Basculer entre les thèmes
const toggleTheme = () => {
  const newTheme = theme.value === 'light' ? 'dark' : 'light'
  applyTheme(newTheme)
}

// Initialiser le thème au chargement de l'application
if (typeof window !== 'undefined') {
  initTheme()
}

export function useTheme() {
  return {
    theme,
    toggleTheme,
    applyTheme
  }
}