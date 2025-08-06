# Correction du problème de mise à jour des activités

## Problème identifié

La page d'édition des activités ne peut pas enregistrer les modifications en raison d'une **politique RLS (Row Level Security) manquante** sur la table `activities`.

### Symptômes
- La page d'édition se charge correctement
- Les modifications ne sont pas sauvegardées
- Erreur 42501 (Permission denied) dans les logs de la console
- Message d'erreur : "Permission denied"

### Cause racine
Dans le schéma de base de données (`database_complete.sql`), les politiques RLS pour la table `activities` incluent seulement :
- `SELECT` pour visualiser les activités
- `INSERT` pour créer de nouvelles activités  

Il manque la politique `UPDATE` pour permettre aux utilisateurs de modifier leurs propres activités.

## Solution

### 1. Script SQL à exécuter dans Supabase

Exécutez le script suivant dans votre console SQL Supabase :

```sql
-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres activités
CREATE POLICY "Users can update their own activities" 
ON public.activities 
FOR UPDATE 
USING (
    submitted_by = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
)
WITH CHECK (
    submitted_by = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);
```

### 2. Script automatisé disponible

Un script SQL prêt à l'emploi est disponible dans : 
`bank/shema_et_requettes/add_activities_update_policy.sql`

### 3. Permissions accordées

Cette politique permet :
- ✅ Aux utilisateurs de modifier leurs propres activités (`submitted_by = auth.uid()`)
- ✅ Aux administrateurs et super-administrateurs de modifier toutes les activités
- ❌ Empêche les autres utilisateurs de modifier les activités d'autrui

## Vérification

Après avoir appliqué le script :

1. **Vérifiez dans Supabase Dashboard** :
   - Allez dans `Authentication` > `Policies`
   - Recherchez la table `activities`
   - Vous devriez voir la nouvelle politique "Users can update their own activities"

2. **Testez l'édition** :
   - Connectez-vous à l'application
   - Éditez une de vos activités
   - Les modifications devraient maintenant être sauvegardées

3. **Vérifiez les logs** :
   - Ouvrez la console développeur
   - Les logs devraient montrer "Update successful" au lieu d'erreurs de permission

## Améliorations apportées au code

Le code `Edit.vue` a également été amélioré avec :

- **Logs détaillés** pour faciliter le débogage
- **Gestion d'erreurs améliorée** avec codes d'erreur spécifiques  
- **Validation des données** avant envoi (tableaux vides remplacés par ['other'])
- **Message d'erreur explicite** si la politique RLS manque encore
- **Test de permissions** avant tentative de mise à jour

## Fichiers modifiés

1. `bank/shema_et_requettes/database_complete.sql` - Politique ajoutée au schéma principal
2. `bank/shema_et_requettes/add_activities_update_policy.sql` - Script de correction
3. `src/views/activities/Edit.vue` - Amélioration de la gestion des erreurs
4. `src/views/activities/Detail.vue` - Correction de l'erreur 406 avec `.maybeSingle()`

---

**Note importante** : Cette correction est nécessaire pour que les fonctionnalités d'édition des activités fonctionnent correctement. Sans cette politique, les utilisateurs ne peuvent que créer des activités mais pas les modifier.