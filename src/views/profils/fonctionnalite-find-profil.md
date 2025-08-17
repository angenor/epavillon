# Fonctionnalités de la Page Profil Publique

## 1. Annuaire Public des Professionnels (Index)

### 1.1 Filtres de recherche
- **Par nom** : Recherche textuelle (first_name, last_name)
- **Par organisation** : Dropdown des organisations actives et vérifiées
- **Par pays** : Dropdown des pays francophones (table countries)
- **Par domaine d'expertise** :
  - Négociateur climatique
  - Expert en développement durable
  - Formateur
- **Profils visibles uniquement** : networking_visibility = true

### 1.2 Affichage en grille/liste
- **Photo de profil** (miniature publique)
- **Nom complet** (first_name + last_name)
- **Organisation** (nom uniquement et Badge vérifiée ou Badge non vérifié)
- **Pays** (nom du pays)
- **Titre professionnel** (position)
- **Badge négociateur** (si applicable)
- **Badge formateur certifié** (si applicable)

### 1.3 Actions disponibles (pour utilisateurs connectés)
- **Voir le profil public**
- **Envoyer une demande de connexion**
- **Consulter les activités publiques**

### 1.4 Pagination
- Affichage par 20/50/100 professionnels
- Navigation par pages
- Compteur de résultats

## 2. Profil Public (Show)

### 2.1 En-tête du profil
- **Photo de profil** (publique)
- **Nom complet**
- **Titre professionnel** (position)
- **Organisation** (si vérifiée)
- **Pays de résidence**
- **Badges publics** :
  - Négociateur certifié
  - Formateur agréé
  - Expert reconnu

### 2.2 Biographie professionnelle
- **Présentation publique** (biography - version publique)
- **Domaines d'expertise**
- **Langues parlées**

### 2.3 Statistiques publiques

#### Participation à la plateforme
- **Membre depuis** (année uniquement)
- **Nombre d'activités organisées** (validées uniquement)
- **Événements participés** (publics)
- **Formations dispensées** (si formateur)

#### Pour les négociateurs (informations publiques)
- **Années d'expérience en négociation**
- **Nombre de COP participées**
- **Thématiques de spécialisation**

### 2.4 Activités publiques

#### Activités organisées
- **Liste des activités approuvées**
- **Titre et date**
- **Type d'activité**
- **Nombre de participants**

#### Formations publiques (si formateur)
- **Formations disponibles**
- **Catégories** : Climat, Biodiversité, Désertification
- **Nombre de participants formés**
- **Note moyenne** (sur 5)

## 3. Interactions pour Utilisateurs Connectés

### 3.1 Demande de connexion
- **Bouton "Se connecter"**
- **Message de présentation optionnel**
- **Notification envoyée au destinataire**

## 5. Répertoire des Organisations

### 5.1 Liste des organisations
- **Organisations vérifiées uniquement**
- **Logo et nom**
- **Pays d'origine**
- **Type d'organisation**
- **Nombre de membres sur la plateforme**

### 5.2 Profil d'organisation
- **Description publique**
- **Site web officiel**
- **Activités organisées**
- **Membres publics**

## 6. Statistiques Globales de la Communauté

### 6.1 Indicateurs généraux
- **Nombre total de professionnels**
- **Pays représentés**
- **Organisations partenaires**
- **Activités réalisées**

### 6.2 Répartition géographique
- **Carte interactive des membres**
- **Statistiques par pays francophone**
- **Réseaux régionaux**

## 7. Composants Vue.js Simplifiés

### Composants publics
- `PublicUserList.vue` - Annuaire public
- `PublicUserCard.vue` - Carte utilisateur
- `PublicProfile.vue` - Profil public
- `PublicProfileHeader.vue` - En-tête simplifié
- `PublicActivities.vue` - Activités publiques
- `PublicStats.vue` - Statistiques publiques
- `ConnectionRequestButton.vue` - Demande de connexion
- `PublicFilters.vue` - Filtres de recherche

### Composables publics
- `usePublicProfiles.js` - Données publiques
- `useConnectionRequest.js` - Demandes de connexion
- `usePublicActivities.js` - Activités publiques
- `usePublicStats.js` - Statistiques

## 8. Routes Vue Router Publiques

```javascript
{
  path: '/directory',
  name: 'public-directory',
  component: () => import('@/views/profils/PublicDirectory.vue'),
  meta: { public: true }
},
{
  path: '/directory/:id',
  name: 'public-profile',
  component: () => import('@/views/profils/PublicProfile.vue'),
  meta: { public: true }
},
{
  path: '/organizations',
  name: 'organizations-directory',
  component: () => import('@/views/profils/OrganizationsDirectory.vue'),
  meta: { public: true }
},
{
  path: '/organizations/:id',
  name: 'organization-profile',
  component: () => import('@/views/profils/OrganizationProfile.vue'),
  meta: { public: true }
}
```
## 9. Respect de la Vie Privée
### 9.1 Données affichées
- **Uniquement les informations marquées publiques**
- **Pas d'emails visibles**
- **Pas de téléphones**
- **Pas d'adresses physiques**

### 9.2 Contrôles utilisateur
- **Opt-in pour apparaître dans l'annuaire**
- **Choix des informations partagées**
- **Possibilité de retrait de l'annuaire**

## 10. Fonctionnalités pour Non-Connectés

### 10.1 Navigation libre
- **Consultation de l'annuaire**
- **Recherche de professionnels**
- **Vue des activités publiques**
- **Accès aux innovations partagées**

### 10.2 Incitation à l'inscription
- **Boutons d'appel à l'action**
- **Avantages de la connexion**
- **Processus d'inscription simplifié**