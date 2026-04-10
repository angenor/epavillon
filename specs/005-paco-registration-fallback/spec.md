# Feature Specification: Inscription PACO non bloquante avec recuperation des echecs

**Feature Branch**: `005-paco-registration-fallback`
**Created**: 2026-04-10
**Status**: Draft
**Input**: User description: "il arrive que pour des raisons que nous ignorons completement inconnu, que des inscriptions au webinaire paco echouent. Cela arrive, Il faut quand meme considere que l'utilisateur est inscrit et lui donner acces au bouton pour rejoindre, il faut ensuite enregistrer ces inscription echoue avec le message d'erreur et le contenu du formulaire d'inscription dans du json. dans la table paco registration et compter dans la table de l'event. De toute facon, l'acces ne doit pas etre bloquant pour l'utilisateur"

## Contexte

Les pages `PacoWebinar.vue` (page publique d'inscription / replay) et `PacoAdmin.vue` (vue d'administration des inscriptions) sont des pages **exceptionnelles creees temporairement** pour accompagner un cycle d'evenements periodiques qui ne rentrent pas dans le cadre standard de la plateforme ePavilion. Plusieurs informations y sont codees en statique (dates, sessions, identifiants d'activite, liens Teams/Zoom, etc.). Elles doivent donc recevoir un traitement special : on ne peut pas s'appuyer integralement sur les flux standards d'inscription de la plateforme pour garantir la qualite de service attendue par les participants PACO.

Sur la page du webinaire PACO, le formulaire d'inscription rapide peut echouer pour des raisons inconnues et difficiles a reproduire (probleme reseau intermittent, contrainte SQL inattendue, erreur transitoire cote serveur, blocage WAF, etc.). Aujourd'hui, lorsqu'une telle erreur survient, l'utilisateur reste bloque : aucun bouton « Rejoindre le webinaire » ne lui est propose, alors meme qu'il a rempli le formulaire correctement et qu'il s'attend a pouvoir participer.

L'experience cible inverse cette logique : **l'inscription au webinaire PACO ne doit jamais bloquer l'utilisateur**. En cas d'echec technique, le systeme doit (1) considerer l'utilisateur comme inscrit pour la session courante, (2) lui donner immediatement l'acces au bouton de jonction du webinaire, et (3) conserver une trace exploitable de l'echec (message d'erreur + payload du formulaire au format JSON) afin que l'equipe puisse rattraper manuellement les inscriptions et comprendre les causes racines a posteriori. Ces inscriptions « de secours » doivent rester comptabilisees dans le total des inscrits affiche cote evenement / activite.

---

## Clarifications

### Session 2026-04-10

- Q: Quelles classes d'erreurs doivent declencher le mode « inscription de secours » ? → A: Toute exception attrapee par le try/catch autour de l'appel RPC, en aval de la validation front-end.
- Q: Comment identifier un utilisateur qui revient sans donnees locales (cache vide) et resoumet son email ? → A: Email seul, sans verification supplementaire (le systeme retrouve l'inscription existante via l'email et donne directement l'acces au bouton de jonction).
- Q: Comment l'admin marque-t-il une inscription de secours comme « rattrapee » au niveau du data model ? → A: Une seule colonne `recovered_at TIMESTAMPTZ NULL` ajoutee a `activity_registrations` (NULL = non rattrapee, sinon date du rattrapage).
- Q: Comment distinguer en base une inscription de secours d'une inscription standard ? → A: Deux nouvelles colonnes `fallback_payload JSONB NULL` et `fallback_error TEXT NULL` ajoutees a `activity_registrations` ; une ligne est « secours » si `fallback_payload IS NOT NULL` (pas d'enum, pas de booleen explicite).
- Q: Comment garantir qu'un participant n'est jamais double-compte si une inscription standard reussit apres qu'une entree de secours a deja ete creee ? → A: Contrainte UNIQUE `(email, activity_id, session_edition)` + UPSERT atomique dans la RPC qui « promeut » la ligne de secours en inscription standard (mise a NULL de `fallback_payload` et `fallback_error`, conservation de `recovered_at` et de l'historique).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Participant qui valide son formulaire malgre une erreur technique (Priority: P1)

Un visiteur arrive sur la page du webinaire PACO, remplit le formulaire d'inscription rapide (nom, prenom, email, donnees demographiques, etc.) et le soumet. Une erreur inconnue empeche l'enregistrement standard de l'inscription. Plutot que d'afficher une erreur bloquante, le systeme confirme a l'utilisateur que son inscription est prise en compte, lui presente immediatement le bouton « Rejoindre le webinaire » et lui donne acces a toutes les informations necessaires (lien Teams/Zoom, date, horaires) comme s'il s'etait inscrit normalement.

**Why this priority** : C'est le coeur meme du besoin exprime. Sans ce comportement non bloquant, des participants legitimes restent injustement prives d'acces au webinaire et l'IFDD perd des inscrits sans pouvoir intervenir.

**Independent Test** : Peut etre teste en simulant une erreur lors de l'appel d'inscription (par exemple en interceptant la requete ou en forcant l'erreur cote backend) et en verifiant que l'utilisateur voit l'ecran de succes avec le bouton de jonction au lieu d'un message d'erreur.

**Acceptance Scenarios** :

1. **Given** un visiteur a rempli un formulaire d'inscription PACO valide, **When** l'enregistrement de l'inscription echoue pour une raison technique inconnue, **Then** le systeme affiche l'ecran de confirmation d'inscription et le bouton « Rejoindre le webinaire » sans aucun message d'erreur bloquant.
2. **Given** une inscription a echoue techniquement mais a ete reconnue comme « inscription de secours », **When** l'utilisateur clique sur le bouton « Rejoindre le webinaire », **Then** il est redirige vers le lien de la reunion exactement comme un inscrit standard.
3. **Given** un utilisateur a obtenu l'acces via le mecanisme de secours, **When** il actualise la page et resoumet le meme email, **Then** il retrouve immediatement l'acces au bouton de jonction sans devoir refaire le formulaire ni voir d'erreur.
4. **Given** une inscription de secours vient d'etre declenchee, **When** le systeme confirme l'acces, **Then** il peut informer l'utilisateur (de facon non alarmante) qu'un email de confirmation lui sera transmis ulterieurement, sans jamais reveler l'echec technique.

---

### User Story 2 - Conservation des inscriptions echouees pour rattrapage (Priority: P1)

L'equipe IFDD doit pouvoir retrouver toutes les inscriptions PACO qui ont echoue techniquement afin de (a) rattraper l'envoi du lien Teams/Zoom et de toute communication, (b) corriger les donnees dans la base, et (c) analyser les causes des echecs. Chaque echec d'inscription au webinaire PACO doit donc etre conserve avec le contenu integral du formulaire soumis et le message d'erreur technique recu, sous une forme exploitable.

**Why this priority** : Sans cette trace, le caractere non bloquant pour l'utilisateur deviendrait un trou noir operationnel : aucune equipe ne pourrait retrouver les inscrits, leur envoyer le lien officiel, ni comprendre pourquoi le systeme echoue.

**Independent Test** : Peut etre teste en provoquant un echec d'inscription, puis en verifiant qu'une entree correspondante existe cote inscriptions PACO, contenant l'email, le contenu du formulaire (JSON) et le message d'erreur, et qu'elle est clairement identifiable comme « inscription de secours ».

**Acceptance Scenarios** :

1. **Given** une inscription PACO echoue techniquement, **When** le systeme active le mode de secours, **Then** une entree d'inscription est conservee avec un statut indiquant qu'il s'agit d'une inscription de secours.
2. **Given** une entree d'inscription de secours, **When** un administrateur la consulte, **Then** il peut acceder au contenu integral du formulaire (tous les champs saisis) et au message d'erreur technique d'origine, dans un format structure (JSON).
3. **Given** plusieurs inscriptions de secours existent pour la meme session, **When** un administrateur exporte la liste des inscrits, **Then** chaque inscription de secours apparait dans l'export, identifiee comme telle.
4. **Given** une inscription standard a echoue puis a ete enregistree en secours, **When** l'equipe rattrape manuellement l'inscription (envoi du lien, correction des donnees), **Then** elle peut marquer l'entree comme « rattrapee » sans perdre la trace de l'echec d'origine.

---

### User Story 3 - Comptage coherent des inscrits incluant les inscriptions de secours (Priority: P2)

Les pages publiques et administratives du webinaire PACO affichent un compteur du nombre de personnes inscrites. Ce compteur doit refleter le nombre total reel de participants qui se sont enregistres, qu'ils l'aient fait via le flux standard ou via le flux de secours. Aucune inscription de secours ne doit etre ignoree dans le decompte total des inscrits du webinaire (cote evenement / activite PACO).

**Why this priority** : Sans cette integration, les statistiques publiques sous-estimeraient le nombre reel de participants, et l'equipe pourrait sous-dimensionner les ressources (capacite Zoom/Teams, support, etc.).

**Independent Test** : Peut etre teste en (a) notant le compteur initial d'inscrits, (b) provoquant une inscription de secours, et (c) en verifiant que le compteur a bien augmente de 1 sur la page publique et dans la vue administrateur.

**Acceptance Scenarios** :

1. **Given** un compteur d'inscrits affiche N personnes pour une session PACO, **When** une nouvelle inscription est creee via le mode de secours, **Then** le compteur passe a N+1.
2. **Given** des inscriptions standards et de secours coexistent pour une session, **When** un visiteur consulte le nombre total d'inscrits, **Then** le total inclut les deux types sans distinction visible cote public.
3. **Given** un administrateur consulte les statistiques de la session, **When** il filtre par type d'inscription, **Then** il peut voir separement le nombre d'inscriptions standards et le nombre d'inscriptions de secours.

---

### Edge Cases

- **Email manquant ou invalide** : si le formulaire est soumis sans email valide, le mecanisme de secours ne peut pas enregistrer une inscription identifiable. Dans ce cas (et uniquement dans ce cas), le formulaire doit demander a l'utilisateur de corriger l'email avant toute soumission. La regle « non bloquant » s'applique aux echecs techniques, pas aux champs obligatoires manifestement absents.
- **Inscription de secours en doublon** : si un meme email subit plusieurs echecs successifs pour la meme session, le systeme doit conserver une seule entree de secours active par email/session et y agreger les tentatives (ou ignorer les soumissions identiques) pour ne pas gonfler artificiellement le compteur.
- **Recuperation reussie apres un echec** : si l'inscription standard finit par reussir (par exemple lors d'un nouvel essai automatique ou d'un rafraichissement) apres qu'une entree de secours a deja ete creee, le systeme doit eviter de comptabiliser deux fois l'utilisateur — l'entree de secours doit etre consolidee ou marquee comme remplacee par l'inscription standard.
- **Erreur lors de l'enregistrement de secours lui-meme** : si l'ecriture de l'inscription de secours echoue a son tour (panne complete de la base), le systeme doit malgre tout presenter a l'utilisateur le bouton « Rejoindre le webinaire » (l'acces ne doit jamais etre bloque) et journaliser l'erreur d'arriere-plan pour traitement ulterieur.
- **Affichage cote utilisateur** : la confirmation d'inscription presentee a l'utilisateur ne doit pas reveler qu'une erreur technique s'est produite ; l'experience doit etre strictement equivalente a une inscription reussie afin de ne pas inquieter le participant.
- **Reinscription apres vidage du navigateur** : si l'utilisateur revient sur la page sans donnees locales et resoumet son email, le systeme doit reconnaitre son inscription de secours existante et lui redonner l'acces direct au bouton de jonction.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001** : Lorsqu'une inscription au webinaire PACO echoue techniquement apres soumission valide du formulaire (champs obligatoires remplis), le systeme DOIT considerer l'utilisateur comme inscrit pour la session courante et lui presenter immediatement l'ecran de confirmation avec le bouton « Rejoindre le webinaire ». Le declencheur du mode secours est *toute exception attrapee par le bloc `try/catch` entourant l'appel RPC `register_paco_quick`*, en aval de la validation front-end : aucune classification fine de l'erreur n'est requise (timeouts, 5xx, exceptions Postgres, contraintes SQL, erreurs reseau, blocages WAF, exceptions RPC metier — tout est traite uniformement comme « echec technique »).
- **FR-002** : Le systeme DOIT enregistrer chaque inscription de secours dans la table `activity_registrations` (meme table que les inscriptions standards) en remplissant deux nouvelles colonnes dediees : `fallback_payload JSONB` (contenu integral du formulaire) et `fallback_error TEXT` (message d'erreur technique). Une ligne est consideree comme « inscription de secours » si et seulement si `fallback_payload IS NOT NULL`. Aucun enum, statut ou booleen supplementaire n'est introduit.
- **FR-003** : La colonne `fallback_payload JSONB` DOIT contenir l'integralite du contenu du formulaire soumis par l'utilisateur (au minimum : prenom, nom, email, donnees demographiques, statut professionnel, organisation, pays, ville, consentement a l'enregistrement, identifiant de la session ciblee).
- **FR-004** : La colonne `fallback_error TEXT` DOIT contenir le message d'erreur technique d'origine. La date/heure de l'echec est portee par la colonne existante `created_at` de la ligne d'inscription, a des fins de diagnostic et d'audit.
- **FR-005** : Le compteur officiel du nombre d'inscrits a la session PACO (visible publiquement et cote administration) DOIT inclure les inscriptions de secours en plus des inscriptions standards.
- **FR-006** : L'experience utilisateur lors d'une inscription de secours DOIT etre visuellement et fonctionnellement indistinguable d'une inscription standard reussie : aucun message d'erreur, aucune indication anxiogene, et bouton de jonction immediatement accessible.
- **FR-007** : Le systeme DOIT empecher la creation de plusieurs inscriptions de secours pour la meme combinaison email + session, en consolidant les tentatives repetees sur une unique entree et en mettant a jour son contenu (dernier message d'erreur, dernier payload du formulaire). L'unicite est garantie au niveau base par une contrainte `UNIQUE (email, activity_id, session_edition)` sur `activity_registrations` (a ajouter par migration si elle n'existe pas) ; le RPC d'inscription utilise un UPSERT atomique pour remplacer les valeurs `fallback_payload` et `fallback_error` lors d'une retentative.
- **FR-008** : Lorsqu'un utilisateur ayant deja une inscription de secours pour une session resoumet le meme email, le systeme DOIT lui redonner l'acces au bouton de jonction sans afficher d'erreur ni recreer d'entree. L'identification se fait *exclusivement par l'email saisi* dans le formulaire (lookup `email + session_edition` dans `activity_registrations`) ; aucune verification supplementaire (OTP, validation croisee nom/prenom, re-authentification) n'est exigee, conformement au caractere non bloquant de la feature et au fait que les liens Teams/Zoom des sessions PACO sont deja statiques dans le code des pages temporaires.
- **FR-009** : Si une inscription standard finit par reussir pour un email/session deja associe a une inscription de secours, le systeme DOIT consolider les deux etats de facon a ne compter le participant qu'une seule fois dans le total des inscrits. La consolidation se fait via le meme UPSERT atomique (cf. FR-007) : la ligne existante est *promue* en inscription standard en mettant a NULL `fallback_payload` et `fallback_error` (et en conservant `recovered_at` ainsi que l'historique de creation). Le compteur reste un simple `COUNT(*)` car il n'y a jamais qu'une seule ligne par `(email, activity_id, session_edition)`.
- **FR-010** : Les administrateurs DOIVENT pouvoir distinguer dans l'interface d'administration (et dans l'export CSV) les inscriptions de secours des inscriptions standards pour une session donnee. Le critere technique est `fallback_payload IS NOT NULL`.
- **FR-011** : Les administrateurs DOIVENT pouvoir consulter, pour chaque inscription de secours, le contenu de `fallback_payload` (JSON du formulaire) et de `fallback_error` (message d'erreur d'origine), afin de proceder au rattrapage manuel.
- **FR-012** : Les administrateurs DOIVENT pouvoir marquer une inscription de secours comme « rattrapee » (par exemple apres envoi manuel du lien Teams/Zoom) sans supprimer la trace de l'echec d'origine. Le marquage se fait via une *unique colonne* `recovered_at TIMESTAMPTZ NULL` ajoutee a la table `activity_registrations` : NULL signifie « non rattrapee », une valeur signifie « rattrapee a cette date/heure ». Le payload JSON et le message d'erreur d'origine ne sont jamais supprimes ni modifies par cette operation.
- **FR-013** : Si l'enregistrement de secours echoue lui aussi (panne complete), le systeme DOIT toujours presenter a l'utilisateur le bouton « Rejoindre le webinaire » et journaliser l'erreur cote serveur pour traitement ulterieur, sans bloquer l'utilisateur.
- **FR-014** : Le systeme DOIT respecter les obligations existantes de validation des champs obligatoires cote formulaire (email valide, nom, prenom, etc.) ; le mode non bloquant s'applique uniquement aux echecs techniques en aval de cette validation.
- **FR-015** : Les donnees demographiques optionnellement liees a une inscription de secours DOIVENT etre conservees dans le payload JSON meme si la table dediee aux donnees demographiques n'a pas pu etre renseignee, afin de permettre leur reinjection ulterieure par l'equipe.

### Key Entities *(include if feature involves data)*

- **Inscription PACO de secours** : represente une inscription au webinaire PACO creee a la suite d'un echec technique. Attributs essentiels : email du participant, identifiant de la session ciblee, statut (« secours »), date/heure de l'echec, payload JSON du formulaire complet, message d'erreur technique, `recovered_at` (timestamp nullable indiquant la date de rattrapage manuel par l'equipe ; NULL = non rattrapee). Relation : appartient a la meme entite d'inscription PACO que les inscriptions standards (afin d'etre comptabilisee dans le total des inscrits).
- **Compteur d'inscrits PACO** : nombre total de personnes inscrites a une session PACO, calcule a partir de la somme des inscriptions standards et des inscriptions de secours (consolidees par email).
- **Payload de formulaire d'inscription** : objet JSON contenant tous les champs soumis par le participant (prenom, nom, email, genre, profil d'age, ville, pays, statut professionnel, organisation, consentement a l'enregistrement, identifiant de session, etc.), conserve tel quel pour permettre le rattrapage manuel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : 100 % des participants ayant rempli un formulaire d'inscription PACO valide accedent au bouton « Rejoindre le webinaire » immediatement apres soumission, meme lorsque l'enregistrement standard echoue techniquement.
- **SC-002** : 0 inscription PACO « perdue » : pour chaque soumission de formulaire valide, soit une inscription standard est creee, soit une inscription de secours est creee (aucune soumission valide ne disparait sans trace).
- **SC-003** : Le total d'inscrits affiche sur la page PACO et dans l'interface d'administration correspond exactement a la somme des inscriptions standards et des inscriptions de secours (sans double comptage), avec un ecart egal a 0 par rapport au comptage manuel.
- **SC-004** : 100 % des inscriptions de secours conservent un payload JSON complet (tous les champs du formulaire) et un message d'erreur technique, permettant a l'equipe de rattraper manuellement l'inscription en moins de 5 minutes par cas.
- **SC-005** : Aucune confusion utilisateur : les tests utilisateurs ne revelent aucun message d'erreur visible cote participant lors d'un echec technique d'inscription (taux d'erreur visible = 0 %).
- **SC-006** : Lorsqu'un participant resoumet son inscription apres un echec, il retrouve l'acces au bouton de jonction en moins de 2 secondes, sans devoir recommencer entierement le processus.

## Assumptions

- Les pages `PacoWebinar.vue` et `PacoAdmin.vue` sont reconnues comme pages exceptionnelles et temporaires : la feature cible exclusivement ces pages et leurs composants/composables directs, sans toucher aux flux d'inscription standards de la plateforme. Les valeurs statiques existantes (identifiant d'activite PACO, sessions, liens Teams/Zoom) restent codees en dur conformement a la situation actuelle.
- Le webinaire PACO est implemente comme une activite unique (avec sessions multiples gerees via `session_edition`) et toutes les inscriptions, standards comme de secours, sont conservees dans la table `activity_registrations`. La distinction « secours » se fait via les colonnes `fallback_payload JSONB` (NULL si standard) et `fallback_error TEXT` (NULL si standard), ajoutees a la table `activity_registrations` lors de la phase de planification/migration.
- Les inscriptions de secours sont stockees au sein du meme perimetre de donnees que les inscriptions standards afin de garantir que tous les compteurs et exports existants les incluent automatiquement, sans modification specifique au compteur.
- Le mecanisme de secours s'applique exclusivement au flux d'inscription rapide PACO (composant `PacoQuickRegister.vue` et RPC `register_paco_quick`). Les autres flux d'inscription de la plateforme ne sont pas modifies par cette feature.
- L'envoi automatique du lien Teams/Zoom par email peut ne pas avoir lieu pour les inscriptions de secours (puisque le pipeline d'envoi n'est pas garanti). C'est pourquoi le rattrapage manuel par l'equipe est explicitement prevu et la consultation administrateur est essentielle.
- La validation cote front-end (champs obligatoires, format de l'email) reste active : le mode non bloquant ne signifie pas qu'on accepte les formulaires invalides, mais qu'on absorbe les erreurs techniques en aval de cette validation.
- La langue d'interface (francais/anglais) du message de confirmation presente a l'utilisateur en cas d'echec de secours suit le systeme i18n existant ; les textes necessaires seront ajoutes dans `i18n/locales/{fr,en}/paco.json`.
- Les administrateurs PACO disposent deja d'un acces aux inscriptions via la page d'administration ; seule l'identification des entrees « secours » et l'affichage du JSON / message d'erreur sont a ajouter.

## Out of Scope

- La cause racine des echecs d'inscription (reseau, WAF, contraintes SQL, etc.) n'est pas analysee ni corrigee par cette feature : elle est observable a posteriori grace aux entrees de secours mais le diagnostic et le correctif des causes restent un travail separe.
- L'envoi automatique du lien Teams/Zoom par email pour les inscriptions de secours n'est pas garanti dans cette feature (c'est l'objet du rattrapage manuel par l'equipe).
- Les autres flux d'inscription de la plateforme (inscription standard a des activites hors PACO, inscription via Zoom direct, inscription par admin) ne beneficient pas de ce mecanisme dans le cadre de cette feature.
- Les retries automatiques cote client ou serveur de l'inscription standard avant declenchement du mode secours sont laisses a l'appreciation de la phase de planification (peuvent ou non etre implementes ; l'objectif premier est l'absence de blocage utilisateur).
