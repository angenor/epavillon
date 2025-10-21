# 🔧 Dépannage du Chatbot - Textarea Désactivé

## Symptôme

Le textarea du chatbot est grisé (désactivé) et affiche un message :
> ⚠️ **Aucune session active**
> Veuillez créer une nouvelle conversation en cliquant sur le bouton '+' dans la barre latérale.

## Causes Possibles et Solutions

### ✅ Étape 1 : Vérifier la Console du Navigateur

1. Ouvrir les DevTools : `F12` ou `Cmd+Option+I` (Mac)
2. Aller dans l'onglet **Console**
3. Chercher des erreurs en rouge

#### Erreurs courantes :

**A) Erreur : `relation "ai_chat_sessions" does not exist`**
```
Error: relation "public.ai_chat_sessions" does not exist
```

**Solution** : Les tables Supabase n'ont pas été créées.

```bash
# 1. Connectez-vous à Supabase : https://supabase.com/dashboard
# 2. Sélectionnez votre projet
# 3. Allez dans "SQL Editor"
# 4. Collez et exécutez le contenu du fichier :
bank/shema_et_requettes/chatbot_ia_schema.sql
```

---

**B) Erreur : `User not authenticated`**
```
Error: User not authenticated
```

**Solution** : Vous n'êtes pas connecté.

1. Connectez-vous à l'application
2. Assurez-vous que votre compte a le rôle `negotiator`, `admin` ou `super_admin`

---

**C) Erreur : `Insert into "ai_chat_sessions" failed`**
```
Error: duplicate key value violates unique constraint
```

**Solution** : Problème de permission ou de contrainte dans Supabase.

1. Vérifiez les RLS (Row Level Security) policies dans Supabase
2. Assurez-vous que l'utilisateur a les permissions d'insertion

---

### ✅ Étape 2 : Vérifier que les Tables Existent

1. Allez dans Supabase Dashboard
2. Allez dans "Table Editor"
3. Vérifiez que ces tables existent :
   - ✅ `ai_chat_sessions`
   - ✅ `ai_chat_messages`
   - ✅ `document_embeddings`
   - ✅ `ai_chat_feedback`

**Si elles n'existent pas** : Exécutez le fichier SQL ci-dessus.

---

### ✅ Étape 3 : Vérifier les Permissions Utilisateur

1. Ouvrez la console du navigateur
2. Tapez :
```javascript
// Dans la console du navigateur
localStorage.getItem('sb-<votre-projet-id>-auth-token')
```

3. Si vous obtenez `null`, vous n'êtes pas connecté

**Solution** : Reconnectez-vous

---

### ✅ Étape 4 : Tester Manuellement la Création de Session

1. Ouvrez la console du navigateur
2. Allez sur `/ai/chatbot`
3. Dans la console, tapez :

```javascript
// Test de création de session manuelle
const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(
  'VOTRE_SUPABASE_URL',
  'VOTRE_SUPABASE_ANON_KEY'
)

const { data, error } = await supabase
  .from('ai_chat_sessions')
  .insert({
    user_id: 'VOTRE_USER_ID',
    title: 'Test Session',
    feature_type: 'negotiation_documents',
    is_active: true
  })
  .select()
  .single()

console.log('Result:', { data, error })
```

4. Si `error` est `null` et `data` contient la session, le problème vient du code
5. Si `error` existe, c'est un problème Supabase (permissions, tables, etc.)

---

### ✅ Étape 5 : Vérifier les Row Level Security (RLS) Policies

Dans Supabase SQL Editor, exécutez :

```sql
-- Vérifier si RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'ai_chat_sessions';

-- Si rowsecurity = true, vérifier les policies
SELECT * FROM pg_policies
WHERE tablename = 'ai_chat_sessions';
```

**Si RLS est activé sans policies appropriées**, créez-les :

```sql
-- Policy pour permettre aux utilisateurs de créer leurs propres sessions
CREATE POLICY "Users can create their own sessions"
ON ai_chat_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre aux utilisateurs de voir leurs propres sessions
CREATE POLICY "Users can view their own sessions"
ON ai_chat_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

---

### ✅ Étape 6 : Vérifier le Code (Dev Mode)

Si vous êtes en développement, vérifiez :

1. **Le composable s'initialise** :
```javascript
// Dans src/views/ai/NegotiationChatbot.vue
console.log('Has access:', hasAccess.value)
console.log('Sessions loaded:', sessions.value)
console.log('Current session:', currentSession.value)
```

2. **La création automatique fonctionne** :
```javascript
// Dans src/views/ai/NegotiationChatbot.vue, onMounted
console.log('Creating new session...')
const session = await handleNewSession()
console.log('Session created:', session)
```

---

## 🚀 Solution Rapide (Quick Fix)

Si vous voulez juste tester rapidement :

1. **Créer les tables Supabase** (une seule fois)
   ```sql
   -- Exécutez bank/shema_et_requettes/chatbot_ia_schema.sql dans Supabase SQL Editor
   ```

2. **Rafraîchir la page**
   ```
   Cmd+R (Mac) ou Ctrl+R (Windows)
   ```

3. **Cliquer sur le bouton `+` dans la sidebar**
   - Cela devrait créer manuellement une nouvelle session

---

## 📊 Checklist de Diagnostic

- [ ] Je suis connecté avec un compte ayant le rôle approprié
- [ ] Les tables Supabase existent (`ai_chat_sessions`, etc.)
- [ ] Aucune erreur dans la console du navigateur
- [ ] Les RLS policies permettent l'insertion
- [ ] L'URL Supabase et la clé anon sont configurées dans `.env.local`
- [ ] J'ai rafraîchi la page après avoir créé les tables

---

## 💡 Encore Bloqué ?

Si le problème persiste après avoir vérifié tous ces points :

1. **Vérifier les logs Supabase** :
   - Dashboard Supabase > Logs
   - Chercher les erreurs récentes

2. **Vérifier le Network** :
   - DevTools > Network
   - Filtrer par "supabase"
   - Vérifier les requêtes qui échouent

3. **Partager les erreurs** :
   - Copier les erreurs de la console
   - Copier les erreurs des logs Supabase
   - Vérifier la configuration `.env.local`

---

## ✅ Solution Définitive

**Pour éviter ce problème à l'avenir** :

1. Créer les tables Supabase AVANT d'accéder au chatbot
2. Configurer les RLS policies appropriées
3. Tester avec un compte ayant les bons rôles

**Fichiers importants** :
- Tables SQL : `bank/shema_et_requettes/chatbot_ia_schema.sql`
- Documentation : `bank/a_faire/README_ARCHITECTURE_CHATBOT.md`
- Configuration API : `bank/a_faire/CONFIG_CLES_API.md`
