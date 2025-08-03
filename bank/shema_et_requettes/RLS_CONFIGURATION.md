# Configuration RLS (Row Level Security) pour Supabase

## Problème identifié
Erreur 401 lors de l'inscription : `new row violates row-level security policy for table "users"`

## Cause
La table `public.users` a RLS activé mais n'a pas de politique permettant l'insertion de nouvelles lignes lors de l'inscription.

## Solution

### 1. Exécuter le script SQL dans Supabase
Allez dans votre dashboard Supabase > SQL Editor et exécutez le contenu du fichier `fix_users_rls_policies.sql`

### 2. Alternative temporaire (NON RECOMMANDÉ pour la production)
Si vous voulez tester rapidement, vous pouvez temporairement désactiver RLS :
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```
⚠️ **ATTENTION** : Ceci désactive complètement la sécurité sur la table. À utiliser uniquement pour le développement.

### 3. Vérification
Après avoir appliqué les politiques, testez l'inscription à nouveau. Les politiques créées permettent :
- L'insertion d'un nouveau profil lors de l'inscription
- La consultation de son propre profil
- La mise à jour de son propre profil
- La consultation des profils publics (si networking_visibility = true)
- L'accès complet pour les administrateurs

## Notes importantes
- Les politiques RLS s'appliquent uniquement aux requêtes passant par l'API Supabase
- Le service_role key contourne RLS (ne jamais l'exposer côté client)
- La clé anon respecte les politiques RLS