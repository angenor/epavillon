# Déploiement de l'intégration Zoom

## ✅ Changement important : Utilisation de UTC

**IMPORTANT** : Le système a été modifié pour utiliser directement l'heure UTC stockée en base de données, sans conversion vers le fuseau horaire de l'événement.

### Pourquoi UTC ?

Les dates en base de données PostgreSQL (type `TIMESTAMPTZ`) sont déjà stockées en UTC et représentent le bon moment dans le temps. Par exemple :

- **Activité à 14:00 heure de Paris**
  - Stocké en base : `2025-11-15T13:00:00.000Z` (13:00 UTC)
  - Envoyé à Zoom : `2025-11-15T13:00:00` avec `timezone="UTC"`
  - Résultat : Zoom stocke la réunion à 13:00 UTC, ce qui correspond bien à 14:00 heure de Paris

### Avantages de cette approche

✅ **Pas de conversion double** : Les dates sont déjà correctement stockées en UTC
✅ **Simplicité** : Pas besoin de convertir vers le timezone local puis retour
✅ **Cohérence** : Une seule source de vérité (UTC)
✅ **Affichage adaptatif** : Chaque utilisateur Zoom verra l'heure dans son fuseau local

## 📦 Étapes de déploiement

### 1. Configurer les secrets Zoom

Si ce n'est pas déjà fait, configurez les secrets Supabase :

```bash
# Via la CLI Supabase
npx supabase secrets set ZOOM_ACCOUNT_ID="votre_account_id"
npx supabase secrets set ZOOM_CLIENT_ID="votre_client_id"
npx supabase secrets set ZOOM_CLIENT_SECRET="votre_client_secret"
npx supabase secrets set ZOOM_USER_ID="me"
```

Ou via le Dashboard Supabase :
1. Allez dans **Project Settings** > **Edge Functions**
2. Ajoutez les secrets ci-dessus

### 2. Déployer l'Edge Function

```bash
# Déployer uniquement la fonction Zoom
npx supabase functions deploy create-zoom-meeting

# Ou déployer toutes les fonctions
npx supabase functions deploy
```

### 3. Vérifier le déploiement

Consultez les logs pour vérifier que la fonction est bien déployée :

```bash
npx supabase functions list
```

Vous devriez voir `create-zoom-meeting` dans la liste.

## 🧪 Tester l'intégration

### Test 1 : Créer une activité et l'approuver

1. Créez une nouvelle activité via l'interface utilisateur
2. Assurez-vous de sélectionner un événement avec un `timezone` défini
3. Renseignez les dates et heures de l'activité
4. Soumettez l'activité

5. Connectez-vous en tant qu'administrateur
6. Approuvez l'activité en changeant son statut à "Approuvée"
7. Un message devrait apparaître confirmant la création de la réunion Zoom

### Test 2 : Vérifier dans Zoom

1. Connectez-vous sur [zoom.us](https://zoom.us)
2. Allez dans **Meetings** > **Scheduled**
3. Trouvez la réunion créée
4. **Vérifiez l'heure** : Elle devrait être en UTC

**Exemple** :
- Si l'activité est prévue pour 14:00 heure de Paris
- La réunion Zoom affichera 13:00 UTC
- Les utilisateurs en Europe/Paris verront 14:00 dans leur interface Zoom

### Test 3 : Consulter les logs

```bash
# Suivre les logs en temps réel
npx supabase functions logs create-zoom-meeting --tail

# Ou consulter les logs récents
npx supabase functions logs create-zoom-meeting
```

Cherchez les émojis pour identifier les étapes :
- 🕐 = Formatage de la date (devrait montrer l'heure UTC sans conversion)
- ✅ = Résultat du formatage (devrait être identique à l'heure stockée en base)
- 📊 = Détails de la réunion
- 📤 = Requête envoyée à Zoom (timezone devrait être "UTC")
- 📝 = Corps complet de la requête

### Test 4 : Vérifier en base de données

```sql
SELECT
  a.id,
  a.title,
  a.proposed_start_date,
  a.final_start_date,
  e.timezone as event_timezone,
  zm.meeting_id,
  zm.join_url,
  zm.created_at
FROM activities a
LEFT JOIN events e ON a.event_id = e.id
LEFT JOIN zoom_meetings zm ON a.zoom_meeting_id = zm.id
WHERE a.validation_status = 'approved'
  AND zm.meeting_id IS NOT NULL
ORDER BY a.created_at DESC
LIMIT 5;
```

Vérifiez que :
- `proposed_start_date` ou `final_start_date` est en UTC (avec `+00` ou `Z`)
- `meeting_id` n'est pas NULL
- `join_url` contient un lien valide Zoom

## 📊 Exemple de logs attendus

Après avoir approuvé une activité, vous devriez voir :

```
🕐 Formatting date for Zoom (UTC): {
  input_date: "2025-11-15T13:00:00.000Z",
  input_date_utc: "2025-11-15T13:00:00.000Z",
  timestamp_ms: 1731675600000
}

✅ Formatted date for Zoom (UTC): {
  output_date: "2025-11-15T13:00:00",
  timezone: "UTC",
  components: { year: "2025", month: "11", day: "15", hour: "13", minute: "00", second: "00" }
}

📊 Meeting details: {
  title: "Mon activité",
  event_title: "COP30",
  event_year: "2025",
  event_timezone: "Europe/Paris",
  start_date_utc: "2025-11-15T13:00:00.000Z",
  end_date_utc: "2025-11-15T15:00:00.000Z",
  duration_minutes: 120,
  note: "Using UTC timezone for Zoom meeting (dates are already in UTC)"
}

📤 Zoom API Request: {
  endpoint: "https://api.zoom.us/v2/users/me/meetings",
  topic: "Mon activité",
  start_time: "2025-11-15T13:00:00",
  duration: 120,
  timezone: "UTC",
  agenda_length: 150
}

Zoom meeting created successfully: 123456789
```

**Point important** : Notez que `start_time` (13:00) est identique à `start_date_utc` (13:00), sans conversion.

## ❌ Dépannage

### Problème : L'heure est toujours incorrecte

**Vérifiez** :
1. Les logs de l'Edge Function (ci-dessus)
2. L'heure stockée en base de données (`proposed_start_date`)
3. Le timezone de l'événement (`events.timezone`)

**Si l'heure en base est incorrecte** :
- Le problème vient de la création de l'activité (Create.vue)
- Vérifiez la fonction `buildDateTime` dans Create.vue

**Si les logs montrent une conversion** :
- Vérifiez que vous avez bien déployé la dernière version
- L'output devrait montrer `timezone: "UTC"` et non le timezone de l'événement

### Problème : L'API Zoom retourne une erreur

**Erreur 400 - Invalid timezone** :
- Vérifiez que "UTC" est bien envoyé comme timezone
- Consultez les logs complets (`📝 Full request body`)

**Erreur 401 - Unauthorized** :
- Vérifiez que les secrets Zoom sont bien configurés
- Vérifiez que l'application Zoom est activée

**Erreur 404 - User not found** :
- Vérifiez la valeur de `ZOOM_USER_ID`
- Utilisez "me" ou un email valide du compte Zoom

### Problème : La réunion est créée mais pas liée à l'activité

**Symptôme** : `zoom_meeting_id` est NULL dans la table `activities`

**Solution** :
1. Vérifiez les logs pour voir si l'insertion dans `zoom_meetings` a réussi
2. Vérifiez les permissions RLS sur la table `zoom_meetings`
3. Exécutez le script SQL : `bank/shema_et_requettes/zoom_setup.sql`

## 📚 Documentation

- **Guide complet** : [bank/zoom-integration-guide.md](bank/zoom-integration-guide.md)
- **Guide de débogage** : [bank/timezone-debugging-guide.md](bank/timezone-debugging-guide.md)
- **Script SQL** : [bank/shema_et_requettes/zoom_setup.sql](bank/shema_et_requettes/zoom_setup.sql)

## 🎯 Résumé

✅ **Edge Function créée** : `create-zoom-meeting`
✅ **Composable créé** : `src/composables/zoom/useZoomMeeting.js`
✅ **Intégration dans ActivityDetail.vue** : Création automatique lors de l'approbation
✅ **Timezone** : Utilisation de UTC (pas de conversion)
✅ **Logs détaillés** : Pour faciliter le débogage
✅ **Documentation complète** : Guides et scripts SQL

## 🚀 Prêt à déployer !

```bash
# 1. Déployer
npx supabase functions deploy create-zoom-meeting

# 2. Tester
# Approuver une activité depuis l'interface admin

# 3. Vérifier les logs
npx supabase functions logs create-zoom-meeting --tail

# 4. Consulter dans Zoom
# https://zoom.us > Meetings > Scheduled
```

---

**Date** : 2025-10-25
**Version** : 2.0.0 (UTC)
