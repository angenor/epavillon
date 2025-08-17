# Instructions pour appliquer les corrections SQL dans Supabase

## Résumé des corrections

Les modifications corrigent deux problèmes principaux :
1. **Relations ambiguës** entre les tables `users` et `organizations`
2. **Récursion infinie** dans les politiques RLS
3. **Accès public** à tous les utilisateurs inscrits (pas seulement les professionnels)

## Fichier à appliquer

Exécuter le fichier suivant dans Supabase SQL Editor :
```
fix_rls_and_relations.sql
```

## Étapes d'application

### 1. Se connecter à Supabase Dashboard
- Aller sur https://app.supabase.com
- Sélectionner votre projet
- Naviguer vers "SQL Editor"

### 2. Exécuter le script SQL
- Copier le contenu complet du fichier `fix_rls_and_relations.sql`
- Coller dans l'éditeur SQL
- Cliquer sur "Run" ou appuyer sur Ctrl+Enter

### 3. Vérifier l'application
Le script va :
- Ajouter la contrainte de clé étrangère manquante pour `organization_id`
- Supprimer toutes les anciennes politiques RLS qui causaient la récursion
- Créer de nouvelles politiques simples et non-récursives
- Activer RLS sur toutes les tables concernées
- Créer des index pour améliorer les performances

## Changements principaux

### Politiques RLS simplifiées

**Avant :** Les profils étaient visibles seulement si `networking_visibility = true`

**Après :** TOUS les utilisateurs inscrits sont visibles publiquement s'ils ne sont pas bloqués ou suspendus

```sql
-- Nouvelle politique simple
CREATE POLICY "All registered users are publicly viewable" ON users
    FOR SELECT
    USING (
        is_blocked = false 
        AND is_suspended = false
    );
```

### Relations clarifiées

Les requêtes Supabase utilisent maintenant la syntaxe explicite :
- `countries!country_id` au lieu de `country:countries`
- `organizations!organization_id` au lieu de `organization:organizations`

## Vérification

### Test 1 : Accès public
Tester l'accès à `/directory` sans être connecté
- Les profils doivent s'afficher

### Test 2 : Pas d'erreurs de récursion
Vérifier la console du navigateur
- Aucune erreur "infinite recursion detected"

### Test 3 : Relations fonctionnelles
Les profils doivent afficher :
- Le pays
- L'organisation
- Les rôles

## Rollback si nécessaire

Si vous devez revenir en arrière :
```sql
-- Supprimer les nouvelles politiques
DROP POLICY IF EXISTS "All registered users are publicly viewable" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;

-- Rétablir les anciennes politiques
-- (À adapter selon vos anciennes politiques)
```

## Notes importantes

- Les utilisateurs bloqués ou suspendus restent invisibles
- Les données sensibles (email, téléphone) ne sont pas exposées
- Les utilisateurs peuvent toujours modifier uniquement leur propre profil
- Les notifications restent privées