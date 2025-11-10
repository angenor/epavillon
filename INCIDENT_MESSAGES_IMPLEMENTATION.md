# Implémentation des Messages d'Incidents - Résumé

## 📋 Vue d'ensemble

Système complet permettant d'afficher des messages d'alerte/incidents sur la page de programmation d'un événement. Les messages peuvent être :
- **Généraux** : Affectant tout l'événement
- **Spécifiques à une organisation** : Affectant uniquement les activités d'une organisation
- **Spécifiques à une journée** : Affectant toutes les activités d'un jour donné

## 🗂️ Fichiers créés/modifiés

### 1. Base de données
✅ **`bank/shema_et_requettes/incident_messages.sql`**
- Script SQL complet pour créer la table `incident_messages`
- Indexes pour optimiser les performances
- Triggers pour la mise à jour automatique de `updated_at`
- Exemples d'utilisation commentés

✅ **`bank/shema_et_requettes/database_complete.sql`** (mis à jour)
- Table `incident_messages` ajoutée à la ligne 237
- Activation RLS (Row Level Security) à la ligne 1247
- Politiques de sécurité ajoutées aux lignes 1564-1579

✅ **`bank/shema_et_requettes/INCIDENT_MESSAGES_GUIDE.md`**
- Documentation complète d'utilisation
- Exemples SQL pour tous les cas d'usage
- Bonnes pratiques de rédaction
- Requêtes utiles pour la gestion

### 2. Composants Vue

✅ **`src/components/AlertBanner.vue`** (nouveau)
- Composant réutilisable pour afficher les messages
- Support des 3 niveaux de gravité (info, warning, error)
- Design adapté mode clair/sombre
- Option de fermeture (dismissible)

✅ **`src/views/programmations/ProgrammationDetail.vue`** (modifié)
- Import du composant `AlertBanner`
- Ajout de l'état `incidentMessages`
- Fonction `loadIncidentMessages()` pour charger les messages
- Affichage automatique des messages après le breadcrumb

### 3. Traductions

✅ **`src/locales/fr/common.json`** (mis à jour)
- Ajout de la section `incidents` avec les traductions françaises

✅ **`src/locales/en/common.json`** (mis à jour)
- Ajout de la section `incidents` avec les traductions anglaises

## 🎨 Niveaux de gravité

| Niveau | Couleur | Classe CSS | Usage |
|--------|---------|-----------|--------|
| `info` | 🔵 Bleu | `bg-blue-50` | Information générale |
| `warning` | 🟠 Orange | `bg-orange-50` | Avertissement |
| `error` | 🔴 Rouge | `bg-red-50` | Problème critique |

## 📊 Structure de la table `incident_messages`

```sql
CREATE TABLE public.incident_messages (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL,           -- Événement concerné
  organization_id UUID,              -- NULL = message général
  day_date DATE,                     -- NULL = message général
  message_fr TEXT NOT NULL,          -- Message en français
  message_en TEXT NOT NULL,          -- Message en anglais
  severity TEXT DEFAULT 'warning',   -- info | warning | error
  is_active BOOLEAN DEFAULT TRUE,    -- Afficher ou masquer
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## 🚀 Déploiement

### Étape 1 : Créer la table dans Supabase

Connectez-vous à votre projet Supabase et exécutez le script SQL :

```bash
# Option A : Via l'interface Supabase SQL Editor
# Copiez-collez le contenu de bank/shema_et_requettes/incident_messages.sql

# Option B : Via Supabase CLI (si installé)
supabase db push
```

### Étape 2 : Vérifier la création

```sql
-- Vérifier que la table existe
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'incident_messages';

-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'incident_messages';
```

### Étape 3 : Tester l'interface

1. Démarrer le serveur de développement :
```bash
npm run dev
```

2. Créer un message de test dans Supabase :
```sql
INSERT INTO incident_messages (event_id, message_fr, message_en, severity, is_active)
VALUES (
  'votre-event-uuid',
  'Message de test en français',
  'Test message in English',
  'warning',
  true
);
```

3. Visiter une page de programmation pour voir le message s'afficher

## 💡 Exemples d'utilisation

### Message général pour l'événement
```sql
INSERT INTO incident_messages (event_id, message_fr, message_en, severity)
VALUES (
  'event-uuid',
  'Des problèmes techniques sont en cours de résolution.',
  'Technical issues are being resolved.',
  'warning'
);
```

### Message pour une organisation spécifique
```sql
INSERT INTO incident_messages (event_id, organization_id, message_fr, message_en, severity)
VALUES (
  'event-uuid',
  'org-uuid',
  'Les activités de l''IFDD peuvent subir des retards.',
  'IFDD activities may experience delays.',
  'error'
);
```

### Message pour une journée spécifique
```sql
INSERT INTO incident_messages (event_id, day_date, message_fr, message_en, severity)
VALUES (
  'event-uuid',
  '2025-11-15',
  'Maintenance prévue le 15 novembre de 12h à 13h.',
  'Maintenance scheduled on November 15 from 12pm to 1pm.',
  'info'
);
```

## 🔒 Sécurité (RLS)

Les politiques de sécurité sont configurées pour :

✅ **Lecture** : Tous les utilisateurs peuvent voir les messages actifs
```sql
CREATE POLICY "Active incident messages are viewable by all"
  ON incident_messages FOR SELECT
  USING (is_active = true);
```

✅ **Gestion** : Seuls les admins peuvent créer/modifier/supprimer
```sql
CREATE POLICY "Only admins can manage incident messages"
  ON incident_messages FOR ALL
  USING (user has admin role);
```

## 🎯 Interface d'administration (à développer)

Pour faciliter la gestion des messages, vous pouvez développer une interface d'administration avec :

- [ ] Formulaire de création de messages
- [ ] Liste des messages avec filtres (événement, statut, gravité)
- [ ] Bouton rapide pour activer/désactiver
- [ ] Prévisualisation du rendu
- [ ] Statistiques d'affichage

**Localisation suggérée** : `/admin/incident-messages`

## 📝 Gestion quotidienne

### Créer un nouveau message
1. Se connecter à Supabase
2. Ouvrir le SQL Editor
3. Exécuter une requête INSERT (voir exemples ci-dessus)

### Désactiver un message (sans le supprimer)
```sql
UPDATE incident_messages
SET is_active = false
WHERE id = 'message-uuid';
```

### Modifier un message
```sql
UPDATE incident_messages
SET
  message_fr = 'Nouveau message',
  message_en = 'New message',
  severity = 'info'
WHERE id = 'message-uuid';
```

### Lister tous les messages actifs
```sql
SELECT * FROM incident_messages
WHERE is_active = true
ORDER BY created_at DESC;
```

## 🐛 Dépannage

### Les messages ne s'affichent pas ?

1. **Vérifier que la table existe** :
```sql
\dt incident_messages
```

2. **Vérifier les politiques RLS** :
```sql
SELECT * FROM pg_policies WHERE tablename = 'incident_messages';
```

3. **Vérifier qu'il y a des messages actifs** :
```sql
SELECT * FROM incident_messages WHERE is_active = true;
```

4. **Vérifier dans la console du navigateur** :
```javascript
// Ouvrir la console (F12) et vérifier les erreurs
```

### Erreur de permissions ?

Vérifiez que les politiques RLS sont bien activées :
```sql
ALTER TABLE incident_messages ENABLE ROW LEVEL SECURITY;
```

## 📚 Documentation

- **Guide complet** : `bank/shema_et_requettes/INCIDENT_MESSAGES_GUIDE.md`
- **Script SQL** : `bank/shema_et_requettes/incident_messages.sql`
- **Database schema** : `bank/shema_et_requettes/database_complete.sql`

## ✅ Checklist de déploiement

- [ ] Exécuter le script SQL dans Supabase
- [ ] Vérifier que la table est créée
- [ ] Vérifier que les politiques RLS sont actives
- [ ] Tester avec un message de test
- [ ] Vérifier l'affichage dans l'interface
- [ ] Tester en mode clair et sombre
- [ ] Tester en français et en anglais
- [ ] Supprimer le message de test

## 🎉 Fonctionnalité prête !

Le système est maintenant opérationnel. Vous pouvez :
1. Créer des messages via SQL dans Supabase
2. Ils s'afficheront automatiquement sur la page de programmation
3. Les utilisateurs les verront dans leur langue
4. Le design s'adapte au thème clair/sombre

---

**Prochaines améliorations suggérées** :
- Interface d'administration web pour gérer les messages
- Notifications par email aux admins lors de nouveaux incidents
- Analytics : nombre d'affichages par message
- Planification : programmer l'activation/désactivation automatique
