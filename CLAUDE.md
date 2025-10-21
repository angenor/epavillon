# CLAUDE.md

Ce fichier fournit des directives à Claude Code (claude.ai/code) lors du travail avec le code de ce dépôt.

## Vue d'ensemble du projet
Il s'agit d'une application web **Vue 3** utilisant Vite comme outil de build, JavaScript et TailwindCSS 4. Elle inclut Pinia pour la gestion d'état, Vue Router pour le routage, et Supabase pour les capacités de base de données/authentification.

### Principes d'architecture
**IMPORTANT** : Le projet doit être structuré de manière modulaire pour faciliter la maintenance :
- **Composants réutilisables** : Créer des composants Vue modulaires et réutilisables dans `src/components/`
- **Composables** : Organiser la logique métier dans des composables spécialisés dans `src/composables/`
  - `src/composables/ai/` : **IMPORTANT** - Tous les composables liés au chatbot IA doivent être implémentés dans ce dossier
- **Utils** : Fonctions utilitaires pures dans `src/utils/`
- **Stores** : Gestion d'état avec Pinia dans `src/stores/`
- **Views** : Pages de l'application organisées par domaine dans `src/views/`
  - `src/views/auth/` : Toutes les vues liées à l'authentification (Login, Register, VerifyEmail, ForgotPassword, AuthCallback)
  - `src/views/events/` : Toutes les vues liées aux événements (Create, Detail, etc.)
  - Chaque nouveau domaine fonctionnel doit avoir son propre dossier
- **Router** : Configuration du routage dans `src/router/`
- **Séparation des responsabilités** : Chaque composant, composable ou utility doit avoir une responsabilité unique et bien définie

### Conventions de nommage
- **Views** : Nommer les fichiers de vues simplement sans le suffixe "View" (ex: `Login.vue` au lieu de `LoginView.vue`)
- **Organisation** : Grouper les vues par domaine fonctionnel dans des sous-dossiers de `src/views/`
- **Imports** : Mettre à jour les imports dans le router pour refléter la structure modulaire

### Principes de Clean Code
**IMPORTANT** : Suivre les principes de Clean Code pour garantir la qualité et la maintenabilité :

1. **DRY (Don't Repeat Yourself)**
   - Éviter la duplication de code
   - Créer des composants/fonctions réutilisables
   - Centraliser la logique commune dans des composables

2. **KISS (Keep It Simple, Stupid)**
   - Privilégier des solutions simples et claires
   - Éviter la sur-ingénierie
   - Un composant = une responsabilité

3. **YAGNI (You Aren't Gonna Need It)**
   - Ne pas implémenter de fonctionnalités "au cas où"
   - Développer uniquement ce qui est nécessaire maintenant

### Documentation importante
- **Cahier des charges complet** : Consulter `bank/cahier.md` pour comprendre les fonctionnalités et exigences du projet
- **Structure de la base de données** : Se référer à `bank/shema_et_requettes/database_complete.sql` pour la structure complète de la base de données Supabase
- **IMPORTANT** : Avant de créer une nouvelle donnée ou table, toujours consulter `bank/shema_et_requettes/database_complete.sql` pour comprendre la structure existante et les relations
- **Important** : À chaque modification de la structure d'une table ou de la base de données, mettre à jour `bank/shema_et_requettes/database_complete.sql`
- **Scripts SQL** : Tous les fichiers et scripts SQL doivent être stockés dans le dossier `bank/shema_et_requettes/`

## Commandes essentielles

### Développement
```bash
npm run dev        # Démarrer le serveur de développement Vite (port par défaut)
```

### Build & Production
```bash
npm run build      # Construire pour la production
npm run preview    # Prévisualiser le build de production localement
```

### Tests
```bash
npm run test:unit  # Exécuter les tests unitaires avec Vitest
npm run test:e2e   # Exécuter les tests end-to-end avec Playwright
```

### Configuration Supabase
1. Créer un fichier `.env.local` à la racine du projet
2. Ajouter l'URL et la clé anon de votre projet Supabase :
```bash
VITE_SUPABASE_URL=url_de_votre_projet_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

## Architecture et répertoires clés

### Structure de l'application
- **`src/`** - Répertoire principal de l'application
  - `App.vue` - Composant racine
  - `main.js` - Point d'entrée de l'application
- **`public/`** - Ressources statiques servies directement
- **`dist/`** - Répertoire de build généré (ignoré par git)

### Fichiers de configuration
- **`vite.config.js`** - Configuration Vite principale
- **`jsconfig.json`** - Configuration JavaScript et imports
- **`tailwind.config.js`** - Configuration TailwindCSS
- **`postcss.config.js`** - Configuration PostCSS

## Dépendances principales

### Dépendances de production
- **Vue 3.5.13** - Framework JavaScript réactif
- **Vue Router 4.5.0** - Routage officiel pour Vue.js
- **Pinia 3.0.1** - Store officiel pour Vue.js
- **Supabase** (`@supabase/supabase-js`) - Services backend/authentification
- **TailwindCSS 4.1.10** - Framework CSS utilitaire

### Dépendances de développement
- **Vite 6.2.4** - Outil de build rapide
- **Vitest** - Framework de test unitaire
- **Playwright** - Framework de test end-to-end
- **Vue Devtools** - Outils de développement pour Vue

## Exigences UI/UX

### Support des thèmes
**IMPORTANT** : Toutes les interfaces doivent supporter les modes Dark et Light
- Utiliser le système de thèmes CSS natif avec des variables CSS personnalisées
- Implémenter un composant de sélection de thème dans toutes les interfaces principales
- Thèmes disponibles : `light`, `dark` et thème personnalisé IFDD
- Stocker la préférence de thème de l'utilisateur dans localStorage ou les préférences utilisateur Supabase
- Utiliser `class="dark"` sur l'élément racine pour activer le mode sombre

### Internationalisation (i18n)
**IMPORTANT** : L'application doit supporter le français et l'anglais
- **Vue i18n** est configuré pour la gestion des traductions
- Langues supportées : `fr` (français - par défaut) et `en` (anglais)
- Fichiers de traduction : `src/locales/fr/index.js` et `src/locales/en/index.js`
- **OBLIGATOIRE** : Utiliser `{{ t('clé.de.traduction') }}` pour TOUS les textes affichés
- La préférence de langue est stockée dans localStorage
- Sélecteur de langue disponible dans la navbar
- **Pour chaque nouveau texte** :
  1. Ajouter la clé de traduction dans les deux fichiers JSON
  2. Utiliser la fonction `t()` ou `$t()` pour afficher le texte
  3. Ne JAMAIS hardcoder du texte directement dans les templates
- Structure des fichiers de traduction :
  - `common` : termes communs (boutons, labels généraux)
  - `nav` : navigation et menus
  - `user` : informations utilisateur
  - Ajouter de nouvelles sections selon les besoins

### Système de design
- **IMPORTANT** : Utiliser uniquement TailwindCSS pour toutes les interfaces
  - Créer des composants UI personnalisés et réutilisables avec TailwindCSS
  - Privilégier les classes utilitaires Tailwind CSS natives
  - Créer un système de design cohérent avec des composants Vue modulaires
- Les couleurs de la **charte graphique IFDD** et polices sont définies dans `tailwind.config.js`
- Documentation TailwindCSS : https://tailwindcss.com/docs
- **IMPORTANT** : TailwindCSS v4 ne supporte plus la syntaxe `bg-opacity-xx`. Utiliser la nouvelle syntaxe `bg-couleur/opacité` (ex: `bg-green-500/50` pour 50% d'opacité)
- **IMPORTANT** : Dans TailwindCSS v4, les boutons ne possèdent plus `cursor-pointer` par défaut. Il faut l'ajouter manuellement avec la classe `cursor-pointer` (ex: `<button class="cursor-pointer ...">...</button>`)

### Composants UI recommandés
- **Skeleton loaders** : Utiliser des skeleton loaders pour améliorer l'expérience utilisateur pendant le chargement des données
- **Font Awesome** : Utiliser `font-awesome-icon` pour les icônes dans l'interface utilisateur lorsque approprié

## Notes de développement
- Application Vue 3 avec Vite comme outil de build
- Rendu côté client (SPA) par défaut
- Hot Module Replacement (HMR) activé pour un développement rapide
- TailwindCSS v4 configuré avec PostCSS
- Le client Supabase sera disponible via un composable personnalisé
- Structure modulaire avec composants, stores et composables organisés
- Créer des composants UI personnalisés suivant le système de design IFDD avec TailwindCSS

## Documentations externes

### Bibliothèques et APIs spécialisées
- **Vue Cal v^5.0.1-rc.33** : https://antoniandre.github.io/vue-cal/getting-started - Composant calendrier pour Vue.js
- **PeerJS** : https://www.npmjs.com/package/peerjs - Bibliothèque pour connexions peer-to-peer WebRTC
- **Zoom API** : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#tag/Meetings - API REST pour gestion des réunions Zoom
- **Zoom Webhooks** : https://developers.zoom.us/docs/api/meetings/events/#tag/meeting/postmeeting.alert - Webhooks pour événements de réunions Zoom
