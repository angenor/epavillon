# Feature Specification: Page d'inscription au webinaire PACO

**Feature Branch**: `001-paco-webinar`
**Created**: 2026-03-02
**Status**: Draft
**Input**: Création d'une page autonome et isolée pour le webinaire PACO (Priorités d'Adaptation en Afrique Centrale et de l'Ouest) avec système d'inscription intégré, authentification en place, envoi de lien Teams par email, et statistiques de participation fiables.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visiteur non connecté s'inscrit au webinaire (nouveau compte) (Priority: P1)

Un visiteur non connecté arrive sur la page dédiée au webinaire PACO. Il découvre la présentation du webinaire (titre, description, date, intervenants). Un formulaire lui demande d'entrer son email. Le système vérifie si cet email correspond à un compte existant sur la plateforme. Comme le compte n'existe pas, un formulaire d'inscription à la plateforme s'affiche directement sur la page (sans redirection), enrichi des champs nécessaires à l'inscription à l'activité. Dès que l'utilisateur s'inscrit, il est automatiquement enregistré comme participant au webinaire et reçoit un email contenant son lien de connexion Teams.

**Why this priority**: C'est le flux principal : la majorité des participants seront de nouveaux visiteurs qui découvrent le webinaire PACO. Sans ce flux, aucune inscription n'est possible.

**Independent Test**: Peut être testé en visitant la page PACO sans être connecté, en entrant un email non existant, en remplissant le formulaire d'inscription, puis en vérifiant que l'inscription apparaît dans `activity_registrations` et que l'email avec le lien Teams est envoyé.

**Acceptance Scenarios**:

1. **Given** un visiteur non connecté arrive sur la page PACO, **When** il entre un email qui n'existe pas dans la plateforme, **Then** le formulaire d'inscription à la plateforme s'affiche directement sur la page avec les champs d'inscription à l'activité.
2. **Given** un visiteur remplit le formulaire d'inscription complet (plateforme + activité), **When** il soumet le formulaire, **Then** un compte utilisateur est créé, une entrée est ajoutée dans `activity_registrations` avec l'ID fictif du webinaire PACO, et un email contenant le lien de connexion Teams est envoyé à l'utilisateur.
3. **Given** un visiteur vient de s'inscrire avec succès, **When** l'inscription est confirmée, **Then** la page affiche le bouton de connexion au webinaire et le lien Teams à copier.

---

### User Story 2 - Utilisateur existant non connecté s'inscrit au webinaire (Priority: P1)

Un visiteur non connecté entre son email sur la page PACO. Le système détecte que cet email correspond à un compte existant. Le formulaire de connexion s'affiche directement sur la page (sans redirection vers la page de login). L'utilisateur entre son mot de passe et se connecte. S'il n'est pas encore inscrit au webinaire, le système l'inscrit et lui envoie le lien de connexion Teams par email. S'il est déjà inscrit, le bouton de connexion et le lien Teams s'affichent.

**Why this priority**: Priorité équivalente à P1 car les utilisateurs existants de la plateforme doivent pouvoir s'inscrire au webinaire sans friction.

**Independent Test**: Peut être testé en visitant la page PACO sans être connecté, en entrant un email d'un compte existant, en se connectant via le formulaire intégré, puis en vérifiant l'inscription et l'envoi de l'email.

**Acceptance Scenarios**:

1. **Given** un visiteur non connecté arrive sur la page PACO, **When** il entre un email qui existe déjà dans la plateforme, **Then** le formulaire de connexion (email + mot de passe) s'affiche directement sur la page.
2. **Given** un utilisateur existant se connecte via le formulaire intégré et n'est pas encore inscrit au webinaire, **When** la connexion réussit, **Then** il est automatiquement inscrit au webinaire, une entrée est ajoutée dans `activity_registrations`, et un email avec le lien Teams est envoyé.
3. **Given** un utilisateur existant se connecte via le formulaire intégré et est déjà inscrit au webinaire, **When** la connexion réussit, **Then** le bouton de connexion au webinaire et le lien Teams à copier s'affichent directement.

---

### User Story 3 - Utilisateur connecté accède au webinaire (Priority: P2)

Un utilisateur déjà connecté à la plateforme arrive sur la page PACO. Le système vérifie automatiquement s'il est inscrit au webinaire. S'il est inscrit, le bouton de connexion Teams et le lien à copier-coller s'affichent immédiatement. S'il n'est pas inscrit, un formulaire d'inscription à l'activité s'affiche pour compléter son inscription.

**Why this priority**: Flux secondaire mais important pour les utilisateurs réguliers de la plateforme qui naviguent vers le webinaire PACO.

**Independent Test**: Peut être testé en se connectant d'abord à la plateforme, puis en naviguant vers la page PACO, et en vérifiant que le système détecte correctement le statut d'inscription.

**Acceptance Scenarios**:

1. **Given** un utilisateur connecté arrive sur la page PACO et est déjà inscrit au webinaire, **When** la page se charge, **Then** le bouton de connexion Teams et le lien personnel à copier-coller s'affichent.
2. **Given** un utilisateur connecté arrive sur la page PACO et n'est pas inscrit au webinaire, **When** la page se charge, **Then** un formulaire d'inscription à l'activité s'affiche avec les champs pré-remplis depuis son profil (organisation, pays) et modifiables.
3. **Given** un utilisateur connecté non inscrit remplit/vérifie le formulaire d'inscription pré-rempli, **When** il soumet le formulaire, **Then** une entrée est ajoutée dans `activity_registrations`, les éventuelles corrections de profil sont sauvegardées, et un email contenant le lien Teams est envoyé.

---

### User Story 4 - Envoi de l'email avec lien de connexion Teams (Priority: P2)

Lorsqu'un utilisateur s'inscrit au webinaire PACO, le système lui envoie automatiquement un email contenant le lien de connexion Teams. Cet email inclut les informations essentielles du webinaire (titre, date, heure) et le lien de connexion. L'email est envoyé via l'infrastructure existante d'envoi d'emails.

**Why this priority**: L'envoi de l'email est le mécanisme de distribution du lien de connexion et est essentiel pour que les participants puissent rejoindre le webinaire.

**Independent Test**: Peut être testé en s'inscrivant au webinaire et en vérifiant la réception de l'email avec le lien Teams correct.

**Acceptance Scenarios**:

1. **Given** un utilisateur vient de s'inscrire au webinaire, **When** l'inscription est confirmée, **Then** un email est envoyé contenant le titre du webinaire, la date/heure, et le lien de connexion Teams.
2. **Given** un utilisateur inscrit est sur la page PACO, **When** il clique sur "Renvoyer l'email", **Then** l'email avec le lien Teams est renvoyé.

---

### User Story 5 - Page de présentation du webinaire PACO (Priority: P2)

Tout visiteur (connecté ou non) arrivant sur la page PACO voit une présentation complète du webinaire : titre, description détaillée, date et heure, informations sur les intervenants, et le contexte de l'initiative PACO.

**Why this priority**: La page de présentation est le premier point de contact et doit convaincre le visiteur de s'inscrire.

**Independent Test**: Peut être testé en accédant à la page PACO et en vérifiant que toutes les informations du webinaire sont affichées correctement en mode clair/sombre, en français/anglais.

**Acceptance Scenarios**:

1. **Given** un visiteur arrive sur la page PACO, **When** la page se charge, **Then** le titre, la description, la date/heure et les informations des intervenants sont visibles.
2. **Given** un visiteur est sur la page PACO, **When** il bascule entre les thèmes clair et sombre, **Then** la page s'adapte correctement.
3. **Given** un visiteur est sur la page PACO, **When** il change la langue (fr/en), **Then** tout le contenu se traduit correctement.

---

### Edge Cases

- Que se passe-t-il si un utilisateur tente de s'inscrire deux fois au même webinaire ? Le système doit détecter l'inscription existante et afficher directement le lien de connexion sans créer de doublon.
- Que se passe-t-il si l'envoi de l'email échoue ? Le système doit afficher un message d'erreur et permettre de renvoyer l'email. Le lien de connexion doit rester accessible sur la page.
- Que se passe-t-il si l'utilisateur entre un email invalide ? Le système doit valider le format de l'email avant de vérifier son existence.
- Que se passe-t-il si l'inscription Supabase échoue (email déjà utilisé par un autre provider, etc.) ? Le système doit afficher un message d'erreur clair et proposer la connexion plutôt que l'inscription.
- Que se passe-t-il après la suppression de la fonctionnalité PACO ? Les données dans `activity_registrations` restent exploitables pour les statistiques car l'ID fictif est documenté.
- Que se passe-t-il si l'utilisateur actualise la page après son inscription ? Le système doit détecter qu'il est connecté et inscrit, et afficher le lien de connexion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT afficher une page de présentation du webinaire PACO accessible via une route dédiée.
- **FR-002**: Le système DOIT utiliser un ID d'activité dédié (UUID connu, créé via script SQL dans `activities` avec un event fictif associé) pour toutes les inscriptions dans `activity_registrations`.
- **FR-003**: Le système DOIT vérifier si un email saisi correspond à un compte existant sur la plateforme et afficher le formulaire approprié (connexion ou inscription).
- **FR-004**: Le système DOIT afficher le formulaire de connexion (email + mot de passe) directement sur la page PACO lorsqu'un compte existant est détecté, sans redirection.
- **FR-005**: Le système DOIT afficher le formulaire d'inscription à la plateforme directement sur la page PACO lorsqu'aucun compte n'est trouvé, enrichi des champs nécessaires à l'inscription à l'activité.
- **FR-006**: Le système DOIT créer automatiquement une entrée dans `activity_registrations` lorsqu'un utilisateur s'inscrit ou se connecte pour la première fois sur la page PACO.
- **FR-007**: Le système DOIT envoyer un email contenant le lien de connexion Teams lors de chaque nouvelle inscription au webinaire.
- **FR-008**: Le système DOIT afficher le bouton de connexion Teams et le lien à copier-coller aux utilisateurs connectés et inscrits.
- **FR-009**: Le système DOIT empêcher les inscriptions en double (un utilisateur ne peut s'inscrire qu'une seule fois au webinaire).
- **FR-010**: Le système DOIT supporter les thèmes clair et sombre.
- **FR-011**: Le système DOIT supporter l'internationalisation français/anglais.
- **FR-012**: Tout le code spécifique au webinaire PACO DOIT être regroupé dans des dossiers dédiés pour permettre une suppression facile après l'événement.
- **FR-013**: Le système DOIT permettre de renvoyer l'email de confirmation avec le lien Teams à la demande de l'utilisateur.

### Key Entities

- **Webinaire PACO**: Événement virtuel unique avec un ID fictif, un titre, une description, une date/heure, un lien Teams de connexion, et des informations sur les intervenants. Les données de présentation sont hardcodées dans les fichiers de traduction.
- **Inscription au webinaire** (`activity_registrations`): Enregistrement liant un utilisateur authentifié au webinaire PACO via l'ID fictif. Contient la date d'inscription et les données de participation.
- **Utilisateur** (`users`): Personne inscrite sur la plateforme, identifiée par son email, avec ses informations de profil (nom, prénom, organisation, pays).
- **Email de confirmation**: Message envoyé automatiquement contenant le lien de connexion Teams et les détails du webinaire.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visiteur non inscrit doit pouvoir compléter son inscription au webinaire (création de compte + inscription à l'activité) en moins de 3 minutes sans quitter la page PACO.
- **SC-002**: 100% des inscriptions au webinaire doivent générer un enregistrement dans la table `activity_registrations` avec l'ID fictif du PACO.
- **SC-003**: 100% des nouveaux inscrits doivent recevoir un email contenant le lien de connexion Teams dans les 30 secondes suivant l'inscription.
- **SC-004**: La suppression de la fonctionnalité PACO après l'événement doit pouvoir être effectuée en supprimant uniquement les dossiers dédiés et la route, sans impact sur le reste de l'application.
- **SC-005**: La page doit fonctionner correctement en français et en anglais, en mode clair et sombre.
- **SC-006**: Aucune inscription en double ne doit être possible pour un même utilisateur.

## Clarifications

### Session 2026-03-02

- Q: Comment gérer la contrainte FK `activity_id REFERENCES activities(id)` avec un ID fictif ? → A: Créer une entrée minimale (event fictif + activité fictive) en base via un script SQL avec des UUIDs connus.
- Q: Quel formulaire afficher à un utilisateur connecté non inscrit au webinaire ? → A: Formulaire avec champs pré-remplis et modifiables (organisation, pays) permettant de corriger ses informations avant inscription.

## Assumptions

- Le lien de connexion Teams est un lien unique fourni par l'organisateur et sera le même pour tous les participants (fonctionnement standard de Teams). La protection contre le partage repose sur le fait que seuls les inscrits reçoivent le lien par email, réduisant significativement la diffusion non autorisée.
- La contrainte de clé étrangère `activity_id REFERENCES activities(id)` dans `activity_registrations` est satisfaite en créant une entrée minimale dans `events` et `activities` via un script SQL avec des UUIDs connus et documentés. Ces entrées servent uniquement de support technique pour l'inscription et n'apparaissent pas dans les interfaces de gestion des événements/activités.
- L'envoi d'email utilise l'infrastructure existante (Edge Function `send-email`).
- L'inscription à la plateforme via le formulaire intégré suit le même processus que l'inscription standard (création d'authentification, trigger de création de profil).
- Les données du webinaire (titre, description, date, intervenants) sont hardcodées dans les fichiers de traduction i18n.
- Après l'événement, seuls les fichiers frontend seront supprimés. Les données dans `activity_registrations` resteront en base pour les statistiques.

## Isolation Architecture

Le code PACO sera organisé dans les dossiers suivants pour faciliter la suppression :

- **Vue/Page**: `src/views/paco/` - Page principale du webinaire
- **Composants**: `src/components/paco/` - Composants spécifiques (formulaire, présentation)
- **Composables**: `src/composables/paco/` - Logique métier (inscription, vérification email)
- **Traductions**: `src/locales/fr/paco.json` et `src/locales/en/paco.json`
- **Route**: Entrée dédiée dans le router, clairement identifiable

**Pour supprimer** : supprimer ces dossiers/fichiers + retirer la route du router + retirer l'import des traductions.
