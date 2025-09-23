# 🔧 Résolution du problème de cache du schéma pour activity_documents

## ⚠️ Problème
L'erreur indique que la table ou les colonnes de `activity_documents` ne sont pas reconnues dans le cache du schéma Supabase.

## 🚀 Solution rapide

### Étape 1: Exécuter le script de correction
1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Créez une nouvelle requête
3. Copiez et exécutez le contenu du fichier `fix_activity_documents_table.sql`
4. Vérifiez qu'il n'y a pas d'erreurs

### Étape 2: Rafraîchir le cache du schéma
**Option A - Via l'interface Supabase (recommandé):**
1. Allez dans **Settings** → **API**
2. Trouvez la section **"PostgREST"**
3. Cliquez sur **"Reload schema cache"** ou **"Restart server"**

**Option B - Via SQL:**
```sql
-- Force le rechargement du schéma
NOTIFY pgrst, 'reload schema';

-- Alternative: Redémarrer les connexions
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
AND pid <> pg_backend_pid();
```

**Option C - Via l'API Supabase (si disponible):**
```bash
# Utiliser l'API management de Supabase
curl -X POST \
  https://api.supabase.com/v1/projects/{project-ref}/reload-schema \
  -H "Authorization: Bearer {your-service-key}"
```

### Étape 3: Vérifier la structure de la table
Exécutez cette requête pour confirmer que la table existe avec les bonnes colonnes:

```sql
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'activity_documents'
ORDER BY ordinal_position;
```

Vous devriez voir:
- `id` (uuid)
- `activity_id` (uuid)
- `types` (ARRAY/text[])
- `title` (text)
- `file_url` (text)
- `file_type` (text)
- `uploaded_by` (uuid)
- `uploaded_at` (timestamp with time zone)

## 🔍 Vérifications supplémentaires

### 1. Vérifier que la table activities existe
```sql
SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'activities'
);
```

### 2. Vérifier les foreign keys
```sql
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'activity_documents'
AND tc.constraint_type = 'FOREIGN KEY';
```

### 3. Test d'insertion manuel
```sql
-- Remplacez les UUIDs par des valeurs valides de votre base
INSERT INTO public.activity_documents (
    activity_id,
    types,
    title,
    file_url,
    file_type,
    uploaded_by,
    uploaded_at
) VALUES (
    '719b6f82-bdcc-4b77-9834-c745d2e7e739'::uuid, -- Un ID d'activité existant
    ARRAY['presentation']::text[],
    'Document Test',
    'https://example.com/test.pdf',
    'application/pdf',
    auth.uid(), -- L'utilisateur connecté
    NOW()
) RETURNING *;
```

## 🛠️ Si le problème persiste

### 1. Recréer la table (ATTENTION: Sauvegardez les données d'abord!)
```sql
-- Sauvegarder les données existantes
CREATE TABLE activity_documents_backup AS
SELECT * FROM public.activity_documents;

-- Supprimer et recréer
DROP TABLE IF EXISTS public.activity_documents CASCADE;

-- Recréer avec le script dans fix_activity_documents_table.sql

-- Restaurer les données
INSERT INTO public.activity_documents
SELECT * FROM activity_documents_backup;

-- Supprimer la backup
DROP TABLE activity_documents_backup;
```

### 2. Vérifier les logs Supabase
1. Dashboard → **Logs** → **Postgres logs**
2. Cherchez les erreurs liées à `activity_documents`

### 3. Redémarrer le projet
1. Dashboard → **Settings** → **General**
2. Cliquez sur **"Pause project"**
3. Attendez 1 minute
4. Cliquez sur **"Resume project"**

## ✅ Test final
Après toutes ces étapes, testez l'upload de document dans votre application. L'erreur devrait être résolue!