# Exemples d'utilisation - Chatbot IA Zoom

## Vue d'ensemble

Ce document présente des exemples concrets d'interactions avec le chatbot IA pour gérer les réunions Zoom. Ces exemples vous aideront à tester et valider la fonctionnalité 2.

## Prérequis

- Être connecté en tant qu'utilisateur avec le rôle `admin` ou `super_admin`
- Avoir une activité existante avec ou sans réunion Zoom
- Chatbot IA opérationnel avec les outils Zoom intégrés

## Exemple 1 : Créer une réunion Zoom

### Conversation

**Utilisateur** :
```
Crée une réunion Zoom pour l'activité "Workshop sur le climat"
```

**Chatbot (processus interne)** :
1. Identifie l'intention : création de réunion Zoom
2. Recherche l'activité "Workshop sur le climat" dans la base de données
3. Appelle l'outil `create_zoom_meeting` avec l'activity_id
4. Reçoit la réponse de l'edge function

**Chatbot (réponse à l'utilisateur)** :
```
✅ J'ai créé la réunion Zoom pour l'activité "Workshop sur le climat".

Voici les informations :
- Lien de participation : https://zoom.us/j/123456789
- ID de réunion : 123456789
- Mot de passe : abc123

Les participants peuvent rejoindre la réunion en utilisant ce lien.
```

### Flux technique

```
Utilisateur → Chatbot → LangChain Tool "create_zoom_meeting"
→ zoomApiClient.createMeeting(activity_id)
→ Edge Function "create-zoom-meeting"
→ API Zoom → Réponse
→ Formatage de la réponse
→ Réponse utilisateur
```

### Tokens utilisés (estimation)

**Sans optimisation** : ~1500 tokens
**Avec optimisation** : ~400 tokens
**Économie** : 73%

---

## Exemple 2 : Supprimer une réunion Zoom

### Conversation

**Utilisateur** :
```
Supprime la réunion Zoom de l'activité "Conférence biodiversité"
```

**Chatbot (avec confirmation)** :
```
⚠️ Êtes-vous sûr de vouloir supprimer la réunion Zoom de l'activité "Conférence biodiversité" ?
Cette action est irréversible.

Répondez "oui" pour confirmer ou "non" pour annuler.
```

**Utilisateur** :
```
oui
```

**Chatbot (processus interne)** :
1. Identifie l'intention : suppression de réunion Zoom
2. Demande confirmation (action critique)
3. Après confirmation, recherche l'activité
4. Appelle l'outil `delete_zoom_meeting` avec l'activity_id
5. Reçoit la réponse de l'edge function

**Chatbot (réponse)** :
```
✅ J'ai supprimé la réunion Zoom de l'activité "Conférence biodiversité".

La réunion a été supprimée de Zoom et les liens ne sont plus valides.
```

### Flux technique

```
Utilisateur → Chatbot (demande confirmation)
→ Utilisateur confirme
→ LangChain Tool "delete_zoom_meeting"
→ zoomApiClient.deleteMeeting(activity_id)
→ Edge Function "delete-zoom-meeting"
→ API Zoom → Suppression
→ Formatage de la réponse
→ Réponse utilisateur
```

---

## Exemple 3 : Modifier le titre d'une réunion Zoom

### Conversation

**Utilisateur** :
```
Change le titre de la réunion Zoom de l'activité "Atelier désertification"
en "Atelier désertification - Session 2"
```

**Chatbot (processus interne)** :
1. Identifie l'intention : modification de réunion Zoom
2. Extrait les paramètres :
   - activity : "Atelier désertification"
   - nouveau titre : "Atelier désertification - Session 2"
3. Recherche l'activité dans la base de données
4. Appelle l'outil `edit_zoom_meeting` avec :
   - activity_id
   - updates: { title: "Atelier désertification - Session 2" }
5. Reçoit la réponse de l'edge function

**Chatbot (réponse)** :
```
✅ J'ai mis à jour la réunion Zoom de l'activité "Atelier désertification".

Le nouveau titre est : "Atelier désertification - Session 2"

Le lien de participation reste le même : https://zoom.us/j/987654321
```

### Flux technique

```
Utilisateur → Chatbot → Extraction des paramètres
→ LangChain Tool "edit_zoom_meeting"
→ zoomApiClient.editMeeting(activity_id, { title: "..." })
→ Edge Function "edit-zoom-meeting"
→ API Zoom PATCH /meetings/{id}
→ Formatage de la réponse
→ Réponse utilisateur
```

---

## Exemple 4 : Modifier plusieurs paramètres

### Conversation

**Utilisateur** :
```
Pour la réunion Zoom de l'activité "Formation négociation",
change le titre en "Formation - Module 1" et la durée à 90 minutes
```

**Chatbot (processus interne)** :
1. Identifie l'intention : modification multiple
2. Extrait les paramètres :
   - activity : "Formation négociation"
   - nouveau titre : "Formation - Module 1"
   - nouvelle durée : 90 minutes
3. Appelle l'outil `edit_zoom_meeting` avec :
   - activity_id
   - updates: {
       title: "Formation - Module 1",
       duration: 90
     }

**Chatbot (réponse)** :
```
✅ J'ai mis à jour la réunion Zoom de l'activité "Formation négociation".

Modifications appliquées :
- Nouveau titre : "Formation - Module 1"
- Nouvelle durée : 90 minutes

Le lien de participation reste inchangé.
```

---

## Exemple 5 : Modifier la date et l'heure

### Conversation

**Utilisateur** :
```
Reporte la réunion Zoom de l'activité "Sommet climat" au 25 novembre 2025 à 14h00
```

**Chatbot (processus interne)** :
1. Identifie l'intention : modification de date
2. Parse la date : "25 novembre 2025 à 14h00"
3. Convertit en format ISO 8601 UTC
4. Appelle l'outil `edit_zoom_meeting` avec :
   - activity_id
   - updates: { start_time: "2025-11-25T14:00:00.000Z" }

**Chatbot (réponse)** :
```
✅ J'ai reporté la réunion Zoom de l'activité "Sommet climat".

Nouvelle date et heure : 25 novembre 2025 à 14:00 (heure locale)

Le lien de participation reste le même : https://zoom.us/j/111222333
```

---

## Exemple 6 : Gestion des erreurs - Activité sans réunion Zoom

### Conversation

**Utilisateur** :
```
Supprime la réunion Zoom de l'activité "Webinaire biodiversité"
```

**Chatbot (si aucune réunion Zoom n'existe)** :
```
❌ L'activité "Webinaire biodiversité" n'a pas de réunion Zoom associée.

Voulez-vous créer une réunion Zoom pour cette activité ?
```

**Utilisateur** :
```
oui
```

**Chatbot** :
```
✅ J'ai créé une nouvelle réunion Zoom pour l'activité "Webinaire biodiversité".

Lien de participation : https://zoom.us/j/444555666
```

---

## Exemple 7 : Gestion des permissions - Utilisateur non autorisé

### Conversation

**Utilisateur (rôle : negotiator)** :
```
Crée une réunion Zoom pour l'activité "Workshop"
```

**Chatbot** :
```
❌ Désolé, vous n'avez pas les permissions nécessaires pour gérer les réunions Zoom.

Cette fonctionnalité est réservée aux administrateurs.
Si vous pensez avoir besoin de cet accès, contactez un administrateur.
```

---

## Exemple 8 : Obtenir les informations d'une réunion

### Conversation

**Utilisateur** :
```
Quelles sont les informations de la réunion Zoom de l'activité "Atelier climat" ?
```

**Chatbot (processus interne)** :
1. Identifie l'intention : consultation d'informations
2. Recherche l'activité
3. Appelle l'outil `get_zoom_meeting_details` avec l'activity_id
4. Récupère les informations depuis l'API Zoom
5. Formate et retourne les informations

**Chatbot (réponse)** :
```
📋 Détails de la réunion "Atelier climat - Session de formation" :
- Date : 15/11/2025 à 10:00
- Durée : 60 minutes
- Inscrits : 12 personne(s)
- Lien : https://zoom.us/j/123456789
```

### Flux technique

```
Utilisateur → Chatbot → LangChain Tool "get_zoom_meeting_details"
→ zoomApiClient.getMeetingDetailsFromZoom(activity_id)
→ Edge Function "get-zoom-meeting-details"
→ API Zoom (GET /meetings/{id})
→ API Zoom (GET /meetings/{id}/registrants)
→ Formatage de la réponse
→ Réponse utilisateur
```

### Tokens utilisés (estimation)

**Requête avec include_registrants=false (par défaut)** :
- Input tokens : 350-400
- Output tokens : 60-80
- **Total** : ~450 tokens

**Avec include_registrants=true** :
- Input tokens : 350-400
- Output tokens : 150-200 (selon le nombre d'inscrits)
- **Total** : ~600 tokens

---

## Exemple 9 : Consulter la liste des participants inscrits

### Conversation

**Utilisateur** :
```
Combien de personnes se sont inscrites à la réunion Zoom de l'activité "Formation négociation" ?
```

**Chatbot (processus interne)** :
1. Identifie l'intention : consultation du nombre d'inscrits
2. Recherche l'activité
3. Appelle l'outil `get_zoom_meeting_details` avec include_registrants=false
4. Retourne uniquement le nombre d'inscrits

**Chatbot (réponse)** :
```
📊 12 personnes se sont inscrites à la réunion Zoom "Formation négociation".
```

**Utilisateur (demande de détails)** :
```
Qui s'est inscrit ?
```

**Chatbot (processus interne)** :
1. Identifie que l'utilisateur veut la liste complète
2. Appelle l'outil `get_zoom_meeting_details` avec include_registrants=true
3. Retourne la liste des inscrits

**Chatbot (réponse)** :
```
📋 Voici la liste des 12 personnes inscrites :

1. Jean Dupont (jean.dupont@example.com) - Approuvé
2. Marie Martin (marie.martin@example.com) - Approuvé
3. Pierre Durand (pierre.durand@example.com) - Approuvé
4. Sophie Bernard (sophie.bernard@example.com) - En attente
5. Luc Petit (luc.petit@example.com) - Approuvé
... (et 7 autres)

Note : 11 participants approuvés, 1 en attente d'approbation.
```

### Optimisation des tokens

**Stratégie** :
1. **Première question** : Utiliser `include_registrants=false` pour ne récupérer que le compte (économie de tokens)
2. **Si détails demandés** : Appeler à nouveau avec `include_registrants=true`

**Comparaison** :

Sans optimisation (toujours récupérer la liste complète) :
- Tokens : ~600 tokens par requête

Avec optimisation (récupérer seulement si nécessaire) :
- 1ère requête : ~450 tokens (compte uniquement)
- 2ème requête (si demandée) : ~600 tokens
- **Total si détails non demandés** : ~450 tokens
- **Économie** : 25% dans la majorité des cas

---

## Exemple 11 : Flux conversationnel naturel

### Conversation complète

**Utilisateur** :
```
Bonjour ! J'ai besoin de créer une réunion Zoom
```

**Chatbot** :
```
Bonjour ! Bien sûr, je peux vous aider à créer une réunion Zoom.

Pour quelle activité souhaitez-vous créer la réunion ?
```

**Utilisateur** :
```
Pour l'atelier de formation du 20 novembre
```

**Chatbot** :
```
J'ai trouvé l'activité "Atelier de formation - Négociation climatique"
prévue le 20 novembre 2025.

Voulez-vous créer une réunion Zoom pour cette activité ?
```

**Utilisateur** :
```
oui
```

**Chatbot** :
```
✅ J'ai créé la réunion Zoom pour "Atelier de formation - Négociation climatique".

Lien de participation : https://zoom.us/j/999888777
Mot de passe : pass123

La réunion est planifiée pour le 20 novembre 2025 à 09:00, durée : 120 minutes.
```

**Utilisateur** :
```
Parfait ! Mais change la durée à 90 minutes
```

**Chatbot** :
```
✅ J'ai modifié la durée de la réunion à 90 minutes.

La réunion se terminera maintenant à 10:30 au lieu de 11:00.
```

---

## Prompts système optimisés

### Prompt principal (concis)

```javascript
const systemPrompt = `
Assistant IA pour ePavillon Climatique. Rôle: admin Zoom.

Outils disponibles:
- create_zoom_meeting(activity_id): Créer réunion
- delete_zoom_meeting(activity_id): Supprimer réunion
- edit_zoom_meeting(activity_id, updates): Modifier réunion

Règles:
1. Confirmer actions critiques (suppression/modification)
2. Réponses concises en français
3. Indiquer les erreurs clairement
4. Limite 100 mots par réponse
`
```

**Tokens** : ~80 tokens

### Prompt alternatif (ultra-concis pour économie maximale)

```javascript
const systemPrompt = `
ePavillon IA - Admin Zoom

Outils:
- create_zoom_meeting(id)
- delete_zoom_meeting(id)
- edit_zoom_meeting(id, updates)

Règles: Confirmer suppressions. Concis. Français.
`
```

**Tokens** : ~40 tokens

---

## Tests de performance

### Scénario de test 1 : Création simple

**Requête** : "Crée une réunion Zoom pour l'activité ABC123"

**Metrics attendues** :
- Input tokens : 350-400 (avec caching)
- Output tokens : 60-80
- Temps de réponse : 2-4 secondes
- Coût : ~$0.0015

### Scénario de test 2 : Modification multiple

**Requête** : "Change le titre en 'Nouveau' et la durée à 90 min pour activité ABC123"

**Metrics attendues** :
- Input tokens : 400-450 (avec caching)
- Output tokens : 70-90
- Temps de réponse : 3-5 secondes
- Coût : ~$0.0018

### Scénario de test 3 : Conversation multi-tours (10 échanges)

**Metrics attendues** :
- Input tokens total : 3000-3500 (avec caching)
- Output tokens total : 600-800
- Coût total : ~$0.015
- **Vs. sans caching** : ~$0.050 (économie de 70%)

---

## Checklist de tests

### Tests fonctionnels

- [ ] Créer une réunion Zoom
- [ ] Supprimer une réunion Zoom
- [ ] Modifier le titre d'une réunion
- [ ] Modifier la durée d'une réunion
- [ ] Modifier la date d'une réunion
- [ ] Modifier plusieurs paramètres simultanément
- [ ] Obtenir les informations d'une réunion
- [ ] Obtenir le nombre d'inscrits
- [ ] Obtenir la liste détaillée des inscrits
- [ ] Gérer les réunions sans inscription activée
- [ ] Gérer les erreurs (activité inexistante)
- [ ] Gérer les erreurs (pas de réunion Zoom)
- [ ] Gérer les permissions (utilisateur non autorisé)

### Tests de performance

- [ ] Mesurer les tokens input/output
- [ ] Vérifier le caching (cache hits > 80%)
- [ ] Mesurer le temps de réponse
- [ ] Calculer le coût par requête
- [ ] Tester avec 100 requêtes consécutives

### Tests de robustesse

- [ ] Requêtes malformées
- [ ] Activity_id invalide
- [ ] Credentials Zoom manquants
- [ ] API Zoom indisponible
- [ ] Rate limiting Zoom
- [ ] Timeouts

---

## Monitoring en production

### Metrics à surveiller

```javascript
// Dashboard de monitoring
{
  "total_requests": 1247,
  "successful_requests": 1198,
  "failed_requests": 49,
  "success_rate": "96.1%",

  "average_input_tokens": 387,
  "average_output_tokens": 74,
  "cache_hit_rate": "87.3%",

  "total_cost_7_days": "$12.34",
  "average_cost_per_request": "$0.0016",

  "average_response_time": "3.2s",
  "p95_response_time": "5.8s",
  "p99_response_time": "8.1s"
}
```

### Alertes à configurer

- ❌ Taux de succès < 95%
- ❌ Cache hit rate < 70%
- ❌ Coût quotidien > $5
- ❌ Temps de réponse moyen > 5s

---

## Annexes

### Formats de dates supportés

Le chatbot doit comprendre ces formats :

- "20 novembre 2025 à 14h00"
- "2025-11-20 14:00"
- "demain à 10h"
- "dans 3 jours à 15h30"
- "lundi prochain à 9h"

### Synonymes et variations

Le chatbot doit reconnaître :

**Création** :
- "crée une réunion Zoom"
- "créer un meeting Zoom"
- "ajouter une réunion Zoom"
- "planifier une réunion Zoom"

**Suppression** :
- "supprime la réunion Zoom"
- "annule la réunion Zoom"
- "efface la réunion Zoom"
- "retire la réunion Zoom"

**Modification** :
- "modifie la réunion Zoom"
- "change le titre de la réunion"
- "mets à jour la réunion"
- "édite la réunion Zoom"

**Consultation** :
- "quelles sont les infos de la réunion"
- "donne-moi les détails de la réunion Zoom"
- "combien de personnes inscrites"
- "qui s'est inscrit"
- "liste des participants"
- "nombre d'inscrits"
- "voir les détails"

---

**Prochaine étape** : Implémenter le code selon le plan détaillé dans [README.md](./README.md)
