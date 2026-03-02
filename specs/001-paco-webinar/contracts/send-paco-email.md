# Contract: Edge Function `send-paco-email`

**Type**: Supabase Edge Function (Deno/TypeScript)
**Purpose**: Envoyer l'email de confirmation d'inscription au webinaire PACO avec le lien Teams.

## Invocation

```javascript
const { data, error } = await supabase.functions.invoke('send-paco-email', {
  body: { recipient_email, recipient_name, teams_link, webinar_title, webinar_date }
})
```

## Request

**Headers**: `Authorization: Bearer <supabase_session_token>` (automatique via client Supabase)

**Body** (JSON):

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| recipient_email | string | oui | Email du destinataire |
| recipient_name | string | oui | Nom complet du destinataire |

Les données du webinaire (titre, date, lien Teams) sont hardcodées dans la fonction pour limiter la surface d'attaque.

## Response

**Succès (200)**:
```json
{
  "success": true,
  "message": "Email envoyé avec succès"
}
```

**Erreur d'authentification (401)**:
```json
{
  "error": "Non authentifié"
}
```

**Erreur d'autorisation (403)**:
```json
{
  "error": "Utilisateur non inscrit au webinaire PACO"
}
```

**Erreur serveur (500)**:
```json
{
  "error": "Erreur lors de l'envoi de l'email",
  "details": "..."
}
```

## Validation

1. L'utilisateur appelant DOIT être authentifié (token JWT valide)
2. L'utilisateur DOIT avoir une inscription dans `activity_registrations` avec `activity_id = PACO_ACTIVITY_ID` et `user_id = caller.id`
3. Les champs `recipient_email` et `recipient_name` sont requis et doivent être non vides

## Backend

Appelle le même endpoint Laravel que `send-email` :
- URL: `LARAVEL_POLIVALENT_EMAIL_URL`
- Auth: `SUPABASE_CUSTOM_AUTH_LARAVEL_KEY`
- Template email PACO hardcodé dans la fonction
