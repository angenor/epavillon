// Configuration du pre-rendering pour les pages importantes
// Ce fichier génère des pages HTML statiques pour améliorer le SEO et le partage sur les réseaux sociaux

export default {
  // Pages statiques à pre-render
  staticRoutes: [
    '/',
    '/programmations',
    '/activities',
    '/community',
    '/directory'
  ],

  // Fonction pour générer dynamiquement les routes des événements et activités
  // Note: Pour le moment, nous pré-renderons seulement les pages statiques
  // Pour les pages dynamiques (événements/activités spécifiques), nous utiliserons
  // les meta tags par défaut de index.html qui seront mis à jour par @vueuse/head
  // côté client pour une meilleure UX

  // Configuration du renderer
  renderer: {
    renderAfterTime: 5000, // Attendre 5 secondes pour que toutes les données se chargent
    headless: true
  }
}
