# Contract — Composable `usePacoRegistration.js` (API publique étendue)

**Feature** : `005-paco-registration-fallback`
**Fichier** : `src/composables/paco/usePacoRegistration.js`
**Type** : Vue 3 composable (JavaScript, JSDoc)

---

## Objectif

Étendre le composable existant avec une méthode haut niveau `registerPacoWithFallback(input)` qui encapsule la logique de secours en 3 niveaux (RPC standard → RPC fallback → localStorage-only) afin que `PacoQuickRegister.vue` n'ait qu'un seul appel à faire.

---

## API publique ajoutée

### `registerPacoWithFallback(input)`

```javascript
/**
 * Tente une inscription PACO en garantissant que l'utilisateur n'est
 * jamais bloqué, même en cas d'échec technique de la RPC standard.
 *
 * Ordre des tentatives :
 *   1. RPC `register_paco_quick` (chemin nominal)
 *   2. Si (1) échoue : RPC `register_paco_fallback` (inscription de secours)
 *   3. Si (2) échoue : localStorage-only (flag uniquement, pas de trace DB)
 *
 * Dans tous les cas, retourne un résultat exploitable par l'UI pour
 * afficher l'écran de confirmation et le bouton « Rejoindre ».
 *
 * @param {PacoRegistrationInput} input
 * @returns {Promise<PacoRegistrationResult>}
 */
export async function registerPacoWithFallback(input) { ... }
```

### Type `PacoRegistrationInput`

```typescript
interface PacoRegistrationInput {
  email: string                // requis, non vide (validation front-end préalable)
  firstName: string            // requis
  lastName: string             // requis
  gender: 'male' | 'female'
  ageProfile: 'under_35' | 'over_35'
  city: string
  countryId: string            // UUID
  professionalStatus: 'employed' | 'student' | 'unemployed' | 'entrepreneur'
  organizationName: string
  recordingConsent: boolean
  sessionEdition: number       // 1, 2, ...
}
```

### Type `PacoRegistrationResult`

```typescript
interface PacoRegistrationResult {
  /**
   * 'standard'    : RPC register_paco_quick a réussi (chemin nominal)
   * 'fallback'    : RPC register_paco_quick a échoué, RPC register_paco_fallback a réussi
   * 'local_only'  : Les deux RPC ont échoué, état persisté en localStorage uniquement
   */
  status: 'standard' | 'fallback' | 'local_only'

  /**
   * UUID de la ligne activity_registrations ; null si status === 'local_only'
   */
  registrationId: string | null

  /**
   * Message d'erreur technique capturé en cas de fallback ou de local_only.
   * Null en mode standard.
   */
  technicalError: string | null
}
```

---

## Comportement détaillé

### Étape 1 — Tentative standard

```
try:
  registrationId = supabase.rpc('register_paco_quick', { …parameters }).throwOnError()
catch (err):
  → Étape 2 avec technicalError = err.message
return { status: 'standard', registrationId, technicalError: null }
```

### Étape 2 — Tentative de secours

```
payload = {
  email: input.email,
  firstName: input.firstName,
  lastName: input.lastName,
  organization: input.organizationName,
  sessionEdition: input.sessionEdition,
  countryId: input.countryId,
  demographic: {
    gender: input.gender,
    ageProfile: input.ageProfile,
    city: input.city,
    professionalStatus: input.professionalStatus,
    organization: input.organizationName,
    recordingConsent: input.recordingConsent,
  },
  capturedAt: new Date().toISOString(),
  clientVersion: 'paco-fallback-v1',
}

try:
  registrationId = supabase.rpc('register_paco_fallback', {
    p_email: input.email,
    p_session_edition: input.sessionEdition,
    p_fallback_payload: payload,
    p_error_message: technicalError,
  }).throwOnError()
catch (fallbackErr):
  → Étape 3 avec technicalError = technicalError + ' / ' + fallbackErr.message
return { status: 'fallback', registrationId, technicalError }
```

### Étape 3 — localStorage-only

```
console.error('PACO fallback double failure:', technicalError)
// Ne pas lever d'exception — l'utilisateur ne doit jamais être bloqué
return { status: 'local_only', registrationId: null, technicalError }
```

**Dans tous les cas**, la fonction retourne une Promise résolue (jamais rejetée). Le composant appelant se fie uniquement au champ `status` pour son affichage — il **n'affiche jamais d'erreur** à l'utilisateur.

---

## Effets de bord

- `markPacoRegistered(input.sessionEdition)` est appelé **dans tous les cas** (succès standard, fallback, ou local_only).
- `localStorage.setItem('paco_registration_data_session_{n}', JSON.stringify({ registrationId, email, firstName, lastName, sessionEdition, registeredAt }))` est appelé dans tous les cas (avec `registrationId: null` si `local_only`).
- Aucune mutation de l'état Vue réactif dans cette fonction haut niveau (elle est « pure » vis-à-vis du composable). Les `ref` `loading`, `error`, `isRegistered` existants dans `usePacoRegistration()` ne sont **pas** modifiés par `registerPacoWithFallback` — c'est à l'appelant de gérer son propre état d'UI.

---

## Contrat côté consommateur

[PacoQuickRegister.vue](../../src/components/paco/PacoQuickRegister.vue) est refactoré ainsi :

```javascript
import { registerPacoWithFallback } from '@/composables/paco/usePacoRegistration'

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''

  const result = await registerPacoWithFallback({
    email: form.email,
    firstName: form.firstName,
    lastName: form.lastName,
    gender: form.gender,
    ageProfile: form.ageProfile,
    city: form.city,
    countryId: form.countryId,
    professionalStatus: form.professionalStatus,
    organizationName: form.organizationName,
    recordingConsent: form.recordingConsent,
    sessionEdition: props.sessionEdition,
  })

  // Jamais d'erreur affichée à l'utilisateur : on émet toujours registration-complete.
  // Le status est uniquement utilisé pour le logging / télémétrie.
  if (result.status !== 'standard') {
    console.warn('[PACO] Registration completed via fallback path:', result.status)
  }

  emit('registration-complete')
  submitting.value = false
}
```

**Invariant UI** : `errorMessage.value` n'est plus jamais renseigné sur la base d'une erreur d'inscription. Il ne reste utile que pour d'éventuelles erreurs de validation front-end (qui ne déclenchent pas le mode secours).

---

## API publique ajoutée (seconde méthode, côté admin)

### `markRegistrationRecovered(registrationId)`

```javascript
/**
 * Marque une inscription de secours comme « rattrapée » par l'équipe
 * (envoi manuel du lien, correction des données, etc.).
 *
 * Cette méthode n'est pas exposée dans le flux public ; elle est
 * appelée depuis la page admin uniquement.
 *
 * @param {string} registrationId UUID de la ligne activity_registrations
 * @returns {Promise<{ success: boolean, error: string | null }>}
 */
export async function markRegistrationRecovered(registrationId) { ... }
```

**Comportement** :
```
UPDATE activity_registrations
   SET recovered_at = NOW()
 WHERE id = registrationId
   AND fallback_payload IS NOT NULL
   AND recovered_at IS NULL
```

- Retourne `{ success: true, error: null }` si la mise à jour affecte 1 ligne.
- Retourne `{ success: false, error: 'not_found_or_already_recovered' }` si aucune ligne affectée.
- Retourne `{ success: false, error: <message> }` en cas d'erreur Supabase.

**Sécurité** : le filtre `fallback_payload IS NOT NULL` empêche de marquer une inscription standard comme « rattrapée » (ce qui n'aurait pas de sens).

---

## Contrat de test unitaire (Phase 2)

### Test 1 — Succès standard

**Mock** : `supabase.rpc('register_paco_quick', …)` résout `{ data: 'uuid-1', error: null }`.

**Assertions** :
- `result.status === 'standard'`
- `result.registrationId === 'uuid-1'`
- `result.technicalError === null`
- `supabase.rpc` a été appelée **une seule fois** (avec `register_paco_quick`).
- `localStorage.setItem('paco_registration_data_session_2', …)` a été appelé.

### Test 2 — Échec standard → secours réussi

**Mock** :
- `register_paco_quick` rejette avec `{ error: { message: 'WAF blocked' } }`.
- `register_paco_fallback` résout `{ data: 'uuid-2', error: null }`.

**Assertions** :
- `result.status === 'fallback'`
- `result.registrationId === 'uuid-2'`
- `result.technicalError` contient `'WAF blocked'`.
- Deux appels RPC, dans l'ordre.

### Test 3 — Double échec → local_only

**Mock** : les deux RPC rejettent.

**Assertions** :
- `result.status === 'local_only'`
- `result.registrationId === null`
- `result.technicalError` contient les deux messages.
- `localStorage.setItem` a été appelé avec `registrationId: null` dans le JSON persisté.
- `console.error` a été appelé.

### Test 4 — Aucune exception propagée

**Mock** : les deux RPC rejettent avec des erreurs aléatoires.

**Assertion** : `registerPacoWithFallback(input)` ne rejette jamais — `expect(fn()).resolves.toBeDefined()`.

### Test 5 — `markRegistrationRecovered`

**Mock** : `supabase.from('activity_registrations').update(...)` résout `{ data: [{ id }], error: null }`.

**Assertions** :
- `result.success === true`
- La requête filtre sur `fallback_payload.not.is.null` et `recovered_at.is.null`.
