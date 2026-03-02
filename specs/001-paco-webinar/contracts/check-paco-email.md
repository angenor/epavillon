# Contract: RPC Function `check_paco_email`

**Type**: Supabase RPC (PostgreSQL function)
**Purpose**: Vérifier si un email correspond à un compte existant sur la plateforme.

## Invocation

```javascript
const { data: exists, error } = await supabase.rpc('check_paco_email', {
  email_input: 'user@example.com'
})
// exists: true | false
```

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| email_input | TEXT | Email à vérifier |

## Response

| Type | Description |
|------|-------------|
| BOOLEAN | `true` si l'email existe dans `users`, `false` sinon |

## Sécurité

- `SECURITY DEFINER` : exécute avec les privilèges du propriétaire de la fonction (bypass RLS)
- Accessible aux utilisateurs anonymes (nécessaire pour le flux d'inscription)
- Ne retourne aucune donnée utilisateur, uniquement un booléen
- Ne peut pas être utilisée pour extraire des données (pas de timing attack significatif)
