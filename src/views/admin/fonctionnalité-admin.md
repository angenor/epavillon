# Fonctionnalités d'Administration - ePavillon

## 1. Tableau de Bord Principal

### 1.1 Statistiques Générales
- **Utilisateurs**
  - Nombre total d'utilisateurs actifs/bloqués/suspendus
  - Nouveaux inscrits (jour/semaine/mois)
  - Répartition par pays et organisation
  - Statistiques par rôle (standard, négociateur, formateur, point focal)

- **Événements et Activités**
  - Nombre d'événements par statut (upcoming, ongoing, completed, suspended)
  - Activités soumises par statut de validation (draft, submitted, under_review, approved, rejected)
  - Graphiques de soumissions temporels
  - Taux d'approbation des activités

- **Formations**
  - Nombre de formations actives
  - Participants inscrits et taux de complétion
  - Quiz et évaluations en cours

### 1.2 Alertes et Actions Rapides
- Activités en attente de validation
- Utilisateurs signalés ou à vérifier
- Organisations en doublon détectées
- Messages système urgents

## 2. Gestion des Utilisateurs

### 2.1 Liste et Recherche
- **Tableau des utilisateurs** avec filtres :
  - Par rôle (standard, negotiator, trainer, admin)
  - Par pays (table countries)
  - Par organisation
  - Par statut (actif, bloqué, suspendu)
  - Par vérification organisationnelle

### 2.2 Actions sur les Utilisateurs
- **Profil détaillé** avec toutes les informations
- **Gestion des rôles** :
  - Attribuer/retirer des rôles
  - Définir la durée de validité (valid_until)
  - Historique des rôles attribués
  
- **Modération** :
  - Bloquer un utilisateur (is_blocked, blocked_reason, blocked_by)
  - Suspendre temporairement (is_suspended, suspended_until, suspension_reason)
  - Lever les sanctions
  - Consulter l'historique des blocages

- **Vérification** :
  - Valider l'appartenance à une organisation (is_organization_verified)
  - Désigner comme point focal UNFCCC
  - Promouvoir en négociateur avec année de désignation

### 2.3 Gestion des Négociateurs
- Désignation annuelle (designation_year)
- Suivi des participations aux COP
- Gestion des thématiques de spécialisation
- Historique des consultations (negotiator_consultations)

## 3. Gestion des Organisations

### 3.1 Vue d'Ensemble
- Liste complète avec indicateurs :
  - Statut de vérification (is_verified)
  - Détection de doublons (is_duplicate, duplicate_of)
  - Nombre de validations par les utilisateurs
  - Type d'organisation

### 3.2 Actions sur les Organisations
- **Vérification manuelle** :
  - Marquer comme vérifiée (is_verified, verified_by, verified_at)
  - Fusionner les doublons
  - Gérer les alias (organization_aliases)
  
- **Modération** :
  - Activer/désactiver (is_active)
  - Modifier les informations
  - Valider l'email institutionnel

## 4. Gestion des Événements

### 4.1 Création et Configuration
- **Formulaire complet** pour créer un événement annuel :
  - Informations de base (titre, acronyme, description)
  - Configuration des dates et deadlines
  - Mode de participation (online, hybrid, in_person)
  - Localisation (country_id, city, address)
  - Upload des bannières (formats 32:9, 16:9, 1:1)

### 4.2 Gestion du Cycle de Vie
- Changer le statut (upcoming ’ ongoing ’ completed)
- Ouvrir/fermer les soumissions (submission_status)
- Suspendre un événement si nécessaire

## 5. Validation des Activités

### 5.1 Interface de Validation
- **Liste des activités en attente** avec :
  - Aperçu rapide des informations clés
  - Organisation soumettrice
  - Vérification de conformité

### 5.2 Actions de Validation
- **Processus de validation** :
  - Passer en revue (under_review)
  - Approuver avec génération Zoom automatique
  - Rejeter avec justification
  - Demander des modifications
  
- **Gestion post-validation** :
  - Modifier les dates finales (final_start_date, final_end_date)
  - Gérer les intervenants (activity_speakers)
  - Suivre les inscriptions (activity_registrations)

### 5.3 Historique et Traçabilité
- Consulter l'historique des modifications (activity_modifications)
- Voir qui a validé/modifié quoi et quand

## 6. Gestion des Formations

### 6.1 Administration des Formations
- Créer/modifier des formations
- Gérer les chapitres et contenus (training_chapters, lesson_contents)
- Configurer les évaluations et quiz

### 6.2 Suivi des Participants
- Liste des participants (training_participants)
- Progression détaillée par chapitre/leçon
- Résultats des évaluations
- Génération de certificats

### 6.3 Quiz en Temps Réel
- Créer et programmer des quiz (live_quizzes)
- Gérer les souscriptions (quiz_subscriptions)
- Voir les résultats en direct
- Exporter les statistiques

## 7. Espace Négociation

### 7.1 Sessions de Négociation
- Créer des sessions (negotiation_sessions)
- Gérer les inscriptions
- Intégration Zoom automatique
- Upload de documents d'aide

### 7.2 Réunions Francophonie
- Planifier les réunions (francophonie_meetings)
- Gérer les types (Preparatory_Workshop, Francophone_Consultation, etc.)
- Suivre les inscriptions par pays

## 8. Outils de Communication

### 8.1 Système de Notifications
- Envoyer des notifications ciblées :
  - Par type d'utilisateur
  - Par événement/activité
  - Notifications système globales

### 8.2 Newsletters et Campagnes
- **Gestion des listes** (newsletter_lists) :
  - Créer des listes thématiques
  - Gérer les abonnements
  
- **Campagnes** (newsletter_campaigns) :
  - Ciblage par type (all_users, country, organization, etc.)
  - Programmation d'envois
  - Templates personnalisables
  - Historique des envois (email_history)

### 8.3 Sondages
- Créer des sondages (polls) :
  - Questions variées (text, multiple_choice, yes_no, open_ended)
  - Mode anonyme optionnel
  - Durée limitée (closes_at)
- Analyser les réponses (poll_responses)

## 9. Modération du Contenu

### 9.1 Commentaires et Témoignages
- Modérer les commentaires (comments) :
  - Approuver/rejeter (is_approved)
  - Filtrer par contexte (innovation, training, event)
  
- Valider les témoignages (user_testimonials, video_testimonials)

### 9.2 Questions d'Activités
- Modérer les questions en temps réel (activity_questions) :
  - Rendre visible/invisible
  - Désactiver avec justification
  - Gérer les réponses des intervenants

### 9.3 Innovations et Pratiques
- Valider les soumissions (innovations_practices)
- Publier/dépublier (is_published)
- Modérer les réactions et notations

## 10. Gestion Multimédia

### 10.1 Galerie Média
- Gérer les photos/vidéos (media_gallery) :
  - Par contexte (training, activity, event)
  - Validation des uploads
  - Gestion des métadonnées

### 10.2 Documents
- Gérer les documents de négociation (negotiation_documents)
- Documents techniques (technical_documents)
- Documents d'activités (activity_documents)

## 11. Intégrations Externes

### 11.1 Zoom
- Gérer les réunions (zoom_meetings) :
  - Création automatique à la validation
  - Génération des liens personnalisés
  - Suivi des participations

### 11.2 YouTube
- Configuration du streaming
- Gestion des liens de diffusion

## 12. Rapports et Analytics

### 12.1 Rapports Prédéfinis
- Rapport d'activité mensuel
- Statistiques de participation par pays
- Taux de complétion des formations
- Performance des innovations

### 12.2 Export de Données
- Export CSV/Excel des données
- Génération de rapports PDF
- Tableaux de bord personnalisables

## 13. Configuration Système

### 13.1 Templates de Messages
- Gérer les templates (message_templates) :
  - activity_approved
  - activity_rejected
  - connection_request
  - newsletter_subscription
  - activity_reminder

### 13.2 Paramètres Globaux
- Configuration des seuils de validation
- Gestion des pays (countries)
- Configuration des rôles et permissions

## 14. Sécurité et Audit

### 14.1 Journal d'Audit
- Tracer toutes les actions administratives
- Historique des connexions
- Modifications critiques

### 14.2 Gestion des Permissions
- Définir les accès par rôle
- Politiques RLS (Row Level Security)
- Gestion des super-administrateurs

## 15. Actions Rapides par Rôle

### 15.1 Pour les Administrateurs
- Valider les activités quotidiennement
- Modérer le contenu utilisateur
- Gérer les événements courants
- Répondre aux signalements

### 15.2 Pour les Super-Administrateurs
- Toutes les actions des administrateurs
- Gestion des autres administrateurs
- Configuration système avancée
- Validation finale des décisions critiques
- Gestion des suspensions/blocages définitifs

## Navigation Suggérée pour l'Interface Admin

```
/admin
   /dashboard (Tableau de bord)
   /users (Gestion utilisateurs)
      /list
      /roles
      /negotiators
   /organizations (Gestion organisations)
      /verify
      /duplicates
   /events (Gestion événements)
      /create
      /list
      /calendar
   /activities (Validation activités)
      /pending
      /approved
      /rejected
   /trainings (Gestion formations)
      /courses
      /participants
      /quizzes
   /negotiations (Espace négociation)
      /sessions
      /meetings
   /content (Modération contenu)
      /comments
      /testimonials
      /innovations
   /communications
      /notifications
      /newsletters
      /polls
   /media (Gestion multimédia)
   /reports (Rapports et analytics)
   /settings (Configuration)
   /audit (Journal et sécurité)
```

## Technologies Recommandées

- **Vue 3** avec Composition API pour l'interface
- **Pinia** pour la gestion d'état
- **TailwindCSS** pour le styling
- **Vue-Cal v4** pour le calendrier de gestion des activités
- **Chart.js** ou **ApexCharts** pour les graphiques
- **DataTables** ou **AG-Grid** pour les tableaux complexes
- **Supabase Realtime** pour les notifications en temps réel