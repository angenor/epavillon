# Research: Page d'inscription au webinaire PACO

**Branch**: `001-paco-webinar` | **Date**: 2026-03-02

## R1: Envoi d'email pour utilisateurs non-admin

### Contexte
L'edge function existante `send-email` exige le rôle `super_admin`. Or, les utilisateurs qui s'inscrivent au webinaire PACO sont des utilisateurs standards.

### Decision
Créer une edge function dédiée `send-paco-email` qui :
- Accepte un utilisateur authentifié (pas besoin d'être admin)
- Vérifie que l'utilisateur est inscrit au webinaire PACO dans `activity_registrations`
- Envoie uniquement l'email de confirmation PACO (template fixe)
- Appelle le même backend Laravel (`send_polivalent_email`) que l'edge function existante

### Rationale
- **Isolation** : fonction dédiée supprimable après l'événement, sans modifier `send-email`
- **Sécurité** : périmètre limité (un seul type d'email, un seul template)
- **Réutilisation** : même infrastructure Laravel pour l'envoi effectif

### Alternatives considérées
- Modifier `send-email` pour ajouter un bypass PACO → rejeté (couple le code temporaire au code permanent)
- Database trigger sur INSERT `activity_registrations` → rejeté (complexité, nécessite pg_net)
- Appeler Laravel directement depuis le frontend → rejeté (expose les clés d'API)

---

## R2: Vérification de l'existence d'un email (utilisateur anonyme)

### Contexte
Un visiteur non connecté doit pouvoir entrer son email pour que le système détermine s'il a déjà un compte (afficher login) ou non (afficher register). Les politiques RLS de Supabase empêchent les requêtes anonymes sur la table `users`.

### Decision
Créer une fonction RPC Supabase `check_paco_email(email_input TEXT) RETURNS BOOLEAN` avec `SECURITY DEFINER` qui vérifie l'existence de l'email dans la table `users`.

### Rationale
- Simple, performant, sécurisé (n'expose que un booléen, pas les données utilisateur)
- Fonctionne pour les visiteurs anonymes (SECURITY DEFINER bypass RLS)
- Script SQL stocké dans `bank/shema_et_requettes/` conforme à la convention

### Alternatives considérées
- Politique RLS permettant le SELECT anonyme sur `users.email` → rejeté (trop permissif)
- Edge function dédiée pour le check → rejeté (surcharge pour un simple booléen)
- Tenter un signIn et intercepter l'erreur → rejeté (mauvaise UX, lent)

---

## R3: Flux post-inscription et vérification d'email

### Contexte
Supabase Auth envoie automatiquement un email de vérification lors du signUp. Après inscription, l'utilisateur a une session temporaire. Deux emails partent : la vérification Supabase + le lien Teams PACO.

### Decision
Profiter de la session temporaire post-signUp pour :
1. Insérer dans `activity_registrations` immédiatement
2. Appeler `send-paco-email` pour envoyer le lien Teams
3. Afficher un message de succès avec instruction de vérifier son email
4. Le lien Teams est dans l'email PACO → l'utilisateur peut rejoindre le webinaire sans se reconnecter

### Rationale
- L'utilisateur reçoit le lien Teams immédiatement, pas besoin d'attendre la vérification
- La session post-signUp permet l'insertion en base et l'appel à l'edge function
- UX claire : "Vérifiez votre email pour le lien Teams et la confirmation de votre compte"

### Alternatives considérées
- Attendre la vérification avant d'envoyer le lien → rejeté (friction, risque de perte d'utilisateur)
- Envoyer le lien Teams dans le même email que la vérification → rejeté (impossible, Supabase contrôle l'email de vérification)

---

## R4: Structure SQL pour event et activity fictifs

### Contexte
La table `activities` a de nombreux champs NOT NULL : `event_id`, `organization_id`, `submitted_by`, `title`, `activity_type`, `objectives`, `detailed_presentation`, `format`, `main_themes`, `categories`, `proposed_start_date`, `proposed_end_date`. L'event associé nécessite aussi des champs NOT NULL.

### Decision
Créer un script SQL d'insertion avec des valeurs minimales valides :
- UUIDs documentés : Event `00000000-0000-4000-a000-00000000e001`, Activity `00000000-0000-4000-a000-00000000a002`
- L'event utilise `participation_mode = 'online'` pour éviter les contraintes d'adresse physique
- L'activity utilise les types et formats les plus simples
- Le `submitted_by` et `organization_id` référenceront un utilisateur/organisation admin existant (paramètre du script)

### Rationale
- Respecte toutes les contraintes FK et NOT NULL existantes
- UUIDs facilement identifiables et documentés
- Script réversible (DELETE par UUID)

---

## R5: Pattern d'intégration des formulaires Login/Register sur la page PACO

### Contexte
Les formulaires Login.vue et Register.vue existants sont des pages complètes avec layout, background, etc. Ils doivent être réutilisés sous forme de composants intégrés dans la page PACO.

### Decision
Créer des composants allégés dans `src/components/paco/` qui reprennent la logique des formulaires existants :
- `PacoLoginForm.vue` : champs email + mot de passe, appel `signInWithPassword`, pas de layout
- `PacoRegisterForm.vue` : champs inscription plateforme + champs activité (organisation, pays), appel `signUp` + update profil, pas de layout
- La logique auth (signUp, signIn) est appelée directement via le client Supabase (`useSupabase`)

### Rationale
- Réutilisation de la logique sans dépendance aux composants existants (isolation)
- Pas de modification des pages Login/Register existantes
- Composants supprimables facilement

### Alternatives considérées
- Extraire des sous-composants des pages existantes → rejeté (modifie le code existant, viole l'isolation)
- Utiliser les pages existantes en iframe → rejeté (complexe, problèmes d'auth)
