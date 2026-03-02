# Data Model: Webinaire PACO

**Branch**: `001-paco-webinar` | **Date**: 2026-03-02

## Entités existantes utilisées

### activity_registrations (table existante, pas de modification)

Enregistrement d'inscription d'un utilisateur au webinaire PACO.

| Champ | Type | Contrainte | Usage PACO |
|-------|------|-----------|------------|
| id | UUID | PK, auto-generated | Identifiant unique de l'inscription |
| activity_id | UUID | FK → activities, NOT NULL | `00000000-0000-4000-a000-00000000a002` (PACO Activity UUID) |
| user_id | UUID | FK → users | ID de l'utilisateur authentifié |
| registration_type | ENUM | Default 'user' | Toujours 'user' (pas de guests pour PACO) |
| registration_date | TIMESTAMPTZ | Default NOW() | Date d'inscription |
| attended | BOOLEAN | Default FALSE | Suivi de présence (post-webinaire) |

**Index de unicité existant** : `activity_registrations_user_unique(activity_id, user_id)` → empêche les inscriptions en double.

### users (table existante, pas de modification)

| Champ | Usage PACO |
|-------|------------|
| id | Lien avec activity_registrations.user_id |
| email | Vérification d'existence du compte, envoi d'email |
| first_name | Affichage et personnalisation email |
| last_name | Affichage et personnalisation email |
| country_id | Pré-rempli dans le formulaire d'inscription activité |
| organization_id | Pré-rempli dans le formulaire d'inscription activité |

## Entités fictives (script SQL d'insertion)

### events (entrée minimale)

| Champ | Valeur |
|-------|--------|
| id | `00000000-0000-4000-a000-00000000e001` |
| year | 2026 |
| title | 'PACO - Webinaire' |
| description | 'Entrée technique pour le webinaire PACO' |
| submission_deadline | '2026-12-31T23:59:59Z' |
| participation_mode | 'online' |
| country_id | (premier pays francophone existant) |
| city | 'En ligne' |
| address | 'En ligne' |
| timezone | 'UTC' |

### activities (entrée minimale)

| Champ | Valeur |
|-------|--------|
| id | `00000000-0000-4000-a000-00000000a002` |
| event_id | `00000000-0000-4000-a000-00000000e001` |
| organization_id | (organisation admin existante) |
| submitted_by | (utilisateur admin existant) |
| title | 'Webinaire PACO' |
| activity_type | 'side_event' |
| objectives | 'Webinaire PACO' |
| detailed_presentation | 'Webinaire PACO' |
| format | 'online' |
| main_themes | '{adaptation}' |
| categories | '{capacity_building}' |
| proposed_start_date | (date du webinaire) |
| proposed_end_date | (date du webinaire) |
| validation_status | 'approved' |

## Nouvelle fonction RPC

### check_paco_email

```sql
CREATE OR REPLACE FUNCTION public.check_paco_email(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE email = email_input
  );
END;
$$;
```

**But** : Permettre aux visiteurs anonymes de vérifier si un email existe déjà.
**Sécurité** : `SECURITY DEFINER` bypass RLS, ne retourne qu'un booléen.

## Nouvelle Edge Function

### send-paco-email

**Endpoint** : `supabase.functions.invoke('send-paco-email', { body })`

**Request body** :
```json
{
  "recipient_email": "user@example.com",
  "recipient_name": "Prénom Nom",
  "teams_link": "https://teams.microsoft.com/...",
  "webinar_title": "Titre du webinaire",
  "webinar_date": "2026-XX-XX à XXh00 UTC"
}
```

**Logique** :
1. Vérifier que l'utilisateur appelant est authentifié
2. Vérifier qu'il est inscrit dans `activity_registrations` pour l'activité PACO
3. Construire l'email avec le template PACO
4. Appeler le backend Laravel `send_polivalent_email`
5. Retourner le résultat

**Response** :
```json
{
  "success": true,
  "message": "Email envoyé avec succès"
}
```

## Constantes PACO (frontend)

```javascript
// src/composables/paco/constants.js
export const PACO_EVENT_ID = '00000000-0000-4000-a000-00000000e001'
export const PACO_ACTIVITY_ID = '00000000-0000-4000-a000-00000000a002'
export const PACO_TEAMS_LINK = '' // À configurer par l'organisateur
```

## Diagramme de relations

```
events (fictif)
  └── activities (fictif)
       └── activity_registrations
            └── users (existant)
```

## États du parcours utilisateur

```
[Non connecté]
    → Saisie email
    → {email existe?}
       OUI → [Formulaire login] → Connexion → {inscrit PACO?}
                                                  OUI → [Afficher lien Teams]
                                                  NON → [Inscription PACO] → [Email envoyé] → [Afficher lien]
       NON → [Formulaire register + PACO] → Inscription → [Email envoyé] → [Message succès]

[Connecté]
    → {inscrit PACO?}
       OUI → [Afficher lien Teams]
       NON → [Formulaire inscription PACO (pré-rempli)] → [Email envoyé] → [Afficher lien]
```
