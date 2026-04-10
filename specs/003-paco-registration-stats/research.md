# Research: Formulaire d'inscription PACO et Statistiques Admin

**Branch**: `003-paco-registration-stats` | **Date**: 2026-03-05

## R1: Stratégie de stockage des données démographiques

**Decision**: Créer une table dédiée `paco_demographic_data` liée à `activity_registrations.id` par clé étrangère.

**Rationale**:
- La table `activity_registrations` est partagée par toutes les activités du système. Y ajouter des colonnes PACO-spécifiques (genre, profil d'âge, statut professionnel, consentement) polluerait le modèle commun.
- Une table séparée respecte le principe d'isolation PACO (FR-009) : supprimer PACO = `DROP TABLE paco_demographic_data` + suppression des fichiers.
- La relation 1:1 avec `activity_registrations` est simple à joindre pour les statistiques.

**Alternatives considered**:
- Ajout de colonnes à `activity_registrations` : rejeté car modifie un modèle partagé, rend la suppression future risquée.
- Colonne JSONB sur `activity_registrations` : rejeté car pas de validation au niveau DB, requêtes d'agrégation plus complexes.

## R2: Formulaires concernés par l'ajout des champs

**Decision**: Ajouter les champs démographiques aux DEUX formulaires existants : `PacoRegisterForm.vue` (nouveaux utilisateurs) et `PacoActivityRegister.vue` (utilisateurs existants).

**Rationale**:
- Le flow PACO a deux chemins : nouveaux utilisateurs (register) et existants (activity-register). Les deux mènent à une inscription PACO et nécessitent les mêmes données démographiques.
- `PacoRegisterForm` collecte déjà prénom, nom, email, mot de passe, pays, organisation. Il faut y ajouter : genre, profil d'âge, ville, statut professionnel, consentement.
- `PacoActivityRegister` collecte déjà pays et organisation. Il faut y ajouter : genre, profil d'âge, ville, statut professionnel, consentement.
- Le champ pays existe déjà dans les deux formulaires (via `useCountries()`). Le champ ville est nouveau.

**Alternatives considered**:
- Un seul formulaire unifié : rejeté car les deux flows sont distincts (création de compte vs inscription simple) et ont des besoins différents.

## R3: Emplacement de la rubrique admin PACO

**Decision**: Créer une nouvelle vue `src/views/paco/PacoAdmin.vue` avec une route admin dédiée, protégée par le guard d'authentification admin existant.

**Rationale**:
- Le dossier `src/views/paco/` contient déjà les vues PACO (`PacoWebinar.vue`, `PacoJoinGateway.vue`). Y placer la vue admin maintient l'isolation.
- L'admin existant est dans `src/views/admin/` mais y mettre le code PACO irait à l'encontre du principe d'isolation.
- La route sera ajoutée au routeur avec le guard `requiresAuth` + vérification du rôle admin.

**Alternatives considered**:
- Placer dans `src/views/admin/paco/` : rejeté car disperserait le code PACO dans deux arborescences différentes, complexifiant la suppression.

## R4: Export CSV

**Decision**: Implémentation côté client (JavaScript pur) pour générer le CSV à partir des données déjà chargées en mémoire.

**Rationale**:
- Le nombre d'inscrits à un webinaire PACO est attendu dans les centaines, pas les milliers. Le chargement complet en mémoire est raisonnable.
- Pas besoin d'edge function Supabase pour l'export — génération côté client avec `Blob` + `URL.createObjectURL` + lien de téléchargement.
- Plus simple, pas de dépendance serveur supplémentaire, conforme au principe KISS.

**Alternatives considered**:
- Edge function Supabase pour générer le CSV : rejeté car over-engineering pour le volume attendu.
- Bibliothèque tierce (xlsx, papaparse) : rejeté car la génération CSV est triviale en JS natif pour ce cas d'usage.

## R5: Gestion des inscriptions antérieures sans données démographiques

**Decision**: Les inscriptions PACO existantes (avant l'ajout des champs démographiques) apparaîtront dans les statistiques et la liste avec "Non renseigné" pour les champs manquants. Elles seront exclues des calculs de pourcentage (seules les inscriptions avec données démographiques sont comptées dans les répartitions).

**Rationale**:
- Inclure des "Non renseigné" dans les pourcentages fausserait les statistiques (ex: 50% Homme, 50% Non renseigné).
- Le nombre total d'inscrits reste exact (toutes inscriptions confondues).
- Dans la liste détaillée, les colonnes vides affichent "Non renseigné" pour la transparence.

**Alternatives considered**:
- Demander aux utilisateurs existants de compléter leurs données : rejeté car intrusif et complexe.
- Ignorer les anciennes inscriptions : rejeté car perte d'information sur le nombre total.

## R6: Composable pour les statistiques

**Decision**: Créer un composable `usePacoStats.js` dans `src/composables/paco/` qui encapsule les requêtes de statistiques et la logique de calcul des pourcentages.

**Rationale**:
- Sépare la logique de récupération/calcul de la vue (principe de responsabilité unique).
- Réutilisable si les statistiques doivent être affichées ailleurs.
- Cohérent avec le pattern existant (`usePacoRegistration.js`, `usePacoEmail.js`).

**Alternatives considered**:
- Logique directement dans le composant Vue : rejeté car mélangerait présentation et logique métier.
- Store Pinia : rejeté car les données sont spécifiques à une vue et n'ont pas besoin d'être partagées globalement.
