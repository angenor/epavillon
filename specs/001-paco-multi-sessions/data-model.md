# Data Model: PACO Webinar Multi-Sessions

**Feature**: 001-paco-multi-sessions  
**Date**: 2026-04-09

---

## Modifications de schéma

### 1. Nouvelle colonne `session_edition` sur `activity_registrations`

```sql
ALTER TABLE public.activity_registrations
  ADD COLUMN session_edition INTEGER NOT NULL DEFAULT 1;

-- Migration rétroactive: tous les inscrits existants = session 1
UPDATE public.activity_registrations
  SET session_edition = 1
  WHERE activity_id = '00000000-0000-4000-a000-00000000a002';

-- Supprimer les anciens index d'unicité (incompatibles multi-sessions)
DROP INDEX IF EXISTS activity_registrations_guest_unique;
DROP INDEX IF EXISTS activity_registrations_user_unique;

-- Créer les nouveaux index incluant session_edition
CREATE UNIQUE INDEX activity_registrations_guest_session_unique
  ON public.activity_registrations(activity_id, guest_email, session_edition)
  WHERE guest_email IS NOT NULL AND user_id IS NULL;

CREATE UNIQUE INDEX activity_registrations_user_session_unique
  ON public.activity_registrations(activity_id, user_id, session_edition)
  WHERE user_id IS NOT NULL;
```

**Fichier à créer**: `bank/shema_et_requettes/migration_001_add_session_edition.sql`  
**Fichier à mettre à jour**: `bank/shema_et_requettes/database_complete.sql`

---

### 2. RPC `register_paco_quick` — ajout `p_session_edition`

Nouveau paramètre `p_session_edition INTEGER DEFAULT 2` (valeur courante = session 2).

La vérification d'unicité et l'insertion doivent filtrer par `session_edition`.

**Fichier à mettre à jour**: `bank/shema_et_requettes/rpc_register_paco_quick.sql`

---

## Structure de données frontend

### `SESSIONS_DATA` dans `usePacoWebinarData.js`

```javascript
// Type de référence (pas de TypeScript, documenté ici)
// SessionData {
//   edition: number           // Numéro de la session (1, 2, ...)
//   date: string              // ISO date 'YYYY-MM-DD'
//   startTime: string         // 'HH:MM'
//   endTime: string           // 'HH:MM'
//   timezone: string          // 'GMT'
//   language: string          // 'fr'
//   coverImage: string        // Chemin vers l'image /images/...
//   replayUrl: string|null    // URL embed YouTube ou null si pas de replay
//   bannerUrl: string         // /images/banniere_paco.jpg ou autre
//   panelists: Panelist[]
//   partners: Partner[]
//   i18nPrefix: string        // 'paco.session1' ou 'paco.session2'
// }
```

### Session 1 (complétée)

```javascript
{
  edition: 1,
  date: '2026-03-26',
  startTime: '14:00',
  endTime: '15:30',
  timezone: 'GMT',
  language: 'fr',
  coverImage: '/images/banniere_paco.jpg',
  replayUrl: 'https://www.youtube.com/embed/482HTq49tlQ?autoplay=1&mute=1',
  bannerUrl: '/images/banniere_paco.jpg',
  i18nPrefix: 'paco.session1',
  panelists: [/* Cécile MARTIN-PHIPPS, Roël HOUDANON, Frédéric VALLIER, ... */],
  partners: [/* IFDD, GIZ, IKI, BMU, PIC */]
}
```

### Session 2 (à venir)

```javascript
{
  edition: 2,
  date: '2026-04-30',
  startTime: '14:00',
  endTime: '15:30',
  timezone: 'GMT',
  language: 'fr',
  coverImage: '/images/image_paco_session_2.jpg',
  replayUrl: null,
  bannerUrl: '/images/image_paco_session_2.jpg',
  i18nPrefix: 'paco.session2',
  panelists: [
    { id: 'kiri', name: 'Tounao KIRI', organization: 'PACO', photoUrl: null, email: null },
    { id: 'baglhi', name: 'Abdallah BAGLHI', organization: 'PACO Bénin', photoUrl: null, email: null },
    { id: 'ka', name: 'Sokhna Dié KA', organization: 'Natural Justice', photoUrl: null, email: null }
  ],
  partners: [/* IFDD, GIZ, IKI, BMU, PIC */]
}
```

---

## localStorage — clés par session

| Clé | Valeur | Rôle |
|-----|--------|------|
| `paco_registered_session_1` | `'1'` | Inscrit session 1 (local) |
| `paco_registered_session_2` | `'1'` | Inscrit session 2 (local) |
| `paco_registration_complete` | *obsolète* | Migré vers `paco_registered_session_1` |
| `paco_registration_data` | JSON | Données dernière inscription |
| `paco_page_viewed` | `'1'` | Tracking de vue unique |

---

## Clés i18n nouvelles (à ajouter dans `fr/paco.json` et `en/paco.json`)

```
paco.tabs.session1         → "Session 1"
paco.tabs.session2         → "Session 2"
paco.tabs.status.ended     → "Terminée"
paco.tabs.status.upcoming  → "À venir"
paco.tabs.status.live      → "En direct"

paco.session1.title        → "Collectivités locales face au changement climatique"
paco.session1.subtitle     → "Gouvernance, planification et financements pour l'adaptation"
paco.session1.dateLabel    → "Jeudi 26 mars 2026"
paco.session1.timeLabel    → "14h00 – 15h30 GMT"
paco.session1.replay       → "Voir l'enregistrement"
paco.session1.replayLoading → "Chargement de la vidéo..."
paco.session1.replayError  → "Vidéo temporairement indisponible"

paco.session2.title        → "Justice climatique et inclusion sociale dans l'adaptation"
paco.session2.subtitle     → "Équité, genre et participation inclusive dans les stratégies d'adaptation"
paco.session2.dateLabel    → "Jeudi 30 avril 2026"
paco.session2.timeLabel    → "14h00 – 15h30 GMT"

paco.register.sessionLabel → "Session"
paco.register.sessionBadge → "Session {{ edition }} — {{ date }}"
```
