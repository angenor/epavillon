import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'

// Import des fichiers de traduction
import fr from './locales/fr.json'
import en from './locales/en.json'

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

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
