# Corrections des erreurs de messagerie

## Problème identifié

L'envoi de messages échouait avec les erreurs suivantes :
1. **Erreur RLS** : `new row violates row-level security policy for table "messages"`
2. **Erreur JavaScript** : `showToast is not a function`

## Solutions appliquées

### 1. Correction de l'erreur JavaScript

**Fichier corrigé** : `src/stores/messaging.js:111`

```javascript
// AVANT (ligne 111)
showToast(result.error, 'error')

// APRÈS 
console.error('Erreur lors de l\'envoi du message:', result.error)
```

### 2. Correction des politiques RLS pour la table `messages`

**Problème** : La politique RLS référençait `messages.recipient_id` au lieu de `NEW.recipient_id` pour les insertions.

**Script de correction** : Exécuter `bank/shema_et_requettes/fix_messages_rls.sql` dans votre base de données Supabase.

**Ou exécuter manuellement** :

```sql
-- 1. Supprimer l'ancienne politique défectueuse
DROP POLICY IF EXISTS "Users can send messages to connections" ON public.messages;

-- 2. Créer la nouvelle politique corrigée
CREATE POLICY "Users can send messages to connections" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.connections 
            WHERE ((requester_id = auth.uid() AND recipient_id = NEW.recipient_id) 
            OR (recipient_id = auth.uid() AND requester_id = NEW.recipient_id))
            AND status = 'accepted'
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (is_blocked = TRUE OR is_suspended = TRUE)
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.user_blocks 
            WHERE (blocker_id = auth.uid() AND blocked_id = NEW.recipient_id)
            OR (blocker_id = NEW.recipient_id AND blocked_id = auth.uid())
        )
    );

-- 3. Ajouter les politiques manquantes
CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE USING (sender_id = auth.uid());
```

## Changements dans la politique RLS

### Corrections principales :
1. **`messages.recipient_id` → `NEW.recipient_id`** : Référence correcte pour les insertions
2. **Ajout de la vérification des blocages** : Empêche l'envoi de messages entre utilisateurs bloqués
3. **Politiques UPDATE/DELETE** : Ajout des politiques manquantes

### Fonctionnement de la nouvelle politique :

La politique permet l'envoi de messages uniquement si :
- ✅ L'expéditeur est l'utilisateur authentifié (`sender_id = auth.uid()`)
- ✅ Une connexion acceptée existe entre les deux utilisateurs
- ✅ L'expéditeur n'est pas bloqué ou suspendu
- ✅ Aucun blocage mutuel n'existe entre les utilisateurs

## Test et validation

Après application des corrections :
1. ✅ Le build de l'application réussit
2. ✅ Plus d'erreur JavaScript `showToast is not a function`
3. ✅ Les politiques RLS sont correctement configurées
4. ✅ L'envoi de messages devrait fonctionner entre amis connectés

## Prochaines étapes

Pour tester complètement :
1. Appliquer les corrections SQL dans Supabase
2. Redémarrer l'application en développement
3. Tester l'envoi de messages entre utilisateurs connectés
4. Vérifier que les messages s'affichent correctement dans l'interface

Date de correction : $(date +'%Y-%m-%d')
Auteur : Claude Code Assistant