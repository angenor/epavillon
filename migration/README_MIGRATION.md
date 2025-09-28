# Guide de migration des utilisateurs Laravel vers Supabase

Ce document explique comment configurer et exécuter la migration des utilisateurs de l'ancienne plateforme Laravel vers la nouvelle plateforme Supabase.

## Vue d'ensemble

Le système de migration permet de :
- ✅ Migrer les utilisateurs depuis l'API Laravel paginée
- ✅ Créer automatiquement les comptes Supabase (auth.users + public.users)
- ✅ Préserver l'ancienneté (created_at et updated_at)
- ✅ Mettre à jour les utilisateurs existants avec leur ancienneté
- ✅ Suivre la progression en temps réel
- ✅ Gérer les erreurs et les logs
- ✅ Effectuer un rollback complet si nécessaire

## Prérequis

1. **Supabase CLI** installé
   ```bash
   npm install -g supabase
   ```

2. **Accès au projet Supabase**
   - URL du projet
   - Clé anonyme (anon key)
   - Clé de service (service role key)

3. **Droits d'administration** sur l'application

## Étape 1 : Configuration de la base de données

### 1.1 Créer la table migration_logs

Exécutez le script SQL dans l'éditeur SQL de Supabase :

```bash
# Depuis le tableau de bord Supabase
# Allez dans SQL Editor > New Query
# Copiez et collez le contenu de :
bank/shema_et_requettes/migration_logs.sql
```

Ou via la CLI Supabase :
```bash
supabase db push --file bank/shema_et_requettes/migration_logs.sql
```

## Étape 2 : Déploiement des Edge Functions

### 2.1 Initialiser Supabase (si ce n'est pas déjà fait)

```bash
# À la racine du projet
supabase init
```

### 2.2 Lier votre projet Supabase

```bash
supabase link --project-ref VOTRE_PROJECT_REF
```

### 2.3 Déployer les Edge Functions

```bash
# Déployer la fonction de migration d'utilisateur
supabase functions deploy migrate-user

# Déployer la fonction de suppression (rollback)
supabase functions deploy delete-migrated-user
```

### 2.4 Vérifier le déploiement

```bash
supabase functions list
```

Vous devriez voir :
- ✅ migrate-user
- ✅ delete-migrated-user

## Étape 3 : Configuration des variables d'environnement

Les Edge Functions utilisent automatiquement les variables d'environnement suivantes (fournies par Supabase) :
- `SUPABASE_URL` : URL de votre projet
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de service (avec privilèges admin)

Ces variables sont automatiquement disponibles dans les Edge Functions.

## Étape 4 : Backup de la base de données (RECOMMANDÉ)

⚠️ **IMPORTANT** : Avant de démarrer la migration, il est **fortement recommandé** d'exporter toutes vos données.

### 4.1 Créer un backup complet

Dans l'interface de migration, vous trouverez une section **"Backup de la base de données"** avec trois options :

#### Option 1 : Exporter toutes les tables (Recommandé)
1. Cliquez sur **"Exporter toutes les tables"**
2. L'export démarre et affiche la progression en temps réel
3. Le fichier JSON sera téléchargé automatiquement

Tables exportées (23 au total) :
- users, organizations, activities, events
- user_roles, countries, testimonials
- connections, messages, appointments
- negotiations, migration_logs, etc.

#### Option 2 : Exporter uniquement les users
1. Cliquez sur **"Exporter uniquement les users"**
2. Exporte : `users` + `user_roles`
3. Plus rapide pour un backup ciblé

### 4.2 Format du backup

Le fichier de backup est au format JSON et contient :
```json
{
  "metadata": {
    "exportDate": "2025-09-28T10:30:00.000Z",
    "version": "1.0",
    "totalTables": 23
  },
  "tables": {
    "users": {
      "data": [...],
      "count": 2556,
      "exportedAt": "2025-09-28T10:30:15.000Z"
    },
    "organizations": {
      "data": [...],
      "count": 450,
      "exportedAt": "2025-09-28T10:30:20.000Z"
    }
    // ... autres tables
  }
}
```

Nom du fichier : `backup_epavillonclimatique_YYYY-MM-DD-HH-mm-ss.json`

### 4.3 Restauration depuis un backup

En cas de problème, vous pouvez restaurer les données depuis le fichier JSON :
1. Utilisez l'éditeur SQL de Supabase
2. Recréez les enregistrements manuellement depuis le JSON
3. Ou utilisez un script de restauration personnalisé

**Note** : Conservez le fichier de backup dans un endroit sûr pendant au moins 30 jours après la migration.

## Étape 5 : Exécution de la migration

### 5.1 Accéder à l'interface de migration

1. Connectez-vous en tant qu'administrateur
2. Accédez à : `/admin/migration`
3. Vous verrez l'interface de migration

### 5.2 Démarrer la migration

1. Cliquez sur le bouton **"Démarrer la migration"**
2. La migration commence et affiche :
   - Progression en temps réel (page par page)
   - Nombre d'utilisateurs traités
   - Nombre d'utilisateurs créés
   - Nombre d'utilisateurs mis à jour
   - Nombre d'erreurs
   - Logs détaillés

### 5.3 Contrôler la migration

Pendant la migration, vous pouvez :
- ⏸️ **Pause** : Mettre la migration en pause
- ▶️ **Reprendre** : Reprendre la migration
- ⏹️ **Arrêter** : Arrêter complètement la migration

## Étape 6 : Migration des photos de profil

⚠️ **IMPORTANT** : Cette étape est optionnelle mais recommandée pour une expérience utilisateur complète.

**Note** : Le bucket `epavillonp` existe déjà dans votre projet Supabase, donc pas besoin de créer un nouveau bucket.

### 6.1 Lancer la migration des photos

Dans l'interface de migration (`/admin/migration`) :

1. Attendez que la migration des utilisateurs soit terminée
2. Section **"Migration des photos de profil"**
3. Cliquez sur **"Migrer les photos"**

La migration va :
- Télécharger les photos depuis `https://epavillonclimatique.francophonie.org/`
- Générer une miniature (150x150px, optimisée)
- Uploader sur Supabase Storage (bucket existant: `epavillonp`)
- Mettre à jour `profile_photo_url` et `profile_photo_thumbnail_url`

**Documentation complète** : `migration/PHOTO_MIGRATION.md`

## Étape 7 : Vérification post-migration

### 7.1 Vérifier les utilisateurs migrés

Dans Supabase, exécutez cette requête SQL :

```sql
-- Compter les utilisateurs migrés
SELECT COUNT(*) as total_migres
FROM public.users
WHERE is_migrate = true;

-- Voir les détails
SELECT
  id,
  email,
  first_name,
  last_name,
  laravel_user_id,
  created_at,
  updated_at
FROM public.users
WHERE is_migrate = true
ORDER BY created_at DESC
LIMIT 10;
```

### 7.2 Vérifier les logs de migration

```sql
-- Voir les logs de migration
SELECT
  action,
  COUNT(*) as count
FROM public.migration_logs
GROUP BY action;

-- Voir les détails
SELECT *
FROM public.migration_logs
ORDER BY migrated_at DESC
LIMIT 10;
```

### 7.3 Vérifier les photos de profil (si migrées)

```sql
-- Compter les utilisateurs avec photos migrées
SELECT COUNT(*) as users_with_photos
FROM public.users
WHERE profile_photo_url IS NOT NULL
AND profile_photo_thumbnail_url IS NOT NULL
AND is_migrate = true;
```

## Étape 8 : Rollback (si nécessaire)

⚠️ **ATTENTION** : Le rollback supprime TOUS les utilisateurs migrés de manière permanente !

### 8.1 Effectuer un rollback

1. Dans l'interface de migration (`/admin/migration`)
2. Cliquez sur le bouton **"Rollback"**
3. Confirmez l'action (double confirmation)
4. Le système va :
   - Supprimer tous les utilisateurs créés lors de la migration
   - Restaurer les anciennes dates pour les utilisateurs mis à jour
   - Nettoyer les logs de migration

### 8.2 Vérifier le rollback

```sql
-- Vérifier qu'il n'y a plus d'utilisateurs migrés
SELECT COUNT(*) as total_migres
FROM public.users
WHERE is_migrate = true;
-- Devrait retourner 0

-- Vérifier que les logs sont vides
SELECT COUNT(*) FROM public.migration_logs;
-- Devrait retourner 0
```

## Architecture technique

### Composants

1. **Composable** : `src/composables/useMigration.js`
   - Gère la logique de migration côté client
   - Fetch l'API Laravel
   - Appelle les Edge Functions
   - Gère la progression et les erreurs

2. **Vue** : `src/views/admin/UserMigration.vue`
   - Interface utilisateur
   - Affichage de la progression
   - Contrôles (pause, reprendre, arrêter)
   - Logs en temps réel

3. **Edge Functions** :
   - `migrate-user` : Crée un utilisateur dans auth.users et public.users
   - `delete-migrated-user` : Supprime un utilisateur migré (rollback)

4. **Base de données** :
   - Table `migration_logs` : Trace toutes les opérations de migration

### Flux de migration

```
1. Fetch utilisateurs Laravel (API paginée)
   ↓
2. Pour chaque utilisateur :
   ↓
3. Vérifier si l'utilisateur existe déjà (par email)
   ↓
4a. Si n'existe pas :
    - Appeler Edge Function migrate-user
    - Créer dans auth.users
    - Créer dans public.users
    - Logger l'action
   ↓
4b. Si existe déjà :
    - Mettre à jour created_at et updated_at
    - Logger l'action
   ↓
5. Continuer jusqu'à la fin ou arrêt manuel
```

## Mapping des champs

| Ancien champ (Laravel) | Nouveau champ (Supabase) | Notes |
|------------------------|--------------------------|-------|
| `id` | `laravel_user_id` | Référence à l'ancien ID |
| `name` | `last_name` | Nom de famille |
| `prenom` | `first_name` | Prénom |
| `email` | `email` | Email (unique) |
| `telephone` | `phone` | Téléphone |
| `biographie` | `biography` | Biographie |
| `photo_url` | `profile_photo_url` | URL complète avec base |
| `created_at` | `created_at` | Préservé |
| `updated_at` | `updated_at` | Préservé |
| - | `is_migrate` | TRUE pour utilisateurs migrés |

## Règles de migration

1. **Utilisateurs sans email** : Ignorés avec un warning
2. **Utilisateurs existants** : Mise à jour des dates uniquement
3. **Utilisateurs déjà migrés** : Ignorés (basé sur `laravel_user_id`)
4. **Images de profil** : Restent sur l'ancien serveur
5. **Pays** : NULL (non renseignés dans l'ancienne plateforme)
6. **Mot de passe** : Les utilisateurs devront réinitialiser

## Dépannage

### Erreur : "duplicate key value violates unique constraint users_pkey"

**Cause** : Incohérence entre `auth.users` et `public.users` - l'utilisateur existe dans auth mais pas dans public.

**Solution** : Exécuter le script de correction **AVANT** la migration

1. Ouvrez l'éditeur SQL de Supabase
2. Copiez et exécutez le contenu de `bank/shema_et_requettes/fix_inconsistencies.sql`
3. Suivez les étapes dans l'ordre :
   - **ÉTAPE 1** : Détecter les incohérences
   - **ÉTAPE 2** : Corriger (crée les profils manquants)
   - **ÉTAPE 3** : Vérifier que tout est OK
   - **ÉTAPE 4** : Nettoyer les doublons si nécessaire

4. Une fois les incohérences corrigées, redémarrez la migration

**Script SQL complet disponible dans** : `bank/shema_et_requettes/fix_inconsistencies.sql`

### Erreur : "Failed to create auth user"

**Cause** : La clé de service n'a pas les permissions nécessaires

**Solution** :
1. Vérifiez que la `SUPABASE_SERVICE_ROLE_KEY` est correcte
2. Vérifiez les permissions dans Supabase Dashboard

### Erreur : "Email already registered"

**Cause** : L'email existe déjà dans auth.users

**Solution** : Normal - la Edge Function va maintenant gérer ce cas et mettre à jour le profil existant

### Erreur : "Function not found"

**Cause** : Les Edge Functions ne sont pas déployées

**Solution** :
```bash
supabase functions deploy migrate-user
supabase functions deploy delete-migrated-user
```

### La migration est lente

**Cause** : Délai de 100ms entre chaque utilisateur (pour éviter la surcharge)

**Solution** : Normal - comptez environ 10 secondes par page de 100 utilisateurs

## Sécurité

- ✅ Seuls les administrateurs peuvent accéder à l'interface (via middleware router)
- ✅ Les Edge Functions utilisent la clé de service (privilèges admin)
- ✅ Les logs de migration sont protégés par RLS (Row Level Security)
- ✅ Double confirmation pour le rollback
- ✅ Pas de stockage des mots de passe (réinitialisation obligatoire)

## Support

Pour toute question ou problème :
1. Vérifiez les logs dans l'interface de migration
2. Consultez les logs Supabase (Dashboard > Edge Functions > Logs)
3. Vérifiez la table `migration_logs` pour l'historique détaillé

## Checklist de migration

Avant de migrer en production :

- [ ] Script SQL exécuté (`migration_logs` table créée)
- [ ] Edge Functions déployées et testées
- [ ] **Backup complet de la base de données exporté et sauvegardé** (via le bouton "Exporter toutes les tables")
- [ ] Fichier de backup conservé dans un endroit sûr (cloud, disque externe, etc.)
- [ ] **Script de correction des incohérences exécuté** (`fix_inconsistencies.sql`)
- [ ] Vérification qu'il n'y a plus d'utilisateurs orphelins (auth sans public)
- [ ] Test de migration sur un petit échantillon (quelques pages)
- [ ] Vérification manuelle de quelques utilisateurs migrés
- [ ] Test de la fonctionnalité de rollback
- [ ] Communication aux utilisateurs (email de réinitialisation de mot de passe)
- [ ] Plan de rollback prêt en cas de problème

Après la migration des utilisateurs (optionnel) :

- [ ] Migration des photos de profil lancée
- [ ] Vérification visuelle de quelques photos migrées
- [ ] Vérification des miniatures dans le Storage (bucket `epavillonp/profiles/`)

---

**Date de création** : 2025-09-28
**Auteur** : Claude Code
**Version** : 1.0