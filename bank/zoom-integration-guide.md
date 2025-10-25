# Guide d'intégration Zoom pour ePavilion

Ce guide explique comment configurer et utiliser la fonctionnalité de création automatique de réunions Zoom lors de la validation d'activités.

## Vue d'ensemble

Lorsqu'un administrateur approuve une activité, le système crée automatiquement une réunion Zoom en tenant compte :
- Du **fuseau horaire** de l'événement associé
- Des **dates et heures** de l'activité (finales ou proposées)
- De la **durée** calculée entre la date de début et de fin
- Du **titre** et de la **description** de l'activité

## Architecture

### Composants créés

1. **Edge Function Supabase** : `supabase/functions/create-zoom-meeting/index.ts`
   - Gère l'authentification OAuth avec Zoom
   - Crée la réunion via l'API Zoom
   - Stocke les informations dans la base de données
   - Lie la réunion à l'activité

2. **Composable Vue** : `src/composables/zoom/useZoomMeeting.js`
   - Fournit une interface simple pour créer des réunions
   - Gère les états de chargement et d'erreur
   - Permet de récupérer les informations d'une réunion

3. **Intégration dans ActivityDetail.vue**
   - Création automatique lors du passage au statut "approved"
   - Affichage de notifications à l'utilisateur
   - Gestion des erreurs sans bloquer la validation

## Configuration requise

### 1. Créer une application Zoom

1. Allez sur [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Cliquez sur "Develop" > "Build App"
3. Choisissez "Server-to-Server OAuth"
4. Remplissez les informations de l'application :
   - App name: `ePavilion Activity Manager`
   - Company name: `IFDD`
   - Developer contact: votre email
5. Activez l'application et notez :
   - **Account ID**
   - **Client ID**
   - **Client Secret**

### 2. Configurer les permissions (Scopes)

Dans la configuration de votre application Zoom, ajoutez les scopes suivants :

- `meeting:write:admin` - Pour créer des réunions
- `meeting:read:admin` - Pour lire les informations des réunions
- `user:read:admin` - Pour lire les informations utilisateur

### 3. Configurer les variables d'environnement Supabase

Ajoutez les variables d'environnement suivantes dans votre projet Supabase :

```bash
# Via la CLI Supabase
supabase secrets set ZOOM_ACCOUNT_ID="votre_account_id"
supabase secrets set ZOOM_CLIENT_ID="votre_client_id"
supabase secrets set ZOOM_CLIENT_SECRET="votre_client_secret"
supabase secrets set ZOOM_USER_ID="me"  # ou l'email de l'utilisateur Zoom qui créera les réunions
```

Ou via le Dashboard Supabase :
1. Allez dans **Project Settings** > **Edge Functions**
2. Ajoutez les secrets :
   - `ZOOM_ACCOUNT_ID`
   - `ZOOM_CLIENT_ID`
   - `ZOOM_CLIENT_SECRET`
   - `ZOOM_USER_ID` (optionnel, par défaut "me")

### 4. Déployer l'Edge Function

```bash
# Déployer la fonction
npx supabase functions deploy create-zoom-meeting

# Ou déployer toutes les fonctions
npx supabase functions deploy
```

## Utilisation

### Création automatique lors de la validation

L'intégration est automatique. Lorsqu'un administrateur approuve une activité :

1. L'activité passe au statut "approved"
2. Le système vérifie si une réunion Zoom existe déjà
3. Si non, une réunion est créée automatiquement
4. Un message de confirmation s'affiche avec :
   - L'ID de la réunion Zoom
   - Le lien de participation
   - Le lien pour l'hôte (start_url)

### Création manuelle via le composable

```javascript
import { useZoomMeeting } from '@/composables/zoom/useZoomMeeting'

const { createZoomMeeting, isCreatingMeeting } = useZoomMeeting()

// Créer une réunion pour une activité
const handleCreateMeeting = async (activityId) => {
  const result = await createZoomMeeting(activityId)

  if (result.success) {
    console.log('Réunion créée:', result.data)
    // result.data contient: zoom_meeting_id, meeting_id, join_url, start_url, password, registration_url
  } else {
    console.error('Erreur:', result.error)
  }
}
```

## Structure de la base de données

### Table `zoom_meetings`

```sql
CREATE TABLE public.zoom_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id TEXT UNIQUE NOT NULL,          -- ID de la réunion Zoom
    registration_url TEXT,                    -- URL d'inscription
    start_url TEXT,                           -- URL pour démarrer (hôte)
    join_url TEXT,                            -- URL pour rejoindre (participants)
    password TEXT,                            -- Mot de passe de la réunion
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Liaison avec les activités

Le champ `zoom_meeting_id` dans la table `activities` référence `zoom_meetings.id`.

## Format des réunions créées

Les réunions Zoom sont configurées avec les paramètres suivants :

- **Type** : Réunion planifiée (type 2)
- **Vidéo hôte** : Activée
- **Vidéo participants** : Activée
- **Rejoindre avant l'hôte** : Désactivé (sécurité)
- **Muet à l'entrée** : Activé
- **Salle d'attente** : Activée
- **Enregistrement** : Cloud automatique
- **Appareils multiples** : Autorisés
- **Approbation** : Automatique
- **Type d'inscription** : Les participants peuvent s'inscrire et rejoindre
- **Audio** : Téléphone + VoIP

## Gestion du fuseau horaire

Le système utilise le fuseau horaire de l'événement associé (`events.timezone`) pour :
1. Formater correctement la date/heure de début
2. Transmettre le timezone à l'API Zoom
3. Garantir que la réunion se déroule au bon moment local

Exemple de fuseaux horaires supportés :
- `America/Montreal`
- `Europe/Paris`
- `Africa/Nairobi`
- `Asia/Dubai`

## Gestion des erreurs

### Si la création Zoom échoue

L'activité reste approuvée, mais un message d'avertissement s'affiche :
```
⚠️ Activité approuvée, mais la création de la réunion Zoom a échoué:
[message d'erreur]

Vous pouvez créer la réunion manuellement plus tard.
```

### Si une réunion existe déjà

L'Edge Function retourne simplement les informations existantes sans créer de doublon.

### Messages de logs

Tous les événements sont loggés dans la console de l'Edge Function :
- Authentification Zoom
- Paramètres de la réunion
- Succès/échec de la création
- Enregistrement en base de données

## Tester l'intégration

### 1. Créer une activité de test

```javascript
// Assurez-vous que l'activité a :
// - Un event_id valide avec un timezone défini
// - Des dates proposed_start_date et proposed_end_date
// - Un titre et une description
```

### 2. Approuver l'activité

1. Connectez-vous en tant qu'administrateur
2. Allez sur la page de détail de l'activité
3. Changez le statut de "submitted" à "approved"
4. Vérifiez le message de confirmation

### 3. Vérifier la création

Vérifiez dans la base de données :

```sql
-- Vérifier la réunion créée
SELECT * FROM zoom_meetings
WHERE id = (SELECT zoom_meeting_id FROM activities WHERE id = 'activity_id');

-- Vérifier le lien avec l'activité
SELECT
  a.title,
  a.validation_status,
  a.zoom_meeting_id,
  zm.meeting_id,
  zm.join_url
FROM activities a
LEFT JOIN zoom_meetings zm ON a.zoom_meeting_id = zm.id
WHERE a.id = 'activity_id';
```

### 4. Tester la réunion Zoom

1. Copiez le `join_url` de la base de données
2. Ouvrez-le dans un navigateur
3. Vérifiez que la réunion est bien programmée
4. Vérifiez l'heure dans le bon fuseau horaire

## Dépannage

### Erreur : "Zoom credentials not configured"

- Vérifiez que les secrets sont bien définis dans Supabase
- Redéployez la fonction après avoir ajouté les secrets

### Erreur : "Failed to get Zoom access token"

- Vérifiez que l'Account ID, Client ID et Client Secret sont corrects
- Vérifiez que l'application Zoom est activée
- Vérifiez les permissions (scopes) de l'application

### Erreur : "Missing required date or timezone information"

- Vérifiez que l'événement associé a un timezone défini
- Vérifiez que l'activité a des dates (proposed ou final)

### La réunion est créée au mauvais moment

- Vérifiez le timezone de l'événement
- Vérifiez les dates de l'activité
- Consultez les logs de l'Edge Function pour voir les paramètres envoyés

## Logs de débogage

Pour voir les logs de l'Edge Function :

```bash
# Via la CLI Supabase
supabase functions logs create-zoom-meeting

# Ou dans le Dashboard Supabase
# Edge Functions > create-zoom-meeting > Logs
```

## Suppression automatique de réunions Zoom

### Vue d'ensemble

Lorsqu'une activité est **annulée** ou **rejetée**, le système supprime automatiquement la réunion Zoom associée.

### Edge Function : `delete-zoom-meeting`

**Emplacement** : `supabase/functions/delete-zoom-meeting/index.ts`

**Fonctionnement** :
1. Reçoit l'ID de l'activité à annuler
2. Récupère les informations de la réunion Zoom associée depuis la base de données
3. Supprime la réunion via l'API Zoom
4. Supprime l'entrée dans la table `zoom_meetings`
5. Met à jour l'activité pour retirer la référence à la réunion Zoom

### Déploiement de la fonction de suppression

```bash
# Déployer la fonction delete-zoom-meeting
npx supabase functions deploy delete-zoom-meeting

# Ou déployer toutes les fonctions
npx supabase functions deploy
```

**Note** : Les variables d'environnement sont les mêmes que pour `create-zoom-meeting`.

### Utilisation automatique

La suppression est automatique lors du changement de statut :

1. L'utilisateur change le statut vers "Annulée" ou "Rejetée"
2. Une modale demande le motif de l'annulation/rejet
3. Après validation :
   - Le statut de l'activité est mis à jour
   - Si une réunion Zoom existe, elle est automatiquement supprimée
   - Un message de confirmation s'affiche

### Utilisation manuelle via le composable

```javascript
import { useZoomMeeting } from '@/composables/zoom/useZoomMeeting'

const { deleteZoomMeeting, isDeletingMeeting } = useZoomMeeting()

// Supprimer une réunion pour une activité
const handleDeleteMeeting = async (activityId) => {
  const result = await deleteZoomMeeting(activityId)

  if (result.success) {
    console.log('Réunion supprimée:', result.message)
  } else {
    console.error('Erreur:', result.error)
  }
}
```

### Gestion des erreurs de suppression

#### Si la suppression Zoom échoue

L'activité reste annulée/rejetée, mais un message d'avertissement s'affiche :
```
⚠️ Activité annulée, mais la suppression de la réunion Zoom a échoué:
[message d'erreur]

Vous pouvez supprimer la réunion manuellement.
```

#### Si la réunion n'existe plus sur Zoom (404)

La fonction considère cela comme un succès et nettoie la base de données.

### Statuts et actions Zoom

| Statut | Création Zoom | Suppression Zoom | Copie des dates |
|--------|---------------|------------------|-----------------|
| `draft` | Non | Non | Non |
| `submitted` | Non | Non | Non |
| `under_review` | Non | Non | Non |
| `approved` | ✅ Oui (si inexistante) | Non | ✅ Oui |
| `rejected` | Non | ✅ Oui (si existante) | Non |
| `cancelled` | Non | ✅ Oui (si existante) | Non |

### Logs de suppression

Pour voir les logs de suppression :

```bash
# Via la CLI Supabase
supabase functions logs delete-zoom-meeting

# Ou dans le Dashboard Supabase
# Edge Functions > delete-zoom-meeting > Logs
```

Format des logs :
```
📤 Deleting Zoom meeting: [meeting_id]
✅ Zoom meeting deleted successfully: [meeting_id]
❌ Failed to delete Zoom meeting: [error]
```

### Vérifier les réunions orphelines

```sql
-- Réunions Zoom sans activité associée
SELECT zm.*
FROM zoom_meetings zm
LEFT JOIN activities a ON a.zoom_meeting_id = zm.id
WHERE a.id IS NULL;
```

### Nettoyer les réunions orphelines

```sql
-- Supprimer les réunions orphelines de plus de 30 jours
DELETE FROM zoom_meetings
WHERE id IN (
  SELECT zm.id
  FROM zoom_meetings zm
  LEFT JOIN activities a ON a.zoom_meeting_id = zm.id
  WHERE a.id IS NULL
  AND zm.created_at < NOW() - INTERVAL '30 days'
);
```

## Améliorations futures possibles

1. **Envoi d'emails automatiques** avec le lien Zoom aux inscrits
2. **Email de notification d'annulation** aux participants inscrits
3. **Synchronisation bidirectionnelle** : mettre à jour l'activité si la réunion Zoom est modifiée
4. **Webhooks Zoom** : écouter les événements (participants, enregistrement terminé, etc.)
5. **Gestion des co-hôtes** : ajouter automatiquement les intervenants comme co-hôtes
6. **Intégration avec le calendrier** : ajouter la réunion au calendrier Vue Cal
7. **Historique des suppressions** : Conserver un log des réunions supprimées
8. **Restauration** : Possibilité de recréer une réunion si l'activité est ré-approuvée

## Support

Pour toute question ou problème :
1. Consultez les logs de l'Edge Function
2. Vérifiez la documentation Zoom API : https://developers.zoom.us/docs/api/
3. Consultez ce guide

---

**Dernière mise à jour** : 2025-10-24
**Version** : 1.1.0 - Ajout de la suppression automatique de réunions Zoom
