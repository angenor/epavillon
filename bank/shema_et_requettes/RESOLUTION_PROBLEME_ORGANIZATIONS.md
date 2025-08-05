# Résolution du Problème "set-returning functions" - Organizations

## Problème Identifié
L'erreur "set-returning functions are not allowed in WHERE" était causée par :
1. Les colonnes générées (`name_normalized`, `name_search_tokens`)
2. Les triggers complexes avec des fonctions problématiques
3. Les politiques RLS utilisant des fonctions complexes

## Solution Appliquée

### 1. Modifications de la Table Organizations
**Colonnes supprimées :**
- `name_normalized` (GENERATED ALWAYS AS)
- `name_search_tokens` (TEXT[])

**Raison :** Ces colonnes générées causaient des conflits avec RLS.

### 2. Triggers et Fonctions Supprimés
- `check_organization_duplicate()` - Utilisait les colonnes supprimées
- `generate_search_tokens()` - Créait des tokens de recherche
- Tous les triggers associés

### 3. Nouvelles Politiques RLS Simplifiées
```sql
-- SELECT : Tout le monde peut voir les organisations actives
CREATE POLICY "anyone_can_view_active_orgs" ON public.organizations
    FOR SELECT USING (is_active = TRUE);

-- INSERT : Utilisateurs authentifiés seulement
CREATE POLICY "authenticated_users_insert" ON public.organizations
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- UPDATE : Seulement le créateur
CREATE POLICY "creators_can_update" ON public.organizations
    FOR UPDATE TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- DELETE : Seulement le créateur
CREATE POLICY "creators_can_delete" ON public.organizations
    FOR DELETE TO authenticated
    USING (auth.uid() = created_by);
```

### 4. Nouvelle Fonction de Recherche
**Ancienne :** `search_organizations()` - Complexe avec UNION et similarité
**Nouvelle :** `search_organizations_simple()` - Simple avec ILIKE

```sql
CREATE OR REPLACE FUNCTION search_organizations_simple(search_text TEXT)
RETURNS TABLE (
    organization_id UUID,
    name TEXT,
    organization_type organization_type,
    is_verified BOOLEAN
) SECURITY DEFINER
```

### 5. Changements dans le Code Vue
Fichier : `/src/views/organization/Setup.vue`
- Utilise maintenant `search_organizations_simple` au lieu de `search_organizations`
- Adapté pour la nouvelle structure de résultats

## Scripts Créés

1. **`fix_organizations_minimal.sql`** - Solution appliquée (conserve les données)
2. **`fix_organizations_complete.sql`** - Solution alternative (recrée la table)
3. **`database_complete.sql`** - Mis à jour avec les changements

## Résultat
✅ La création d'organisation fonctionne maintenant sans erreur
✅ La recherche d'organisation fonctionne (mais moins sophistiquée)
✅ Les données existantes sont préservées

## Recommandations Futures

1. **Éviter les colonnes GENERATED ALWAYS AS** dans les tables avec RLS
2. **Éviter les colonnes de type ARRAY** dans les politiques RLS
3. **Garder les politiques RLS simples** - pas de sous-requêtes complexes
4. **Utiliser SECURITY DEFINER** pour les fonctions qui font des requêtes

## Pour Réintroduire des Fonctionnalités Avancées

Si vous voulez réintroduire la recherche avancée, considérez :
1. Utiliser une table séparée pour les tokens de recherche
2. Utiliser Elasticsearch ou un service de recherche externe
3. Créer des vues matérialisées pour les données pré-calculées