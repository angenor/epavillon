# Feature Specification: Sécurisation du lien Teams PACO

**Feature Branch**: `002-secure-teams-link`
**Created**: 2026-03-02
**Status**: Draft
**Input**: Empêcher le partage non autorisé du lien Teams en le remplaçant par un lien plateforme avec vérification d'inscription.

## Clarifications

### Session 2026-03-02

- Q: Le bouton "Rejoindre" et "Copier le lien" sur la page `/paco` doivent-ils passer par la gateway `/paco/join` (vérification redondante) ou ouvrir Teams directement (utilisateur déjà vérifié) ? → A: Les deux (bouton et copie) passent par la gateway `/paco/join` pour une cohérence maximale. Aucune exposition directe du lien Teams sur la page `/paco`.

## Contexte et problème

Actuellement, le lien Microsoft Teams pour le webinaire PACO est envoyé directement par email aux utilisateurs inscrits. Ce lien étant public, un utilisateur inscrit peut le partager avec des personnes non inscrites qui pourront alors rejoindre la réunion Teams sans passer par le processus d'inscription sur la plateforme ePavilion. Cela fausse les statistiques de participation et contourne le contrôle d'accès.

**Stratégie retenue** : Remplacer le lien Teams direct par un lien vers la plateforme ePavilion (ex: `https://epavillonclimatique.francophonie.org/paco/join`) qui vérifie l'inscription de l'utilisateur avant de le rediriger vers la réunion Teams.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Utilisateur inscrit accède au webinaire via le lien email (Priority: P1)

Un utilisateur inscrit au webinaire PACO reçoit un email de confirmation contenant un lien vers la plateforme ePavilion (et non plus le lien Teams direct). En cliquant sur ce lien, il est dirigé vers une page intermédiaire de la plateforme qui vérifie automatiquement son statut d'inscription. S'il est déjà connecté et inscrit, il est immédiatement redirigé vers la réunion Teams.

**Why this priority**: C'est le parcours principal et le plus fréquent. Sans cette fonctionnalité, la sécurisation n'a pas de sens.

**Independent Test**: Peut être testé en envoyant un email de confirmation à un utilisateur inscrit et en vérifiant que le clic mène d'abord à la plateforme puis redirige vers Teams.

**Acceptance Scenarios**:

1. **Given** un utilisateur connecté et inscrit au webinaire PACO, **When** il clique sur le lien de la plateforme reçu par email, **Then** il est redirigé automatiquement vers la réunion Teams.
2. **Given** un utilisateur connecté et inscrit, **When** il accède à la page de vérification, **Then** la vérification et la redirection se font en moins de 3 secondes.

---

### User Story 2 - Utilisateur non connecté est invité à se connecter (Priority: P1)

Un utilisateur inscrit mais non connecté clique sur le lien de la plateforme reçu par email. La page intermédiaire détecte qu'il n'est pas connecté et lui demande de s'authentifier. Après connexion, le système vérifie son inscription et le redirige vers Teams.

**Why this priority**: Beaucoup d'utilisateurs ne seront pas connectés au moment de cliquer sur le lien email. Ce parcours est aussi fréquent que le premier.

**Independent Test**: Peut être testé en accédant au lien sans être connecté, en se connectant, puis en vérifiant la redirection vers Teams.

**Acceptance Scenarios**:

1. **Given** un utilisateur non connecté, **When** il clique sur le lien de la plateforme, **Then** il voit un formulaire de connexion avec un message expliquant qu'il doit se connecter pour accéder au webinaire.
2. **Given** un utilisateur non connecté qui se connecte avec succès, **When** son inscription est vérifiée, **Then** il est redirigé automatiquement vers la réunion Teams.
3. **Given** un utilisateur non connecté qui se connecte avec succès, **When** il n'est pas inscrit au webinaire, **Then** il est redirigé vers la page PACO avec un message indiquant que l'inscription est obligatoire.

---

### User Story 3 - Utilisateur non inscrit est bloqué (Priority: P1)

Une personne non inscrite au webinaire (qui a reçu le lien par partage informel) tente d'accéder à la page intermédiaire. Le système détecte qu'elle n'est pas inscrite et l'informe que l'inscription est obligatoire, puis la redirige vers la page de l'activité PACO pour s'inscrire.

**Why this priority**: C'est la raison d'être de cette fonctionnalité — empêcher l'accès non autorisé.

**Independent Test**: Peut être testé en accédant au lien avec un compte non inscrit au webinaire et en vérifiant le blocage.

**Acceptance Scenarios**:

1. **Given** un utilisateur connecté mais non inscrit au webinaire PACO, **When** il accède à la page de vérification, **Then** il voit un message indiquant que l'inscription est obligatoire pour rejoindre le webinaire.
2. **Given** un utilisateur non inscrit, **When** il est bloqué, **Then** un bouton/lien lui permet de se rendre sur la page PACO pour s'inscrire.
3. **Given** un visiteur anonyme (non connecté, non inscrit), **When** il accède au lien, **Then** il est d'abord invité à se connecter, puis s'il n'est pas inscrit, il est redirigé vers la page PACO.

---

### User Story 4 - Email de confirmation contient le lien plateforme (Priority: P2)

L'email de confirmation envoyé après l'inscription contient désormais le lien de la plateforme ePavilion (ex: `https://epavillonclimatique.francophonie.org/paco/join`) au lieu du lien Teams direct. Le lien Teams n'apparaît nulle part dans l'email.

**Why this priority**: Complémentaire à la vérification — si le lien Teams reste dans l'email, la sécurisation est inutile.

**Independent Test**: Peut être testé en s'inscrivant au webinaire et en vérifiant le contenu de l'email reçu.

**Acceptance Scenarios**:

1. **Given** un utilisateur qui vient de s'inscrire au webinaire, **When** l'email de confirmation est envoyé, **Then** l'email contient le lien plateforme et non le lien Teams direct.
2. **Given** un utilisateur qui renvoie l'email de confirmation, **When** l'email est renvoyé, **Then** il contient également le lien plateforme.

---

### User Story 5 - Section "Rejoindre" de la page PACO mise à jour (Priority: P2)

La section "Rejoindre le webinaire" affichée aux utilisateurs inscrits sur la page PACO utilise désormais le lien plateforme au lieu du lien Teams direct. Le bouton de copie copie également le lien plateforme. Le lien Teams n'est plus exposé directement sur la page.

**Why this priority**: Cohérence avec la stratégie — le lien Teams ne doit être accessible que via la redirection vérifiée.

**Independent Test**: Peut être testé en vérifiant que la section Rejoindre affiche et copie le lien plateforme.

**Acceptance Scenarios**:

1. **Given** un utilisateur inscrit sur la page PACO, **When** il voit la section "Rejoindre", **Then** le bouton "Rejoindre" mène au lien de vérification de la plateforme et non au lien Teams direct.
2. **Given** un utilisateur inscrit, **When** il copie le lien, **Then** le lien copié est celui de la plateforme.

---

### Edge Cases

- Que se passe-t-il si un utilisateur inscrit partage le lien plateforme ? Le destinataire sera bloqué car non inscrit — c'est le comportement voulu.
- Que se passe-t-il si la session de l'utilisateur expire entre le clic et la vérification ? L'utilisateur est invité à se reconnecter.
- Que se passe-t-il si l'utilisateur s'inscrit après avoir été bloqué, puis revient sur le lien ? La vérification passe et il est redirigé vers Teams.
- Que se passe-t-il si le lien Teams lui-même est invalide ou expiré ? L'utilisateur est redirigé vers Teams normalement ; la gestion de la validité du lien Teams est hors périmètre.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT fournir une page intermédiaire (gateway) accessible via une URL dédiée de la plateforme (ex: `/paco/join`).
- **FR-002**: La page gateway DOIT vérifier si l'utilisateur est authentifié sur la plateforme.
- **FR-003**: Si l'utilisateur n'est pas authentifié, le système DOIT afficher un formulaire de connexion avec un message contextuel expliquant la raison.
- **FR-004**: Si l'utilisateur est authentifié, le système DOIT vérifier automatiquement son inscription au webinaire PACO.
- **FR-005**: Si l'utilisateur est inscrit, le système DOIT le rediriger vers la réunion Teams.
- **FR-006**: Si l'utilisateur n'est pas inscrit, le système DOIT afficher un message indiquant que l'inscription est obligatoire et proposer un lien vers la page d'inscription PACO.
- **FR-007**: L'email de confirmation DOIT contenir le lien plateforme (`/paco/join`) et ne DOIT PLUS contenir le lien Teams direct.
- **FR-008**: La section "Rejoindre" de la page PACO DOIT utiliser le lien plateforme (`/paco/join`) au lieu du lien Teams direct, aussi bien pour le bouton "Rejoindre" que pour la fonctionnalité "Copier le lien". Le lien Teams ne DOIT JAMAIS être exposé directement sur la page `/paco`.
- **FR-009**: Le lien Teams réel DOIT rester confidentiel et ne DOIT être révélé qu'au moment de la redirection pour les utilisateurs vérifiés.
- **FR-010**: La page gateway DOIT supporter le mode clair et le mode sombre.
- **FR-011**: La page gateway DOIT être entièrement traduite en français et en anglais.

### Key Entities

- **Page Gateway (PacoJoinGateway)** : Page intermédiaire qui sert de point de contrôle entre le lien email et la réunion Teams. Vérifie l'authentification et l'inscription.
- **Inscription à l'activité** : Enregistrement existant dans `activity_registrations` liant un utilisateur à l'activité PACO, utilisé pour autoriser l'accès.

## Assumptions

- La page PACO existante (`/paco`) et son flux d'inscription restent inchangés.
- Le composable `usePacoRegistration` existant peut être réutilisé pour vérifier l'inscription sur la page gateway.
- Le formulaire de connexion sur la page gateway peut réutiliser les mécanismes d'authentification existants.
- L'URL de production sera `https://epavillonclimatique.francophonie.org/paco/join`.
- Après connexion depuis la page gateway, l'utilisateur reste sur la page gateway pour la vérification d'inscription (pas de redirection inutile).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des accès à la réunion Teams passent par la vérification d'inscription — aucun accès direct depuis l'email.
- **SC-002**: Les utilisateurs inscrits et connectés sont redirigés vers Teams en moins de 3 secondes après avoir cliqué sur le lien.
- **SC-003**: Les utilisateurs non inscrits sont systématiquement bloqués et redirigés vers la page d'inscription.
- **SC-004**: Les statistiques de participation reflètent uniquement les utilisateurs réellement inscrits sur la plateforme.
- **SC-005**: Les utilisateurs inscrits peuvent accéder à la réunion en maximum 2 clics depuis l'email (clic lien → redirection, ou clic lien → connexion → redirection).
