# Résolution de l'erreur "set-returning functions are not allowed in WHERE"

## Résumé du problème

L'erreur "set-returning functions are not allowed in WHERE" survient lors de l'insertion dans la table `organizations` avec RLS (Row Level Security) activé. Cette erreur est causée par plusieurs facteurs techniques qui interagissent entre eux.

## Causes identifiées

### 1. **Fonction `generate_search_tokens` problématique**
- **Problème** : Utilise `unnest(tokens)` directement dans une clause WHERE
- **Code problématique** :
```sql
tokens := ARRAY(
    SELECT DISTINCT unnest(tokens)  -- ❌ PROBLÉMATIQUE
    WHERE LENGTH(unnest(tokens)) > 2
);
```

### 2. **Trigger `check_organization_duplicate` avec conflits RLS**
- **Problème** : Le trigger fait des requêtes sur la même table pendant l'insertion avec RLS activé
- **Cause** : Interrogation de la table `organizations` pendant qu'une insertion est en cours

### 3. **Colonnes GENERATED ALWAYS AS**
- **Problème** : La colonne `name_normalized GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED` peut causer des conflits avec RLS

### 4. **Colonne ARRAY `name_search_tokens TEXT[]`**
- **Problème** : Les opérations sur les colonnes de type array peuvent déclencher des fonctions set-returning

### 5. **Politiques RLS conflictuelles**
- **Problème** : Plusieurs politiques avec des noms différents mais des conditions similaires
- **Effet** : Peut créer des références circulaires ou des conflits

### 6. **Permissions manquantes**
- **Problème** : Manque de permissions sur les séquences, fonctions système, ou types enum

## Solutions implémentées

### 📁 Scripts de correction créés :

1. **`fix_organizations_set_returning_error.sql`** - Solution principale
2. **`verify_and_fix_database_permissions.sql`** - Correction des permissions
3. **`test_organizations_insert.sql`** - Tests de vérification
4. **`debug_set_returning_functions_error.sql`** - Guide de diagnostic

### 🔧 Corrections apportées :

#### 1. Correction de la fonction `generate_search_tokens`
```sql
-- ❌ Version problématique
tokens := ARRAY(
    SELECT DISTINCT unnest(tokens) 
    WHERE LENGTH(unnest(tokens)) > 2
);

-- ✅ Version corrigée
tokens := ARRAY(
    SELECT DISTINCT word 
    FROM (SELECT unnest(tokens) as word) AS words
    WHERE LENGTH(word) > 2
);
```

#### 2. Correction du trigger `check_organization_duplicate`
- Ajout de `SECURITY DEFINER` pour éviter les conflits RLS
- Simplification de la logique de détection des doublons
- Évitement des requêtes complexes pendant l'insertion

#### 3. Simplification des politiques RLS
```sql
-- Politiques simplifiées et non-conflictuelles
CREATE POLICY "organizations_select_policy" ON public.organizations
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "organizations_insert_policy" ON public.organizations
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND created_by = auth.uid()
    );
```

#### 4. Correction des permissions
- Permissions sur toutes les séquences (`GRANT USAGE ON ALL SEQUENCES`)
- Permissions sur les fonctions système (`uuid_generate_v4()`, `auth.uid()`)
- Permissions sur les types enum personnalisés

## Instructions d'application

### Ordre d'exécution recommandé :

1. **Diagnostic** (optionnel) :
   ```sql
   -- Exécuter pour identifier la cause exacte
   \i debug_set_returning_functions_error.sql
   ```

2. **Correction principale** :
   ```sql
   -- Solution complète du problème
   \i fix_organizations_set_returning_error.sql
   ```

3. **Vérification des permissions** :
   ```sql
   -- Correction des permissions système
   \i verify_and_fix_database_permissions.sql
   ```

4. **Tests de vérification** :
   ```sql
   -- Vérifier que tout fonctionne
   \i test_organizations_insert.sql
   ```

## Vérification du succès

### Tests à effectuer :

1. **Test d'insertion basique** :
```sql
INSERT INTO public.organizations (
    name, email, organization_type, created_by
) VALUES (
    'Test Organization', 
    'test@example.com', 
    'ngo_association', 
    auth.uid()
);
```

2. **Test de la fonction de recherche** :
```sql
SELECT * FROM search_organizations('Test');
```

3. **Test des colonnes générées** :
```sql
SELECT name, name_normalized, name_search_tokens 
FROM public.organizations 
WHERE email = 'test@example.com';
```

## Dépannage

### Si l'erreur persiste :

1. **Vérifier l'authentification** :
   ```sql
   SELECT auth.uid(); -- Ne doit pas être NULL
   ```

2. **Vérifier les extensions** :
   ```sql
   SELECT * FROM pg_extension WHERE extname IN ('pg_trgm', 'uuid-ossp');
   ```

3. **Vérifier les politiques RLS** :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'organizations';
   ```

4. **Examiner les logs PostgreSQL** pour des détails spécifiques

### Commandes de diagnostic avancé :

```sql
-- Voir toutes les fonctions set-returning
SELECT proname, proretset FROM pg_proc 
WHERE proretset = true AND pronamespace = 'public'::regnamespace;

-- Tester insertion sans RLS temporairement
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
-- ... test d'insertion ...
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
```

## Prévention

### Bonnes pratiques pour éviter ce problème :

1. **Éviter `unnest()` dans les clauses WHERE** - Utiliser des sous-requêtes à la place
2. **Utiliser `SECURITY DEFINER`** sur les fonctions qui interrogent la même table
3. **Simplifier les politiques RLS** - Éviter les conditions complexes
4. **Tester les triggers individuellement** avant l'activation RLS
5. **Vérifier les permissions** sur toutes les dépendances

## Support technique

### Fichiers de référence :
- `/bank/shema_et_requettes/database_complete.sql` - Schéma complet
- `/bank/shema_et_requettes/fix_*.sql` - Scripts de correction
- Cette documentation pour la résolution future

### En cas de problème persistant :
1. Examiner les logs PostgreSQL détaillés
2. Tester chaque composant individuellement
3. Contacter l'équipe de développement avec les résultats des scripts de diagnostic

---

**Statut** : ✅ Solution complète fournie  
**Dernière mise à jour** : 2025-08-04  
**Scripts testés** : Oui, sur environnement de développement