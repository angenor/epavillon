# Contrat: Composable `usePacoWebinarData`

## Interface exportée (après refactorisation)

```javascript
export function usePacoWebinarData() {
  return {
    sessions,          // Ref<SessionData[]> — toutes les sessions
    currentSession,    // ComputedRef<SessionData> — session non terminée la plus récente
    getSessionStatus,  // (sessionData) => 'upcoming' | 'live' | 'ended'
    getStatusLabel,    // (status) => string (i18n)
    getStatusColor,    // (status) => 'green' | 'amber' | 'gray'
  }
}
```

## Prop `sessionData` pour les composants session

Les composants `PacoSession1.vue` et `PacoSession2.vue` reçoivent une prop:

```javascript
// Props
defineProps({
  sessionData: { type: Object, required: true }
  // SessionData shape: edition, date, startTime, endTime, coverImage,
  // replayUrl, panelists, partners, i18nPrefix
})
```

## Contrat `PacoQuickRegister.vue` — nouvelles props

```javascript
defineProps({
  sessionEdition: { type: Number, required: true }
  // Transmet p_session_edition au RPC register_paco_quick
})
```

## Contrat localStorage — fonctions `usePacoRegistration`

```javascript
// Nouvelles signatures
markPacoRegistered(sessionEdition)         // ex: markPacoRegistered(2)
isPacoRegisteredLocally(sessionEdition)    // ex: isPacoRegisteredLocally(2) → boolean

// Clés utilisées
// `paco_registered_session_${sessionEdition}`
```
