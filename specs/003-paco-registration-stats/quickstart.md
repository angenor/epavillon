# Quickstart: Formulaire d'inscription PACO et Statistiques Admin

**Branch**: `003-paco-registration-stats` | **Date**: 2026-03-05

## Prerequisites

1. Base de données Supabase avec les tables existantes (`activity_registrations`, `users`, `countries`, `activities`)
2. Script PACO initial déjà exécuté (`bank/shema_et_requettes/paco_setup.sql`)
3. Branche `003-paco-registration-stats` checkoutée

## Setup Steps

### 1. Créer la table paco_demographic_data

Exécuter le script SQL dans la console Supabase :

```bash
# Le script est dans : bank/shema_et_requettes/paco_demographic_data.sql
# À exécuter manuellement dans la console SQL de Supabase
```

### 2. Vérifier la structure

```sql
-- Vérifier que la table existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'paco_demographic_data'
ORDER BY ordinal_position;

-- Vérifier les RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'paco_demographic_data';
```

### 3. Lancer le développement

```bash
npm run dev
```

### 4. Tester le flow

1. Accéder à `/paco`
2. Entrer un email → login ou register
3. Remplir le formulaire enrichi (genre, âge, ville, pays, statut, organisation, consentement)
4. Soumettre → vérifier confirmation
5. Accéder à la rubrique admin PACO → vérifier statistiques et liste

## Key Files (after implementation)

### Modifiés
- `src/components/paco/PacoRegisterForm.vue` — champs démographiques ajoutés
- `src/components/paco/PacoActivityRegister.vue` — champs démographiques ajoutés
- `src/composables/paco/usePacoRegistration.js` — insertion données démographiques
- `src/locales/fr/paco.json` — nouvelles clés de traduction
- `src/locales/en/paco.json` — nouvelles clés de traduction
- `src/router/index.js` — route admin PACO ajoutée
- `bank/shema_et_requettes/database_complete.sql` — table paco_demographic_data documentée

### Nouveaux
- `bank/shema_et_requettes/paco_demographic_data.sql` — script de migration
- `src/composables/paco/usePacoStats.js` — composable statistiques
- `src/composables/paco/usePacoCsvExport.js` — composable export CSV
- `src/views/paco/PacoAdmin.vue` — vue admin statistiques + liste

## Cleanup (post-event)

Pour supprimer toute la fonctionnalité PACO :

```sql
-- 1. Supprimer la table démographique
DROP TABLE IF EXISTS public.paco_demographic_data;

-- 2. Supprimer les inscriptions PACO
DELETE FROM public.activity_registrations WHERE activity_id = '00000000-0000-4000-a000-00000000a002';

-- 3. Supprimer l'activité et l'événement PACO
DELETE FROM public.activities WHERE id = '00000000-0000-4000-a000-00000000a002';
DELETE FROM public.events WHERE id = '00000000-0000-4000-a000-00000000e001';

-- 4. Supprimer la fonction RPC
DROP FUNCTION IF EXISTS public.check_paco_email(TEXT);
```

Côté code : supprimer les dossiers/fichiers PACO :
- `src/components/paco/`
- `src/composables/paco/`
- `src/views/paco/`
- `src/locales/fr/paco.json` + `src/locales/en/paco.json`
- Routes PACO dans `src/router/index.js`
- `bank/shema_et_requettes/paco_*.sql`
- `supabase/functions/send-paco-email/`
