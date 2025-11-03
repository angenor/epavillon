# Checklist d'implémentation - Page de détail d'activité

Cette checklist suit l'ordre d'implémentation recommandé du plan. Cochez chaque tâche au fur et à mesure de son accomplissement.

---

## Phase 1: Base de données et Backend (2-3 jours)

### 1.1 Migration de la base de données

- [ ] **Appliquer le script SQL** `activity_registrations_guest_support.sql`
  - [ ] Tester la migration en environnement de développement
  - [ ] Vérifier que `user_id` est maintenant nullable
  - [ ] Vérifier que les nouveaux champs guest sont créés
  - [ ] Vérifier les contraintes UNIQUE
  - [ ] Vérifier les index
  - [ ] Tester la fonction `get_activity_registration_stats()`
  - [ ] Tester la vue `activity_registrations_full`

- [ ] **Mettre à jour** `bank/shema_et_requettes/database_complete.sql`
  - [ ] Copier les modifications de structure
  - [ ] Documenter les changements avec des commentaires

### 1.2 Politiques RLS

- [ ] **Vérifier les politiques RLS** sur `activity_registrations`
  - [ ] Tester INSERT (guest et user)
  - [ ] Tester SELECT (user voit ses inscriptions)
  - [ ] Tester UPDATE/DELETE (admin uniquement)

- [ ] **Vérifier les politiques RLS** sur `activity_questions`
  - [ ] Tester INSERT (user authentifié seulement)
  - [ ] Tester SELECT (tout le monde)

### 1.3 Edge Function

- [ ] **Créer** `supabase/functions/register-to-zoom-meeting/index.ts`
  - [ ] Copier le code de `EDGE_FUNCTION_EXAMPLE.ts`
  - [ ] Adapter si nécessaire

- [ ] **Configurer les variables d'environnement**
  ```bash
  supabase secrets set ZOOM_ACCOUNT_ID=...
  supabase secrets set ZOOM_CLIENT_ID=...
  supabase secrets set ZOOM_CLIENT_SECRET=...
  ```

- [ ] **Déployer l'edge function**
  ```bash
  supabase functions deploy register-to-zoom-meeting
  ```

- [ ] **Tester l'edge function**
  - [ ] Test avec guest (non authentifié)
  - [ ] Test avec user (authentifié)
  - [ ] Test doublon (même email)
  - [ ] Test sans Zoom meeting
  - [ ] Test erreurs diverses

---

## Phase 2: Utils et Composables (2-3 jours)

### 2.1 Utils - Fuseaux horaires

- [ ] **Créer** `src/utils/timezone/timezoneFormatter.js`
  - [ ] `formatDateInEventTimezone(date, eventTimezone, locale)`
  - [ ] `formatDateInUserTimezone(date, locale)`
  - [ ] `getUserTimezone()`
  - [ ] `formatDualTimezone(date, eventTimezone, locale)`

- [ ] **Tester les fonctions** avec différents fuseaux horaires

### 2.2 Utils - Activités

- [ ] **Créer** `src/utils/activities/activityHelpers.js`
  - [ ] `getActivityCoverImage(activity)`
  - [ ] `hasZoomMeeting(activity)`
  - [ ] `formatActivityStatus(status, locale)`

### 2.3 Composables - Activity Detail

- [ ] **Créer** `src/composables/useActivityDetail.js`
  - [ ] État réactif (activity, speakers, documents, etc.)
  - [ ] `loadActivity(activityId)`
  - [ ] `loadSpeakers(activityId)`
  - [ ] `loadDocuments(activityId)`
  - [ ] `loadRelatedActivities(eventId)`
  - [ ] Computed: `hasZoomMeeting`, `isRegistrationOpen`, etc.

- [ ] **Tester le composable** avec différents activity_id

### 2.4 Composables - Registration

- [ ] **Créer** `src/composables/useActivityRegistration.js`
  - [ ] `registerToActivity(activityId, registrationData)`
  - [ ] `checkIfAlreadyRegistered(activityId, email?)`
  - [ ] `validateForm(formData)`
  - [ ] Gestion des états (isRegistering, isRegistered, error)

- [ ] **Tester l'inscription**
  - [ ] Guest
  - [ ] User
  - [ ] Doublons

### 2.5 Composables - Questions

- [ ] **Créer** `src/composables/useActivityQuestions.js`
  - [ ] `loadQuestions(activityId)`
  - [ ] `submitQuestion(activityId, questionData)`
  - [ ] `filterQuestionsBySpeaker(speakerId)`

- [ ] **Tester les questions**
  - [ ] Soumission
  - [ ] Affichage
  - [ ] Filtrage

---

## Phase 3: Composants Vue (3-4 jours)

### 3.1 Composants enfants

- [ ] **Créer** `src/components/activities/ActivityHero.vue`
  - [ ] Image de couverture
  - [ ] Titre
  - [ ] Badges (format, statut, thèmes)
  - [ ] Support Dark/Light mode

- [ ] **Créer** `src/components/activities/ActivityInfo.vue`
  - [ ] Date/Heure (2 fuseaux horaires)
  - [ ] Organisation (cliquable)
  - [ ] Pays
  - [ ] Dernière mise à jour
  - [ ] Support Dark/Light mode

- [ ] **Créer** `src/components/activities/ActivityTimezoneDisplay.vue`
  - [ ] Affichage fuseau événement
  - [ ] Affichage fuseau local
  - [ ] Icônes et labels clairs

- [ ] **Créer** `src/components/activities/ActivitySpeakers.vue`
  - [ ] Liste des speakers
  - [ ] Photos
  - [ ] Informations (nom, position, organisation)
  - [ ] Indicateur disponibilité questions
  - [ ] Support Dark/Light mode

- [ ] **Créer** `src/components/activities/ActivityDocuments.vue`
  - [ ] Liste des documents
  - [ ] Boutons de téléchargement
  - [ ] Filtrage par type
  - [ ] Support Dark/Light mode

- [ ] **Créer** `src/components/activities/ActivityRegistrationCard.vue`
  - [ ] Formulaire d'inscription
  - [ ] Validation
  - [ ] Gestion guest/user
  - [ ] Affichage conditionnel (si Zoom meeting existe)
  - [ ] Messages de succès/erreur
  - [ ] Support Dark/Light mode

- [ ] **Créer** `src/components/activities/ActivityQuestionsPanel.vue`
  - [ ] Formulaire question (si authentifié)
  - [ ] Message login required (si non authentifié)
  - [ ] Liste des questions
  - [ ] Filtrage par speaker
  - [ ] Support Dark/Light mode

- [ ] **Créer** `src/components/activities/ActivitySidebar.vue`
  - [ ] Liste des activités liées
  - [ ] Navigation rapide
  - [ ] Support Dark/Light mode

### 3.2 Page principale

- [ ] **Créer** `src/views/activities/Detail.vue`
  - [ ] Structure de la page
  - [ ] Intégration des composants enfants
  - [ ] Gestion du chargement (skeleton loaders)
  - [ ] Gestion des erreurs
  - [ ] Support Dark/Light mode
  - [ ] Responsive design (mobile, tablet, desktop)
  - [ ] SEO (meta tags)

---

## Phase 4: Routing et i18n (1 jour)

### 4.1 Routing

- [ ] **Ajouter la route** dans `src/router/index.js`
  ```javascript
  {
    path: '/activities/:id',
    name: 'activity-detail',
    component: () => import('@/views/activities/Detail.vue'),
    meta: {
      requiresAuth: false,
      title: 'Activity Detail'
    }
  }
  ```

- [ ] **Tester la navigation**
  - [ ] Depuis la page d'événements
  - [ ] Depuis la liste des activités
  - [ ] URL directe

### 4.2 Internationalisation

- [ ] **Mettre à jour** `src/locales/fr/index.js`
  - [ ] Ajouter toutes les clés de traduction FR
  - [ ] Vérifier la cohérence

- [ ] **Mettre à jour** `src/locales/en/index.js`
  - [ ] Ajouter toutes les clés de traduction EN
  - [ ] Vérifier la cohérence

- [ ] **Tester l'i18n**
  - [ ] Basculer entre FR et EN
  - [ ] Vérifier tous les textes

---

## Phase 5: Tests et Documentation (2-3 jours)

### 5.1 Tests unitaires

- [ ] **Tests utils**
  - [ ] `timezoneFormatter.test.js`
  - [ ] `activityHelpers.test.js`

- [ ] **Tests composables**
  - [ ] `useActivityDetail.test.js`
  - [ ] `useActivityRegistration.test.js`
  - [ ] `useActivityQuestions.test.js`

- [ ] **Exécuter tous les tests**
  ```bash
  npm run test:unit
  ```

### 5.2 Tests d'intégration

- [ ] **Scénarios E2E**
  - [ ] Inscription guest
  - [ ] Inscription user
  - [ ] Tentative doublon
  - [ ] Soumission question
  - [ ] Navigation activités

- [ ] **Exécuter les tests E2E**
  ```bash
  npm run test:e2e
  ```

### 5.3 Documentation

- [ ] **Documenter les composables**
  - [ ] JSDoc pour toutes les fonctions
  - [ ] Exemples d'utilisation

- [ ] **Documenter les composants**
  - [ ] Props
  - [ ] Events
  - [ ] Slots

- [ ] **Mettre à jour le README principal** si nécessaire

---

## Phase 6: Optimisation et Déploiement (1-2 jours)

### 6.1 Optimisation

- [ ] **Optimiser les requêtes Supabase**
  - [ ] Utiliser `.select()` avec jointures
  - [ ] Limiter les données chargées
  - [ ] Utiliser des index

- [ ] **Optimiser les images**
  - [ ] Lazy loading (sauf hero)
  - [ ] Formats optimisés
  - [ ] Skeleton loaders

- [ ] **Code splitting**
  - [ ] Lazy loading des composants non critiques
  - [ ] Analyse du bundle

- [ ] **Performance**
  - [ ] Mesurer TTFB, FCP, LCP, TTI
  - [ ] Vérifier les objectifs de performance
  - [ ] Optimiser si nécessaire

### 6.2 Responsive Design

- [ ] **Tester sur mobile** (< 640px)
  - [ ] Layout
  - [ ] Navigation
  - [ ] Formulaires
  - [ ] Images

- [ ] **Tester sur tablette** (640px - 1024px)
  - [ ] Layout
  - [ ] Navigation

- [ ] **Tester sur desktop** (> 1024px)
  - [ ] Layout complet
  - [ ] Sidebar

### 6.3 Accessibilité

- [ ] **Vérifier l'accessibilité**
  - [ ] Labels ARIA
  - [ ] Navigation clavier
  - [ ] Contraste des couleurs
  - [ ] Textes alternatifs
  - [ ] Messages d'erreur accessibles

### 6.4 Déploiement

- [ ] **Déployer en staging**
  - [ ] Tester toutes les fonctionnalités
  - [ ] Vérifier les logs

- [ ] **Déployer en production**
  - [ ] Migration SQL
  - [ ] Edge function
  - [ ] Code frontend
  - [ ] Vérifier le déploiement

### 6.5 Monitoring

- [ ] **Configurer le monitoring**
  - [ ] Logs edge function
  - [ ] Analytics (inscriptions, questions, etc.)
  - [ ] Alertes erreurs

---

## Validation finale

- [ ] **Revue de code**
  - [ ] Code review par un autre développeur
  - [ ] Vérifier le respect des conventions
  - [ ] Vérifier la sécurité

- [ ] **Tests utilisateurs**
  - [ ] Demander à des utilisateurs de tester
  - [ ] Recueillir les retours
  - [ ] Corriger les bugs trouvés

- [ ] **Documentation finale**
  - [ ] Vérifier que tout est documenté
  - [ ] Créer un guide utilisateur si nécessaire

---

## Checklist de déploiement

### Pré-déploiement

- [ ] Toutes les phases 1-6 sont complétées
- [ ] Tous les tests passent
- [ ] Performance vérifiée
- [ ] Accessibilité vérifiée
- [ ] Code review fait

### Déploiement

- [ ] Backup de la base de données
- [ ] Migration SQL appliquée
- [ ] Edge function déployée
- [ ] Variables d'environnement configurées
- [ ] Code frontend déployé

### Post-déploiement

- [ ] Vérifier que tout fonctionne en production
- [ ] Monitorer les logs pendant 24h
- [ ] Communiquer le déploiement aux utilisateurs
- [ ] Collecter les premiers retours

---

**Estimation totale**: 11-16 jours de développement

**Date de début**: ___________
**Date de fin prévue**: ___________
**Date de fin réelle**: ___________

---

## Notes et observations

(Espace pour noter les problèmes rencontrés, solutions trouvées, etc.)
