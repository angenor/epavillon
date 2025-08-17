# Configuration des Profils Publics - Politiques RLS

## Vue d'ensemble

Ce document décrit la configuration des politiques Row Level Security (RLS) pour permettre l'accès public aux profils d'utilisateurs dans l'application IFDD E-Pavillon.

## Fichiers concernés

- `enable_public_profiles_policy.sql` - Script de migration pour configurer les politiques RLS

## Politiques créées

### 1. Profils utilisateurs publics

**Politique:** `Public profiles are viewable by everyone`

```sql
CREATE POLICY "Public profiles are viewable by everyone" ON users
    FOR SELECT
    USING (
        networking_visibility = true 
        AND is_blocked = false 
        AND is_suspended = false
    );
```

Cette politique permet l'accès public en lecture aux profils d'utilisateurs qui ont:
- `networking_visibility = true` (visibilité réseau activée)
- `is_blocked = false` (compte non bloqué)
- `is_suspended = false` (compte non suspendu)

### 2. Accès aux données associées

Les politiques suivantes permettent l'accès aux données liées aux profils publics :

- **Organizations:** Accès public aux organisations actives
- **Countries:** Accès public à tous les pays
- **User roles:** Accès aux rôles pour les profils publics
- **Negotiators:** Accès aux données de négociateurs pour les profils publics
- **Activities:** Accès aux activités approuvées des profils publics
- **Trainings:** Accès aux formations actives des profils publics

### 3. Gestion des connexions

**Politique:** `Users can manage their connections`
- Permet aux utilisateurs authentifiés de gérer leurs demandes de connexion

### 4. Notifications privées

**Politique:** `Users can view their notifications`
- Les notifications restent privées et accessibles uniquement au propriétaire

## Fonctionnalités supportées

### Page d'annuaire public (`/directory`)

- **Recherche par nom:** Recherche dans les prénoms et noms
- **Filtres:**
  - Organisation (avec statut de vérification)
  - Pays
  - Domaine d'expertise (négociateur, formateur, développement durable)
- **Affichage:** Vue grille ou liste
- **Pagination:** 20, 50 ou 100 profils par page

### Page de profil public (`/directory/:id`)

- **Informations affichées:**
  - Informations personnelles (nom, photo, poste, biographie)
  - Organisation avec statut de vérification
  - Pays d'origine
  - Badges de rôles (négociateur, formateur)
  - Statistiques (membre depuis, nombre d'activités)
  - Activités organisées
  - Formations dispensées (si formateur)
  - Informations de négociation (si négociateur)

### Demandes de connexion

- Les utilisateurs authentifiés peuvent envoyer des demandes de connexion
- Création automatique de notifications
- Gestion des doublons

## Sécurité

### Données protégées

Les données suivantes restent privées :
- Informations personnelles sensibles (email, téléphone, etc.)
- Profils avec `networking_visibility = false`
- Comptes bloqués ou suspendus
- Notifications personnelles
- Connexions privées

### Contrôles d'accès

- **Lecture publique:** Limitée aux profils avec visibilité réseau activée
- **Écriture:** Seuls les propriétaires peuvent modifier leurs données
- **Connexions:** Gestion limitée aux parties concernées
- **Notifications:** Accès limité au destinataire

## Migration

Pour appliquer les nouvelles politiques RLS :

```bash
# Exécuter le script de migration dans Supabase
psql -h [SUPABASE_HOST] -U postgres -d postgres -f enable_public_profiles_policy.sql
```

## Maintenance

### Vérification des politiques

```sql
-- Lister toutes les politiques pour la table users
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
```

### Performance

- Index recommandés sur `networking_visibility`, `is_blocked`, `is_suspended`
- Index composite pour les recherches fréquentes
- Pagination pour limiter les résultats

## Tests recommandés

1. **Accès anonyme:** Vérifier l'accès aux profils publics sans authentification
2. **Filtrage:** Tester tous les filtres de recherche
3. **Sécurité:** Vérifier que les profils privés ne sont pas accessibles
4. **Performance:** Tester avec un grand nombre de profils
5. **Connexions:** Tester les demandes de connexion entre utilisateurs

## Notes importantes

- Les politiques RLS sont appliquées au niveau de la base de données
- Toujours tester les modifications sur un environnement de développement
- Surveiller les performances après déploiement
- Documenter toute modification future des politiques