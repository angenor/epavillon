# Feature Specification: Vérification email dans le workflow PACO

**Feature Branch**: `004-paco-email-verify`
**Created**: 2026-03-05
**Status**: Draft
**Input**: User description: "Lorsqu'un nouvel utilisateur non encore inscrit sur la plateforme s'inscrit au webinaire, cela échoue car son email n'est pas encore vérifié. Nous voulons que l'utilisateur puisse vérifier son email d'inscription à la plateforme dans le workflow. Une fois l'email vérifié, il reçoit automatiquement par email le lien de connexion Teams."

## User Scenarios & Testing

### User Story 1 - Inscription PACO complète pour un nouvel utilisateur (Priority: P1)

Un nouvel utilisateur (non inscrit sur la plateforme) accède à la page PACO, entre son email, remplit le formulaire d'inscription (prénom, nom, mot de passe, données démographiques). Après soumission, le système crée son compte et lui demande de vérifier son email. L'utilisateur reçoit un email de vérification, clique sur le lien, et est automatiquement redirigé vers la page PACO. À ce moment, le système finalise son inscription au webinaire et lui envoie automatiquement le lien de connexion Teams par email.

**Why this priority**: C'est le parcours principal bloqué aujourd'hui — les nouveaux utilisateurs ne peuvent pas s'inscrire au webinaire car l'insertion dans la base échoue tant que l'email n'est pas vérifié.

**Independent Test**: Peut être testé en accédant à `/paco` avec un nouvel email, en remplissant le formulaire, en vérifiant l'email via le lien reçu, et en confirmant que l'inscription au webinaire est automatiquement finalisée avec envoi du lien Teams.

**Acceptance Scenarios**:

1. **Given** un nouvel utilisateur sur la page `/paco`, **When** il entre un email non existant, remplit le formulaire d'inscription et soumet, **Then** son compte est créé et un écran lui demande de vérifier son email avec un message clair.
2. **Given** un utilisateur vient de soumettre le formulaire d'inscription PACO, **When** il clique sur le lien de vérification dans l'email reçu, **Then** il est redirigé vers la page PACO, son inscription au webinaire est finalisée automatiquement, et il reçoit le lien Teams par email.
3. **Given** un utilisateur est sur l'écran de vérification d'email, **When** il n'a pas reçu l'email de vérification, **Then** il peut demander le renvoi de l'email de vérification.
4. **Given** un utilisateur a vérifié son email et son inscription au webinaire est finalisée, **Then** il voit l'écran de confirmation avec le bouton pour rejoindre le webinaire Teams.

---

### User Story 2 - Retour d'un utilisateur avec email vérifié après inscription PACO incomplète (Priority: P2)

Un utilisateur a déjà créé son compte via le formulaire PACO mais n'a pas encore vérifié son email. Il revient sur la page `/paco`. Le système détecte qu'il est connecté mais que son inscription au webinaire n'est pas finalisée, et lui propose de vérifier son email ou, s'il l'a déjà vérifié entre-temps, finalise automatiquement l'inscription.

**Why this priority**: Gère le cas où l'utilisateur quitte la page avant de vérifier son email et revient plus tard.

**Independent Test**: Peut être testé en créant un compte via PACO sans vérifier l'email, puis en revenant sur `/paco` après avoir vérifié l'email depuis la boîte mail.

**Acceptance Scenarios**:

1. **Given** un utilisateur connecté avec email non vérifié revient sur `/paco`, **When** la page charge, **Then** le système lui montre l'écran de vérification d'email en attente.
2. **Given** un utilisateur connecté avec email vérifié mais non inscrit au webinaire revient sur `/paco`, **When** la page charge, **Then** le système finalise automatiquement son inscription au webinaire et lui envoie le lien Teams.

---

### Edge Cases

- Que se passe-t-il si l'utilisateur clique sur le lien de vérification dans un autre navigateur que celui où il s'est inscrit ? Le système doit quand même finaliser l'inscription au webinaire lorsqu'il reviendra sur `/paco` dans n'importe quel navigateur.
- Que se passe-t-il si le lien de vérification a expiré ? L'utilisateur doit pouvoir en demander un nouveau depuis l'écran d'attente de vérification.
- Que se passe-t-il si l'envoi du lien Teams échoue après la vérification ? L'inscription au webinaire reste valide et l'utilisateur peut voir le lien Teams directement sur la page.
- Que se passe-t-il si l'utilisateur essaie de s'inscrire avec un email déjà existant sur la plateforme ? Il est redirigé vers le formulaire de connexion (comportement existant inchangé).

## Requirements

### Functional Requirements

- **FR-001**: Le système DOIT afficher un écran de vérification d'email après la soumission du formulaire d'inscription d'un nouvel utilisateur, avec un message clair expliquant la marche à suivre.
- **FR-002**: L'écran de vérification d'email DOIT offrir un bouton pour renvoyer l'email de vérification.
- **FR-003**: Le lien de vérification d'email DOIT rediriger l'utilisateur vers la page `/paco` après confirmation.
- **FR-004**: Après vérification de l'email, le système DOIT automatiquement finaliser l'inscription au webinaire (insertion dans la base de données) sans action supplémentaire de l'utilisateur.
- **FR-005**: Après finalisation de l'inscription au webinaire, le système DOIT envoyer automatiquement un email contenant le lien de connexion Teams.
- **FR-006**: Les données démographiques saisies dans le formulaire d'inscription DOIVENT être conservées temporairement et insérées en base lors de la finalisation de l'inscription.
- **FR-007**: Lorsqu'un utilisateur connecté avec email vérifié revient sur `/paco` sans être inscrit au webinaire, le système DOIT finaliser automatiquement l'inscription.
- **FR-008**: L'écran de vérification d'email DOIT afficher un indicateur visuel de l'état (en attente / vérifié).
- **FR-009**: Le système DOIT supporter le français et l'anglais pour tous les nouveaux textes affichés.

### Key Entities

- **Données démographiques temporaires** : Les informations saisies dans le formulaire (genre, profil d'âge, ville, pays, statut professionnel, organisation, consentement enregistrement) doivent être stockées temporairement côté client entre la soumission du formulaire et la finalisation de l'inscription après vérification de l'email.
- **État de vérification email** : L'état de confirmation de l'email de l'utilisateur, utilisé pour déterminer si l'inscription au webinaire peut être finalisée.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% des nouveaux utilisateurs qui vérifient leur email après inscription via PACO ont leur inscription au webinaire finalisée automatiquement.
- **SC-002**: L'utilisateur reçoit le lien de connexion Teams dans les 30 secondes suivant la vérification de son email.
- **SC-003**: Le workflow complet (inscription + vérification + réception du lien Teams) peut être complété en moins de 5 minutes par un utilisateur.
- **SC-004**: Le taux de complétion de l'inscription au webinaire pour les nouveaux utilisateurs passe de 0% (bloqué actuellement) à plus de 90%.

## Assumptions

- Le système d'envoi d'emails de vérification existant de la plateforme fonctionne correctement.
- Le lien de vérification d'email peut être configuré pour rediriger vers `/paco` au lieu de la page de connexion par défaut.
- Le stockage temporaire des données démographiques côté client (session du navigateur) est suffisant — pas besoin de persistance serveur avant la vérification.
- Le comportement existant pour les utilisateurs déjà inscrits sur la plateforme (connexion puis inscription au webinaire) reste inchangé.

## Scope

### In Scope

- Ajout d'un écran de vérification d'email dans le workflow PACO
- Stockage temporaire des données démographiques côté client
- Finalisation automatique de l'inscription au webinaire après vérification
- Envoi automatique du lien Teams après finalisation
- Bouton de renvoi d'email de vérification
- Redirection vers `/paco` après vérification d'email
- Traductions FR/EN pour tous les nouveaux textes

### Out of Scope

- Modification du système d'envoi d'emails de vérification de la plateforme
- Modification du flux de connexion pour les utilisateurs existants
- Modification de l'interface d'administration PACO
- Modification de la structure des tables en base de données
