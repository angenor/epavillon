# Quickstart — Inscription PACO non bloquante avec récupération des échecs

**Feature** : `005-paco-registration-fallback`
**Date** : 2026-04-10
**Public** : développeur qui implémente ou review la feature, QA qui valide les scénarios.

---

## Objectif de ce document

Permettre de valider manuellement en moins de 20 minutes que le comportement « inscription non bloquante » fonctionne de bout en bout : du remplissage du formulaire jusqu'à la récupération admin et au rattrapage, en simulant un échec technique.

---

## Prérequis

1. Base Supabase locale ou de staging avec la migration `005_paco_registration_fallback.sql` appliquée.
2. La RPC `register_paco_fallback` déployée (`bank/shema_et_requettes/rpc_register_paco_fallback.sql`).
3. La RPC `register_paco_quick` **mise à jour** avec la logique de promotion (`bank/shema_et_requettes/rpc_register_paco_quick.sql`).
4. L'environnement frontend lancé :

   ```bash
   npm run dev
   ```

5. Un compte admin PACO authentifié dans un second onglet pour tester la page `/paco/admin`.

---

## Scénario 1 — Utilisateur bloqué aujourd'hui, sauvé par le fallback (User Story 1)

### Étape 1.1 — Simuler l'échec de la RPC standard

Dans le navigateur, ouvrir les DevTools et coller dans la console :

```javascript
// Intercepter l'appel RPC register_paco_quick et forcer une erreur
window.__originalFetch = window.__originalFetch || window.fetch
window.fetch = async (url, opts) => {
  if (typeof url === 'string' && url.includes('register_paco_quick')) {
    console.warn('[QA] Simulated failure of register_paco_quick')
    return new Response(JSON.stringify({ code: '42P01', message: 'Simulated WAF block' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return window.__originalFetch(url, opts)
}
```

### Étape 1.2 — Remplir le formulaire

1. Naviguer vers `http://localhost:5173/paco` (ou l'URL équivalente).
2. Choisir la session en cours (session 2 par défaut).
3. Remplir le formulaire d'inscription rapide avec des données valides.
4. Cliquer sur « S'inscrire ».

### Étape 1.3 — Observations attendues

✅ L'écran de succès s'affiche **immédiatement**, avec le bouton « Rejoindre le webinaire ».
✅ **Aucun message d'erreur** visible.
✅ Le bouton redirige bien vers le lien Teams lorsqu'il est cliqué.

Dans la console, un `console.warn` indique :
```
[PACO] Registration completed via fallback path: fallback
```

### Étape 1.4 — Vérifier en base

Dans Supabase Studio (SQL editor) :

```sql
SELECT id, guest_email, fallback_payload IS NOT NULL AS is_fallback,
       fallback_error, recovered_at, registration_date
  FROM activity_registrations
 WHERE activity_id = '00000000-0000-4000-a000-00000000a002'
   AND guest_email = '<email utilisé>'
   AND session_edition = 2;
```

Attendu :
- 1 ligne retournée
- `is_fallback = true`
- `fallback_error` contient « Simulated WAF block » (ou un message équivalent)
- `recovered_at IS NULL`

Et dans le JSON :

```sql
SELECT fallback_payload->'demographic' AS demographic
  FROM activity_registrations
 WHERE guest_email = '<email utilisé>';
```

Attendu : JSON contenant `gender`, `ageProfile`, `city`, `professionalStatus`, etc. correspondant au formulaire saisi.

### Étape 1.5 — Restaurer le fetch normal

```javascript
window.fetch = window.__originalFetch
delete window.__originalFetch
```

---

## Scénario 2 — Resoumission après vidage du cache (Edge Case)

### Étape 2.1 — Vider le localStorage

```javascript
Object.keys(localStorage).filter(k => k.startsWith('paco_')).forEach(k => localStorage.removeItem(k))
location.reload()
```

### Étape 2.2 — Resoumettre le même email

Retourner sur `/paco`, remplir le formulaire **avec le même email** que Scénario 1. Le fetch n'est **plus** intercepté, donc la RPC standard va tenter l'insertion.

### Étape 2.3 — Observations attendues

✅ La promotion s'opère : la ligne de secours est convertie en inscription standard :
- `fallback_payload = NULL`
- `fallback_error = NULL`
- `paco_demographic_data` a maintenant une ligne
- `registration_date` préservé
- L'utilisateur voit l'écran de succès normal

Vérifier en base :

```sql
SELECT fallback_payload IS NULL AS promoted,
       (SELECT COUNT(*) FROM paco_demographic_data WHERE registration_id = ar.id) AS demo_count
  FROM activity_registrations ar
 WHERE guest_email = '<email>';
```

Attendu : `promoted = true`, `demo_count = 1`.

---

## Scénario 3 — Protection anti-dégradation

### Étape 3.1 — Inscription standard réussie au premier coup

Utiliser un **nouvel** email, remplir le formulaire sans intercepter le fetch. La RPC standard réussit.

### Étape 3.2 — Forcer une tentative de fallback

Ouvrir la console et simuler directement un appel à la RPC fallback :

```javascript
const { data, error } = await window.supabase.rpc('register_paco_fallback', {
  p_email: '<email utilisé>',
  p_session_edition: 2,
  p_fallback_payload: { firstName: 'Test', lastName: 'Test', email: '<email>' },
  p_error_message: 'Simulated post-hoc fallback call'
})
console.log({ data, error })
```

### Étape 3.3 — Observations attendues

✅ `data` = UUID de la ligne existante.
✅ `error` = null.
✅ En base, `fallback_payload IS NULL` (inchangé) — la ligne standard n'a **pas** été dégradée.

```sql
SELECT fallback_payload, fallback_error
  FROM activity_registrations
 WHERE guest_email = '<email>';
```

Attendu : les deux colonnes restent NULL.

---

## Scénario 4 — Côté admin : consulter et rattraper un secours

### Étape 4.1 — Naviguer vers `/paco/admin`

Créer à nouveau une inscription de secours (reprendre Scénario 1 avec un autre email).

Naviguer vers `/paco/admin` en tant qu'admin authentifié.

### Étape 4.2 — Observations attendues

✅ Les **cartes stats** affichent :
- « Total inscrits » incluant l'inscription de secours
- Nouvelle carte « Inscriptions de secours » = 1
- « À rattraper » = 1, « Rattrapées » = 0

✅ La **table des inscrits** affiche un **badge orange « Secours »** sur la ligne correspondante.

✅ Un bouton icône « Détails » ouvre une modale contenant :
- Le JSON du formulaire (pretty-printed)
- Le message d'erreur d'origine
- Un bouton « Marquer comme rattrapée »

### Étape 4.3 — Rattraper

Cliquer sur « Marquer comme rattrapée ». Confirmer.

✅ Le badge passe en vert « Rattrapée ».
✅ Les stats : « Rattrapées » = 1, « À rattraper » = 0.
✅ En base :

```sql
SELECT recovered_at, fallback_payload IS NOT NULL AS still_has_payload
  FROM activity_registrations
 WHERE guest_email = '<email>';
```

Attendu : `recovered_at` non NULL, `still_has_payload = true` (le payload est **préservé** pour audit).

### Étape 4.4 — Export CSV

Cliquer sur « Exporter CSV ». Ouvrir le fichier téléchargé.

✅ Le fichier contient :
- Une colonne `type` avec `standard` ou `fallback`
- Une colonne `fallback_error`
- Une colonne `recovered_at`
- Une colonne `fallback_payload_json` avec le JSON sérialisé pour les lignes de secours

---

## Scénario 5 — Double échec (localStorage-only)

### Étape 5.1 — Intercepter les deux RPC

```javascript
window.__originalFetch = window.__originalFetch || window.fetch
window.fetch = async (url, opts) => {
  if (typeof url === 'string' && (url.includes('register_paco_quick') || url.includes('register_paco_fallback'))) {
    return new Response(JSON.stringify({ message: 'Total outage' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return window.__originalFetch(url, opts)
}
```

### Étape 5.2 — Soumettre le formulaire

### Étape 5.3 — Observations attendues

✅ L'utilisateur voit toujours l'écran de succès et le bouton « Rejoindre ».
✅ `console.error` affiche « PACO fallback double failure: … ».
✅ `localStorage.getItem('paco_registered_session_2') === '1'`.
✅ `localStorage.getItem('paco_registration_data_session_2')` contient un JSON avec `registrationId: null`.
✅ Aucune ligne n'a été créée en base pour cet utilisateur (attendu : rattrapage manuel via support).

### Étape 5.4 — Vérifier la persistance

Rafraîchir la page. L'utilisateur doit toujours voir le bouton « Rejoindre » (état restauré depuis localStorage).

---

## Critères d'acceptation globaux (mapping Success Criteria)

| Success Criterion | Scénario |
|---|---|
| SC-001 — 100 % accès au bouton malgré l'échec | Scénario 1, 5 |
| SC-002 — 0 inscription perdue (trace DB ou localStorage) | Scénario 1 (DB), Scénario 5 (local) |
| SC-003 — Compteur exact sans double comptage | Scénario 2 (promotion) |
| SC-004 — Payload JSON complet + erreur | Scénario 1 étape 1.4, Scénario 4 étape 4.2 |
| SC-005 — Aucun message d'erreur visible | Scénarios 1 et 5 |
| SC-006 — Accès retour < 2s | Scénario 2 |

---

## Nettoyage après validation

```sql
DELETE FROM activity_registrations
 WHERE activity_id = '00000000-0000-4000-a000-00000000a002'
   AND guest_email LIKE '%test%'; -- ajuster le filtre selon vos emails de test
```

```javascript
Object.keys(localStorage).filter(k => k.startsWith('paco_')).forEach(k => localStorage.removeItem(k))
window.fetch = window.__originalFetch
```

---

## Troubleshooting

| Symptôme | Cause probable | Action |
|---|---|---|
| Le bouton « Rejoindre » n'apparaît pas en cas d'échec | Le composable n'a pas été refactoré pour utiliser `registerPacoWithFallback` | Vérifier `PacoQuickRegister.vue` |
| L'UPSERT ne promeut pas la ligne | La clause `WHERE fallback_payload IS NOT NULL` manque dans la RPC modifiée | Re-déployer `rpc_register_paco_quick.sql` |
| Le badge « Secours » n'apparaît pas | `fetchPacoRegistrants` ne retourne pas `fallback_payload` dans le select | Vérifier `usePacoStats.js` |
| `markRegistrationRecovered` échoue avec RLS | Politique UPDATE absente sur `activity_registrations` pour admins | Ajouter la policy ou assouplir la condition (voir §7 de data-model.md) |
