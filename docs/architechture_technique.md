# Document d'Architecture Technique (DAT) — ePavillon

> Plateforme numérique de l'Institut de la Francophonie pour le Développement Durable (IFDD/OIF) dédiée au Pavillon de la Francophonie aux COP et à l'accompagnement des négociateurs/négociatrices francophones.
>
> Version du document : 1.0 — Dernière mise à jour : 2026-05-17

---

## 1. Contexte : Besoins fonctionnels

ePavillon a pour objectif de simplifier la gestion du Pavillon de la Francophonie lors des COP et d'accompagner les négociatrices et négociateurs francophones tout au long du cycle de négociation climatique. La plateforme doit permettre de :

### 1.1 Gestion du Pavillon de la Francophonie
- **Enregistrer les demandes de passage** dans le Pavillon de la Francophonie (appels à propositions, dépôt de candidatures par les pays, organisations internationales, ONG, secteur privé).
- **Gérer la programmation** des événements du Pavillon (planification, attribution de créneaux, validation logistique).
- **Apprécier et sélectionner** les événements retenus (workflow d'évaluation par les spécialistes de programme, validation finale par le super-administrateur, notation des activités soumises).
- **Échanger en temps réel** avec les pays, organisations et ONG candidats (messagerie instantanée individuelle et groupale, notifications push, indicateurs de présence/frappe).
- **Envoyer des emails personnalisés en masse** (newsletters ciblées par pays, organisation, formation, activité, événement ; templates avec variables dynamiques ; historique d'envoi).
- **Permettre aux candidats de gérer leurs activités** (CRUD complet sur les activités soumises, suivi du statut, gestion des intervenants, dépôt de documents).
- **Créer automatiquement les sessions Zoom** pour les cas hybrides ou en ligne dès validation par le spécialiste de programme (provisionnement via Edge Function `create-zoom-meeting`).
- **Démarrer le LiveStreaming YouTube** et l'intégrer (embed) dans la plateforme (Edge Function `get-youtube-live-id` via scraping Cheerio).

### 1.2 Accompagnement des négociateurs/négociatrices
- **Centraliser les documents utiles** aux négociatrices francophones (guides, notes techniques, ressources téléchargeables organisées par thématique : Climat, Biodiversité, Désertification).
- **Désignation des négociateurs** par les points focaux UNFCCC (gestion annuelle).
- **Espace de concertation** : sessions officielles, réunions de la Francophonie, consultations historiques.
- **Formations en ligne** : cours structurés en chapitres/leçons (vidéos YouTube intégrées), quiz temps réel, suivi de progression, attestations.

### 1.3 Modules transverses
- **Module PACO** (Programme d'Adaptation Climatique) : webinaires multi-sessions avec inscription publique enrichie (démographie, source d'acquisition, consentement), vérification email, gateway sécurisé `/paco/join` vers lien Teams.
- **Réseautage** : annuaire professionnel filtrable, demandes de connexion, rendez-vous (vidéo/audio/présentiel via PeerJS).
- **Innovations & bonnes pratiques** : partage par les organisations (images HD, vidéos courtes, documents), commentaires multi-contextes, témoignages, notation 1–5, réactions, compteur de vues.
- **Chatbot IA** (LangChain Anthropic/OpenAI) : RAG sur la base documentaire, outils Zoom intégrés pour les administrateurs.
- **Sondages temps réel** : QCM, texte libre, anonymes configurables, restitution graphique.

---

## 2. Besoins non fonctionnels

| Catégorie | Exigence |
|---|---|
| **Localisation** | Bilingue FR/EN natif via `vue-i18n` (FR par défaut). Traductions modulaires par domaine. Aucun texte ne doit être hardcodé. |
| **Accessibilité visuelle** | Mode clair / sombre / thème IFDD. Préférence persistée (localStorage + profil Supabase). |
| **Responsive** | Mobile-first, compatible terminaux à faible bande passante (cible Afrique francophone). |
| **Performance** | Lazy-loading systématique des routes, code-splitting Vite, compression images via Compressorjs avant upload, thumbnails multi-formats (HD/LD, 1:1, 16:9, 32:9). |
| **SEO** | Pre-rendering Puppeteer au build (`npm run build:seo`) générant un HTML statique par activité/événement avec meta tags dynamiques (`@vueuse/head`) pour crawlers et réseaux sociaux. |
| **Temps réel** | Supabase Realtime (WebSocket) pour messagerie, notifications, sondages, quiz, indicateurs de présence/frappe. |
| **Sécurité** | RLS PostgreSQL sur 42+ tables, JWT Supabase Auth, gateway de validation avant exposition des liens Teams/Zoom, validation Zod côté client, protection CSRF via tokens Supabase. |
| **Conformité** | RGPD : consentement explicite enregistrement (PACO), droit à l'oubli (`delete-user`, `delete-migrated-user`). |
| **Disponibilité** | Architecture serverless (Supabase + Firebase Hosting) → SLA hébergeurs. |
| **Évolutivité** | Architecture modulaire par domaine (composables, stores, views), Edge Functions découplées, schéma JSONB extensible (fallback_payload PACO, incident_messages). |
| **Observabilité** | Firebase Analytics, logs Supabase Edge Functions, monitoring déploiements Firebase. |
| **Maintenabilité** | Clean Code (DRY, KISS, YAGNI), composants Vue < 400 lignes, 74 composables réutilisables, séparation stricte view/composable/store. |

---

## 3. Représentation Fonctionnelle

### 3.1 Cartographie des macro-fonctions

À représenter sous forme de **carte des capacités métier** (rectangles imbriqués par domaine).

**Domaines fonctionnels (8 blocs principaux)** :

1. **Gestion du Pavillon** — Appels à propositions · Soumission d'activités · Validation workflow · Programmation · Sélection finale
2. **Diffusion d'événements** — Provisionnement Zoom · LiveStreaming YouTube · Q&A modérée · Enregistrement
3. **Accompagnement Négociation** — Désignation négociateurs · Documents de référence · Sessions de concertation · Historique COP
4. **Formation** — Cours · Chapitres/Leçons · Quiz temps réel · Suivi progression · Attestations
5. **PACO** — Webinaires multi-sessions · Inscription publique enrichie · Statistiques démographiques · Gateway Teams sécurisé
6. **Communication** — Messagerie 1:1 et groupale · Newsletters ciblées · Notifications · Sondages temps réel
7. **Réseautage** — Annuaire · Demandes de connexion · Rendez-vous (vidéo/audio/présentiel) · Profils publics
8. **Administration** — Modération · Gestion utilisateurs/rôles · Statistiques · Communications de masse · Outils IA

### 3.2 Acteurs (use-case)

À représenter en **diagramme de cas d'usage UML** (acteurs à gauche, ellipses regroupées par module).

| Acteur | Périmètre |
|---|---|
| **Visiteur anonyme** | Consultation programmation publique · Inscription PACO · Vue cours/innovations publics |
| **Utilisateur standard** | Profil · Réseautage · Inscription événements · Suivi formations · Messagerie |
| **Candidat (Org/ONG/Pays)** | Soumission activités · Gestion intervenants · Suivi validation · Échange avec les spécialistes |
| **Point focal UNFCCC** | Désignation des négociateurs annuels |
| **Négociateur/Négociatrice** | Accès documents · Sessions de concertation · Formations spécialisées |
| **Formateur** | Création/animation des cours et quiz |
| **Spécialiste de programme** | Évaluation activités · Programmation · Provisionnement Zoom |
| **Administrateur** | Gestion courante · Modération · Communications · Statistiques |
| **Super-administrateur** | Validation finale · Gestion des rôles · Configuration globale |

### 3.3 Workflows clés

**A. Workflow de soumission d'activité** (à représenter en BPMN) :
`Candidat dépose activité (draft)` → `Spécialiste examine` → `Demande d'ajustement OU Approbation` → `Super-admin valide` → `Edge Function create-zoom-meeting` → `Activité passe en statut "approved" puis "live"` → `Notification email candidat + intervenants`

**B. Workflow d'inscription PACO** (BPMN) :
`Visiteur remplit formulaire (données démographiques + source)` → `RPC register_paco_quick` → `Email de vérification via Edge Function send-email mode=paco` → `Confirmation OTP` → `Finalisation inscription` → `Accès /paco/join` → `Validation gateway` → `Redirection lien Teams sécurisé`

**C. Workflow de diffusion d'événement hybride** :
`Activité approuvée` → `Réunion Zoom créée` → `Récupération ID YouTube Live` → `Embed dans page activité` → `Q&A temps réel (Supabase Realtime)` → `Modération admin` → `Clôture + archivage`

---

## 4. Représentation Applicative

### 4.1 Vue en couches

À représenter en **diagramme en couches horizontales** (du haut vers le bas).

```
┌──────────────────────────────────────────────────────────────┐
│  COUCHE PRÉSENTATION (Vue 3 SPA + pre-rendering Puppeteer)   │
│  ─ Views (par domaine) · Components (46 dossiers) · Router   │
│  ─ i18n FR/EN · Thèmes light/dark/IFDD · TailwindCSS v4      │
├──────────────────────────────────────────────────────────────┤
│  COUCHE LOGIQUE MÉTIER (Composition API)                     │
│  ─ 74 Composables (useAuth, useActivities, useRAG, useZoom…) │
│  ─ 6 Stores Pinia (auth, user, messaging, emailModal…)       │
│  ─ Services & Utils (zoom client, AI tools, timezone)        │
├──────────────────────────────────────────────────────────────┤
│  COUCHE ACCÈS DONNÉES                                        │
│  ─ Supabase JS Client (REST + Realtime WebSocket)            │
│  ─ Appels Edge Functions (HTTPS)                             │
├──────────────────────────────────────────────────────────────┤
│  COUCHE BACKEND SERVERLESS (Supabase Edge Functions - Deno)  │
│  ─ 20 fonctions (Auth, Zoom, Email, YouTube, Admin, Legacy)  │
├──────────────────────────────────────────────────────────────┤
│  COUCHE PERSISTANCE & SERVICES                               │
│  ─ PostgreSQL Supabase (42+ tables, 53 RPC, RLS)             │
│  ─ Supabase Storage · Supabase Auth                          │
├──────────────────────────────────────────────────────────────┤
│  SERVICES EXTERNES                                           │
│  ─ Zoom API · YouTube · Laravel Email · Anthropic/OpenAI     │
│  ─ Firebase (Hosting + Analytics) · PeerJS · ElevenLabs      │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Cartographie des modules frontend

À représenter en **diagramme de composants** (boîtes liées par flèches de dépendance).

**Modules métier (sous `src/views/`)** : `auth`, `events`, `activities`, `programmations`, `paco`, `negociation`, `formations`, `messaging`, `appointments`, `organization`, `profils`, `admin`, `ai`.

**Stores Pinia** : `auth`, `user`, `messaging`, `emailModal`, `testimonials`, `counter`.

**Composables transverses critiques** :
- `composables/ai/` — chatbot RAG, streaming, sessions
- `composables/zoom/` — création/édition/suppression réunions
- `composables/paco/` — inscription, statistiques, multi-sessions
- `useRealtimeSubscription`, `useMessagingRealtime` — temps réel
- `useSEO`, `useTheme`, `useI18n` — transverse

### 4.3 Cartographie des Edge Functions

| Catégorie | Fonctions | Rôle |
|---|---|---|
| **Auth/Email** | `custom-auth-email`, `registration-email`, `send-email`, `send-paco-email`, `send-activity-notification`, `send-flexible-email` | Hooks d'authentification + envoi via endpoint Laravel polyvalent |
| **Zoom** | `create-zoom-meeting`, `create-standalone-zoom-meeting`, `get-zoom-meeting-details`, `edit-zoom-meeting`, `delete-zoom-meeting`, `register-to-zoom-meeting` | Cycle de vie complet des réunions Zoom (OAuth account-credentials) |
| **YouTube** | `get-youtube-live-id` | Scraping Cheerio pour récupérer l'ID live d'une chaîne |
| **Admin** | `approve-activity`, `search-activities`, `delete-user`, `delete-migrated-user` | Validation activités + admin users |
| **Legacy** | `migrate-user`, `migrate-photo` | Import depuis l'ancienne application Laravel |

---

## 5. Représentation des Infrastructures

### 5.1 Diagramme de déploiement

À représenter en **diagramme de déploiement UML** (nœuds = environnements, flèches = protocoles).

```
                    ┌─────────────────────┐
                    │  Navigateur client  │
                    │  (Vue 3 SPA + PWA)  │
                    └──────────┬──────────┘
                               │ HTTPS
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
   ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐
   │ Firebase Hosting │  │  Supabase    │  │ Laravel Email  │
   │ (CDN, pre-rendu) │  │  (EU-West-2) │  │ (GloboTech)    │
   │ epavillonclimat… │  │              │  │ 68.168.118.201 │
   └──────────────────┘  │ ┌──────────┐ │  └────────────────┘
                         │ │PostgreSQL│ │           ▲
                         │ │  + RLS   │ │           │ HTTPS Bearer
                         │ └──────────┘ │           │
                         │ ┌──────────┐ │           │
                         │ │ Auth JWT │ │           │
                         │ └──────────┘ │           │
                         │ ┌──────────┐ │           │
                         │ │ Storage  │ │           │
                         │ └──────────┘ │           │
                         │ ┌──────────┐ │           │
                         │ │ Realtime │ │           │
                         │ │WebSocket │ │           │
                         │ └──────────┘ │           │
                         │ ┌──────────┐ │           │
                         │ │   Edge   │─┼───────────┘
                         │ │Functions │─┼───┐
                         │ │  (Deno)  │ │   │ OAuth
                         │ └──────────┘ │   ▼
                         └──────────────┘ ┌──────────────────┐
                                          │  Zoom API        │
                                          │  YouTube         │
                                          │  Anthropic/OpenAI│
                                          │  ElevenLabs      │
                                          └──────────────────┘
```

### 5.2 Topologie réseau

| Composant | Hébergement | Région | Protocoles entrants |
|---|---|---|---|
| Frontend SPA + HTML pré-rendu | Firebase Hosting (CDN global) | Multi-région Google | HTTPS 443 |
| Base PostgreSQL + Auth + Storage + Realtime | Supabase Cloud | eu-west-2 | HTTPS 443, WSS 443 |
| Edge Functions Deno | Supabase Edge | eu-west-2 | HTTPS 443 |
| Email transactionnel | Serveur Laravel (GloboTech 68.168.118.201) | États-Unis | HTTPS 443 (Bearer token) |
| Zoom API | Zoom Cloud | Multi-région | HTTPS 443 (OAuth) |
| YouTube | Google | Multi-région | HTTPS 443 |
| LLM (Anthropic/OpenAI) | Vendeurs | États-Unis | HTTPS 443 (API Key) |

### 5.3 Pipeline CI/CD

À représenter en **diagramme de pipeline** (étapes en séquence).

```
Dev local → git push → (CI manuel) →
  npm run build:seo (Vite build + Puppeteer pre-render ~3-7 min)
  → npm run verify:seo (contrôle meta tags)
  → firebase deploy --only hosting
  → Edge Functions: supabase functions deploy <name> (manuel par fonction)
```

> **Note** : aucune CI/CD automatisée détectée (déploiement manuel sur ordre de l'administrateur).

---

## 6. Représentation Opérationnelle

### 6.1 Modèle de données (vue logique)

À représenter en **MCD/MLD** (entités-relations).

**Entités centrales** :
- `users` ←→ `user_roles` (RBAC : standard, focal_point, negotiator, trainer, paco, revisionniste, admin, super_admin)
- `organizations` (type : publique / internationale / ONG / privé) ←→ `countries`
- `events` (statut : upcoming / ongoing / completed / suspended) → `activities`
- `activities` (format : online / hybrid / in_person ; workflow : draft → approved → live → completed) → `zoom_meetings`, `activity_speakers`, `activity_registrations`
- `activity_registrations` (mode dual : utilisateur authentifié OU invité anonyme) → `paco_demographic_data` (genre, âge, ville, statut pro, consentement enregistrement, **source d'acquisition** — feature 006)
- `activity_questions` → `activity_question_answers` (Q&A modérée)
- `trainings` → `chapters` → `lessons` → `training_participants` (progression %, temps de visionnage)
- `negotiators` → `negotiator_consultations`
- `ai_chat_sessions` → `ai_chat_messages` + `document_embeddings` (vectorstore pgvector pour RAG)
- `messages`, `conversations`, `appointments` (messagerie/RDV)

**RPC clés** :
- `register_paco_quick` (v4) — inscription PACO atomique avec données démographiques
- `register_paco_fallback` — fallback JSON résilient
- `get_activity_average_rating`, `record_activity_view`, `mark_comment_as_read`
- `search_similar_documents` — recherche vectorielle pour RAG
- `cleanup_old_chat_sessions`

### 6.2 RACI Opérations

Voir section 9.

### 6.3 Plan de sauvegarde et reprise

| Élément | Sauvegarde | Restauration |
|---|---|---|
| Base PostgreSQL | Snapshots quotidiens Supabase (rétention 7 j plan Pro) | PITR Supabase |
| Storage Supabase | Réplication multi-AZ Supabase | Restauration via dashboard |
| Code source | GitHub (`main` + branches feature) | Re-déploiement Firebase |
| Secrets Edge Functions | Stockés dans Supabase Vault | Re-configuration manuelle |

### 6.4 Supervision

| Domaine | Outil |
|---|---|
| Trafic frontend | Firebase Analytics |
| Erreurs SPA | Console navigateur (à enrichir avec Sentry recommandé) |
| Logs Edge Functions | Dashboard Supabase |
| Performance BDD | Dashboard Supabase (slow queries) |
| Disponibilité Zoom | Webhooks `meeting.alert` |

---

## 7. Décisions d'architecture (ADR)

| # | Sujet | Décision | Justification |
|---|---|---|---|
| ADR-01 | Framework frontend | **Vue 3 + Vite** | Courbe d'apprentissage, écosystème SPA mature, performances HMR, alignement avec compétences équipe |
| ADR-02 | Backend | **Supabase (BaaS)** plutôt que backend custom | Time-to-market, Auth + DB + Storage + Realtime + Edge intégrés, PostgreSQL standard |
| ADR-03 | Architecture | **SPA + pre-rendering Puppeteer** plutôt que SSR (Nuxt) | Simplicité d'hébergement (Firebase static), SEO suffisant pour pages clés (activités/événements), pas de serveur Node à opérer |
| ADR-04 | State management | **Pinia** | Standard officiel Vue 3, Composition API native, DevTools |
| ADR-05 | i18n | **vue-i18n** statique (pas de chargement async) | Volume traductions raisonnable, simplicité, pas de flicker |
| ADR-06 | CSS | **TailwindCSS v4 only** (pas de framework composants) | Cohérence design IFDD sur mesure, contrôle total, performance |
| ADR-07 | Email transactionnel | **Endpoint Laravel externe** plutôt que Supabase SMTP / SendGrid | Réutilisation infra IFDD existante, templates métier déjà industrialisés |
| ADR-08 | Visioconférence | **Zoom API** (provisionnement auto) + **YouTube Live** (diffusion) + **Teams** (PACO) + **PeerJS** (RDV P2P) | Préférences IFDD selon contexte (officiel vs informel) |
| ADR-09 | IA | **LangChain + Anthropic + OpenAI** avec RAG sur `document_embeddings` (pgvector) | Réutilisation BDD existante, modèles best-in-class, abstraction LangChain |
| ADR-10 | Hébergement frontend | **Firebase Hosting** | CDN mondial, déploiement simple, gratuit pour le volume cible |
| ADR-11 | Sécurité données | **RLS PostgreSQL** sur 42+ tables | Sécurité défense en profondeur au niveau BDD, indépendante du frontend |
| ADR-12 | Charte graphique | Variables CSS Tailwind + thèmes light/dark/IFDD | Conformité charte IFDD, support accessibilité |
| ADR-13 | Module PACO isolé | Rôle dédié `paco` + tables/composables séparés | Permettre la suppression future propre du module éphémère |
| ADR-14 | WAF / caractères Unicode | **ASCII-safe dans les bodies JSON** depuis Edge Functions vers Laravel | Contournement du blocage ModSecurity (incident documenté 2026-03-05) |

---

## 8. Calendrier et responsabilités

> À adapter selon le planning IFDD réel — placeholders ci-dessous.

### 8.1 Jalons macro

| Phase | Période cible | Livrables clés |
|---|---|---|
| Cadrage & maquettes | Q4 2024 | Cahier des charges (`bank/cahier.md`), maquettes, charte graphique IFDD |
| Socle technique | Q1 2025 | Setup Vue/Supabase, auth, profil, navigation, i18n, thèmes |
| Module Pavillon | Q2 2025 | Soumission activités, validation, Zoom auto, YouTube embed |
| Module PACO (vagues) | Q1–Q2 2026 | Webinaires 1 & 2, statistiques démographiques, source d'acquisition |
| Négociation & formations | Q2–Q3 2026 | Documents négociateurs, cours, quiz, attestations |
| Réseautage & messagerie | Q3 2026 | Annuaire, RDV PeerJS, messagerie temps réel |
| IA & analytics | Q4 2026 | Chatbot RAG, sondages temps réel, exports statistiques |
| COP30 (cible métier) | Novembre 2026 | Plateforme opérationnelle en production |

### 8.2 Responsabilités (équipe)

| Rôle | Responsabilité |
|---|---|
| **Sponsor** | Direction IFDD |
| **Product Owner** | Équipe métier IFDD (programmation COP) |
| **Tech Lead / Architecte** | Conception, ADR, revues techniques |
| **Développeurs frontend** | Vue, composables, intégrations |
| **Développeur backend / DBA** | Edge Functions, RPC, RLS, migrations |
| **DevOps** | Firebase, Supabase, déploiements |
| **QA** | Tests Vitest + Playwright |
| **UX/UI** | Charte IFDD, accessibilité |

---

## 9. RACI Opérations

> Légende : **R** = Réalise · **A** = Approuve · **C** = Consulté · **I** = Informé

| Activité | PO IFDD | Tech Lead | Dev Front | Dev Back | DevOps | QA | Admin métier |
|---|---|---|---|---|---|---|---|
| Spécification fonctionnelle | A | C | I | I | I | C | R |
| Décision d'architecture (ADR) | I | R/A | C | C | C | I | I |
| Développement frontend | I | C | R | I | I | C | I |
| Développement Edge Functions | I | C | I | R | C | C | I |
| Migration BDD (`bank/shema_et_requettes/`) | I | A | I | R | C | I | I |
| Configuration RLS / sécurité | I | A | I | R | C | C | I |
| Déploiement Firebase | I | A | C | I | R | I | I |
| Déploiement Edge Functions | I | A | I | C | R | I | I |
| Gestion des secrets Supabase | I | A | I | C | R | I | I |
| Validation des activités candidates | A | I | I | I | I | I | R |
| Gestion des rôles utilisateurs | A | I | I | I | I | I | R |
| Envoi des newsletters | A | I | I | I | I | I | R |
| Provisionnement Zoom (auto) | I | C | I | R | C | I | A |
| Modération Q&A / messages | I | I | I | I | I | I | R |
| Sauvegarde/restauration BDD | I | A | I | C | R | I | I |
| Support incidents N1 | I | I | I | I | C | I | R |
| Support incidents N2/N3 | I | A | C | R | R | I | I |
| Veille sécurité / mises à jour | I | A | C | R | R | C | I |
| Recette / tests E2E | I | C | C | C | I | R | A |

---

## 10. Risques

| # | Risque | Catégorie | Probabilité | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | **Blocage WAF/ModSecurity** sur caractères Unicode (incident vécu 2026-03-05) entre Edge Functions et endpoint Laravel | Intégration | Moyenne | Élevé | ASCII-safe dans les bodies JSON ; tests d'intégration sur chaque déploiement Edge Function |
| R2 | **Dépendance Supabase** (SaaS) — risque de pricing, de disponibilité régionale (eu-west-2), de breaking changes | Vendor lock-in | Moyenne | Élevé | PostgreSQL standard → portabilité ; export régulier du schéma ; plan B : self-hosting Supabase |
| R3 | **Dépendance Zoom** (coûts, quotas API, OAuth) | Vendor | Faible | Élevé | Webhooks pour détecter pannes ; possibilité de bascule sur d'autres providers (Teams déjà utilisé pour PACO) |
| R4 | **SEO insuffisant** (SPA) si le pre-rendering échoue | Métier | Moyenne | Moyen | Script `verify:seo` post-build ; rebuild systématique sur création/modification d'activité ; surveillance Search Console |
| R5 | **Sécurité RLS** : oubli de politique sur une nouvelle table → fuite de données | Sécurité | Moyenne | Critique | Code-review obligatoire sur migrations ; checklist sécurité ; tests d'accès par rôle |
| R6 | **Secrets exposés** dans le code (clés Supabase, Zoom, Anthropic) | Sécurité | Faible | Critique | `.env.local` git-ignored ; rotation des secrets ; `git-filter-repo` disponible pour purger l'historique |
| R7 | **Latence Afrique francophone** (cible utilisateur principale) → Supabase en eu-west-2 + CDN Firebase global | Performance | Moyenne | Moyen | CDN Firebase mondial ; compression images ; lazy-loading agressif ; mesure RUM à mettre en place |
| R8 | **Charge sur COP** : pic d'utilisateurs simultanés pendant les sessions live | Performance | Élevée | Élevé | Test de charge à prévoir ; Supabase scale automatique ; YouTube absorbe la diffusion ; Edge Functions stateless |
| R9 | **Chatbot IA** : coûts LLM non maîtrisés / hallucinations sur documents officiels | Métier / Coût | Moyenne | Moyen | RAG strict sur `document_embeddings` ; quotas par session ; disclaimer ; modération réponses |
| R10 | **Conformité RGPD** (données démographiques PACO) | Légal | Faible | Élevé | Consentement explicite ; champ `consent_recording` ; possibilité de suppression (`delete-user`) |
| R11 | **Absence de CI/CD automatisée** → déploiements manuels = risque d'erreur humaine | Process | Élevée | Moyen | Mettre en place GitHub Actions (build:seo + verify:seo + firebase deploy) avec environnement de staging |
| R12 | **Pas de monitoring d'erreurs runtime** côté SPA | Observabilité | Élevée | Moyen | Intégrer Sentry ou équivalent ; alerting Firebase |
| R13 | **Dépendance à l'endpoint Laravel email** (IP unique GloboTech, pas de fallback) | Disponibilité | Moyenne | Élevé | SLA fournisseur ; envisager fallback SendGrid/Resend ; queue de retry dans Edge Functions |
| R14 | **Migration Legacy incomplète** (utilisateurs `laravel_user_id`) | Données | Moyenne | Moyen | Edge Function `migrate-user` + `migrate-photo` ; suivi via champ de tracking |

---

## 11. Coûts

> Estimations annuelles indicatives — à valider avec les devis fournisseurs.

| Poste | Plan / Hypothèse | Coût annuel estimé (USD) |
|---|---|---|
| **Supabase** | Plan Pro (~25 $/mois) — Pro suffisant pour < 8 GB DB, 100 GB bande passante | 300 |
| **Supabase add-ons** | Compute, stockage additionnel, Edge Functions invocations supplémentaires | 200 – 1 000 |
| **Firebase Hosting** | Spark (gratuit) ou Blaze à l'usage — volume cible faible/moyen | 0 – 100 |
| **Domaine** | `epavillonclimatique.francophonie.org` (déjà détenu IFDD) | inclus |
| **Serveur Laravel email** | Hébergement GloboTech (mutualisé avec autres services IFDD) | partagé |
| **Zoom API** | Compte Pro / Business + add-on API selon volume de réunions | 1 800 – 5 000 |
| **YouTube Live** | Gratuit | 0 |
| **Anthropic API (Claude)** | RAG chatbot — ~0,003 $/1k tokens input — usage modéré | 500 – 3 000 |
| **OpenAI API (embeddings)** | text-embedding-3-small ~0,02 $/1M tokens | 50 – 300 |
| **ElevenLabs (traduction)** | Selon volume — plan Creator/Pro | 100 – 1 200 |
| **Monitoring (Sentry recommandé)** | Plan Team | 300 |
| **Certificats SSL** | Inclus Firebase / Supabase | 0 |
| **Sous-total infrastructure** | | **~3 200 – 11 200 USD/an** |
| **Développement** (RH internes / prestataires) | Hors périmètre infrastructure | n/a |
| **Maintenance évolutive** | Estimer ~20% du coût de développement initial par an | n/a |

### Notes coûts
- Les coûts LLM dépendent fortement de l'adoption du chatbot — prévoir un quota par utilisateur/session pour maîtriser la facture.
- Le pic COP30 (novembre 2026) peut nécessiter un upgrade temporaire Supabase (Compute Add-on).
- Le module PACO étant éphémère, ses coûts spécifiques (Teams, emails) peuvent être imputés à un budget projet distinct.

---

## Annexes

### A. Stack technique consolidée

| Couche | Technologies |
|---|---|
| Frontend | Vue 3.5.13 · Vite 6.2.4 · Vue Router 4.5 · Pinia 3.0 · TailwindCSS 4.1 · vue-i18n 11.1 · @vueuse/head · Font Awesome 7 · vue-cal 4.8 · AmCharts 5.10 · Tiptap 3.0 · jsPDF · Compressorjs · PeerJS · Zod 4.1 |
| Backend serverless | Supabase Edge Functions (Deno) · 20 fonctions |
| Base de données | PostgreSQL (Supabase) · 42+ tables · 53 RPC · RLS · pgvector |
| Auth | Supabase Auth (JWT) |
| Stockage | Supabase Storage |
| Temps réel | Supabase Realtime (WebSocket) |
| IA | LangChain · Anthropic Claude · OpenAI embeddings |
| Email | Endpoint Laravel polyvalent (GloboTech) |
| Visio | Zoom API · YouTube Live · Teams (PACO) · PeerJS |
| Hébergement | Firebase Hosting + Firebase Analytics |
| SEO | Puppeteer 24.29 (pre-rendering au build) |
| Tests | Vitest · Vue Test Utils · Playwright |

### B. Références projet

- `CLAUDE.md` — directives projet
- `bank/cahier.md` — cahier des charges
- `bank/shema_et_requettes/database_complete.sql` — schéma BDD complet
- `DEPLOYMENT_SEO.md` — guide pre-rendering
- `specs/` — spécifications features (001-paco-webinar, 002-secure-teams-link, 003-paco-registration-stats, 004-paco-email-verify, 001-paco-multi-sessions, 006-paco-referral-source)

### C. Schémas à générer (app.diagrams.net)

1. **Carte des capacités métier** — 8 domaines (section 3.1)
2. **Diagramme de cas d'usage UML** — 9 acteurs × modules (section 3.2)
3. **BPMN — Workflow soumission d'activité** (section 3.3 A)
4. **BPMN — Workflow inscription PACO** (section 3.3 B)
5. **BPMN — Workflow diffusion événement hybride** (section 3.3 C)
6. **Diagramme en couches applicatives** (section 4.1)
7. **Diagramme de composants frontend** (section 4.2)
8. **Diagramme de déploiement infrastructure** (section 5.1)
9. **Diagramme de pipeline CI/CD** (section 5.3)
10. **MCD/MLD modèle de données** (section 6.1)
