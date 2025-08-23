# Fonctionnalit�s d'Administration - ePavillon

## 1. Tableau de Bord Principal

### 1.1 Statistiques G�n�rales
- **Utilisateurs**
  - Nombre total d'utilisateurs actifs/bloqu�s/suspendus
  - Nouveaux inscrits (jour/semaine/mois)
  - R�partition par pays et organisation
  - Statistiques par r�le (standard, n�gociateur, formateur, point focal)

- **�v�nements et Activit�s**
  - Nombre d'�v�nements par statut (upcoming, ongoing, completed, suspended)
  - Activit�s soumises par statut de validation (draft, submitted, under_review, approved, rejected)
  - Graphiques de soumissions temporels
  - Taux d'approbation des activit�s

- **Formations**
  - Nombre de formations actives
  - Participants inscrits et taux de compl�tion
  - Quiz et �valuations en cours

### 1.2 Alertes et Actions Rapides
- Activit�s en attente de validation
- Utilisateurs signal�s ou � v�rifier
- Organisations en doublon d�tect�es
- Messages syst�me urgents

## 2. Gestion des Utilisateurs

### 2.1 Liste et Recherche
- **Tableau des utilisateurs** avec filtres :
  - Par r�le (standard, negotiator, trainer, admin)
  - Par pays (table countries)
  - Par organisation
  - Par statut (actif, bloqu�, suspendu)
  - Par v�rification organisationnelle

### 2.2 Actions sur les Utilisateurs
- **Profil d�taill�** avec toutes les informations
- **Gestion des r�les** :
  - Attribuer/retirer des r�les
  - D�finir la dur�e de validit� (valid_until)
  - Historique des r�les attribu�s
  
- **Mod�ration** :
  - Bloquer un utilisateur (is_blocked, blocked_reason, blocked_by)
  - Suspendre temporairement (is_suspended, suspended_until, suspension_reason)
  - Lever les sanctions
  - Consulter l'historique des blocages

- **V�rification** :
  - Valider l'appartenance � une organisation (is_organization_verified)
  - D�signer comme point focal UNFCCC
  - Promouvoir en n�gociateur avec ann�e de d�signation

### 2.3 Gestion des N�gociateurs
- D�signation annuelle (designation_year)
- Suivi des participations aux COP
- Gestion des th�matiques de sp�cialisation
- Historique des consultations (negotiator_consultations)

## 3. Gestion des Organisations

### 3.1 Vue d'Ensemble
- Liste compl�te avec indicateurs :
  - Statut de v�rification (is_verified)
  - D�tection de doublons (is_duplicate, duplicate_of)
  - Nombre de validations par les utilisateurs
  - Type d'organisation

### 3.2 Actions sur les Organisations
- **V�rification manuelle** :
  - Marquer comme v�rifi�e (is_verified, verified_by, verified_at)
  - Fusionner les doublons
  - G�rer les alias (organization_aliases)
  
- **Mod�ration** :
  - Activer/d�sactiver (is_active)
  - Modifier les informations
  - Valider l'email institutionnel

## 4. Gestion des �v�nements

### 4.1 Cr�ation et Configuration
- **Formulaire complet** pour cr�er un �v�nement annuel :
  - Informations de base (titre, acronyme, description)
  - Configuration des dates et deadlines
  - Mode de participation (online, hybrid, in_person)
  - Localisation (country_id, city, address)
  - Upload des banni�res (formats 32:9, 16:9, 1:1)

### 4.2 Gestion du Cycle de Vie
- Changer le statut (upcoming � ongoing � completed)
- Ouvrir/fermer les soumissions (submission_status)
- Suspendre un �v�nement si n�cessaire

## 5. Validation des Activit�s

### 5.1 Interface de Validation
- **Liste des activit�s en attente** avec :
  - Aper�u rapide des informations cl�s
  - Organisation soumettrice
  - V�rification de conformit�

### 5.2 Actions de Validation
- **Processus de validation** :
  - Passer en revue (under_review)
  - Approuver avec g�n�ration Zoom automatique
  - Rejeter avec justification
  - Demander des modifications
  
- **Gestion post-validation** :
  - Modifier les dates finales (final_start_date, final_end_date)
  - G�rer les intervenants (activity_speakers)
  - Suivre les inscriptions (activity_registrations)

### 5.3 Historique et Tra�abilit�
- Consulter l'historique des modifications (activity_modifications)
- Voir qui a valid�/modifi� quoi et quand

## 6. Gestion des Formations

### 6.1 Administration des Formations
- Cr�er/modifier des formations
- G�rer les chapitres et contenus (training_chapters, lesson_contents)
- Configurer les �valuations et quiz

### 6.2 Suivi des Participants
- Liste des participants (training_participants)
- Progression d�taill�e par chapitre/le�on
- R�sultats des �valuations
- G�n�ration de certificats

### 6.3 Quiz en Temps R�el
- Cr�er et programmer des quiz (live_quizzes)
- G�rer les souscriptions (quiz_subscriptions)
- Voir les r�sultats en direct
- Exporter les statistiques

## 7. Espace N�gociation

### 7.1 Sessions de N�gociation
- Cr�er des sessions (negotiation_sessions)
- G�rer les inscriptions
- Int�gration Zoom automatique
- Upload de documents d'aide

### 7.2 R�unions Francophonie
- Planifier les r�unions (francophonie_meetings)
- G�rer les types (Preparatory_Workshop, Francophone_Consultation, etc.)
- Suivre les inscriptions par pays

## 8. Outils de Communication

### 8.1 Syst�me de Notifications
- Envoyer des notifications cibl�es :
  - Par type d'utilisateur
  - Par �v�nement/activit�
  - Notifications syst�me globales

### 8.2 Newsletters et Campagnes
- **Gestion des listes** (newsletter_lists) :
  - Cr�er des listes th�matiques
  - G�rer les abonnements
  
- **Campagnes** (newsletter_campaigns) :
  - Ciblage par type (all_users, country, organization, etc.)
  - Programmation d'envois
  - Templates personnalisables
  - Historique des envois (email_history)

### 8.3 Sondages
- Cr�er des sondages (polls) :
  - Questions vari�es (text, multiple_choice, yes_no, open_ended)
  - Mode anonyme optionnel
  - Dur�e limit�e (closes_at)
- Analyser les r�ponses (poll_responses)

## 9. Mod�ration du Contenu

### 9.1 Commentaires et T�moignages
- Mod�rer les commentaires (comments) :
  - Approuver/rejeter (is_approved)
  - Filtrer par contexte (innovation, training, event)
  
- Valider les t�moignages (user_testimonials, video_testimonials)

### 9.2 Questions d'Activit�s
- Mod�rer les questions en temps r�el (activity_questions) :
  - Rendre visible/invisible
  - D�sactiver avec justification
  - G�rer les r�ponses des intervenants

### 9.3 Innovations et Pratiques
- Valider les soumissions (innovations_practices)
- Publier/d�publier (is_published)
- Mod�rer les r�actions et notations

## 10. Gestion Multim�dia

### 10.1 Galerie M�dia
- G�rer les photos/vid�os (media_gallery) :
  - Par contexte (training, activity, event)
  - Validation des uploads
  - Gestion des m�tadonn�es

### 10.2 Documents
- G�rer les documents de n�gociation (negotiation_documents)
- Documents techniques (technical_documents)
- Documents d'activit�s (activity_documents)

## 11. Int�grations Externes

### 11.1 Zoom
- G�rer les r�unions (zoom_meetings) :
  - Cr�ation automatique � la validation
  - G�n�ration des liens personnalis�s
  - Suivi des participations

### 11.2 YouTube
- Configuration du streaming
- Gestion des liens de diffusion

## 12. Rapports et Analytics

### 12.1 Rapports Pr�d�finis
- Rapport d'activit� mensuel
- Statistiques de participation par pays
- Taux de compl�tion des formations
- Performance des innovations

### 12.2 Export de Donn�es
- Export CSV/Excel des donn�es
- G�n�ration de rapports PDF
- Tableaux de bord personnalisables

## 13. Configuration Syst�me

### 13.1 Templates de Messages
- G�rer les templates (message_templates) :
  - activity_approved
  - activity_rejected
  - connection_request
  - newsletter_subscription
  - activity_reminder

### 13.2 Param�tres Globaux
- Configuration des seuils de validation
- Gestion des pays (countries)
- Configuration des r�les et permissions

## 14. S�curit� et Audit

### 14.1 Journal d'Audit
- Tracer toutes les actions administratives
- Historique des connexions
- Modifications critiques

### 14.2 Gestion des Permissions
- D�finir les acc�s par r�le
- Politiques RLS (Row Level Security)
- Gestion des super-administrateurs

## 15. Actions Rapides par R�le

### 15.1 Pour les Administrateurs
- Valider les activit�s quotidiennement
- Mod�rer le contenu utilisateur
- G�rer les �v�nements courants
- R�pondre aux signalements

### 15.2 Pour les Super-Administrateurs
- Toutes les actions des administrateurs
- Gestion des autres administrateurs
- Configuration syst�me avanc�e
- Validation finale des d�cisions critiques
- Gestion des suspensions/blocages d�finitifs

## Navigation Sugg�r�e pour l'Interface Admin

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
   /events (Gestion �v�nements)
      /create
      /list
      /calendar
   /activities (Validation activit�s)
      /pending
      /approved
      /rejected
   /trainings (Gestion formations)
      /courses
      /participants
      /quizzes
   /negotiations (Espace n�gociation)
      /sessions
      /meetings
   /content (Mod�ration contenu)
      /comments
      /testimonials
      /innovations
   /communications
      /notifications
      /newsletters
      /polls
   /media (Gestion multim�dia)
   /reports (Rapports et analytics)
   /settings (Configuration)
   /audit (Journal et s�curit�)
```

## Technologies Recommand�es

- **Vue 3** avec Composition API pour l'interface
- **Pinia** pour la gestion d'�tat
- **TailwindCSS** pour le styling
- **Vue-Cal v4** pour le calendrier de gestion des activit�s
- **Chart.js** ou **ApexCharts** pour les graphiques
- **DataTables** ou **AG-Grid** pour les tableaux complexes
- **Supabase Realtime** pour les notifications en temps r�el