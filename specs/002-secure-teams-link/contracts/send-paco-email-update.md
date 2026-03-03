# Contract Update: send-paco-email Edge Function

**Feature**: 002-secure-teams-link
**Date**: 2026-03-02
**Type**: Modification of existing edge function

## Current Behavior

The edge function `send-paco-email` sends a confirmation email containing the **Teams meeting link directly** in the email body.

```
Current email body:
"Lien pour rejoindre le webinaire :
https://teams.microsoft.com/meet/..."
```

## Updated Behavior

The edge function MUST send the **platform gateway link** instead of the Teams link.

```
Updated email body:
"Lien pour accéder au webinaire :
https://epavillonclimatique.francophonie.org/paco/join"
```

## Contract Changes

### Input (unchanged)

```
POST /send-paco-email
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "recipient_email": "user@example.com",
  "recipient_name": "John Doe"
}
```

### Validation (unchanged)

1. Verify JWT token
2. Verify user is registered in `activity_registrations` for PACO
3. Validate required fields

### Output (unchanged)

```json
// Success
{ "success": true, "message": "Email envoyé avec succès" }

// Error
{ "error": "Error description" }
```

### Email Template Changes

| Field | Before | After |
|-------|--------|-------|
| Link in body | `PACO_TEAMS_LINK` (Teams URL) | `PACO_PLATFORM_JOIN_URL` (Platform URL) |
| Link label | "Lien pour rejoindre le webinaire" | "Lien pour accéder au webinaire" |
| Instructions | "Conservez cet email pour le jour de l'événement." | "Cliquez sur le lien ci-dessus le jour du webinaire. Vous devrez être connecté(e) à votre compte ePavilion pour accéder à la réunion." |

### New Constant

```typescript
const PACO_PLATFORM_JOIN_URL = 'https://epavillonclimatique.francophonie.org/paco/join'
```

### Environment Variables

No new environment variables required. The platform URL is a constant (not configurable per environment).

## Route Contract: /paco/join

### New Vue Router Route

```
GET /paco/join
```

**No auth guard** (the page handles authentication internally, similar to `/paco`).

**Component**: `PacoJoinGateway.vue`

**Behavior**:
- If authenticated + registered → redirect to Teams (`window.location.href`)
- If authenticated + not registered → show message + link to `/paco`
- If not authenticated → show login form (reuse `PacoLoginForm.vue`)
