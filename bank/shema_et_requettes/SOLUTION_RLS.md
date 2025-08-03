# Solution pour l'erreur RLS lors de l'inscription

## Problème
L'erreur "new row violates row-level security policy" se produit car lors de l'inscription, l'utilisateur n'est pas encore authentifié quand on essaie d'insérer dans la table `public.users`.

## Solution recommandée : Utiliser un trigger

### 1. Exécuter le nouveau script SQL
Connectez-vous à votre dashboard Supabase et exécutez le fichier `fix_users_rls_policies_v2.sql` dans le SQL Editor.

Ce script :
- Crée un trigger qui s'exécute automatiquement après la création d'un utilisateur dans `auth.users`
- Le trigger insère automatiquement les données de base dans `public.users`
- Les politiques RLS permettent ensuite à l'utilisateur de mettre à jour son propre profil

### 2. Le code Vue a été modifié
- Il ne tente plus d'insérer directement dans `public.users`
- Il attend que le trigger crée le profil
- Il met ensuite à jour le profil avec les informations supplémentaires (pays, téléphone, etc.)

## Alternative si le trigger ne fonctionne pas

### Option 1 : Désactiver temporairement RLS (développement uniquement)
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### Option 2 : Utiliser une fonction RPC
Créer une fonction Supabase qui gère l'inscription complète avec des droits élevés.

## Vérification
Après avoir exécuté le script :
1. Attendez 16 secondes (pour éviter l'erreur 429)
2. Essayez de vous inscrire avec une nouvelle adresse email
3. Vérifiez dans Supabase que l'utilisateur est créé dans `auth.users` ET `public.users`