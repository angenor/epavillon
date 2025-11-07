import './assets/main.css'

// Import du thème highlight.js pour la coloration syntaxique du code
import 'highlight.js/styles/github-dark.css'

// Import du CSS de vue-cal (copié localement pour éviter les problèmes de résolution avec Rollup)
import './assets/vuecal.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createHead } from '@vueuse/head'

// Font Awesome imports
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// Import des icônes selon les besoins
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import App from './App.vue'
import router from './router'
import { clickOutside } from './directives/clickOutside'

// Import des modules de traduction
import frTranslations from './locales/fr/index.js'
import enTranslations from './locales/en/index.js'

// Ajout des icônes à la bibliothèque Font Awesome
library.add(fas, far, fab)

// Configuration i18n
const i18n = createI18n({
  legacy: false, // Utiliser Composition API
  locale: localStorage.getItem('locale') || 'fr', // Langue par défaut: français
  fallbackLocale: 'fr',
  messages: {
    fr: frTranslations,
    en: enTranslations
  }
})


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAleH8LqX9NHxe8m3dkzV6C2LW8aAprISk",
  authDomain: "epavillon-9b399.firebaseapp.com",
  projectId: "epavillon-9b399",
  storageBucket: "epavillon-9b399.firebasestorage.app",
  messagingSenderId: "806310673586",
  appId: "1:806310673586:web:9481da2e8a2edecbb49dab",
  measurementId: "G-4ETN92F3RM"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

const app = createApp(App)
const head = createHead()

// Enregistrement global du composant Font Awesome
app.component('font-awesome-icon', FontAwesomeIcon)

// Enregistrement des directives globales
app.directive('click-outside', clickOutside)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(head)

app.mount('#app')
