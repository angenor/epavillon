# Guide de configuration de la base de données

## Problème identifié

L'erreur `ERROR: 42P01: relation "public.messages" does not exist` indique que la table `messages` n'existe pas dans votre base de données Supabase.

## Solution : Exécuter le script SQL complet

### Étape 1 : Accéder à l'éditeur SQL de Supabase

1. Connectez-vous à votre projet Supabase
2. Allez dans l'onglet **SQL Editor**
3. Créez une nouvelle requête

### Étape 2 : Exécuter le script de création des tables

Copiez et exécutez le contenu de `database_complete.sql` dans l'éditeur SQL de Supabase.

**⚠️ IMPORTANT :** Le script est très long (1600+ lignes). Vous devrez peut-être l'exécuter en plusieurs parties :

#### Partie 1 : Extensions et tables de base (lignes 1-600)
```sql
-- Copier les lignes 1 à 600 du fichier database_complete.sql
-- Cela inclut les extensions, countries, users, organizations, events, activities
```

#### Partie 2 : Messagerie et formations (lignes 601-1200)
```sql
-- Copier les lignes 601 à 1200
-- Cela inclut les tables messages, formations, négociations
```

#### Partie 3 : Politiques RLS et fonctions (lignes 1201-fin)
```sql
-- Copier les lignes 1201 à la fin
-- Cela inclut toutes les politiques de sécurité et fonctions
```

### Étape 3 : Vérifier la création des tables

Après l'exécution, vérifiez que la table `messages` existe :

```sql
SELECT * FROM public.messages LIMIT 1;
```

### Étape 4 : Appliquer les corrections RLS (optionnel)

Si vous avez déjà une version antérieure, vous pouvez ensuite appliquer le script de correction :

```sql
-- Contenu de fix_messages_rls.sql
DROP POLICY IF EXISTS "Users can send messages to connections" ON public.messages;

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

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE USING (sender_id = auth.uid());
```

## Structure de la table messages

La table `messages` devrait avoir cette structure (lignes 501-509 de database_complete.sql) :

```sql
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Vérification finale

Une fois toutes les tables créées, testez l'envoi de messages depuis votre application. Les erreurs devraient être résolues.

## Dépannage

Si vous continuez à avoir des erreurs :

1. **Vérifiez les permissions** : Assurez-vous d'être connecté en tant qu'administrateur de la base de données
2. **Vérifiez l'ordre d'exécution** : Les tables doivent être créées avant les politiques RLS
3. **Consultez les logs** : Regardez les logs de Supabase pour des erreurs spécifiques

Date : $(date +'%Y-%m-%d')