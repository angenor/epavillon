# Feature Specification: Formulaire d'inscription PACO et Statistiques Admin

**Feature Branch**: `003-paco-registration-stats`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "Formulaire d'inscription pour l'événement spécial PACO avec champs spécifiques (prénom, nom, email, genre, profil d'âge, ville, pays, statut professionnel, organisation, consentement enregistrement) et rubrique admin pour statistiques des inscrits. Tout le code PACO doit être isolé dans des dossiers distincts pour suppression facile ultérieure."

## Clarifications

### Session 2026-03-05

- Q: Le nouveau formulaire doit-il remplacer le formulaire PACO existant ou être un formulaire parallèle ? → A: Remplacer le formulaire existant (PacoRegisterForm.vue) en y ajoutant les nouveaux champs démographiques.
- Q: Le formulaire doit-il exiger un compte utilisateur (flow actuel) ou être ouvert au public sans authentification ? → A: Conserver le flow d'authentification existant (compte requis) et ajouter les champs démographiques au formulaire d'inscription existant.
- Q: L'administrateur doit-il aussi voir la liste détaillée des inscrits en plus des statistiques agrégées ? → A: Oui, afficher la liste détaillée des inscrits avec possibilité d'export (CSV/Excel).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inscription à l'événement PACO (Priority: P1)

Un utilisateur authentifié souhaite s'inscrire à l'événement spécial PACO (webinaire). Après avoir vérifié son email et s'être connecté via le flow existant, il accède au formulaire d'inscription enrichi et remplit les informations requises : prénom, nom (pré-remplis depuis son profil), email (pré-rempli, lecture seule), genre, profil d'âge, ville, pays, statut professionnel, organisation, et donne son consentement pour l'enregistrement du webinaire. Après soumission, il reçoit une confirmation d'inscription.

**Why this priority**: C'est la fonctionnalité principale — sans formulaire d'inscription, aucune donnée ne peut être collectée et les statistiques admin n'ont pas de sens.

**Independent Test**: Peut être testé en se connectant, en accédant au formulaire, en remplissant tous les champs et en vérifiant que l'inscription est enregistrée avec succès.

**Acceptance Scenarios**:

1. **Given** un utilisateur authentifié accède au formulaire d'inscription PACO, **When** il remplit tous les champs obligatoires et soumet le formulaire, **Then** l'inscription est enregistrée avec les données démographiques et un message de confirmation est affiché.
2. **Given** un utilisateur authentifié remplit le formulaire mais omet un champ obligatoire, **When** il tente de soumettre, **Then** un message d'erreur indique le(s) champ(s) manquant(s).
3. **Given** un utilisateur déjà inscrit à PACO accède au formulaire, **When** le système détecte l'inscription existante, **Then** il est informé qu'il est déjà inscrit (comportement existant conservé).
4. **Given** un utilisateur n'a pas coché la case de consentement pour l'enregistrement, **When** il tente de soumettre, **Then** le formulaire ne se soumet pas et indique que le consentement est obligatoire.

---

### User Story 2 - Consultation des statistiques PACO (Priority: P2)

Un administrateur souhaite consulter les statistiques des inscrits à l'événement PACO. Il accède à une rubrique dédiée dans l'interface d'administration où il visualise : le nombre total d'inscrits, la répartition par genre (% Homme, % Femme), la répartition par profil d'âge (% moins de 35 ans, % plus de 35 ans), et la répartition par statut professionnel (% Salarié, % Étudiant, % Entrepreneur, % Sans emploi).

**Why this priority**: Les statistiques sont la finalité analytique de la collecte de données, mais nécessitent d'abord que des inscriptions existent.

**Independent Test**: Peut être testé en créant quelques inscriptions de test puis en vérifiant que les statistiques affichées correspondent aux données saisies.

**Acceptance Scenarios**:

1. **Given** un administrateur accède à la rubrique statistiques PACO, **When** des inscriptions existent, **Then** les statistiques sont affichées avec les pourcentages corrects pour chaque catégorie.
2. **Given** un administrateur accède à la rubrique statistiques PACO, **When** aucune inscription n'existe, **Then** un message indique qu'il n'y a pas encore d'inscrits.
3. **Given** de nouvelles inscriptions sont enregistrées, **When** l'administrateur rafraîchit la page statistiques, **Then** les chiffres sont mis à jour.

---

### User Story 3 - Liste détaillée et export des inscrits PACO (Priority: P3)

Un administrateur souhaite consulter la liste complète des inscrits à l'événement PACO avec toutes les informations démographiques, et exporter cette liste au format CSV ou Excel pour des besoins de reporting ou de communication.

**Why this priority**: Complément essentiel aux statistiques agrégées pour la gestion opérationnelle de l'événement, mais les statistiques visuelles sont prioritaires.

**Independent Test**: Peut être testé en vérifiant que la liste affiche toutes les colonnes attendues et que l'export génère un fichier valide contenant les mêmes données.

**Acceptance Scenarios**:

1. **Given** un administrateur accède à la rubrique PACO dans l'admin, **When** il consulte la liste des inscrits, **Then** il voit un tableau avec : prénom, nom, email, genre, profil d'âge, ville, pays, statut professionnel, organisation, date d'inscription.
2. **Given** un administrateur consulte la liste des inscrits, **When** il clique sur le bouton d'export, **Then** un fichier CSV/Excel est téléchargé contenant toutes les données des inscrits.
3. **Given** aucune inscription n'existe, **When** l'administrateur consulte la liste, **Then** un message indique qu'il n'y a pas encore d'inscrits et le bouton d'export est désactivé.

---

### Edge Cases

- Que se passe-t-il si un utilisateur soumet le formulaire plusieurs fois rapidement (double-clic) ? Le système doit empêcher les doublons.
- Que se passe-t-il si le pays sélectionné contient des caractères spéciaux (ex: Côte d'Ivoire) ? Le système doit gérer correctement l'encodage.
- Que se passe-t-il si l'administrateur consulte les statistiques alors qu'une seule inscription existe ? Les pourcentages doivent être calculés correctement (100% dans une catégorie).
- Comment le système gère-t-il la suppression future de toute la fonctionnalité PACO ? Tout le code doit être isolé dans des dossiers distincts pour faciliter la suppression.
- Que se passe-t-il si un utilisateur existant a déjà une inscription PACO (via l'ancien formulaire sans champs démographiques) ? Le système doit gérer gracieusement les inscriptions antérieures sans données démographiques.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le formulaire d'inscription PACO existant (PacoRegisterForm.vue) DOIT être enrichi avec les champs suivants en plus des champs existants (prénom, nom, email) : genre (sélection : Homme/Femme, obligatoire), profil d'âge (sélection : Plus de 35 ans/Moins de 35 ans, obligatoire), ville (texte, obligatoire), pays (liste déroulante, obligatoire), statut professionnel (sélection : Salarié/Étudiant/Sans emploi/Entrepreneur, obligatoire), organisation (texte, optionnel), consentement d'enregistrement (case à cocher unique obligatoire — "Je suis informé que ce webinaire sera enregistré et je donne mon accord pour être enregistré").
- **FR-002**: Le système DOIT valider tous les champs obligatoires avant soumission et afficher des messages d'erreur explicites pour chaque champ invalide ou manquant.
- **FR-003**: Le système DOIT valider le format de l'adresse email.
- **FR-004**: Le système DOIT conserver le flow d'authentification existant (vérification email, connexion/création de compte) avant l'accès au formulaire d'inscription.
- **FR-005**: Le système DOIT afficher un message de confirmation après une inscription réussie.
- **FR-006**: Le système DOIT fournir une rubrique dédiée dans l'administration affichant les statistiques suivantes : nombre total d'inscrits, pourcentage d'hommes, pourcentage de femmes, pourcentage de moins de 35 ans, pourcentage de plus de 35 ans, pourcentage d'étudiants, pourcentage de salariés, pourcentage d'entrepreneurs, pourcentage de sans emploi.
- **FR-007**: Les statistiques DOIVENT se calculer dynamiquement à partir des données d'inscription actuelles.
- **FR-008**: La liste déroulante des pays DOIT contenir une liste complète des pays francophones et internationaux.
- **FR-009**: Tout le code source lié à PACO (composants, composables, vues, routes) DOIT être organisé dans des dossiers distincts et identifiables pour permettre une suppression facile ultérieure.
- **FR-010**: Le système DOIT empêcher la double soumission du formulaire (protection contre le double-clic).
- **FR-011**: L'administration DOIT afficher une liste détaillée des inscrits avec toutes les informations collectées (prénom, nom, email, genre, profil d'âge, ville, pays, statut professionnel, organisation, date d'inscription).
- **FR-012**: L'administrateur DOIT pouvoir exporter la liste des inscrits au format CSV ou Excel.
- **FR-013**: Les données démographiques DOIVENT être stockées en association avec l'inscription existante dans `activity_registrations` (via extension de la table ou table complémentaire dédiée).

### Key Entities

- **Inscription PACO** (extension de `activity_registrations`): Représente une inscription à l'événement PACO. Attributs existants conservés (activity_id, user_id, registration_type). Nouveaux attributs démographiques : genre (Homme/Femme), profil d'âge (Plus de 35 ans/Moins de 35 ans), ville, pays, statut professionnel (Salarié/Étudiant/Sans emploi/Entrepreneur), organisation (optionnel), consentement enregistrement (booléen, toujours vrai), date d'inscription.

## Assumptions

- Le flow d'authentification existant (vérification email → connexion/création de compte) est conservé tel quel.
- Les champs prénom, nom et email sont pré-remplis depuis le profil utilisateur (email en lecture seule).
- La rubrique statistiques admin est accessible uniquement aux utilisateurs ayant un rôle administrateur dans le système existant.
- La liste des pays sera fournie en français et triée alphabétiquement.
- Le champ "Organisation" est optionnel car tous les profils (étudiants, sans emploi) n'ont pas nécessairement une organisation.
- Le consentement d'enregistrement est une case à cocher unique qui doit être cochée — il n'y a pas d'option "Non" (l'inscription requiert le consentement).
- Les inscriptions PACO antérieures (sans données démographiques) apparaîtront dans les statistiques et la liste avec des valeurs "Non renseigné" pour les champs démographiques.
- L'export est au format CSV (compatible Excel) par défaut.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un utilisateur authentifié peut compléter le formulaire d'inscription PACO enrichi en moins de 3 minutes.
- **SC-002**: 100% des soumissions avec des champs obligatoires manquants sont rejetées avec des messages d'erreur clairs.
- **SC-003**: Les statistiques admin reflètent fidèlement les données d'inscription (les pourcentages totalisent 100% pour chaque catégorie).
- **SC-004**: La suppression de toute la fonctionnalité PACO peut être réalisée en supprimant uniquement les dossiers dédiés, sans impact sur le reste de l'application.
- **SC-005**: L'administrateur peut exporter la liste complète des inscrits en un clic et obtenir un fichier exploitable.
