# Feature Specification: Canal d'acquisition (referral source) pour inscription PACO

**Feature Branch**: `006-paco-referral-source`
**Created**: 2026-04-10
**Status**: Draft
**Input**: User description: "dans le formulaire de soumission de PacoWebinar.vue, on veut un champ (dropdown) qui permet de recueillir le canal par lequel le webinaire a été connu (Site web de l'IFDD, LinkedIn de l'IFDD, Facebook de l'IFDD, X de l'IFDD, email Newsletter, autre). La statistique doit apparaître dans PacoAdmin.vue"

## Clarifications

### Session 2026-04-10

- Q: Forme visuelle de la répartition par canal dans PacoAdmin ? → A: Camembert / donut chart (répartition proportionnelle visuelle).
- Q: Traitement des canaux à 0 et de "Non renseigné" ? → A: Toujours afficher les 6 canaux officiels (même à 0) ; "Non renseigné" affiché uniquement si > 0.
- Q: L'option "Autre" déclenche-t-elle un champ texte libre ? → A: Oui, un champ texte libre optionnel affiché uniquement si "Autre" est sélectionné.
- Q: Emplacement du champ dans le formulaire d'inscription ? → A: Tout en bas du formulaire, juste avant le bouton de soumission.
- Q: Ordre de tri des canaux dans le camembert et la légende ? → A: Ordre fixe de la liste officielle (Site web, LinkedIn, Facebook, X, Email / Newsletter, Autre), puis "Non renseigné" en dernier s'il est présent.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sélection du canal d'acquisition lors de l'inscription (Priority: P1)

Un visiteur arrive sur la page d'inscription au webinaire PACO. Dans le formulaire de soumission, un nouveau champ de type liste déroulante (dropdown) lui demande par quel canal il a découvert le webinaire. L'utilisateur choisit une option parmi une liste prédéfinie (Site web de l'IFDD, LinkedIn de l'IFDD, Facebook de l'IFDD, X de l'IFDD, Email / Newsletter, Autre) avant de pouvoir soumettre son inscription.

**Why this priority**: Sans la collecte de cette information au moment de l'inscription, il n'existe aucune donnée exploitable à afficher côté administration. C'est le point d'entrée indispensable de toute la fonctionnalité.

**Independent Test**: Peut être testé de bout en bout en remplissant le formulaire d'inscription à la session PACO en cours, en choisissant chaque option du dropdown, et en vérifiant que l'inscription aboutit correctement et que la valeur sélectionnée est persistée avec l'enregistrement d'inscription.

**Acceptance Scenarios**:

1. **Given** un visiteur consulte le formulaire d'inscription à la session PACO active, **When** il affiche le formulaire, **Then** un champ "Comment avez-vous connu ce webinaire ?" (dropdown) est visible avec exactement 6 options : Site web de l'IFDD, LinkedIn de l'IFDD, Facebook de l'IFDD, X de l'IFDD, Email / Newsletter, Autre.
2. **Given** un visiteur remplit correctement tous les champs obligatoires sauf le canal d'acquisition, **When** il tente de soumettre, **Then** le formulaire affiche un message d'erreur indiquant que ce champ est requis et la soumission est bloquée.
3. **Given** un visiteur a rempli tous les champs y compris le canal d'acquisition, **When** il soumet le formulaire, **Then** l'inscription est enregistrée avec la valeur du canal et un message de confirmation est affiché.
4. **Given** l'application est consultée en anglais, **When** le visiteur ouvre le dropdown, **Then** le label du champ et les options sont affichés en anglais (ex. "How did you hear about this webinar?", "IFDD website", "IFDD LinkedIn", "IFDD Facebook", "IFDD X", "Email / Newsletter", "Other").
5. **Given** un visiteur est déjà inscrit à la session (état "join"), **When** il revient sur la page, **Then** il n'est pas invité à ressaisir le canal (le champ ne s'affiche plus puisque le formulaire n'est plus présenté).

---

### User Story 2 - Visualisation des statistiques par canal côté administration (Priority: P1)

Un administrateur du tableau de bord PACO souhaite savoir par quels canaux les inscrits ont découvert le webinaire, afin d'orienter les futures campagnes de communication de l'IFDD. Dans PacoAdmin, il voit un graphique circulaire (camembert / donut) qui présente la répartition proportionnelle des inscriptions par canal, pour la session actuellement filtrée.

**Why this priority**: C'est l'objectif final de la collecte. Sans cette visualisation, les données recueillies n'apportent aucune valeur opérationnelle à l'équipe marketing / communication.

**Independent Test**: Peut être testé indépendamment en insérant des inscriptions de test couvrant chaque canal, puis en vérifiant dans PacoAdmin que le nombre et la répartition (absolue et en pourcentage) par canal correspondent aux données réelles pour le filtre de session sélectionné.

**Acceptance Scenarios**:

1. **Given** des inscriptions existent avec différents canaux d'acquisition, **When** l'administrateur ouvre PacoAdmin, **Then** une section "Canal d'acquisition" affiche la répartition du nombre d'inscrits par canal avec pourcentage relatif au total filtré.
2. **Given** le filtre de session est modifié (Session 3, Session 4, Toutes), **When** le filtre change, **Then** la répartition par canal se met à jour pour refléter uniquement les inscrits de la session sélectionnée.
3. **Given** un canal officiel ne compte aucun inscrit pour le filtre courant, **When** la section est affichée, **Then** le canal apparaît tout de même avec la valeur 0 dans la légende (et une part vide dans le camembert) pour garder une structure stable entre filtres.
4. **Given** aucun inscrit "Non renseigné" n'existe pour le filtre courant, **When** la section est affichée, **Then** la catégorie "Non renseigné" n'est PAS affichée (ni dans le camembert ni dans la légende).
5. **Given** l'administrateur exporte les inscrits en CSV, **When** le fichier est généré, **Then** une colonne "Canal d'acquisition" est présente pour chaque inscrit.

---

### User Story 3 - Gestion historique des inscrits sans canal renseigné (Priority: P2)

Des inscriptions ont été enregistrées avant le déploiement de cette fonctionnalité (sessions 1, 2, 3 passées ou inscrits existants de la session 4). Elles ne disposent pas de valeur pour le canal d'acquisition. L'administrateur doit pouvoir distinguer ces inscrits historiques dans les statistiques afin de ne pas fausser l'analyse.

**Why this priority**: Important pour l'intégrité de l'analyse, mais ne bloque pas la collecte ni l'affichage de la nouvelle donnée pour les inscriptions futures.

**Independent Test**: Peut être testé en vérifiant qu'un inscrit historique (sans canal) apparaît dans une catégorie "Non renseigné" distincte des 6 options officielles, et que ses statistiques ne sont pas comptabilisées dans les autres canaux.

**Acceptance Scenarios**:

1. **Given** des inscriptions antérieures au déploiement n'ont pas de canal, **When** PacoAdmin affiche la répartition, **Then** une catégorie "Non renseigné" regroupe ces inscrits sans les mélanger avec "Autre", et cette catégorie apparaît uniquement si son compteur est strictement supérieur à 0.
2. **Given** un export CSV inclut un inscrit historique sans canal, **When** l'administrateur ouvre le fichier, **Then** la colonne "Canal d'acquisition" est vide ou contient la mention "Non renseigné" de manière cohérente.

---

### Edge Cases

- Un inscrit choisit "Autre" : un champ texte libre optionnel (limité à 120 caractères) s'affiche immédiatement sous le dropdown. L'inscrit peut le laisser vide, auquel cas seule la valeur "Autre" est enregistrée. Si rempli, la précision est persistée dans un champ dédié "Autre (précision)".
- Un inscrit est ajouté via le mécanisme de secours (fallback) du formulaire (feature 005) : le canal doit également être capturé et transmis, même lorsque la création d'inscription échoue et est rejouée ultérieurement.
- Un inscrit recouvré ("recovered") à partir d'un fallback conserve le canal initialement choisi.
- Un administrateur change rapidement de filtre de session : la répartition par canal doit rester cohérente avec le filtre actif et ne pas afficher des données d'un filtre précédent.
- L'inscrit clique sur "Envoyer" sans choisir de canal : la soumission est bloquée avec un message d'erreur clair et spécifique à ce champ.
- Un inscrit modifie son choix avant de soumettre : seule la dernière valeur est enregistrée.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le formulaire d'inscription au webinaire PACO DOIT afficher un champ obligatoire de type liste déroulante permettant de répondre à la question "Comment avez-vous connu ce webinaire ?". Ce champ DOIT être positionné tout en bas du formulaire, immédiatement au-dessus du bouton de soumission.
- **FR-002**: La liste déroulante DOIT proposer exactement six options dans cet ordre : Site web de l'IFDD, LinkedIn de l'IFDD, Facebook de l'IFDD, X de l'IFDD, Email / Newsletter, Autre.
- **FR-002a**: Lorsque l'option "Autre" est sélectionnée, un champ texte libre optionnel (maximum 120 caractères, traduit FR/EN) DOIT apparaître immédiatement sous le dropdown pour permettre à l'inscrit de préciser sa réponse. Ce champ NE DOIT PAS être obligatoire : l'inscription peut être soumise avec "Autre" seul.
- **FR-002b**: Lorsqu'une autre option que "Autre" est sélectionnée, le champ texte libre DOIT être masqué et sa valeur ignorée / effacée lors de la soumission.
- **FR-003**: Le label du champ et les options DOIVENT être traduits dans les deux langues supportées (français et anglais) conformément au système i18n existant.
- **FR-004**: La soumission du formulaire DOIT être bloquée tant que l'utilisateur n'a pas sélectionné une option, avec un message d'erreur explicite affiché à l'utilisateur.
- **FR-005**: Le canal d'acquisition sélectionné DOIT être persisté avec l'enregistrement de l'inscription, associé à la bonne session (edition) et au bon utilisateur / visiteur.
- **FR-006**: Le mécanisme d'inscription de secours (fallback registration) DOIT également capturer et persister le canal d'acquisition, de manière à ce qu'aucun inscrit créé par fallback ne soit comptabilisé comme "Non renseigné".
- **FR-007**: L'interface d'administration PACO (PacoAdmin) DOIT afficher une section dédiée présentant la répartition des inscrits par canal d'acquisition sous forme de graphique circulaire (camembert / donut), en valeur absolue et en pourcentage du total, avec une légende listant chaque canal et sa valeur. Les canaux DOIVENT être affichés dans l'ordre fixe de la liste officielle (Site web de l'IFDD, LinkedIn de l'IFDD, Facebook de l'IFDD, X de l'IFDD, Email / Newsletter, Autre), et la catégorie "Non renseigné" (lorsqu'elle est présente) DOIT toujours être positionnée en dernier, avec une couleur neutre distincte des 6 canaux officiels pour éviter toute confusion visuelle.
- **FR-008**: La répartition par canal DOIT respecter le filtre de session actif (Toutes, Session 3, Session 4) et se mettre à jour lorsque ce filtre change.
- **FR-009**: La répartition par canal DOIT toujours afficher les 6 canaux officiels (même avec une valeur 0) pour garantir une structure stable. Une catégorie supplémentaire "Non renseigné" DOIT être ajoutée à la fois dans le camembert et la légende UNIQUEMENT si son compteur est strictement supérieur à 0, et DOIT être incluse dans le calcul du total utilisé pour les pourcentages.
- **FR-010**: L'export CSV des inscrits DOIT inclure une colonne "Canal d'acquisition" avec la valeur sélectionnée (ou vide / "Non renseigné" si absente) ET une colonne additionnelle "Canal — précision" contenant la saisie libre associée à l'option "Autre" (vide si non renseignée ou si une autre option a été choisie).
- **FR-011**: La liste des canaux DOIT être maintenue de manière centralisée (source unique) afin que toute évolution (ajout / renommage) soit répercutée automatiquement dans le formulaire, les statistiques et l'export.
- **FR-012**: Le système NE DOIT PAS exposer publiquement les statistiques agrégées par canal ; l'accès reste limité au tableau de bord administrateur existant.

### Key Entities *(include if feature involves data)*

- **Inscription PACO (activity_registration)** : entité existante représentant l'inscription d'un participant à une session PACO. Doit être enrichie de deux nouveaux attributs : "canal d'acquisition" (valeur énumérée parmi la liste définie, ou valeur vide pour historique) et "canal — précision" (chaîne de caractères libre, maximum 120 caractères, non vide uniquement si le canal = "Autre").
- **Canal d'acquisition (referral source)** : valeur énumérée décrivant comment le participant a découvert le webinaire. Attributs : identifiant stable (clé technique non traduite), libellé affiché en français, libellé affiché en anglais, ordre d'affichage.
- **Statistiques PACO** : entité agrégée existante alimentant PacoAdmin. Doit exposer une nouvelle dimension d'agrégation par canal pour la session filtrée.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des nouvelles inscriptions enregistrées après le déploiement disposent d'une valeur de canal d'acquisition non vide parmi les options officielles.
- **SC-002**: Un administrateur peut identifier en moins de 10 secondes, depuis l'ouverture de PacoAdmin, le canal d'acquisition le plus performant pour la session sélectionnée.
- **SC-003**: Le temps additionnel moyen pour compléter le formulaire d'inscription (avec le nouveau champ) reste inférieur à 10 secondes supplémentaires par rapport à la version actuelle.
- **SC-004**: L'export CSV contient la colonne "Canal d'acquisition" correctement renseignée pour 100 % des inscriptions postérieures au déploiement.
- **SC-005**: Aucune régression sur le taux de complétion du formulaire : le pourcentage d'inscriptions finalisées après avoir commencé le formulaire reste au moins égal à celui observé avant l'ajout du champ (tolérance ±2 points).

## Assumptions

- Les 6 options officielles fournies dans la description sont exhaustives pour la V1. L'option "Autre" déclenche un champ texte libre optionnel (voir FR-002a) pour capturer la précision quand l'inscrit souhaite la fournir.
- Le choix d'un canal est obligatoire (pas de valeur "Préfère ne pas répondre").
- La précision associée à "Autre" est facultative (maximum 120 caractères).
- Les inscriptions historiques existantes (avant déploiement) ne seront pas rétro-enrichies ; elles alimentent la catégorie "Non renseigné" qui n'apparaît dans la visualisation que lorsqu'elle est > 0.
- La nouvelle statistique s'intègre à l'interface PacoAdmin existante, en cohérence avec les autres blocs de statistiques déjà présents (filtres, cartes, graphiques) sans refonte de la page.
- La fonctionnalité s'applique à toutes les sessions PACO gérées par le formulaire d'inscription unifié (sessions multi-éditions introduites dans feature 001-paco-multi-sessions).
- Aucun besoin spécifique de reporting externe (pas d'envoi vers un outil d'analytique tiers) au-delà de l'affichage dans PacoAdmin et de l'export CSV existant.
