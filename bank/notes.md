## Plan de développement - Page Communauté

### Architecture de la page
La page Communauté sera organisée en plusieurs sections principales :
1. **Hero Section** avec présentation de la communauté
2. **Témoignages utilisateurs** (multi-contexte)
3. **Témoignages vidéo courts**
4. **Statistiques de la communauté**
5. **Call-to-action pour rejoindre/participer**

### 📋 Étapes de développement

#### Phase 1 : Structure et routes
1. **Créer la structure de base**
   - Créer `src/views/community/Community.vue` (page principale)
   - Ajouter la route `/community` dans `src/router/index.js`
   - Ajouter l'entrée dans la navigation (AppNavBar.vue)

2. **Créer les composants de la page**
   - `src/components/community/CommunityHero.vue` - Section hero
   - `src/components/community/UserTestimonials.vue` - Témoignages texte
   - `src/components/community/VideoTestimonials.vue` - Témoignages vidéo
   - `src/components/community/CommunityStats.vue` - Statistiques
   - `src/components/community/TestimonialCard.vue` - Carte témoignage réutilisable
   - `src/components/community/VideoTestimonialCard.vue` - Carte vidéo réutilisable

#### Phase 2 : Composables et logique métier
1. **Créer les composables pour les témoignages**
   ```
   src/composables/useTestimonials.js
   ```
   - `fetchUserTestimonials()` - Récupérer les témoignages texte
   - `fetchVideoTestimonials()` - Récupérer les témoignages vidéo
   - `createTestimonial()` - Créer un nouveau témoignage
   - `filterTestimonialsByContext()` - Filtrer par contexte
   - `toggleFeatured()` - Marquer comme mis en avant (admin)

2. **Créer le store Pinia**
   ```
   src/stores/testimonials.js
   ```
   - State : testimonials, videoTestimonials, filters, loading
   - Actions : load, create, update, delete
   - Getters : featured, byContext, statistics

#### Phase 3 : Intégration Supabase

1. **Requêtes pour les témoignages utilisateurs (table `user_testimonials`)**
   ```javascript
   // Récupérer les témoignages pour innovations/pratiques avec infos utilisateur
   const { data } = await supabase
     .from('user_testimonials')
     .select(`
       *,
       user:users!user_id (
         first_name,
         last_name,
         profile_photo_url,
         organization:organizations!organization_id (
           name
         )
       ),
       innovation_practice:innovations_practices!context_id (
         title,
         category
       )
     `)
     .eq('context_type', 'innovation, practice') // Filtrer uniquement innovations/pratiques
     .eq('featured', true) // Pour les témoignages mis en avant
     .order('created_at', { ascending: false })
   ```

2. **Requêtes pour les témoignages vidéo (table `video_testimonials`)**
   ```javascript
   // Récupérer les vidéos approuvées pour innovations/pratiques uniquement
   const { data } = await supabase
     .from('video_testimonials')
     .select(`
       *,
       user:users!user_id (
         first_name,
         last_name,
         profile_photo_url
       )
     `)
     .eq('context_type', 'innovation, practice') // Filtrer uniquement innovations/pratiques
     .eq('is_approved', true)
     .eq('featured', true)
     .order('created_at', { ascending: false })
   ```

3. **Filtrage par contexte**
   ```javascript
   // Filtrer par type de contexte (innovations et pratiques uniquement)
   const filterByContext = async (contextType) => {
     const { data } = await supabase
       .from('user_testimonials')
       .select('*')
       .eq('context_type', 'innovation, practice') // Seul contexte pour la page communauté
       .eq('context_id', contextId) // ID de l'innovation ou pratique spécifique
   }
   ```

#### Phase 4 : Interface utilisateur

1. **Section Témoignages utilisateurs**
   - **Filtres par contexte** : Tabs ou boutons pour filtrer
     - Tous
     - Innovations
     - Bonnes Pratiques
   - **Carte de témoignage** comprenant :
     - Photo utilisateur (ou avatar avec couleur de fond)
     - Nom et organisation
     - Texte du témoignage
     - Badge de contexte
     - Date
   - **Mode grille** : 3 colonnes sur desktop, 1 sur mobile
   - **Pagination ou scroll infini**

2. **Section Témoignages vidéo courts**
   - **Grille de vidéos** : Format carré ou 9:16
   - **Lecteur vidéo intégré** avec :
     - Durée max 10 secondes (vérification)
     - Autoplay en hover (desktop)
     - Click pour jouer (mobile)
   - **Informations** :
     - Nom de l'utilisateur
     - Badge "Featured" si applicable
   - **Modal de lecture** pour vue agrandie

3. **Fonctionnalités interactives**
   - **Ajout de témoignage** (utilisateur connecté)
     - Formulaire modal avec :
       - Textarea pour le texte
       - Sélection du contexte
       - Upload photo optionnel
   - **Upload vidéo** (utilisateur connecté)
     - Limite de durée (10 secondes)
     - Prévisualisation avant envoi
     - Statut : en attente d'approbation

#### Phase 5 : Fonctionnalités avancées

1. **Système de modération (admin)**
   - Interface d'approbation des vidéos
   - Marquer les témoignages comme "featured"
   - Modération des contenus inappropriés

2. **Analytics et statistiques**
   - Nombre total de témoignages
   - Répartition par contexte
   - Témoignages par pays/organisation
   - Graphiques de progression

3. **Optimisations**
   - Lazy loading des vidéos
   - Cache des témoignages
   - Compression des images
   - CDN pour les médias

#### Phase 6 : Tests et validation

1. **Tests unitaires**
   - Composables de témoignages
   - Store Pinia
   - Composants isolés

2. **Tests d'intégration**
   - Flux complet d'ajout de témoignage
   - Upload et validation vidéo
   - Filtrage et pagination

3. **Tests de performance**
   - Temps de chargement des vidéos
   - Optimisation des requêtes Supabase
   - Responsive design

### 🎨 Design et UX

1. **Thèmes Dark/Light**
   - Transitions fluides
   - Contraste approprié

2. **Animations**
   - Fade-in au scroll
   - Hover effects sur les cartes
   - Transitions de filtres

3. **Accessibilité**
   - Alt text pour les images
   - Sous-titres pour les vidéos
   - Navigation au clavier
   - ARIA labels

### 📝 Notes importantes

- **Contexte pour la page Communauté** :
  - `innovation, practice` - Uniquement les témoignages liés aux innovations et bonnes pratiques
  - Les témoignages pour `training`, `event` et `platform` ne sont pas affichés sur cette page

- **Permissions** :
  - Lecture : tous les utilisateurs
  - Création : utilisateurs authentifiés
  - Modération : admins uniquement

- **Limites techniques** :
  - Vidéos : max 10 secondes
  - Upload : vérifier la taille des fichiers
  - Modération obligatoire pour les vidéos

### 🔄 Ordre de développement recommandé

1. Structure de base et routes
2. Composables et intégration Supabase
3. Section témoignages texte
4. Section témoignages vidéo
5. Fonctionnalités d'ajout (formulaires)
6. Système de modération
7. Optimisations et tests