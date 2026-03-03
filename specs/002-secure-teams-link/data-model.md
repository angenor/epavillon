# Data Model: Sécurisation du lien Teams PACO

**Feature**: 002-secure-teams-link
**Date**: 2026-03-02

## Overview

Cette fonctionnalité ne requiert **aucune modification** de la base de données. Elle réutilise intégralement le modèle de données existant du module PACO.

## Existing Entities Used

### activity_registrations (table existante)

Utilisée pour vérifier si un utilisateur est inscrit au webinaire PACO.

| Field | Type | Usage dans cette feature |
|-------|------|-------------------------|
| `id` | UUID (PK) | Identifiant de l'inscription |
| `activity_id` | UUID (FK → activities) | Filtré par `PACO_ACTIVITY_ID` (`00000000-0000-4000-a000-00000000a002`) |
| `user_id` | UUID (FK → auth.users) | Identifiant de l'utilisateur à vérifier |
| `registration_type` | TEXT | Type d'inscription (`'user'`) |

**Contrainte d'unicité** : `activity_registrations_user_unique(activity_id, user_id)` — empêche les doublons.

**Query pattern sur la gateway** :
```
SELECT id FROM activity_registrations
WHERE activity_id = PACO_ACTIVITY_ID AND user_id = current_user_id
LIMIT 1
```

### check_paco_email (RPC function existante)

Fonction `SECURITY DEFINER` accessible aux utilisateurs anonymes. Non utilisée directement par la gateway (la gateway vérifie l'auth, pas l'email), mais toujours utilisée par la page `/paco` pour le flux d'inscription.

## State Transitions

### Page Gateway — State Machine

```
┌──────────┐
│ loading  │ ← État initial (vérification auth + inscription)
└────┬─────┘
     │
     ├── Pas authentifié ──────────────► ┌─────────┐
     │                                    │  login  │ ← Formulaire de connexion
     │                                    └────┬────┘
     │                                         │
     │                          Connexion OK ──┤
     │                                         │
     ├── Authentifié + Non inscrit ──────────► ┌────────────────┐
     │                                         │ not-registered │ ← Message + lien /paco
     │                                         └────────────────┘
     │
     └── Authentifié + Inscrit ─────────────► ┌──────────────┐
                                               │ redirecting  │ ← Redirection vers Teams
                                               └──────────────┘
```

## No New Tables or Columns

Aucune migration SQL nécessaire. Aucun fichier dans `bank/shema_et_requettes/` à modifier.
