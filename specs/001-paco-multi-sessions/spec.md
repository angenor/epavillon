# Feature Specification: PACO Webinar Multi-Sessions avec Navigation par Onglets

**Feature Branch**: `001-paco-multi-sessions`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: Reorganiser les pages PACO (PacoWebinar.vue et PacoAdmin.vue) sous forme d'onglets multi-sessions : session 1 terminée avec vidéo YouTube en iframe autoplay, session 2 Justice climatique et inclusion sociale (30 avril 2026) avec inscription incluant un champ de sélection de session. Chaque session est un composant séparé.

---

## Contexte

Les pages PACO Webinar sont des pages temporaires créées pour une série d'événements périodiques hors cadre de la plateforme principale. Les informations sont en grande partie codées statiquement. La session 1 est terminée (Collectivités locales face au changement climatique), la session 2 est à venir (Justice climatique et inclusion sociale — 30 avril 2026).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Visiteur consulte les sessions via onglets (Priority: P1)

Un visiteur arrivant sur la page PACO voit une interface à onglets permettant de naviguer entre la session 1 (terminée, avec accès à l'enregistrement vidéo) et la session 2 (à venir, avec possibilité d'inscription). L'onglet de la session active (la prochaine) est sélectionné par défaut.

**Why this priority**: C'est le point d'entrée principal de la page. Sans navigation multi-sessions, aucune autre fonctionnalité n'est accessible.

**Independent Test**: Peut être testé en visitant `/paco` et en vérifiant que deux onglets sont visibles, que l'onglet Session 2 est actif par défaut, et que cliquer sur Session 1 affiche le contenu de la première session.

**Acceptance Scenarios**:

1. **Given** la page PACO est chargée, **When** le visiteur arrive, **Then** il voit deux onglets nommés avec les titres courts des sessions, l'onglet Session 2 est actif
2. **Given** le visiteur est sur l'onglet Session 2, **When** il clique sur l'onglet Session 1, **Then** le contenu de la session 1 s'affiche sans rechargement de page
3. **Given** l'onglet Session 1 est actif, **When** le visiteur examine le contenu, **Then** il voit la présentation de la session 1 et le lecteur vidéo de l'enregistrement

---

### User Story 2 — Visiteur regarde l'enregistrement de la Session 1 (Priority: P2)

Un visiteur souhaitant revoir la session 1 terminée accède à l'onglet Session 1 et visionne l'enregistrement directement dans la page via un lecteur vidéo intégré (iframe YouTube) qui démarre automatiquement en mode muet.

**Why this priority**: La session 1 étant terminée, l'accès à son enregistrement est la seule valeur ajoutée de cet onglet.

**Independent Test**: Peut être testé en naviguant vers l'onglet Session 1 et en vérifiant que l'iframe YouTube s'affiche et démarre en lecture automatique.

**Acceptance Scenarios**:

1. **Given** le visiteur est sur l'onglet Session 1, **When** le contenu se charge, **Then** un lecteur vidéo YouTube embarqué (iframe) est visible à la place de l'image de couverture
2. **Given** le lecteur vidéo est chargé, **When** la page est active, **Then** la vidéo démarre automatiquement en mode muet
3. **Given** le visiteur est sur l'onglet Session 1, **When** il fait défiler la page, **Then** il voit aussi les informations détaillées de la session 1 (thème, date, intervenants)

---

### User Story 3 — Visiteur s'inscrit à la Session 2 avec sélection de session (Priority: P2)

Un visiteur souhaitant participer à la session 2 remplit le formulaire d'inscription rapide. Le formulaire inclut un champ indiquant la session à laquelle il s'inscrit, pré-rempli avec « Session 2 » mais éditable pour permettre les inscriptions futures.

**Why this priority**: L'inscription est l'action principale de la session 2. Le champ de session permet de distinguer les inscrits par session dans la base de données.

**Independent Test**: Peut être testé en remplissant le formulaire sur l'onglet Session 2 et en vérifiant que les données enregistrées incluent l'identifiant de la session.

**Acceptance Scenarios**:

1. **Given** le visiteur est sur l'onglet Session 2, **When** il consulte le formulaire, **Then** un champ affiche la session en cours (Session 2 — 30 avril 2026) pré-sélectionnée
2. **Given** le visiteur soumet le formulaire, **When** l'inscription est confirmée, **Then** la session choisie est enregistrée avec les données d'inscription
3. **Given** un visiteur déjà inscrit à la session 1 revient sur la page, **When** il accède à l'onglet Session 2, **Then** le formulaire est affiché (l'inscription session 1 ne dispense pas de s'inscrire à la session 2)

---

### User Story 4 — Administrateur filtre les inscrits par session (Priority: P3)

Dans l'interface d'administration, les statistiques et la liste des inscrits affichent la session d'inscription pour chaque participant, avec possibilité de filtrer par session.

**Why this priority**: Sans ce filtrage, il devient impossible de distinguer les inscrits à chaque session au fur et à mesure que les sessions s'accumulent.

**Independent Test**: Peut être testé en accédant à PacoAdmin et en vérifiant que la colonne « Session » apparaît dans le tableau et que les filtres fonctionnent.

**Acceptance Scenarios**:

1. **Given** l'admin est sur la page d'administration PACO, **When** il consulte la liste des inscrits, **Then** une colonne « Session » est visible dans le tableau
2. **Given** la liste des inscrits est affichée, **When** l'admin filtre par session, **Then** seuls les inscrits de cette session sont affichés
3. **Given** l'admin exporte en CSV, **When** l'export est téléchargé, **Then** la colonne session est incluse dans le fichier CSV

---

### Edge Cases

- Que se passe-t-il si un visiteur arrive sur la page après la fin de la session 2 ? L'onglet Session 2 doit afficher un statut « Terminée » et proposer le replay si disponible.
- Que se passe-t-il si la vidéo YouTube n'est pas disponible (supprimée ou privée) ? Un message d'erreur convivial s'affiche à la place de l'iframe.
- Un visiteur inscrit à la session 1 (via localStorage) accède à l'onglet Session 2 : il doit voir le formulaire d'inscription pour la session 2, pas le bouton « Rejoindre ».
- L'autoplay vidéo peut être bloqué par les politiques de certains navigateurs. La vidéo doit être configurée en mode muet pour maximiser la compatibilité.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La page PACO doit afficher une navigation par onglets avec une entrée par session (minimum 2 : Session 1 et Session 2) ; l'onglet actif n'est pas reflété dans l'URL (état interne uniquement)
- **FR-002**: L'onglet de la session la plus récente non encore terminée doit être sélectionné par défaut au chargement
- **FR-003**: Chaque session doit être encapsulée dans un composant Vue distinct pour maintenir des fichiers de taille raisonnable
- **FR-004**: L'onglet Session 1 doit afficher un lecteur vidéo YouTube intégré (iframe autoplay muet) à la place de l'image de couverture
- **FR-005**: L'onglet Session 2 doit afficher les informations de la session 2 (Justice climatique et inclusion sociale — 30 avril 2026, 14h00-15h30 GMT) avec son image de couverture
- **FR-006**: Le formulaire d'inscription doit afficher un champ session en lecture seule, pré-rempli automatiquement avec la session de l'onglet actif (non modifiable par le visiteur)
- **FR-007**: Les données d'inscription doivent être enregistrées avec l'identifiant de la session choisie dans la colonne `session_edition` de `activity_registrations`
- **FR-007b**: Une migration SQL doit attribuer `session_edition = 1` à tous les inscrits existants lors du déploiement
- **FR-008**: La vérification localStorage doit être propre à chaque session (inscription session 1 ≠ inscription session 2)
- **FR-009**: L'interface d'administration doit afficher la session d'inscription pour chaque inscrit dans le tableau
- **FR-010**: L'administration doit permettre le filtrage de la liste des inscrits par session
- **FR-011**: L'export CSV depuis l'administration doit inclure la colonne session

### Key Entities

- **Session PACO**: Une session de webinaire avec ses attributs — numéro d'édition, titre court, titre complet, date, heure, description, thème, intervenants, statut (à venir / terminée), image de couverture, URL de replay vidéo
- **Inscription PACO**: Données d'un participant inscrit dans la table `activity_registrations`, enrichies d'une colonne `session_edition` (entier, ex: 1 ou 2) indiquant à quelle session il s'est inscrit

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visiteur peut naviguer entre les deux onglets de session en moins de 1 seconde sans rechargement de page
- **SC-002**: La vidéo de la session 1 se lance automatiquement sur les navigateurs modernes (Chrome, Firefox, Safari, Edge) grâce au mode muet
- **SC-003**: Un nouveau visiteur peut s'inscrire à la session 2 sans confusion — le champ de session est visible et pré-rempli
- **SC-004**: Les inscrits à la session 1 et à la session 2 sont distinguables dans la base de données, permettant à l'admin de filtrer et exporter par session
- **SC-005**: Aucun des fichiers composants n'excède 400 lignes après la refactorisation en composants par session
- **SC-006**: L'inscription à la session 2 n'est pas bloquée pour un utilisateur déjà inscrit à la session 1

---

## Clarifications

### Session 2026-04-09

- Q: Où stocker l'attribut `session_edition` — `activity_registrations`, `paco_demographic_data`, ou nouvelle table ? → A: Nouvelle colonne `session_edition` (integer) sur `activity_registrations`
- Q: Que faire des inscrits existants sans `session_edition` après la migration ? → A: Migration rétroactive — `session_edition = 1` pour tous les inscrits existants
- Q: Le champ session dans le formulaire est-il modifiable ou en lecture seule ? → A: Lecture seule, pré-rempli automatiquement selon l'onglet actif
- Q: L'onglet actif doit-il être reflété dans l'URL pour permettre le partage direct ? → A: Non — navigation interne uniquement, sans modification de l'URL

---

## Assumptions

- Le champ session dans le formulaire est en lecture seule, pré-rempli automatiquement selon l'onglet actif (non modifiable par le visiteur)
- La gestion des inscriptions multi-sessions se fera via une nouvelle colonne `session_edition` (integer) ajoutée à la table existante `activity_registrations`
- Les traductions i18n seront ajoutées pour tous les nouveaux textes (français et anglais)
- L'autoplay YouTube nécessite les paramètres `autoplay=1&mute=1` dans l'URL de l'iframe
- Le composant PacoPresentation existant sera adapté pour recevoir les données de session en props
- La timeline horizontale des sessions dans le panneau d'action sera mise à jour pour inclure la session 2 en statut « En cours » / « À venir »
