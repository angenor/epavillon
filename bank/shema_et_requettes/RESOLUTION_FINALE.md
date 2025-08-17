# Résolution des problèmes d'affichage des profils publics

## Problèmes résolus

### 1. Relations ambiguës dans Supabase
- **Problème** : Multiples clés étrangères entre les tables causant des ambiguïtés
- **Solution** : Spécification explicite des relations avec la syntaxe `!constraint_name`

### 2. Récursion infinie dans les politiques RLS
- **Problème** : Les politiques RLS référençaient d'autres tables créant des boucles
- **Solution** : Politiques simplifiées sans références circulaires

### 3. Accès public aux profils
- **Problème** : Seuls les profils avec `networking_visibility = true` étaient visibles
- **Solution** : Tous les utilisateurs non bloqués sont maintenant visibles publiquement

## Fichiers modifiés

### 1. SQL - Politiques RLS
**Fichier à exécuter** : `fix_rls_and_relations_v3.sql`

Ce script :
- Supprime toutes les anciennes politiques
- Crée de nouvelles politiques simples
- Active RLS sur toutes les tables nécessaires
- Crée des index pour les performances

### 2. JavaScript - Requêtes Supabase
**Fichier** : `src/composables/usePublicProfiles.js`

Changements principaux :
```javascript
// Avant (ambiguë)
user_roles(
  role,
  is_active
)

// Après (explicite)
user_roles!user_roles_user_id_fkey(
  role,
  is_active
)
```

Relations corrigées :
- `countries!country_id` - Relation via country_id
- `organizations!organization_id` - Relation via organization_id
- `user_roles!user_roles_user_id_fkey` - Relation via user_id
- `negotiators!negotiators_user_id_fkey` - Relation via user_id

## Instructions d'application

### Étape 1 : Appliquer les politiques RLS
1. Ouvrir Supabase Dashboard
2. Aller dans SQL Editor
3. Copier/coller le contenu de `fix_rls_and_relations_v3.sql`
4. Exécuter le script

### Étape 2 : Déployer l'application
Le code JavaScript a déjà été mis à jour. Il suffit de :
```bash
npm run build
npm run preview  # Pour tester localement
```

## Vérification

### Test 1 : Console du navigateur
Vérifier qu'il n'y a plus d'erreurs :
- Pas de "Could not embed because more than one relationship"
- Pas de "infinite recursion detected"

### Test 2 : Affichage des profils
- Naviguer vers `/directory`
- Les profils doivent s'afficher
- Les filtres doivent fonctionner

### Test 3 : Profil détaillé
- Cliquer sur "Voir le profil"
- Les informations doivent s'afficher correctement

## Comportement attendu

### Qui est visible ?
- ✅ Tous les utilisateurs inscrits
- ✅ Sans distinction de rôle
- ❌ Sauf les utilisateurs bloqués (`is_blocked = true`)
- ❌ Sauf les utilisateurs suspendus (`is_suspended = true`)

### Données affichées
- Nom et prénom
- Poste/Adresse
- Organisation (avec statut de vérification)
- Pays
- Biographie
- Rôles (négociateur, formateur, etc.)
- Statistiques (membre depuis, activités)

## Dépannage

### Si les profils ne s'affichent toujours pas

1. **Vérifier les données dans Supabase**
```sql
-- Vérifier qu'il y a des utilisateurs
SELECT COUNT(*) FROM users WHERE is_blocked = false AND is_suspended = false;

-- Vérifier les politiques actives
SELECT * FROM pg_policies WHERE tablename = 'users';
```

2. **Vérifier les logs Supabase**
- Dashboard > Logs > API logs
- Chercher les erreurs 403 ou 500

3. **Tester avec anon key**
```javascript
// Dans la console du navigateur
const { data, error } = await supabase
  .from('users')
  .select('id, first_name, last_name')
  .eq('is_blocked', false)
  .eq('is_suspended', false)
  .limit(5)

console.log('Data:', data)
console.log('Error:', error)
```

## Notes importantes

- Les politiques RLS s'appliquent au niveau base de données
- Les changements sont immédiats après exécution du script SQL
- Aucun redémarrage nécessaire
- Les utilisateurs authentifiés peuvent toujours modifier uniquement leur propre profil