# Data Model: Vérification email dans le workflow PACO

**Branch**: `004-paco-email-verify` | **Date**: 2026-03-05

## Aucune modification de base de données

Cette feature n'ajoute ni ne modifie aucune table en base de données. Elle utilise les tables existantes :

- `activity_registrations` — inscription au webinaire PACO
- `paco_demographic_data` — données démographiques liées à l'inscription
- `users` — profil utilisateur (lecture seule pour cette feature)

## Données temporaires côté client

### sessionStorage : `paco_pending_registration`

Stockage temporaire des données du formulaire d'inscription entre la soumission et la vérification d'email.

**Clé** : `paco_pending_registration`

**Structure** :

```json
{
  "userId": "uuid",
  "email": "string",
  "name": "string",
  "demographicData": {
    "gender": "male | female",
    "ageProfile": "over_35 | under_35",
    "city": "string",
    "countryId": "uuid",
    "professionalStatus": "employed | student | unemployed | entrepreneur",
    "organization": "string (optional)",
    "recordingConsent": true
  },
  "timestamp": "ISO 8601 date string"
}
```

**Cycle de vie** :
1. **Créé** : Après soumission réussie du formulaire `PacoRegisterForm` (signUp Supabase réussi)
2. **Lu** : Par `PacoWebinar.checkInitialState()` pour finaliser l'inscription après vérification email
3. **Supprimé** : Après finalisation réussie de l'inscription au webinaire, ou à la fermeture de l'onglet (comportement natif sessionStorage)

**Validation** :
- Le champ `timestamp` permet de vérifier la fraîcheur des données (ignorer si > 24h)
- Le champ `userId` permet de vérifier que les données appartiennent bien à l'utilisateur connecté

## État de vérification email

Utilise le champ natif Supabase Auth `user.email_confirmed_at` :
- `null` → email non vérifié
- `ISO date` → email vérifié

Accessible via `supabase.auth.getUser()` ou l'objet `user` du store auth.

## Diagramme d'état

```text
[Formulaire soumis]
       │
       ▼
  email_confirmed_at = null?
       │
    ┌──┴──┐
   Oui    Non (cas rare)
    │      │
    ▼      ▼
[verify-email]  [Finaliser inscription]
    │                    │
    ▼                    ▼
[Email vérifié]    [join]
    │
    ▼
sessionStorage existe?
    │
  ┌─┴──┐
 Oui   Non
  │     │
  ▼     ▼
[Finaliser    [activity-register]
 auto]         (re-remplir données)
  │
  ▼
[join]
```
