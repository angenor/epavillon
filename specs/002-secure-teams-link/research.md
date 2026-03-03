# Research: Sécurisation du lien Teams PACO

**Feature**: 002-secure-teams-link
**Date**: 2026-03-02

## R1: Approche gateway — Nouvelle page Vue vs Route Guard

**Decision**: Nouvelle page Vue (`PacoJoinGateway.vue`)

**Rationale**: Une page Vue dédiée offre un meilleur contrôle sur l'expérience utilisateur :
- Affichage d'un formulaire de connexion inline pour les utilisateurs non authentifiés
- Messages contextuels adaptés (connexion requise, inscription obligatoire)
- État de chargement pendant la vérification
- Cohérence visuelle avec la page PACO existante (dark mode, i18n)

Un route guard seul ne permettrait que de rediriger vers la page de login existante sans contexte, ce qui serait déroutant pour l'utilisateur qui clique sur un lien email.

**Alternatives considered**:
- **Route guard + redirect vers /login** : Plus simple mais perte de contexte (l'utilisateur ne sait pas pourquoi il doit se connecter). Nécessite un paramètre `redirect` complexe.
- **Middleware dans la page /paco** : Pollurait la logique existante de la page d'inscription. Viole le principe de responsabilité unique.

---

## R2: Formulaire de connexion sur la page gateway

**Decision**: Formulaire de connexion inline sur la page gateway, similaire au pattern de `PacoWebinar.vue`

**Rationale**: La page PACO existante utilise déjà un formulaire de connexion inline (`PacoLoginForm.vue`). Réutiliser ce même composant sur la page gateway :
- Garantit une UX cohérente
- Maximise la réutilisation du code existant (DRY)
- Évite une navigation supplémentaire (clic email → login page → retour gateway)
- Le composant gère déjà les erreurs, le "mot de passe oublié", et le retour

**Alternatives considered**:
- **Redirect vers la page login standard** : Ajoute un aller-retour de navigation. L'utilisateur perd le contexte du webinaire. Plus complexe à implémenter (gestion du `returnUrl`).

---

## R3: Source du lien Teams — Frontend constants vs Server-side only

**Decision**: Conserver le lien Teams dans `constants.js` (frontend), utilisé uniquement par la page gateway pour la redirection

**Rationale**:
- Le lien Teams est déjà dans `constants.js` et dans l'edge function
- Même si le lien est déplacé côté serveur, une fois la redirection effectuée, l'URL Teams est visible dans la barre d'adresse du navigateur
- Le vrai vecteur d'attaque (partage du lien email) est éliminé par la gateway
- Un utilisateur assez technique pour inspecter le code source pourrait aussi partager son écran ou copier l'URL après redirection
- Ajouter un appel serveur pour récupérer le lien ajouterait de la latence et de la complexité sans gain de sécurité réel

**Alternatives considered**:
- **Edge function retourne le lien après vérification** : Sécurité marginalement meilleure mais ajoute un round-trip réseau, une nouvelle edge function, et plus de complexité. Le lien reste visible après redirection de toute façon.

---

## R4: Gestion de l'état sur la page gateway

**Decision**: Machine à états simple avec 4 états : `loading`, `login`, `not-registered`, `redirecting`

**Rationale**: Cohérent avec le pattern de la page `PacoWebinar.vue` qui utilise déjà une machine à états à 7 états. La page gateway est plus simple car elle n'a pas besoin de gérer l'inscription (uniquement la vérification).

**États**:
1. `loading` — Vérification de l'authentification et de l'inscription en cours
2. `login` — Utilisateur non authentifié, afficher le formulaire de connexion
3. `not-registered` — Utilisateur authentifié mais non inscrit, afficher message + lien vers `/paco`
4. `redirecting` — Utilisateur vérifié, redirection vers Teams en cours

---

## R5: Mise à jour de l'email — Lien plateforme

**Decision**: Modifier l'edge function `send-paco-email` pour remplacer le lien Teams par le lien plateforme

**Rationale**: Le lien plateforme (`https://epavillonclimatique.francophonie.org/paco/join`) est une URL fixe et stable. Pas besoin de variable d'environnement supplémentaire car l'URL de production est connue et constante.

**Modifications requises**:
- Remplacer `PACO_TEAMS_LINK` par l'URL plateforme dans le corps de l'email
- Mettre à jour le texte de l'email pour refléter le nouveau parcours (« cliquez pour accéder au webinaire » au lieu de « lien pour rejoindre directement »)
- Conserver `PACO_TEAMS_LINK` dans l'edge function (non utilisé dans l'email mais toujours accessible si besoin)
