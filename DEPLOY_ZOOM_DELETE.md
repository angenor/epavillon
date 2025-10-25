# 🚀 Déploiement de la fonction delete-zoom-meeting

## Étape 1 : Vérifier que vous êtes connecté à Supabase

```bash
npx supabase login
```

Si vous n'êtes pas connecté, suivez les instructions pour vous authentifier.

## Étape 2 : Lier votre projet (si ce n'est pas déjà fait)

```bash
npx supabase link --project-ref <votre-project-ref>
```

Pour trouver votre `project-ref` :
1. Allez sur https://supabase.com/dashboard
2. Ouvrez votre projet
3. Allez dans **Project Settings** > **General**
4. Copiez le **Reference ID**

## Étape 3 : Déployer la fonction

```bash
# Déployer uniquement delete-zoom-meeting
npx supabase functions deploy delete-zoom-meeting

# OU déployer toutes les fonctions en une fois
npx supabase functions deploy
```

## Étape 4 : Vérifier le déploiement

```bash
npx supabase functions list
```

Vous devriez voir `delete-zoom-meeting` dans la liste.

## Étape 5 : Tester la fonction

Une fois déployée, testez en :

1. Ouvrant votre application
2. Approuvant une activité (crée une réunion Zoom)
3. Annulant cette activité (supprime la réunion Zoom)
4. Vérifiant les logs dans la console

## 📊 Vérifier les logs

Pour voir les logs de la fonction en temps réel :

```bash
npx supabase functions logs delete-zoom-meeting --follow
```

Ou dans le Dashboard Supabase :
**Edge Functions** > **delete-zoom-meeting** > **Logs**

## ✅ Logs attendus en cas de succès

```
delete-zoom-meeting function started
Environment check: { hasZoomAccountId: true, hasZoomClientId: true, ... }
Fetching activity and Zoom meeting data...
📊 Meeting deletion details: { activity_id: ..., zoom_meeting_id: ... }
🔑 Getting Zoom access token...
✅ Zoom access token obtained successfully
🗑️ Deleting Zoom meeting...
📤 Zoom API Delete Request: { endpoint: ..., meeting_id: ... }
✅ Zoom meeting deleted successfully: [meeting_id]
💾 Deleting Zoom meeting from database...
✅ Zoom meeting deleted from database
📝 Updating activity to remove Zoom meeting reference...
✅ Activity updated successfully
🎉 Zoom meeting deletion completed successfully
```

## ⚠️ Problèmes courants

### Erreur : "Zoom credentials not configured"

**Solution** : Vérifiez que les secrets sont configurés :

```bash
# Lister les secrets
npx supabase secrets list

# Si manquants, les ajouter
npx supabase secrets set ZOOM_ACCOUNT_ID="votre_valeur"
npx supabase secrets set ZOOM_CLIENT_ID="votre_valeur"
npx supabase secrets set ZOOM_CLIENT_SECRET="votre_valeur"
```

### Erreur : "Activity not found"

**Cause** : L'ID de l'activité est incorrect ou n'existe pas.

**Solution** : Vérifiez l'ID de l'activité dans la base de données.

### Erreur : "Activity has no Zoom meeting to delete"

**Cause** : L'activité n'a pas de réunion Zoom associée.

**Solution** : C'est normal si l'activité n'a jamais été approuvée. Aucune action requise.

### Erreur : "Failed to delete Zoom meeting: 404"

**Cause** : La réunion a déjà été supprimée sur Zoom.

**Solution** : C'est considéré comme un succès. La fonction nettoiera la base de données.

## 🔄 Redéployer après modifications

Si vous modifiez le code de la fonction :

```bash
npx supabase functions deploy delete-zoom-meeting
```

Les changements seront appliqués immédiatement.

## 🧪 Test manuel via curl

Pour tester la fonction directement :

```bash
# Remplacez les valeurs entre <>
curl -i --location --request POST 'https://<votre-project-ref>.supabase.co/functions/v1/delete-zoom-meeting' \
  --header 'Authorization: Bearer <votre-anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"activity_id":"<uuid-activite>"}'
```

## ✨ C'est fait !

Votre fonction `delete-zoom-meeting` est maintenant déployée et prête à l'emploi !

Lorsqu'une activité est annulée ou rejetée, la réunion Zoom sera automatiquement supprimée.
