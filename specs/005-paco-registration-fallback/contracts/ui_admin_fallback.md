# Contract — Surface UI admin pour les inscriptions de secours

**Feature** : `005-paco-registration-fallback`
**Fichiers touchés** :
- `src/views/paco/PacoAdmin.vue`
- `src/components/paco/PacoRegistrantTable.vue`
- `src/components/paco/PacoStatsCards.vue`
- `src/composables/paco/usePacoStats.js`
- `src/composables/paco/usePacoCsvExport.js`

---

## 1. Extension du modèle « registrant » renvoyé par `usePacoStats`

`fetchPacoRegistrants` et `fetchAllRegistrantsForExport` retournent des objets enrichis :

```typescript
interface PacoRegistrant {
  // champs existants
  id: string
  firstName: string
  lastName: string
  email: string
  gender: string | null
  ageProfile: string | null
  city: string | null
  countryFr: string | null
  countryEn: string | null
  professionalStatus: string | null
  organization: string | null
  sessionEdition: number
  registrationDate: string

  // NOUVEAU
  isFallback: boolean                 // true si fallback_payload IS NOT NULL
  fallbackPayload: object | null      // parsed JSON, null si standard
  fallbackError: string | null        // message d'erreur original, null si standard
  recoveredAt: string | null          // ISO timestamp, null si non rattrapée
}
```

**Règle de mapping** :
- Quand `isFallback === true` ET `paco_demographic_data` est absent, les champs démographiques (`gender`, `ageProfile`, `city`, `countryFr/En`, `professionalStatus`, `organization`) sont **extraits de `fallbackPayload.demographic`** au lieu de la jointure, afin que l'affichage reste uniforme.

---

## 2. Extension de `stats` dans `fetchPacoStats`

```typescript
interface PacoStats {
  // champs existants
  total: number
  withDemographics: number
  gender: { male: number, female: number }
  ageProfile: { under35: number, over35: number }
  professionalStatus: { employed: number, student: number, unemployed: number, entrepreneur: number }

  // NOUVEAU
  fallbackTotal: number       // COUNT(*) WHERE fallback_payload IS NOT NULL
  recoveredTotal: number      // COUNT(*) WHERE recovered_at IS NOT NULL
  fallbackPending: number     // fallbackTotal - recoveredTotal
}
```

**Calcul** : `fetchPacoStats` étend son `SELECT` pour inclure `fallback_payload` et `recovered_at`, puis compte côté client (le volume PACO reste faible, < 1000 lignes, donc aucune optimisation SQL agrégée n'est nécessaire).

---

## 3. `PacoStatsCards.vue` — Nouvelles cartes

Trois nouvelles cartes (ou une seule carte « Secours » avec trois sous-compteurs) :
- **Inscriptions de secours** (`stats.fallbackTotal`)
- **Rattrapées** (`stats.recoveredTotal`)
- **À rattraper** (`stats.fallbackPending`) — mise en évidence si > 0

Les cartes respectent le design existant (skeleton loader, dark mode, i18n via `t()`).

**Clés i18n à ajouter** :
- `paco.admin.stats.fallbackTotal`
- `paco.admin.stats.recoveredTotal`
- `paco.admin.stats.fallbackPending`
- `paco.admin.stats.fallbackTooltip` — explication pour l'admin

---

## 4. `PacoRegistrantTable.vue` — Modifications

### 4.1 Badge « Secours » sur chaque ligne

```html
<PacoStatusBadge v-if="registrant.isFallback" variant="fallback" :recovered="!!registrant.recoveredAt" />
```

- Badge orange/rouge si `!recoveredAt`
- Badge vert « Rattrapée » si `recoveredAt`

### 4.2 Nouvelle colonne « Type »

Colonne optionnelle (masquée sur mobile) affichant :
- « Standard » pour `!isFallback`
- « Secours » ou « Secours (rattrapée) » sinon

### 4.3 Bouton « Détails secours »

Sur chaque ligne `isFallback`, un bouton icône qui ouvre une **modale** affichant :
- Le JSON `fallbackPayload` formaté (pretty-printed)
- Le message `fallbackError`
- La date `registrationDate` (échec d'origine)
- La date `recoveredAt` si renseignée
- Un bouton « Marquer comme rattrapée » (visible uniquement si `!recoveredAt`) qui appelle `markRegistrationRecovered(id)` puis rafraîchit la liste.

**Clés i18n à ajouter** :
- `paco.admin.fallback.detailsTitle`
- `paco.admin.fallback.payloadLabel`
- `paco.admin.fallback.errorLabel`
- `paco.admin.fallback.markRecovered`
- `paco.admin.fallback.markRecoveredConfirm`
- `paco.admin.fallback.recoveredAt`
- `paco.admin.fallback.badgeFallback`
- `paco.admin.fallback.badgeRecovered`

### 4.4 Filtre « Type » dans le header de la table

Boutons segmentés (similaire au filtre session existant) :
- Toutes
- Standard uniquement
- Secours uniquement
- À rattraper (secours non rattrapé)

Filtre appliqué côté client sur `registrants.value` (le volume reste faible).

---

## 5. `PacoAdmin.vue` — Filtre global

Ajout d'un filtre « Type d'inscription » à côté du filtre session existant, exposé via une nouvelle ref `typeFilter: 'all' | 'standard' | 'fallback' | 'fallback_pending'`.

Le filtre impacte la table et les cartes stats dérivées (fallbackTotal, etc.) — mais pas la query SQL principale (filtrage côté client pour simplicité).

---

## 6. Export CSV — `usePacoCsvExport.js`

Colonnes ajoutées à l'export :
- `type` : `'standard'` | `'fallback'`
- `fallback_error` : vide pour standard, message pour secours
- `recovered_at` : vide ou date ISO
- `fallback_payload_json` : JSON stringifié brut (pour permettre le rattrapage manuel hors ligne)

L'ordre et le nommage des colonnes existantes ne change pas, afin de préserver la compatibilité avec tout outillage admin existant.

---

## 7. Contrat Realtime

Aucun changement : `subscribeToPacoChanges` écoute déjà tous les événements `activity_registrations` pour `activity_id = PACO_ACTIVITY_ID`. Un UPDATE avec promotion secours→standard, un INSERT de secours, ou un UPDATE `recovered_at` déclenchent automatiquement le callback existant qui rafraîchit les stats.

---

## 8. Contrat i18n (fr + en)

**Principe II de la constitution (NON-NEGOTIABLE)** : toutes les nouvelles chaînes doivent être ajoutées simultanément dans `src/locales/fr/index.js` ET `src/locales/en/index.js`.

### Nouvelles clés (liste exhaustive)

```
paco.admin.stats.fallbackTotal           → "Inscriptions de secours" / "Fallback registrations"
paco.admin.stats.recoveredTotal          → "Rattrapées" / "Recovered"
paco.admin.stats.fallbackPending         → "À rattraper" / "To recover"
paco.admin.stats.fallbackTooltip         → explicatif

paco.admin.fallback.detailsTitle         → "Détails de l'inscription de secours"
paco.admin.fallback.payloadLabel         → "Formulaire soumis"
paco.admin.fallback.errorLabel           → "Erreur technique"
paco.admin.fallback.markRecovered        → "Marquer comme rattrapée"
paco.admin.fallback.markRecoveredConfirm → "Confirmer"
paco.admin.fallback.recoveredAt          → "Rattrapée le"
paco.admin.fallback.badgeFallback        → "Secours"
paco.admin.fallback.badgeRecovered       → "Rattrapée"

paco.admin.filter.type.label             → "Type"
paco.admin.filter.type.all               → "Tous"
paco.admin.filter.type.standard          → "Standard"
paco.admin.filter.type.fallback          → "Secours"
paco.admin.filter.type.fallbackPending   → "À rattraper"

paco.admin.fallback.exportType           → colonne CSV "Type"
paco.admin.fallback.exportError          → colonne CSV "Erreur technique"
paco.admin.fallback.exportRecoveredAt    → colonne CSV "Rattrapée le"
paco.admin.fallback.exportPayload        → colonne CSV "Payload JSON"
```

**Aucun texte** en dur dans les templates ou composants Vue (principe II).

---

## 9. Non-objectifs UI

- Pas de vue « historique de tentatives » : une seule ligne par `(email, session)`.
- Pas de bouton « Supprimer le secours » distinct : le bouton de suppression existant s'applique aux deux types.
- Pas de notification email admin pour les nouveaux secours : les admins consultent la page.
