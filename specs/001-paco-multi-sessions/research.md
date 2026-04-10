# Research: PACO Webinar Multi-Sessions

**Feature**: 001-paco-multi-sessions
**Date**: 2026-04-09

---

## Décision 1 — Contrainte d'unicité multi-sessions

**Problème**: L'index `activity_registrations_guest_unique(activity_id, guest_email)` empêche un même email de s'inscrire deux fois à la même activité PACO. Avec plusieurs sessions, chaque email doit pouvoir s'inscrire à chaque session distinctement.

**Décision**: Remplacer les deux index d'unicité par des versions incluant `session_edition`:

```sql
-- Avant
CREATE UNIQUE INDEX activity_registrations_guest_unique
  ON activity_registrations(activity_id, guest_email)
  WHERE guest_email IS NOT NULL AND user_id IS NULL;

CREATE UNIQUE INDEX activity_registrations_user_unique
  ON activity_registrations(activity_id, user_id)
  WHERE user_id IS NOT NULL;

-- Après
CREATE UNIQUE INDEX activity_registrations_guest_session_unique
  ON activity_registrations(activity_id, guest_email, session_edition)
  WHERE guest_email IS NOT NULL AND user_id IS NULL;

CREATE UNIQUE INDEX activity_registrations_user_session_unique
  ON activity_registrations(activity_id, user_id, session_edition)
  WHERE user_id IS NOT NULL;
```

**Rationale**: La granularité session_edition permet une inscription distincte par session tout en maintenant l'intégrité des données. Les anciens index doivent être supprimés puis recréés (DROP + CREATE).

**Alternatives considérées**:
- Garder les index actuels et dédupliquer au niveau applicatif → rejeté, risque d'incohérence en base
- Nouvelle table `paco_session_registrations` → rejeté (choix utilisateur: colonne sur `activity_registrations`)

---

## Décision 2 — Mise à jour du RPC `register_paco_quick`

**Problème**: Le RPC actuel vérifie l'unicité par `(activity_id, email)` sans session_edition. Il retournerait l'ID de session 1 si l'utilisateur essaie de s'inscrire à session 2.

**Décision**: Ajouter le paramètre `p_session_edition INTEGER DEFAULT 2` au RPC. La vérification d'unicité et l'insertion doivent inclure `session_edition`.

**Rationale**: La valeur `DEFAULT 2` assure la rétrocompatibilité (les nouvelles inscriptions sont pour la session en cours). Les appels existants (sans le paramètre) continueraient à fonctionner si la fonction est mise à jour correctement.

**Alternatives considérées**:
- Créer un nouveau RPC `register_paco_quick_v2` → rejeté, fragmentation inutile pour un seul paramètre ajouté

---

## Décision 3 — localStorage isolation par session

**Problème**: La clé `paco_registration_complete` est globale. Un inscrit à la session 1 ne devrait pas voir le bouton "Rejoindre" sur la session 2.

**Décision**: Adopter des clés par session : `paco_registered_session_1`, `paco_registered_session_2`, etc. Conserver temporairement la lecture de l'ancienne clé `paco_registration_complete` comme fallback pour les utilisateurs existants, et leur assigner automatiquement session 1.

**Migration côté client**:
```javascript
// Lors du chargement: migrer l'ancienne clé si présente
if (localStorage.getItem('paco_registration_complete') === '1') {
  localStorage.setItem('paco_registered_session_1', '1')
  localStorage.removeItem('paco_registration_complete')
}
```

**Rationale**: Évite que les 100+ inscrits à la session 1 voient le formulaire d'inscription à la session 2 comme si c'était leur première fois.

---

## Décision 4 — Architecture des composants

**Problème**: `PacoWebinar.vue` est un fichier unique contenant toute la logique. La refactorisation doit créer des composants par session sans dépasser 400 lignes par fichier.

**Décision**: Architecture en 3 couches:

```
PacoWebinar.vue                  ← Orchestrateur + onglets
├── PacoSessionTabs.vue          ← Navigation par onglets (NOUVEAU)
├── PacoSession1.vue             ← Panneau session 1: vidéo + infos (NOUVEAU)
│   └── PacoPresentation.vue    ← Réutilisé avec prop session
└── PacoSession2.vue             ← Panneau session 2: infos + inscription (NOUVEAU)
    └── PacoPresentation.vue    ← Réutilisé avec prop session
```

`PacoPresentation.vue` reçoit une prop `sessionData` et utilise `t()` avec des clés i18n différentes selon la session (ex: `paco.session1.title`, `paco.session2.title`).

**Rationale**: Réutilise la structure de présentation existante sans duplication. L'orchestrateur `PacoWebinar.vue` reste léger (<100 lignes).

---

## Décision 5 — Données session 2 dans `usePacoWebinarData.js`

**Problème**: Le composable est conçu pour une seule session courante avec des `pastSessions`. Il faut le faire évoluer vers un modèle multi-sessions.

**Décision**: Refactoriser vers un tableau `SESSIONS_DATA[]` et exposer `sessions`, `currentSession`, `status`.

```javascript
// Nouvelle structure
const SESSIONS_DATA = [
  {
    edition: 1,
    date: '2026-03-26',
    completed: true,
    replayUrl: 'https://www.youtube.com/embed/482HTq49tlQ',
    coverImage: '/images/banniere_paco.jpg',
    // ...panelists, etc.
  },
  {
    edition: 2,
    date: '2026-04-30',
    completed: false,
    replayUrl: null,
    coverImage: '/images/image_paco_session_2_v2.jpg',
    // ...panelists, etc.
  }
]
```

**Rationale**: Structure extensible pour les sessions futures. Les composants session reçoivent directement leur objet session.

---

## Décision 6 — Champ session dans le formulaire

**Décision**: Le composant `PacoQuickRegister.vue` reçoit une prop `sessionEdition` (integer). Il affiche un badge en lecture seule indiquant la session courante, et transmet la valeur au RPC.

**Rationale**: Conforme à la clarification Q3 (lecture seule). Le badge visuel confirme à l'utilisateur quelle session il rejoint.
