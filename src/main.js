import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

// Font Awesome imports
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// Import des icônes selon les besoins
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import App from './App.vue'
import router from './router'

// Import des fichiers de traduction
import fr from './locales/fr.json'
import en from './locales/en.json'

// Ajout des icônes à la bibliothèque Font Awesome
library.add(fas, far, fab)

// Configuration i18n
const i18n = createI18n({
  legacy: false, // Utiliser Composition API
  locale: localStorage.getItem('locale') || 'fr', // Langue par défaut: français
  fallbackLocale: 'fr',
  messages: {
    fr,
    en
  }
})

const app = createApp(App)

// Enregistrement global du composant Font Awesome
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
