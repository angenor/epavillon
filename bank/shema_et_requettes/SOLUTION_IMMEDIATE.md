# 🚨 SOLUTION IMMÉDIATE - Ajouter la colonne 'types'

## ⚡ Étapes à suivre MAINTENANT:

### 1️⃣ Ouvrir Supabase SQL Editor
- Connectez-vous à votre dashboard Supabase
- Cliquez sur **SQL Editor** dans le menu de gauche

### 2️⃣ Exécuter ce code SQL
Copiez et collez ce code, puis cliquez sur **RUN**:

```sql
-- Ajouter la colonne 'types' à activity_documents
ALTER TABLE public.activity_documents
ADD COLUMN IF NOT EXISTS types TEXT[];

-- Rafraîchir le cache
NOTIFY pgrst, 'reload schema';
```

### 3️⃣ Rafraîchir le cache (IMPORTANT!)
**Option A - Le plus rapide:**
- Dans le dashboard Supabase
- Allez dans **Settings** → **API**
- Cliquez sur **"Restart Server"** ou **"Reload Schema"**

**Option B - Alternative:**
- Patientez 1-2 minutes que le cache se rafraîchisse automatiquement
- OU redémarrez votre application

### 4️⃣ Tester immédiatement
- Retournez dans votre application
- Essayez d'uploader un document
- Ça devrait fonctionner!

---

## 🔍 Vérification (optionnel)

Pour confirmer que la colonne existe, exécutez:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'activity_documents'
AND column_name = 'types';
```

Vous devriez voir:
```
column_name | data_type
types       | ARRAY
```

---

## ❓ Si ça ne fonctionne toujours pas

### Solution alternative - Enlever temporairement le champ 'types'

Si vous voulez une solution de contournement rapide, modifiez temporairement le code JavaScript:

**Dans `/src/composables/useUserActivities.js` ligne 283-285:**

```javascript
// COMMENTEZ ces lignes temporairement
// if (types && Array.isArray(types) && types.length > 0) {
//   insertData.types = types
// }
```

Cela permettra l'upload sans le champ 'types' en attendant que la colonne soit ajoutée.