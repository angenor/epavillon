# Instructions pour configurer le bucket "documents" dans Supabase

## ⚠️ SOLUTION IMMÉDIATE - Désactiver RLS

C'est la solution la plus simple et la plus rapide pour résoudre l'erreur "new row violates row-level security policy".

### 📍 Étapes à suivre:

1. **Connectez-vous à votre dashboard Supabase**
   - https://app.supabase.com

2. **Allez dans Storage**
   - Dans le menu de gauche, cliquez sur **Storage**

3. **Créez le bucket "documents" si nécessaire**
   - Si le bucket n'existe pas:
     - Cliquez sur **"New bucket"**
     - Name: `documents`
     - ✅ Cochez **"Public bucket"**
     - Cliquez sur **"Save"**

4. **Désactivez RLS sur le bucket**
   - Trouvez le bucket **"documents"** dans la liste
   - Cliquez sur les **3 points** (⋮) à droite
   - Cliquez sur **"Policies"**
   - **IMPORTANT**: Désactivez le toggle **"RLS enabled"** (il doit être gris/OFF)
   - Si une popup apparaît, confirmez la désactivation

5. **Vérifiez la configuration**
   - Le bucket doit avoir:
     - Badge **"Public"** visible
     - Pas de badge **"RLS"** (ou badge gris si RLS est désactivé)

## ✅ Test rapide
Après ces changements, testez immédiatement l'upload de document dans votre application.

---

## 🔒 Configuration avec politiques RLS (plus sécurisé)

Si vous préférez garder RLS activé mais avec des permissions flexibles:

### Étape 1: Exécuter le script SQL
1. Allez dans **SQL Editor** dans Supabase
2. Créez une nouvelle requête
3. Copiez et collez le contenu du fichier `configure_documents_bucket.sql`
4. Exécutez la requête

### Étape 2: Vérifier les politiques
1. Retournez dans **Storage > documents > Policies**
2. Vous devriez voir 4 politiques:
   - Public Access - Read documents
   - Authenticated users can upload documents
   - Authenticated users can update documents
   - Authenticated users can delete documents

---

## 🛠️ Configuration manuelle via l'interface

Si vous préférez créer les politiques manuellement:

### 1. Supprimer les anciennes politiques
Storage > documents > Policies > Supprimer toutes les politiques existantes

### 2. Créer la politique de lecture (SELECT)
- **Name**: Public Read Access
- **Policy**: SELECT
- **Target roles**: public
- **WITH CHECK expression**: `bucket_id = 'documents'`

### 3. Créer la politique d'upload (INSERT)
- **Name**: Authenticated Upload
- **Policy**: INSERT
- **Target roles**: authenticated
- **WITH CHECK expression**: `bucket_id = 'documents'`

### 4. Créer la politique de mise à jour (UPDATE)
- **Name**: Authenticated Update
- **Policy**: UPDATE
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'documents'`
- **WITH CHECK expression**: `bucket_id = 'documents'`

### 5. Créer la politique de suppression (DELETE)
- **Name**: Authenticated Delete
- **Policy**: DELETE
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'documents'`

---

## 🎯 Structure des fichiers dans le bucket

Les documents seront organisés ainsi:
```
documents/
├── activities_document/
    ├── {activity-id}/
        ├── {timestamp}_{filename}.pdf
        ├── {timestamp}_{filename}.docx
        └── ...
```

---

## ⚠️ Dépannage

### Erreur "new row violates row-level security policy"
→ RLS est activé avec des politiques restrictives. Suivez l'Étape 2 de la configuration rapide.

### Erreur "Bucket not found"
→ Le bucket "documents" n'existe pas. Créez-le:
1. Storage > New bucket
2. Name: `documents`
3. Public bucket: ✅ Coché
4. Create

### Les fichiers ne s'affichent pas
→ Vérifiez que le bucket est bien public (voir Étape 3 de la configuration rapide)

---

## 🔄 Retour au bucket "epavillonp" (si nécessaire)

Si vous voulez revenir au bucket "epavillonp", modifiez simplement:
- `/src/composables/useUserActivities.js`
- Remplacez `from('documents')` par `from('epavillonp')` aux lignes 265 et 271
- Remplacez `/object/public/documents/` par `/object/public/epavillonp/` ligne 312
- Remplacez `from('documents')` par `from('epavillonp')` ligne 316