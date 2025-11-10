# Guide d'utilisation - Messages d'incidents

## Vue d'ensemble

Ce système permet d'afficher des messages d'alerte/incidents sur la page de programmation d'un événement. Ces messages permettent d'informer les utilisateurs de :
- Problèmes techniques généraux
- Problèmes spécifiques à une organisation
- Problèmes spécifiques à une journée

## Types de messages

### 1. Message général pour l'événement
Affecte tout l'événement, sans spécificité particulière.

**Exemple** : "Des problèmes techniques sont en cours de résolution."

```sql
INSERT INTO incident_messages (event_id, message_fr, message_en, severity, is_active)
VALUES (
  'uuid-de-l-evenement',
  'Des problèmes techniques sont en cours de résolution.',
  'Technical issues are being resolved.',
  'warning',
  true
);
```

### 2. Message pour une organisation spécifique
Affecte uniquement les activités d'une organisation donnée.

**Exemple** : "L'organisation XYZ rencontre des difficultés techniques."

```sql
INSERT INTO incident_messages (event_id, organization_id, message_fr, message_en, severity, is_active)
VALUES (
  'uuid-de-l-evenement',
  'uuid-de-l-organisation',
  'L''organisation XYZ rencontre des difficultés techniques.',
  'Organization XYZ is experiencing technical difficulties.',
  'error',
  true
);
```

### 3. Message pour une journée spécifique
Affecte toutes les activités d'une journée donnée.

**Exemple** : "Des perturbations sont attendues le 15 novembre."

```sql
INSERT INTO incident_messages (event_id, day_date, message_fr, message_en, severity, is_active)
VALUES (
  'uuid-de-l-evenement',
  '2025-11-15',
  'Des perturbations sont attendues le 15 novembre.',
  'Disruptions are expected on November 15.',
  'info',
  true
);
```

## Niveaux de gravité

| Niveau | Couleur | Usage | Exemple |
|--------|---------|-------|---------|
| `info` | Bleu | Information générale | "Le calendrier a été mis à jour" |
| `warning` | Orange | Avertissement | "Des retards sont possibles" |
| `error` | Rouge | Problème technique | "Service temporairement indisponible" |

## Gestion des messages

### Créer un message

```sql
INSERT INTO incident_messages (
  event_id,
  organization_id,  -- NULL pour message général
  day_date,         -- NULL pour message général
  message_fr,
  message_en,
  severity,
  is_active
) VALUES (
  'event-uuid',
  NULL,
  NULL,
  'Message en français',
  'Message in English',
  'warning',
  true
);
```

### Désactiver un message (au lieu de le supprimer)

```sql
UPDATE incident_messages
SET is_active = false
WHERE id = 'uuid-du-message';
```

### Modifier un message

```sql
UPDATE incident_messages
SET
  message_fr = 'Nouveau message en français',
  message_en = 'New message in English',
  severity = 'info',
  updated_at = NOW()
WHERE id = 'uuid-du-message';
```

### Supprimer un message définitivement

```sql
DELETE FROM incident_messages
WHERE id = 'uuid-du-message';
```

### Lister tous les messages actifs d'un événement

```sql
SELECT
  id,
  message_fr,
  message_en,
  severity,
  organization_id,
  day_date,
  created_at
FROM incident_messages
WHERE event_id = 'uuid-de-l-evenement'
  AND is_active = true
ORDER BY created_at DESC;
```

## Affichage dans l'interface

Les messages sont affichés automatiquement :
- Juste après le breadcrumb de navigation
- Avant la section principale de la programmation
- Avec un design adapté au mode clair et sombre
- Triés par ordre de création (plus récent en premier)

### Exemple visuel

```
[Navigation breadcrumb]
↓
[⚠️ Message d'avertissement orange]
[ℹ️ Message d'information bleu]
↓
[Contenu de la programmation]
```

## Bonnes pratiques

### 1. Rédaction des messages
- ✅ Être concis et clair
- ✅ Indiquer la nature du problème
- ✅ Mentionner si possible une durée ou échéance
- ❌ Éviter le jargon technique

**Bon exemple** : "Les vidéos de certaines activités peuvent être temporairement indisponibles. Résolution en cours."

**Mauvais exemple** : "Erreur 500 sur le serveur de streaming. Check les logs."

### 2. Choix de la gravité
- **info** : Information neutre, pas de problème
- **warning** : Attention requise, peut impacter l'expérience
- **error** : Problème critique, service impacté

### 3. Gestion du cycle de vie
1. Créer le message dès que le problème est identifié
2. Mettre à jour si la situation évolue
3. Désactiver (`is_active = false`) quand le problème est résolu
4. Supprimer définitivement après quelques jours (pour l'historique)

### 4. Messages multilingues
- ✅ Toujours fournir `message_fr` ET `message_en`
- ✅ Garder la même signification dans les deux langues
- ✅ Adapter les expressions idiomatiques

## Cas d'usage courants

### Problème technique global
```sql
-- Tous les livestreams sont en panne
INSERT INTO incident_messages (event_id, message_fr, message_en, severity)
VALUES (
  'event-uuid',
  'Les diffusions en direct sont temporairement interrompues. Retour prévu sous 30 minutes.',
  'Live broadcasts are temporarily interrupted. Expected return in 30 minutes.',
  'error'
);
```

### Problème d'organisation
```sql
-- Une organisation a des soucis de connexion
INSERT INTO incident_messages (event_id, organization_id, message_fr, message_en, severity)
VALUES (
  'event-uuid',
  'org-uuid',
  'Les activités de l''IFDD peuvent subir des retards en raison de problèmes de connexion.',
  'IFDD activities may experience delays due to connection issues.',
  'warning'
);
```

### Information pour une journée
```sql
-- Maintenance prévue un jour spécifique
INSERT INTO incident_messages (event_id, day_date, message_fr, message_en, severity)
VALUES (
  'event-uuid',
  '2025-11-20',
  'Maintenance technique prévue le 20 novembre de 12h à 13h (GMT).',
  'Technical maintenance scheduled on November 20 from 12pm to 1pm (GMT).',
  'info'
);
```

## Requêtes utiles

### Compter les messages actifs par événement
```sql
SELECT
  e.title,
  e.year,
  COUNT(im.id) as active_messages
FROM events e
LEFT JOIN incident_messages im ON e.id = im.event_id AND im.is_active = true
GROUP BY e.id, e.title, e.year
ORDER BY active_messages DESC;
```

### Trouver les messages obsolètes (créés il y a plus de 7 jours et encore actifs)
```sql
SELECT
  id,
  message_fr,
  created_at,
  AGE(NOW(), created_at) as age
FROM incident_messages
WHERE is_active = true
  AND created_at < NOW() - INTERVAL '7 days'
ORDER BY created_at;
```

### Voir l'historique des messages d'un événement
```sql
SELECT
  id,
  message_fr,
  severity,
  is_active,
  created_at,
  updated_at,
  CASE
    WHEN organization_id IS NOT NULL THEN 'Organisation spécifique'
    WHEN day_date IS NOT NULL THEN 'Journée spécifique'
    ELSE 'Message général'
  END as type_message
FROM incident_messages
WHERE event_id = 'uuid-de-l-evenement'
ORDER BY created_at DESC;
```

## Sécurité (RLS)

Les politiques de sécurité Row Level Security (RLS) sont configurées :

- **Lecture** : Tous les utilisateurs peuvent voir les messages actifs
- **Création/Modification/Suppression** : Réservé aux administrateurs uniquement

Pour vérifier les permissions :
```sql
SELECT * FROM pg_policies WHERE tablename = 'incident_messages';
```

## Interface d'administration (à venir)

Une interface d'administration sera développée pour permettre de :
- [ ] Créer des messages via un formulaire
- [ ] Lister tous les messages avec filtres
- [ ] Activer/désactiver rapidement un message
- [ ] Prévisualiser le rendu du message
- [ ] Voir les statistiques d'affichage

## Support et questions

Pour toute question ou problème concernant les messages d'incidents, contactez l'équipe technique IFDD.
